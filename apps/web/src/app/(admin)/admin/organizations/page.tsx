'use client'

import { useState, useEffect } from 'react'
import { getOrganizations } from '@/lib/services/adminService'
import type { Organization } from '@/lib/types'
import { Building } from 'lucide-react'

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganizations().then(setOrgs).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Organizations</h1>
        <p>Manage institute and enterprise accounts, seats, plans and branding.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-14 bg-white/5 rounded" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-3">Organization</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground">/{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground capitalize">{org.plan.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium">{org.usedSeats}/{org.seats}</div>
                    <div className="h-1 rounded-full bg-border mt-1 overflow-hidden w-16">
                      <div className="h-full rounded-full bg-foreground/50" style={{ width: `${(org.usedSeats / org.seats) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={org.status === 'active' ? 'status-approved' : org.status === 'trial' ? 'status-processing' : 'status-rejected'}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{new Date(org.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
