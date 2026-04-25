-- Migration: Create form_question_overrides table
CREATE TABLE IF NOT EXISTS public.form_question_overrides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_code text NOT NULL,
  question_key text NOT NULL,
  label_text text,
  help_text text,
  updated_by text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fqo_unique_question UNIQUE (form_code, question_key),
  CONSTRAINT fqo_form_code_check CHECK (form_code IN ('wellbeing', 'ch1'))
);

COMMENT ON TABLE public.form_question_overrides IS 'Admin-editable question label/help text overrides.';

ALTER TABLE public.form_question_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read form question overrides"
  ON public.form_question_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can update question overrides"
  ON public.form_question_overrides FOR ALL
  TO authenticated
  USING (public.requester_is_admin())
  WITH CHECK (public.requester_is_admin());
