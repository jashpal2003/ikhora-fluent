'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  ParticipantTile,
  useTracks,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { Loader2, AlertCircle, ArrowLeft, Wifi, Clock } from 'lucide-react'

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!

// ── TOKEN FETCHER ─────────────────────────────────────────────

async function getToken(room: string, username: string): Promise<string> {
  const res = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room, username, role: 'student' }),
  })
  if (!res.ok) throw new Error('Failed to obtain classroom token')
  const data = await res.json()
  return data.token
}

// ── CUSTOM VIDEO GRID ─────────────────────────────────────────

function ClassroomVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  const screenShareTrack = tracks.find((t) => t.source === Track.Source.ScreenShare)
  const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera)

  if (screenShareTrack) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 p-4 w-full h-[calc(100vh-120px)] overflow-hidden">
        {/* Large Screen Share Presentation */}
        <div className="flex-1 h-full min-h-[300px]">
          <ParticipantTile
            trackRef={screenShareTrack}
            className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0e0e10]"
          />
        </div>
        
        {/* Cameras Sidebar */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto w-full lg:w-72 h-32 lg:h-full flex-shrink-0">
          {cameraTracks.map((track) => {
            const key = `${track.participant.identity}_camera_${track.publication?.trackSid || 'placeholder'}`
            return (
              <ParticipantTile
                key={key}
                trackRef={track}
                className="w-48 lg:w-full h-full lg:h-44 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 bg-[#141416] shadow-md transition-all hover:scale-[1.02]"
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Standard Gallery Grid
  return (
    <div 
      className="grid gap-4 p-4 w-full h-[calc(100vh-120px)] overflow-y-auto"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${
          cameraTracks.length <= 1 
            ? '600px' 
            : cameraTracks.length === 2 
            ? '400px' 
            : '300px'
        }), 1fr))`,
        gridAutoRows: cameraTracks.length <= 2 ? '100%' : '1fr',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {cameraTracks.map((track) => {
        const key = `${track.participant.identity}_camera_${track.publication?.trackSid || 'placeholder'}`
        return (
          <ParticipantTile
            key={key}
            trackRef={track}
            className="w-full h-full max-h-[550px] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#141416] transition-all hover:scale-[1.01]"
          />
        )
      })}
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────

export default function ClassroomRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomName = params.roomName as string
  const username = searchParams.get('username') || 'Student'

  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(true)
  const [connected, setConnected] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    getToken(roomName, username)
      .then((t) => {
        setToken(t)
        setConnecting(false)
      })
      .catch((e) => {
        setError(e.message)
        setConnecting(false)
      })
  }, [roomName, username])

  useEffect(() => {
    if (!connected) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [connected])

  const formatElapsed = (s: number) =>
    `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const handleLeave = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setToken(null)
    setConnected(false)
    router.push('/classroom')
  }, [router])

  if (connecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-semibold">Connecting to classroom...</p>
            <p className="text-sm text-muted-foreground mt-1">Room: {roomName}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="glass-card max-w-md w-full mx-4 p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-400">Failed to join classroom</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Link
            href="/classroom"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classroom Hub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-[#111113] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Leave
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <p className="text-sm font-medium capitalize">{roomName.replace(/-/g, ' ')}</p>
            <p className="text-[11px] text-white/40">{username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {connected && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="h-3 w-3" />
                {formatElapsed(elapsed)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Wifi className="h-3 w-3" />
                Connected
              </div>
            </>
          )}
        </div>
      </div>

      {/* LiveKit Room */}
      {token && (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={LIVEKIT_URL}
          data-lk-theme="default"
          style={{ height: 'calc(100vh - 56px)' }}
          onConnected={() => setConnected(true)}
          onDisconnected={() => setConnected(false)}
        >
          <ClassroomVideoGrid />
          <RoomAudioRenderer />
          <ControlBar />
        </LiveKitRoom>
      )}
    </div>
  )
}

