'use client'

import { useState, useEffect } from 'react'
import { BookOpen, ChevronRight, Clock, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react'
import type { ReadingPassage, ReadingQuestion } from '@/lib/types'
import { getReadingPassages, getReadingPassageById } from '@/lib/services/questionBankService'
import { scoreReadingAttempt } from '@/lib/services/aiScoringService'
import { savePracticeScore } from '@/lib/services/studentService'
import { useUser } from '@/lib/hooks/useUser'
import { useCallback } from 'react'

// ── TYPES ─────────────────────────────────────────────────

type Step = 'select' | 'read' | 'result'

// ── HELPERS ───────────────────────────────────────────────

function getBandColor(band: number) {
  if (band >= 7) return 'text-emerald-400'
  if (band >= 5.5) return 'text-amber-400'
  return 'text-red-400'
}

const Q_TYPE_LABELS: Record<string, string> = {
  true_false_not_given: 'True / False / Not Given',
  mcq: 'Multiple Choice',
  sentence_completion: 'Sentence Completion',
  matching_headings: 'Matching Headings',
  short_answer: 'Short Answer',
  note_completion: 'Note Completion',
}

// ── MAIN PAGE ─────────────────────────────────────────────

export default function ReadingPracticePage() {
  const { profile } = useUser()
  const [step, setStep] = useState<Step>('select')
  const [passages, setPassages] = useState<ReadingPassage[]>([])
  const [selected, setSelected] = useState<ReadingPassage | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [scoreData, setScoreData] = useState<{ score: number; total: number; band: number; results: Record<string, boolean> } | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [notAllAnswered, setNotAllAnswered] = useState(false)

  useEffect(() => {
    setPassages(getReadingPassages({ status: 'published' }))
  }, [])

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const handleSelectPassage = (p: ReadingPassage) => {
    setSelected(p)
    setAnswers({})
    setSubmitted(false)
    setScoreData(null)
    setTimeLeft(p.timeLimitMinutes * 60)
    setTimerActive(true)
    setStep('read')
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setNotAllAnswered(false)
  }

  const handleSubmit = useCallback((forceSubmit = false) => {
    if (!selected) return
    const answered = selected.questions.filter((q) => answers[q.id]?.trim())
    if (!forceSubmit && answered.length < selected.questions.length) {
      setNotAllAnswered(true)
      return
    }
    setTimerActive(false)
    const score = scoreReadingAttempt(selected.questions, answers)

    savePracticeScore({
      userId: profile?.id ?? '00000000-0000-0000-0000-000000000000',
      skill: 'reading',
      score: score.score,
      band: score.band,
      durationSeconds: selected.timeLimitMinutes * 60 - timeLeft,
    })

    setScoreData(score)
    setSubmitted(true)
    setStep('result')
  }, [selected, answers, timeLeft, profile])

  // Auto-submit when timer runs out
  useEffect(() => {
    if (step === 'read' && timeLeft === 0 && timerActive && selected) {
      handleSubmit(true)
    }
  }, [timeLeft, timerActive, step, selected, handleSubmit])

  const handleReset = () => {
    setStep('select')
    setSelected(null)
    setAnswers({})
    setSubmitted(false)
    setScoreData(null)
    setTimerActive(false)
  }

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="animate-fade-up max-w-5xl">
      <div className="page-header">
        <h1>IELTS Reading Practice</h1>
        <p>Read authentic passages and answer questions across all IELTS question types.</p>
      </div>

      {/* ── SELECT ── */}
      {step === 'select' && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">{passages.length} passages available</div>
          {passages.length === 0 && (
            <div className="glass-card p-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No passages available yet.</p>
            </div>
          )}
          {passages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPassage(p)}
              className="glass-card-hover p-5 text-left w-full group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="skill-chip">{p.cefrLevel}</span>
                    <span className="skill-chip">{p.topic}</span>
                    <span className="text-xs text-muted-foreground">{p.questions.length} questions</span>
                    <span className="text-xs text-muted-foreground">· {p.timeLimitMinutes} min</span>
                  </div>
                  <h3 className="text-base font-semibold group-hover:text-foreground transition-colors mb-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.text.slice(0, 150)}...</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground flex-shrink-0 mt-2" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── READ ── */}
      {step === 'read' && selected && (
        <div className="space-y-6">
          {/* Timer bar */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="skill-chip">{selected.cefrLevel}</span>
              <span className="text-sm font-semibold">{selected.title}</span>
            </div>
            <div className={`flex items-center gap-2 font-mono text-sm font-bold ${timeLeft < 300 ? 'text-amber-400' : 'text-muted-foreground'}`}>
              <Clock className="h-4 w-4" />
              {formatTimer(timeLeft)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passage */}
            <div className="glass-card p-6 h-fit">
              <h2 className="text-base font-bold mb-4">{selected.title}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line max-h-[60vh] overflow-y-auto pr-2">
                {selected.text}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-5">
              {selected.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i + 1}
                  answer={answers[q.id] ?? ''}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                  submitted={submitted}
                  isCorrect={submitted && scoreData ? scoreData.results[q.id] : undefined}
                />
              ))}

              {notAllAnswered && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Please answer all questions before submitting.
                </div>
              )}

              <button
                onClick={() => handleSubmit()}
                className="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Submit Answers
              </button>
            </div>
          </div>
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
              <div className="text-xs text-muted-foreground">Questions Correct</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-4xl font-bold mb-1">{Math.round((scoreData.score / scoreData.total) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>

          {/* Question review */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Answer Review</h3>
            <div className="space-y-4">
              {selected.questions.map((q, i) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-md border ${scoreData.results[q.id] ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-red-400/30 bg-red-400/5'}`}
                >
                  <div className="flex items-start gap-3">
                    {scoreData.results[q.id] ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">Q{i + 1}. {q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Your answer: <span className={scoreData.results[q.id] ? 'text-emerald-400' : 'text-red-400'}>{answers[q.id] || '(none)'}</span>
                      </p>
                      {!scoreData.results[q.id] && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct answer: <span className="text-foreground">{q.correctAnswer}</span>
                        </p>
                      )}
                      {q.explanation && !scoreData.results[q.id] && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>
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
            Practice Another Passage
          </button>
        </div>
      )}
    </div>
  )
}

// ── QUESTION CARD ─────────────────────────────────────────

function QuestionCard({
  question, index, answer, onChange, submitted, isCorrect,
}: {
  question: ReadingQuestion
  index: number
  answer: string
  onChange: (val: string) => void
  submitted: boolean
  isCorrect?: boolean
}) {
  return (
    <div className={`glass-card p-4 ${submitted ? (isCorrect ? 'border-emerald-400/20' : 'border-red-400/20') : ''}`}>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xs text-muted-foreground font-mono w-5 flex-shrink-0">{index}.</span>
        <div>
          <span className="skill-chip mb-1.5 inline-block">{Q_TYPE_LABELS[question.type] ?? question.type}</span>
          <p className="text-sm text-foreground leading-relaxed">{question.question}</p>
        </div>
      </div>

      {question.type === 'true_false_not_given' && (
        <div className="flex gap-2 flex-wrap pl-7">
          {['True', 'False', 'Not Given'].map((opt) => (
            <button
              key={opt}
              onClick={() => !submitted && onChange(opt)}
              disabled={submitted}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                answer === opt
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              } disabled:cursor-default`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'mcq' && question.options && (
        <div className="space-y-1.5 pl-7">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => !submitted && onChange(opt)}
              disabled={submitted}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all border ${
                answer === opt
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              } disabled:cursor-default`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {['short_answer', 'sentence_completion', 'note_completion', 'matching_headings'].includes(question.type) && (
        <div className="pl-7 mt-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            disabled={submitted}
            placeholder="Type your answer..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground disabled:cursor-default transition-all"
          />
        </div>
      )}
    </div>
  )
}
