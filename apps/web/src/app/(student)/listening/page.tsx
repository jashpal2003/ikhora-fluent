'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Headphones, CheckCircle2, AlertCircle, RotateCcw, Volume2,
  Clock, ChevronRight, Play, Pause, SkipForward, FileText, Eye, EyeOff
} from 'lucide-react'
import type { ListeningSection } from '@/lib/types'
import { getListeningSections } from '@/lib/services/questionBankService'
import { scoreListeningAttempt } from '@/lib/services/aiScoringService'
import { savePracticeScore } from '@/lib/services/studentService'
import { useUser } from '@/lib/hooks/useUser'

// ── TYPES ──────────────────────────────────────────────────────

type Step = 'select' | 'listen' | 'result'

// ── HELPERS ────────────────────────────────────────────────────

function getBandColor(band: number) {
  if (band >= 7) return 'text-emerald-400'
  if (band >= 5.5) return 'text-amber-400'
  return 'text-red-400'
}

const Q_TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice',
  form_completion: 'Form Completion',
  matching: 'Matching',
  note_completion: 'Note Completion',
  map_labelling: 'Map Labelling',
}

function formatTimer(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

/** Split transcript into ~40-word chunks for segmented playback */
function splitTranscript(transcript: string): string[] {
  const sentences = transcript.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).split(' ').length > 45 && current.length > 0) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current = current ? current + ' ' + sentence : sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// ── AUDIO PLAYER COMPONENT ─────────────────────────────────────

function AudioPlayer({
  transcript,
  onChunkChange,
}: {
  transcript: string
  onChunkChange?: (chunkIndex: number) => void
}) {
  const chunks = splitTranscript(transcript)
  const [currentChunk, setCurrentChunk] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isPlayingRef = useRef(false)

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    isPlayingRef.current = false
  }, [])

  const speakChunk = useCallback((idx: number) => {
    if (typeof window === 'undefined' || idx >= chunks.length) {
      stop()
      return
    }
    const utt = new SpeechSynthesisUtterance(chunks[idx])
    utt.rate = 0.88
    utt.pitch = 1.0
    // Prefer British English voice for IELTS
    const voices = window.speechSynthesis.getVoices()
    const britishVoice = voices.find(v => v.lang.startsWith('en-GB'))
      ?? voices.find(v => v.lang.startsWith('en'))
    if (britishVoice) utt.voice = britishVoice

    utt.onend = () => {
      if (!isPlayingRef.current) return
      // Auto-advance to next chunk after a short pause
      setTimeout(() => {
        if (isPlayingRef.current && idx + 1 < chunks.length) {
          setCurrentChunk(idx + 1)
          onChunkChange?.(idx + 1)
          speakChunk(idx + 1)
        } else {
          setIsPlaying(false)
          isPlayingRef.current = false
        }
      }, 800)
    }
    utt.onerror = () => {
      setIsPlaying(false)
      isPlayingRef.current = false
    }
    utteranceRef.current = utt
    window.speechSynthesis.speak(utt)
  }, [chunks, stop, onChunkChange])

  const togglePlay = () => {
    if (isPlaying) {
      stop()
    } else {
      setIsPlaying(true)
      isPlayingRef.current = true
      speakChunk(currentChunk)
    }
  }

  const skipForward = () => {
    stop()
    const next = Math.min(currentChunk + 1, chunks.length - 1)
    setCurrentChunk(next)
    onChunkChange?.(next)
  }

  const restart = () => {
    stop()
    setCurrentChunk(0)
    onChunkChange?.(0)
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    }
  }, [])

  const progress = chunks.length > 0 ? ((currentChunk + (isPlaying ? 0.5 : 0)) / chunks.length) * 100 : 0

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Player controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={restart}
          className="h-9 w-9 rounded-md flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlay}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all flex-shrink-0 ${
            isPlaying
              ? 'bg-amber-400 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:bg-amber-500'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
          }`}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button
          onClick={skipForward}
          className="h-9 w-9 rounded-md flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Skip forward"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {isPlaying ? `Playing segment ${currentChunk + 1} of ${chunks.length}` : 'Audio ready — press play'}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-border overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: isPlaying
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #a3a3a3, #d4d4d4)',
              }}
            />
            {/* Segment markers */}
            <div className="absolute inset-0 flex">
              {chunks.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-background/30 last:border-r-0"
                />
              ))}
            </div>
          </div>
        </div>
        {/* Transcript toggle */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={`h-9 px-3 rounded-md flex items-center gap-2 text-xs font-medium border transition-all ${
            showTranscript
              ? 'bg-secondary border-foreground/20 text-foreground'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          {showTranscript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Transcript</span>
        </button>
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[12, 18, 10, 20, 14].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-amber-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${[0, 150, 300, 450, 200][i]}ms`,
                  height: `${h}px`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-amber-400/80">Now playing…</span>
        </div>
      )}

      {/* Transcript viewer */}
      {showTranscript && (
        <div className="border border-border rounded-md p-4 max-h-64 overflow-y-auto space-y-2 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transcript</span>
          </div>
          {chunks.map((chunk, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed transition-colors rounded px-2 py-1 ${
                i === currentChunk && isPlaying
                  ? 'bg-amber-400/10 text-foreground border-l-2 border-amber-400'
                  : i < currentChunk
                  ? 'text-muted-foreground/60'
                  : 'text-muted-foreground'
              }`}
            >
              {chunk}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────

export default function ListeningPracticePage() {
  const { profile } = useUser()
  const [step, setStep] = useState<Step>('select')
  const [sections, setSections] = useState<ListeningSection[]>([])
  const [selected, setSelected] = useState<ListeningSection | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [scoreData, setScoreData] = useState<{ score: number; total: number; band: number; results: Record<string, boolean> } | null>(null)
  const [notAllAnswered, setNotAllAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    setSections(getListeningSections({ status: 'published' }))
  }, [])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const handleSelect = (s: ListeningSection) => {
    setSelected(s)
    setAnswers({})
    setScoreData(null)
    setNotAllAnswered(false)
    setTimeLeft(s.timeLimitSeconds)
    setTimerActive(true)
    setStep('listen')
  }

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }))
    setNotAllAnswered(false)
  }

  const handleSubmit = useCallback((forceSubmit = false) => {
    if (!selected) return
    const answered = selected.questions.filter((q) => answers[q.id]?.trim())
    // In normal submission: require all answers. On timer expiry (forceSubmit): submit whatever is answered.
    if (!forceSubmit && answered.length < selected.questions.length) {
      setNotAllAnswered(true)
      return
    }
    setTimerActive(false)
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()

    const score = scoreListeningAttempt(selected.questions, answers)

    savePracticeScore({
      userId: profile?.id ?? '00000000-0000-0000-0000-000000000000',
      skill: 'listening',
      score: score.score,
      band: score.band,
      durationSeconds: selected.timeLimitSeconds - timeLeft,
    })

    setScoreData(score)
    setStep('result')
  }, [selected, answers, timeLeft])

  // Auto-submit when timer runs out — force-submit with whatever answers exist
  useEffect(() => {
    if (step === 'listen' && timeLeft === 0 && timerActive && selected) {
      handleSubmit(true)
    }
  }, [timeLeft, timerActive, step, selected, handleSubmit])

  const handleReset = () => {
    setStep('select')
    setSelected(null)
    setAnswers({})
    setScoreData(null)
    setTimerActive(false)
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
  }

  const answeredCount = selected
    ? selected.questions.filter((q) => answers[q.id]?.trim()).length
    : 0

  return (
    <div className="animate-fade-up max-w-4xl">
      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1>Listening Practice</h1>
            <p className="!mt-0">IELTS-style listening with real scenario audio. Listen carefully, then answer the questions.</p>
          </div>
        </div>
      </div>

      {/* ── SELECT STEP ── */}
      {step === 'select' && (
        <div className="space-y-6">
          {/* How it works */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-violet-400" />
              How IELTS Listening Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Listen', desc: 'Play the scenario audio. You can pause, replay, and view the transcript.' },
                { step: '2', title: 'Answer', desc: 'Answer all questions based on what you heard. No rewinding during the exam!' },
                { step: '3', title: 'Review', desc: 'Submit to see your band score, correct answers, and explanations.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 p-3 rounded-md bg-secondary/50 border border-border/40">
                  <div className="h-7 w-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => {
              const hasAudio = section.audioStatus === 'available' && !!section.transcript
              const difficultyColor =
                section.cefrLevel === 'C1' || section.cefrLevel === 'C2'
                  ? 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                  : section.cefrLevel === 'B2'
                  ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                  : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelect(section)}
                  className="glass-card-hover p-5 text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-lg bg-violet-500/15 border border-violet-400/20 flex items-center justify-center font-bold text-violet-400 flex-shrink-0">
                        {section.sectionNumber}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Section {section.sectionNumber}</div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium mt-0.5 ${difficultyColor}`}>
                          {section.cefrLevel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="skill-chip">{section.questions.length} Qs</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-foreground transition-colors">{section.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{section.topic}</p>
                  <div className="flex items-center gap-3 text-xs">
                    {hasAudio ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Volume2 className="h-3 w-3" />
                        Audio available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <FileText className="h-3 w-3" />
                        Transcript mode
                      </span>
                    )}
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(section.timeLimitSeconds / 60)} min
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Tips */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3">IELTS Listening Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {LISTENING_TIPS.map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400/60 mt-1.5 flex-shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LISTEN STEP ── */}
      {step === 'listen' && selected && (
        <div className="space-y-5">
          {/* Header bar */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-sm font-bold text-violet-400">
                {selected.sectionNumber}
              </div>
              <div>
                <div className="text-sm font-medium">{selected.title}</div>
                <div className="text-xs text-muted-foreground">{selected.topic}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Answered count */}
              <span className="text-xs text-muted-foreground hidden sm:block">
                {answeredCount}/{selected.questions.length} answered
              </span>
              <div className={`font-mono text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${
                timeLeft < 120
                  ? 'text-rose-400 border-rose-400/30 bg-rose-400/5'
                  : timeLeft < 300
                  ? 'text-amber-400 border-amber-400/30 bg-amber-400/5'
                  : 'text-muted-foreground border-border'
              }`}>
                <Clock className="h-4 w-4" />
                {formatTimer(timeLeft)}
              </div>
            </div>
          </div>

          {/* Audio player */}
          {selected.transcript && (
            <AudioPlayer transcript={selected.transcript} />
          )}

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Questions — Section {selected.sectionNumber}
              </span>
              <span className="text-xs text-muted-foreground">{answeredCount}/{selected.questions.length} answered</span>
            </div>

            {selected.questions.map((q, i) => {
              const isAnswered = !!answers[q.id]?.trim()
              return (
                <div
                  key={q.id}
                  className={`glass-card p-4 transition-all ${
                    isAnswered ? 'border-emerald-400/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isAnswered
                        ? 'bg-emerald-400/20 text-emerald-400'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="skill-chip mb-1.5 inline-block">{Q_TYPE_LABELS[q.type] ?? q.type}</span>
                      <p className="text-sm leading-relaxed">{q.question}</p>
                    </div>
                  </div>

                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-1.5 pl-9">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswerChange(q.id, opt)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border ${
                            answers[q.id] === opt
                              ? 'bg-violet-500/15 text-foreground border-violet-400/40'
                              : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full border mr-2 align-middle ${
                            answers[q.id] === opt
                              ? 'border-violet-400 bg-violet-400'
                              : 'border-muted-foreground/40'
                          }`}>
                            {answers[q.id] === opt && (
                              <span className="flex h-full w-full items-center justify-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-background" />
                              </span>
                            )}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type !== 'mcq' && (
                    <div className="pl-9 mt-2">
                      <input
                        type="text"
                        value={answers[q.id] ?? ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer here…"
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {notAllAnswered && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Please answer all questions before submitting. ({answeredCount}/{selected.questions.length} answered)
            </div>
          )}

          <button
            onClick={() => handleSubmit()}
            disabled={answeredCount === 0}
            className="w-full py-3.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Answers ({answeredCount}/{selected.questions.length})
          </button>
        </div>
      )}

      {/* ── RESULT STEP ── */}
      {step === 'result' && selected && scoreData && (
        <div className="space-y-6 animate-fade-up">
          {/* Score cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-5 text-center">
              <div className={`text-4xl font-bold mb-1 ${getBandColor(scoreData.band)}`}>{scoreData.band}</div>
              <div className="text-xs text-muted-foreground">Estimated Band</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-4xl font-bold mb-1 text-foreground">{scoreData.score}<span className="text-muted-foreground text-2xl">/{scoreData.total}</span></div>
              <div className="text-xs text-muted-foreground">Correct Answers</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-4xl font-bold mb-1 text-foreground">{Math.round((scoreData.score / scoreData.total) * 100)}<span className="text-muted-foreground text-2xl">%</span></div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>

          {/* Score bar */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Performance</span>
              <span className={getBandColor(scoreData.band)}>Band {scoreData.band}</span>
            </div>
            <div className="h-2.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(scoreData.score / scoreData.total) * 100}%`,
                  background: scoreData.band >= 7
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : scoreData.band >= 5.5
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #f87171, #ef4444)',
                }}
              />
            </div>
          </div>

          {/* Answer review */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-sm">Answer Review</h3>
            <div className="space-y-3">
              {selected.questions.map((q, i) => {
                const isCorrect = scoreData.results[q.id]
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-md border transition-all ${
                      isCorrect
                        ? 'border-emerald-400/30 bg-emerald-400/5'
                        : 'border-red-400/30 bg-red-400/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1.5">Q{i + 1}. {q.question}</p>
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">
                            Your answer:{' '}
                            <span className={isCorrect ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                              {answers[q.id] || '(blank)'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-xs text-muted-foreground">
                              Correct answer:{' '}
                              <span className="text-foreground font-medium">{q.correctAnswer}</span>
                            </p>
                          )}
                          {!isCorrect && q.explanation && (
                            <p className="text-xs text-muted-foreground italic mt-1 border-t border-border/30 pt-1.5">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Practice Another Section
          </button>
        </div>
      )}
    </div>
  )
}

const LISTENING_TIPS = [
  'Read all questions before pressing play so you know what to listen for.',
  'Write exactly what you hear — do not paraphrase or change spellings.',
  'Sections 3 and 4 are harder — focus on academic vocabulary and speaker positions.',
  'Incorrect spelling counts as a wrong answer in IELTS — proofread before submitting.',
  'Use the preparation time to predict the type of answer needed (number, name, noun phrase).',
  'If you miss an answer, move on immediately — do not dwell on missed questions.',
  'You can replay the audio as many times as needed during practice.',
  'Toggle the transcript if you need to re-read a section you missed.',
]
