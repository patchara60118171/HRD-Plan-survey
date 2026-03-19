-- Migration: Update RLS helper functions and policies for org_hr role

CREATE OR REPLACE FUNCTION public.requester_org()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT (
    SELECT aur.org_code
    FROM public.admin_user_roles aur
    WHERE lower(aur.email) = public.requester_email()
      AND aur.is_active = true
    LIMIT 1
  );
$$;

CREATE OR REPLACE FUNCTION public.requester_is_org_hr()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT public.requester_role() = 'org_hr';
$$;

-- hrd_ch1_responses policies
DROP POLICY IF EXISTS "Role-aware select ch1" ON public.hrd_ch1_responses;
CREATE POLICY "Role-aware select ch1" ON public.hrd_ch1_responses FOR SELECT TO authenticated
  USING (
    public.requester_is_admin()
    OR (public.requester_is_org_hr() AND (
      (org_code IS NOT NULL AND org_code = public.requester_org())
      OR (org_code IS NULL AND organization IN (
        SELECT org_name_th FROM public.organizations WHERE org_code = public.requester_org()
      ))
    ))
  );

DROP POLICY IF EXISTS "Role-aware update ch1" ON public.hrd_ch1_responses;
CREATE POLICY "Role-aware update ch1" ON public.hrd_ch1_responses FOR UPDATE TO authenticated
  USING (
    public.requester_is_admin()
    OR (public.requester_is_org_hr() AND status IN ('draft','reopened') AND (
      (org_code IS NOT NULL AND org_code = public.requester_org())
      OR (org_code IS NULL AND organization IN (
        SELECT org_name_th FROM public.organizations WHERE org_code = public.requester_org()
      ))
    ))
  )
  WITH CHECK (public.requester_is_admin() OR (public.requester_is_org_hr() AND status IN ('draft','reopened')));

-- survey_responses policies
DROP POLICY IF EXISTS "Role-aware select survey" ON public.survey_responses;
CREATE POLICY "Role-aware select survey" ON public.survey_responses FOR SELECT TO authenticated
  USING (
    public.requester_is_admin()
    OR (public.requester_is_org_hr() AND (
      organization IN (SELECT org_name_th FROM public.organizations WHERE org_code = public.requester_org())
      OR COALESCE((raw_responses ->> 'org_code'), '') = COALESCE(public.requester_org(), '__none__')
    ))
  );

-- admin_user_roles policies
DROP POLICY IF EXISTS "Users can read own role" ON public.admin_user_roles;
CREATE POLICY "Users can read own role" ON public.admin_user_roles FOR SELECT TO authenticated
  USING (lower(email) = public.requester_email());

DROP POLICY IF EXISTS "Admin can manage viewers" ON public.admin_user_roles;
CREATE POLICY "Admin can manage org_hr accounts" ON public.admin_user_roles FOR ALL TO authenticated
  USING (public.requester_role() = 'admin' AND lower(role) IN ('admin','org_hr','viewer'))
  WITH CHECK (public.requester_role() = 'admin' AND lower(role) IN ('admin','org_hr','viewer'));
