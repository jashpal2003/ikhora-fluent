'use client'

import { useState } from 'react'
import { DEMO_STUDENT_PROFILE } from '@/lib/data/studentData'
import { Bell, CalendarDays, CreditCard, Lock, Save, Trash2, User } from 'lucide-react'

export default function StudentSettingsPage() {
  const [name, setName] = useState('Alex Johnson')
  const [email, setEmail] = useState('alex@example.com')
  const [targetBand, setTargetBand] = useState(DEMO_STUDENT_PROFILE.targetBand)
  const [moduleType, setModuleType] = useState(DEMO_STUDENT_PROFILE.ieltsModule ?? 'academic')
  const [examDate, setExamDate] = useState('2026-08-15')
  const [notifications, setNotifications] = useState({ feedback: true, reminders: true, billing: false })

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your profile, IELTS preferences, notifications, plan, and account security.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Profile</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-md bg-secondary border border-border flex items-center justify-center text-lg font-bold">AJ</div>
              <button className="text-xs px-3 py-1.5 rounded border border-border hover:bg-secondary transition-colors">Upload avatar</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="text-sm font-medium">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
              <label className="block"><span className="text-sm font-medium">Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" />IELTS Preferences</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block"><span className="text-sm font-medium">Target band</span><input type="number" step="0.5" min="4" max="9" value={targetBand} onChange={(e) => setTargetBand(Number(e.target.value))} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
              <label className="block"><span className="text-sm font-medium">Module</span><select value={moduleType} onChange={(e) => setModuleType(e.target.value as 'academic' | 'general')} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="academic">Academic</option><option value="general">General</option></select></label>
              <label className="block"><span className="text-sm font-medium">Exam date</span><input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" />Notifications</h2>
            <div className="space-y-3">
              <Toggle label="AI feedback ready" checked={notifications.feedback} onChange={() => setNotifications((prev) => ({ ...prev, feedback: !prev.feedback }))} />
              <Toggle label="Study plan reminders" checked={notifications.reminders} onChange={() => setNotifications((prev) => ({ ...prev, reminders: !prev.reminders }))} />
              <Toggle label="Plan and billing updates" checked={notifications.billing} onChange={() => setNotifications((prev) => ({ ...prev, billing: !prev.billing }))} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" />Plan</h2>
            <div className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Student Pro</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated band {DEMO_STUDENT_PROFILE.estimatedBand} · {DEMO_STUDENT_PROFILE.streakDays} day streak</p>
            <button className="mt-5 w-full px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-secondary transition-colors">Manage subscription</button>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">Account Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-secondary"><Lock className="h-4 w-4 text-muted-foreground" />Change password</button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-red-400/30 text-sm text-red-400 hover:bg-red-400/10"><Trash2 className="h-4 w-4" />Delete account</button>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><Save className="h-4 w-4" />Save settings</button>
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between rounded-md border border-border p-3 text-left hover:bg-secondary/50 transition-colors">
      <span className="text-sm">{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${checked ? 'bg-primary' : 'bg-secondary border border-border'}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} /></span>
    </button>
  )
}
