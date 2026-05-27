'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  Video, Users, Clock, BookOpen, Wifi, WifiOff,
  ChevronRight, Plus, Calendar, PlayCircle, Lock,
  Headphones, Mic2, Star, Radio, ArrowRight, Zap,
} from 'lucide-react'

// ── MOCK CLASSROOM DATA ─────────────────────────────────────────
const MOCK_SESSIONS = [
  {
    id: 'rm-ielts-general',
    title: 'IELTS General Training — Writing Task 1',
    teacher: 'Ms. Priya Sharma',
    subject: 'Writing',
    level: 'B2',
    participants: 12,
    maxParticipants: 20,
    status: 'live' as const,
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    thumbnailGradient: 'from-violet-500/20 to-indigo-500/20',
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-400/30',
  },
  {
    id: 'rm-speaking-b2',
    title: 'Speaking Practice — IELTS Part 2 Strategies',
    teacher: 'Mr. David Chen',
    subject: 'Speaking',
    level: 'B1–B2',
    participants: 8,
    maxParticipants: 15,
    status: 'live' as const,
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    thumbnailGradient: 'from-rose-500/20 to-pink-500/20',
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-400/30',
  },
  {
    id: 'rm-grammar-master',
    title: 'Advanced Grammar Masterclass — Conditionals',
    teacher: 'Ms. Aisha Khan',
    subject: 'Grammar',
    level: 'C1',
    participants: 0,
    maxParticipants: 30,
    status: 'scheduled' as const,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    thumbnailGradient: 'from-amber-500/20 to-orange-500/20',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-400/30',
  },
  {
    id: 'rm-reading-c1',
    title: 'Academic Reading — Skimming & Scanning Techniques',
    teacher: 'Mr. James Williams',
    subject: 'Reading',
    level: 'C1',
    participants: 0,
    maxParticipants: 25,
    status: 'scheduled' as const,
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    thumbnailGradient: 'from-cyan-500/20 to-teal-500/20',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/30',
  },
  {
    id: 'rm-vocab-intensive',
    title: 'Academic Vocabulary Intensive — Science & Tech',
    teacher: 'Ms. Priya Sharma',
    subject: 'Vocabulary',
    level: 'B2–C1',
    participants: 0,
    maxParticipants: 40,
    status: 'scheduled' as const,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    thumbnailGradient: 'from-emerald-500/20 to-green-500/20',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-400/30',
  },
  {
    id: 'rm-listening-s4',
    title: 'Listening Section 4 — Academic Lecture Strategies',
    teacher: 'Mr. David Chen',
    subject: 'Listening',
    level: 'B2',
    participants: 0,
    maxParticipants: 20,
    status: 'scheduled' as const,
    scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    thumbnailGradient: 'from-blue-500/20 to-sky-500/20',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-400/30',
  },
]

function formatDuration(isoStart: string) {
  const mins = Math.floor((Date.now() - new Date(isoStart).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function formatScheduled(isoDate: string) {
  const d = new Date(isoDate)
  const diffH = Math.round((d.getTime() - Date.now()) / 3600000)
  if (diffH < 24) return `In ${diffH}h`
  return `In ${Math.floor(diffH / 24)}d`
}

const SUBJECT_ICON: Record<string, typeof Mic2> = {
  Writing: BookOpen,
  Speaking: Mic2,
  Grammar: Zap,
  Reading: BookOpen,
  Vocabulary: Star,
  Listening: Headphones,
}

// ── MAIN PAGE ──────────────────────────────────────────────────

export default function ClassroomPage() {
  const [username, setUsername] = useState('')
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<typeof MOCK_SESSIONS[number] | null>(null)

  const liveSessions = MOCK_SESSIONS.filter((s) => s.status === 'live')
  const scheduledSessions = MOCK_SESSIONS.filter((s) => s.status === 'scheduled')

  const handleJoinClick = (session: typeof MOCK_SESSIONS[number]) => {
    setSelectedSession(session)
    setShowJoinModal(true)
  }

  const handleConfirmJoin = () => {
    if (!username.trim() || !selectedSession) return
    setJoiningRoom(selectedSession.id)
    setShowJoinModal(false)
    // Navigate to room
    window.location.href = `/classroom/${selectedSession.id}?username=${encodeURIComponent(username)}`
  }

  return (
    <div className="animate-fade-up max-w-6xl">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1>Live Classroom</h1>
            <p className="!mt-0">Join live sessions with expert IELTS & CEFR teachers in real time.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 text-xs text-emerald-400 border border-emerald-400/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {liveSessions.length} Live Now
          </div>
          <div className="glass-card px-3 py-1.5 text-xs text-muted-foreground">
            {scheduledSessions.length} Upcoming Sessions
          </div>
        </div>
      </div>

      {/* ── Live Sessions ── */}
      {liveSessions.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Right Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {liveSessions.map((session) => {
              const Icon = SUBJECT_ICON[session.subject] ?? Video
              const pct = Math.round((session.participants / session.maxParticipants) * 100)
              return (
                <div
                  key={session.id}
                  className={`glass-card overflow-hidden border ${session.borderColor} relative group`}
                >
                  {/* Gradient top band */}
                  <div className={`h-1 w-full bg-gradient-to-r ${session.thumbnailGradient.replace('/20', '')}`} />

                  {/* Live badge */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 rounded-full px-2.5 py-1 text-xs font-semibold text-red-400">
                    <Radio className="h-3 w-3" />
                    LIVE
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${session.thumbnailGradient} border ${session.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${session.accentColor}`} />
                      </div>
                      <div className="min-w-0 pr-12">
                        <h3 className="text-sm font-semibold leading-snug">{session.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{session.teacher}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                      <span className="skill-chip">{session.subject}</span>
                      <span className="skill-chip">{session.level}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(session.startedAt!)}
                      </span>
                    </div>

                    {/* Participant bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.participants} joined</span>
                        <span>{pct}% full</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${session.thumbnailGradient.replace('/20', '').replace('from-', 'from-').replace(' to-', ' to-')}`}
                          style={{ width: `${pct}%`, transition: 'width 1s ease' }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinClick(session)}
                      className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Join Live Session
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Scheduled Sessions ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming Sessions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {scheduledSessions.map((session) => {
            const Icon = SUBJECT_ICON[session.subject] ?? Video
            return (
              <div
                key={session.id}
                className={`glass-card p-5 border ${session.borderColor} group hover:border-opacity-60 transition-all`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${session.thumbnailGradient} border ${session.borderColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${session.accentColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold leading-snug line-clamp-2">{session.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{session.teacher}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="skill-chip text-[10px]">{session.subject}</span>
                  <span className="skill-chip text-[10px]">{session.level}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatScheduled(session.scheduledAt!)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Max {session.maxParticipants}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinClick(session)}
                  className="mt-3 w-full py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="h-3 w-3" />
                  Set Reminder
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Join Modal ── */}
      {showJoinModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md mx-4 p-6 border border-border shadow-2xl">
            <h3 className="font-bold text-lg mb-1">Join Classroom</h3>
            <p className="text-sm text-muted-foreground mb-5">{selectedSession.title}</p>

            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmJoin()}
              placeholder="Enter your name to join..."
              className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-all mb-5"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmJoin}
                disabled={!username.trim()}
                className="flex-1 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Video className="h-4 w-4" />
                Enter Classroom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
