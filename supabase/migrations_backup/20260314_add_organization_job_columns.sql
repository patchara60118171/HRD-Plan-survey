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

-- Backfill organization from response_data for existing rows
UPDATE public.survey_responses
SET organization_id = (
  SELECT id FROM public.organizations 
  WHERE code = COALESCE(
    response_data->>'organization',
    response_data->>'agency_name',
    response_data->>'org_name'
  )
  LIMIT 1
)
WHERE organization_id IS NULL
  AND response_data IS NOT NULL;

-- Backfill job
UPDATE public.survey_responses
SET job = COALESCE(
  response_data->>'job',
  response_data->>'level'
)
WHERE job IS NULL
  AND response_data IS NOT NULL;

-- Backfill job_duration
UPDATE public.survey_responses
SET job_duration = COALESCE(
  response_data->>'job_duration',
  response_data->>'service_years'
)
WHERE job_duration IS NULL
  AND response_data IS NOT NULL;

-- Index for faster org filtering
CREATE INDEX IF NOT EXISTS idx_survey_responses_organization ON public.survey_responses(organization);
