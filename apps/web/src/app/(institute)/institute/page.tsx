'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Class } from '@/lib/types'
import { getInstituteClasses, getInstituteOverview, getInstituteReports, getInstituteUsers } from '@/lib/services/instituteService'
import { BarChart3, BookOpen, Building2, Palette, Plus, Settings, TrendingUp, UserPlus, Users } from 'lucide-react'

type Overview = Awaited<ReturnType<typeof getInstituteOverview>>
type Reports = Awaited<ReturnType<typeof getInstituteReports>>
type User = Awaited<ReturnType<typeof getInstituteUsers>>[number]

export default function InstituteDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [reports, setReports] = useState<Reports | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getInstituteOverview(), getInstituteClasses(), getInstituteReports(), getInstituteUsers()])
      .then(([o, c, r, u]) => {
        setOverview(o)
        setClasses(c)
        setReports(r)
        setUsers(u)
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = overview ? [
    { label: 'Students', value: overview.totalStudents, icon: Users },
    { label: 'Classes', value: overview.totalClasses, icon: BookOpen },
    { label: 'Teachers', value: overview.totalTeachers, icon: Building2 },
    { label: 'Avg band', value: overview.avgBand.toFixed(1), icon: TrendingUp },
  ] : []

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Institute Workspace</h1>
        <p>Manage users, classes, content, branding, billing, and performance for your organization.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="stat-card animate-pulse h-32" />) : stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <stat.icon className="h-4 w-4 text-muted-foreground mb-3" />
            <div className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-foreground/50" />Class Performance</h2>
            <Link href="/institute/reports" className="text-xs text-muted-foreground hover:text-foreground">View reports</Link>
          </div>
          {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-10 bg-white/5 rounded" />)}</div> : (
            <div className="space-y-4">
              {classes.map((cls) => {
                const progress = Math.min(100, Math.round(((cls.avgBand ?? 0) / (cls.targetBand ?? 7)) * 100))
                return <div key={cls.id}><div className="flex items-center justify-between text-sm mb-1.5"><span>{cls.name}</span><span className="text-muted-foreground">{cls.studentCount} students · avg {cls.avgBand ?? '-'}</span></div><div className="h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${progress}%` }} /></div></div>
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" />Recent Activity</h2>
          <div className="space-y-3">
            {(reports ? [
              `${reports.studentsImproved} students improved this month`,
              `${reports.totalSubmissions.toLocaleString()} submissions analyzed`,
              `Pass rate holding at ${reports.passRate}%`,
            ] : users.slice(0, 3).map((user) => `${user.name} joined as ${user.role.toLowerCase()}`)).map((activity) => (
              <div key={activity} className="rounded-md border border-border/60 p-3 text-sm text-muted-foreground">{activity}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/institute/users', label: 'Invite Users', icon: UserPlus },
            { href: '/institute/classes', label: 'Create Class', icon: Plus },
            { href: '/institute/content', label: 'Content Library', icon: BookOpen },
            { href: '/institute/reports', label: 'Analytics', icon: BarChart3 },
            { href: '/institute/branding', label: 'Branding', icon: Palette },
            { href: '/institute/billing', label: 'Billing', icon: Settings },
          ].map((action) => <Link key={action.href} href={action.href} className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-secondary hover:border-foreground/20 transition-all"><action.icon className="h-4 w-4 text-muted-foreground" />{action.label}</Link>)}
        </div>
      </div>
    </div>
  )
}
