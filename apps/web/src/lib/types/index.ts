// ============================================================
// IKHORA FLUENT — Shared Domain Types
// All data types used across the platform
// ============================================================

// ── ROLES ──────────────────────────────────────────────────
export type Role = 'student' | 'teacher' | 'institute_admin' | 'admin' | 'super_admin'

// ── CONTENT LIFECYCLE ──────────────────────────────────────
export type ContentStatus =
  | 'draft'
  | 'ai_quality_checked'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived'

export type ContentVisibility = 'global' | 'organization_private' | 'class_private'

// ── AI JOB LIFECYCLE ───────────────────────────────────────
export type AIJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'requires_review'

// ── SUBMISSION LIFECYCLE ───────────────────────────────────
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'queued'
  | 'processing'
  | 'scored'
  | 'teacher_reviewed'
  | 'failed'

// ── SKILL TYPES ────────────────────────────────────────────
export type Skill = 'writing' | 'speaking' | 'reading' | 'listening'
export type IELTSModule = 'academic' | 'general'
export type TaskType =
  | 'ACADEMIC_TASK_1'
  | 'ACADEMIC_TASK_2'
  | 'GENERAL_TASK_1'
  | 'GENERAL_TASK_2'

export type SpeakingPart = 1 | 2 | 3
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// ── USER ───────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: Role
  organizationId?: string
  avatarInitials?: string
  createdAt: string
  updatedAt: string
}

export interface StudentProfile {
  userId: string
  targetBand: number
  estimatedBand: number
  cefrLevel: CEFRLevel
  targetExam: 'IELTS' | 'CEFR' | 'TOEFL'
  ieltsModule?: IELTSModule
  streakDays: number
  totalPracticeMinutes: number
  joinedAt: string
  weakAreas: WeakArea[]
  skillBands: SkillBand[]
}

export interface TeacherProfile {
  userId: string
  organizationId?: string
  specializations: Skill[]
  totalClasses: number
  totalStudents: number
}

export interface WeakArea {
  id: string
  category: string
  skill: Skill
  frequency: number
  severity: 'high' | 'medium' | 'low'
  recommendation: string
}

export interface SkillBand {
  skill: Skill
  band: number
  trend: number[]
  lastUpdated: string
}

// ── ORGANIZATION ───────────────────────────────────────────
export interface Organization {
  id: string
  name: string
  slug: string
  plan: SubscriptionPlan
  seats: number
  usedSeats: number
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  branding?: {
    logoUrl?: string
    primaryColor?: string
    brandName?: string
  }
  createdAt: string
}

// ── CLASS ─────────────────────────────────────────────────
export interface Class {
  id: string
  name: string
  organizationId?: string
  teacherId: string
  studentCount: number
  avgBand?: number
  targetBand?: number
  createdAt: string
}

// ── CONTENT ITEMS ─────────────────────────────────────────
export interface ContentItem {
  id: string
  title: string
  skill: Skill
  type: TaskType | SpeakingPart | 'passage' | 'section' | 'cefr_tool'
  status: ContentStatus
  visibility: ContentVisibility
  organizationId?: string
  createdBy: string
  reviewedBy?: string
  cefrLevel?: CEFRLevel
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  aiQualityScore?: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// ── WRITING TASK ───────────────────────────────────────────
export interface WritingTask {
  id: string
  taskType: TaskType
  prompt: string
  imageNote?: string
  topic: string
  cefrLevel: CEFRLevel
  minWords: number
  suggestedMinutes: number
  status: ContentStatus
  visibility: ContentVisibility
  organizationId?: string
  createdBy: string
  createdAt: string
}

// ── SPEAKING PROMPT ────────────────────────────────────────
export interface SpeakingPrompt {
  id: string
  part: SpeakingPart
  question: string
  followUp?: string
  cueCardPoints?: string[]
  timeSeconds?: number
  topic: string
  cefrLevel: CEFRLevel
  status: ContentStatus
  visibility: ContentVisibility
  organizationId?: string
  createdBy: string
  createdAt: string
}

// ── READING PASSAGE ────────────────────────────────────────
export interface ReadingQuestion {
  id: string
  type:
    | 'true_false_not_given'
    | 'mcq'
    | 'sentence_completion'
    | 'matching_headings'
    | 'short_answer'
    | 'note_completion'
  question: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  marks: number
}

export interface ReadingPassage {
  id: string
  title: string
  text: string
  topic: string
  source?: string
  cefrLevel: CEFRLevel
  wordCount: number
  timeLimitMinutes: number
  questions: ReadingQuestion[]
  status: ContentStatus
  visibility: ContentVisibility
  organizationId?: string
  createdBy: string
  createdAt: string
}

// ── LISTENING SECTION ──────────────────────────────────────
export interface ListeningQuestion {
  id: string
  type: 'mcq' | 'form_completion' | 'matching' | 'note_completion' | 'map_labelling'
  question: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  marks: number
}

export interface ListeningSection {
  id: string
  sectionNumber: 1 | 2 | 3 | 4
  title: string
  topic: string
  audioUrl?: string
  audioStatus: 'available' | 'pending' | 'unavailable'
  transcript?: string
  questions: ListeningQuestion[]
  timeLimitSeconds: number
  cefrLevel: CEFRLevel
  status: ContentStatus
  visibility: ContentVisibility
  organizationId?: string
  createdBy: string
  createdAt: string
}

// ── SUBMISSION ─────────────────────────────────────────────
export interface CriterionScore {
  criterionId: string
  criterionLabel: string
  aiScore: number
  teacherScore?: number
}

export interface TeacherOverride {
  teacherId: string
  teacherName: string
  overallScore: number
  criterionOverrides: CriterionScore[]
  reason: string
  timestamp: string
  auditLogId: string
}

export interface Submission {
  id: string
  studentId: string
  skill: Skill
  contentId: string
  contentTitle: string
  taskType?: TaskType
  speakingPart?: SpeakingPart
  status: SubmissionStatus
  answerText?: string
  wordCount?: number
  audioUrl?: string
  durationSeconds?: number
  answers?: Record<string, string>
  aiJobId?: string
  scoreReport?: ScoreReport
  teacherOverride?: TeacherOverride
  submittedAt: string
  scoredAt?: string
  reviewedAt?: string
}

// ── SCORE REPORT ───────────────────────────────────────────
export interface ScoreReport {
  submissionId: string
  skill: Skill
  overallBand: number
  finalBand: number
  teacherReviewed: boolean
  confidence: number
  criteria: CriterionScore[]
  strengths: string[]
  weaknesses: string[]
  sentenceFeedback?: Array<{
    original: string
    issue: string
    suggestion: string
    category: string
  }>
  improvedVersion?: string
  modelAnswer?: string
  nextPractice: string[]
  metrics?: {
    wpm?: number
    fillerWords?: number
    longPauses?: number
    pronunciationScore?: number
    duration?: number
  }
  pronunciationFeedback?: string
  wordLevelIssues?: Array<{ word: string; issue: string }>
  generatedAt: string
}

// ── STUDY PLAN ─────────────────────────────────────────────
export interface StudyPlanTask {
  id: string
  day: string
  skill: Skill | 'grammar' | 'vocabulary' | 'review'
  activity: string
  type: 'practice' | 'drill' | 'study' | 'mock' | 'review'
  minutes: number
  contentId?: string
  done: boolean
  linkedSubmissionId?: string
}

export interface StudyPlan {
  id: string
  studentId: string
  targetBand: number
  currentBand: number
  weeklyHours: number
  estimatedWeeksToTarget: number
  weekStartDate: string
  tasks: StudyPlanTask[]
  focusAreas: WeakArea[]
  generatedAt: string
  generatedBy: 'ai' | 'teacher'
}

// ── ASSIGNMENT ─────────────────────────────────────────────
export interface Assignment {
  id: string
  title: string
  classId: string
  className: string
  teacherId: string
  skill: Skill
  contentId: string
  contentTitle: string
  dueDate: string
  totalStudents: number
  submittedCount: number
  status: 'active' | 'closed' | 'draft'
  createdAt: string
}

// ── AI JOB ────────────────────────────────────────────────
export interface AIJob {
  id: string
  type: 'writing_score' | 'speaking_score' | 'cefr_check' | 'content_qc' | 'study_plan' | 'level_adapt' | 'question_gen'
  status: AIJobStatus
  submissionId?: string
  contentId?: string
  studentId?: string
  model: string
  inputTokens?: number
  outputTokens?: number
  latencyMs?: number
  error?: string
  createdAt: string
  completedAt?: string
}

// ── SUBSCRIPTION PLAN ──────────────────────────────────────
export type SubscriptionPlan =
  | 'free'
  | 'student_pro'
  | 'teacher'
  | 'institute_starter'
  | 'institute_pro'
  | 'enterprise'

// ── AUDIT LOG ─────────────────────────────────────────────
export interface AuditLog {
  id: string
  actorId: string
  actorRole: Role
  action: string
  resourceType: string
  resourceId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  reason?: string
  timestamp: string
}

// ── CEFR TOOL ─────────────────────────────────────────────
export interface CEFRCheckerResult {
  level: CEFRLevel
  description: string
  confidence: number
  evidence: string[]
  vocabularyLevel: CEFRLevel
  grammarComplexity: CEFRLevel
  difficultWords: string[]
}

export interface CEFRAdaptorResult {
  targetLevel: CEFRLevel
  adaptedText: string
  changes: string[]
}

export interface ReadabilityResult {
  estimatedCEFR: CEFRLevel
  fleschScore: number
  avgSentenceLength: number
  avgWordLength: number
  lexicalDiversity: number
  academicVocabPercent: number
}

export interface GeneratedQuestion {
  type: 'MCQ' | 'True/False/Not Given' | 'Short Answer' | 'Sentence Completion'
  question: string
  options?: string[]
  answer: string
  explanation?: string
  reviewStatus: 'pending' | 'approved'
}

export interface QuestionGeneratorResult {
  questions: GeneratedQuestion[]
  passageTitle: string
  cefrLevel: CEFRLevel
}
