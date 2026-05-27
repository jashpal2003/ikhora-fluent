/**
 * Admin Service
 * Provides access to platform-level data for admin users.
 * API: GET /api/admin/metrics
 *      GET /api/admin/review-queue
 *      PATCH /api/admin/content/:id/status
 *      GET /api/admin/ai-jobs
 *      GET /api/admin/organizations
 *      GET /api/admin/users
 */

import type { ContentItem, Organization, ContentStatus, AIJob } from '../types'
import {
  SEED_CONTENT_ITEMS,
  SEED_ORGANIZATIONS,
  SEED_REVIEW_QUEUE,
  SEED_AI_JOB_STATS,
  SEED_ADMIN_METRICS,
} from '../data/organizationData'

// ── METRICS ───────────────────────────────────────────────

export async function getAdminMetrics() {
  // TODO: return fetch('/api/admin/metrics')
  await new Promise((r) => setTimeout(r, 200))
  return SEED_ADMIN_METRICS
}

// ── CONTENT MANAGEMENT ────────────────────────────────────

export async function getAllContentItems(filters?: {
  skill?: string
  status?: ContentStatus
}): Promise<ContentItem[]> {
  // TODO: return fetch(`/api/admin/content?skill=${filters?.skill}&status=${filters?.status}`)
  await new Promise((r) => setTimeout(r, 200))
  let items = SEED_CONTENT_ITEMS
  if (filters?.skill) items = items.filter((i) => i.skill === filters.skill)
  if (filters?.status) items = items.filter((i) => i.status === filters.status)
  return items
}

export async function updateContentStatus(
  contentId: string,
  status: ContentStatus,
  reviewNote?: string
): Promise<{ success: boolean }> {
  // TODO: return fetch(`/api/admin/content/${contentId}/status`, { method: 'PATCH', body: JSON.stringify({ status, reviewNote }) })
  await new Promise((r) => setTimeout(r, 300))
  console.log(`[AdminService] Content ${contentId} status updated to: ${status}`, reviewNote)
  return { success: true }
}

// ── REVIEW QUEUE ──────────────────────────────────────────

export async function getReviewQueue() {
  // TODO: return fetch('/api/admin/review-queue')
  await new Promise((r) => setTimeout(r, 200))
  return SEED_REVIEW_QUEUE
}

export async function approveContent(contentId: string, note?: string): Promise<{ success: boolean }> {
  // TODO: return fetch(`/api/admin/content/${contentId}/approve`, { method: 'POST', body: JSON.stringify({ note }) })
  await new Promise((r) => setTimeout(r, 400))
  return updateContentStatus(contentId, 'approved', note)
}

export async function rejectContent(contentId: string, reason: string): Promise<{ success: boolean }> {
  // TODO: return fetch(`/api/admin/content/${contentId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
  await new Promise((r) => setTimeout(r, 400))
  return updateContentStatus(contentId, 'rejected', reason)
}

// ── ORGANIZATIONS ─────────────────────────────────────────

export async function getOrganizations(): Promise<Organization[]> {
  // TODO: return fetch('/api/admin/organizations')
  await new Promise((r) => setTimeout(r, 200))
  return SEED_ORGANIZATIONS
}

// ── AI JOBS ───────────────────────────────────────────────

export async function getAIJobStats() {
  // TODO: return fetch('/api/admin/ai-jobs/stats')
  await new Promise((r) => setTimeout(r, 200))
  return SEED_AI_JOB_STATS
}
