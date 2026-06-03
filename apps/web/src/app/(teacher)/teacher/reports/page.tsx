'use client'

import { useEffect, useState } from 'react'
import type { Class } from '@/lib/types'
import { DEMO_STUDENT_PROFILE } from '@/lib/data/studentData'
import { getTeacherClasses } from '@/lib/services/teacherService'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

export default function TeacherReportsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeacherClasses().then(setClasses).finally(() => setLoading(false))
  }, [])

  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0)
  const avgBand = classes.length ? (classes.reduce((sum, cls) => sum + (cls.avgBand ?? 0), 0) / classes.length).toFixed(1) : '-'

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Class Reports</h1>
        <p>Review class-level bands, skill gaps, and improvement trends across your students.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading ? [1, 2, 3].map((i) => <div key={i} className="stat-card animate-pulse h-28" />) : (
          <>
            <Stat icon={<Users className="h-4 w-4" />} label="Students" value={totalStudents} />
            <Stat icon={<BarChart3 className="h-4 w-4" />} label="Avg band" value={avgBand} />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Improvement" value="+0.4" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5">Skill Breakdown</h2>
          <div className="space-y-4">
            {DEMO_STUDENT_PROFILE.skillBands.map((skill) => <div key={skill.skill}><div className="flex justify-between text-sm mb-1.5"><span className="capitalize text-muted-foreground">{skill.skill}</span><span>{skill.band}</span></div><div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${(skill.band / 9) * 100}%` }} /></div></div>)}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5">Class Summary</h2>
          <div className="space-y-3">
            {classes.map((cls) => <div key={cls.id} className="rounded-md border border-border/60 p-3"><div className="flex justify-between text-sm"><span className="font-medium">{cls.name}</span><span>{cls.avgBand ?? '-'} / {cls.targetBand ?? '-'}</span></div><div className="text-xs text-muted-foreground mt-1">{cls.studentCount} enrolled learners</div></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="stat-card"><div className="text-muted-foreground mb-3">{icon}</div><div className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
}
