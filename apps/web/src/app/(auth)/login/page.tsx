'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getDashboardUrl } from '@/lib/hooks/useUser'
import { isSupabaseConfigured } from '@/lib/config'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorParam ?? null)

  const supabaseReady = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabaseReady) {
      // Demo mode — just redirect to dashboard
      router.push(redirectTo)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect based on user role
    const { data: userData } = await supabase
      .from('users')
      .select('global_role')
      .eq('id', (await supabase.auth.getUser()).data.user!.id)
      .single()

    const { data: memberData } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
      .eq('status', 'ACTIVE')

    let role = 'student'
    if (userData && (userData as any).global_role === 'super_admin') role = 'admin'
    else if (memberData?.some((m: any) => m.role === 'ORG_ADMIN')) role = 'institute_admin'
    else if (memberData?.some((m: any) => m.role === 'TEACHER')) role = 'teacher'

    const target = searchParams.get('redirectTo') ?? getDashboardUrl(role as any)
    router.push(target)
    router.refresh()
  }

  async function handleGoogleLogin() {
    if (!supabaseReady) {
      router.push(redirectTo)
      return
    }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}` },
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-foreground flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-background" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ikhora Fluent
          </span>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to continue your IELTS preparation
          </p>

          {!supabaseReady && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm mb-5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Demo mode — Supabase not configured. Click Sign In to enter as demo user.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-400/10 border border-red-400/20 text-red-400 text-sm mb-5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error === 'auth_callback_failed' ? 'Authentication failed. Please try again.' : error}</span>
            </div>
          )}

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-border bg-secondary hover:bg-secondary/80 transition-all text-sm font-medium mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-label="Email address"
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-label="Password"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-foreground font-medium hover:underline underline-offset-4">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing in you agree to our{' '}
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
