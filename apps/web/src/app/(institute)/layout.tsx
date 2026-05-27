'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, BookOpen, ClipboardList, BarChart3, Palette, CreditCard, Settings, LogOut, Bell, ChevronDown } from 'lucide-react'

const INSTITUTE_NAV = [
  { label: 'Workspace', href: '/institute', icon: LayoutDashboard },
  { label: 'Users', href: '/institute/users', icon: Users },
  { label: 'Classes', href: '/institute/classes', icon: BookOpen },
  { label: 'Private Content', href: '/institute/content', icon: ClipboardList },
  { label: 'Reports', href: '/institute/reports', icon: BarChart3 },
  { label: 'Branding', href: '/institute/branding', icon: Palette },
  { label: 'Billing', href: '/institute/billing', icon: CreditCard },
]

export default function InstituteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 border-r border-border/50" style={{ background: 'rgba(9, 11, 24, 0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ikhora <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluent</span></div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Institute Portal</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {INSTITUTE_NAV.map((item) => {
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
          <Link href="/institute/settings" className="nav-item"><Settings className="h-4 w-4" /><span>Settings</span></Link>
          <button className="nav-item w-full text-left text-red-400 hover:text-red-300"><LogOut className="h-4 w-4" /><span>Sign out</span></button>
        </div>
      </aside>
      <div className="flex-1 pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 px-6" style={{ background: 'rgba(9, 11, 24, 0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-medium text-muted-foreground">Institute Admin</div>
          <div className="flex items-center gap-3">
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/5 transition-colors">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>I</div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
