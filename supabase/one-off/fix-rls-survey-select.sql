-- =============================================
-- Quick RLS Policy Fix: Enable Admin Read Access
-- Date: 2026-03-24
-- Purpose: Allow admin users to read survey_responses
-- =============================================

-- Drop old/conflicting SELECT policies
DROP POLICY IF EXISTS "survey_select_admin" ON public.survey_responses CASCADE;
DROP POLICY IF EXISTS "survey_select_org_hr" ON public.survey_responses CASCADE;
DROP POLICY IF EXISTS "Role-aware select survey" ON public.survey_responses CASCADE;
DROP POLICY IF EXISTS "All can read" ON public.survey_responses CASCADE;
DROP POLICY IF EXISTS "Public read survey" ON public.survey_responses CASCADE;
DROP POLICY IF EXISTS "survey_select_anon" ON public.survey_responses CASCADE;

-- Create new SELECT policy for admin and org-HR users
CREATE POLICY "survey_select_admin"
ON public.survey_responses
FOR SELECT
TO authenticated
USING (
  -- Admin users can view all responses
  public.requester_is_admin()
  OR
  -- Org-HR users can view responses from their organization
  (public.requester_is_org_hr() AND (
    organization IN (
      SELECT org_name_th 
      FROM public.organizations 
      WHERE org_code = public.requester_org()
    )
    OR COALESCE(org_code, '') = COALESCE(public.requester_org(), '__none__')
    OR COALESCE((raw_responses ->> 'org_code'), '') = COALESCE(public.requester_org(), '__none__')
  ))
);

COMMENT ON POLICY "survey_select_admin" ON public.survey_responses IS
'Allow authenticated admin users to read all survey responses. Org-HR users can read responses from their organization.';
