'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, BookOpen, CheckSquare, BarChart3, DollarSign, Shield, Settings, LogOut, Bell, ChevronDown, Cpu } from 'lucide-react'

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Global Content', href: '/admin/content', icon: BookOpen },
  { label: 'Review Queue', href: '/admin/review-queue', icon: CheckSquare },
  { label: 'AI Jobs', href: '/admin/ai-jobs', icon: Cpu },
  { label: 'Billing', href: '/admin/billing', icon: DollarSign },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 border-r border-border/50" style={{ background: 'rgba(7, 8, 18, 0.98)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ikhora <span style={{ background: 'linear-gradient(135deg, #f43f5e, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin</span></div>
            <div className="text-[10px] text-rose-400 mt-0.5">Super Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border/50 p-3 space-y-1">
          <Link href="/admin/settings" className="nav-item"><Settings className="h-4 w-4" /><span>System Settings</span></Link>
          <button className="nav-item w-full text-left text-red-400 hover:text-red-300"><LogOut className="h-4 w-4" /><span>Sign out</span></button>
        </div>
      </aside>
      <div className="flex-1 pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 px-6" style={{ background: 'rgba(7, 8, 18, 0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-muted-foreground">System: <span className="text-emerald-400">Healthy</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/5">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-rose-500 to-orange-500">A</div>
              <span className="text-sm font-medium">Super Admin</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
