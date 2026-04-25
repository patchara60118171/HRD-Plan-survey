-- Migration: Create form_windows table
CREATE TABLE IF NOT EXISTS public.form_windows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_code text NOT NULL,
  round_code text NOT NULL DEFAULT 'round_2569',
  org_code text,
  opens_at timestamptz,
  closes_at timestamptz,
  edit_until timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT form_windows_form_code_check CHECK (form_code IN ('wellbeing', 'ch1'))
);

COMMENT ON TABLE public.form_windows IS 'Controls open/close/edit time windows per form and round';

CREATE INDEX IF NOT EXISTS idx_form_windows_lookup
  ON public.form_windows (form_code, round_code, is_active);

INSERT INTO public.form_windows (form_code, round_code, is_active, created_by)
VALUES
  ('ch1', 'round_2569', true, 'system'),
  ('wellbeing', 'round_2569', true, 'system')
ON CONFLICT DO NOTHING;

ALTER TABLE public.form_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active form windows"
  ON public.form_windows FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage form windows"
  ON public.form_windows FOR ALL
  TO authenticated
  USING (public.requester_is_admin())
  WITH CHECK (public.requester_is_admin());
