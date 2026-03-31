-- Add unique constraint on form_windows (form_code, round_code, org_code)
-- Required for upsert onConflict to work correctly
ALTER TABLE public.form_windows
  DROP CONSTRAINT IF EXISTS form_windows_form_round_org_key;

ALTER TABLE public.form_windows
  ADD CONSTRAINT form_windows_form_round_org_key
  UNIQUE (form_code, round_code, org_code);
