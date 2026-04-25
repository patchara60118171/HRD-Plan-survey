-- =============================================
-- HOTFIX: enforce SECURITY INVOKER on v_organization_dashboard_summary
-- Date: 2026-04-20
-- Audit ref: follow-up to H3 (docs/AUDIT_REPORT_2026-04.md)
--
-- Context:
--   Migration `20260419_org_dashboard_summary_view.sql` created the view
--   without an explicit `security_invoker` setting. Supabase/Postgres
--   defaults view execution to the view-owner's privileges (effectively
--   SECURITY DEFINER), which bypasses the caller's RLS.
--
--   Running `mcp supabase get_advisors` right after deployment surfaced:
--       ERROR: security_definer_view — public.v_organization_dashboard_summary
--   confirming that org_hr users would see cross-organization aggregates.
--
--   The H3 file has since been updated to include this ALTER statement
--   inline, but this hotfix migration is required so any environment that
--   already applied the previous version gets the fix.
--
-- Safe to re-apply: ALTER VIEW ... SET (...) is idempotent.
-- =============================================

ALTER VIEW public.v_organization_dashboard_summary SET (security_invoker = true);

COMMENT ON VIEW public.v_organization_dashboard_summary IS
    'Per-organization KPIs for admin dashboard. SECURITY INVOKER: RLS on survey_responses / hrd_ch1_responses is enforced against the querying user, so org_hr sees only their own organization.';
