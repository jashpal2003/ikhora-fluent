/**
 * Supabase Database Types — Ikhora Fluent
 * Matches migration 002_full_schema_rls.sql
 * Run `pnpm supabase gen types typescript` to regenerate from live schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'student' | 'teacher' | 'institute_admin' | 'admin'
export type OrgRole = 'STUDENT' | 'TEACHER' | 'ORG_ADMIN' | 'REVIEWER'
export type OrgMemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type Skill = 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING' | 'GRAMMAR' | 'VOCABULARY' | 'PRONUNCIATION'
export type Exam = 'IELTS' | 'CEFR' | 'TOEFL' | 'PTE' | 'DET'
export type SubmissionType = 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING' | 'CEFR_PLACEMENT'
export type SubmissionStatus = 'SUBMITTED' | 'PROCESSING' | 'SCORED' | 'REVIEW_REQUIRED' | 'TEACHER_REVIEWED' | 'FINAL'
export type ContentVisibility = 'PRIVATE' | 'ORGANIZATION' | 'GLOBAL'
export type ReviewStatus = 'DRAFT' | 'AI_CHECKED' | 'HUMAN_REVIEWED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; email: string; name: string; hashed_password: string | null
          global_role: 'user' | 'super_admin'; auth_provider: string; email_verified: boolean
          avatar_url: string | null; native_language: string | null; target_exam: string | null
          target_band: number | null; timezone: string; created_at: string; updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string; email: string; name: string; hashed_password?: string | null
          global_role?: 'user' | 'super_admin'; auth_provider?: string; email_verified?: boolean
          avatar_url?: string | null; native_language?: string | null; target_exam?: string | null
          target_band?: number | null; timezone?: string
        }
        Update: {
          name?: string; avatar_url?: string | null; native_language?: string | null
          target_exam?: string | null; target_band?: number | null; timezone?: string
          email_verified?: boolean; last_login_at?: string | null
        }
      }
      organizations: {
        Row: {
          id: string; name: string; slug: string; logo_url: string | null
          primary_color: string; website: string | null; description: string | null
          data_improvement_mode: string; is_active: boolean; plan_id: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; name: string; slug: string; logo_url?: string | null
          primary_color?: string; website?: string | null; description?: string | null
          plan_id?: string | null
        }
        Update: {
          name?: string; slug?: string; logo_url?: string | null; primary_color?: string
          website?: string | null; description?: string | null; is_active?: boolean
        }
      }
      organization_members: {
        Row: {
          organization_id: string; user_id: string; role: OrgRole
          status: OrgMemberStatus; invited_at: string | null
          joined_at: string | null; created_at: string
        }
        Insert: {
          organization_id: string; user_id: string; role?: OrgRole
          status?: OrgMemberStatus; invited_at?: string | null; joined_at?: string | null
        }
        Update: { role?: OrgRole; status?: OrgMemberStatus; joined_at?: string | null }
      }
      classes: {
        Row: {
          id: string; organization_id: string; name: string; description: string | null
          target_exam: string | null; target_level: string | null
          is_archived: boolean; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; organization_id: string; name: string; description?: string | null
          target_exam?: string | null; target_level?: string | null
        }
        Update: { name?: string; description?: string | null; is_archived?: boolean }
      }
      class_members: {
        Row: { class_id: string; user_id: string; role: OrgRole; joined_at: string }
        Insert: { class_id: string; user_id: string; role?: OrgRole }
        Update: { role?: OrgRole }
      }
      content_items: {
        Row: {
          id: string; owner_type: string; organization_id: string | null
          created_by_id: string; approved_by_id: string | null; content_type: string
          exam: string | null; skill: string; module: string | null; question_type: string | null
          title: string | null; body: string; body_html: string | null; options: Json | null
          answer_key: Json | null; explanation: string | null; model_answer: string | null
          cefr_level: string | null; difficulty: number | null; topic_tags: string[]
          grammar_targets: string[]; vocabulary_targets: string[]; source_type: string
          source_notes: string | null; visibility: ContentVisibility; review_status: ReviewStatus
          current_version: number; audio_url: string | null; image_url: string | null
          audio_transcript: string | null; accent_metadata: string | null; word_count: number | null
          estimated_minutes: number | null; is_active: boolean; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; owner_type?: string; organization_id?: string | null
          created_by_id: string; content_type: string; skill: string; title?: string | null
          body: string; options?: Json | null; answer_key?: Json | null
          cefr_level?: string | null; visibility?: ContentVisibility; review_status?: ReviewStatus
          audio_url?: string | null; image_url?: string | null
        }
        Update: {
          title?: string | null; body?: string; options?: Json | null; answer_key?: Json | null
          visibility?: ContentVisibility; review_status?: ReviewStatus; is_active?: boolean
        }
      }
      content_versions: {
        Row: {
          id: string; content_item_id: string; version: number; body: string
          options: Json | null; answer_key: Json | null; explanation: string | null
          change_notes: string | null; created_by_id: string; created_at: string
        }
        Insert: {
          id?: string; content_item_id: string; version: number; body: string
          created_by_id: string; options?: Json | null; answer_key?: Json | null
        }
        Update: Record<string, never>
      }
      content_reviews: {
        Row: {
          id: string; content_item_id: string; reviewed_by_id: string
          review_type: string; status: string; notes: string | null
          ai_check_results: Json | null; created_at: string
        }
        Insert: {
          id?: string; content_item_id: string; reviewed_by_id: string
          review_type: string; status: string; notes?: string | null
        }
        Update: { status?: string; notes?: string | null }
      }
      assignments: {
        Row: {
          id: string; organization_id: string | null; class_id: string | null
          teacher_id: string; title: string; description: string | null
          instructions: string | null; due_at: string | null; available_from: string | null
          max_attempts: number; time_limit: number | null; is_published: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; organization_id?: string | null; class_id?: string | null
          teacher_id: string; title: string; description?: string | null
          instructions?: string | null; due_at?: string | null; is_published?: boolean
        }
        Update: {
          title?: string; description?: string | null; due_at?: string | null
          is_published?: boolean
        }
      }
      assignment_items: {
        Row: {
          id: string; assignment_id: string; content_item_id: string
          sort_order: number; rubric_override: Json | null; created_at: string
        }
        Insert: {
          id?: string; assignment_id: string; content_item_id: string
          sort_order?: number; rubric_override?: Json | null
        }
        Update: Record<string, never>
      }
      submissions: {
        Row: {
          id: string; user_id: string; organization_id: string | null
          assignment_id: string | null; content_item_id: string | null; content_version: number | null
          type: SubmissionType; status: SubmissionStatus; input_text: string | null
          word_count: number | null; transcript: string | null
          audio_duration_seconds: number | null; words_per_minute: number | null
          long_pause_count: number | null; filler_word_count: number | null
          self_correction_count: number | null; pronunciation_score: number | null
          answers: Json | null; time_taken_seconds: number | null; cefr_input: string | null
          attempt_number: number; ip_address: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; user_id: string; organization_id?: string | null
          assignment_id?: string | null; content_item_id?: string | null
          type: SubmissionType; status?: SubmissionStatus; input_text?: string | null
          word_count?: number | null; transcript?: string | null
          audio_duration_seconds?: number | null; answers?: Json | null
          time_taken_seconds?: number | null; cefr_input?: string | null
        }
        Update: { status?: SubmissionStatus; transcript?: string | null }
      }
      submission_files: {
        Row: {
          id: string; submission_id: string; file_type: string; blob_url: string
          blob_path: string; file_name: string; mime_type: string
          file_size_bytes: number | null; duration_seconds: number | null; created_at: string
        }
        Insert: {
          id?: string; submission_id: string; file_type: string; blob_url: string
          blob_path: string; file_name: string; mime_type: string
          file_size_bytes?: number | null; duration_seconds?: number | null
        }
        Update: Record<string, never>
      }
      scores: {
        Row: {
          id: string; submission_id: string; teacher_id: string | null
          ai_overall_score: number | null; teacher_overall_score: number | null
          final_score: number | null; cefr_level: string | null
          criteria_scores: Json | null; confidence: number | null
          override_reason: string | null; criteria_adjustments: Json | null
          scored_by_model: string | null; ai_job_id: string | null
          is_teacher_override: boolean; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; submission_id: string; teacher_id?: string | null
          ai_overall_score?: number | null; teacher_overall_score?: number | null
          final_score?: number | null; cefr_level?: string | null
          criteria_scores?: Json | null; confidence?: number | null
          scored_by_model?: string | null; ai_job_id?: string | null
        }
        Update: {
          teacher_overall_score?: number | null; final_score?: number | null
          criteria_adjustments?: Json | null; override_reason?: string | null
          is_teacher_override?: boolean
        }
      }
      feedback: {
        Row: {
          id: string; submission_id: string; feedback_version: number
          strengths: string[]; weaknesses: string[]; sentence_feedback: Json | null
          word_level_issues: Json | null; improved_version: string | null
          model_answer: string | null; next_practice: Json | null
          study_plan_items: Json | null; teacher_comments: string | null; created_at: string
        }
        Insert: {
          id?: string; submission_id: string; strengths?: string[]; weaknesses?: string[]
          sentence_feedback?: Json | null; improved_version?: string | null
          model_answer?: string | null; next_practice?: Json | null
          teacher_comments?: string | null
        }
        Update: { teacher_comments?: string | null }
      }
      student_skill_profiles: {
        Row: {
          id: string; user_id: string; estimated_cefr: string | null
          cefr_confidence: number | null; estimated_band: number | null
          band_confidence: number | null; writing_band: number | null
          speaking_band: number | null; reading_band: number | null
          listening_band: number | null; weak_skills: string[]
          weak_grammar_areas: string[]; weak_vocab_areas: string[]
          streak_days: number; last_activity_at: string | null
          total_practice_hours: number; total_submissions: number
          study_plan: Json | null; recommendations: Json | null; updated_at: string
        }
        Insert: { id?: string; user_id: string }
        Update: {
          estimated_cefr?: string | null; estimated_band?: number | null
          writing_band?: number | null; speaking_band?: number | null
          reading_band?: number | null; listening_band?: number | null
          weak_skills?: string[]; study_plan?: Json | null; recommendations?: Json | null
        }
      }
      ai_jobs: {
        Row: {
          id: string; submission_id: string | null; organization_id: string | null
          job_type: string; status: string; priority: number
          input_data: Json | null; output_data: Json | null; error_message: string | null
          model_deployment: string | null; input_tokens: number | null
          output_tokens: number | null; cost_usd: number | null
          attempt_count: number; max_attempts: number
          started_at: string | null; completed_at: string | null; created_at: string
        }
        Insert: {
          id?: string; submission_id?: string | null; organization_id?: string | null
          job_type: string; status?: string; input_data?: Json | null
        }
        Update: { status?: string; output_data?: Json | null; error_message?: string | null }
      }
      ai_job_logs: {
        Row: {
          id: string; job_id: string; level: string; message: string
          data: Json | null; created_at: string
        }
        Insert: { id?: string; job_id: string; level: string; message: string; data?: Json | null }
        Update: Record<string, never>
      }
      certificates: {
        Row: {
          id: string; user_id: string; organization_id: string | null
          submission_id: string | null; certificate_type: string; cefr_level: string | null
          estimated_band: number | null; title: string; issuer_name: string
          verify_token: string; verify_url: string | null; pdf_url: string | null
          status: string; issued_at: string; expires_at: string | null
          revoked_at: string | null; revoked_reason: string | null
        }
        Insert: {
          id?: string; user_id: string; certificate_type: string; title: string
          organization_id?: string | null; submission_id?: string | null
          cefr_level?: string | null; estimated_band?: number | null
        }
        Update: { status?: string; revoked_at?: string | null; revoked_reason?: string | null }
      }
      plans: {
        Row: {
          id: string; name: string; tier: string; stripe_price_id: string | null
          monthly_price_cents: number | null; annual_price_cents: number | null
          seat_limit: number | null; writing_checks_monthly: number | null
          speaking_minutes_monthly: number | null; is_active: boolean; created_at: string
        }
        Insert: { id?: string; name: string; tier: string }
        Update: { is_active?: boolean }
      }
      subscriptions: {
        Row: {
          id: string; organization_id: string; plan_id: string; status: string
          stripe_sub_id: string | null; stripe_customer_id: string | null
          current_period_start: string | null; current_period_end: string | null
          trial_ends_at: string | null; cancelled_at: string | null
          seat_count: number; created_at: string; updated_at: string
        }
        Insert: { id?: string; organization_id: string; plan_id: string; status?: string }
        Update: { status?: string; seat_count?: number }
      }
      reports: {
        Row: {
          id: string; organization_id: string | null; user_id: string | null
          class_id: string | null; report_type: string; title: string
          data: Json; pdf_url: string | null; generated_at: string
        }
        Insert: {
          id?: string; report_type: string; title: string; data: Json
          organization_id?: string | null; user_id?: string | null
        }
        Update: Record<string, never>
      }
      audit_logs: {
        Row: {
          id: string; actor_id: string | null; organization_id: string | null
          action: string; target_type: string | null; target_id: string | null
          metadata: Json | null; ip_address: string | null; user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string; action: string; actor_id?: string | null
          organization_id?: string | null; target_type?: string | null
          target_id?: string | null; metadata?: Json | null
        }
        Update: Record<string, never>
      }
    }
    Views: Record<string, never>
    Functions: {
      user_role: { Args: Record<string, never>; Returns: string }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      org_role: { Args: { org_id: string }; Returns: string }
    }
    Enums: Record<string, never>
  }
}

// ── Convenience row types ──────────────────────────────────
export type User = Database['public']['Tables']['users']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type ClassMember = Database['public']['Tables']['class_members']['Row']
export type ContentItem = Database['public']['Tables']['content_items']['Row']
export type Assignment = Database['public']['Tables']['assignments']['Row']
export type AssignmentItem = Database['public']['Tables']['assignment_items']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type SubmissionFile = Database['public']['Tables']['submission_files']['Row']
export type Score = Database['public']['Tables']['scores']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type StudentSkillProfile = Database['public']['Tables']['student_skill_profiles']['Row']
export type AIJob = Database['public']['Tables']['ai_jobs']['Row']
export type Certificate = Database['public']['Tables']['certificates']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
