/**
 * POST /api/ai/tts
 * Text-to-Speech using Web Speech API proxy.
 * Returns JSON with text that the client renders via SpeechSynthesis.
 *
 * For now: browser-native TTS (no Azure Speech cost, works immediately).
 * TODO: Upgrade to Azure Neural TTS for premium voice quality.
 */

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, rate, pitch, voice } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
    }

    // Return the text ready for browser Speech Synthesis
    // The client uses window.speechSynthesis with these params
    return NextResponse.json({
      text: text.slice(0, 2000),
      rate: rate ?? 0.9,
      pitch: pitch ?? 1.0,
      voice: voice ?? 'en-GB', // Prefer British English for IELTS
      provider: 'browser-native',
    })
  } catch (err) {
    return NextResponse.json({ error: 'TTS failed.' }, { status: 500 })
  }
}
