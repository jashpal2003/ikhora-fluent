import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue, Worker, type Job } from 'bullmq'
import IORedis from 'ioredis'

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)
  private readonly connection: IORedis
  private readonly writingQueue: Queue
  private readonly speakingQueue: Queue
  private readonly cefrQueue: Queue
  private readonly reportQueue: Queue
  private readonly contentQueue: Queue

  constructor(private readonly config: ConfigService) {
    const redisUrl = config.get('REDIS_URL') || 'redis://localhost:6379'
    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true })

    const queueOptions = { connection: this.connection }

    this.writingQueue = new Queue('writing-scoring', queueOptions)
    this.speakingQueue = new Queue('speaking-scoring', queueOptions)
    this.cefrQueue = new Queue('cefr-analysis', queueOptions)
    this.reportQueue = new Queue('report-generation', queueOptions)
    this.contentQueue = new Queue('content-quality-check', queueOptions)
  }

  async enqueueWritingScore(data: {
    jobId: string
    submissionId: string
    taskType: string
    prompt: string
    answer: string
    wordCount: number
  }) {
    await this.writingQueue.add('score', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    })
    this.logger.log(`Enqueued writing score job for submission ${data.submissionId}`)
  }

  async enqueueSpeakingScore(data: {
    jobId: string
    submissionId: string
    blobPath: string
    part: number
    prompt: string
  }) {
    await this.speakingQueue.add('score', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
    })
  }

  async enqueueCEFRCheck(data: { jobId: string; text: string; taskType: string }) {
    await this.cefrQueue.add('check', data, { attempts: 2 })
  }

  async enqueueContentQualityCheck(data: { jobId: string; contentItemId: string }) {
    await this.contentQueue.add('quality-check', data, { attempts: 2 })
  }

  async enqueueReportGeneration(data: { reportType: string; entityId: string; organizationId?: string }) {
    await this.reportQueue.add('generate', data, { attempts: 2 })
  }

  async getQueueStats() {
    const [writingCounts, speakingCounts, cefrCounts] = await Promise.all([
      this.writingQueue.getJobCounts('active', 'waiting', 'completed', 'failed'),
      this.speakingQueue.getJobCounts('active', 'waiting', 'completed', 'failed'),
      this.cefrQueue.getJobCounts('active', 'waiting', 'completed', 'failed'),
    ])

    return {
      writing: writingCounts,
      speaking: speakingCounts,
      cefr: cefrCounts,
    }
  }

  getWritingQueue() { return this.writingQueue }
  getSpeakingQueue() { return this.speakingQueue }
  getCefrQueue() { return this.cefrQueue }
  getContentQueue() { return this.contentQueue }
}
