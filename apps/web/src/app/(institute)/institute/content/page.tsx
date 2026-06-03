'use client'

import { useEffect, useState } from 'react'
import type { ContentItem, ContentStatus, Skill } from '@/lib/types'
import { getInstituteContent } from '@/lib/services/instituteService'
import { BookOpen, CheckCircle2, Eye, Headphones, Mic2, PenTool, Plus } from 'lucide-react'

type SkillFilter = Skill | 'all'
const ICONS: Record<Skill, typeof PenTool> = { writing: PenTool, speaking: Mic2, reading: BookOpen, listening: Headphones }
const STATUS: Record<ContentStatus, string> = { published: 'status-approved', approved: 'status-approved', pending_review: 'status-processing', ai_quality_checked: 'status-processing', draft: 'status-draft', rejected: 'status-rejected', archived: 'status-draft' }

export default function InstituteContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [skill, setSkill] = useState<SkillFilter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInstituteContent().then(setItems).finally(() => setLoading(false))
  }, [])

  const filtered = skill === 'all' ? items : items.filter((item) => item.skill === skill)

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Private Content</h1>
        <p>Manage institute-only IELTS tasks, passages, prompts, and listening sections.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'writing', 'speaking', 'reading', 'listening'] as const).map((s) => (
            <button key={s} onClick={() => setSkill(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${skill === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>{s}</button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="h-4 w-4" />Add item</button>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-8 space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-12 bg-white/5 rounded" />)}</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border"><th className="px-5 py-3">Skill</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((item) => {
                const Icon = ICONS[item.skill]
                return <tr key={item.id} className="hover:bg-secondary/30 transition-colors"><td className="px-5 py-3.5"><Icon className="h-4 w-4 text-muted-foreground" /></td><td className="px-4 py-3.5"><div className="font-medium max-w-sm truncate">{item.title}</div><div className="text-xs text-muted-foreground capitalize">{item.visibility.replace(/_/g, ' ')}</div></td><td className="px-4 py-3.5 text-xs text-muted-foreground">{item.cefrLevel ?? '-'}</td><td className="px-4 py-3.5"><span className={STATUS[item.status]}>{item.status.replace(/_/g, ' ')}</span></td><td className="px-4 py-3.5"><div className="flex gap-2"><button className="text-xs px-2 py-1 rounded border border-border hover:bg-secondary"><Eye className="h-3.5 w-3.5 inline mr-1" />Preview</button><button className="text-xs px-2 py-1 rounded border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"><CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />Publish</button></div></td></tr>
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
