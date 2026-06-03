'use client'

import { useEffect, useState } from 'react'
import type { Assignment } from '@/lib/types'
import { getTeacherAssignments } from '@/lib/services/teacherService'
import { CalendarClock, ClipboardList, Plus } from 'lucide-react'

type Filter = Assignment['status'] | 'all'

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeacherAssignments().then(setAssignments).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? assignments : assignments.filter((item) => item.status === filter)

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Assignments</h1>
        <p>Create, monitor, and close assigned IELTS practice across your classes.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">{(['all', 'active', 'closed', 'draft'] as const).map((s) => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${filter === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{s}</button>)}</div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" />New assignment</button>
      </div>

      <div className="space-y-3">
        {loading ? [1, 2, 3].map((i) => <div key={i} className="glass-card p-5 h-24 animate-pulse" />) : filtered.map((assignment) => {
          const submitted = assignment.totalStudents ? Math.round((assignment.submittedCount / assignment.totalStudents) * 100) : 0
          const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / 86400000)
          return (
            <div key={assignment.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div><div className="font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground" />{assignment.title}</div><div className="text-xs text-muted-foreground mt-1">{assignment.className} · {assignment.skill}</div></div>
                <div className="flex items-center gap-2"><span className={assignment.status === 'active' ? 'status-processing' : assignment.status === 'closed' ? 'status-approved' : 'status-draft'}>{assignment.status}</span><span className={`text-xs flex items-center gap-1 ${daysLeft <= 1 ? 'text-red-400' : daysLeft <= 3 ? 'text-amber-400' : 'text-muted-foreground'}`}><CalendarClock className="h-3.5 w-3.5" />{daysLeft <= 0 ? 'Due now' : `${daysLeft}d left`}</span></div>
              </div>
              <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Submissions</span><span>{assignment.submittedCount}/{assignment.totalStudents}</span></div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${submitted}%` }} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
