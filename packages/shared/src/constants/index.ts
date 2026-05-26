// =============================================
// IELTS BAND DESCRIPTORS
// =============================================
export const IELTS_BANDS = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const

export const IELTS_WRITING_CRITERIA = {
  TASK_ACHIEVEMENT: 'task_achievement_or_response',
  COHERENCE_COHESION: 'coherence_cohesion',
  LEXICAL_RESOURCE: 'lexical_resource',
  GRAMMATICAL_RANGE_ACCURACY: 'grammatical_range_accuracy',
} as const

export const IELTS_SPEAKING_CRITERIA = {
  FLUENCY_COHERENCE: 'fluency_coherence',
  LEXICAL_RESOURCE: 'lexical_resource',
  GRAMMATICAL_RANGE_ACCURACY: 'grammatical_range_accuracy',
  PRONUNCIATION: 'pronunciation',
} as const

// =============================================
// CEFR LEVELS
// =============================================
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CEFRLevelString = (typeof CEFR_LEVELS)[number]

export const CEFR_LEVEL_DESCRIPTIONS: Record<CEFRLevelString, string> = {
  A1: 'Beginner — Basic phrases and expressions',
  A2: 'Elementary — Simple familiar topics',
  B1: 'Intermediate — Familiar matters regularly encountered',
  B2: 'Upper-Intermediate — Complex text, abstract topics',
  C1: 'Advanced — Fluent, flexible, effective use',
  C2: 'Mastery — Near-native precision and fluency',
}

// =============================================
// PLAN LIMITS (defaults, overridable in DB)
// =============================================
export const PLAN_LIMITS = {
  FREE: {
    writingChecksMonthly: 3,
    speakingMinutesMonthly: 10,
    aiCreditsMonthly: 50,
    contentImportsMonthly: 0,
    seatLimit: 1,
    storageGb: 1,
  },
  STUDENT_PRO: {
    writingChecksMonthly: 100,
    speakingMinutesMonthly: 300,
    aiCreditsMonthly: 1000,
    contentImportsMonthly: 0,
    seatLimit: 1,
    storageGb: 5,
  },
  INSTITUTE_STARTER: {
    writingChecksMonthly: 500,
    speakingMinutesMonthly: 1000,
    aiCreditsMonthly: 5000,
    contentImportsMonthly: 100,
    seatLimit: 50,
    storageGb: 20,
  },
  INSTITUTE_PRO: {
    writingChecksMonthly: 5000,
    speakingMinutesMonthly: 10000,
    aiCreditsMonthly: 50000,
    contentImportsMonthly: 1000,
    seatLimit: 500,
    storageGb: 100,
  },
  ENTERPRISE: {
    writingChecksMonthly: -1, // unlimited
    speakingMinutesMonthly: -1,
    aiCreditsMonthly: -1,
    contentImportsMonthly: -1,
    seatLimit: -1,
    storageGb: -1,
  },
} as const

// =============================================
// AI MODEL CONFIG
// =============================================
export const AI_TASK_CONFIG = {
  WRITING_SCORE: { effort: 'high', timeout: 60 },
  SPEAKING_SCORE: { effort: 'high', timeout: 60 },
  CEFR_CHECK: { effort: 'medium', timeout: 45 },
  CEFR_ADAPT: { effort: 'medium', timeout: 45 },
  READABILITY_CHECK: { effort: 'low', timeout: 30 },
  QUESTION_GENERATE: { effort: 'medium', timeout: 60 },
  STUDY_PLAN_GENERATE: { effort: 'medium', timeout: 45 },
  CONTENT_QUALITY_CHECK: { effort: 'medium', timeout: 45 },
} as const

// =============================================
// ROUTES
// =============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  WRITING: '/writing',
  SPEAKING: '/speaking',
  READING: '/reading',
  LISTENING: '/listening',
  CEFR: '/cefr',
  STUDY_PLAN: '/study-plan',
  REPORTS: '/reports',
  TEACHER: {
    DASHBOARD: '/teacher',
    CLASSES: '/teacher/classes',
    ASSIGNMENTS: '/teacher/assignments',
    REVIEWS: '/teacher/reviews',
    CONTENT: '/teacher/content',
    REPORTS: '/teacher/reports',
  },
  INSTITUTE: {
    WORKSPACE: '/institute',
    USERS: '/institute/users',
    CLASSES: '/institute/classes',
    CONTENT: '/institute/content',
    REPORTS: '/institute/reports',
    BRANDING: '/institute/branding',
    BILLING: '/institute/billing',
  },
  ADMIN: {
    OVERVIEW: '/admin',
    ORGS: '/admin/organizations',
    USERS: '/admin/users',
    CONTENT: '/admin/content',
    REVIEW_QUEUE: '/admin/review-queue',
    AI_JOBS: '/admin/ai-jobs',
    BILLING: '/admin/billing',
    AUDIT: '/admin/audit-logs',
  },
  VERIFY_CERT: '/verify',
} as const

// =============================================
// FILLER WORDS (for speaking analysis)
// =============================================
export const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically',
  'literally', 'actually', 'sort of', 'kind of', 'i mean',
  'right', 'so yeah', 'well', 'hmm',
]

// =============================================
// TOPIC TAGS (curated list)
// =============================================
export const TOPIC_TAGS = [
  'environment', 'climate_change', 'technology', 'education', 'health',
  'society', 'culture', 'travel', 'food', 'work', 'family', 'government',
  'economics', 'media', 'science', 'sport', 'art', 'history', 'personal_experience',
  'urban_rural', 'globalization', 'inequality', 'transport', 'housing',
] as const
