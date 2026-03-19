-- =============================================
-- Migration: Add CH1 yearly fields required by current ch1-form.js
-- Date: 2026-03-10
-- Notes:
-- - These columns are referenced in js/ch1-form.js collectAllData()
-- - Use IF NOT EXISTS to be safe on repeated runs.
-- =============================================

ALTER TABLE public.hrd_ch1_responses
  -- Test mode metadata (used by ch1-form.js)
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS submission_mode TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS test_run_id TEXT,

  -- Staff movement (ย้อนหลัง 5 ปี: 2564-2568)
  ADD COLUMN IF NOT EXISTS begin_2564 INTEGER,
  ADD COLUMN IF NOT EXISTS begin_2565 INTEGER,
  ADD COLUMN IF NOT EXISTS begin_2566 INTEGER,
  ADD COLUMN IF NOT EXISTS begin_2567 INTEGER,
  ADD COLUMN IF NOT EXISTS begin_2568 INTEGER,
  ADD COLUMN IF NOT EXISTS end_2564 INTEGER,
  ADD COLUMN IF NOT EXISTS end_2565 INTEGER,
  ADD COLUMN IF NOT EXISTS end_2566 INTEGER,
  ADD COLUMN IF NOT EXISTS end_2567 INTEGER,
  ADD COLUMN IF NOT EXISTS end_2568 INTEGER,
  ADD COLUMN IF NOT EXISTS leave_2564 INTEGER,
  ADD COLUMN IF NOT EXISTS leave_2565 INTEGER,
  ADD COLUMN IF NOT EXISTS leave_2566 INTEGER,
  ADD COLUMN IF NOT EXISTS leave_2567 INTEGER,
  ADD COLUMN IF NOT EXISTS leave_2568 INTEGER,

  -- Report type selectors (radio)
  ADD COLUMN IF NOT EXISTS clinic_report_type TEXT,
  ADD COLUMN IF NOT EXISTS disease_report_type TEXT,
  ADD COLUMN IF NOT EXISTS sick_leave_report_type TEXT,
  ADD COLUMN IF NOT EXISTS mental_health_report_type TEXT,

  -- Engagement scores (ย้อนหลัง 5 ปี)
  ADD COLUMN IF NOT EXISTS engagement_score_2564 NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS engagement_score_2565 NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS engagement_score_2566 NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS engagement_score_2567 NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS engagement_score_2568 NUMERIC(5,2);
