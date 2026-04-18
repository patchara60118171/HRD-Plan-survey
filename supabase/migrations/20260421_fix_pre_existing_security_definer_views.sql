-- =============================================
-- Phase 5 Priority 1+2: fix pre-existing SECURITY DEFINER views
-- Date: 2026-04-21
-- Audit ref: Phase 5 backlog in docs/AUDIT_REPORT_2026-04.md
--
-- Context:
--   `mcp supabase get_advisors` flagged 3 pre-existing views as
--   `security_definer_view` (ERROR-level):
--     1. public.organizations_public
--     2. public.admin_user_roles_public
--     3. public.ch1_google_sync_queue
--
--   Intent audit outcome (see Phase 5 section of AUDIT_REPORT_2026-04.md):
--
--   [KEEP DEFINER]  organizations_public
--     - Intentional public-anon feature: exposes non-PII org metadata
--       (org_code, org_name_*, display_order) to the CH1 form's anon
--       loader at js/ch1-form.js. Base `organizations` table RLS blocks
--       anon, so DEFINER is required for the form to work pre-login.
--     - No PII in projected columns -> NOT fixed by this migration.
--       (We will suppress this advisor finding via docs instead.)
--
--   [FLIP TO INVOKER]  admin_user_roles_public
--     - SECURITY HOLE: base `admin_user_roles` RLS allows authenticated
--       users to see only their own row (admins see all). The DEFINER
--       view bypasses this -> any authenticated user (including org_hr)
--       could list ALL admin accounts (email, display_name, last_login).
--     - After flip: admin still sees all (RLS allows); org_hr sees only
--       their own row. Consumers in admin/js/services/api.js will still
--       work for admins.
--
--   [FLIP TO INVOKER]  ch1_google_sync_queue
--     - Consumers: Edge Function `google-sync` and ops script
--       `scripts/ops/sync-ch1-google.js`. Both use service_role, which
--       bypasses RLS regardless of view mode -> DEFINER provides no
--       functional benefit.
--     - Base `hrd_ch1_responses` has `anon_select_ch1_for_sheet` (anon,
--       is_test=false OR NULL) and `Role-aware select ch1` (authenticated
--       admin/org_hr scoped). After flip, service_role keeps full access;
--       anon keeps the scoped non-test access via explicit policy.
--
-- Safe to re-apply: ALTER VIEW ... SET (...) is idempotent.
-- =============================================

-- 1) admin_user_roles_public: flip DEFINER -> INVOKER (security hole fix)
ALTER VIEW public.admin_user_roles_public SET (security_invoker = true);

COMMENT ON VIEW public.admin_user_roles_public IS
    'Projection of admin_user_roles for admin dashboard. SECURITY INVOKER: enforces base-table RLS so only admins see the full roster; org_hr sees only their own row.';

-- 2) ch1_google_sync_queue: flip DEFINER -> INVOKER (no functional impact, consumers use service_role)
ALTER VIEW public.ch1_google_sync_queue SET (security_invoker = true);

COMMENT ON VIEW public.ch1_google_sync_queue IS
    'Pending / failed Google Sheet sync rows from hrd_ch1_responses. SECURITY INVOKER: service_role consumers (Edge Function + ops script) bypass RLS natively; no DEFINER needed.';

-- 3) organizations_public: intentionally KEPT as SECURITY DEFINER.
--    Documented here for audit trail; no ALTER statement.
--    Rationale: public anon must read non-PII org list before login
--    (js/ch1-form.js). Flipping to INVOKER would block the anon
--    role from listing organizations and break the CH1 form.
--    The advisor ERROR for this view is accepted as a known exception.
