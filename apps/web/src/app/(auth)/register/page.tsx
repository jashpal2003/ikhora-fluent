'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [targetBand, setTargetBand] = useState('7.0')
  const [module, setModule] = useState<'academic' | 'general'>('academic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!supabaseConfigured) {
      router.push('/dashboard')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'student',
          ielts_module: module,
          target_band: parseFloat(targetBand),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
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

          {!supabaseConfigured && (
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
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full name</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required={supabaseConfigured}
                className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required={supabaseConfigured}
                className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
              />
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
                  required={supabaseConfigured}
                  minLength={8}
                  className="w-full px-3 py-2.5 pr-10 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* IELTS setup */}
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

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

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
