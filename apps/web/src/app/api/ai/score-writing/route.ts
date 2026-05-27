/**
 * POST /api/ai/score-writing
 * Scores a writing submission using Azure OpenAI GPT-5.4-mini.
 *
 * Key: This endpoint uses the OpenAI-compatible path (/openai/v1)
 * Auth: Authorization: Bearer {key}  (NOT api-key header)
 * Param: max_completion_tokens  (NOT max_tokens — GPT-5.4-mini rejects max_tokens)
 */

import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ''
const API_KEY = process.env.AZURE_OPENAI_API_KEY || ''
const MODEL = process.env.AI_PRIMARY_DEPLOYMENT ?? 'gpt-5.4-mini'

const SYSTEM_PROMPT = `You are a strict, honest IELTS writing examiner with 15 years of experience.
Score the student essay against the official IELTS Writing Band Descriptors and return ONLY a valid JSON object with this exact structure — no markdown, no explanation, no extra text:

{
  "overallBand": 6.0,
  "finalBand": 6.0,
  "confidence": 0.85,
  "criteria": [
    { "criterionId": "tr", "criterionLabel": "Task Response", "aiScore": 6.0 },
    { "criterionId": "cc", "criterionLabel": "Coherence & Cohesion", "aiScore": 6.0 },
    { "criterionId": "lr", "criterionLabel": "Lexical Resource", "aiScore": 6.0 },
    { "criterionId": "gra", "criterionLabel": "Grammatical Range & Accuracy", "aiScore": 6.0 }
  ],
  "strengths": [
    "a genuine strength from the actual essay text",
    "another genuine strength",
    "a third genuine strength"
  ],
  "weaknesses": [
    "a genuine weakness with specific reference to the essay",
    "another weakness with a specific example",
    "a third specific weakness"
  ],
  "sentenceFeedback": [
    {
      "original": "copy an actual problematic sentence from the essay",
      "issue": "explain exactly what is wrong with it",
      "suggestion": "write the corrected version",
      "category": "grammar"
    },
    {
      "original": "copy another actual problematic sentence",
      "issue": "explain the problem",
      "suggestion": "corrected version",
      "category": "vocabulary"
    }
  ],
  "improvedVersion": "Write 1 improved paragraph that shows what a Band 7+ answer looks like for this topic.",
  "nextPractice": [
    "specific practice recommendation based on the weaknesses",
    "another specific recommendation"
  ]
}

Rules:
- Band scores must be: 0.0, 0.5, 1.0, 1.5 ... 9.0 (multiples of 0.5 only)
- overallBand = average of 4 criteria scores, rounded to nearest 0.5
- finalBand = same as overallBand
- For Task 1 use criterionId "ta" and criterionLabel "Task Achievement" instead of "tr"/"Task Response"
- Be genuinely honest — a poor essay should get a low score (3.0–5.0), not 6.5
- Reference the actual submitted text in your feedback, not generic comments
- Return ONLY the JSON object, nothing else`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskType, prompt, answerText, wordCount } = body

    if (!answerText || answerText.trim().length < 30) {
      return NextResponse.json({ error: 'Answer text is too short.' }, { status: 400 })
    }
    if (!API_KEY || !ENDPOINT) {
      console.error('[Score Writing] Missing env vars: AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY')
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
    }

    const isTask1 = taskType?.includes('TASK_1')
    const url = `${ENDPOINT}/chat/completions`
    const actualWordCount = wordCount ?? answerText.trim().split(/\s+/).length

    const userMessage = `Task Type: ${taskType || 'ACADEMIC_TASK_2'}
Task Prompt: ${prompt || '(not provided)'}
Word Count: ${actualWordCount} words
${isTask1 ? 'IMPORTANT: Use criterionId "ta" and criterionLabel "Task Achievement" (not "tr"/"Task Response") for this Task 1 essay.' : ''}

Student Essay:
"""
${answerText.slice(0, 4500)}
"""`

    const payload = {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_completion_tokens: 1500,
      response_format: { type: 'json_object' },
    }

    console.log(`[Score Writing] Calling Azure OpenAI — model: ${MODEL}, words: ${actualWordCount}`)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[Score Writing] Azure error ${res.status}:`, errText)
      return NextResponse.json(
        { error: `AI service error (${res.status}). Please try again.` },
        { status: 502 }
      )
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('[Score Writing] Empty content from model:', JSON.stringify(data))
      return NextResponse.json({ error: 'AI returned empty response.' }, { status: 502 })
    }

    let result: Record<string, unknown>
    try {
      result = JSON.parse(content)
    } catch {
      console.error('[Score Writing] Failed to parse JSON:', content)
      return NextResponse.json({ error: 'AI returned invalid JSON.' }, { status: 502 })
    }

    // Inject server-side metadata
    result.submissionId = body.submissionId ?? `sub-${Date.now()}`
    result.skill = 'writing'
    result.teacherReviewed = false
    result.generatedAt = new Date().toISOString()
    if (!result.modelAnswer) result.modelAnswer = result.improvedVersion ?? ''

    console.log(`[Score Writing] Done — band: ${result.overallBand}`)
    return NextResponse.json(result)

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Score Writing] Unhandled error:', message)
    if (message.includes('timeout') || message.includes('abort')) {
      return NextResponse.json({ error: 'AI scoring timed out. Please try again.' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Scoring failed.' }, { status: 500 })
  }
}
