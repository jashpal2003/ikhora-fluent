import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { QueueService } from '../queue/queue.service'
import { sanitizeUserInput, countWords } from '@ikhora/shared'

@Injectable()
export class WritingService {
  private readonly logger = new Logger(WritingService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly queue: QueueService,
  ) {}

  async submitWriting(params: {
    userId: string
    organizationId?: string
    assignmentId?: string
    contentItemId?: string
    taskType: 'ACADEMIC_TASK_1' | 'ACADEMIC_TASK_2' | 'GENERAL_TASK_1' | 'GENERAL_TASK_2'
    prompt: string
    answer: string
  }) {
    // Sanitize input against prompt injection
    const sanitizedAnswer = sanitizeUserInput(params.answer)
    const wordCount = countWords(sanitizedAnswer)

    // Save submission
    const submission = await this.prisma.submission.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        assignmentId: params.assignmentId,
        contentItemId: params.contentItemId,
        type: 'WRITING',
        status: 'SUBMITTED',
        inputText: sanitizedAnswer,
        wordCount,
      },
    })

    // Create AI job record
    const job = await this.prisma.aIJob.create({
      data: {
        submissionId: submission.id,
        organizationId: params.organizationId,
        jobType: 'WRITING_SCORE',
        status: 'PENDING',
        inputData: {
          taskType: params.taskType,
          prompt: params.prompt,
          wordCount,
        },
      },
    })

    // Enqueue background job
    await this.queue.enqueueWritingScore({
      jobId: job.id,
      submissionId: submission.id,
      taskType: params.taskType,
      prompt: params.prompt,
      answer: sanitizedAnswer,
      wordCount,
    })

    this.logger.log(`Writing submission ${submission.id} queued for scoring`)
    return { submissionId: submission.id, jobId: job.id, status: 'PROCESSING' }
  }

  async getSubmission(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, userId },
      include: {
        scores: { orderBy: { createdAt: 'desc' }, take: 1 },
        feedback: { orderBy: { createdAt: 'desc' }, take: 1 },
        aiJobs: { select: { status: true, errorMessage: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    if (!submission) throw new NotFoundException('Submission not found')
    return submission
  }

  async getUserWritingHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [submissions, total] = await this.prisma.$transaction([
      this.prisma.submission.findMany({
        where: { userId, type: 'WRITING' },
        include: {
          scores: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.submission.count({ where: { userId, type: 'WRITING' } }),
    ])

    return { data: submissions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async processWritingScore(params: {
    jobId: string
    submissionId: string
    taskType: 'ACADEMIC_TASK_1' | 'ACADEMIC_TASK_2' | 'GENERAL_TASK_1' | 'GENERAL_TASK_2'
    prompt: string
    answer: string
    wordCount: number
  }) {
    const { jobId, submissionId } = params

    try {
      // Update job status
      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', startedAt: new Date(), attemptCount: { increment: 1 } },
      })
      await this.prisma.submission.update({ where: { id: submissionId }, data: { status: 'PROCESSING' } })

      // Call AI scoring
      const feedback = await this.ai.scoreWriting(params)

      // Calculate final overall band (round to 0.5)
      const criteriaValues = Object.values(feedback.criteria_scores)
      const avg = criteriaValues.reduce((a, b) => a + b, 0) / criteriaValues.length
      const overallBand = Math.round(avg * 2) / 2

      // Save score
      await this.prisma.score.create({
        data: {
          submissionId,
          aiOverallScore: overallBand,
          finalScore: overallBand,
          criteriaScores: feedback.criteria_scores as any,
          confidence: feedback.confidence,
          scoredByModel: process.env.AI_PRIMARY_DEPLOYMENT || 'gpt-5-mini',
        },
      })

      // Save feedback
      await this.prisma.feedback.create({
        data: {
          submissionId,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          sentenceFeedback: feedback.sentence_feedback as any,
          improvedVersion: feedback.improved_version,
          modelAnswer: feedback.model_answer,
          nextPractice: feedback.next_practice as any,
        },
      })

      // Update submission status
      await this.prisma.submission.update({ where: { id: submissionId }, data: { status: 'SCORED' } })

      // Update AI job
      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          outputData: feedback as any,
          completedAt: new Date(),
          modelDeployment: process.env.AI_PRIMARY_DEPLOYMENT || 'gpt-5-mini',
        },
      })

      // Update skill profile
      await this.updateSkillProfile(submissionId, overallBand)

      this.logger.log(`Writing submission ${submissionId} scored: Band ${overallBand}`)
    } catch (error) {
      this.logger.error(`Writing scoring failed for ${submissionId}`, error)
      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorMessage: String(error) },
      })
      await this.prisma.submission.update({ where: { id: submissionId }, data: { status: 'SUBMITTED' } })
      throw error
    }
  }

  private async updateSkillProfile(submissionId: string, band: number) {
    try {
      const submission = await this.prisma.submission.findUnique({ where: { id: submissionId } })
      if (!submission) return

      await this.prisma.studentSkillProfile.upsert({
        where: { userId: submission.userId },
        update: { writingBand: band, lastActivityAt: new Date(), totalSubmissions: { increment: 1 } },
        create: { userId: submission.userId, writingBand: band },
      })
    } catch (error) {
      this.logger.error('Failed to update skill profile', error)
    }
  }

  async teacherOverride(params: {
    submissionId: string
    teacherId: string
    teacherScore: number
    criteriaAdjustments?: Record<string, { ai: number; teacher: number }>
    overrideReason: string
    comments?: string
  }) {
    const { submissionId, teacherId, teacherScore, criteriaAdjustments, overrideReason, comments } = params

    // Update latest score record
    const latestScore = await this.prisma.score.findFirst({
      where: { submissionId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestScore) throw new NotFoundException('No score found for this submission')

    const updatedScore = await this.prisma.score.update({
      where: { id: latestScore.id },
      data: {
        teacherOverallScore: teacherScore,
        finalScore: teacherScore,
        teacherId,
        overrideReason,
        criteriaAdjustments: criteriaAdjustments as any,
        isTeacherOverride: true,
      },
    })

    if (comments) {
      await this.prisma.feedback.updateMany({
        where: { submissionId },
        data: { teacherComments: comments },
      })
    }

    await this.prisma.submission.update({ where: { id: submissionId }, data: { status: 'TEACHER_REVIEWED' } })
    return updatedScore
  }
}
