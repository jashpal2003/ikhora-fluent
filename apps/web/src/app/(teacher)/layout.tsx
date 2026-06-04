'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Users, BookOpen, ClipboardCheck, Library, BarChart3, Settings, LogOut, Bell, ChevronDown, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TEACHER_NAV = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'My Classes', href: '/teacher/classes', icon: Users },
  { label: 'Assignments', href: '/teacher/assignments', icon: BookOpen },
  { label: 'Review Queue', href: '/teacher/reviews', icon: ClipboardCheck },
  { label: 'Content Library', href: '/teacher/content', icon: Library },
  { label: 'Reports', href: '/teacher/reports', icon: BarChart3 },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 flex flex-col z-40 border-r border-border/50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'rgba(9, 11, 24, 0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ikhora <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluent</span></div>
            <div className="text-[10px] text-amber-400 mt-0.5">Teacher Portal</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {TEACHER_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border/50 p-3 space-y-1">
          <Link href="/teacher/settings" className="nav-item" onClick={() => setSidebarOpen(false)}><Settings className="h-4 w-4" /><span>Settings</span></Link>
          <button onClick={handleSignOut} className="nav-item w-full text-left text-red-400 hover:text-red-300"><LogOut className="h-4 w-4" /><span>Sign out</span></button>
        </div>
      </aside>
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 px-4 sm:px-6" style={{ background: 'rgba(9, 11, 24, 0.85)', backdropFilter: 'blur(20px)' }}>
          <button
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/5 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="text-sm font-medium text-muted-foreground hidden sm:block">Teacher Dashboard</div>
          <div className="flex items-center gap-3">
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-white/5 transition-colors">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>T</div>
              <span className="text-sm font-medium hidden sm:inline">Teacher</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
