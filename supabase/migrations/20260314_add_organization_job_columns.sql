-- =============================================
-- Migration: Add missing columns to survey_responses
-- Fix: column survey_responses.organization does not exist
-- Date: 2026-03-14
-- =============================================

-- Add organization, job, job_duration columns (were missing from original schema)
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS job TEXT,
  ADD COLUMN IF NOT EXISTS job_duration TEXT;

-- Backfill organization from raw_responses for existing rows
UPDATE public.survey_responses
SET organization = COALESCE(
  raw_responses->>'organization',
  raw_responses->>'agency_name',
  raw_responses->>'org_name'
)
WHERE organization IS NULL
  AND raw_responses IS NOT NULL;

-- Backfill job
UPDATE public.survey_responses
SET job = COALESCE(
  raw_responses->>'job',
  raw_responses->>'level'
)
WHERE job IS NULL
  AND raw_responses IS NOT NULL;

-- Backfill job_duration
UPDATE public.survey_responses
SET job_duration = COALESCE(
  raw_responses->>'job_duration',
  raw_responses->>'service_years'
)
WHERE job_duration IS NULL
  AND raw_responses IS NOT NULL;

-- Index for faster org filtering
CREATE INDEX IF NOT EXISTS idx_survey_responses_organization ON public.survey_responses(organization);
