'use client'

import { useState, useEffect } from 'react'
import type { Submission, Skill, SubmissionStatus } from '@/lib/types'
import { getStudentSubmissions, getStudentProfile } from '@/lib/services/studentService'
import { PenTool, Mic2, BookOpen, Headphones, AlertCircle, CheckCircle2, TrendingUp, Clock, BarChart3, Flame } from 'lucide-react'

// ── HELPERS ───────────────────────────────────────────────

type SkillFilter = Skill | 'all'
type StatusFilter = SubmissionStatus | 'all'

function getBandColor(band: number) {
  if (band >= 7) return 'text-emerald-400'
  if (band >= 5.5) return 'text-amber-400'
  return 'text-red-400'
}

const SKILL_ICONS: Record<string, typeof PenTool> = {
  writing: PenTool,
  speaking: Mic2,
  reading: BookOpen,
  listening: Headphones,
}

const STATUS_CLASSES: Record<string, string> = {
  scored: 'status-approved',
  teacher_reviewed: 'status-approved',
  processing: 'status-processing',
  queued: 'status-processing',
  submitted: 'status-draft',
  draft: 'status-draft',
  failed: 'status-rejected',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── MAIN PAGE ─────────────────────────────────────────────

export default function ReportsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getStudentProfile>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    Promise.all([getStudentSubmissions(), getStudentProfile()])
      .then(([subs, prof]) => {
        setSubmissions(subs)
        setProfile(prof)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = submissions.filter((s) => {
    if (skillFilter !== 'all' && s.skill !== skillFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  const totalSubmissions = submissions.length
  const scoredSubmissions = submissions.filter((s) => s.scoreReport)
  const avgBand = scoredSubmissions.length > 0
    ? (scoredSubmissions.reduce((sum, s) => sum + (s.scoreReport?.finalBand ?? 0), 0) / scoredSubmissions.length).toFixed(2)
    : '—'

  if (error) {
    return (
      <div className="animate-fade-up">
        <div className="page-header"><h1>Progress & Reports</h1></div>
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-muted-foreground">Failed to load report data. Please refresh.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Progress & Reports</h1>
        <p>Your learning analytics, skill trends, band movement and practice history.</p>
      </div>

      {/* ── SUMMARY METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => <div key={i} className="stat-card animate-pulse"><div className="h-8 w-12 bg-white/10 rounded mb-2" /><div className="h-4 w-20 bg-white/5 rounded" /></div>)}
          </>
        ) : (
          <>
            <SummaryCard icon={<BarChart3 className="h-5 w-5" />} value={String(totalSubmissions)} label="Total Submissions" />
            <SummaryCard icon={<TrendingUp className="h-5 w-5" />} value={String(avgBand)} label="Average Band" />
            <SummaryCard icon={<Clock className="h-5 w-5" />} value={`${Math.round((profile?.totalPracticeMinutes ?? 0) / 60)}h`} label="Study Hours" />
            <SummaryCard icon={<Flame className="h-5 w-5" />} value={`${profile?.streakDays ?? 0}d`} label="Current Streak" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ── SKILL BAND TRENDS ── */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2 text-base">
            <span className="h-2 w-2 rounded-full bg-foreground" />
            Band Score Trends
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-12 bg-white/5 rounded" />)}
            </div>
          ) : (
            <div className="space-y-5">
              {(profile?.skillBands ?? []).map((skill) => {
                const improvement = skill.trend.length > 1 ? skill.trend[skill.trend.length - 1] - skill.trend[0] : 0
                return (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground capitalize">{skill.skill}</span>
                      <div className="flex items-center gap-3">
                        {improvement > 0 && (
                          <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" />+{improvement.toFixed(1)}
                          </span>
                        )}
                        <span className={`text-sm font-bold tabular-nums ${getBandColor(skill.band)}`}>{skill.band}</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 h-10">
                      {skill.trend.map((b, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t transition-all ${i === skill.trend.length - 1 ? 'bg-foreground/70' : 'bg-foreground/20'}`}
                          style={{ height: `${((b - 4) / 5) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      {['4w', '3w', '2w', '1w', 'Now'].map((l) => <span key={l}>{l}</span>)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── GRAMMAR ANALYSIS ── */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2 text-base">
            <span className="h-2 w-2 rounded-full bg-red-500/70" />
            Grammar & Vocabulary Issues
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-8 bg-white/5 rounded" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {(profile?.weakAreas ?? []).map((area) => (
                <div key={area.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{area.category}</span>
                    <span className={`text-xs font-medium ${area.severity === 'high' ? 'text-red-400' : area.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {area.frequency} issues
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full ${area.severity === 'high' ? 'bg-red-400/60' : area.severity === 'medium' ? 'bg-amber-400/60' : 'bg-emerald-400/60'}`}
                      style={{ width: `${(area.frequency / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ALL SUBMISSIONS TABLE ── */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="font-semibold flex items-center gap-2 text-base">
            <span className="h-2 w-2 rounded-full bg-foreground/50" />
            All Submissions
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Skill filter */}
            {(['all', 'writing', 'speaking', 'reading', 'listening'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSkillFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  skillFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-12 bg-white/5 rounded" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No submissions match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50">
                  <th className="pb-3 pr-4">Skill</th>
                  <th className="pb-3 pr-4">Task</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Words</th>
                  <th className="pb-3 pr-4">AI Band</th>
                  <th className="pb-3 pr-4">Final Band</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((sub) => {
                  const Icon = SKILL_ICONS[sub.skill] ?? PenTool
                  const aiBand = sub.scoreReport?.overallBand
                  const finalBand = sub.scoreReport?.finalBand
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium max-w-48 truncate">{sub.contentTitle}</td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{formatDate(sub.submittedAt)}</td>
                      <td className="py-3 pr-4 text-muted-foreground tabular-nums">{sub.wordCount ?? '—'}</td>
                      <td className="py-3 pr-4">
                        {aiBand !== undefined ? (
                          <span className={`text-sm font-bold tabular-nums ${getBandColor(aiBand)}`}>{aiBand}</span>
                        ) : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        {finalBand !== undefined ? (
                          <span className={`text-sm font-bold tabular-nums ${getBandColor(finalBand)}`}>
                            {finalBand}
                            {sub.scoreReport?.teacherReviewed && <span className="text-xs text-emerald-400 ml-1">T</span>}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3">
                        <span className={STATUS_CLASSES[sub.status] ?? 'status-draft'}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── SUB-COMPONENTS ────────────────────────────────────────

function SummaryCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="stat-card">
      <div className="text-muted-foreground mb-3">{icon}</div>
      <div className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
