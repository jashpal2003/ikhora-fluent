'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'

interface Question {
  id: number
  type: string
  question: string
  options: string[]
  answer: string
  explanation: string
}

export default function ReadingInterface({ passage, questions }: { passage: string; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({})

  const score = submitted
    ? questions.filter((q) => answers[q.id] === q.answer).length
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Passage */}
      <div className="lg:col-span-3">
        <div className="glass-card p-6 sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reading Passage</h2>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Clock className="h-3 w-3" />
              <span>20 min</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Academic Reading · B2 Level</p>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
            {passage.split('\n\n').map((para, i) => (
              <p key={i} className={i === 0 ? 'font-semibold text-foreground' : ''}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="lg:col-span-2 space-y-4">
        {submitted && (
          <div className={`glass-card p-4 text-center border ${score === questions.length ? 'border-emerald-500/30' : score >= questions.length * 0.6 ? 'border-amber-500/30' : 'border-rose-500/30'}`}>
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: score === questions.length ? '#10b981' : score >= questions.length * 0.6 ? '#f59e0b' : '#ef4444' }}>
              {score}/{questions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {score === questions.length ? '🎉 Perfect score!' : score >= questions.length * 0.6 ? '✅ Good work!' : '📚 Keep practicing'}
            </div>
          </div>
        )}

        {questions.map((q) => {
          const isCorrect = submitted && answers[q.id] === q.answer
          const isWrong = submitted && answers[q.id] && answers[q.id] !== q.answer
          return (
            <div key={q.id} className={`glass-card p-5 transition-all ${isCorrect ? 'border-emerald-500/30' : isWrong ? 'border-rose-500/30' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>{q.id}</span>
                <span className="skill-chip">{q.type}</span>
                {isCorrect && <span className="text-emerald-400 text-xs font-medium">✓ Correct</span>}
                {isWrong && <span className="text-rose-400 text-xs font-medium">✗ Incorrect</span>}
              </div>
              <p className="text-sm mb-3 leading-relaxed">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt
                  const isAnswer = submitted && opt === q.answer
                  const isWrongSel = submitted && selected && opt !== q.answer
                  return (
                    <button
                      key={opt}
                      onClick={() => { if (!submitted) setAnswers((a) => ({ ...a, [q.id]: opt })) }}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                        isAnswer ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                        : isWrongSel ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                        : selected ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-300'
                        : 'bg-white/3 border border-border/50 text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {submitted && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowExplanations((s) => ({ ...s, [q.id]: !s[q.id] }))}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {showExplanations[q.id] ? '▲ Hide' : '▼ Show'} explanation
                  </button>
                  {showExplanations[q.id] && (
                    <div className="mt-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Submit Answers ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        ) : (
          <button
            onClick={() => { setSubmitted(false); setAnswers({}); setShowExplanations({}) }}
            className="w-full py-3 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
