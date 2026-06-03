'use client'

import { useEffect, useState } from 'react'
import type { ContentItem, ContentStatus, Skill } from '@/lib/types'
import { getInstituteContent } from '@/lib/services/instituteService'
import { BookOpen, Eye, Headphones, Mic2, PenTool, Send } from 'lucide-react'

type SkillFilter = Skill | 'all'
type StatusFilter = ContentStatus | 'all'
const ICONS: Record<Skill, typeof PenTool> = { writing: PenTool, speaking: Mic2, reading: BookOpen, listening: Headphones }

export default function TeacherContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [skill, setSkill] = useState<SkillFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInstituteContent().then(setItems).finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((item) => (skill === 'all' || item.skill === skill) && (status === 'all' || item.status === status))

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Teaching Content</h1>
        <p>Browse approved practice material, preview tasks, and assign work to classes.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'writing', 'speaking', 'reading', 'listening'] as const).map((s) => <button key={s} onClick={() => setSkill(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${skill === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{s}</button>)}
        <div className="w-px bg-border mx-1" />
        {(['all', 'published', 'approved', 'draft'] as const).map((s) => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${status === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{s}</button>)}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <div key={i} className="glass-card p-5 h-36 animate-pulse" />) : filtered.map((item) => {
          const Icon = ICONS[item.skill]
          return (
            <div key={item.id} className="glass-card p-5">
              <div className="flex items-start gap-3 mb-4"><div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center"><Icon className="h-4 w-4 text-muted-foreground" /></div><div className="flex-1 min-w-0"><h2 className="font-semibold truncate">{item.title}</h2><p className="text-xs text-muted-foreground capitalize">{item.skill} · {item.cefrLevel ?? 'mixed'} · {item.status.replace(/_/g, ' ')}</p></div></div>
              <div className="flex flex-wrap gap-2 mb-4">{item.tags?.slice(0, 3).map((tag) => <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">{tag}</span>)}</div>
              <div className="flex gap-2"><button className="text-xs px-3 py-1.5 rounded border border-border hover:bg-secondary"><Eye className="h-3.5 w-3.5 inline mr-1" />Preview</button><button className="text-xs px-3 py-1.5 rounded border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"><Send className="h-3.5 w-3.5 inline mr-1" />Assign</button></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
