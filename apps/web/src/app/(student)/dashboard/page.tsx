'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  PenTool, Mic2, BookOpen, Headphones, Target, ArrowRight,
  TrendingUp, TrendingDown, Clock, Flame, BarChart3, AlertCircle,
  CheckCircle2, Zap, Calendar, Activity, ChevronRight, Star,
} from 'lucide-react'
import type { StudentProfile, Submission, SkillBand } from '@/lib/types'
import { getDashboardSummary } from '@/lib/services/studentService'

// ── HELPERS ───────────────────────────────────────────────

function getBandColor(band: number): string {
  if (band >= 7.5) return 'text-emerald-400'
  if (band >= 6.5) return 'text-cyan-400'
  if (band >= 5.5) return 'text-amber-400'
  return 'text-red-400'
}

function getBandBg(band: number): string {
  if (band >= 7.5) return 'bg-emerald-400/10 border-emerald-400/20'
  if (band >= 6.5) return 'bg-cyan-400/10 border-cyan-400/20'
  if (band >= 5.5) return 'bg-amber-400/10 border-amber-400/20'
  return 'bg-red-400/10 border-red-400/20'
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    scored: 'status-approved',
    teacher_reviewed: 'status-approved',
    processing: 'status-processing',
    queued: 'status-processing',
    submitted: 'status-draft',
    draft: 'status-draft',
    failed: 'status-rejected',
  }
  return map[status] ?? 'status-draft'
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const SKILL_ICONS: Record<string, typeof PenTool> = {
  writing: PenTool,
  speaking: Mic2,
  reading: BookOpen,
  listening: Headphones,
}

const SKILL_COLORS: Record<string, string> = {
  writing: 'text-violet-400',
  speaking: 'text-rose-400',
  reading: 'text-cyan-400',
  listening: 'text-amber-400',
}

// ── ANIMATED COUNTER ─────────────────────────────────────

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (value === 0) return
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value * 10) / 10)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [value, duration])

  return <>{display % 1 === 0 ? display : display.toFixed(1)}</>
}

// ── MINI SPARKLINE ────────────────────────────────────────

function Sparkline({ data, color = 'hsl(0,0%,65%)' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 60, h = 24

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const lastY = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={lastY} r="2" fill={color} />
    </svg>
  )
}


// ── BAND RING ─────────────────────────────────────────────

function BandRing({ band }: { band: number }) {
  const pct = (band / 9) * 100
  const circumference = 2 * Math.PI * 40
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference * (1 - pct / 100))
    }, 200)
    return () => clearTimeout(timer)
  }, [pct, circumference])

  const color = band >= 7.5 ? '#34d399' : band >= 6.5 ? '#22d3ee' : band >= 5.5 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(0,0%,15%)" strokeWidth="6" />
        <circle
          cx="48" cy="48" r="40" fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums" style={{ color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <AnimatedCounter value={band} />
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">Band</span>
      </div>
    </div>
  )
}

// ── SKILL BAR ─────────────────────────────────────────────

function SkillProgressBar({ skillBand, index }: { skillBand: SkillBand; index: number }) {
  const [width, setWidth] = useState(0)
  const pct = (skillBand.band / 9) * 100
  const Icon = SKILL_ICONS[skillBand.skill] ?? BarChart3
  const colorClass = SKILL_COLORS[skillBand.skill] ?? 'text-muted-foreground'
  const improvement = skillBand.trend.length > 1
    ? skillBand.trend[skillBand.trend.length - 1] - skillBand.trend[0]
    : 0

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100 + index * 120)
    return () => clearTimeout(timer)
  }, [pct, index])

  const sparkColor = improvement > 0 ? '#34d399' : improvement < 0 ? '#f87171' : 'hsl(0,0%,45%)'

  return (
    <div className="group flex items-center gap-4 py-1">
      <div className={`w-28 flex items-center gap-2 flex-shrink-0 ${colorClass}`}>
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-sm capitalize">{skillBand.skill}</span>
      </div>
      <div className="flex-1 relative h-2 rounded-full bg-border overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: `${width}%`,
            background: improvement > 0
              ? 'linear-gradient(90deg, hsl(0,0%,40%), #34d399)'
              : improvement < 0
              ? 'linear-gradient(90deg, hsl(0,0%,40%), #f87171)'
              : 'hsl(0,0%,40%)',
            transitionDuration: `${700 + index * 100}ms`,
          }}
        />
      </div>
      <div className="flex items-center gap-3 w-28 justify-end flex-shrink-0">
        <Sparkline data={skillBand.trend} color={sparkColor} />
        {improvement !== 0 && (
          <span className={`text-xs flex items-center gap-0.5 tabular-nums ${improvement > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {improvement > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
          </span>
        )}
        <span className={`text-sm font-bold tabular-nums ${getBandColor(skillBand.band)}`}>
          {skillBand.band}
        </span>
      </div>
    </div>
  )
}

// ── ACTIVITY PULSE ────────────────────────────────────────

function ActivityPulse({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
    </span>
  )
}

// ── SUBMISSION ROW ────────────────────────────────────────

function SubmissionRow({ submission, index }: { submission: Submission; index: number }) {
  const Icon = SKILL_ICONS[submission.skill] ?? PenTool
  const band = submission.scoreReport?.finalBand
  const colorClass = SKILL_COLORS[submission.skill] ?? 'text-muted-foreground'

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary/60 transition-all duration-200 cursor-pointer group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate group-hover:text-foreground transition-colors">{submission.contentTitle}</div>
        <div className="text-xs text-muted-foreground">{formatRelativeDate(submission.submittedAt)}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {band !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold ${getBandBg(band)} ${getBandColor(band)}`}>
            <Star className="h-3 w-3" />
            {band}
          </div>
        )}
        <span className={getStatusClass(submission.status)}>{submission.status.replace('_', ' ')}</span>
      </div>
    </div>
  )
}

// ── METRIC CARD ───────────────────────────────────────────

function MetricCard({
  label, value, sub, icon, highlight, unit, color,
}: {
  label: string; value: number; sub: string; icon: React.ReactNode
  highlight?: boolean; unit?: string; color?: string
}) {
  return (
    <div className={`glass-card-hover p-5 flex flex-col gap-3 transition-all duration-300 ${highlight ? 'border-foreground/25' : ''}`}>
      <div className={`flex items-center justify-between ${color ?? 'text-muted-foreground'}`}>
        {icon}
        <ActivityPulse active={highlight ?? false} />
      </div>
      <div>
        <div className={`text-3xl font-black tracking-tight ${color ?? 'text-foreground'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <AnimatedCounter value={value} />
          {unit && <span className="text-lg font-medium ml-1 text-muted-foreground">{unit}</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{label}</div>
        <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

// ── SKELETON ──────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />
}

// ── MAIN PAGE ─────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardSummary>> | null>(null)
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 12 && h < 17) setGreeting('Good afternoon')
    else if (h >= 17) setGreeting('Good evening')

    getDashboardSummary()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return (
      <div className="animate-fade-up">
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="glass-card p-10 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-muted-foreground">Failed to load dashboard. Please refresh.</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  const goalCompleted = 3
  const goalTotal = 5
  const goalPct = (goalCompleted / goalTotal) * 100

  return (
    <div className="animate-fade-up space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-medium">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {greeting}, {loading ? '...' : (data?.userName ?? 'Student')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Loading your progress...' : `${data?.streakDays ?? 0}-day streak — keep it going.`}
          </p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-xs text-emerald-400">
          <ActivityPulse active />
          Live session
        </div>
      </div>

      {/* ── TOP BAND + METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Band ring — prominent */}
        <div className="md:col-span-1 glass-card p-5 flex flex-col items-center justify-center gap-2">
          {loading ? (
            <Skeleton className="h-24 w-24 rounded-full" />
          ) : (
            <BandRing band={data?.estimatedBand ?? 0} />
          )}
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">IELTS Band</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">Estimated overall</div>
          </div>
        </div>

        {/* 4 metric cards */}
        <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <MetricCard
                label="CEFR Level"
                value={['A1','A2','B1','B2','C1','C2'].indexOf(data?.cefrLevel ?? 'B1') + 1}
                sub={data?.cefrLevel ?? '—'}
                icon={<Target className="h-4 w-4" />}
                unit=""
                color="text-cyan-400"
              />
              <MetricCard
                label="Streak"
                value={data?.streakDays ?? 0}
                sub="days in a row"
                icon={<Flame className="h-4 w-4" />}
                color="text-orange-400"
              />
              <MetricCard
                label="Hours"
                value={Math.round((data?.totalPracticeMinutes ?? 0) / 60)}
                sub="practiced this month"
                icon={<Clock className="h-4 w-4" />}
                color="text-violet-400"
              />
              <MetricCard
                label="Submissions"
                value={data?.recentSubmissions?.length ?? 0}
                sub="recent attempts"
                icon={<Activity className="h-4 w-4" />}
                color="text-amber-400"
              />
            </>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Skill breakdown with sparklines */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold flex items-center gap-2.5 text-base">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Skill Breakdown
              </h2>
              <Link href="/reports" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Full report <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-5">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="flex-1 h-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {(data?.skillBands ?? []).map((skill, i) => (
                  <SkillProgressBar key={skill.skill} skillBand={skill} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Recent submissions */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2.5 text-base">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Recent Submissions
              </h2>
              <Link href="/reports" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data?.recentSubmissions?.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <PenTool className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No submissions yet. Start your first practice session.</p>
                <Link href="/writing" className="text-sm font-medium hover:underline underline-offset-4">
                  Practice Writing
                </Link>
              </div>
            ) : (
              <div className="space-y-0.5">
                {(data?.recentSubmissions ?? []).map((sub, i) => (
                  <SubmissionRow key={sub.id} submission={sub} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Daily goal */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-base">Today's Progress</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Daily goal</span>
                  <span className="font-semibold tabular-nums">{goalCompleted}/{goalTotal}</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-1000 ease-out"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {Array.from({ length: goalTotal }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-colors duration-300 ${i < goalCompleted ? 'bg-foreground' : 'bg-border'}`}
                      style={{ transitionDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{goalCompleted} tasks completed · {goalTotal - goalCompleted} remaining</span>
                </div>
                <Link
                  href="/study-plan"
                  className="mt-3 flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors group"
                >
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">Full study plan</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </Link>
              </div>
            )}
          </div>

          {/* Quick practice */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-base">Practice Now</h2>
            </div>
            <div className="space-y-1">
              {QUICK_PRACTICE.map((item, i) => {
                const Icon = SKILL_ICONS[item.skill] ?? PenTool
                const colorClass = SKILL_COLORS[item.skill] ?? 'text-muted-foreground'
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-secondary transition-all duration-200 group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0 ${colorClass} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium group-hover:text-foreground transition-colors">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.sub}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Focus areas */}
          {!loading && (data?.weakAreas ?? []).length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <h2 className="font-semibold text-base">Focus Areas</h2>
              </div>
              <div className="space-y-2">
                {(data?.weakAreas ?? []).map((area) => (
                  <div
                    key={area.id}
                    className={`p-3 rounded-md border text-sm transition-all ${
                      area.severity === 'high'
                        ? 'border-red-400/20 bg-red-400/5'
                        : area.severity === 'medium'
                        ? 'border-amber-400/20 bg-amber-400/5'
                        : 'border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{area.category}</span>
                      <span className={`text-xs uppercase tracking-wide font-medium ${
                        area.severity === 'high' ? 'text-red-400'
                        : area.severity === 'medium' ? 'text-amber-400'
                        : 'text-muted-foreground'
                      }`}>
                        {area.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{area.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── STATIC DATA ───────────────────────────────────────────

const QUICK_PRACTICE = [
  { href: '/writing', skill: 'writing', title: 'Writing Task 2', sub: 'Opinion essay · Academic' },
  { href: '/speaking', skill: 'speaking', title: 'Speaking Part 2', sub: 'Cue card · 2 minutes' },
  { href: '/reading', skill: 'reading', title: 'Reading Passage', sub: 'B2 level · Timed mode' },
  { href: '/listening', skill: 'listening', title: 'Listening Section', sub: 'Section 3 · Multiple choice' },
  { href: '/cefr', skill: 'reading', title: 'CEFR Analysis', sub: 'Check your writing level' },
]
