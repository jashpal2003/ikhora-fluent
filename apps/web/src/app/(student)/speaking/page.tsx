'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { SpeakingPrompt, ScoreReport } from '@/lib/types'
import { getSpeakingPromptsByPart } from '@/lib/services/questionBankService'
import { scoreSpeakingSubmission } from '@/lib/services/aiScoringService'
import { savePracticeScore } from '@/lib/services/studentService'
import { useUser } from '@/lib/hooks/useUser'

type Step = 'select' | 'record' | 'processing' | 'result'
type Part = 1 | 2 | 3

// @ts-ignore
const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

function getBandColor(band: number) {
  if (band >= 7) return 'text-emerald-400'
  if (band >= 5.5) return 'text-amber-400'
  return 'text-red-400'
}

export default function SpeakingPracticePage() {
  const { profile } = useUser()
  const [step, setStep] = useState<Step>('select')
  const [part, setPart] = useState<Part>(1)
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [result, setResult] = useState<ScoreReport | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'pronunciation' | 'transcript'>('overview')
  const [transcript, setTranscript] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  // Load prompts when part changes
  useEffect(() => {
    setPrompts(getSpeakingPromptsByPart(part))
  }, [part])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const startRecording = () => {
    setRecording(true)
    setRecordingTime(0)
    setTranscript('')
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onresult = (event: any) => {
        let currentTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setTranscript(currentTranscript)
      }
      recognition.start()
      recognitionRef.current = recognition
    } else {
      setTranscript("Your browser doesn't support SpeechRecognition. Please use Chrome/Edge for voice recording.")
    }
  }

  const stopRecording = async () => {
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setStep('processing')
    const report = await scoreSpeakingSubmission({
      submissionId: `sub-sp-${Date.now()}`,
      part,
      question: selectedPrompt?.question ?? '',
      durationSeconds: recordingTime,
      transcript: transcript || 'No speech detected.',
    })
    
    // Save the score asynchronously
    savePracticeScore({
      userId: profile?.id ?? '00000000-0000-0000-0000-000000000000',
      skill: 'speaking',
      score: report.finalBand,
      band: report.overallBand,
      durationSeconds: recordingTime
    })
    
    setResult(report)
    setStep('result')
  }

  const handleReset = () => {
    setStep('select')
    setResult(null)
    setRecordingTime(0)
    setTranscript('')
    setSelectedPrompt(null)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="page-header">
        <h1>IELTS Speaking Practice</h1>
        <p>Record your speaking answers and receive AI-estimated band scores with fluency, pronunciation and grammar feedback.</p>
      </div>

      {/* Part selector */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Select part:</span>
          {([1, 2, 3] as Part[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPart(p); setSelectedPrompt(null); setStep('select'); setResult(null) }}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                part === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              Part {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {part === 1 && 'Personal questions about familiar topics. Answer in full sentences. 4–5 minutes.'}
          {part === 2 && '2 minutes to talk on a topic using a cue card. 1 minute preparation time.'}
          {part === 3 && 'Discussion questions related to the Part 2 topic. More abstract and detailed. 4–5 minutes.'}
        </p>
      </div>

      {/* Prompt selection */}
      {step === 'select' && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {prompts.length} prompts available — Part {part}
          </div>
          {prompts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Mic className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No prompts available for this part yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => { setSelectedPrompt(prompt); setStep('record') }}
                  className="glass-card-hover p-5 text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="skill-chip">{prompt.topic}</span>
                    {part === 2 && prompt.timeSeconds && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(prompt.timeSeconds / 60)} min
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    {prompt.question}
                  </p>
                  {prompt.cueCardPoints && (
                    <ul className="mt-2 space-y-0.5">
                      {prompt.cueCardPoints.map((pt) => (
                        <li key={pt} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {prompt.followUp && (
                    <p className="text-xs text-muted-foreground mt-2 italic border-t border-border/40 pt-2">
                      Follow-up: {prompt.followUp}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recording */}
      {step === 'record' && selectedPrompt && (
        <div className="space-y-6">
          {/* Prompt */}
          <div className="glass-card p-6 border-l-2 border-foreground/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="skill-chip">Part {part}</span>
                <span className="skill-chip">{selectedPrompt.topic}</span>
              </div>
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Back
              </button>
            </div>
            <p className="text-sm leading-relaxed">{selectedPrompt.question}</p>
            {selectedPrompt.cueCardPoints && (
              <div className="mt-3 p-3 rounded-md bg-secondary border border-border text-xs text-muted-foreground">
                {selectedPrompt.cueCardPoints.map((pt) => (
                  <div key={pt} className="flex items-start gap-2 mb-1">
                    <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                    {pt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recorder */}
          <div className="glass-card p-8 flex flex-col items-center">
            <div className="relative mb-6">
              {recording && (
                <>
                  <div className="absolute -inset-4 rounded-full bg-red-500/10 animate-ping" />
                  <div className="absolute -inset-8 rounded-full bg-red-500/5 animate-ping" style={{ animationDelay: '0.3s' }} />
                </>
              )}
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  recording
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                    : 'bg-primary hover:bg-primary/90 shadow-lg shadow-foreground/10 hover:scale-105'
                }`}
              >
                {recording ? (
                  <Square className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                ) : (
                  <Mic className="h-8 w-8 text-primary-foreground" />
                )}
              </button>
            </div>

            <div className="text-center mb-6">
              {recording ? (
                <>
                  <div className="text-2xl font-mono font-bold text-red-400 mb-1">{formatTime(recordingTime)}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    Recording — click to stop
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Ready to record
                  </div>
                  <div className="text-sm text-muted-foreground">Click the microphone to start your answer</div>
                </>
              )}
            </div>

            {transcript && (
              <div className="w-full max-w-lg mt-4 p-4 rounded-md bg-secondary/50 border border-border text-sm italic text-muted-foreground leading-relaxed h-32 overflow-y-auto">
                {transcript}
              </div>
            )}


            <div className="mt-6 flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Audio stays private
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Browser recording only
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="glass-card p-14 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full border-2 border-border border-t-foreground animate-spin mb-6" />
          <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Analyzing your speaking...
          </h3>
          <div className="space-y-1.5 text-sm text-muted-foreground max-w-xs">
            <p>Transcribing audio...</p>
            <p>Calculating fluency metrics...</p>
            <p>Scoring with IELTS rubric...</p>
            <p>Detecting pronunciation issues...</p>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-5">Powered by Azure OpenAI GPT-5 mini</p>
        </div>
      )}

      {/* Result */}
      {step === 'result' && result && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall band */}
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Estimated Speaking Band</p>
              <div className={`text-7xl font-bold mb-2 ${getBandColor(result.overallBand)}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {result.overallBand}
              </div>
              <p className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</p>
            </div>

            {/* Metrics */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 text-sm">Fluency Metrics</h3>
              {result.metrics && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Duration', value: `${result.metrics.duration}s` },
                    { label: 'Words/Min', value: String(result.metrics.wpm) },
                    { label: 'Filler Words', value: String(result.metrics.fillerWords) },
                    { label: 'Long Pauses', value: String(result.metrics.longPauses) },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-md border border-border/50">
                      <div className="text-xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.value}</div>
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Criterion scores */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-sm">Criterion Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {result.criteria.map((c) => (
                <div key={c.criterionId} className="text-center p-4 rounded-md border border-border/50">
                  <div className={`text-3xl font-bold mb-1 ${getBandColor(c.aiScore)}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {c.aiScore}
                  </div>
                  <div className="text-xs text-muted-foreground leading-tight">{c.criterionLabel}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card overflow-hidden">
            <div className="flex border-b border-border/50">
              {(['overview', 'pronunciation', 'transcript'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab === 'overview' ? 'Overview' : tab === 'pronunciation' ? 'Pronunciation' : 'Transcript'}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Strengths</h4>
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />{s}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Areas to Improve</h4>
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />{w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'pronunciation' && result.wordLevelIssues && (
                <div>
                  {result.pronunciationFeedback && (
                    <div className="mb-4 p-4 rounded-md bg-secondary border border-border text-sm text-muted-foreground">
                      {result.pronunciationFeedback}
                    </div>
                  )}
                  <h4 className="text-sm font-semibold mb-3">Word-Level Issues</h4>
                  <div className="space-y-2">
                    {result.wordLevelIssues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-md border border-border/50 text-sm">
                        <code className="text-red-400 font-mono">{issue.word}</code>
                        <span className="text-muted-foreground text-xs">— {issue.issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'transcript' && (
                <div className="p-4 rounded-md bg-secondary border border-border text-sm leading-relaxed text-muted-foreground italic">
                  Transcript will appear here after Azure Speech Services integration.
                </div>
              )}
            </div>
          </div>

          {result.nextPractice.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3">Recommended Next Practice</h3>
              <div className="flex flex-wrap gap-2">
                {result.nextPractice.map((r, i) => <span key={i} className="skill-chip">{r}</span>)}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            Practice Another Prompt
          </button>
        </div>
      )}
    </div>
  )
}
