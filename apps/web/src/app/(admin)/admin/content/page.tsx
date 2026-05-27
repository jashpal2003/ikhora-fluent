'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ContentItem, ContentStatus, Skill } from '@/lib/types'
import { getAllContentItems, updateContentStatus } from '@/lib/services/adminService'
import { Plus, Filter, PenTool, Mic2, BookOpen, Headphones, CheckCircle2, AlertCircle, Clock, Archive, Eye, Pencil } from 'lucide-react'

type SkillFilter = Skill | 'all'
type StatusFilter = ContentStatus | 'all'

const SKILL_ICONS: Record<string, typeof PenTool> = {
  writing: PenTool, speaking: Mic2, reading: BookOpen, listening: Headphones,
}

const STATUS_CLASSES: Record<ContentStatus, string> = {
  published: 'status-approved',
  approved: 'status-approved',
  pending_review: 'status-processing',
  ai_quality_checked: 'status-processing',
  draft: 'status-draft',
  rejected: 'status-rejected',
  archived: 'status-draft',
}

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    getAllContentItems()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((item) => {
    if (skillFilter !== 'all' && item.skill !== skillFilter) return false
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    return true
  })

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    setUpdating(id)
    await updateContentStatus(id, status)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
    setUpdating(null)
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Content Library</h1>
        <p>Manage all writing tasks, speaking prompts, reading passages, and listening sections.</p>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'writing', 'speaking', 'reading', 'listening'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSkillFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${skillFilter === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              {s}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          {(['all', 'published', 'approved', 'pending_review', 'draft', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          <Plus className="h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Content table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-12 bg-white/5 rounded" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Library className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No content items match the selected filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-3">Skill</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">CEFR</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((item) => {
                const Icon = SKILL_ICONS[item.skill] ?? PenTool
                return (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium max-w-xs truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">{item.skill} · {String(item.type).replace(/_/g, ' ').toLowerCase()}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground">{item.cefrLevel ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground capitalize">{item.visibility.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={STATUS_CLASSES[item.status] ?? 'status-draft'}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {item.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(item.id, 'approved')}
                              disabled={updating === item.id}
                              className="text-xs px-2 py-1 rounded border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'rejected')}
                              disabled={updating === item.id}
                              className="text-xs px-2 py-1 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {item.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'published')}
                            disabled={updating === item.id}
                            className="text-xs px-2 py-1 rounded border border-foreground/30 text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                          >
                            Publish
                          </button>
                        )}
                        <button className="text-xs p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Library({ className }: { className?: string }) {
  return <BookOpen className={className} />
}
