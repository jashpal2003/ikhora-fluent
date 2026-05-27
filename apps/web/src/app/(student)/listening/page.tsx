'use client'

import { useState, useEffect } from 'react'
import { Headphones, CheckCircle2, AlertCircle, RotateCcw, Volume2, VolumeX, Clock, ChevronRight } from 'lucide-react'
import type { ListeningSection } from '@/lib/types'
import { getListeningSections } from '@/lib/services/questionBankService'
import { scoreListeningAttempt } from '@/lib/services/aiScoringService'
import { savePracticeScore } from '@/lib/services/studentService'

// ── TYPES ─────────────────────────────────────────────────

type Step = 'select' | 'listen' | 'result'

// ── HELPERS ───────────────────────────────────────────────

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

const AUDIO_STATUS_INFO: Record<string, { label: string; color: string }> = {
  available: { label: 'Audio available', color: 'text-emerald-400' },
  pending: { label: 'Audio pending — question-only mode', color: 'text-amber-400' },
  unavailable: { label: 'Audio unavailable', color: 'text-muted-foreground' },
}

// ── MAIN PAGE ─────────────────────────────────────────────

export default function ListeningPracticePage() {
  const [step, setStep] = useState<Step>('select')
  const [sections, setSections] = useState<ListeningSection[]>([])
  const [selected, setSelected] = useState<ListeningSection | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [scoreData, setScoreData] = useState<{ score: number; total: number; band: number; results: Record<string, boolean> } | null>(null)
  const [notAllAnswered, setNotAllAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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

  const handleSubmit = () => {
    if (!selected) return
    const answered = selected.questions.filter((q) => answers[q.id]?.trim())
    if (answered.length < selected.questions.length) {
      setNotAllAnswered(true)
      return
    }
    setTimerActive(false)
    const score = scoreListeningAttempt(selected.questions, answers)
    
    // Save the score asynchronously
    savePracticeScore({
      userId: '00000000-0000-0000-0000-000000000000', // Mock UUID for now
      skill: 'listening',
      score: score.score,
      band: score.band,
      durationSeconds: selected.timeLimitSeconds - timeLeft
    })

    setScoreData(score)
    setStep('result')
  }

  const handleReset = () => {
    setStep('select')
    setSelected(null)
    setAnswers({})
    setScoreData(null)
    setTimerActive(false)
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const playAudio = () => {
    if (!selected || typeof window === 'undefined') return
    
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    const textToSpeak = `Section ${selected.sectionNumber}. ${selected.title}. ${selected.topic}. ` + 
      selected.questions.map((q, i) => `Question ${i + 1}. ${q.question}`).join('. ')

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = 0.9
    utterance.pitch = 1
    
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    setIsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="page-header">
        <h1>Listening Practice</h1>
        <p>Practice all four IELTS listening sections with authentic question types and answer review.</p>
      </div>

      {/* ── SELECT ── */}
      {step === 'select' && (
        <div className="space-y-5">
          {/* Audio status notice */}
          <div className="glass-card p-4 border-l-2 border-amber-400/50">
            <div className="flex items-start gap-3">
              <VolumeX className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Audio integration in progress</p>
                <p className="text-sm text-muted-foreground mt-1">
                  IELTS-style audio tracks are being prepared by the content team and will be available soon.
                  In the meantime, you can practice answering questions in question-only mode.
                </p>
              </div>
            </div>
          </div>

          {/* Section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => {
              const statusInfo = AUDIO_STATUS_INFO[section.audioStatus]
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelect(section)}
                  className="glass-card-hover p-5 text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {section.sectionNumber}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Section {section.sectionNumber}</div>
                        <div className="text-xs text-muted-foreground">{section.cefrLevel}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="skill-chip">{section.questions.length} Qs</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 group-hover:text-foreground transition-colors">{section.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{section.topic}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={statusInfo.color}>{statusInfo.label}</span>
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

          {/* Listening tips */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 text-sm">Listening Exam Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LISTENING_TIPS.map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LISTEN ── */}
      {step === 'listen' && selected && (
        <div className="space-y-5">
          {/* Header bar */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-sm font-bold">
                {selected.sectionNumber}
              </div>
              <div>
                <div className="text-sm font-medium">{selected.title}</div>
                <div className="text-xs text-muted-foreground">{selected.topic}</div>
              </div>
            </div>
            <div className={`font-mono text-sm font-bold flex items-center gap-1.5 ${timeLeft < 120 ? 'text-amber-400' : 'text-muted-foreground'}`}>
              <Clock className="h-4 w-4" />
              {formatTimer(timeLeft)}
            </div>
          </div>

          {/* Audio player */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={playAudio}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isPlaying 
                      ? 'bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <div className="text-sm font-medium">
                  {isPlaying ? 'Playing Audio...' : 'Play Scenario Audio'}
                </div>
              </div>
              
              {isPlaying && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-3 w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Questions — Section {selected.sectionNumber}
            </div>
            {selected.questions.map((q, i) => (
              <div key={q.id} className="glass-card p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xs text-muted-foreground font-mono">{i + 1}.</span>
                  <div>
                    <span className="skill-chip mb-1.5 inline-block">{Q_TYPE_LABELS[q.type] ?? q.type}</span>
                    <p className="text-sm leading-relaxed">{q.question}</p>
                  </div>
                </div>

                {q.type === 'mcq' && q.options && (
                  <div className="space-y-1.5 pl-5">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border ${
                          answers[q.id] === opt
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type !== 'mcq' && (
                  <input
                    type="text"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full ml-5 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all"
                  />
                )}
              </div>
            ))}
          </div>

          {notAllAnswered && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Please answer all questions before submitting.
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Submit Answers
          </button>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && selected && scoreData && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-5 text-center">
              <div className={`text-4xl font-bold mb-1 ${getBandColor(scoreData.band)}`}>{scoreData.band}</div>
              <div className="text-xs text-muted-foreground">Estimated Band</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-4xl font-bold mb-1">{scoreData.score}/{scoreData.total}</div>
              <div className="text-xs text-muted-foreground">Marks Earned</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-4xl font-bold mb-1">{Math.round((scoreData.score / scoreData.total) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Answer Review</h3>
            <div className="space-y-3">
              {selected.questions.map((q, i) => (
                <div
                  key={q.id}
                  className={`p-3 rounded-md border ${scoreData.results[q.id] ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-red-400/30 bg-red-400/5'}`}
                >
                  <div className="flex items-start gap-2">
                    {scoreData.results[q.id] ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium mb-0.5">Q{i + 1}. {q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Your answer: <span className={scoreData.results[q.id] ? 'text-emerald-400' : 'text-red-400'}>{answers[q.id] || '(none)'}</span>
                      </p>
                      {!scoreData.results[q.id] && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Correct: <span className="text-foreground">{q.correctAnswer}</span>
                        </p>
                      )}
                      {!scoreData.results[q.id] && q.explanation && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2"
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
  'Read all questions before the audio plays so you know what to listen for.',
  'Write exactly what you hear — do not paraphrase or change spellings.',
  'Sections 3 and 4 are harder — focus on academic vocabulary and speaker agreement/disagreement.',
  'Check spelling carefully — incorrect spelling counts as a wrong answer in IELTS.',
  'Use the preparation time to predict the type of answer needed (number, name, noun phrase).',
  'If you miss an answer, move on immediately — do not dwell on missed questions.',
]
