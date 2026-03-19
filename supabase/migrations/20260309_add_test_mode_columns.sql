-- =============================================
-- Add test-mode metadata to CH1 responses
-- =============================================

ALTER TABLE hrd_ch1_responses
ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS submission_mode TEXT NOT NULL DEFAULT 'live',
ADD COLUMN IF NOT EXISTS test_run_id TEXT;

UPDATE hrd_ch1_responses
SET submission_mode = CASE
    WHEN is_test = TRUE THEN 'test'
    ELSE 'live'
END
WHERE submission_mode IS NULL OR submission_mode = '';

CREATE INDEX IF NOT EXISTS idx_hrd_ch1_is_test_submitted
ON hrd_ch1_responses(is_test, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_hrd_ch1_test_run_id
ON hrd_ch1_responses(test_run_id)
WHERE test_run_id IS NOT NULL;
