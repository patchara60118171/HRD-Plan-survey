-- =============================================
-- Restore public write policies for survey_responses
-- Date: 2026-03-24
-- Purpose:
--   1) Re-enable public INSERT for wellbeing form submissions
--   2) Allow recent-row UPDATE so public upsert(email) can resolve conflicts
--   3) Avoid self-select inside INSERT policy because anon cannot read survey_responses
-- Notes:
--   - This migration does not change table structure.
--   - Existing unique constraint/index for onConflict(email) must remain in place.
-- =============================================

ALTER TABLE IF EXISTS public.survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON public.survey_responses;
DROP POLICY IF EXISTS "allow_insert_survey_responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Public can insert with limits" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_insert_anon" ON public.survey_responses;
DROP POLICY IF EXISTS "Can update own draft" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_update_own" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_update_recent" ON public.survey_responses;

CREATE POLICY "survey_insert_anon"
ON public.survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
    email IS NOT NULL
    AND btrim(email) <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND pg_column_size(raw_responses) < 1048576
);

CREATE POLICY "survey_update_recent"
ON public.survey_responses
FOR UPDATE
TO anon, authenticated
USING (
    coalesce(is_draft, false) = true
    OR coalesce(submitted_at, timestamp) > now() - interval '24 hours'
)
WITH CHECK (
    email IS NOT NULL
    AND btrim(email) <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND pg_column_size(raw_responses) < 1048576
);

COMMENT ON POLICY "survey_insert_anon" ON public.survey_responses IS
'Allow public wellbeing submissions with email validation and payload limit. Duplicate handling is delegated to unique index + upsert.';

COMMENT ON POLICY "survey_update_recent" ON public.survey_responses IS
'Allow public upsert conflict resolution for recent rows and drafts.';
