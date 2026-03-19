-- Migration: Add editor permission flags to survey_forms
ALTER TABLE public.survey_forms
  ADD COLUMN IF NOT EXISTS allow_label_edit_by_admin boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS allow_structure_edit_by_admin boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN public.survey_forms.allow_label_edit_by_admin IS 'If true, admin can edit question labels/help text via form_question_overrides';
COMMENT ON COLUMN public.survey_forms.allow_structure_edit_by_admin IS 'If true (super_admin only), structural changes are permitted';

UPDATE public.survey_forms SET
  allow_label_edit_by_admin = true,
  allow_structure_edit_by_admin = false
WHERE form_key IN ('wellbeing', 'ch1');
