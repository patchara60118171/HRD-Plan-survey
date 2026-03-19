-- Migration: Add is_test flag to organizations table
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false NOT NULL;

UPDATE public.organizations SET is_test = false WHERE is_test IS NULL;

COMMENT ON COLUMN public.organizations.is_test IS 'true = test/sandbox org, excluded from official analytics by default';
