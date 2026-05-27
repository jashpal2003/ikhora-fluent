/**
 * Supabase Database Types — Ikhora Fluent
 * Auto-maintained type definitions for all Supabase tables.
 * Run `pnpm supabase gen types typescript` to regenerate from live schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'student' | 'teacher' | 'institute_admin' | 'admin'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'student' | 'teacher' | 'institute_admin' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'student' | 'teacher' | 'institute_admin' | 'admin'
          avatar_url?: string | null
        }
      }
      student_profiles: {
        Row: {
          user_id: string
          target_band: number
          estimated_band: number
          cefr_level: string
          ielts_module: string
          streak_days: number
          last_practice_date: string | null
          total_practice_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          target_band?: number
          estimated_band?: number
          cefr_level?: string
          ielts_module?: string
          streak_days?: number
          last_practice_date?: string | null
          total_practice_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          target_band?: number
          estimated_band?: number
          cefr_level?: string
          ielts_module?: string
          streak_days?: number
          last_practice_date?: string | null
          total_practice_minutes?: number
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          skill: string
          content_id: string
          content_title: string
          task_type: string | null
          status: string
          answer_text: string | null
          word_count: number | null
          answers: Json | null
          audio_url: string | null
          duration_seconds: number | null
          mock_test_id: string | null
          submitted_at: string
          scored_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          skill: string
          content_id: string
          content_title: string
          task_type?: string | null
          status?: string
          answer_text?: string | null
          word_count?: number | null
          answers?: Json | null
          audio_url?: string | null
          duration_seconds?: number | null
          mock_test_id?: string | null
          submitted_at?: string
          scored_at?: string | null
        }
        Update: {
          status?: string
          answer_text?: string | null
          word_count?: number | null
          answers?: Json | null
          scored_at?: string | null
        }
      }
      score_reports: {
        Row: {
          id: string
          submission_id: string
          user_id: string
          skill: string
          overall_band: number
          final_band: number
          confidence: number | null
          criteria: Json
          strengths: Json | null
          weaknesses: Json | null
          sentence_feedback: Json | null
          improved_version: string | null
          next_practice: Json | null
          metrics: Json | null
          teacher_reviewed: boolean
          teacher_band: number | null
          source: string | null
          generated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          user_id: string
          skill: string
          overall_band: number
          final_band: number
          confidence?: number | null
          criteria: Json
          strengths?: Json | null
          weaknesses?: Json | null
          sentence_feedback?: Json | null
          improved_version?: string | null
          next_practice?: Json | null
          metrics?: Json | null
          teacher_reviewed?: boolean
          teacher_band?: number | null
          source?: string | null
          generated_at?: string
        }
        Update: {
          overall_band?: number
          final_band?: number
          teacher_reviewed?: boolean
          teacher_band?: number | null
        }
      }
      mock_tests: {
        Row: {
          id: string
          user_id: string
          module: string
          status: string
          listening_band: number | null
          reading_band: number | null
          writing_band: number | null
          speaking_band: number | null
          overall_band: number | null
          time_taken_minutes: number | null
          started_at: string
          completed_at: string | null
          report: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          module?: string
          status?: string
          listening_band?: number | null
          reading_band?: number | null
          writing_band?: number | null
          speaking_band?: number | null
          overall_band?: number | null
          time_taken_minutes?: number | null
          started_at?: string
          completed_at?: string | null
          report?: Json | null
        }
        Update: {
          status?: string
          listening_band?: number | null
          reading_band?: number | null
          writing_band?: number | null
          speaking_band?: number | null
          overall_band?: number | null
          time_taken_minutes?: number | null
          completed_at?: string | null
          report?: Json | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ── Convenience row types ──────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row']
export type StudentProfileRow = Database['public']['Tables']['student_profiles']['Row']
export type SubmissionRow = Database['public']['Tables']['submissions']['Row']
export type ScoreReportRow = Database['public']['Tables']['score_reports']['Row']
export type MockTestRow = Database['public']['Tables']['mock_tests']['Row']
