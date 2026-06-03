'use client'

import { useEffect, useState } from 'react'
import { getAdminMetrics, getOrganizations } from '@/lib/services/adminService'
import { Building, DollarSign, PieChart, TrendingUp } from 'lucide-react'

type Metrics = Awaited<ReturnType<typeof getAdminMetrics>>
type Org = Awaited<ReturnType<typeof getOrganizations>>[number]

export default function AdminBillingPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [orgs, setOrgs] = useState<Org[]>([])

  useEffect(() => {
    Promise.all([getAdminMetrics(), getOrganizations()]).then(([m, o]) => {
      setMetrics(m)
      setOrgs(o)
    })
  }, [])

  const plans = orgs.reduce<Record<string, number>>((acc, org) => ({ ...acc, [org.plan]: (acc[org.plan] ?? 0) + 1 }), {})

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Platform Billing</h1>
        <p>Monitor revenue, plan distribution, account status, and billing health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={<DollarSign className="h-4 w-4" />} label="Monthly revenue" value={metrics ? `$${(metrics.monthlyRevenue / 1000).toFixed(1)}K` : '-'} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Growth" value={metrics ? `+${metrics.revenueGrowth}%` : '-'} />
        <Stat icon={<Building className="h-4 w-4" />} label="Organizations" value={orgs.length || '-'} />
        <Stat icon={<PieChart className="h-4 w-4" />} label="Paid plans" value={orgs.filter((org) => org.status === 'active').length || '-'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5">MRR Trend</h2>
          <div className="flex items-end gap-3 h-52">{[62, 66, 71, 75, 82, 94].map((value, index) => <div key={value} className="flex-1 flex flex-col items-center gap-2"><div className="w-full rounded-t bg-foreground/50" style={{ height: `${value * 1.8}px` }} /><span className="text-xs text-muted-foreground">M{index + 1}</span></div>)}</div>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-border font-semibold">Plan Distribution</div>
          <table className="w-full text-sm"><tbody className="divide-y divide-border/30">{Object.entries(plans).map(([plan, count]) => <tr key={plan} className="hover:bg-secondary/30"><td className="px-5 py-3.5 capitalize">{plan.replace(/_/g, ' ')}</td><td className="px-4 py-3.5 text-muted-foreground">{count} organizations</td><td className="px-4 py-3.5"><div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${Math.min(100, count * 25)}%` }} /></div></td></tr>)}</tbody></table>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="stat-card"><div className="text-muted-foreground mb-3">{icon}</div><div className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
}
