-- ============================================================
-- IKHORA FLUENT — Full Schema + RLS (Migration 002)
-- Run in Supabase SQL Editor. Replaces 001_initial_schema.
-- ============================================================

-- ── CLEAN UP old 001 tables (safe if they don't exist) ────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_submission_update_streak ON public.submissions;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_streak() CASCADE;
DROP TABLE IF EXISTS public.score_reports CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.mock_tests CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ── USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  hashed_password TEXT,
  global_role     TEXT NOT NULL DEFAULT 'user' CHECK (global_role IN ('user', 'super_admin')),
  auth_provider   TEXT NOT NULL DEFAULT 'supabase',
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  avatar_url      TEXT,
  native_language TEXT,
  target_exam     TEXT,
  target_band     NUMERIC(3,1),
  timezone        TEXT DEFAULT 'UTC',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ
);

-- ── ORGANIZATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  logo_url              TEXT,
  primary_color         TEXT DEFAULT '#6366f1',
  website               TEXT,
  description           TEXT,
  data_improvement_mode TEXT NOT NULL DEFAULT 'DISABLED',
  is_active             BOOLEAN NOT NULL DEFAULT true,
  plan_id               UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ORGANIZATION MEMBERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER', 'ORG_ADMIN', 'REVIEWER')),
  status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVITED', 'SUSPENDED')),
  invited_at      TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- ── RLS HELPER FUNCTIONS ──────────────────────────────────
-- Returns the user's highest role across all org memberships
CREATE OR REPLACE FUNCTION public.user_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.organization_members
     WHERE user_id = auth.uid() AND status = 'ACTIVE'
     ORDER BY CASE role
       WHEN 'ORG_ADMIN' THEN 1
       WHEN 'TEACHER' THEN 2
       WHEN 'REVIEWER' THEN 3
       WHEN 'STUDENT' THEN 4
       ELSE 5
     END
     LIMIT 1),
    'STUDENT'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid() AND status = 'ACTIVE'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.org_role(org_id UUID) RETURNS TEXT AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = org_id AND user_id = auth.uid() AND status = 'ACTIVE';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── CLASSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  target_exam     TEXT,
  target_level    TEXT,
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CLASS MEMBERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.class_members (
  class_id  UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER', 'ORG_ADMIN', 'REVIEWER')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, user_id)
);

-- ── CONTENT ITEMS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type         TEXT NOT NULL DEFAULT 'GLOBAL',
  organization_id    UUID REFERENCES public.organizations(id),
  created_by_id      UUID NOT NULL REFERENCES public.users(id),
  approved_by_id     UUID REFERENCES public.users(id),
  content_type       TEXT NOT NULL,
  exam               TEXT,
  skill              TEXT NOT NULL,
  module             TEXT,
  question_type      TEXT,
  title              TEXT,
  body               TEXT NOT NULL,
  body_html          TEXT,
  options            JSONB,
  answer_key         JSONB,
  explanation        TEXT,
  model_answer       TEXT,
  cefr_level         TEXT,
  difficulty         NUMERIC(3,2) DEFAULT 0.5,
  topic_tags         TEXT[] DEFAULT '{}',
  grammar_targets    TEXT[] DEFAULT '{}',
  vocabulary_targets TEXT[] DEFAULT '{}',
  source_type        TEXT DEFAULT 'MANUAL',
  source_notes       TEXT,
  visibility         TEXT DEFAULT 'PRIVATE',
  review_status      TEXT DEFAULT 'DRAFT',
  current_version    INT DEFAULT 1,
  audio_url          TEXT,
  image_url          TEXT,
  audio_transcript   TEXT,
  accent_metadata    TEXT,
  word_count         INT,
  estimated_minutes  NUMERIC(5,1),
  is_active          BOOLEAN DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CONTENT VERSIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  version         INT NOT NULL,
  body            TEXT NOT NULL,
  options         JSONB,
  answer_key      JSONB,
  explanation     TEXT,
  change_notes    TEXT,
  created_by_id   UUID NOT NULL REFERENCES public.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_item_id, version)
);

-- ── CONTENT REVIEWS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  reviewed_by_id  UUID NOT NULL REFERENCES public.users(id),
  review_type     TEXT NOT NULL,
  status          TEXT NOT NULL,
  notes           TEXT,
  ai_check_results JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ASSIGNMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  class_id        UUID REFERENCES public.classes(id),
  teacher_id      UUID NOT NULL REFERENCES public.users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  instructions    TEXT,
  due_at          TIMESTAMPTZ,
  available_from  TIMESTAMPTZ,
  max_attempts    INT DEFAULT 1,
  time_limit      INT,
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ASSIGNMENT ITEMS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignment_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id),
  sort_order      INT NOT NULL DEFAULT 0,
  rubric_override JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SUBMISSIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id),
  organization_id       UUID REFERENCES public.organizations(id),
  assignment_id         UUID REFERENCES public.assignments(id),
  content_item_id       UUID REFERENCES public.content_items(id),
  content_version       INT,
  type                  TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'SUBMITTED',
  input_text            TEXT,
  word_count            INT,
  transcript            TEXT,
  audio_duration_seconds NUMERIC(8,2),
  words_per_minute      NUMERIC(6,2),
  long_pause_count      INT,
  filler_word_count     INT,
  self_correction_count INT,
  pronunciation_score   NUMERIC(4,2),
  answers               JSONB,
  time_taken_seconds    INT,
  cefr_input            TEXT,
  attempt_number        INT DEFAULT 1,
  ip_address            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SUBMISSION FILES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submission_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_type       TEXT NOT NULL,
  blob_url        TEXT NOT NULL,
  blob_path       TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size_bytes INT,
  duration_seconds NUMERIC(8,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SCORES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id       UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  teacher_id          UUID REFERENCES public.users(id),
  ai_overall_score    NUMERIC(5,2),
  teacher_overall_score NUMERIC(5,2),
  final_score         NUMERIC(5,2),
  cefr_level          TEXT,
  criteria_scores     JSONB,
  confidence          NUMERIC(4,3),
  override_reason     TEXT,
  criteria_adjustments JSONB,
  scored_by_model     TEXT,
  ai_job_id           UUID,
  is_teacher_override BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── FEEDBACK ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id    UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  feedback_version INT DEFAULT 1,
  strengths        TEXT[] DEFAULT '{}',
  weaknesses       TEXT[] DEFAULT '{}',
  sentence_feedback JSONB,
  word_level_issues JSONB,
  improved_version TEXT,
  model_answer     TEXT,
  next_practice    JSONB,
  study_plan_items JSONB,
  teacher_comments TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── STUDENT SKILL PROFILES ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_skill_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  estimated_cefr      TEXT,
  cefr_confidence     NUMERIC(4,3),
  estimated_band      NUMERIC(3,1),
  band_confidence     NUMERIC(4,3),
  writing_band        NUMERIC(3,1),
  speaking_band       NUMERIC(3,1),
  reading_band        NUMERIC(3,1),
  listening_band      NUMERIC(3,1),
  weak_skills         TEXT[] DEFAULT '{}',
  weak_grammar_areas  TEXT[] DEFAULT '{}',
  weak_vocab_areas    TEXT[] DEFAULT '{}',
  streak_days         INT DEFAULT 0,
  last_activity_at    TIMESTAMPTZ,
  total_practice_hours NUMERIC(8,2) DEFAULT 0,
  total_submissions   INT DEFAULT 0,
  study_plan          JSONB,
  recommendations     JSONB,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── AI JOBS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID REFERENCES public.submissions(id),
  organization_id UUID REFERENCES public.organizations(id),
  job_type        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING',
  priority        INT DEFAULT 5,
  input_data      JSONB,
  output_data     JSONB,
  error_message   TEXT,
  model_deployment TEXT,
  input_tokens    INT,
  output_tokens   INT,
  cost_usd        NUMERIC(10,6),
  attempt_count   INT DEFAULT 0,
  max_attempts    INT DEFAULT 3,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── AI JOB LOGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_job_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID NOT NULL REFERENCES public.ai_jobs(id) ON DELETE CASCADE,
  level      TEXT NOT NULL,
  message    TEXT NOT NULL,
  data       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── EMBEDDINGS (vector search) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.embedding_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  chunk_index      INT DEFAULT 0,
  chunk_text       TEXT NOT NULL,
  embedding_model  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PLANS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plans (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL,
  tier                     TEXT NOT NULL,
  stripe_price_id          TEXT,
  stripe_product_id        TEXT,
  monthly_price_cents      INT,
  annual_price_cents       INT,
  seat_limit               INT,
  storage_gb               INT,
  writing_checks_monthly   INT,
  speaking_minutes_monthly INT,
  ai_credits_monthly       INT,
  content_imports_monthly  INT,
  can_private_content      BOOLEAN DEFAULT false,
  can_branded_reports      BOOLEAN DEFAULT false,
  can_bulk_import          BOOLEAN DEFAULT false,
  can_teacher_override     BOOLEAN DEFAULT false,
  can_api_access           BOOLEAN DEFAULT false,
  can_sso                  BOOLEAN DEFAULT false,
  can_white_label          BOOLEAN DEFAULT false,
  is_active                BOOLEAN DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link organizations.plan_id → plans.id (add FK now that plans table exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_plan_id_fkey') THEN
    ALTER TABLE public.organizations ADD CONSTRAINT organizations_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);
  END IF;
END $$;

-- ── SUBSCRIPTIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations(id),
  plan_id             UUID NOT NULL REFERENCES public.plans(id),
  status              TEXT NOT NULL DEFAULT 'TRIALING',
  stripe_sub_id       TEXT,
  stripe_customer_id  TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  trial_ends_at       TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  seat_count          INT DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── USAGE RECORDS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
  user_id         UUID REFERENCES public.users(id),
  feature         TEXT NOT NULL,
  quantity        NUMERIC(10,2) DEFAULT 1,
  metadata        JSONB,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CERTIFICATES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id),
  organization_id   UUID REFERENCES public.organizations(id),
  submission_id     UUID REFERENCES public.submissions(id),
  certificate_type  TEXT NOT NULL,
  cefr_level        TEXT,
  estimated_band    NUMERIC(3,1),
  title             TEXT NOT NULL,
  issuer_name       TEXT DEFAULT 'Ikhora Fluent',
  verify_token      UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  verify_url        TEXT,
  pdf_url           TEXT,
  status            TEXT DEFAULT 'ISSUED',
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at        TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ,
  revoked_reason    TEXT
);

-- ── REPORTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id         UUID,
  class_id        UUID,
  report_type     TEXT NOT NULL,
  title           TEXT NOT NULL,
  data            JSONB NOT NULL,
  pdf_url         TEXT,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── AUDIT LOGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES public.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  action          TEXT NOT NULL,
  target_type     TEXT,
  target_id       UUID,
  metadata        JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_org ON public.classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON public.class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_content_org ON public.content_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_exam_skill ON public.content_items(exam, skill, review_status);
CREATE INDEX IF NOT EXISTS idx_content_visibility ON public.content_items(visibility, review_status);
CREATE INDEX IF NOT EXISTS idx_assignments_org ON public.assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_org ON public.submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_submissions_type_status ON public.submissions(type, status);
CREATE INDEX IF NOT EXISTS idx_scores_submission ON public.scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submission ON public.feedback(submission_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status_type ON public.ai_jobs(status, job_type);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_submission ON public.ai_jobs(submission_id);
CREATE INDEX IF NOT EXISTS idx_sub_files_submission ON public.submission_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_token ON public.certificates(verify_token);
CREATE INDEX IF NOT EXISTS idx_reports_org ON public.reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action, created_at);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ── USERS policies ──
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
-- Teachers/admins can see users in their org
CREATE POLICY "users_select_org_members" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om
    JOIN public.organization_members om2 ON om.organization_id = om2.organization_id
    WHERE om.user_id = auth.uid() AND om2.user_id = users.id AND om.status = 'ACTIVE')
);

-- ── ORGANIZATIONS policies ──
CREATE POLICY "org_select_members" ON public.organizations FOR SELECT USING (public.is_org_member(id));
CREATE POLICY "org_update_admin" ON public.organizations FOR UPDATE USING (public.org_role(id) = 'ORG_ADMIN');

-- ── ORGANIZATION MEMBERS policies ──
CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (
  auth.uid() = user_id OR public.is_org_member(organization_id)
);
CREATE POLICY "org_members_manage" ON public.organization_members FOR ALL USING (
  public.org_role(organization_id) IN ('ORG_ADMIN', 'TEACHER')
);
CREATE POLICY "org_members_self" ON public.organization_members FOR SELECT USING (auth.uid() = user_id);

-- ── CLASSES policies ──
CREATE POLICY "classes_select_org" ON public.classes FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "classes_manage_admin_teacher" ON public.classes FOR ALL USING (
  public.org_role(organization_id) IN ('ORG_ADMIN', 'TEACHER')
);

-- ── CLASS MEMBERS policies ──
CREATE POLICY "class_members_select" ON public.class_members FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = class_id AND public.is_org_member(c.organization_id)
  )
);
CREATE POLICY "class_members_manage" ON public.class_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND public.org_role(c.organization_id) IN ('ORG_ADMIN', 'TEACHER'))
);

-- ── CONTENT ITEMS policies ──
CREATE POLICY "content_select_global" ON public.content_items FOR SELECT USING (
  visibility = 'GLOBAL' OR public.is_org_member(organization_id) OR created_by_id = auth.uid()
);
CREATE POLICY "content_manage" ON public.content_items FOR ALL USING (
  created_by_id = auth.uid() OR public.org_role(organization_id) IN ('ORG_ADMIN', 'TEACHER', 'REVIEWER')
);

-- ── CONTENT VERSIONS & REVIEWS ──
CREATE POLICY "content_versions_select" ON public.content_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_item_id AND
    (ci.visibility = 'GLOBAL' OR public.is_org_member(ci.organization_id) OR ci.created_by_id = auth.uid()))
);
CREATE POLICY "content_reviews_select" ON public.content_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = content_item_id AND
    (ci.visibility = 'GLOBAL' OR public.is_org_member(ci.organization_id) OR ci.created_by_id = auth.uid()))
);

-- ── ASSIGNMENTS policies ──
CREATE POLICY "assignments_select" ON public.assignments FOR SELECT USING (
  teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.class_members cm WHERE cm.class_id = assignments.class_id AND cm.user_id = auth.uid()
  ) OR public.is_org_member(organization_id)
);
CREATE POLICY "assignments_manage" ON public.assignments FOR ALL USING (
  teacher_id = auth.uid() OR public.org_role(organization_id) IN ('ORG_ADMIN', 'TEACHER')
);

-- ── ASSIGNMENT ITEMS policies ──
CREATE POLICY "assignment_items_select" ON public.assignment_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND
    (a.teacher_id = auth.uid() OR public.is_org_member(a.organization_id) OR
     EXISTS (SELECT 1 FROM public.class_members cm WHERE cm.class_id = a.class_id AND cm.user_id = auth.uid())))
);

-- ── SUBMISSIONS policies ──
CREATE POLICY "submissions_own" ON public.submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "submissions_teacher" ON public.submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid() AND om.organization_id = submissions.organization_id
    AND om.role IN ('TEACHER', 'ORG_ADMIN') AND om.status = 'ACTIVE')
);
CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "submissions_update_own" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);

-- ── SUBMISSION FILES policies ──
CREATE POLICY "sub_files_own" ON public.submission_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
);
CREATE POLICY "sub_files_teacher" ON public.submission_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s
    JOIN public.organization_members om ON om.organization_id = s.organization_id
    WHERE s.id = submission_id AND om.user_id = auth.uid() AND om.role IN ('TEACHER', 'ORG_ADMIN') AND om.status = 'ACTIVE')
);

-- ── SCORES policies ──
CREATE POLICY "scores_own" ON public.scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
);
CREATE POLICY "scores_teacher" ON public.scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s
    JOIN public.organization_members om ON om.organization_id = s.organization_id
    WHERE s.id = submission_id AND om.user_id = auth.uid() AND om.role IN ('TEACHER', 'ORG_ADMIN') AND om.status = 'ACTIVE')
);
CREATE POLICY "scores_insert" ON public.scores FOR INSERT WITH CHECK (true);
CREATE POLICY "scores_update_teacher" ON public.scores FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.submissions s
    JOIN public.organization_members om ON om.organization_id = s.organization_id
    WHERE s.id = submission_id AND om.user_id = auth.uid() AND om.role IN ('TEACHER', 'ORG_ADMIN') AND om.status = 'ACTIVE')
);

-- ── FEEDBACK policies ──
CREATE POLICY "feedback_own" ON public.feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
);
CREATE POLICY "feedback_teacher" ON public.feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s
    JOIN public.organization_members om ON om.organization_id = s.organization_id
    WHERE s.id = submission_id AND om.user_id = auth.uid() AND om.role IN ('TEACHER', 'ORG_ADMIN') AND om.status = 'ACTIVE')
);

-- ── STUDENT SKILL PROFILES policies ──
CREATE POLICY "skill_profile_own" ON public.student_skill_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skill_profile_update" ON public.student_skill_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "skill_profile_insert" ON public.student_skill_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skill_profile_teacher" ON public.student_skill_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om1
    JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid() AND om1.role IN ('TEACHER', 'ORG_ADMIN') AND om1.status = 'ACTIVE'
    AND om2.user_id = student_skill_profiles.user_id AND om2.status = 'ACTIVE')
);

-- ── AI JOBS policies ──
CREATE POLICY "ai_jobs_own" ON public.ai_jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
);
CREATE POLICY "ai_jobs_org" ON public.ai_jobs FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "ai_jobs_insert" ON public.ai_jobs FOR INSERT WITH CHECK (true);

-- ── CERTIFICATES policies ──
CREATE POLICY "cert_own" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cert_verify" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "cert_org" ON public.certificates FOR SELECT USING (public.is_org_member(organization_id));

-- ── REPORTS policies ──
CREATE POLICY "reports_own" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_org" ON public.reports FOR SELECT USING (public.is_org_member(organization_id));

-- ── AUDIT LOGS policies ──
CREATE POLICY "audit_own" ON public.audit_logs FOR SELECT USING (auth.uid() = actor_id);
CREATE POLICY "audit_org_admin" ON public.audit_logs FOR SELECT USING (
  public.org_role(organization_id) = 'ORG_ADMIN'
);

-- ── PLANS (public read) ──
CREATE POLICY "plans_read" ON public.plans FOR SELECT USING (true);

-- ── SUBSCRIPTIONS policies ──
CREATE POLICY "subs_org" ON public.subscriptions FOR SELECT USING (public.is_org_member(organization_id));

-- ════════════════════════════════════════════════════════════
-- TRIGGERS
-- ════════════════════════════════════════════════════════════

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  org_name TEXT;
  org_slug TEXT;
  new_org_id UUID;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  INSERT INTO public.users (id, email, name, auth_provider, target_exam, target_band)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'supabase',
    'IELTS',
    COALESCE((NEW.raw_user_meta_data->>'target_band')::NUMERIC, 7.0)
  );

  -- Auto-create student skill profile for students
  IF user_role = 'student' THEN
    INSERT INTO public.student_skill_profiles (user_id) VALUES (NEW.id);
  END IF;

  -- For teachers and institute admins, auto-create a personal organization
  IF user_role IN ('teacher', 'institute_admin') THEN
    org_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) || '''s Organization';
    org_slug := 'org-' || replace(NEW.id::text, '-', '') ;

    INSERT INTO public.organizations (name, slug, description)
    VALUES (org_name, org_slug, 'Auto-created for ' || NEW.email)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
    VALUES (
      new_org_id, NEW.id,
      CASE WHEN user_role = 'institute_admin' THEN 'ORG_ADMIN' ELSE 'TEACHER' END,
      'ACTIVE', now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','organizations','classes','content_items','assignments',
    'submissions','scores','student_skill_profiles','subscriptions'
  ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

-- Update streak on new submission
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_skill_profiles
  SET
    streak_days = CASE
      WHEN last_activity_at::date = CURRENT_DATE - 1 THEN streak_days + 1
      WHEN last_activity_at::date = CURRENT_DATE THEN streak_days
      ELSE 1
    END,
    last_activity_at = now(),
    total_practice_hours = total_practice_hours + 0.08,
    total_submissions = total_submissions + 1,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_submission_created ON public.submissions;
CREATE TRIGGER on_submission_created
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();
