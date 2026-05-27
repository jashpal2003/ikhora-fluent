/**
 * CEFR AI Service
 * Abstracts all CEFR-related AI operations.
 *
 * Currently: local heuristic analysis (real metrics computed from text) + enriched mock results.
 * TODO: Replace with real Azure OpenAI GPT-5 mini calls via the backend API.
 *
 * Backend API endpoints (when ready):
 * POST /api/cefr/analyze
 * POST /api/cefr/adapt
 * POST /api/cefr/readability
 * POST /api/cefr/generate-questions
 *
 * NEVER call Azure OpenAI directly from this file.
 * All AI calls go through apps/api (NestJS).
 */

import type {
  CEFRLevel,
  CEFRCheckerResult,
  CEFRAdaptorResult,
  ReadabilityResult,
  QuestionGeneratorResult,
} from '../types'

// ── REAL TEXT ANALYSIS HELPERS ────────────────────────────

function getWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

function getSentences(text: string): string[] {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 2)
}

/**
 * Type-Token Ratio (TTR): unique words / total words — proxy for lexical diversity.
 * Higher = more varied vocabulary.
 */
function computeTTR(words: string[]): number {
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean))
  return Math.round((unique.size / words.length) * 100)
}

/**
 * Academic Vocabulary List (AVL) — simplified set of common academic words.
 */
const ACADEMIC_WORDS = new Set([
  'analysis', 'approach', 'area', 'assessment', 'assume', 'authority', 'available', 'benefit',
  'concept', 'consistent', 'constitutional', 'context', 'contract', 'create', 'data', 'definition',
  'derived', 'distribution', 'economic', 'environment', 'established', 'evidence', 'export', 'factors',
  'financial', 'formula', 'function', 'identified', 'income', 'indicate', 'individual', 'interpretation',
  'involved', 'issues', 'labour', 'legal', 'legislation', 'major', 'method', 'occur', 'percent',
  'period', 'policy', 'principle', 'procedure', 'process', 'required', 'research', 'response', 'role',
  'section', 'sector', 'significant', 'similar', 'source', 'specific', 'structure', 'theory', 'variable',
])

function computeAcademicVocabPercent(words: string[]): number {
  const count = words.filter((w) => ACADEMIC_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))).length
  return Math.round((count / words.length) * 100)
}

/**
 * Estimate CEFR level from text metrics.
 * Uses avg sentence length, avg word length, TTR, and academic vocab %.
 */
function estimateCEFRFromMetrics(avgSentenceLength: number, avgWordLength: number, ttr: number, academicVocab: number): CEFRLevel {
  let score = 0
  // Sentence length
  if (avgSentenceLength > 25) score += 3
  else if (avgSentenceLength > 18) score += 2
  else if (avgSentenceLength > 12) score += 1

  // Word length (longer = more complex vocabulary)
  if (avgWordLength > 6.5) score += 3
  else if (avgWordLength > 5.5) score += 2
  else if (avgWordLength > 4.5) score += 1

  // Type-Token Ratio (lexical variety)
  if (ttr > 70) score += 2
  else if (ttr > 55) score += 1

  // Academic vocabulary
  if (academicVocab > 15) score += 2
  else if (academicVocab > 8) score += 1

  if (score >= 9) return 'C2'
  if (score >= 7) return 'C1'
  if (score >= 5) return 'B2'
  if (score >= 3) return 'B1'
  if (score >= 1) return 'A2'
  return 'A1'
}

/**
 * Generate evidence bullets from real text analysis.
 */
function buildEvidence(avgSentenceLength: number, avgWordLength: number, ttr: number, academicVocab: number, level: CEFRLevel): string[] {
  const evidence: string[] = []

  if (avgSentenceLength > 20)
    evidence.push(`Complex sentence structure (avg ${avgSentenceLength} words/sentence) — typical of ${level} writing`)
  else if (avgSentenceLength > 12)
    evidence.push(`Moderate sentence length (avg ${avgSentenceLength} words/sentence) — consistent with ${level}`)
  else
    evidence.push(`Short, direct sentences (avg ${avgSentenceLength} words/sentence) — characteristic of A-level text`)

  if (avgWordLength > 6)
    evidence.push(`Sophisticated vocabulary profile (avg word length: ${avgWordLength} chars)`)
  else if (avgWordLength > 4.5)
    evidence.push(`Mixed vocabulary — common and moderately complex words (avg length: ${avgWordLength} chars)`)
  else
    evidence.push(`Simple vocabulary — predominantly short, everyday words (avg length: ${avgWordLength} chars)`)

  if (ttr > 65)
    evidence.push(`High lexical diversity (${ttr}% type-token ratio) — wide vocabulary range`)
  else if (ttr > 45)
    evidence.push(`Moderate lexical diversity (${ttr}%) — some vocabulary repetition`)
  else
    evidence.push(`Low lexical diversity (${ttr}%) — limited vocabulary range`)

  if (academicVocab > 15)
    evidence.push(`High proportion of academic vocabulary (${academicVocab}%) — academic/professional register`)
  else if (academicVocab > 8)
    evidence.push(`Some academic vocabulary present (${academicVocab}%)`)
  else
    evidence.push(`Limited academic vocabulary (${academicVocab}%) — general/informal register`)

  return evidence
}

/**
 * Extract genuinely difficult or uncommon words from the text.
 */
function extractDifficultWords(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
  const DIFFICULT_MARKERS = [
    'ubiquitous', 'paradigm', 'proliferation', 'multifaceted', 'unprecedented', 'consequential',
    'pragmatic', 'ambiguous', 'autonomous', 'comprehensive', 'sophisticated', 'systematic',
    'infrastructure', 'deterioration', 'consolidating', 'asymmetry', 'intermittent', 'dispatchable',
    'neonicotinoids', 'biodiversity', 'anthropogenic', 'delineation', 'epistemological', 'ameliorate',
  ]
  return DIFFICULT_MARKERS.filter((w) => words.includes(w)).slice(0, 6)
}

// ── CEFR CHECKER ──────────────────────────────────────────

export async function analyzeCEFRLevel(text: string): Promise<CEFRCheckerResult> {
  // Try real Azure OpenAI first
  try {
    const res = await fetch('/api/ai/cefr-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (res.ok) {
      const data = await res.json()
      return {
        level: data.level as CEFRLevel,
        description: data.description ?? CEFR_DESCRIPTIONS[data.level as CEFRLevel],
        confidence: data.confidence ?? 85,
        evidence: data.evidence ?? [],
        vocabularyLevel: (data.vocabularyLevel ?? data.level) as CEFRLevel,
        grammarComplexity: (data.grammarComplexity ?? data.level) as CEFRLevel,
        difficultWords: data.difficultWords ?? [],
      }
    }
  } catch {
    // Fall through to local heuristic
  }

  // Local heuristic fallback
  await new Promise((r) => setTimeout(r, 800))
  const words = getWords(text)
  const sentences = getSentences(text)
  const avgSentenceLength = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0
  const avgWordLength = parseFloat(
    (words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / words.length).toFixed(1)
  )
  const ttr = computeTTR(words)
  const academicVocab = computeAcademicVocabPercent(words)
  const level = estimateCEFRFromMetrics(avgSentenceLength, avgWordLength, ttr, academicVocab)
  const confidence = Math.min(90, 70 + Math.floor(Math.random() * 15))

  return {
    level,
    description: CEFR_DESCRIPTIONS[level] + ' (local estimate — AI unavailable)',
    confidence,
    evidence: buildEvidence(avgSentenceLength, avgWordLength, ttr, academicVocab, level),
    vocabularyLevel: level,
    grammarComplexity: level,
    difficultWords: extractDifficultWords(text),
  }
}

// ── LEVEL ADAPTOR ─────────────────────────────────────────

export async function adaptTextToLevel(text: string, targetLevel: CEFRLevel): Promise<CEFRAdaptorResult> {
  // TODO: Replace with: return fetch('/api/cefr/adapt', { method: 'POST', body: JSON.stringify({ text, targetLevel }) })
  await new Promise((r) => setTimeout(r, 2200))

  return {
    targetLevel,
    adaptedText: generateAdaptedText(text, targetLevel),
    changes: getAdaptationChanges(targetLevel),
  }
}

// ── READABILITY CHECK ─────────────────────────────────────

export async function checkReadability(text: string): Promise<ReadabilityResult> {
  // TODO: Replace with: return fetch('/api/cefr/readability', { method: 'POST', body: JSON.stringify({ text }) })
  await new Promise((r) => setTimeout(r, 1400))

  const words = getWords(text)
  const sentences = getSentences(text)

  const avgSentenceLength = sentences.length > 0
    ? Math.round(words.length / sentences.length)
    : 0

  const avgWordLength = parseFloat(
    (words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / words.length).toFixed(1)
  )

  const ttr = computeTTR(words)
  const academicVocab = computeAcademicVocabPercent(words)
  const estimatedCEFR = estimateCEFRFromMetrics(avgSentenceLength, avgWordLength, ttr, academicVocab)

  // Flesch Reading Ease approximation
  const syllableEstimate = words.reduce((sum, w) => {
    const cleaned = w.toLowerCase().replace(/[^a-z]/g, '')
    const matches = cleaned.match(/[aeiou]+/g)
    return sum + Math.max(1, matches ? matches.length : 1)
  }, 0)
  const avgSyllables = syllableEstimate / words.length
  const fleschScore = Math.max(0, Math.min(100,
    Math.round(206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllables)
  ))

  return {
    estimatedCEFR,
    fleschScore,
    avgSentenceLength,
    avgWordLength,
    lexicalDiversity: ttr,
    academicVocabPercent: academicVocab,
  }
}

// ── QUESTION GENERATOR ────────────────────────────────────

export async function generateQuestions(text: string): Promise<QuestionGeneratorResult> {
  // TODO: Replace with: return fetch('/api/cefr/generate-questions', { method: 'POST', body: JSON.stringify({ text }) })
  await new Promise((r) => setTimeout(r, 2800))

  // Extract first sentence as a title heuristic
  const firstSentence = getSentences(text)[0]?.slice(0, 60) ?? 'Generated Passage'
  const words = getWords(text)
  const estimatedLevel = estimateCEFRFromMetrics(
    Math.round(words.length / Math.max(1, getSentences(text).length)),
    parseFloat((words.reduce((s, w) => s + w.replace(/[^a-zA-Z]/g, '').length, 0) / words.length).toFixed(1)),
    computeTTR(words),
    computeAcademicVocabPercent(words)
  )

  return {
    passageTitle: firstSentence + '...',
    cefrLevel: estimatedLevel,
    questions: [
      {
        type: 'True/False/Not Given',
        question: 'According to the passage, there is strong evidence supporting the main argument.',
        answer: 'Not Given',
        explanation: 'The passage presents a case but the strength of evidence is not explicitly stated.',
        reviewStatus: 'pending',
      },
      {
        type: 'MCQ',
        question: 'What is the primary purpose of the passage?',
        options: [
          'To inform the reader about a topic and present different perspectives',
          'To persuade the reader to take a specific action',
          'To compare two historical events',
          'To explain a scientific experiment',
        ],
        answer: 'To inform the reader about a topic and present different perspectives',
        explanation: 'The passage presents balanced information with multiple viewpoints.',
        reviewStatus: 'pending',
      },
      {
        type: 'Short Answer',
        question: 'What is the overall tone of the passage?',
        answer: 'Academic / informative',
        explanation: 'The passage uses formal, academic language and presents factual information.',
        reviewStatus: 'pending',
      },
      {
        type: 'Sentence Completion',
        question: 'The estimated CEFR level of this passage is ________.',
        answer: estimatedLevel,
        explanation: `Based on sentence length, vocabulary complexity, and lexical diversity analysis.`,
        reviewStatus: 'pending',
      },
    ],
  }
}

// ── CONSTANTS ─────────────────────────────────────────────

const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Beginner — uses familiar everyday expressions and very basic phrases. Short, simple sentences.',
  A2: 'Elementary — communicates in simple and routine tasks. Understands frequently used expressions.',
  B1: 'Intermediate — deals with most situations while travelling. Describes experiences, events, and opinions.',
  B2: 'Upper-Intermediate — interacts with fluency and spontaneity. Clear text on a wide range of subjects.',
  C1: 'Advanced — expresses ideas fluently and spontaneously. Uses language flexibly for social, academic, and professional purposes.',
  C2: 'Proficient — understands virtually everything with ease. Summarises information from different sources into a coherent text.',
}

// ── LEVEL ADAPTION HELPERS ────────────────────────────────

function generateAdaptedText(text: string, level: CEFRLevel): string {
  if (['A1', 'A2'].includes(level)) {
    return 'This topic is important today. It affects many people. Some people agree. Others disagree. We need to think carefully about the problem. There are good and bad sides to it. It is not easy to find the right answer.'
  }
  if (level === 'B1') {
    return 'This is an important topic that affects many people around the world. There are different opinions about it. Some people think it is helpful, while others believe it can cause problems. We should consider both sides carefully before reaching a conclusion.'
  }
  if (level === 'B2') {
    const shortened = text.slice(0, Math.min(text.length, 400))
    return shortened + (text.length > 400 ? ' [Adapted for B2: complex vocabulary simplified, sentence structure moderated.]' : '')
  }
  return text // C1/C2 — return original unchanged
}

function getAdaptationChanges(level: CEFRLevel): string[] {
  const changeMap: Record<CEFRLevel, string[]> = {
    A1: [
      'Replaced all academic and complex vocabulary with basic everyday words',
      'Shortened all sentences to under 8 words',
      'Removed all subordinate clauses and complex structures',
      'Removed all passive voice constructions',
      'Used only present tense verbs',
    ],
    A2: [
      'Replaced complex vocabulary with simpler synonyms',
      'Broke compound sentences into shorter units',
      'Removed passive voice constructions where possible',
      'Simplified discourse markers to "and", "but", "so"',
    ],
    B1: [
      'Simplified academic vocabulary (e.g. "utilise" → "use", "demonstrate" → "show")',
      'Reduced average sentence length to under 18 words',
      'Replaced complex connectors with simpler alternatives',
      'Maintained basic subordinate clauses',
    ],
    B2: [
      'Simplified the most complex vocabulary items',
      'Slightly reduced sentence length',
      'Maintained formal register and most grammatical structures',
    ],
    C1: ['Minor vocabulary adjustments for naturalness — original structure preserved'],
    C2: ['No changes required — text is at or below C2 level'],
  }
  return changeMap[level] ?? []
}
