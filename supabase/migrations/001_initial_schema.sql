-- ============================================================
-- IKHORA FLUENT — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. PROFILES (extends auth.users) ─────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'teacher', 'institute_admin', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. STUDENT PROFILES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id                UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  target_band            NUMERIC(2,1) NOT NULL DEFAULT 7.0,
  estimated_band         NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  cefr_level             TEXT NOT NULL DEFAULT 'B1',
  ielts_module           TEXT NOT NULL DEFAULT 'academic'
                           CHECK (ielts_module IN ('academic', 'general')),
  streak_days            INT NOT NULL DEFAULT 0,
  last_practice_date     DATE,
  total_practice_minutes INT NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. SUBMISSIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill            TEXT NOT NULL CHECK (skill IN ('writing', 'speaking', 'reading', 'listening')),
  content_id       TEXT NOT NULL,
  content_title    TEXT NOT NULL,
  task_type        TEXT,
  status           TEXT NOT NULL DEFAULT 'submitted'
                     CHECK (status IN ('draft','submitted','queued','processing','scored','teacher_reviewed','failed')),
  answer_text      TEXT,
  word_count       INT,
  answers          JSONB,
  audio_url        TEXT,
  duration_seconds INT,
  mock_test_id     UUID,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  scored_at        TIMESTAMPTZ
);

-- ── 4. SCORE REPORTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.score_reports (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id     UUID REFERENCES public.submissions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill             TEXT NOT NULL,
  overall_band      NUMERIC(2,1) NOT NULL,
  final_band        NUMERIC(2,1) NOT NULL,
  confidence        NUMERIC(4,3),
  criteria          JSONB NOT NULL,
  strengths         JSONB,
  weaknesses        JSONB,
  sentence_feedback JSONB,
  improved_version  TEXT,
  next_practice     JSONB,
  metrics           JSONB,
  teacher_reviewed  BOOLEAN NOT NULL DEFAULT false,
  teacher_band      NUMERIC(2,1),
  source            TEXT DEFAULT 'azure-openai',
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. MOCK TESTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module              TEXT NOT NULL DEFAULT 'academic'
                        CHECK (module IN ('academic', 'general')),
  status              TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress','scoring','completed','abandoned')),
  listening_band      NUMERIC(2,1),
  reading_band        NUMERIC(2,1),
  writing_band        NUMERIC(2,1),
  speaking_band       NUMERIC(2,1),
  overall_band        NUMERIC(2,1),
  time_taken_minutes  INT,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  report              JSONB
);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_skill ON public.submissions(skill);
CREATE INDEX IF NOT EXISTS idx_submissions_mock_test_id ON public.submissions(mock_test_id);
CREATE INDEX IF NOT EXISTS idx_score_reports_user_id ON public.score_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_score_reports_submission_id ON public.score_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON public.mock_tests(user_id);

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests       ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- student_profiles
CREATE POLICY "Students can view own profile"
  ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own profile"
  ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own profile"
  ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- submissions
CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions"
  ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE USING (auth.uid() = user_id);

-- score_reports
CREATE POLICY "Users can view own score reports"
  ON public.score_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert score reports"
  ON public.score_reports FOR INSERT WITH CHECK (true); -- server-side only, protected by service role

-- mock_tests
CREATE POLICY "Users can view own mock tests"
  ON public.mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mock tests"
  ON public.mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mock tests"
  ON public.mock_tests FOR UPDATE USING (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────
-- This function auto-creates a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );

  -- Also create student_profile for student role
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.student_profiles (user_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: runs after every new auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── UPDATE streak trigger ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET
    streak_days = CASE
      WHEN last_practice_date = CURRENT_DATE - 1 THEN streak_days + 1
      WHEN last_practice_date = CURRENT_DATE THEN streak_days
      ELSE 1
    END,
    last_practice_date = CURRENT_DATE,
    total_practice_minutes = total_practice_minutes + 5,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_submission_update_streak ON public.submissions;
CREATE TRIGGER on_submission_update_streak
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();
