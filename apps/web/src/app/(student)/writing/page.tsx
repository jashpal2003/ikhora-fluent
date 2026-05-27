'use client'

import { useState, useEffect, useRef } from 'react'
import { PenTool, ChevronDown, RefreshCw, AlertCircle, CheckCircle2, Loader2, Save, Send, Hash } from 'lucide-react'
import type { WritingTask, ScoreReport, TaskType } from '@/lib/types'
import { getWritingTasks, getWritingTaskById } from '@/lib/services/questionBankService'
import { scoreWritingSubmission } from '@/lib/services/aiScoringService'

// ── TYPES ─────────────────────────────────────────────────

type Step = 'select' | 'write' | 'processing' | 'result'

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  ACADEMIC_TASK_1: 'Academic Task 1',
  ACADEMIC_TASK_2: 'Academic Task 2',
  GENERAL_TASK_1: 'General Task 1',
  GENERAL_TASK_2: 'General Task 2',
}

const TASK_TYPES: TaskType[] = ['ACADEMIC_TASK_1', 'ACADEMIC_TASK_2', 'GENERAL_TASK_1', 'GENERAL_TASK_2']

// ── HELPERS ───────────────────────────────────────────────

function getBandColor(band: number): string {
  if (band >= 7) return 'text-emerald-400'
  if (band >= 5.5) return 'text-amber-400'
  return 'text-red-400'
}

// ── MAIN PAGE ─────────────────────────────────────────────

export default function WritingCoachPage() {
  const [step, setStep] = useState<Step>('select')
  const [activeTaskType, setActiveTaskType] = useState<TaskType>('ACADEMIC_TASK_2')
  const [tasks, setTasks] = useState<WritingTask[]>([])
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [savedDraft, setSavedDraft] = useState(false)
  const [result, setResult] = useState<ScoreReport | null>(null)
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'feedback' | 'improved'>('overview')
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length
  const minWords = selectedTask?.minWords ?? (activeTaskType.includes('TASK_1') ? 150 : 250)
  const isBelowMin = wordCount < minWords && wordCount > 0

  // Load tasks when task type changes
  useEffect(() => {
    setLoadingTasks(true)
    const fetched = getWritingTasks({ taskType: activeTaskType, status: 'published' })
    setTasks(fetched)
    setLoadingTasks(false)
  }, [activeTaskType])

  // Auto-save draft
  useEffect(() => {
    if (answerText.length > 50) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        setSavedDraft(true)
        setTimeout(() => setSavedDraft(false), 2000)
      }, 2000)
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [answerText])

  const handleSelectTask = (task: WritingTask) => {
    setSelectedTask(task)
    setAnswerText('')
    setResult(null)
    setStep('write')
  }

  const handleNextTask = () => {
    const filtered = tasks.filter((t) => t.id !== selectedTask?.id)
    if (filtered.length > 0) {
      const next = filtered[Math.floor(Math.random() * filtered.length)]
      setSelectedTask(next)
      setAnswerText('')
      setResult(null)
    }
  }

  const handleSubmit = async () => {
    if (!selectedTask || wordCount < 30) return
    setStep('processing')
    setSubmissionError(null)
    try {
      const report = await scoreWritingSubmission({
        submissionId: `sub-${Date.now()}`,
        taskType: selectedTask.taskType,
        prompt: selectedTask.prompt,
        answerText,
        wordCount,
      })
      setResult(report)
      setStep('result')
    } catch (e) {
      setSubmissionError('Scoring failed. Please try again.')
      setStep('write')
    }
  }

  const handleReset = () => {
    setStep('select')
    setSelectedTask(null)
    setAnswerText('')
    setResult(null)
    setSubmissionError(null)
  }

  return (
    <div className="animate-fade-up max-w-5xl">
      <div className="page-header">
        <h1>IELTS Writing Coach</h1>
        <p>Practice all four writing task types with AI scoring based on official IELTS criteria.</p>
      </div>

      {/* ── STEP: SELECT ── */}
      {step === 'select' && (
        <div className="space-y-6">
          {/* Task type selector */}
          <div className="glass-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              {TASK_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTaskType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTaskType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {TASK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <div className="mt-3 px-1 text-xs text-muted-foreground">
              {activeTaskType === 'ACADEMIC_TASK_1' && 'Minimum 150 words · Describe a chart, diagram, map, or process · 20 minutes recommended'}
              {activeTaskType === 'ACADEMIC_TASK_2' && 'Minimum 250 words · Essay: opinion, discussion, problem-solution · 40 minutes recommended'}
              {activeTaskType === 'GENERAL_TASK_1' && 'Minimum 150 words · Formal, semi-formal, or informal letter · 20 minutes recommended'}
              {activeTaskType === 'GENERAL_TASK_2' && 'Minimum 250 words · Essay on a general topic · 40 minutes recommended'}
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {tasks.length} tasks available
              </h2>
            </div>

            {loadingTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                    <div className="h-3 w-full bg-white/5 rounded mb-2" />
                    <div className="h-3 w-4/5 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <PenTool className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No tasks available for this type yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className="glass-card-hover p-5 text-left w-full group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="skill-chip">{task.topic}</span>
                          <span className="text-xs text-muted-foreground">{task.cefrLevel}</span>
                          <span className="text-xs text-muted-foreground">· {task.minWords}+ words · {task.suggestedMinutes}min</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors">
                          {task.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: WRITE ── */}
      {step === 'write' && selectedTask && (
        <div className="space-y-5">
          {/* Task prompt */}
          <div className="glass-card p-6 border-l-2 border-foreground/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="skill-chip">{TASK_TYPE_LABELS[selectedTask.taskType]}</span>
                <span className="text-xs text-muted-foreground">{selectedTask.topic}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNextTask}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Next task
                </button>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line">{selectedTask.prompt}</p>
            {selectedTask.imageNote && (
              <div className="mt-4 p-3 rounded-md bg-secondary border border-border text-xs text-muted-foreground italic">
                {selectedTask.imageNote}
              </div>
            )}
          </div>

          {/* Answer editor */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Answer</span>
              <div className="flex items-center gap-3">
                {savedDraft && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Draft saved
                  </span>
                )}
                <div className={`flex items-center gap-1 text-xs font-mono tabular-nums ${isBelowMin ? 'text-amber-400' : wordCount >= minWords ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  <Hash className="h-3 w-3" />
                  {wordCount} / {minWords}
                </div>
              </div>
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full min-h-80 resize-none bg-transparent p-5 text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Validation warning */}
          {isBelowMin && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>You need at least {minWords - wordCount} more words to meet the minimum requirement.</span>
            </div>
          )}

          {submissionError && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {submissionError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={wordCount < 30}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Submit for AI Scoring
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: PROCESSING ── */}
      {step === 'processing' && (
        <div className="glass-card p-14 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full border-2 border-border border-t-foreground animate-spin mb-6" />
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Analyzing your writing...
          </h3>
          <div className="space-y-1.5 text-sm text-muted-foreground max-w-xs">
            <p>Scoring Task Response and Task Achievement</p>
            <p>Checking Coherence and Cohesion</p>
            <p>Analyzing Lexical Resource</p>
            <p>Checking Grammatical Range and Accuracy</p>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-5">Powered by Azure OpenAI GPT-5 mini</p>
        </div>
      )}

      {/* ── STEP: RESULT ── */}
      {step === 'result' && result && (
        <div className="space-y-6 animate-fade-up">
          {/* Score overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 text-center">
              {/* AI Source Badge */}
              {(result as ScoreReport & { _source?: string })._source === 'azure-openai' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-medium mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Scored by Azure OpenAI GPT-5.4-mini
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Mock estimate — AI unavailable
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-2">Estimated Writing Band</p>
              <div
                className={`text-7xl font-bold mb-2 ${getBandColor(result.overallBand)}`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {result.overallBand}
              </div>
              {result.teacherReviewed && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mt-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Teacher reviewed — Final Band: {result.finalBand}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</p>
            </div>


            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 text-sm">Criterion Scores</h3>
              <div className="space-y-3">
                {result.criteria.map((c) => (
                  <div key={c.criterionId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{c.criterionLabel}</span>
                      <div className="flex items-center gap-2">
                        {c.teacherScore !== undefined && (
                          <span className="text-xs text-emerald-400">T: {c.teacherScore}</span>
                        )}
                        <span className={`text-sm font-bold tabular-nums ${getBandColor(c.aiScore)}`}>
                          {c.aiScore}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground/50"
                        style={{ width: `${(c.aiScore / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback tabs */}
          <div className="glass-card overflow-hidden">
            <div className="flex border-b border-border/50">
              {(['overview', 'feedback', 'improved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveResultTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${
                    activeResultTab === tab
                      ? 'border-b-2 border-foreground text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' : tab === 'feedback' ? 'Sentence Feedback' : 'Model Answer'}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeResultTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Strengths</h4>
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Areas to Improve</h4>
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeResultTab === 'feedback' && result.sentenceFeedback && (
                <div className="space-y-4">
                  {result.sentenceFeedback.map((item, i) => (
                    <div key={i} className="rounded-md border border-border/50 overflow-hidden">
                      <div className="p-3 bg-red-400/5 border-b border-border/30">
                        <p className="text-sm text-red-400/80 font-mono">"{item.original}"</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.issue}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-emerald-400 font-mono">"{item.suggestion}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeResultTab === 'improved' && (
                <div className="p-4 rounded-md bg-secondary border border-border text-sm leading-relaxed text-muted-foreground">
                  {result.modelAnswer ?? result.improvedVersion ?? 'Model answer will be available here.'}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {result.nextPractice.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3">Recommended Next Practice</h3>
              <div className="flex flex-wrap gap-2">
                {result.nextPractice.map((r, i) => (
                  <span key={i} className="skill-chip">{r}</span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            Practice Another Task
          </button>
        </div>
      )}
    </div>
  )
}
