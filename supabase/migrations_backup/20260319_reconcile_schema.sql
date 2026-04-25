-- ================================================================
-- Migration: Reconcile schema mismatches between existing tables
-- and new frontend code (Phase C2)
-- Date: 2026-03-19
-- ================================================================

-- ----------------------------------------------------------------
-- 1. form_question_overrides: rename label_text → label_th
--    Frontend (admin.html Questions Editor) uses label_th
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_question_overrides'
    AND column_name = 'label_text'
  ) THEN
    ALTER TABLE public.form_question_overrides RENAME COLUMN label_text TO label_th;
  END IF;
END $$;

-- If label_th doesn't exist at all (fresh install), add it
DO $$ BEGIN
  ALTER TABLE public.form_question_overrides ADD COLUMN label_th text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ----------------------------------------------------------------
-- 2. form_windows: add is_open column (frontend uses is_open, DB has is_active)
--    Keep is_active for backward compat, add is_open as the primary toggle
-- ----------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.form_windows ADD COLUMN is_open boolean DEFAULT true NOT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Sync existing is_active → is_open
UPDATE public.form_windows SET is_open = is_active WHERE is_open IS NULL OR is_open != is_active;

-- ----------------------------------------------------------------
-- 3. form_windows: add UNIQUE constraint on (form_code, org_code)
--    Needed for upsert from admin Form Windows UI
-- ----------------------------------------------------------------
-- First ensure org_code is NOT NULL for new rows (existing NULL rows = global windows)
DO $$ BEGIN
  ALTER TABLE public.form_windows
    ADD CONSTRAINT fw_unique_form_org UNIQUE (form_code, org_code);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------
-- 4. admin_user_roles: ensure last_login_at column exists
--    (org-portal.html updates this on login)
-- ----------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.admin_user_roles ADD COLUMN last_login_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ----------------------------------------------------------------
-- 5. form_question_overrides: update upsert conflict target
--    Ensure constraint name matches what frontend expects
-- ----------------------------------------------------------------
-- The existing constraint is fqo_unique_question (form_code, question_key)
-- Frontend upserts with onConflict: 'form_code,question_key' which uses
-- the unique constraint automatically — no change needed here.

-- ----------------------------------------------------------------
-- Done
-- ----------------------------------------------------------------
