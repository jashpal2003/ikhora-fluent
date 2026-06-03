import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If a specific redirect was requested, use it
      if (next) return NextResponse.redirect(`${origin}${next}`)

      // Otherwise determine the user's role and redirect accordingly
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: members } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', user.id)
            .eq('status', 'ACTIVE')

          const roles = (members ?? []).map((m: any) => m.role)
          if (roles.includes('ORG_ADMIN')) {
            return NextResponse.redirect(`${origin}/institute`)
          }
          if (roles.includes('TEACHER')) {
            return NextResponse.redirect(`${origin}/teacher`)
          }
        }
      } catch {
        // Fall through to default redirect
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Redirect to login on failure
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
