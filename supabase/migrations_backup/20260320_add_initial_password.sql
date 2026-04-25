-- Migration: Add initial_password column to admin_user_roles
-- Used to store the auto-generated password for org_hr accounts
-- so admins can view and copy credentials from the admin panel

ALTER TABLE public.admin_user_roles
ADD COLUMN IF NOT EXISTS initial_password TEXT NULL;

COMMENT ON COLUMN public.admin_user_roles.initial_password
IS 'Stores the initial auto-generated password for org_hr accounts. Admins can view this to share with clients.';
