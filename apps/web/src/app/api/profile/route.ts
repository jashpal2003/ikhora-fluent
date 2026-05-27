/**
 * GET /api/profile — get current user's profile + student data
 * PATCH /api/profile — update profile fields
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [profileRes, studentRes, statsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('student_profiles').select('*').eq('user_id', user.id).single(),
      supabase
        .from('submissions')
        .select('skill, score_reports(overall_band)')
        .eq('user_id', user.id)
        .eq('status', 'scored')
        .order('submitted_at', { ascending: false })
        .limit(50),
    ])

    if (profileRes.error) {
      return NextResponse.json({ error: profileRes.error.message }, { status: 500 })
    }

    // Calculate skill bands from recent submissions
    const submissionsWithScores = statsRes.data ?? []
    const skillBands = computeSkillBands(submissionsWithScores)

    return NextResponse.json({
      profile: profileRes.data,
      studentProfile: studentRes.data,
      skillBands,
    })
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    // Allowed profile fields
    if (body.name !== undefined) updates.name = body.name
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url

    // Allowed student_profile fields
    const studentUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.target_band !== undefined) studentUpdates.target_band = body.target_band
    if (body.ielts_module !== undefined) studentUpdates.ielts_module = body.ielts_module
    if (body.cefr_level !== undefined) studentUpdates.cefr_level = body.cefr_level

    const results = await Promise.all([
      Object.keys(updates).length > 0
        ? supabase.from('profiles').update(updates as any).eq('id', user.id)
        : Promise.resolve({ error: null }),
      Object.keys(studentUpdates).length > 1
        ? supabase.from('student_profiles').update(studentUpdates as any).eq('user_id', user.id)
        : Promise.resolve({ error: null }),
    ])

    const error = results.find((r) => r.error)?.error
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/profile]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function computeSkillBands(
  submissions: Array<{ skill: string; score_reports: unknown }>
) {
  const skills = ['writing', 'speaking', 'reading', 'listening']
  return skills.map((skill) => {
    const skillSubs = submissions
      .filter((s) => s.skill === skill)
      .slice(0, 6)

    const reports = skillSubs
      .map((s) => {
        const r = s.score_reports as { overall_band?: number } | null
        return r?.overall_band
      })
      .filter((b): b is number => b !== undefined)

    const band = reports.length > 0
      ? Math.round(reports.reduce((a, b) => a + b, 0) / reports.length * 2) / 2
      : 0

    return {
      skill,
      band,
      trend: reports.reverse(),
      lastUpdated: new Date().toISOString(),
    }
  })
}
