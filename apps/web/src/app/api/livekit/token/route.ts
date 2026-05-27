/**
 * POST /api/livekit/token
 * Generates a signed LiveKit participant token.
 * Body: { room: string; username: string; role?: 'teacher' | 'student' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!

export async function POST(req: NextRequest) {
  try {
    const { room, username, role = 'student' } = await req.json()

    if (!room || !username) {
      return NextResponse.json({ error: 'room and username are required' }, { status: 400 })
    }

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return NextResponse.json({ error: 'LiveKit credentials not configured' }, { status: 500 })
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: username,
      name: username,
      ttl: '4h',
    })

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: role === 'teacher',
      roomRecord: role === 'teacher',
    })

    const jwt = await token.toJwt()

    return NextResponse.json({ token: jwt })
  } catch (err: any) {
    console.error('[livekit/token]', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
