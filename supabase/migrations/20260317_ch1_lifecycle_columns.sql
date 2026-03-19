-- Migration: Add CH1 lifecycle columns for single-round 2569 model
ALTER TABLE public.hrd_ch1_responses
  ADD COLUMN IF NOT EXISTS round_code text DEFAULT 'round_2569' NOT NULL;

COMMENT ON COLUMN public.hrd_ch1_responses.round_code IS 'CH1 reporting round. Fixed value "round_2569" for this project scope.';

ALTER TABLE public.hrd_ch1_responses
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted' NOT NULL,
  ADD CONSTRAINT hrd_ch1_status_check
    CHECK (status IN ('draft', 'submitted', 'reopened', 'locked'));

COMMENT ON COLUMN public.hrd_ch1_responses.status IS 'Lifecycle state: draft | submitted | reopened | locked';

ALTER TABLE public.hrd_ch1_responses
  ADD COLUMN IF NOT EXISTS last_saved_at timestamptz,
  ADD COLUMN IF NOT EXISTS reopened_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by text;

UPDATE public.hrd_ch1_responses
SET
  status = 'submitted',
  last_saved_at = COALESCE(submitted_at, created_at)
WHERE submitted_at IS NOT NULL AND status = 'submitted';

ALTER TABLE public.hrd_ch1_responses
  ADD COLUMN IF NOT EXISTS org_code text;

COMMENT ON COLUMN public.hrd_ch1_responses.org_code IS 'References organizations.org_code. Populated by app on submit.';

CREATE UNIQUE INDEX IF NOT EXISTS hrd_ch1_unique_org_round
  ON public.hrd_ch1_responses (organization, round_code)
  WHERE submission_mode = 'live' AND is_test = false;

COMMENT ON INDEX hrd_ch1_unique_org_round IS 'Ensures one live CH1 submission per organization per round';
