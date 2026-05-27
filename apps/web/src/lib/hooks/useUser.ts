'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatarUrl: string | null
  studentProfile?: {
    targetBand: number
    estimatedBand: number
    cefrLevel: string
    streakDays: number
    totalPracticeMinutes: number
    ieltsModule: string
  }
}

/**
 * Hook to get the current authenticated user with their full profile.
 * Returns null if not logged in or Supabase is not configured.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co')
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch full profile + student profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileData) {
          setProfile({
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            avatarUrl: profileData.avatar_url,
            studentProfile: studentData
              ? {
                  targetBand: studentData.target_band,
                  estimatedBand: studentData.estimated_band,
                  cefrLevel: studentData.cefr_level,
                  streakDays: studentData.streak_days,
                  totalPracticeMinutes: studentData.total_practice_minutes,
                  ieltsModule: studentData.ielts_module,
                }
              : undefined,
          })
        }
      }
      setLoading(false)
    }

    loadUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
