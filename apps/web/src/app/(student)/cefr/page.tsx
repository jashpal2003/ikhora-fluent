'use client'

import { useState } from 'react'
import {
  AlertCircle, CheckCircle2, Loader2, Copy, CheckCheck,
  ChevronDown, ChevronUp, BookOpen, Zap, AlignLeft, HelpCircle,
} from 'lucide-react'
import type { CEFRLevel, CEFRCheckerResult, CEFRAdaptorResult, ReadabilityResult, QuestionGeneratorResult } from '@/lib/types'
import { analyzeCEFRLevel, adaptTextToLevel, checkReadability, generateQuestions } from '@/lib/services/aiCefrService'

// ── CONSTANTS ─────────────────────────────────────────────

type Tool = 'checker' | 'adaptor' | 'readability' | 'questions'

const TOOLS: Array<{ id: Tool; label: string; icon: typeof BookOpen; description: string }> = [
  { id: 'checker', label: 'CEFR Checker', icon: BookOpen, description: 'Paste any text and get an AI-estimated CEFR level with detailed evidence — sentence complexity, vocabulary range, academic register, and lexical diversity.' },
  { id: 'adaptor', label: 'Level Adaptor', icon: Zap, description: 'Paste text and choose a target CEFR level. The tool rewrites the passage to match that level while preserving the original meaning.' },
  { id: 'readability', label: 'Readability', icon: AlignLeft, description: 'Get a full readability profile: Flesch score, sentence length, word complexity, lexical diversity, and academic vocabulary percentage.' },
  { id: 'questions', label: 'Q Generator', icon: HelpCircle, description: 'Paste any approved passage to generate reading comprehension questions for True/False/Not Given, MCQ, Short Answer, and Sentence Completion.' },
]

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CEFR_META: Record<CEFRLevel, { label: string; sub: string; color: string; bg: string }> = {
  A1: { label: 'A1', sub: 'Beginner', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/25' },
  A2: { label: 'A2', sub: 'Elementary', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25' },
  B1: { label: 'B1', sub: 'Intermediate', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/25' },
  B2: { label: 'B2', sub: 'Upper-Int.', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  C1: { label: 'C1', sub: 'Advanced', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25' },
  C2: { label: 'C2', sub: 'Proficient', color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/25' },
}

const SAMPLE_TEXTS: Record<Tool, Array<{ label: string; text: string }>> = {
  checker: [
    { label: 'Academic (C1)', text: 'The proliferation of digital technologies has fundamentally reconfigured the epistemological landscape of contemporary scholarship. Researchers now navigate an unprecedented volume of information, necessitating sophisticated strategies for critical evaluation and synthesis. This transformation, while facilitating access to diverse intellectual traditions, simultaneously challenges established conventions of academic rigour and citation practice.' },
    { label: 'General (B2)', text: 'Many scientists believe that climate change is the greatest challenge facing humanity in the twenty-first century. Governments around the world are under increasing pressure to reduce carbon emissions and invest in renewable energy sources. However, achieving meaningful progress requires cooperation across national borders, which has proved difficult in practice.' },
    { label: 'Simple (B1)', text: 'Nowadays, more and more people are using social media every day. It is a good way to stay in touch with friends and family. However, some people spend too much time on their phones. This can be bad for their health and relationships. We should try to use technology in a balanced way.' },
  ],
  adaptor: [
    { label: 'Complex passage', text: 'The implementation of renewable energy infrastructure necessitates comprehensive investment in grid modernisation and energy storage solutions to accommodate the intermittent nature of solar and wind generation.' },
    { label: 'Academic paragraph', text: 'Behavioural economics has demonstrated that individuals systematically deviate from the predictions of rational choice theory, exhibiting cognitive biases such as loss aversion, anchoring, and status quo preference.' },
    { label: 'B2 essay opening', text: 'Urban farming has emerged as a significant response to the challenges of food security and environmental sustainability in modern cities, offering benefits that extend beyond direct food production.' },
  ],
  readability: [
    { label: 'News article', text: 'Scientists have discovered that regular exercise can significantly improve mental health. A study involving over 10,000 participants found that people who exercised at least three times per week reported lower levels of anxiety and depression. The research suggests that even moderate physical activity, such as a 30-minute walk, can have measurable effects on mood and cognitive function.' },
    { label: 'Academic text', text: 'The epistemological implications of artificial intelligence for scientific methodology are multifaceted and require systematic evaluation. Machine learning algorithms, trained on vast datasets, have demonstrated capacity to identify patterns that elude conventional statistical approaches, yet the interpretability of these models remains a fundamental challenge for scientific transparency.' },
    { label: 'Simple text', text: 'Dogs are popular pets. They are friendly and loyal. People like dogs because they are good company. Dogs need food and water every day. They also need exercise. Many people walk their dogs in the park. Dogs can learn many things if you train them well.' },
  ],
  questions: [
    { label: 'Urban farming', text: 'Urban farming — the practice of growing food within city boundaries — has undergone a remarkable transformation in recent decades. Once considered a fringe activity, it has emerged as a serious response to the challenges of food security and environmental sustainability. Studies in North American and European cities have shown that urban farms can supply meaningful proportions of a neighbourhood\'s vegetable requirements, particularly for leafy greens and herbs.' },
    { label: 'Sleep science', text: 'Scientists have identified two main stages of sleep: REM and non-REM sleep. During the deepest stage of non-REM sleep, the body carries out essential repair work, producing growth hormones and strengthening the immune system. REM sleep, which typically occupies around 20 to 25 percent of total sleep time in adults, plays a critical role in consolidating memories and supporting emotional regulation.' },
    { label: 'Remote work', text: 'When millions of workers worldwide shifted to remote working during the pandemic, many predicted a permanent transformation in the nature of employment. Several years on, the picture is more complicated. Research on productivity has produced mixed results: some studies show that remote workers complete tasks more efficiently, while others suggest that team creativity and problem-solving may decline when people work in isolation.' },
  ],
}

// ── CEFR SCALE COMPONENT ─────────────────────────────────

function CEFRScale({ highlight }: { highlight?: CEFRLevel }) {
  return (
    <div className="mt-6 pt-5 border-t border-border/50">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">CEFR Reference Scale</div>
      <div className="flex gap-1.5">
        {CEFR_LEVELS.map((lvl) => {
          const meta = CEFR_META[lvl]
          const isHighlight = lvl === highlight
          return (
            <div key={lvl} className="flex-1 text-center">
              <div className={`py-2 rounded-md border text-xs font-bold transition-all ${isHighlight ? `${meta.bg} ${meta.color} border-current ring-1 ring-current` : 'border-border text-muted-foreground/50'}`}>
                {lvl}
              </div>
              <div className={`text-[9px] mt-1 leading-tight ${isHighlight ? meta.color : 'text-muted-foreground/40'}`}>
                {meta.sub}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── GAUGE COMPONENT ───────────────────────────────────────

function Gauge({ label, value, max, unit, color }: { label: string; value: number; max: number; unit?: string; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold tabular-nums ${color}`}>{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color.replace('text-', 'bg-').replace('/\d+', '')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────

export default function CEFRHubPage() {
  const [activeTool, setActiveTool] = useState<Tool>('checker')
  const [input, setInput] = useState('')
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>('B1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CEFRCheckerResult | CEFRAdaptorResult | ReadabilityResult | QuestionGeneratorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length
  const canSubmit = wordCount >= 10 && !loading

  const handleAnalyze = async () => {
    if (!canSubmit) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      let res
      if (activeTool === 'checker') res = await analyzeCEFRLevel(input)
      else if (activeTool === 'adaptor') res = await adaptTextToLevel(input, targetLevel)
      else if (activeTool === 'readability') res = await checkReadability(input)
      else res = await generateQuestions(input)
      setResult(res)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool)
    setResult(null)
    setError(null)
    setInput('')
  }

  const handleSampleLoad = (text: string) => {
    setInput(text)
    setResult(null)
    setError(null)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeMeta = TOOLS.find((t) => t.id === activeTool)!

  return (
    <div className="animate-fade-up max-w-5xl">
      <div className="page-header">
        <h1>CEFR Language Hub</h1>
        <p>Four AI-powered tools for CEFR level analysis, text adaptation, readability profiling, and question generation.</p>
      </div>

      {/* ── TOOL TABS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {TOOLS.map((tool) => {
          const active = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-md text-xs font-medium transition-all border ${
                active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <tool.icon className="h-4 w-4" />
              {tool.label}
            </button>
          )
        })}
      </div>

      {/* ── TOOL DESCRIPTION ── */}
      <div className="glass-card p-4 mb-5 border-l-2 border-foreground/30">
        <p className="text-sm text-muted-foreground">{activeMeta.description}</p>
      </div>

      {/* ── SAMPLE TEXTS ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Try with sample:</span>
        {SAMPLE_TEXTS[activeTool].map((sample) => (
          <button
            key={sample.label}
            onClick={() => handleSampleLoad(sample.text)}
            className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* ── INPUT + RESULT LAYOUT ── */}
      <div className={`space-y-5 ${activeTool === 'adaptor' ? '' : ''}`}>

        {/* Adaptor: target level selector */}
        {activeTool === 'adaptor' && (
          <div className="glass-card p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Target CEFR level:</span>
            {CEFR_LEVELS.map((lvl) => {
              const meta = CEFR_META[lvl]
              return (
                <button
                  key={lvl}
                  onClick={() => setTargetLevel(lvl)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                    targetLevel === lvl ? `${meta.bg} ${meta.color} border-current` : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {lvl} <span className="font-normal ml-1 hidden sm:inline">{meta.sub}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Input */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your Text</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">{wordCount} words</span>
              {wordCount > 0 && wordCount < 10 && (
                <span className="text-xs text-amber-400">Min. 10 words required</span>
              )}
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null); setError(null) }}
            placeholder={
              activeTool === 'checker' ? 'Paste any English text here to analyze its CEFR level...'
              : activeTool === 'adaptor' ? 'Paste text to adapt to the selected CEFR level...'
              : activeTool === 'readability' ? 'Paste text to get a full readability profile...'
              : 'Paste a reading passage to generate IELTS-style comprehension questions...'
            }
            className="w-full h-52 resize-none rounded-md bg-secondary border border-border p-4 text-sm leading-relaxed focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center justify-end mt-4">
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : 'Analyze Text'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass-card p-8 flex flex-col items-center gap-3 text-center animate-fade-in">
            <div className="h-10 w-10 rounded-full border-2 border-border border-t-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">
              {activeTool === 'checker' && 'Analyzing vocabulary, sentence structure, and register...'}
              {activeTool === 'adaptor' && `Adapting text to ${targetLevel} level...`}
              {activeTool === 'readability' && 'Computing Flesch score, lexical diversity, and academic vocabulary...'}
              {activeTool === 'questions' && 'Generating comprehension questions from your passage...'}
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ── RESULT: CEFR Checker ── */}
        {result && activeTool === 'checker' && !loading && (() => {
          const r = result as CEFRCheckerResult
          const meta = CEFR_META[r.level]
          return (
            <div className="space-y-4 animate-fade-in">
              {/* Main result card */}
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Level badge */}
                  <div className="flex-shrink-0 text-center">
                    <div className={`inline-flex items-center justify-center h-20 w-20 rounded-xl font-black text-4xl border-2 ${meta.bg} ${meta.color}`}>
                      {r.level}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{meta.sub}</div>
                    <div className="text-xs text-muted-foreground mt-1">Confidence: {r.confidence}%</div>
                    <div className="w-20 h-1 rounded-full bg-border mt-2 overflow-hidden mx-auto">
                      <div className={`h-full rounded-full ${meta.color.replace('text-', 'bg-')}`} style={{ width: `${r.confidence}%` }} />
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-1">{r.description}</h3>
                    <div className="space-y-2 mt-3">
                      {r.evidence.map((e, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficult words */}
                  {r.difficultWords && r.difficultWords.length > 0 && (
                    <div className="flex-shrink-0 min-w-36">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Advanced Words Found</div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.difficultWords.map((w) => (
                          <span key={w} className="text-xs px-2 py-1 rounded-md border border-border bg-secondary font-mono">{w}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <CEFRScale highlight={r.level} />
              </div>
            </div>
          )
        })()}

        {/* ── RESULT: Level Adaptor ── */}
        {result && activeTool === 'adaptor' && !loading && (() => {
          const r = result as CEFRAdaptorResult
          const meta = CEFR_META[r.targetLevel]
          return (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Original */}
                <div className="glass-card p-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Original Text</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{input}</p>
                </div>
                {/* Adapted */}
                <div className={`glass-card p-5 ${meta.bg} border`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${meta.bg} ${meta.color} border-current`}>{r.targetLevel}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Adapted Text</span>
                    </div>
                    <button
                      onClick={() => handleCopy(r.adaptedText)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed">{r.adaptedText}</p>
                </div>
              </div>

              {/* Changes */}
              <div className="glass-card p-5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Changes Made for {r.targetLevel}</div>
                <div className="space-y-1.5">
                  {r.changes.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-2" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── RESULT: Readability ── */}
        {result && activeTool === 'readability' && !loading && (() => {
          const r = result as ReadabilityResult
          const meta = CEFR_META[r.estimatedCEFR]

          const fleschLabel = r.fleschScore >= 70 ? { label: 'Easy', color: 'text-emerald-400' }
            : r.fleschScore >= 50 ? { label: 'Medium', color: 'text-amber-400' }
            : { label: 'Difficult', color: 'text-red-400' }

          return (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                  {/* CEFR estimate */}
                  <div className="flex-shrink-0 text-center">
                    <div className={`inline-flex items-center justify-center h-20 w-20 rounded-xl font-black text-3xl border-2 ${meta.bg} ${meta.color}`}>
                      {r.estimatedCEFR}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Estimated CEFR</div>
                  </div>

                  {/* Flesch score */}
                  <div className="flex-shrink-0 text-center">
                    <div className="h-20 w-20 rounded-xl border border-border bg-secondary flex flex-col items-center justify-center">
                      <div className={`text-2xl font-bold ${fleschLabel.color}`}>{r.fleschScore}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Flesch</div>
                    </div>
                    <div className={`text-xs mt-2 ${fleschLabel.color}`}>{fleschLabel.label}</div>
                  </div>

                  {/* Metric list */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <Gauge label="Avg Sentence Length" value={r.avgSentenceLength} max={30} unit=" words"
                      color={r.avgSentenceLength > 22 ? 'text-red-400' : r.avgSentenceLength > 15 ? 'text-amber-400' : 'text-emerald-400'} />
                    <Gauge label="Avg Word Length" value={r.avgWordLength} max={9} unit=" chars"
                      color={r.avgWordLength > 6 ? 'text-violet-400' : r.avgWordLength > 4.5 ? 'text-amber-400' : 'text-muted-foreground'} />
                    <Gauge label="Lexical Diversity (TTR)" value={r.lexicalDiversity} max={100} unit="%"
                      color={r.lexicalDiversity > 65 ? 'text-emerald-400' : r.lexicalDiversity > 45 ? 'text-amber-400' : 'text-red-400'} />
                    <Gauge label="Academic Vocabulary" value={r.academicVocabPercent} max={30} unit="%"
                      color={r.academicVocabPercent > 15 ? 'text-violet-400' : r.academicVocabPercent > 8 ? 'text-amber-400' : 'text-muted-foreground'} />
                  </div>
                </div>

                {/* Metric explanations */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 border-t border-border/40">
                  {[
                    { label: 'Flesch Score', detail: r.fleschScore >= 70 ? 'Easy to read — short sentences, common words' : r.fleschScore >= 50 ? 'Moderately complex — some technical vocabulary' : 'Difficult — long sentences, advanced vocabulary' },
                    { label: 'Sentence Length', detail: r.avgSentenceLength > 22 ? 'Long sentences typical of academic writing' : r.avgSentenceLength > 15 ? 'Moderate length — balanced complexity' : 'Short sentences — accessible and clear' },
                    { label: 'Lexical Diversity', detail: r.lexicalDiversity > 65 ? 'Rich vocabulary — wide range of different words' : r.lexicalDiversity > 45 ? 'Moderate variety — some repetition' : 'Limited variety — same words repeated often' },
                    { label: 'Academic Register', detail: r.academicVocabPercent > 15 ? 'Strong academic register — suitable for IELTS Academic' : r.academicVocabPercent > 8 ? 'Mixed register — some academic vocabulary' : 'General English register' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-md bg-secondary border border-border/50">
                      <div className="text-xs font-semibold mb-1">{item.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{item.detail}</div>
                    </div>
                  ))}
                </div>

                <CEFRScale highlight={r.estimatedCEFR} />
              </div>
            </div>
          )
        })()}

        {/* ── RESULT: Question Generator ── */}
        {result && activeTool === 'questions' && !loading && (() => {
          const r = result as QuestionGeneratorResult
          const meta = CEFR_META[r.cefrLevel as CEFRLevel]
          return (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${meta?.bg ?? ''} ${meta?.color ?? 'text-muted-foreground'}`}>
                        {r.cefrLevel}
                      </span>
                      <span className="text-xs text-muted-foreground">Estimated passage level</span>
                    </div>
                    <h3 className="text-sm font-semibold">{r.questions.length} questions generated</h3>
                  </div>
                  <span className="status-processing">Pending review</span>
                </div>

                <div className="space-y-3">
                  {r.questions.map((q, i) => (
                    <div key={i} className="p-4 rounded-md border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">Q{i + 1}</span>
                          <span className="skill-chip">{q.type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{q.reviewStatus}</span>
                      </div>
                      <p className="text-sm font-medium mb-2">{q.question}</p>
                      {q.options && (
                        <div className="space-y-1 mb-2 ml-2">
                          {q.options.map((opt, j) => (
                            <div key={j} className={`text-xs px-3 py-1.5 rounded-md border ${opt === q.answer ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-400' : 'border-border/50 text-muted-foreground'}`}>
                              {['A', 'B', 'C', 'D'][j]}. {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border/40">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground">Answer: </span>
                          <span className="text-xs text-emerald-400 font-medium">{q.answer}</span>
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-0.5">{q.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Questions require admin review before publishing to students.</p>
                  <button className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    Submit for review
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
