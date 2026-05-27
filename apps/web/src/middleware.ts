import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protected routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/writing',
  '/speaking',
  '/reading',
  '/listening',
  '/cefr',
  '/study-plan',
  '/reports',
  '/settings',
  '/mock-test',
  '/teacher',
  '/institute',
  '/admin',
]

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabaseConfigured = !!(
    supabaseUrl &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'YOUR_ANON_PUBLIC_KEY' &&
    !supabaseUrl.includes('YOUR_PROJECT_ID')
  )

  if (!supabaseConfigured) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — IMPORTANT: don't add other logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth routes
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
