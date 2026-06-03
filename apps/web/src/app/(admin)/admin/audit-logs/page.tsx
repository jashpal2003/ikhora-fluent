'use client'

import { useEffect, useState } from 'react'
import type { AuditLog } from '@/lib/types'
import { FileClock, Search, ShieldCheck } from 'lucide-react'

const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'al-001', actorId: 'admin-001', actorRole: 'admin', action: 'CONTENT_APPROVED', resourceType: 'content', resourceId: 'wt-at2-002', after: { status: 'approved' }, reason: 'Quality score passed review', timestamp: '2026-05-24T10:20:00Z' },
  { id: 'al-002', actorId: 'teacher-001', actorRole: 'teacher', action: 'TEACHER_OVERRIDE', resourceType: 'submission', resourceId: 'sub-005', before: { score: 6.5 }, after: { score: 7.0 }, reason: 'Stronger task achievement', timestamp: '2026-05-20T10:00:00Z' },
  { id: 'al-003', actorId: 'org-001-admin', actorRole: 'institute_admin', action: 'USER_SUSPENDED', resourceType: 'user', resourceId: 'u-inst-008', after: { status: 'SUSPENDED' }, reason: 'Account requested pause', timestamp: '2026-05-19T16:40:00Z' },
  { id: 'al-004', actorId: 'admin-002', actorRole: 'super_admin', action: 'PLAN_UPDATED', resourceType: 'organization', resourceId: 'org-003', before: { plan: 'trial' }, after: { plan: 'institute_starter' }, timestamp: '2026-05-18T09:15:00Z' },
]

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    setLogs(SEED_AUDIT_LOGS)
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Review sensitive platform actions, score overrides, access changes, and billing events.</p>
      </div>

      <div className="glass-card p-4 mb-6 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search actor, action, or resource" className="w-full bg-transparent text-sm outline-none" />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border"><th className="px-5 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">Diff</th><th className="px-4 py-3">Time</th></tr></thead>
          <tbody className="divide-y divide-border/30">{logs.map((log) => <tr key={log.id} className="hover:bg-secondary/30"><td className="px-5 py-3.5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium">{log.actorId}</div><div className="text-xs text-muted-foreground">{log.actorRole}</div></div></div></td><td className="px-4 py-3.5 font-medium">{log.action.replace(/_/g, ' ')}</td><td className="px-4 py-3.5 text-muted-foreground">{log.resourceType}:{log.resourceId}</td><td className="px-4 py-3.5 text-xs text-muted-foreground">{log.before ? JSON.stringify(log.before) : 'created'} -> {log.after ? JSON.stringify(log.after) : 'logged'}</td><td className="px-4 py-3.5 text-xs text-muted-foreground"><FileClock className="h-3.5 w-3.5 inline mr-1" />{new Date(log.timestamp).toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
