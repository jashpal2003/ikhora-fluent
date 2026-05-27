'use server'

/**
 * Student Service
 * Provides student profile, submission, and report data.
 * Connects to Supabase via Prisma.
 */

import { prisma } from '@ikhora/database'
import type { StudentProfile, Submission, StudyPlan, SubmissionStatus, Skill } from '../types'
import { DEMO_STUDENT_PROFILE, DEMO_SUBMISSIONS, DEMO_STUDY_PLAN } from '../data/studentData'

// ── STUDENT PROFILE ───────────────────────────────────────


export async function getStudentProfile(studentId?: string): Promise<StudentProfile> {
  // TODO: return fetch(`/api/students/${studentId}/profile`)
  await new Promise((r) => setTimeout(r, 200))
  return DEMO_STUDENT_PROFILE
}

// ── SUBMISSIONS ───────────────────────────────────────────

export async function getStudentSubmissions(
  studentId?: string,
  filters?: { skill?: Skill; status?: SubmissionStatus }
): Promise<Submission[]> {
  // TODO: return fetch(`/api/students/${studentId}/submissions?skill=${filters?.skill}&status=${filters?.status}`)
  await new Promise((r) => setTimeout(r, 200))
  let submissions = DEMO_SUBMISSIONS
  if (filters?.skill) submissions = submissions.filter((s) => s.skill === filters.skill)
  if (filters?.status) submissions = submissions.filter((s) => s.status === filters.status)
  return submissions
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  // TODO: return fetch(`/api/submissions/${id}`)
  await new Promise((r) => setTimeout(r, 100))
  return DEMO_SUBMISSIONS.find((s) => s.id === id)
}

// ── STUDY PLAN ────────────────────────────────────────────

export async function getStudentStudyPlan(studentId?: string): Promise<StudyPlan> {
  // TODO: return fetch(`/api/students/${studentId}/study-plan`)
  await new Promise((r) => setTimeout(r, 200))
  return DEMO_STUDY_PLAN
}

// ── DASHBOARD SUMMARY ─────────────────────────────────────

export async function getDashboardSummary(studentId?: string) {
  try {
    const dbSubmissions = await prisma.submission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { scores: true }
    })

    if (dbSubmissions && dbSubmissions.length > 0) {
      // Map Prisma data to frontend expected shape
      const recentSubmissions = dbSubmissions.map(s => ({
        id: s.id,
        skill: s.type.toLowerCase() as Skill,
        type: s.type,
        status: s.status === 'SCORED' ? 'scored' : 'submitted',
        submittedAt: s.createdAt.toISOString(),
        score: s.scores[0]?.finalScore ?? s.scores[0]?.aiOverallScore ?? 0,
        band: s.scores[0]?.finalScore ?? s.scores[0]?.aiOverallScore ?? 0,
        topic: 'Practice Test'
      })) as Submission[]

      const profile = DEMO_STUDENT_PROFILE
      return {
        estimatedBand: profile.estimatedBand,
        cefrLevel: profile.cefrLevel,
        streakDays: profile.streakDays,
        totalPracticeMinutes: profile.totalPracticeMinutes,
        skillBands: profile.skillBands,
        weakAreas: profile.weakAreas.slice(0, 3),
        recentSubmissions,
      }
    }
  } catch (error) {
    console.warn('[studentService] Database connection failed or no data. Falling back to mock data.', error)
  }

  // Fallback to mock data
  await new Promise((r) => setTimeout(r, 200))
  const profile = DEMO_STUDENT_PROFILE
  const submissions = DEMO_SUBMISSIONS
  const recentSubmissions = submissions.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  ).slice(0, 5)

  return {
    estimatedBand: profile.estimatedBand,
    cefrLevel: profile.cefrLevel,
    streakDays: profile.streakDays,
    totalPracticeMinutes: profile.totalPracticeMinutes,
    skillBands: profile.skillBands,
    weakAreas: profile.weakAreas.slice(0, 3),
    recentSubmissions,
  }
}

export async function savePracticeScore(data: {
  userId: string;
  skill: string;
  score: number;
  band: number;
  durationSeconds?: number;
}) {
  try {
    // Determine SubmissionType
    const typeMap: Record<string, any> = {
      'listening': 'LISTENING',
      'reading': 'READING',
      'speaking': 'SPEAKING',
      'writing': 'WRITING'
    }

    const submission = await prisma.submission.create({
      data: {
        userId: data.userId || '00000000-0000-0000-0000-000000000000', // Mock UUID if none
        type: typeMap[data.skill] || 'LISTENING',
        status: 'SCORED',
        audioDurationSeconds: data.durationSeconds,
        scores: {
          create: {
            aiOverallScore: data.band,
            finalScore: data.score
          }
        }
      }
    })
    return { success: true, id: submission.id }
  } catch (error) {
    console.warn('[studentService] Could not save score to DB:', error)
    return { success: false, error: 'Database not connected' }
  }
}
