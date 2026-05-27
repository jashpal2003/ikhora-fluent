/**
 * GET /api/vocabulary
 * Serves the vocabulary JSON data from the vocab_data file.
 * This avoids bundling the large 1MB JSON file into the client bundle.
 */

import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

let cachedData: any = null

export async function GET() {
  try {
    if (!cachedData) {
      // Path relative to the project root (monorepo)
      const filePath = join(process.cwd(), '..', '..', 'packages', 'database', 'vocab_data', 'vocabulary.json')
      const raw = readFileSync(filePath, 'utf-8')
      cachedData = JSON.parse(raw)
    }
    return NextResponse.json(cachedData)
  } catch (err) {
    console.error('[/api/vocabulary] Failed to load vocab data:', err)
    // Return empty array if file not found
    return NextResponse.json([])
  }
}
