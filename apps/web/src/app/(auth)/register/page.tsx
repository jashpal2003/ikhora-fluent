'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/config'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'student' | 'teacher' | 'institute_admin'>('student')
  const [targetBand, setTargetBand] = useState('7.0')
  const [module, setModule] = useState<'academic' | 'general'>('academic')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabaseReady = isSupabaseConfigured()

  // Email validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailError = emailTouched && email.length > 0 && !emailValid ? 'Please enter a valid email address' : null

  // Password strength
  const passwordStrength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!supabaseReady) {
      router.push('/dashboard')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ielts_module: role === 'student' ? module : undefined,
          target_band: role === 'student' ? parseFloat(targetBand) : undefined,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (signUpError) {
      // Map common Supabase errors to user-friendly messages
      const msg = signUpError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('This email is already registered. Try signing in instead.')
      } else if (msg.includes('invalid email')) {
        setError('Please enter a valid email address.')
      } else if (msg.includes('password') && msg.includes('weak')) {
        setError('Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.')
      } else if (msg.includes('email') && msg.includes('rate')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-fade-up">
          <div className="h-16 w-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Account created!
          </h1>
          <p className="text-muted-foreground mb-6">
            We sent a confirmation email to <strong>{email}</strong>.
            Click the link in the email to activate your account.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    )
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
            Start your IELTS journey
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Create a free account and start practicing today
          </p>

          {!supabaseReady && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm mb-5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Demo mode — Supabase not configured. Click Register to enter as demo user.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-400/10 border border-red-400/20 text-red-400 text-sm mb-5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'student', label: 'Student' },
                  { value: 'teacher', label: 'Teacher' },
                  { value: 'institute_admin', label: 'Institute' },
                ] as const).map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                      role === r.value
                        ? 'border-foreground bg-foreground/10 text-foreground'
                        : 'border-border bg-secondary text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full name</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                aria-label="Full name"
                autoComplete="name"
                className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (!emailTouched) setEmailTouched(true) }}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                required
                aria-label="Email address"
                aria-invalid={!!emailError}
                autoComplete="email"
                className={`w-full px-3 py-2.5 rounded-md bg-secondary border text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 ${
                  emailError ? 'border-red-400/60 focus:border-red-400' : 'border-border focus:border-foreground/40'
                }`}
              />
              {emailError && (
                <p className="text-xs text-red-400 mt-1.5">{emailError}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  aria-label="Password"
                  autoComplete="new-password"
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
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= passwordStrength.level
                            ? passwordStrength.level <= 1
                              ? 'bg-red-400'
                              : passwordStrength.level === 2
                              ? 'bg-amber-400'
                              : passwordStrength.level === 3
                              ? 'bg-cyan-400'
                              : 'bg-emerald-400'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.level <= 1 ? 'text-red-400' : passwordStrength.level === 2 ? 'text-amber-400' : passwordStrength.level === 3 ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* IELTS setup — only for students */}
            {role === 'student' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Target Band</label>
                <select
                  id="register-target-band"
                  value={targetBand}
                  onChange={(e) => setTargetBand(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                >
                  {['5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">IELTS Module</label>
                <select
                  id="register-module"
                  value={module}
                  onChange={(e) => setModule(e.target.value as 'academic' | 'general')}
                  className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                >
                  <option value="academic">Academic</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading || (supabaseReady && !termsAccepted)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          {/* Terms acceptance */}
          <div className="mt-5">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-secondary text-foreground focus:ring-foreground/20 accent-foreground"
                required
                aria-label="Accept Terms of Service and Privacy Policy"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-foreground font-medium hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-foreground font-medium hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── PASSWORD STRENGTH HELPER ─────────────────────────────

function getPasswordStrength(password: string): { level: number; label: string } {
  if (password.length === 0) return { level: 0, label: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Weak — add uppercase, numbers, or symbols' }
  if (score <= 2) return { level: 2, label: 'Fair — try adding more variety' }
  if (score <= 3) return { level: 3, label: 'Good — almost there' }
  return { level: 4, label: 'Strong password' }
}
