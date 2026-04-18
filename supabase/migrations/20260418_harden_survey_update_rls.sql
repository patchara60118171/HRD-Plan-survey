-- =============================================
-- Security Hardening: restrict anon UPDATE on survey_responses
-- Date: 2026-04-18
-- Audit ref: C4 in docs/AUDIT_REPORT_2026-04.md
--
-- Problem:
--   Policy "survey_update_recent" (from 20260324_restore_public_survey_write_policies)
--   allowed any anon session to UPDATE submitted rows within 24 hours:
--
--     USING ( is_draft = true OR submitted_at > now() - interval '24 hours' )
--
--   Since anon requests have no JWT identity, an attacker who knows (or guesses)
--   a primary-key / email pair could overwrite a legitimate submission within
--   the 24-hour window — no self-match check is enforced.
--
-- Fix:
--   1) Drop "survey_update_recent" entirely.
--   2) Re-create a stricter policy that only allows DRAFT continuation (is_draft=true)
--      for anon users. Submitted rows are immutable from anon.
--   3) Authenticated admins/org_hr edit via a separate policy that goes through
--      public.requester_is_admin() / requester_is_org_hr() (already in place for
--      SELECT). We add an equivalent UPDATE policy so the admin portal keeps working.
--
-- Upsert impact:
--   Public form uses .upsert({email, is_draft, ...}, {onConflict:'email'}).
--   If row exists as draft → UPDATE path, allowed.
--   If row exists as submitted → UPDATE blocked for anon (expected: a re-submission
--   must go through a new row or through the authenticated org-portal flow).
-- =============================================

-- 1) Remove the overly-permissive public UPDATE policy
DROP POLICY IF EXISTS "survey_update_recent"  ON public.survey_responses;
DROP POLICY IF EXISTS "survey_update_own"     ON public.survey_responses;

-- 2) Public anon UPDATE is restricted to draft continuation only.
--    This still lets the public wellbeing form resume/finish a draft via upsert.
CREATE POLICY "survey_update_draft_only"
ON public.survey_responses
FOR UPDATE
TO anon, authenticated
USING (
    coalesce(is_draft, false) = true
)
WITH CHECK (
    email IS NOT NULL
    AND btrim(email) <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND pg_column_size(raw_responses) < 1048576
);

COMMENT ON POLICY "survey_update_draft_only" ON public.survey_responses IS
'Anon/auth users may only update rows while they remain drafts. Submitted rows are immutable from anon; admins edit via survey_update_admin.';

-- 3) Admin & org_hr UPDATE policy — mirrors survey_select_admin
CREATE POLICY "survey_update_admin"
ON public.survey_responses
FOR UPDATE
TO authenticated
USING (
    public.requester_is_admin()
    OR (
        public.requester_is_org_hr() AND (
            organization IN (
                SELECT org_name_th
                FROM public.organizations
                WHERE org_code = public.requester_org()
            )
            OR COALESCE(org_code, '')                       = COALESCE(public.requester_org(), '__none__')
            OR COALESCE((raw_responses ->> 'org_code'), '') = COALESCE(public.requester_org(), '__none__')
        )
    )
)
WITH CHECK (
    email IS NOT NULL
    AND btrim(email) <> ''
);

COMMENT ON POLICY "survey_update_admin" ON public.survey_responses IS
'Admins may update any response. Org-HR may update only rows scoped to their organization.';
