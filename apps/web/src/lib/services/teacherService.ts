'use server'

/**
 * Teacher Service
 * Provides teacher-facing data for classes, assignments, and submission reviews.
 * Connects to Supabase with RLS enforcement.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Class, Assignment, Submission, Skill, ScoreReport } from '../types'
import { SEED_CLASSES, SEED_ASSIGNMENTS } from '../data/organizationData'
import { DEMO_SUBMISSIONS } from '../data/studentData'

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ── CLASSES ───────────────────────────────────────────────

export async function getTeacherClasses(teacherId?: string): Promise<Class[]> {
  if (!isSupabaseConfigured()) return SEED_CLASSES

  try {
    const supabase = await createServerSupabaseClient()
    const uid = teacherId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_CLASSES

    // Get org IDs where the teacher is a member
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['TEACHER', 'ORG_ADMIN'])
      .eq('status', 'ACTIVE')

    const orgIds = (memberships ?? []).map((m: any) => m.organization_id)
    if (!orgIds.length) return SEED_CLASSES

    // Get classes in those orgs
    const { data: classes } = await supabase
      .from('classes')
      .select(`*, class_members(user_id, role)`)
      .in('organization_id', orgIds)
      .eq('is_archived', false)

    if (!classes?.length) return SEED_CLASSES

    return classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      organizationId: c.organization_id,
      teacherId: uid,
      studentCount: (c.class_members ?? []).filter((m: any) => m.role === 'STUDENT').length,
      avgBand: undefined,
      targetBand: undefined,
      createdAt: c.created_at,
    }))
  } catch (err) {
    console.warn('[teacherService] getTeacherClasses failed:', err)
    return SEED_CLASSES
  }
}

// ── ASSIGNMENTS ───────────────────────────────────────────

export async function getTeacherAssignments(teacherId?: string): Promise<Assignment[]> {
  if (!isSupabaseConfigured()) return SEED_ASSIGNMENTS

  try {
    const supabase = await createServerSupabaseClient()
    const uid = teacherId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_ASSIGNMENTS

    const { data } = await supabase
      .from('assignments')
      .select(`*, classes(name), assignment_items(content_item_id)`)
      .eq('teacher_id', uid)
      .order('created_at', { ascending: false })

    if (!data?.length) return SEED_ASSIGNMENTS

    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      classId: a.class_id ?? '',
      className: a.classes?.name ?? 'Unassigned',
      teacherId: uid,
      skill: 'writing' as Skill,
      contentId: a.assignment_items?.[0]?.content_item_id ?? '',
      contentTitle: a.title,
      dueDate: a.due_at ?? a.created_at,
      totalStudents: 0,
      submittedCount: 0,
      status: a.is_published ? 'active' as const : 'draft' as const,
      createdAt: a.created_at,
    }))
  } catch (err) {
    console.warn('[teacherService] getTeacherAssignments failed:', err)
    return SEED_ASSIGNMENTS
  }
}

// ── PENDING REVIEWS ───────────────────────────────────────

export async function getPendingReviews(teacherId?: string): Promise<Submission[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_SUBMISSIONS.filter((s) => s.status === 'scored' && s.scoreReport)
  }

  try {
    const supabase = await createServerSupabaseClient()
    const uid = teacherId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) return []

    // Get org IDs where teacher has review access
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['TEACHER', 'ORG_ADMIN'])
      .eq('status', 'ACTIVE')

    const orgIds = (memberships ?? []).map((m: any) => m.organization_id)
    if (!orgIds.length) return []

    // Get submissions needing teacher review
    const { data } = await supabase
      .from('submissions')
      .select(`*, scores(*), content_items(title)`)
      .in('organization_id', orgIds)
      .in('status', ['SCORED', 'REVIEW_REQUIRED'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (!data?.length) return []

    return data.map((r: any) => {
      const scoreRow = Array.isArray(r.scores) ? r.scores[0] : r.scores
      return {
        id: r.id,
        studentId: r.user_id,
        skill: (r.type ?? 'WRITING').toLowerCase() as Skill,
        contentId: r.content_item_id ?? '',
        contentTitle: r.content_items?.title ?? 'Practice Exercise',
        status: 'scored' as const,
        answerText: r.input_text ?? undefined,
        submittedAt: r.created_at,
        scoreReport: scoreRow ? {
          submissionId: r.id,
          skill: (r.type ?? 'WRITING').toLowerCase() as Skill,
          overallBand: scoreRow.ai_overall_score ?? 0,
          finalBand: scoreRow.final_score ?? scoreRow.ai_overall_score ?? 0,
          teacherReviewed: scoreRow.is_teacher_override ?? false,
          confidence: scoreRow.confidence ?? 0.8,
          criteria: [],
          strengths: [],
          weaknesses: [],
          nextPractice: [],
          generatedAt: scoreRow.created_at ?? r.created_at,
        } as ScoreReport : undefined,
      } as Submission
    })
  } catch (err) {
    console.warn('[teacherService] getPendingReviews failed:', err)
    return DEMO_SUBMISSIONS.filter((s) => s.status === 'scored' && s.scoreReport)
  }
}

// ── TEACHER OVERRIDE ──────────────────────────────────────

export async function submitTeacherOverride(
  submissionId: string,
  override: {
    overallScore: number
    criterionOverrides: Array<{ criterionId: string; criterionLabel: string; aiScore: number; teacherScore: number }>
    reason: string
  }
): Promise<{ success: boolean; auditLogId: string }> {
  if (!isSupabaseConfigured()) {
    console.log('[TeacherService] Demo override:', { submissionId, override })
    return { success: true, auditLogId: `demo-${Date.now()}` }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return { success: false, auditLogId: '' }

    // Update score with teacher override
    const criteriaAdjustments = override.criterionOverrides.map(c => ({
      criterion: c.criterionLabel,
      aiScore: c.aiScore,
      teacherScore: c.teacherScore,
    }))

    await (supabase.from('scores') as any)
      .update({
        teacher_id: uid,
        teacher_overall_score: override.overallScore,
        final_score: override.overallScore,
        is_teacher_override: true,
        override_reason: override.reason,
        criteria_adjustments: criteriaAdjustments,
      })
      .eq('submission_id', submissionId)

    // Log audit
    const { data: auditRow } = await (supabase.from('audit_logs') as any)
      .insert({
        actor_id: uid,
        action: 'TEACHER_OVERRIDE',
        target_type: 'submission',
        target_id: submissionId,
        metadata: { reason: override.reason, score: override.overallScore },
      })
      .select('id')
      .single()

    return { success: true, auditLogId: auditRow?.id ?? `al-${Date.now()}` }
  } catch (err) {
    console.warn('[teacherService] submitTeacherOverride failed:', err)
    return { success: false, auditLogId: '' }
  }
}
