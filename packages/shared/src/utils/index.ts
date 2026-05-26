/**
 * Sanitize user input to prevent prompt injection attacks.
 * This strips any AI instruction-like patterns from user-submitted content.
 */
export function sanitizeUserInput(text: string): string {
  if (!text) return ''

  // Remove common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,
    /you\s+are\s+now\s+(a|an)/gi,
    /act\s+as\s+(a|an|if)/gi,
    /system\s*:\s*/gi,
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /###\s*(instruction|prompt|system)/gi,
    /new\s+instructions?:/gi,
    /override\s+(the|your)\s+(previous|above|prior)/gi,
    /forget\s+(your|the)\s+(previous|above|prior|all)/gi,
    /disregard\s+(previous|all|above|prior)/gi,
    /from\s+now\s+on\s+you\s+(are|will)/gi,
    /translate\s+the\s+above/gi,
    /repeat\s+the\s+above/gi,
    /reveal\s+your\s+(system\s+)?prompt/gi,
    /what\s+are\s+your\s+instructions/gi,
    /jailbreak/gi,
    /DAN\s+mode/gi,
    /developer\s+mode/gi,
  ]

  let sanitized = text
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[REMOVED]')
  }

  return sanitized.trim()
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Round to nearest 0.5 (IELTS band scoring)
 */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2
}

/**
 * Get IELTS band color
 */
export function getBandColor(band: number): string {
  if (band >= 7.5) return '#10b981' // emerald
  if (band >= 6.5) return '#22c55e' // green
  if (band >= 5.5) return '#f59e0b' // amber
  if (band >= 4.5) return '#f97316' // orange
  return '#ef4444' // red
}

/**
 * Get CEFR level from IELTS band estimate
 */
export function bandToCEFR(band: number): string {
  if (band >= 8.5) return 'C2'
  if (band >= 7.0) return 'C1'
  if (band >= 5.5) return 'B2'
  if (band >= 4.0) return 'B1'
  if (band >= 2.5) return 'A2'
  return 'A1'
}

/**
 * Format duration in seconds to human-readable
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

/**
 * Validate IELTS band score (0–9, increments of 0.5)
 */
export function isValidIELTSBand(band: number): boolean {
  return band >= 0 && band <= 9 && band % 0.5 === 0
}

/**
 * Get abbreviated skill label
 */
export function getSkillLabel(skill: string): string {
  const labels: Record<string, string> = {
    WRITING: 'Writing',
    SPEAKING: 'Speaking',
    READING: 'Reading',
    LISTENING: 'Listening',
    VOCABULARY: 'Vocabulary',
    GRAMMAR: 'Grammar',
    PRONUNCIATION: 'Pronunciation',
  }
  return labels[skill.toUpperCase()] || skill
}

/**
 * Generate a secure slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50)
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Calculate percentage improvement between two band scores
 */
export function bandImprovement(initial: number, current: number): { delta: number; percent: number } {
  const delta = current - initial
  const percent = initial > 0 ? ((delta / initial) * 100) : 0
  return { delta: Math.round(delta * 10) / 10, percent: Math.round(percent) }
}

/**
 * Detect filler words in a transcript
 */
export function detectFillerWords(transcript: string, fillerWords: string[]): { count: number; instances: Array<{ word: string; index: number }> } {
  const lower = transcript.toLowerCase()
  const instances: Array<{ word: string; index: number }> = []

  for (const filler of fillerWords) {
    let pos = 0
    while ((pos = lower.indexOf(filler, pos)) !== -1) {
      instances.push({ word: filler, index: pos })
      pos += filler.length
    }
  }

  return { count: instances.length, instances }
}
