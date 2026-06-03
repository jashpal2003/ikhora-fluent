'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Class, Assignment, Submission } from '@/lib/types'
import { getTeacherClasses, getTeacherAssignments, getPendingReviews } from '@/lib/services/teacherService'
import { Users, BookOpen, ClipboardList, CheckSquare, PenTool, Mic2, AlertCircle, ArrowRight, Plus } from 'lucide-react'

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [pendingReviews, setPendingReviews] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getTeacherClasses(),
      getTeacherAssignments(),
      getPendingReviews(),
    ])
      .then(([cls, asgn, reviews]) => {
        setClasses(cls)
        setAssignments(asgn)
        setPendingReviews(reviews)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0)

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <p>Manage classes, review student submissions, and track learning progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse"><div className="h-8 w-12 bg-white/10 rounded mb-2" /><div className="h-4 w-20 bg-white/5 rounded" /></div>
          ))
        ) : (
          <>
            <StatCard icon={<BookOpen className="h-5 w-5" />} value={classes.length} label="Active Classes" />
            <StatCard icon={<Users className="h-5 w-5" />} value={totalStudents} label="Total Students" />
            <StatCard icon={<AlertCircle className="h-5 w-5" />} value={pendingReviews.length} label="Pending Reviews" urgent={pendingReviews.length > 0} />
            <StatCard icon={<ClipboardList className="h-5 w-5" />} value={assignments.filter((a) => a.status === 'active').length} label="Active Assignments" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending reviews */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Pending Reviews
            </h2>
            <Link href="/teacher/reviews" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-14 bg-white/5 rounded" />)}
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="text-center py-6">
              <CheckSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">All submissions reviewed. Excellent!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingReviews.slice(0, 5).map((sub) => {
                const Icon = sub.skill === 'writing' ? PenTool : Mic2
                const band = sub.scoreReport?.overallBand
                return (
                  <div key={sub.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors border border-border/50">
                    <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{sub.contentTitle}</div>
                      <div className="text-xs text-muted-foreground">Student · {new Date(sub.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {band !== undefined && (
                        <span className="text-xs text-amber-400">AI: {band}</span>
                      )}
                      <Link href={`/teacher/reviews/${sub.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Review
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* My classes */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-foreground/50" />
              My Classes
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-10 bg-white/5 rounded" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {classes.map((cls) => (
                  <Link key={cls.id} href={`/teacher/classes/${cls.id}`} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-secondary transition-colors group">
                    <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {cls.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium group-hover:text-foreground transition-colors">{cls.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {cls.studentCount} students {cls.avgBand ? `· avg ${cls.avgBand}` : ''}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                ))}
                <Link href="/teacher/classes" className="flex items-center justify-center gap-1.5 py-2 mt-2 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  Create new class
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2 text-base">
              <span className="h-2 w-2 rounded-full bg-foreground/30" />
              Upcoming Deadlines
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="animate-pulse h-8 bg-white/5 rounded" />)}
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active assignments.</p>
            ) : (
              <div className="space-y-2">
                {assignments.slice(0, 3).map((a) => {
                  const dueDate = new Date(a.dueDate)
                  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000)
                  return (
                    <div key={a.id} className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-secondary transition-colors">
                      <div className={`text-xs font-medium w-14 flex-shrink-0 ${daysLeft <= 1 ? 'text-red-400' : daysLeft <= 3 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                        {daysLeft <= 0 ? 'Due now' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                      </div>
                      <div className="flex-1 min-w-0 truncate text-muted-foreground">{a.title}</div>
                      <span className="status-processing flex-shrink-0">{a.submittedCount}/{a.totalStudents}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, urgent }: { icon: React.ReactNode; value: number; label: string; urgent?: boolean }) {
  return (
    <div className={`stat-card ${urgent ? 'border-amber-400/20' : ''}`}>
      <div className="text-muted-foreground mb-3">{icon}</div>
      <div className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
