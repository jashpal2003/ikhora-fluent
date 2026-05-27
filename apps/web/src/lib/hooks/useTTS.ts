/**
 * useTTS — Browser-native Text-to-Speech hook
 * Uses window.speechSynthesis (available in all modern browsers, zero cost).
 * Designed to be upgraded to Azure Neural TTS via the /api/ai/tts route.
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export type TTSState = 'idle' | 'speaking' | 'paused' | 'error'

export interface UseTTSOptions {
  rate?: number    // 0.1 – 2.0, default 0.9 (slightly slower for learners)
  pitch?: number   // 0 – 2, default 1.0
  lang?: string    // BCP-47 tag, default 'en-GB'
}

export function useTTS(options: UseTTSOptions = {}) {
  const { rate = 0.9, pitch = 1.0, lang = 'en-GB' } = options
  const [state, setState] = useState<TTSState>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Clean up on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setState('error')
      return
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.lang = lang

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en-GB') && v.localService
    ) ?? voices.find(
      (v) => v.lang.startsWith('en')
    ) ?? null
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setState('speaking')
    utterance.onend = () => setState('idle')
    utterance.onerror = () => setState('error')
    utterance.onpause = () => setState('paused')
    utterance.onresume = () => setState('speaking')

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setState('speaking')
  }, [rate, pitch, lang])

  const pause = useCallback(() => {
    window.speechSynthesis?.pause()
    setState('paused')
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis?.resume()
    setState('speaking')
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setState('idle')
  }, [])

  const toggle = useCallback((text: string) => {
    if (state === 'speaking') {
      stop()
    } else {
      speak(text)
    }
  }, [state, speak, stop])

  return { state, speak, pause, resume, stop, toggle, isSpeaking: state === 'speaking' }
}
