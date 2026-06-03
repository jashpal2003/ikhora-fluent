'use client'

import { useEffect, useState } from 'react'
import type { Class } from '@/lib/types'
import { getTeacherClasses } from '@/lib/services/teacherService'
import { BookOpen, Plus, Target, UserPlus, Users } from 'lucide-react'

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeacherClasses().then(setClasses).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>My Classes</h1>
        <p>Monitor enrollment, band progress, and class targets from one teaching workspace.</p>
      </div>

      <div className="flex justify-end mb-6"><button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" />Create class</button></div>

      {loading ? <div className="grid md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="glass-card p-6 h-48 animate-pulse" />)}</div> : (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {classes.map((cls) => {
            const progress = Math.min(100, Math.round(((cls.avgBand ?? 0) / (cls.targetBand ?? 7)) * 100))
            return (
              <div key={cls.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-5"><div><h2 className="font-semibold">{cls.name}</h2><p className="text-xs text-muted-foreground mt-1">Teacher-owned IELTS cohort</p></div><BookOpen className="h-5 w-5 text-muted-foreground" /></div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <Tile icon={<Users className="h-3.5 w-3.5" />} label="Students" value={cls.studentCount} />
                  <Tile icon={<Target className="h-3.5 w-3.5" />} label="Avg band" value={cls.avgBand ?? '-'} />
                  <Tile icon={<Target className="h-3.5 w-3.5" />} label="Target" value={cls.targetBand ?? '-'} />
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${progress}%` }} /></div>
              </div>
            )
          })}
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><UserPlus className="h-4 w-4 text-muted-foreground" />Student Enrollment</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <button className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">Import CSV roster</button>
          <button className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">Share invite link</button>
          <button className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">Move students</button>
        </div>
      </div>
    </div>
  )
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-md border border-border bg-secondary/30 p-3"><div className="text-muted-foreground mb-2">{icon}</div><div className="font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
}
