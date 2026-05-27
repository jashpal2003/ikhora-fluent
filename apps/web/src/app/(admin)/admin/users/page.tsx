'use client'

import { Users } from 'lucide-react'

// Seed user data for admin display
const SEED_USERS = [
  { id: 'student-demo-001', name: 'Alex Johnson', email: 'alex@example.com', role: 'student', status: 'active', joinedAt: '2026-02-15' },
  { id: 'teacher-001', name: 'Dr. Sarah Chen', email: 'sarah@example.com', role: 'teacher', status: 'active', joinedAt: '2026-01-10' },
  { id: 'teacher-002', name: 'James Okafor', email: 'james@example.com', role: 'teacher', status: 'active', joinedAt: '2026-01-12' },
  { id: 'admin-001', name: 'Admin User', email: 'admin@ikhora.com', role: 'admin', status: 'active', joinedAt: '2026-01-01' },
  { id: 'inst-001', name: 'Cambridge Admin', email: 'admin@cambridge-ls.com', role: 'institute_admin', status: 'active', joinedAt: '2026-01-15' },
]

const ROLE_CLASSES: Record<string, string> = {
  student: 'status-draft',
  teacher: 'status-processing',
  institute_admin: 'status-approved',
  admin: 'status-approved',
  super_admin: 'status-approved',
}

export default function UsersPage() {
  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Platform Users</h1>
        <p>Manage all users across student, teacher, institute and admin roles.</p>
      </div>

      <div className="glass-card overflow-hidden">
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
            {SEED_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={ROLE_CLASSES[user.role] ?? 'status-draft'}>
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="status-approved">{user.status}</span>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{user.joinedAt}</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      View
                    </button>
                    <button className="text-xs px-2 py-1 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors">
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
