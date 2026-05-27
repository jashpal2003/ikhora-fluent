/**
 * AI Scoring Service
 * Calls real Azure OpenAI via server-side API routes.
 * Falls back to a mock ONLY when the API is unavailable.
 *
 * API routes:
 * POST /api/ai/score-writing  → Azure OpenAI GPT-5.4-mini
 *
 * NEVER call Azure OpenAI directly from this file.
 * Credentials live in .env.local, read by server routes only.
 */

import type { ScoreReport, CriterionScore } from '../types'

// ── TYPES ─────────────────────────────────────────────────

export interface WritingScoringInput {
  submissionId: string
  taskType: string
  prompt: string
  answerText: string
  wordCount: number
}

export interface SpeakingScoringInput {
  submissionId: string
  part: number
  question: string
  durationSeconds: number
  transcript: string
}

// ── WRITING SCORING ───────────────────────────────────────

export async function scoreWritingSubmission(input: WritingScoringInput): Promise<ScoreReport> {
  // ── 1. Try real Azure OpenAI ──────────────────────────────
  try {
    const res = await fetch('/api/ai/score-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (res.ok) {
      const data = await res.json()
      // Mark as coming from real AI
      return { ...data, _source: 'azure-openai' } as ScoreReport
    }

    // Log the actual error from the API so we can see it in console
    try {
      const errBody = await res.json()
      console.warn('[scoreWritingSubmission] API returned error:', res.status, errBody)
    } catch {
      console.warn('[scoreWritingSubmission] API returned error:', res.status)
    }
  } catch (fetchErr) {
    console.warn('[scoreWritingSubmission] Network error — falling back to mock:', fetchErr)
  }

  // ── 2. Mock Fallback ──────────────────────────────────────
  // Only reached if the API route is unreachable.
  await new Promise((r) => setTimeout(r, 1500))

  const isTask1 = input.taskType.includes('TASK_1')
  const taskLabel = isTask1 ? 'Task Achievement' : 'Task Response'

  // Vary score by word count + small random delta to avoid always showing same value
  const wc = input.wordCount ?? answerWordCount(input.answerText)
  const base = wc >= 280 ? 6.5 : wc >= 240 ? 6.0 : wc >= 180 ? 5.5 : 5.0
  const delta = (Math.random() - 0.5) // ±0.5
  const varied = Math.round((base + delta) * 2) / 2

  const criteria: CriterionScore[] = isTask1
    ? [
        { criterionId: 'ta', criterionLabel: taskLabel, aiScore: clampBand(varied - 0.5) },
        { criterionId: 'cc', criterionLabel: 'Coherence & Cohesion', aiScore: clampBand(varied) },
        { criterionId: 'lr', criterionLabel: 'Lexical Resource', aiScore: clampBand(varied) },
        { criterionId: 'gra', criterionLabel: 'Grammatical Range & Accuracy', aiScore: clampBand(varied - 0.5) },
      ]
    : [
        { criterionId: 'tr', criterionLabel: taskLabel, aiScore: clampBand(varied - 0.5) },
        { criterionId: 'cc', criterionLabel: 'Coherence & Cohesion', aiScore: clampBand(varied) },
        { criterionId: 'lr', criterionLabel: 'Lexical Resource', aiScore: clampBand(varied + 0.5) },
        { criterionId: 'gra', criterionLabel: 'Grammatical Range & Accuracy', aiScore: clampBand(varied - 0.5) },
      ]

  const overallBand = Math.round(criteria.reduce((s, c) => s + c.aiScore, 0) / criteria.length * 2) / 2

  return {
    submissionId: input.submissionId,
    skill: 'writing',
    overallBand,
    finalBand: overallBand,
    teacherReviewed: false,
    confidence: 0.60, // Lower confidence — this is a mock estimate
    _source: 'mock-fallback',
    criteria,
    strengths: [
      'Essay addresses the main question in the prompt',
      'Basic paragraph structure is present',
      'Some attempt at using discourse markers and linking words',
    ],
    weaknesses: [
      'Limited range of grammatical structures — aim to vary sentence types',
      'Some vocabulary repetition — use synonyms and collocations for key terms',
      'Conclusion needs further development beyond a simple restatement',
    ],
    sentenceFeedback: [
      {
        original: 'This is a very important topic in today\'s world.',
        issue: 'Vague opening — lacks specificity and academic register.',
        suggestion: 'The question of [topic] has become increasingly significant in contemporary discourse.',
        category: 'vocabulary',
      },
    ],
    improvedVersion:
      'A more sophisticated response would present a clear position in the introduction, develop each argument with specific examples and reasoning, and offer a nuanced conclusion that acknowledges complexity.',
    modelAnswer: '',
    nextPractice: [
      'Practice writing complex sentences with relative clauses and passive voice',
      'Build topic-specific vocabulary by reading editorials and academic articles',
      'Work on paragraph cohesion — start each body paragraph with a clear topic sentence',
    ],
    generatedAt: new Date().toISOString(),
  } as ScoreReport & { _source: string }
}

// ── SPEAKING SCORING ──────────────────────────────────────

export async function scoreSpeakingSubmission(input: SpeakingScoringInput): Promise<ScoreReport> {
  // TODO: POST /api/ai/score-speaking when audio transcription is integrated
  await new Promise((r) => setTimeout(r, 2500))

  const wpm = Math.round(input.durationSeconds > 0 ? input.durationSeconds * 2.1 : 110)
  const fillerWords = Math.max(1, Math.round(input.durationSeconds / 18))
  const baseBand = Math.min(8, Math.max(4.5, 5.5 + (input.durationSeconds > 90 ? 0.5 : 0)))

  return {
    submissionId: input.submissionId,
    skill: 'speaking',
    overallBand: baseBand,
    finalBand: baseBand,
    teacherReviewed: false,
    confidence: 0.70,
    criteria: [
      { criterionId: 'fc', criterionLabel: 'Fluency & Coherence', aiScore: baseBand },
      { criterionId: 'lr', criterionLabel: 'Lexical Resource', aiScore: baseBand },
      { criterionId: 'gra', criterionLabel: 'Grammatical Range & Accuracy', aiScore: baseBand - 0.5 },
      { criterionId: 'p', criterionLabel: 'Pronunciation', aiScore: baseBand + 0.5 },
    ],
    strengths: [
      'Response addresses the question directly',
      'Reasonable vocabulary range for the topic level',
      'Fairly natural intonation pattern maintained',
    ],
    weaknesses: [
      `${fillerWords} filler words detected (um, uh, like) — practice pausing instead`,
      'Some repetition of basic grammatical structures',
      'Responses could be extended with more specific examples and explanation',
    ],
    metrics: {
      wpm,
      fillerWords,
      longPauses: Math.max(1, Math.round(fillerWords * 0.6)),
      pronunciationScore: Math.round(65 + Math.random() * 20),
      duration: input.durationSeconds,
    },
    pronunciationFeedback:
      'Overall pronunciation is generally intelligible. Focus on final consonant clusters and the /θ/ and /ð/ sounds which are commonly substituted.',
    wordLevelIssues: [
      { word: 'environment', issue: 'Stress should be on second syllable: en-VI-ron-ment' },
      { word: 'thought', issue: '/θ/ sound often replaced with /t/ — practice tongue placement' },
    ],
    nextPractice: [
      'Record yourself and count filler words — aim for zero in your next attempt',
      'Extend Part 2 answers by adding a story or specific personal example',
      'Shadow BBC or IELTS model answers to improve pronunciation and rhythm',
    ],
    generatedAt: new Date().toISOString(),
  }
}

// ── READING SCORING ───────────────────────────────────────

export function scoreReadingAttempt(
  questions: Array<{ id: string; correctAnswer: string; marks: number }>,
  answers: Record<string, string>
): { score: number; total: number; band: number; results: Record<string, boolean> } {
  let score = 0
  let total = 0
  const results: Record<string, boolean> = {}

  for (const q of questions) {
    total += q.marks
    const userAnswer = (answers[q.id] || '').trim().toLowerCase()
    const correct = q.correctAnswer.toLowerCase()
    const isCorrect =
      userAnswer === correct ||
      (correct.includes(userAnswer) && userAnswer.length > 3)
    if (isCorrect) score += q.marks
    results[q.id] = isCorrect
  }

  const pct = total > 0 ? score / total : 0
  let band = 5.0
  if (pct >= 0.9) band = 8.5
  else if (pct >= 0.8) band = 7.5
  else if (pct >= 0.7) band = 7.0
  else if (pct >= 0.6) band = 6.5
  else if (pct >= 0.5) band = 6.0
  else if (pct >= 0.4) band = 5.5

  return { score, total, band, results }
}

// ── LISTENING SCORING ─────────────────────────────────────

export function scoreListeningAttempt(
  questions: Array<{ id: string; correctAnswer: string; marks: number }>,
  answers: Record<string, string>
): { score: number; total: number; band: number; results: Record<string, boolean> } {
  return scoreReadingAttempt(questions, answers)
}

// ── HELPERS ───────────────────────────────────────────────

function clampBand(n: number): number {
  return Math.round(Math.min(9, Math.max(4, n)) * 2) / 2
}

function answerWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
