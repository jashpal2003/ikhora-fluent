'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/config'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { OrgRole } from '@/lib/supabase/types'

export interface OrgMembership {
  organizationId: string
  organizationName: string
  organizationSlug: string
  role: OrgRole
  status: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  globalRole: string
  avatarUrl: string | null
  targetExam: string | null
  targetBand: number | null
  /** Highest org role across all memberships */
  primaryRole: 'student' | 'teacher' | 'institute_admin' | 'admin'
  /** All org memberships */
  memberships: OrgMembership[]
  /** Student skill profile (only for students) */
  skillProfile?: {
    estimatedCefr: string | null
    estimatedBand: number | null
    writingBand: number | null
    speakingBand: number | null
    readingBand: number | null
    listeningBand: number | null
    streakDays: number
    totalPracticeHours: number
    totalSubmissions: number
    weakSkills: string[]
  }
}

/**
 * Determine the user's primary role based on their org memberships.
 * Priority: admin > institute_admin > teacher > student
 */
function getPrimaryRole(memberships: OrgMembership[], globalRole: string): UserProfile['primaryRole'] {
  if (globalRole === 'super_admin') return 'admin'
  const roles = memberships.map((m) => m.role)
  if (roles.includes('ORG_ADMIN')) return 'institute_admin'
  if (roles.includes('TEACHER')) return 'teacher'
  return 'student'
}

/**
 * Get the dashboard URL based on the user's primary role.
 */
export function getDashboardUrl(role: UserProfile['primaryRole']): string {
  switch (role) {
    case 'admin': return '/admin'
    case 'institute_admin': return '/institute'
    case 'teacher': return '/teacher'
    default: return '/dashboard'
  }
}

/**
 * Hook to get the current authenticated user with their full profile.
 * Returns null if not logged in or Supabase is not configured.
 */
export function useUser() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    const supabase = createClient()

    // Load user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()

    if (!userData) {
      setProfile(null)
      return
    }

    const u = userData as Record<string, any>

    // Load organization memberships
    const { data: memberData } = await supabase
      .from('organization_members')
      .select(`
        role,
        status,
        organization_id,
        organizations!inner (id, name, slug)
      `)
      .eq('user_id', supabaseUser.id)
      .eq('status', 'ACTIVE')

    const memberships: OrgMembership[] = (memberData || []).map((m: any) => ({
      organizationId: m.organization_id,
      organizationName: m.organizations?.name || 'Unknown',
      organizationSlug: m.organizations?.slug || '',
      role: m.role as OrgRole,
      status: m.status,
    }))

    const primaryRole = getPrimaryRole(memberships, u.global_role || 'user')

    // Load student skill profile (only for students)
    let skillProfile: UserProfile['skillProfile'] | undefined
    if (primaryRole === 'student') {
      const { data: skillData } = await supabase
        .from('student_skill_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      if (skillData) {
        const s = skillData as Record<string, any>
        skillProfile = {
          estimatedCefr: s.estimated_cefr,
          estimatedBand: s.estimated_band,
          writingBand: s.writing_band,
          speakingBand: s.speaking_band,
          readingBand: s.reading_band,
          listeningBand: s.listening_band,
          streakDays: s.streak_days,
          totalPracticeHours: s.total_practice_hours,
          totalSubmissions: s.total_submissions,
          weakSkills: s.weak_skills,
        }
      }
    }

    setProfile({
      id: u.id,
      name: u.name,
      email: u.email,
      globalRole: u.global_role,
      avatarUrl: u.avatar_url,
      targetExam: u.target_exam,
      targetBand: u.target_band,
      primaryRole,
      memberships,
      skillProfile,
    })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await loadProfile(user)
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  return { user, profile, loading }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/login'
}
