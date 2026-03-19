-- ================================================================
-- Migration: Add form_sections + form_questions tables
-- Phase A of HRD-Plan-survey Full Architecture Overhaul
-- Date: 2026-03-19
-- ================================================================

-- ----------------------------------------------------------------
-- 1. form_sections — groups of questions within a form
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_sections (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  form_code     text        NOT NULL,
  section_key   text        NOT NULL,
  section_order int         NOT NULL DEFAULT 0,
  title_th      text        NOT NULL,
  description   text,
  CONSTRAINT fs_unique_key UNIQUE (form_code, section_key),
  CONSTRAINT fs_form_code_check CHECK (form_code IN ('wellbeing', 'ch1'))
);

COMMENT ON TABLE public.form_sections IS 'Section / subsection groups for each survey form';
COMMENT ON COLUMN public.form_sections.form_code     IS 'Which form: wellbeing | ch1';
COMMENT ON COLUMN public.form_sections.section_key   IS 'Slug identifier e.g. personal, consumption, ch1_org';
COMMENT ON COLUMN public.form_sections.section_order IS 'Display order (ascending)';

-- ----------------------------------------------------------------
-- 2. form_questions — individual question definitions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_questions (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  form_code       text        NOT NULL,
  section_key     text        NOT NULL,         -- FK → form_sections.section_key
  question_key    text        NOT NULL,         -- unique slug within form e.g. title, gender, total_staff
  question_order  int         NOT NULL DEFAULT 0,
  label_th        text        NOT NULL,         -- default Thai label
  help_text       text,                         -- optional helper / description
  input_type      text        NOT NULL DEFAULT 'text',  -- text | number | radio | checkbox | textarea | file
  options_json    jsonb,                        -- for radio/checkbox: array of option values/objects
  is_required     boolean     NOT NULL DEFAULT true,
  placeholder     text,
  unit            text,                         -- e.g. 'ปี', '%', 'คน'
  validation_json jsonb,                        -- e.g. {"min":0,"max":100}
  is_active       boolean     NOT NULL DEFAULT true,
  CONSTRAINT fq_unique_key UNIQUE (form_code, question_key),
  CONSTRAINT fq_form_code_check CHECK (form_code IN ('wellbeing', 'ch1')),
  CONSTRAINT fq_input_type_check CHECK (input_type IN ('text','number','radio','checkbox','textarea','file','heading','divider'))
);

COMMENT ON TABLE  public.form_questions IS 'Single-source question definitions replacing hardcoded JS files';
COMMENT ON COLUMN public.form_questions.question_key IS 'Stable key that matches field keys in hrd_ch1_responses / survey_responses';
COMMENT ON COLUMN public.form_questions.options_json IS 'JSON array: ["นาย","นาง"] or [{"label":"อื่นๆ","value":"other","hasInput":true}]';
COMMENT ON COLUMN public.form_questions.validation_json IS 'JSON: {"min":0,"max":100,"step":0.01}';

-- ----------------------------------------------------------------
-- 3. FK from form_questions → form_sections
-- ----------------------------------------------------------------
ALTER TABLE public.form_questions
  ADD CONSTRAINT fq_section_fkey
  FOREIGN KEY (form_code, section_key)
  REFERENCES public.form_sections (form_code, section_key)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- ----------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_form_questions_lookup
  ON public.form_questions (form_code, section_key, question_order);

CREATE INDEX IF NOT EXISTS idx_form_sections_order
  ON public.form_sections (form_code, section_order);

-- ----------------------------------------------------------------
-- 5. RLS
-- ----------------------------------------------------------------
ALTER TABLE public.form_sections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon) can read active questions
CREATE POLICY "Public read form_sections"
  ON public.form_sections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read form_questions"
  ON public.form_questions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Only admins can manage (insert/update/delete)
CREATE POLICY "Admin manage form_sections"
  ON public.form_sections FOR ALL
  TO authenticated
  USING    (public.requester_is_admin())
  WITH CHECK (public.requester_is_admin());

CREATE POLICY "Admin manage form_questions"
  ON public.form_questions FOR ALL
  TO authenticated
  USING    (public.requester_is_admin())
  WITH CHECK (public.requester_is_admin());
