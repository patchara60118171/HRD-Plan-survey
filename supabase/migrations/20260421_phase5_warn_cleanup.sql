-- =============================================
-- Phase 5 WARN cleanup: duplicate indexes + function search_path hardening
-- Date: 2026-04-21
-- Audit ref: Phase 5 backlog in docs/AUDIT_REPORT_2026-04.md
--
-- Part A — Drop 3 duplicate indexes on hrd_ch1_responses
--
--   Advisor `duplicate_index` flagged these pairs (same columns, same order,
--   same predicate/WHERE). The newer, more consistently-named entries are
--   retained; the older `idx_hrd_*` entries are dropped.
--
--     DROP  idx_hrd_org_submission     → duplicate of idx_ch1_org_submitted
--     DROP  idx_hrd_org                → duplicate of idx_hrd_ch1_organization
--     DROP  idx_hrd_submitted          → duplicate of idx_hrd_ch1_submitted_at
--
--   Net effect: smaller write amplification, unchanged read-path plans
--   (Postgres picks an equivalent index automatically).
--
-- Part B — Pin search_path on 5 functions (function_search_path_mutable)
--
--   Without an explicit SET search_path, a role that controls its own
--   search_path can shadow `public` with a temp schema and hijack
--   unqualified references. Pinning to `public, pg_temp` (pg_temp LAST)
--   prevents the hijack while keeping existing bodies working.
--
--     requester_email                     (sql, INVOKER)
--     requester_is_org_hr                 (sql, DEFINER)
--     set_ch1_google_sync_defaults        (plpgsql trigger, INVOKER)
--     set_updated_at_admin_user_roles     (plpgsql trigger, INVOKER)
--     sync_ch1_to_google_sheets           (plpgsql, DEFINER)
--
-- Safe to re-apply: DROP INDEX IF EXISTS / ALTER FUNCTION SET are idempotent.
-- =============================================

-- ─── Part A: duplicate indexes ────────────────────────────────────────────
DROP INDEX IF EXISTS public.idx_hrd_org_submission;
DROP INDEX IF EXISTS public.idx_hrd_org;
DROP INDEX IF EXISTS public.idx_hrd_submitted;

-- ─── Part B: function search_path hardening ───────────────────────────────
ALTER FUNCTION public.requester_email()                  SET search_path = public, pg_temp;
ALTER FUNCTION public.requester_is_org_hr()              SET search_path = public, pg_temp;
ALTER FUNCTION public.set_ch1_google_sync_defaults()     SET search_path = public, pg_temp;
ALTER FUNCTION public.set_updated_at_admin_user_roles()  SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_ch1_to_google_sheets()        SET search_path = public, pg_temp;
