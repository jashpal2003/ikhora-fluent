'use client'

import { DollarSign } from 'lucide-react'

export default function BillingPage() {
  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="page-header">
        <h1>Billing & Revenue</h1>
        <p>Platform subscription management, revenue analytics and Stripe billing integration.</p>
      </div>
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <DollarSign className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Stripe Integration Pending
        </h3>
        <p className="text-muted-foreground text-sm">
          Billing features including plan management, MRR analytics and invoice history will be available once Stripe integration is complete.
        </p>
      </div>
    </div>
  )
}
