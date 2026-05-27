'use client'

import { useState, useEffect } from 'react'
import type { StudyPlan, StudyPlanTask } from '@/lib/types'
import { getStudentStudyPlan } from '@/lib/services/studentService'
import { AlertCircle, RefreshCw, CheckCircle2, Clock, Target, TrendingUp, Calendar } from 'lucide-react'

// ── HELPERS ───────────────────────────────────────────────

const SKILL_COLORS: Record<string, string> = {
  writing: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  speaking: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  reading: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  listening: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  grammar: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  vocabulary: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  review: 'bg-secondary text-muted-foreground border-border',
}

const TYPE_LABELS: Record<string, string> = {
  practice: 'Practice',
  drill: 'Drill',
  study: 'Study',
  mock: 'Mock',
  review: 'Review',
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1 // Mon=0

// ── MAIN PAGE ─────────────────────────────────────────────

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getStudentStudyPlan()
      .then((p) => {
        setPlan(p)
        setCompletedIds(new Set(p.tasks.filter((t) => t.done).map((t) => t.id)))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleTask = (taskId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="animate-fade-up">
        <div className="page-header"><h1>AI Study Plan</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-8 w-12 bg-white/10 rounded mb-2" />
              <div className="h-4 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="animate-fade-up">
        <div className="page-header"><h1>AI Study Plan</h1></div>
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-muted-foreground">Failed to load study plan. Please refresh.</p>
        </div>
      </div>
    )
  }

  const allTasks = plan.tasks
  const totalMinutes = allTasks.reduce((s, t) => s + t.minutes, 0)
  const doneMinutes = allTasks.filter((t) => completedIds.has(t.id)).reduce((s, t) => s + t.minutes, 0)
  const progressPct = totalMinutes > 0 ? Math.round((doneMinutes / totalMinutes) * 100) : 0

  const tasksByDay = DAYS.reduce<Record<string, StudyPlanTask[]>>((acc, day) => {
    acc[day] = allTasks.filter((t) => t.day === day)
    return acc
  }, {})

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>AI Study Plan</h1>
        <p>Your personalized 7-day plan targeting Band {plan.targetBand} — based on your current Band {plan.currentBand}.</p>
      </div>

      {/* ── WEEK METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} value={`${progressPct}%`} label="Week Progress">
          <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </MetricCard>
        <MetricCard icon={<Clock className="h-5 w-5" />} value={`${Math.round(totalMinutes / 60)}h`} label="Total this week" />
        <MetricCard icon={<Target className="h-5 w-5" />} value={`Band ${plan.targetBand}`} label="Target score" />
        <MetricCard icon={<Calendar className="h-5 w-5" />} value={`~${plan.estimatedWeeksToTarget}w`} label="Estimated to target" />
      </div>

      {/* ── WEEK CALENDAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
        {DAYS.map((day, di) => {
          const dayTasks = tasksByDay[day] ?? []
          const dayTotal = dayTasks.reduce((s, t) => s + t.minutes, 0)
          const dayDone = dayTasks.filter((t) => completedIds.has(t.id)).reduce((s, t) => s + t.minutes, 0)
          const isToday = di === TODAY_INDEX

          return (
            <div key={day} className={`glass-card p-3 ${isToday ? 'ring-1 ring-foreground/30' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-sm font-bold ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>{day}</div>
                  {isToday && <div className="text-xs text-foreground/60">Today</div>}
                </div>
                <div className="text-xs text-muted-foreground">{dayTotal}m</div>
              </div>
              <div className="h-1 rounded-full bg-border mb-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/70"
                  style={{ width: `${dayTotal > 0 ? (dayDone / dayTotal) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-1">
                {dayTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full text-left text-xs p-1.5 rounded border transition-all ${
                      SKILL_COLORS[task.skill] ?? SKILL_COLORS.review
                    } ${completedIds.has(task.id) ? 'opacity-40 line-through' : 'hover:opacity-90'}`}
                  >
                    <div className="font-medium capitalize">{task.skill}</div>
                    <div className="opacity-70 leading-tight mt-0.5 hidden md:block">{task.minutes}m</div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── TODAY'S TASKS LIST ── */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-semibold mb-5 flex items-center gap-2 text-base">
          <span className="h-2 w-2 rounded-full bg-foreground" />
          Today's Tasks — {DAYS[TODAY_INDEX]}
        </h2>
        <div className="space-y-2">
          {(tasksByDay[DAYS[TODAY_INDEX]] ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks scheduled for today. Enjoy your rest day!</p>
          ) : (
            (tasksByDay[DAYS[TODAY_INDEX]] ?? []).map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-md border transition-all text-left hover:bg-secondary/50 ${completedIds.has(task.id) ? 'opacity-50' : 'border-border/50'}`}
              >
                <div className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 border ${completedIds.has(task.id) ? 'bg-foreground border-foreground' : 'border-border'}`}>
                  {completedIds.has(task.id) && <CheckCircle2 className="h-3 w-3 text-background" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${SKILL_COLORS[task.skill] ?? SKILL_COLORS.review}`}>
                      {task.skill}
                    </span>
                    <span className="text-xs text-muted-foreground">{TYPE_LABELS[task.type]}</span>
                  </div>
                  <p className={`text-sm ${completedIds.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.activity}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">{task.minutes}min</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── FOCUS AREAS ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold flex items-center gap-2 text-base">
            <span className="h-2 w-2 rounded-full bg-red-500/70" />
            This Week's Focus Areas
          </h2>
          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Regenerate plan
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.focusAreas.slice(0, 3).map((area, i) => (
            <div key={area.id} className="p-4 rounded-md border border-border/50 hover:border-border transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${SKILL_COLORS[area.skill] ?? SKILL_COLORS.review}`}>
                  {area.skill}
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{area.category}</h3>
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{area.recommendation}</p>
              <div className={`text-xs ${area.severity === 'high' ? 'text-red-400' : area.severity === 'medium' ? 'text-amber-400' : 'text-muted-foreground'}`}>
                {area.severity} priority
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── SUB-COMPONENTS ────────────────────────────────────────

function MetricCard({ icon, value, label, children }: {
  icon: React.ReactNode; value: string; label: string; children?: React.ReactNode
}) {
  return (
    <div className="stat-card">
      <div className="text-muted-foreground mb-3">{icon}</div>
      <div className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
  )
}
