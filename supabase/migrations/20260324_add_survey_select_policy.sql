-- =============================================
-- Add SELECT policy for survey_responses
-- Date: 2026-03-24  
-- Purpose:
--   Enable org-portal HR users to read well-being survey responses from their organization
--   Org-HR users can view responses from their organization via organization name or org_code
-- =============================================

-- Drop conflicting or old SELECT policies
DROP POLICY IF EXISTS "All can read" ON public.survey_responses;
DROP POLICY IF EXISTS "Public read survey" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_select_anon" ON public.survey_responses;

-- Create SELECT policy for org-HR and admin users
CREATE POLICY "survey_select_org_hr"
ON public.survey_responses
FOR SELECT
TO authenticated
USING (
  -- Admin users can view all responses
  public.requester_is_admin()
  OR
  -- Org-HR users can view responses from their organization
  (public.requester_is_org_hr() AND (
    -- Match by organization name
    organization IN (
      SELECT org_name_th 
      FROM public.organizations 
      WHERE org_code = public.requester_org()
    )
    -- OR match by org_code in survey response
    OR COALESCE(org_code, '') = COALESCE(public.requester_org(), '__none__')
    -- OR match by org_code in raw_responses JSON
    OR COALESCE((raw_responses ->> 'org_code'), '') = COALESCE(public.requester_org(), '__none__')
  ))
);

COMMENT ON POLICY "survey_select_org_hr" ON public.survey_responses IS
'Allow authenticated org-HR users to read survey responses from their organization. Admin users can view all responses.';
