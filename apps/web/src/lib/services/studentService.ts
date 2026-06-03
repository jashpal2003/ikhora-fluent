'use server'

/**
 * Student Service
 * Provides student profile, submission, and report data.
 * Connects to Supabase with RLS enforcement.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { StudentProfile, Submission, StudyPlan, SubmissionStatus, Skill, SkillBand, WeakArea, ScoreReport } from '../types'
import { DEMO_STUDENT_PROFILE, DEMO_SUBMISSIONS, DEMO_STUDY_PLAN } from '../data/studentData'

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ── STUDENT PROFILE ───────────────────────────────────────

export async function getStudentProfile(studentId?: string): Promise<StudentProfile> {
  if (!isSupabaseConfigured()) return DEMO_STUDENT_PROFILE

  try {
    const supabase = await createServerSupabaseClient()
    const uid = studentId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) return DEMO_STUDENT_PROFILE

    const { data: user } = await supabase
      .from('users').select('*').eq('id', uid).single()
    if (!user) return DEMO_STUDENT_PROFILE

    const u = user as Record<string, any>
    const { data: skill } = await supabase
      .from('student_skill_profiles').select('*').eq('user_id', uid).single()
    const s = skill as Record<string, any> | null

    const skillBands: SkillBand[] = [
      { skill: 'writing' as Skill, band: s?.writing_band ?? 0, trend: [s?.writing_band ?? 0], lastUpdated: s?.updated_at ?? '' },
      { skill: 'speaking' as Skill, band: s?.speaking_band ?? 0, trend: [s?.speaking_band ?? 0], lastUpdated: s?.updated_at ?? '' },
      { skill: 'reading' as Skill, band: s?.reading_band ?? 0, trend: [s?.reading_band ?? 0], lastUpdated: s?.updated_at ?? '' },
      { skill: 'listening' as Skill, band: s?.listening_band ?? 0, trend: [s?.listening_band ?? 0], lastUpdated: s?.updated_at ?? '' },
    ].filter(sb => sb.band > 0)

    const weakAreas: WeakArea[] = (s?.weak_skills ?? []).map((w: string, i: number) => ({
      id: `weak-${i}`, category: w, skill: 'writing' as Skill,
      frequency: 1, severity: i === 0 ? 'high' as const : 'medium' as const,
      recommendation: `Practice more ${w.toLowerCase()} exercises`,
    }))

    return {
      userId: uid,
      targetBand: u.target_band ?? 7.0,
      estimatedBand: s?.estimated_band ?? 0,
      cefrLevel: (s?.estimated_cefr ?? 'B1') as StudentProfile['cefrLevel'],
      targetExam: (u.target_exam ?? 'IELTS') as StudentProfile['targetExam'],
      streakDays: s?.streak_days ?? 0,
      totalPracticeMinutes: Math.round((s?.total_practice_hours ?? 0) * 60),
      joinedAt: u.created_at,
      weakAreas,
      skillBands,
    }
  } catch (err) {
    console.warn('[studentService] getStudentProfile failed, using demo data:', err)
    return DEMO_STUDENT_PROFILE
  }
}

// ── SUBMISSIONS ───────────────────────────────────────────

export async function getStudentSubmissions(
  studentId?: string,
  filters?: { skill?: Skill; status?: SubmissionStatus }
): Promise<Submission[]> {
  if (!isSupabaseConfigured()) return applyDemoFilters(filters)

  try {
    const supabase = await createServerSupabaseClient()
    const uid = studentId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) return applyDemoFilters(filters)

    let query = supabase
      .from('submissions')
      .select(`*, scores(*), feedback(*), content_items(title)`)
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filters?.skill) {
      query = query.eq('type', filters.skill.toUpperCase())
    }
    if (filters?.status) {
      query = query.eq('status', mapFrontendStatus(filters.status))
    }

    const { data } = await query
    if (!data?.length) return applyDemoFilters(filters)

    return data.map(mapSubmissionRow)
  } catch (err) {
    console.warn('[studentService] getStudentSubmissions failed:', err)
    return applyDemoFilters(filters)
  }
}

function applyDemoFilters(filters?: { skill?: Skill; status?: SubmissionStatus }) {
  let subs = [...DEMO_SUBMISSIONS]
  if (filters?.skill) subs = subs.filter(s => s.skill === filters.skill)
  if (filters?.status) subs = subs.filter(s => s.status === filters.status)
  return subs
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  if (!isSupabaseConfigured()) return DEMO_SUBMISSIONS.find(s => s.id === id)

  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('submissions')
      .select(`*, scores(*), feedback(*), content_items(title)`)
      .eq('id', id)
      .single()
    if (!data) return DEMO_SUBMISSIONS.find(s => s.id === id)
    return mapSubmissionRow(data)
  } catch {
    return DEMO_SUBMISSIONS.find(s => s.id === id)
  }
}

// ── STUDY PLAN ────────────────────────────────────────────

export async function getStudentStudyPlan(studentId?: string): Promise<StudyPlan> {
  // Study plans are AI-generated — still uses demo data for now
  await new Promise(r => setTimeout(r, 100))
  return DEMO_STUDY_PLAN
}

// ── DASHBOARD SUMMARY ─────────────────────────────────────

export async function getDashboardSummary(studentId?: string) {
  try {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    const supabase = await createServerSupabaseClient()
    const uid = studentId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) throw new Error('No user')

    const [profileResult, subsResult, skillResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', uid).single(),
      supabase.from('submissions')
        .select(`*, scores(*), content_items(title)`)
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('student_skill_profiles').select('*').eq('user_id', uid).single(),
    ])

    const u = profileResult.data as Record<string, any> | null
    const s = skillResult.data as Record<string, any> | null

    if (!u) throw new Error('User not found')

    const skillBands: SkillBand[] = [
      { skill: 'writing' as Skill, band: s?.writing_band ?? 0, trend: [s?.writing_band ?? 0], lastUpdated: s?.updated_at ?? '' },
      { skill: 'speaking' as Skill, band: s?.speaking_band ?? 0, trend: [s?.speaking_band ?? 0], lastUpdated: s?.updated_at ?? '' },
      { skill: 'reading' as Skill, band: s?.reading_band ?? 0, trend: [s?.reading_band ?? 0], lastUpdated: s?.updated_at ?? '' },
      { skill: 'listening' as Skill, band: s?.listening_band ?? 0, trend: [s?.listening_band ?? 0], lastUpdated: s?.updated_at ?? '' },
    ].filter(sb => sb.band > 0)

    const weakAreas: WeakArea[] = (s?.weak_skills ?? []).map((w: string, i: number) => ({
      id: `weak-${i}`, category: w, skill: 'writing' as Skill,
      frequency: 1, severity: i === 0 ? 'high' as const : 'medium' as const,
      recommendation: `Practice more ${w.toLowerCase()} exercises`,
    }))

    const recentSubmissions = (subsResult.data ?? []).map(mapSubmissionRow)

    return {
      estimatedBand: s?.estimated_band ?? 0,
      cefrLevel: (s?.estimated_cefr ?? 'B1') as string,
      streakDays: s?.streak_days ?? 0,
      totalPracticeMinutes: Math.round((s?.total_practice_hours ?? 0) * 60),
      skillBands,
      weakAreas: weakAreas.slice(0, 3),
      recentSubmissions,
      userName: u.name ?? 'Student',
    }
  } catch (error) {
    console.warn('[studentService] Dashboard DB query failed, using demo data:', error)
    const profile = DEMO_STUDENT_PROFILE
    const submissions = DEMO_SUBMISSIONS
    const recentSubmissions = [...submissions]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5)

    return {
      estimatedBand: profile.estimatedBand,
      cefrLevel: profile.cefrLevel,
      streakDays: profile.streakDays,
      totalPracticeMinutes: profile.totalPracticeMinutes,
      skillBands: profile.skillBands,
      weakAreas: profile.weakAreas.slice(0, 3),
      recentSubmissions,
      userName: 'Alex',
    }
  }
}

export async function savePracticeScore(data: {
  userId: string; skill: string; score: number; band: number; durationSeconds?: number;
}) {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' }

  try {
    const supabase = await createServerSupabaseClient()
    const typeMap: Record<string, string> = {
      listening: 'LISTENING', reading: 'READING', speaking: 'SPEAKING', writing: 'WRITING',
    }

    const { data: sub, error: subErr } = await (supabase.from('submissions') as any).insert({
      user_id: data.userId,
      type: typeMap[data.skill] || 'LISTENING',
      status: 'SCORED',
      audio_duration_seconds: data.durationSeconds ?? null,
    }).select('id').single()

    if (subErr || !sub) return { success: false, error: subErr?.message ?? 'Insert failed' }

    await (supabase.from('scores') as any).insert({
      submission_id: sub.id,
      ai_overall_score: data.band,
      final_score: data.score,
    })

    return { success: true, id: sub.id }
  } catch (error) {
    console.warn('[studentService] savePracticeScore failed:', error)
    return { success: false, error: 'Database error' }
  }
}

// ── MAPPING HELPERS ────────────────────────────────────────

function mapFrontendStatus(status: SubmissionStatus): string {
  const map: Record<string, string> = {
    scored: 'SCORED', teacher_reviewed: 'TEACHER_REVIEWED',
    processing: 'PROCESSING', submitted: 'SUBMITTED',
    draft: 'SUBMITTED', queued: 'PROCESSING', failed: 'SUBMITTED',
  }
  return map[status] ?? 'SUBMITTED'
}

function mapSubmissionRow(row: any): Submission {
  const r = row as Record<string, any>
  const scoreRow = Array.isArray(r.scores) ? r.scores[0] : r.scores
  const feedbackRow = Array.isArray(r.feedback) ? r.feedback[0] : r.feedback
  const contentTitle = r.content_items?.title ?? 'Practice Exercise'

  const criteria = scoreRow?.criteria_scores
    ? Object.entries(scoreRow.criteria_scores as Record<string, number>).map(([k, v]) => ({
        criterionId: k, criterionLabel: k, aiScore: v,
      }))
    : []

  return {
    id: r.id,
    studentId: r.user_id,
    skill: (r.type ?? 'WRITING').toLowerCase() as Skill,
    contentId: r.content_item_id ?? '',
    contentTitle,
    status: mapDbStatus(r.status),
    answerText: r.input_text ?? undefined,
    wordCount: r.word_count ?? undefined,
    audioUrl: undefined,
    durationSeconds: r.audio_duration_seconds ?? undefined,
    submittedAt: r.created_at,
    scoredAt: scoreRow?.created_at ?? undefined,
    scoreReport: scoreRow ? {
      submissionId: r.id,
      skill: (r.type ?? 'WRITING').toLowerCase() as Skill,
      overallBand: scoreRow.ai_overall_score ?? 0,
      finalBand: scoreRow.final_score ?? scoreRow.ai_overall_score ?? 0,
      teacherReviewed: scoreRow.is_teacher_override ?? false,
      confidence: scoreRow.confidence ?? 0.8,
      criteria,
      strengths: feedbackRow?.strengths ?? [],
      weaknesses: feedbackRow?.weaknesses ?? [],
      improvedVersion: feedbackRow?.improved_version ?? undefined,
      modelAnswer: feedbackRow?.model_answer ?? undefined,
      nextPractice: [],
      generatedAt: scoreRow.created_at ?? r.created_at,
    } as ScoreReport : undefined,
  } as Submission
}

function mapDbStatus(status: string): SubmissionStatus {
  const map: Record<string, SubmissionStatus> = {
    SUBMITTED: 'submitted', PROCESSING: 'processing', SCORED: 'scored',
    REVIEW_REQUIRED: 'processing', TEACHER_REVIEWED: 'teacher_reviewed', FINAL: 'scored',
  }
  return map[status] ?? 'submitted'
}
