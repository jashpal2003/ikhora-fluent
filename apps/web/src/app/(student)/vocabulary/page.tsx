'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BookMarked, Search, ChevronDown, ChevronRight, Volume2,
  BookOpen, Star, RotateCcw, CheckCircle2, XCircle, ChevronLeft, X, Filter, Sparkles
} from 'lucide-react'

// ── TYPES ──────────────────────────────────────────────────────
interface VocabWord {
  word: string
  part_of_speech: string
  pronunciation: string
  description: string
  explanation: string
  synonyms: string[]
}

interface VocabCategory {
  category: string
  total_words_in_category: number
  words: VocabWord[]
}

// ── STATIC VOCAB DATA (subset for performance) ─────────────────
// Full data is loaded dynamically from the API
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Environment': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-400/20' },
  'Technology': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-400/20' },
  'Health': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-400/20' },
  'Education': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-400/20' },
  'Society': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  'Economy': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-400/20' },
  'Travel': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-400/20' },
  'default': { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border' },
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['default']
}

// ── FISHER-YATES SHUFFLE ────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ── FLASHCARD MODE ─────────────────────────────────────────────

function FlashcardMode({ words, onExit }: { words: VocabWord[]; onExit: () => void }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [done, setDone] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const shuffled = useMemo(() => shuffleArray(words).slice(0, 20), [words])

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isAnimating) return
    if (isCorrect) setCorrect((c) => c + 1)
    else setIncorrect((i) => i + 1)
    setIsAnimating(true)
    setTimeout(() => {
      setFlipped(false)
      if (idx + 1 >= shuffled.length) {
        setDone(true)
        setIsAnimating(false)
      } else {
        setTimeout(() => {
          setIdx((i) => i + 1)
          setIsAnimating(false)
        }, 200)
      }
    }, 300)
  }, [idx, shuffled.length, isAnimating])

  const restart = useCallback(() => {
    setIdx(0)
    setFlipped(false)
    setCorrect(0)
    setIncorrect(0)
    setDone(false)
    setIsAnimating(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped((f) => !f) }
      if (flipped && e.key === 'ArrowRight') handleAnswer(true)
      if (flipped && e.key === 'ArrowLeft') handleAnswer(false)
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, handleAnswer, onExit])

  if (shuffled.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center backdrop-blur-md">
        <div className="glass-card max-w-sm w-full mx-4 p-8 text-center space-y-4">
          <div className="text-5xl">📚</div>
          <h3 className="text-xl font-bold">No words to study</h3>
          <p className="text-sm text-muted-foreground">Select a category or search for words first, then start flashcard mode.</p>
          <button onClick={onExit} className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((correct / shuffled.length) * 100)
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center backdrop-blur-md">
        <div className="glass-card max-w-md w-full mx-4 p-8 text-center space-y-6 animate-fade-up">
          <div className="text-6xl">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
          <div>
            <h3 className="text-2xl font-bold mb-1">Session Complete!</h3>
            <p className="text-sm text-muted-foreground">
              {pct >= 80 ? 'Excellent work! You really know these words.' : pct >= 60 ? 'Good effort! Keep practising to improve.' : 'Keep going — repetition is key to mastery.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass-card p-3">
              <div className="text-2xl font-bold">{shuffled.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Studied</div>
            </div>
            <div className="glass-card p-3">
              <div className="text-2xl font-bold text-emerald-400">{correct}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Got it</div>
            </div>
            <div className="glass-card p-3">
              <div className="text-2xl font-bold text-red-400">{incorrect}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Missed</div>
            </div>
          </div>
          {/* Score bar */}
          <div className="h-3 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 80 ? 'linear-gradient(90deg, #34d399, #10b981)' : pct >= 60 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #f87171, #ef4444)',
              }}
            />
          </div>
          <div className="text-sm font-semibold" style={{ color: pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171' }}>
            {pct}% accuracy
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onExit} className="flex-1 py-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              Exit
            </button>
            <button onClick={restart} className="flex-1 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const card = shuffled[idx]

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="text-sm font-medium text-muted-foreground">
          <span className="text-foreground font-bold">{idx + 1}</span>
          <span className="mx-1">/</span>
          <span>{shuffled.length}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />{correct}
          </span>
          <span className="flex items-center gap-1 text-red-400 font-medium">
            <XCircle className="h-3.5 w-3.5" />{incorrect}
          </span>
        </div>
        <button onClick={onExit} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="h-1.5 rounded-full bg-border mb-8 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((idx + 1) / shuffled.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card */}
          <div
            className="cursor-pointer select-none"
            style={{ perspective: '1200px' }}
            onClick={() => !isAnimating && setFlipped(!flipped)}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front face */}
              <div
                className="glass-card min-h-72 flex flex-col items-center justify-center p-8 text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    What does this word mean?
                  </div>
                  <div className="text-4xl font-bold tracking-tight">{card.word}</div>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="skill-chip">{card.part_of_speech}</span>
                    <span className="font-mono text-[11px]">{card.pronunciation}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-6 flex items-center gap-1.5 opacity-60">
                    <RotateCcw className="h-3 w-3" />
                    Tap or press Space to reveal
                  </div>
                </div>
              </div>

              {/* Back face */}
              <div
                className="glass-card min-h-72 flex flex-col items-center justify-center p-8 text-center absolute inset-0 border-foreground/15"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="space-y-4 w-full">
                  <div className="text-2xl font-bold">{card.word}</div>
                  <div className="h-px bg-border/60 w-16 mx-auto" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                  {card.synonyms.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center pt-1">
                      {card.synonyms.map((s) => (
                        <span key={s} className="skill-chip text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-4 opacity-60">
                    ← Arrow keys to answer →
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer buttons */}
          <div
            className={`flex gap-4 mt-6 transition-all duration-300 ${
              flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleAnswer(false) }}
              disabled={!flipped || isAnimating}
              className="flex-1 py-3.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <XCircle className="h-4 w-4" /> Still learning
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAnswer(true) }}
              disabled={!flipped || isAnimating}
              className="flex-1 py-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" /> Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── WORD CARD ─────────────────────────────────────────────────

function WordCard({ word, index }: { word: VocabWord; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word.word)
    utterance.rate = 0.8
    utterance.pitch = 1
    const voices = window.speechSynthesis.getVoices()
    const britVoice = voices.find(v => v.lang.startsWith('en-GB')) ?? voices.find(v => v.lang.startsWith('en'))
    if (britVoice) utterance.voice = britVoice
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="glass-card p-4 cursor-pointer hover:border-foreground/15 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{word.word}</span>
            <span className="text-[10px] skill-chip uppercase tracking-wider">{word.part_of_speech}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono tracking-wide">{word.pronunciation}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={speak}
            className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
              speaking
                ? 'bg-amber-400/20 text-amber-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Volume2 className={`h-3.5 w-3.5 ${speaking ? 'animate-pulse' : ''}`} />
          </button>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2.5 border-t border-border/40 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{word.description}</p>
          {word.explanation && (
            <p className="text-xs text-muted-foreground/70 italic">{word.explanation}</p>
          )}
          {word.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mr-1">Synonyms:</span>
              {word.synonyms.map((s) => (
                <span key={s} className="skill-chip text-[11px]">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────

export default function VocabularyPage() {
  const [vocabData, setVocabData] = useState<VocabCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [flashcardMode, setFlashcardMode] = useState(false)

  useEffect(() => {
    fetch('/api/vocabulary')
      .then((r) => r.json())
      .then((data) => {
        setVocabData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredWords = useMemo(() => {
    const q = search.toLowerCase().trim()
    const cats = selectedCategory
      ? vocabData.filter((c) => c.category === selectedCategory)
      : vocabData

    if (!q) return cats.flatMap((c) => c.words)

    return cats.flatMap((c) =>
      c.words.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.synonyms.some((s) => s.toLowerCase().includes(q))
      )
    )
  }, [vocabData, search, selectedCategory])

  const currentCategoryData = selectedCategory
    ? vocabData.find((c) => c.category === selectedCategory)
    : null

  const displayWords = search
    ? filteredWords
    : currentCategoryData?.words ?? []

  const totalWords = vocabData.reduce((s, c) => s + c.total_words_in_category, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading vocabulary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Flashcard overlay */}
      {flashcardMode && (
        <FlashcardMode
          words={displayWords.length > 0 ? displayWords : filteredWords.slice(0, 50)}
          onExit={() => setFlashcardMode(false)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1>Vocabulary Hub</h1>
              <p className="!mt-0">{totalWords.toLocaleString()} IELTS words across {vocabData.length} categories.</p>
            </div>
          </div>
          <button
            onClick={() => setFlashcardMode(true)}
            disabled={displayWords.length === 0 && filteredWords.length === 0}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Flashcard Mode
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words, definitions, synonyms..."
          className="w-full pl-10 pr-4 py-3 rounded-md border border-border bg-secondary text-sm focus:outline-none focus:border-foreground transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Layout */}
      <div className="flex gap-6">
        {/* Sidebar - Categories (desktop) */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">Categories</div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              <span>All Categories</span>
              <span className="text-[10px] opacity-70">{totalWords}</span>
            </button>
            {vocabData.map((cat) => {
              const c = getCategoryColor(cat.category)
              const active = selectedCategory === cat.category
              return (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center justify-between group ${active ? `${c.bg} ${c.text} border ${c.border}` : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  <span className="truncate">{cat.category}</span>
                  <span className="ml-2 opacity-60 flex-shrink-0">{cat.total_words_in_category}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Word List */}
        <div className="flex-1 min-w-0">
          {/* Mobile category chips */}
          {!search && !selectedCategory && (
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
              {vocabData.map((cat) => {
                const c = getCategoryColor(cat.category)
                return (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${c.border} ${c.bg} ${c.text} hover:opacity-80 transition-all`}
                  >
                    {cat.category}
                    <span className="ml-1.5 opacity-60">{cat.total_words_in_category}</span>
                  </button>
                )
              })}
            </div>
          )}
          {/* Mobile: selected category bar */}
          {selectedCategory && (
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ChevronLeft className="h-3 w-3" /> All
              </button>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-medium">{selectedCategory}</span>
            </div>
          )}

          {search ? (
            <>
              <div className="text-xs text-muted-foreground mb-4">
                {filteredWords.length} results for <strong>"{search}"</strong>
              </div>
              <div className="space-y-2">
                {filteredWords.slice(0, 100).map((w, i) => (
                  <WordCard key={`${w.word}-${i}`} word={w} index={i} />
                ))}
                {filteredWords.length > 100 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Showing first 100 of {filteredWords.length} results. Refine your search to see more.
                  </p>
                )}
              </div>
            </>
          ) : selectedCategory ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-muted-foreground">
                  <strong>{currentCategoryData?.total_words_in_category}</strong> words in <strong>{selectedCategory}</strong>
                </div>
                <button
                  onClick={() => setFlashcardMode(true)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Study this category
                </button>
              </div>
              <div className="space-y-2">
                {displayWords.map((w, i) => (
                  <WordCard key={`${w.word}-${i}`} word={w} index={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Category grid (default view) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {vocabData.map((cat) => {
                  const c = getCategoryColor(cat.category)
                  return (
                    <button
                      key={cat.category}
                      onClick={() => setSelectedCategory(cat.category)}
                      className={`glass-card p-5 text-left group hover:border-opacity-60 transition-all border ${c.border}`}
                    >
                      <div className={`h-10 w-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                        <BookOpen className={`h-5 w-5 ${c.text}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{cat.category}</h3>
                      <p className={`text-2xl font-bold ${c.text} mb-1`}>{cat.total_words_in_category}</p>
                      <p className="text-xs text-muted-foreground">words to study</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        Browse <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  )
                })}
              </div>
              {/* Empty state for no data */}
              {vocabData.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <BookMarked className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No vocabulary data loaded. Check back soon.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
