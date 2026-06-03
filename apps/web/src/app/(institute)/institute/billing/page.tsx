'use client'

import { useEffect, useState } from 'react'
import { getInstituteBilling } from '@/lib/services/instituteService'
import { CreditCard, Crown, Receipt, TrendingUp } from 'lucide-react'

type Billing = Awaited<ReturnType<typeof getInstituteBilling>>

export default function InstituteBillingPage() {
  const [billing, setBilling] = useState<Billing | null>(null)

  useEffect(() => {
    getInstituteBilling().then(setBilling)
  }, [])

  if (!billing) return <div className="animate-fade-up"><div className="page-header"><h1>Billing</h1></div><div className="glass-card p-8 h-64 animate-pulse" /></div>

  const used = Math.round((billing.usedSeats / billing.seats) * 100)

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Billing</h1>
        <p>Review plan status, seat usage, and payment history for this institute.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div><div className="text-xs text-muted-foreground mb-1">Current plan</div><h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{billing.plan}</h2></div>
            <Crown className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Seat usage</span><span>{billing.usedSeats}/{billing.seats}</span></div>
          <div className="h-2 rounded-full bg-border overflow-hidden mb-5"><div className="h-full bg-foreground/60" style={{ width: `${used}%` }} /></div>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Upgrade plan</button>
        </div>
        <div className="glass-card p-6"><CreditCard className="h-5 w-5 text-muted-foreground mb-3" /><div className="text-3xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>${billing.monthlyCost}</div><div className="text-xs text-muted-foreground mt-1">Renews {billing.nextBillingDate}</div><div className="mt-4 flex items-center gap-2 text-xs text-emerald-400"><TrendingUp className="h-3.5 w-3.5" />Active subscription</div></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2 font-semibold"><Receipt className="h-4 w-4 text-muted-foreground" />Billing history</div>
        <table className="w-full text-sm"><tbody className="divide-y divide-border/30">{billing.history.map((invoice) => <tr key={invoice.id} className="hover:bg-secondary/30"><td className="px-5 py-3.5 font-medium">{invoice.id}</td><td className="px-4 py-3.5 text-muted-foreground">{invoice.date}</td><td className="px-4 py-3.5">${invoice.amount}</td><td className="px-4 py-3.5"><span className="status-approved">{invoice.status}</span></td></tr>)}</tbody></table>
      </div>
    </div>
  )
}
