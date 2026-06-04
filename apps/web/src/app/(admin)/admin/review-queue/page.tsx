'use client'

import { useState, useEffect } from 'react'
import { getReviewQueue, approveContent, rejectContent } from '@/lib/services/adminService'
import { CheckCircle2, XCircle, AlertCircle, ClipboardList } from 'lucide-react'

type ReviewItem = Awaited<ReturnType<typeof getReviewQueue>>[0] & { _status?: 'approved' | 'rejected'; submittedBy?: string; submittedAt?: string; aiQualityScore?: number; contentId?: string }

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    getReviewQueue()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (item: ReviewItem) => {
    setProcessingId(item.id)
    await approveContent(item.contentId ?? item.id)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, _status: 'approved' } : i))
    setProcessingId(null)
  }

  const handleReject = async (item: ReviewItem) => {
    const reason = rejectReason[item.id] || 'Content does not meet quality standards.'
    setProcessingId(item.id)
    await rejectContent(item.contentId ?? item.id, reason)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, _status: 'rejected' } : i))
    setProcessingId(null)
  }

  const pending = items.filter((i) => !i._status)
  const processed = items.filter((i) => i._status)

  return (
    <div className="animate-fade-up max-w-3xl">
      <div className="page-header">
        <h1>Review Queue</h1>
        <p>Review, approve, or reject content submitted by teachers and AI-assisted workflows.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card p-5 animate-pulse h-24" />)}
        </div>
      ) : pending.length === 0 && processed.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Review queue is empty.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Pending ({pending.length})
              </div>
              <div className="space-y-3">
                {pending.map((item) => (
                  <div key={item.id} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                        <div className="text-xs text-muted-foreground capitalize">
                          {item.skill} · Submitted by {item.submittedBy ?? 'unknown'} · {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ''}
                        </div>
                        {item.aiQualityScore && (
                          <div className="text-xs text-muted-foreground mt-1">
                            AI Quality Score: <span className={item.aiQualityScore >= 90 ? 'text-emerald-400' : item.aiQualityScore >= 75 ? 'text-amber-400' : 'text-red-400'}>{item.aiQualityScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectReason[item.id] ?? ''}
                        onChange={(e) => setRejectReason((r) => ({ ...r, [item.id]: e.target.value }))}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground focus:outline-none focus:border-foreground transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={processingId === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        disabled={processingId === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-red-400/30 text-red-400 hover:bg-red-400/10 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Processed this session ({processed.length})
              </div>
              <div className="space-y-2">
                {processed.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-md border border-border/50">
                    {item._status === 'approved' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                    </div>
                    <span className={item._status === 'approved' ? 'status-approved' : 'status-rejected'}>
                      {item._status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
