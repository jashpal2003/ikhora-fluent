// =============================================
// SHARED TYPE DEFINITIONS
// =============================================

// Writing scoring types
export interface WritingFeedbackJSON {
  overall_band: number
  criteria_scores: {
    task_achievement_or_response: number
    coherence_cohesion: number
    lexical_resource: number
    grammatical_range_accuracy: number
  }
  confidence: number
  strengths: string[]
  weaknesses: string[]
  sentence_feedback: Array<{
    original: string
    issue: string
    suggestion: string
    category: 'grammar' | 'vocabulary' | 'coherence' | 'task' | 'punctuation'
  }>
  improved_version: string
  model_answer: string
  next_practice: string[]
}

// Speaking scoring types
export interface SpeakingMetrics {
  audio_duration_seconds: number
  transcript_word_count: number
  words_per_minute: number
  long_pause_count: number
  filler_word_count: number
  self_correction_count: number
  pronunciation_score: number
  word_level_issues: Array<{
    word: string
    issue: string
    timestamp: number
    phoneme?: string
  }>
}

export interface SpeakingFeedbackJSON {
  overall_band: number
  criteria_scores: {
    fluency_coherence: number
    lexical_resource: number
    grammatical_range_accuracy: number
    pronunciation: number
  }
  confidence: number
  strengths: string[]
  weaknesses: string[]
  fluency_summary: string
  vocabulary_feedback: string
  grammar_feedback: string
  pronunciation_feedback: string
  next_practice: string[]
  metrics: SpeakingMetrics
}

// CEFR check types
export interface CEFRCheckResult {
  estimated_level: string
  confidence: number
  sub_level?: string
  evidence: string[]
  vocabulary_level: string
  sentence_complexity: string
  readability_score: number
  recommendations: string[]
}

// Content quality check
export interface ContentQualityCheck {
  overall_pass: boolean
  alignment_score: number
  clarity_score: number
  difficulty_estimate: string
  answer_consistency: boolean
  issues: string[]
  suggestions: string[]
  cefr_level_validated: string
  bias_flags: string[]
}

// Study plan
export interface StudyPlanItem {
  week: number
  day?: number
  skill: string
  activity: string
  contentType: string
  estimatedMinutes: number
  priority: 'high' | 'medium' | 'low'
}

export interface StudyPlan {
  targetBand: number
  targetDate?: string
  weeklyGoalMinutes: number
  items: StudyPlanItem[]
  focusAreas: string[]
}

// Teacher score override audit
export interface TeacherOverrideAudit {
  submission_id: string
  ai_score: number
  teacher_score: number
  final_score: number
  criteria_adjustments: Record<string, { ai: number; teacher: number }>
  override_reason: string
  teacher_id: string
  timestamp: string
}

// Pagination
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// API response
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Job status polling
export interface JobStatusResponse {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
  progress?: number
  result?: unknown
  error?: string
  createdAt: string
  completedAt?: string
}

// Blob upload
export interface BlobUploadUrl {
  uploadUrl: string
  blobPath: string
  expiresAt: string
}
