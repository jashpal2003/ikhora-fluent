'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAdminMetrics, getReviewQueue, getAIJobStats, getOrganizations } from '@/lib/services/adminService'
import { Users, Building, Cpu, DollarSign, Zap, ClipboardList, Library, Award, TrendingUp, AlertTriangle } from 'lucide-react'

// ── TYPES ─────────────────────────────────────────────────

type Metrics = Awaited<ReturnType<typeof getAdminMetrics>>

// ── MAIN PAGE ─────────────────────────────────────────────

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [orgs, setOrgs] = useState<Awaited<ReturnType<typeof getOrganizations>>>([])
  const [aiStats, setAiStats] = useState<Awaited<ReturnType<typeof getAIJobStats>>>([])
  const [reviewQueue, setReviewQueue] = useState<Awaited<ReturnType<typeof getReviewQueue>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminMetrics(), getOrganizations(), getAIJobStats(), getReviewQueue()])
      .then(([m, o, ai, rq]) => {
        setMetrics(m)
        setOrgs(o)
        setAiStats(ai)
        setReviewQueue(rq)
      })
      .finally(() => setLoading(false))
  }, [])

  const METRIC_CARDS = metrics ? [
    { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), change: `+${metrics.userGrowth.toLocaleString()}`, up: true, icon: Users },
    { label: 'Active Organizations', value: metrics.activeOrganizations.toLocaleString(), change: `+${metrics.orgGrowth}`, up: true, icon: Building },
    { label: 'AI Jobs Today', value: metrics.aiJobsToday.toLocaleString(), change: `${metrics.aiSuccessRate}% success`, up: false, icon: Cpu },
    { label: 'Monthly Revenue', value: `$${(metrics.monthlyRevenue / 1000).toFixed(1)}K`, change: `+${metrics.revenueGrowth}%`, up: true, icon: DollarSign },
    { label: 'AI Token Usage', value: `${Math.round(metrics.aiTokensThisMonth / 1_000_000)}M`, change: 'This month', up: false, icon: Zap },
    { label: 'Pending Reviews', value: metrics.pendingReviews.toLocaleString(), change: `${metrics.urgentReviews} urgent`, up: false, warn: true, icon: ClipboardList },
    { label: 'Content Items', value: metrics.contentItems.toLocaleString(), change: `+${metrics.contentGrowth} this week`, up: true, icon: Library },
    { label: 'Certificates Issued', value: metrics.certificatesIssued.toLocaleString(), change: `+${metrics.certGrowth} this month`, up: true, icon: Award },
  ] : []

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Platform Overview</h1>
        <p>Real-time metrics, AI job monitoring, and system health for the Ikhora Fluent platform.</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-8 w-8 bg-white/10 rounded mb-3" />
              <div className="h-7 w-16 bg-white/10 rounded mb-2" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          ))
        ) : (
          METRIC_CARDS.map((m) => (
            <div key={m.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                {m.warn && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
              </div>
              <div className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {m.value}
              </div>
              <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
              <div className={`text-xs font-medium ${m.up ? 'text-emerald-400' : m.warn ? 'text-amber-400' : 'text-muted-foreground'}`}>
                {m.up && '↑ '}{m.change}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Jobs */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Job Performance (Today)
            </h2>
            <Link href="/admin/ai-jobs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-8 bg-white/5 rounded" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {aiStats.map((job) => (
                <div key={job.type}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{job.type}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground tabular-nums">{job.count.toLocaleString()} jobs</span>
                      <span className="text-emerald-400 tabular-nums">{job.success}%</span>
                      <span className="text-muted-foreground tabular-nums">{(job.avgMs / 1000).toFixed(1)}s avg</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-foreground/50" style={{ width: `${job.success}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orgs */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-foreground/40" />
              Recent Organizations
            </h2>
            <Link href="/admin/organizations" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-10 bg-white/5 rounded" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {orgs.slice(0, 5).map((org) => (
                <div key={org.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-secondary transition-colors">
                  <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {org.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{org.name}</div>
                    <div className="text-xs text-muted-foreground">{org.plan.replace(/_/g, ' ')} · {org.usedSeats}/{org.seats} seats</div>
                  </div>
                  <span className={org.status === 'trial' ? 'status-processing' : org.status === 'active' ? 'status-approved' : 'status-rejected'}>
                    {org.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Queue Snapshot */}
      {reviewQueue.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Content Awaiting Review
            </h2>
            <Link href="/admin/review-queue" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Open queue ({reviewQueue.length})
            </Link>
          </div>
          <div className="space-y-2">
            {reviewQueue.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-md border border-border/50 hover:bg-secondary transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{item.skill} · Submitted by {'submittedBy' in item ? (item as any).submittedBy : item.createdBy}</div>
                </div>
                {'aiQualityScore' in item && (item as any).aiQualityScore && (
                  <div className="text-xs text-muted-foreground tabular-nums">QC: {(item as any).aiQualityScore}%</div>
                )}
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 rounded border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 transition-colors">
                    Approve
                  </button>
                  <button className="text-xs px-2 py-1 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 text-base">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-secondary hover:border-foreground/20 transition-all"
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              {action.label}
              {action.count != null && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-foreground/10 text-xs font-bold">{action.count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { href: '/admin/review-queue', label: 'Review Content Queue', icon: ClipboardList, count: 234 },
  { href: '/admin/ai-jobs', label: 'Monitor AI Jobs', icon: Cpu, count: null },
  { href: '/admin/organizations', label: 'Manage Organizations', icon: Building, count: null },
  { href: '/admin/content', label: 'Global Content Library', icon: Library, count: null },
]
