/**
 * GET /api/ai/test
 * Diagnostic route — tests Azure OpenAI connection.
 * Uses hardcoded correct endpoint as absolute fallback in case system env vars conflict.
 */

import { NextResponse } from 'next/server'

const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ''
const API_KEY = process.env.AZURE_OPENAI_API_KEY || ''
const MODEL = process.env.AI_PRIMARY_DEPLOYMENT ?? 'gpt-5.4-mini'

export async function GET() {
  try {
    const url = `${ENDPOINT}/chat/completions`
    const start = Date.now()

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Reply with only the word: CONNECTED' }],
        max_completion_tokens: 10,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(15000),
    })

    const latencyMs = Date.now() - start

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({
        status: 'error',
        stage: 'api_call',
        httpStatus: res.status,
        azureError: errText,
        endpoint: ENDPOINT,
        model: MODEL,
      })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? '(empty)'

    return NextResponse.json({
      status: 'ok',
      message: '✅ Azure OpenAI is working correctly',
      model: MODEL,
      endpoint: ENDPOINT,
      latencyMs,
      modelReply: reply,
      tokensUsed: data.usage?.total_tokens ?? 'n/a',
      envSource: process.env.AZURE_OPENAI_ENDPOINT?.includes('jashp') ? '.env.local' : 'hardcoded-fallback',
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      stage: 'fetch_exception',
      error: message,
      endpoint: ENDPOINT,
      model: MODEL,
    })
  }
}
