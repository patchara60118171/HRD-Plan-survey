-- Migration: Add closed_message column to form_windows
-- and fix RLS so public can read ALL form_windows rows (not just active ones)
-- Required so the survey frontend can check whether a form is closed
-- and display the correct closed message popup.

-- 1. Add closed_message column
ALTER TABLE public.form_windows
  ADD COLUMN IF NOT EXISTS closed_message text DEFAULT 'ณ ขณะนี้ฟอร์มปิดรับคำตอบแล้ว';

-- 2. Fix RLS: Drop the old restrictive policy, replace with one allowing all reads
DROP POLICY IF EXISTS "Public read active form windows" ON public.form_windows;

CREATE POLICY "Public read all form windows"
  ON public.form_windows FOR SELECT
  TO anon, authenticated
  USING (true);
