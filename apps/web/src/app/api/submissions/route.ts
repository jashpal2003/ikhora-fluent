/**
 * GET /api/submissions — list authenticated user's submissions
 * Supports query: ?skill=writing&status=scored&limit=20&page=1
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skill = searchParams.get('skill')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const page = parseInt(searchParams.get('page') ?? '1')
    const offset = (page - 1) * limit

    let query = supabase
      .from('submissions')
      .select(`
        *,
        score_reports (
          overall_band,
          final_band,
          confidence,
          criteria,
          strengths,
          weaknesses,
          sentence_feedback,
          improved_version,
          next_practice,
          metrics,
          teacher_reviewed,
          source,
          generated_at
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (skill) query = query.eq('skill', skill)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/submissions]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      submissions: data ?? [],
      total: count ?? 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('[GET /api/submissions] Unhandled:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
