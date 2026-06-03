'use client'

import { useEffect, useState } from 'react'
import type { Submission } from '@/lib/types'
import { getPendingReviews } from '@/lib/services/teacherService'
import { BookOpen, CheckCircle2, Headphones, Mic2, PenTool, SlidersHorizontal } from 'lucide-react'

const ICONS = { writing: PenTool, speaking: Mic2, reading: BookOpen, listening: Headphones }

export default function TeacherReviewsPage() {
  const [reviews, setReviews] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPendingReviews().then(setReviews).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Review Queue</h1>
        <p>Approve AI-scored submissions or override bands when teacher judgment is needed.</p>
      </div>

      <div className="space-y-3">
        {loading ? [1, 2, 3].map((i) => <div key={i} className="glass-card p-5 h-24 animate-pulse" />) : reviews.map((submission) => {
          const Icon = ICONS[submission.skill]
          return (
            <div key={submission.id} className="glass-card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-secondary border border-border flex items-center justify-center"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0"><div className="font-semibold truncate">{submission.contentTitle}</div><div className="text-xs text-muted-foreground">Student {submission.studentId} · {new Date(submission.submittedAt).toLocaleDateString()}</div></div>
                <div className="text-right"><div className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{submission.scoreReport?.finalBand ?? submission.scoreReport?.overallBand ?? '-'}</div><div className="text-xs text-muted-foreground">AI band</div></div>
                <div className="flex gap-2"><button className="text-xs px-3 py-1.5 rounded border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"><CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />Approve</button><button className="text-xs px-3 py-1.5 rounded border border-border hover:bg-secondary"><SlidersHorizontal className="h-3.5 w-3.5 inline mr-1" />Override</button></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
