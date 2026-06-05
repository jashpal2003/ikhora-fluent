'use server'

/**
 * Institute Service
 * Provides institute-admin-facing data for workspace, users, classes, content, reports, branding, and billing.
 * Connects to Supabase with RLS enforcement. Falls back to seed data.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Class, ContentItem, Skill } from '../types'
import { SEED_CLASSES, SEED_CONTENT_ITEMS } from '../data/organizationData'
import { DEMO_STUDENT_PROFILE, DEMO_SUBMISSIONS } from '../data/studentData'

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ── SEED DATA ──────────────────────────────────────────────

const SEED_INSTITUTE_OVERVIEW = {
  totalStudents: 98,
  totalTeachers: 12,
  totalClasses: 8,
  avgBand: DEMO_STUDENT_PROFILE.estimatedBand,
  targetBand: 7.0,
  activeSubmissions: 47,
  completionRate: 78,
  revenue: 4900,
  revenueThisMonth: 4900,
}

const SEED_INSTITUTE_USERS = [
  { id: 'u-inst-001', name: 'Dr. Sarah Chen', email: 'sarah@cambridge-ls.com', role: 'ORG_ADMIN' as const, status: 'ACTIVE' as const, joinedAt: '2026-01-15' },
  { id: 'u-inst-002', name: 'James Okafor', email: 'james@cambridge-ls.com', role: 'TEACHER' as const, status: 'ACTIVE' as const, joinedAt: '2026-01-18' },
  { id: 'u-inst-003', name: 'Maria Lopez', email: 'maria@cambridge-ls.com', role: 'TEACHER' as const, status: 'ACTIVE' as const, joinedAt: '2026-01-20' },
  { id: 'u-inst-004', name: 'Liam Nguyen', email: 'liam@cambridge-ls.com', role: 'TEACHER' as const, status: 'ACTIVE' as const, joinedAt: '2026-02-01' },
  { id: 'u-inst-005', name: 'Alex Johnson', email: 'alex@cambridge-ls.com', role: 'STUDENT' as const, status: 'ACTIVE' as const, joinedAt: '2026-02-05' },
  { id: 'u-inst-006', name: 'Priya Sharma', email: 'priya@cambridge-ls.com', role: 'STUDENT' as const, status: 'ACTIVE' as const, joinedAt: '2026-02-10' },
  { id: 'u-inst-007', name: 'Tom Williams', email: 'tom@cambridge-ls.com', role: 'STUDENT' as const, status: 'ACTIVE' as const, joinedAt: '2026-02-12' },
  { id: 'u-inst-008', name: 'Yuki Tanaka', email: 'yuki@cambridge-ls.com', role: 'STUDENT' as const, status: 'SUSPENDED' as const, joinedAt: '2026-02-15' },
]

const SEED_INSTITUTE_REPORTS = {
  avgBandByMonth: [
    { month: 'Jan', band: 5.8 },
    { month: 'Feb', band: 6.0 },
    { month: 'Mar', band: 6.1 },
    { month: 'Apr', band: 6.3 },
    { month: 'May', band: 6.4 },
  ],
  skillAverages: [
    { skill: 'writing' as Skill, avg: 6.2, trend: +0.3 },
    { skill: 'speaking' as Skill, avg: 6.5, trend: +0.2 },
    { skill: 'reading' as Skill, avg: 6.8, trend: +0.1 },
    { skill: 'listening' as Skill, avg: 6.1, trend: +0.4 },
  ],
  passRate: 82,
  totalSubmissions: 1247 + DEMO_SUBMISSIONS.length,
  studentsImproved: 67,
  classPerformance: SEED_CLASSES.map((cls) => ({
    classId: cls.id,
    className: cls.name,
    avgBand: cls.avgBand ?? 6,
    targetBand: cls.targetBand ?? 7,
    passRate: Math.min(96, Math.round(((cls.avgBand ?? 6) / (cls.targetBand ?? 7)) * 82)),
  })),
}

const SEED_INSTITUTE_BRANDING = {
  brandName: 'Cambridge Language School',
  primaryColor: '#6366f1',
  logoUrl: '',
  accentColor: '#818cf8',
  website: 'https://cambridge-ls.com',
  contactEmail: 'admin@cambridge-ls.com',
}

const SEED_BILLING = {
  plan: 'Institute Pro' as const,
  status: 'active' as const,
  seats: 120,
  usedSeats: 98,
  monthlyCost: 499,
  nextBillingDate: '2026-07-01',
  history: [
    { id: 'inv-001', date: '2026-05-01', amount: 499, status: 'paid' as const },
    { id: 'inv-002', date: '2026-04-01', amount: 499, status: 'paid' as const },
    { id: 'inv-003', date: '2026-03-01', amount: 499, status: 'paid' as const },
    { id: 'inv-004', date: '2026-02-01', amount: 499, status: 'paid' as const },
    { id: 'inv-005', date: '2026-01-01', amount: 299, status: 'paid' as const },
  ],
}

// ── OVERVIEW ────────────────────────────────────────────────

export async function getInstituteOverview() {
  if (!isSupabaseConfigured()) return SEED_INSTITUTE_OVERVIEW

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_INSTITUTE_OVERVIEW

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['ORG_ADMIN', 'OWNER'])
      .eq('status', 'ACTIVE')

    const orgIds = (memberships ?? []).map((m: any) => m.organization_id)
    if (!orgIds.length) return SEED_INSTITUTE_OVERVIEW

    const [membersRes, classesRes] = await Promise.all([
      supabase.from('organization_members').select('role', { count: 'exact' }).in('organization_id', orgIds).eq('status', 'ACTIVE'),
      supabase.from('classes').select('id', { count: 'exact' }).in('organization_id', orgIds).eq('is_archived', false),
    ])

    const students = (membersRes.data ?? []).filter((m: any) => m.role === 'STUDENT').length
    const teachers = (membersRes.data ?? []).filter((m: any) => m.role === 'TEACHER').length

    return {
      ...SEED_INSTITUTE_OVERVIEW,
      totalStudents: students || SEED_INSTITUTE_OVERVIEW.totalStudents,
      totalTeachers: teachers || SEED_INSTITUTE_OVERVIEW.totalTeachers,
      totalClasses: classesRes.count ?? SEED_INSTITUTE_OVERVIEW.totalClasses,
    }
  } catch (err) {
    console.warn('[instituteService] getInstituteOverview failed:', err)
    return SEED_INSTITUTE_OVERVIEW
  }
}

// ── USERS ───────────────────────────────────────────────────

export async function getInstituteUsers() {
  if (!isSupabaseConfigured()) return SEED_INSTITUTE_USERS

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_INSTITUTE_USERS

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['ORG_ADMIN', 'OWNER'])
      .eq('status', 'ACTIVE')

    const orgIds = (memberships ?? []).map((m: any) => m.organization_id)
    if (!orgIds.length) return SEED_INSTITUTE_USERS

    const { data: members } = await supabase
      .from('organization_members')
      .select('user_id, role, status, users(id, name, email)')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false })

    if (!members?.length) return SEED_INSTITUTE_USERS

    return members.map((m: any) => ({
      id: m.user_id,
      name: m.users?.name ?? 'Unknown',
      email: m.users?.email ?? '',
      role: m.role,
      status: m.status,
      joinedAt: '',
    }))
  } catch (err) {
    console.warn('[instituteService] getInstituteUsers failed:', err)
    return SEED_INSTITUTE_USERS
  }
}

// ── CLASSES ─────────────────────────────────────────────────

export async function getInstituteClasses(): Promise<Class[]> {
  if (!isSupabaseConfigured()) return SEED_CLASSES

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_CLASSES

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['ORG_ADMIN', 'OWNER'])
      .eq('status', 'ACTIVE')

    const orgIds = (memberships ?? []).map((m: any) => m.organization_id)
    if (!orgIds.length) return SEED_CLASSES

    const { data: classes } = await supabase
      .from('classes')
      .select('*, class_members(user_id, role)')
      .in('organization_id', orgIds)
      .eq('is_archived', false)

    if (!classes?.length) return SEED_CLASSES

    return classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      organizationId: c.organization_id,
      teacherId: c.teacher_id ?? '',
      studentCount: (c.class_members ?? []).filter((m: any) => m.role === 'STUDENT').length,
      avgBand: undefined,
      targetBand: undefined,
      createdAt: c.created_at,
    }))
  } catch (err) {
    console.warn('[instituteService] getInstituteClasses failed:', err)
    return SEED_CLASSES
  }
}

// ── CONTENT ─────────────────────────────────────────────────

export async function getInstituteContent(): Promise<ContentItem[]> {
  if (!isSupabaseConfigured()) return SEED_CONTENT_ITEMS

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_CONTENT_ITEMS

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['ORG_ADMIN', 'OWNER', 'TEACHER'])
      .eq('status', 'ACTIVE')

    const orgIds = (memberships ?? []).map((m: any) => m.organization_id)
    if (!orgIds.length) return SEED_CONTENT_ITEMS

    const { data } = await supabase
      .from('content_items')
      .select('*')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!data?.length) return SEED_CONTENT_ITEMS

    return data.map((r: any) => ({
      id: r.id,
      title: r.title ?? 'Untitled',
      skill: (r.skill ?? 'writing').toLowerCase() as ContentItem['skill'],
      type: 'passage' as ContentItem['type'],
      status: 'published' as ContentItem['status'],
      visibility: (r.visibility ?? 'organization_private').toLowerCase() as ContentItem['visibility'],
      organizationId: r.organization_id ?? undefined,
      createdBy: r.created_by_id,
      cefrLevel: r.cefr_level as ContentItem['cefrLevel'],
      topic: r.topic_tags?.[0] ?? undefined,
      tags: r.topic_tags ?? [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))
  } catch (err) {
    console.warn('[instituteService] getInstituteContent failed:', err)
    return SEED_CONTENT_ITEMS
  }
}

// ── REPORTS ─────────────────────────────────────────────────

export async function getInstituteReports() {
  if (!isSupabaseConfigured()) return SEED_INSTITUTE_REPORTS

  try {
    // For now return seed data even with Supabase — aggregate queries are complex
    return SEED_INSTITUTE_REPORTS
  } catch {
    return SEED_INSTITUTE_REPORTS
  }
}

// ── BRANDING ────────────────────────────────────────────────

export async function getInstituteBranding() {
  if (!isSupabaseConfigured()) return SEED_INSTITUTE_BRANDING

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_INSTITUTE_BRANDING

    const { data: memberships } = await (supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['ORG_ADMIN', 'OWNER'])
      .eq('status', 'ACTIVE') as any)

    const orgId = memberships?.[0]?.organization_id
    if (!orgId) return SEED_INSTITUTE_BRANDING

    const { data: org } = await supabase
      .from('organizations')
      .select('name, slug, primary_color, logo_url, website')
      .eq('id', orgId)
      .single()

    if (!org) return SEED_INSTITUTE_BRANDING

    const o = org as Record<string, string | null>
    return {
      brandName: o.name ?? SEED_INSTITUTE_BRANDING.brandName,
      primaryColor: o.primary_color ?? SEED_INSTITUTE_BRANDING.primaryColor,
      logoUrl: o.logo_url ?? '',
      accentColor: SEED_INSTITUTE_BRANDING.accentColor,
      website: o.website ?? SEED_INSTITUTE_BRANDING.website,
      contactEmail: SEED_INSTITUTE_BRANDING.contactEmail,
    }
  } catch (err) {
    console.warn('[instituteService] getInstituteBranding failed:', err)
    return SEED_INSTITUTE_BRANDING
  }
}

// ── BILLING ─────────────────────────────────────────────────

export async function getInstituteBilling() {
  if (!isSupabaseConfigured()) return SEED_BILLING

  try {
    const supabase = await createServerSupabaseClient()
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return SEED_BILLING

    const { data: memberships } = await (supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', uid)
      .in('role', ['ORG_ADMIN', 'OWNER'])
      .eq('status', 'ACTIVE') as any)

    const orgId = memberships?.[0]?.organization_id
    if (!orgId) return SEED_BILLING

    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, subscriptions(status, seat_count, plans(name, tier, monthly_price_cents))')
      .eq('id', orgId)
      .single()

    if (!org) return SEED_BILLING

    const sub = Array.isArray((org as any).subscriptions) ? (org as any).subscriptions[0] : (org as any).subscriptions
    return {
      plan: (sub?.plans?.name ?? 'Institute Pro') as string,
      status: (sub?.status ?? 'active') as string,
      seats: sub?.seat_count ?? 120,
      usedSeats: 0,
      monthlyCost: sub?.plans?.monthly_price_cents ? Math.round(sub.plans.monthly_price_cents / 100) : 499,
      nextBillingDate: '2026-07-01',
      history: SEED_BILLING.history,
    }
  } catch (err) {
    console.warn('[instituteService] getInstituteBilling failed:', err)
    return SEED_BILLING
  }
}
