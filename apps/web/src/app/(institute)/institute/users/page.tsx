'use client'

import { useEffect, useState } from 'react'
import { getInstituteUsers } from '@/lib/services/instituteService'
import { MoreHorizontal, Shield, UserPlus, Users } from 'lucide-react'

type InstituteUser = Awaited<ReturnType<typeof getInstituteUsers>>[number]

const ROLE_CLASS: Record<string, string> = {
  ORG_ADMIN: 'status-approved',
  TEACHER: 'status-processing',
  STUDENT: 'status-draft',
}

export default function InstituteUsersPage() {
  const [users, setUsers] = useState<InstituteUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInstituteUsers().then(setUsers).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Institute Users</h1>
        <p>Invite learners and teachers, manage roles, and keep workspace access current.</p>
      </div>

      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" />
          Invite user
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-12 bg-white/5 rounded" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className={ROLE_CLASS[user.role] ?? 'status-draft'}>{user.role.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3.5"><span className={user.status === 'ACTIVE' ? 'status-approved' : 'status-rejected'}>{user.status.toLowerCase()}</span></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{user.joinedAt || 'Recent'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2 py-1 rounded border border-border hover:bg-secondary transition-colors"><Shield className="h-3.5 w-3.5 inline mr-1" />Promote</button>
                      <button className="text-xs px-2 py-1 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors">Suspend</button>
                      <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
