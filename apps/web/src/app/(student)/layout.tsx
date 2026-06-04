'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, PenTool, Mic2, BookOpen, Headphones,
  BarChart3, Target, Sparkles, Settings, LogOut, Bell, User,
  Video, BookMarked, Menu, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STUDENT_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Writing Coach', href: '/writing', icon: PenTool },
  { label: 'Speaking Practice', href: '/speaking', icon: Mic2 },
  { label: 'Reading Practice', href: '/reading', icon: BookOpen },
  { label: 'Listening Practice', href: '/listening', icon: Headphones },
  { label: 'Classroom', href: '/classroom', icon: Video },
  { label: 'Vocabulary Hub', href: '/vocabulary', icon: BookMarked },
  { label: 'CEFR Hub', href: '/cefr', icon: Target },
  { label: 'Study Plan', href: '/study-plan', icon: Sparkles },
  { label: 'Progress & Reports', href: '/reports', icon: BarChart3 },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* ignore */ }
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col z-40 border-r border-border bg-background transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ikhora Fluent
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Student Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {STUDENT_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-2 space-y-0.5 flex-shrink-0">
          <Link href="/settings" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <button onClick={handleSignOut} className="nav-item w-full text-left text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 lg:pl-60 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-4 sm:px-6 py-3 bg-background">
          <button
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Good morning, <span className="text-foreground font-medium">Student</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
            </button>
            <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-secondary transition-colors">
              <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Student</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 min-w-0">{children}</main>
      </div>
    </div>
  )
}
