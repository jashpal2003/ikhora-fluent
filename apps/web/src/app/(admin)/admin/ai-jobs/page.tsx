'use client'

import { useState, useEffect } from 'react'
import { getAIJobStats } from '@/lib/services/adminService'
import { Cpu, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

export default function AIJobsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAIJobStats>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAIJobStats().then(setStats).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="page-header">
        <h1>AI Job Monitor</h1>
        <p>Monitor writing, speaking and CEFR scoring job queues, success rates and latencies.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse h-20" />
          ))
        ) : (
          stats.map((job) => (
            <div key={job.type} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{job.type}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{job.count.toLocaleString()} jobs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${job.success >= 99 ? 'text-emerald-400' : job.success >= 97 ? 'text-amber-400' : 'text-red-400'}`}>
                      {job.success}%
                    </span>
                    <span className="text-muted-foreground text-xs">success</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{(job.avgMs / 1000).toFixed(1)}s avg</span>
                  </div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${job.success >= 99 ? 'bg-emerald-500' : job.success >= 97 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${job.success}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
