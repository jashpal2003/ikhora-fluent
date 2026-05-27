/**
 * POST /api/ai/cefr-analyze
 * Analyzes text CEFR level using Azure OpenAI GPT-5.4-mini.
 *
 * Auth: Authorization: Bearer {key}  (OpenAI-compatible endpoint)
 * Param: max_completion_tokens  (not max_tokens)
 */

import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ''
const API_KEY = process.env.AZURE_OPENAI_API_KEY || ''
const MODEL = process.env.AI_PRIMARY_DEPLOYMENT ?? 'gpt-5.4-mini'

const SYSTEM_PROMPT = `You are an expert CEFR language assessor and IELTS examiner with 20 years of experience.
Analyze the provided English text and return ONLY a valid JSON object — no markdown, no explanation:

{
  "level": "B2",
  "description": "Upper-Intermediate — one sentence describing what this CEFR level means for the learner",
  "confidence": 87,
  "evidence": [
    "Specific observation about vocabulary range from THIS text (quote 1-2 words as examples)",
    "Specific observation about sentence structure or grammar complexity",
    "Specific observation about academic register or cohesion devices used",
    "Observation about lexical diversity or word choice precision"
  ],
  "vocabularyLevel": "B2",
  "grammarComplexity": "C1",
  "difficultWords": ["word1", "word2", "word3"]
}

Rules:
- level must be one of: A1, A2, B1, B2, C1, C2
- confidence is an integer from 60 to 97
- evidence must be specific to THIS submitted text — quote actual words or phrases found in it
- difficultWords: list up to 6 of the most advanced/uncommon words found in the text
- Return ONLY the JSON object, nothing else`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || text.trim().split(/\s+/).length < 10) {
      return NextResponse.json({ error: 'Text must be at least 10 words.' }, { status: 400 })
    }
    if (!API_KEY || !ENDPOINT) {
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
    }

    const url = `${ENDPOINT}/chat/completions`
    const payload = {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze the CEFR level of this English text:\n\n"${text.slice(0, 3000)}"` },
      ],
      temperature: 0.2,
      max_completion_tokens: 600,
      response_format: { type: 'json_object' },
    }

    console.log(`[CEFR Analyze] Calling Azure OpenAI — model: ${MODEL}`)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[CEFR Analyze] Azure error ${res.status}:`, errText)
      return NextResponse.json({ error: `AI error (${res.status})` }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'Empty AI response.' }, { status: 502 })
    }

    let result: Record<string, unknown>
    try {
      result = JSON.parse(content)
    } catch {
      console.error('[CEFR Analyze] Bad JSON:', content)
      return NextResponse.json({ error: 'AI returned invalid JSON.' }, { status: 502 })
    }

    console.log(`[CEFR Analyze] Done — level: ${result.level}, confidence: ${result.confidence}`)
    return NextResponse.json(result)

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[CEFR Analyze] Error:', message)
    return NextResponse.json({ error: 'Analysis failed.' }, { status: 500 })
  }
}
