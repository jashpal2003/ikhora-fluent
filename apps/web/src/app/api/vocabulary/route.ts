/**
 * GET /api/vocabulary
 * Serves the vocabulary JSON data from the vocab_data file.
 * This avoids bundling the large 1MB JSON file into the client bundle.
 */

import { NextResponse } from 'next/server'
import vocabularyData from '../../../../../../packages/database/vocab_data/vocabulary.json'

export async function GET() {
  try {
    return NextResponse.json(vocabularyData)
  } catch (err) {
    console.error('[/api/vocabulary] Failed to load vocab data:', err)
    // Return empty array if error occurs
    return NextResponse.json([])
  }
}
