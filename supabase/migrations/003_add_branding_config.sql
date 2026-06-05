-- ============================================================
-- IKHORA FLUENT — Migration 003: Add branding_config to organizations
-- ============================================================

-- Add branding_config JSONB column for storing custom branding settings
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS branding_config JSONB;

-- Add contact_email column for institute billing/branding
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Backfill branding_config from existing columns where available
UPDATE public.organizations
SET branding_config = jsonb_build_object(
  'primaryColor', COALESCE(primary_color, '#6366f1'),
  'logoUrl', COALESCE(logo_url, ''),
  'accentColor', '#8b5cf6',
  'website', COALESCE(website, '')
)
WHERE branding_config IS NULL;
