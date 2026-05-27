'use client'

import { ClipboardList } from 'lucide-react'

export default function AuditLogsPage() {
  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Full audit trail of teacher overrides, admin content decisions, and system events.</p>
      </div>
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Coming Soon
        </h3>
        <p className="text-muted-foreground text-sm">
          The audit log view will display all teacher overrides with before/after scores and reasons, admin content status changes, and system events.
        </p>
      </div>
    </div>
  )
}
