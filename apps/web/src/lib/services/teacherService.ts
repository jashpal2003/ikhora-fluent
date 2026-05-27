/**
 * Teacher Service
 * Provides teacher-facing data for classes, assignments, and submission reviews.
 * API: GET /api/teacher/classes
 *      GET /api/teacher/assignments
 *      GET /api/teacher/pending-reviews
 *      POST /api/teacher/override/:submissionId
 */

import type { Class, Assignment, Submission } from '../types'
import { SEED_CLASSES, SEED_ASSIGNMENTS } from '../data/organizationData'
import { DEMO_SUBMISSIONS } from '../data/studentData'

// ── CLASSES ───────────────────────────────────────────────

export async function getTeacherClasses(teacherId?: string): Promise<Class[]> {
  // TODO: return fetch(`/api/teacher/classes?teacherId=${teacherId}`)
  await new Promise((r) => setTimeout(r, 200))
  return teacherId ? SEED_CLASSES.filter((c) => c.teacherId === teacherId) : SEED_CLASSES
}

// ── ASSIGNMENTS ───────────────────────────────────────────

export async function getTeacherAssignments(teacherId?: string): Promise<Assignment[]> {
  // TODO: return fetch(`/api/teacher/assignments?teacherId=${teacherId}`)
  await new Promise((r) => setTimeout(r, 200))
  return teacherId ? SEED_ASSIGNMENTS.filter((a) => a.teacherId === teacherId) : SEED_ASSIGNMENTS
}

// ── PENDING REVIEWS ───────────────────────────────────────

export async function getPendingReviews(teacherId?: string): Promise<Submission[]> {
  // TODO: return fetch(`/api/teacher/pending-reviews?teacherId=${teacherId}`)
  await new Promise((r) => setTimeout(r, 200))
  // Return scored submissions that haven't been teacher-reviewed
  return DEMO_SUBMISSIONS.filter((s) => s.status === 'scored' && s.scoreReport)
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
  // TODO: return fetch(`/api/teacher/override/${submissionId}`, { method: 'POST', body: JSON.stringify(override) })
  await new Promise((r) => setTimeout(r, 500))
  const auditLogId = `al-${Date.now()}`
  console.log(`[TeacherService] Override submitted for submission ${submissionId}`, { override, auditLogId })
  // IMPORTANT: AI score is preserved in criterionOverrides — never overwritten
  return { success: true, auditLogId }
}
