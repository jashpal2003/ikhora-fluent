'use client'

import { useEffect, useState } from 'react'
import type { Class } from '@/lib/types'
import { getInstituteClasses } from '@/lib/services/instituteService'
import { BookOpen, Plus, Target, Users } from 'lucide-react'

export default function InstituteClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInstituteClasses().then(setClasses).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Classes</h1>
        <p>Track class health, teacher assignment, enrollment, and target band progress.</p>
      </div>

      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Create class
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="glass-card p-6 h-44 animate-pulse" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const progress = Math.min(100, Math.round(((cls.avgBand ?? 0) / (cls.targetBand ?? 7)) * 100))
            return (
              <div key={cls.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-semibold">{cls.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">Teacher: {cls.teacherId.replace('-', ' ')}</p>
                  </div>
                  <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center"><BookOpen className="h-4 w-4 text-muted-foreground" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <MiniStat icon={<Users className="h-3.5 w-3.5" />} label="Students" value={cls.studentCount} />
                  <MiniStat icon={<Target className="h-3.5 w-3.5" />} label="Avg band" value={cls.avgBand ?? '-'} />
                  <MiniStat icon={<Target className="h-3.5 w-3.5" />} label="Target" value={cls.targetBand ?? '-'} />
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-muted-foreground">Target progress</span><span>{progress}%</span></div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${progress}%` }} /></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-md border border-border bg-secondary/30 p-3"><div className="text-muted-foreground mb-2">{icon}</div><div className="font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
}
