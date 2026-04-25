-- Migration: Upgrade admin_user_roles for org_hr support
ALTER TABLE public.admin_user_roles
  ADD COLUMN IF NOT EXISTS org_code text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS created_by text;

ALTER TABLE public.admin_user_roles
  DROP CONSTRAINT IF EXISTS admin_user_roles_role_check;

ALTER TABLE public.admin_user_roles
  ADD CONSTRAINT admin_user_roles_role_check
  CHECK (lower(role) = ANY (ARRAY['super_admin'::text, 'admin'::text, 'org_hr'::text, 'viewer'::text]));

COMMENT ON COLUMN public.admin_user_roles.org_code IS 'Required for org_hr role. Must match organizations.org_code. NULL for super_admin/admin.';
COMMENT ON COLUMN public.admin_user_roles.display_name IS 'Friendly display name for UI';
COMMENT ON COLUMN public.admin_user_roles.created_by IS 'Email of admin who created this account';

ALTER TABLE public.admin_user_roles
  ADD CONSTRAINT admin_user_roles_org_code_fkey
  FOREIGN KEY (org_code) REFERENCES public.organizations(org_code)
  ON UPDATE CASCADE ON DELETE RESTRICT;
