'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BookMarked, Search, ChevronDown, ChevronRight, Volume2,
  BookOpen, Star, RotateCcw, CheckCircle2, XCircle, ChevronLeft, X, Filter
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

// ── FLASHCARD MODE ─────────────────────────────────────────────

function FlashcardMode({ words, onExit }: { words: VocabWord[]; onExit: () => void }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [done, setDone] = useState(false)
  const shuffled = useMemo(() => [...words].sort(() => Math.random() - 0.5).slice(0, 20), [words])

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setCorrect((c) => c + 1)
    else setIncorrect((i) => i + 1)
    setFlipped(false)
    if (idx + 1 >= shuffled.length) {
      setDone(true)
    } else {
      setTimeout(() => setIdx((i) => i + 1), 200)
    }
  }

  if (done) {
    const pct = Math.round((correct / shuffled.length) * 100)
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center backdrop-blur-md">
        <div className="glass-card max-w-md w-full mx-4 p-8 text-center space-y-5">
          <div className="text-5xl">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-xl font-bold">Session Complete!</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass-card p-3"><div className="text-2xl font-bold">{shuffled.length}</div><div className="text-xs text-muted-foreground">Total</div></div>
            <div className="glass-card p-3"><div className="text-2xl font-bold text-emerald-400">{correct}</div><div className="text-xs text-muted-foreground">Correct</div></div>
            <div className="glass-card p-3"><div className="text-2xl font-bold text-red-400">{incorrect}</div><div className="text-xs text-muted-foreground">Missed</div></div>
          </div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-3">
            <button onClick={onExit} className="flex-1 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-all">Exit</button>
            <button onClick={() => { setIdx(0); setFlipped(false); setCorrect(0); setIncorrect(0); setDone(false) }} className="flex-1 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">Try Again</button>
          </div>
        </div>
      </div>
    )
  }

  const card = shuffled[idx]

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-sm font-medium">{idx + 1} / {shuffled.length}</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald-400">{correct} ✓</span>
          <span className="text-red-400">{incorrect} ✗</span>
        </div>
        <button onClick={onExit} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="h-1.5 rounded-full bg-border mb-8 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((idx) / shuffled.length) * 100}%` }} />
          </div>

          {/* Card */}
          <div
            onClick={() => setFlipped(!flipped)}
            className="glass-card min-h-64 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-foreground/30 transition-all text-center select-none"
            style={{ perspective: '1000px' }}
          >
            {!flipped ? (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">What does this word mean?</div>
                <div className="text-3xl font-bold">{card.word}</div>
                <div className="text-xs text-muted-foreground">{card.part_of_speech} · {card.pronunciation}</div>
                <div className="text-xs text-muted-foreground mt-6">Tap to reveal definition</div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-up">
                <div className="text-xl font-bold">{card.word}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                {card.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {card.synonyms.map((s) => <span key={s} className="skill-chip text-xs">{s}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {flipped && (
            <div className="flex gap-4 mt-6 animate-fade-up">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" /> Still learning
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Got it!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── WORD CARD ─────────────────────────────────────────────────

function WordCard({ word }: { word: VocabWord }) {
  const [expanded, setExpanded] = useState(false)

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof window !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(word.word)
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="glass-card p-4 cursor-pointer hover:border-foreground/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{word.word}</span>
            <span className="text-[10px] skill-chip">{word.part_of_speech}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{word.pronunciation}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={speak}
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 animate-fade-up">
          <p className="text-sm text-muted-foreground leading-relaxed">{word.description}</p>
          <p className="text-xs text-muted-foreground italic border-t border-border/40 pt-2">{word.explanation}</p>
          {word.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">Synonyms:</span>
              {word.synonyms.map((s) => (
                <span key={s} className="skill-chip text-xs">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}
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
  const [showSidebar, setShowSidebar] = useState(true)

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
        {/* Sidebar - Categories */}
        <aside className="w-56 flex-shrink-0">
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
          {search ? (
            <>
              <div className="text-xs text-muted-foreground mb-4">
                {filteredWords.length} results for <strong>"{search}"</strong>
              </div>
              <div className="space-y-2">
                {filteredWords.slice(0, 100).map((w, i) => (
                  <WordCard key={`${w.word}-${i}`} word={w} />
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
                  <WordCard key={`${w.word}-${i}`} word={w} />
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
          )}
        </div>
      </div>
    </div>
  )
}
