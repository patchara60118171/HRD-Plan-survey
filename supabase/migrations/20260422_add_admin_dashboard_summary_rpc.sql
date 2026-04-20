-- =============================================
-- Admin Dashboard: fast-path RPC for initial KPI paint
-- Date: 2026-04-22
--
-- Rationale:
--   admin/js/services/data.js::loadBackendCore() currently pulls ALL
--   rows from survey_responses + hrd_ch1_responses just to compute
--   the 3-4 KPI cards and the daily trend chart on the dashboard.
--   On production data this is ~1-3 MB payload and 1-3 s of load.
--
--   This RPC returns the pre-aggregated numbers in a single JSON blob
--   (typically <2 KB) so the dashboard can paint instantly, before the
--   heavier detail fetches complete in the background.
--
--   SECURITY INVOKER so that RLS on the underlying tables is enforced
--   against the calling user (org_hr users must only see their own
--   organization's aggregates).
-- =============================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_summary(
    p_trend_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    WITH
    -- Exclude test orgs the same way the client does.
    -- survey_responses has no org_code column; the client falls back to
    -- raw_responses->>'org_code' and an organization-name match on
    -- 'ทดสอบระบบ'.
    survey AS (
        SELECT *
        FROM public.survey_responses sr
        WHERE COALESCE(LOWER(sr.raw_responses->>'org_code'), '') <> 'test-org'
          AND COALESCE(sr.organization, '') NOT LIKE '%ทดสอบระบบ%'
    ),
    ch1 AS (
        SELECT *
        FROM public.hrd_ch1_responses c
        WHERE COALESCE(LOWER(c.org_code), '') <> 'test-org'
          AND COALESCE(c.organization, '') NOT LIKE '%ทดสอบระบบ%'
    ),
    survey_totals AS (
        SELECT
            COUNT(*) FILTER (WHERE COALESCE(is_draft, false) = false) AS wb_submitted,
            COUNT(*) FILTER (WHERE COALESCE(is_draft, false) = true)  AS wb_draft,
            COUNT(*) FILTER (
                WHERE COALESCE(is_draft, false) = false
                  AND tmhi_score IS NOT NULL
                  AND tmhi_score >= 15
            ) AS wb_flagged
        FROM survey
    ),
    ch1_org AS (
        -- one row per canonical org_code: has any ch1 row, has submitted
        SELECT
            LOWER(COALESCE(org_code, '')) AS code,
            BOOL_OR(
                COALESCE(LOWER(status), '') = 'submitted' OR submitted_at IS NOT NULL
            ) AS has_submitted,
            COUNT(*) AS ch1_count
        FROM ch1
        WHERE COALESCE(org_code, '') <> ''
        GROUP BY LOWER(COALESCE(org_code, ''))
    ),
    ch1_totals AS (
        SELECT
            COUNT(*) FILTER (WHERE has_submitted)                  AS ch1_submitted_orgs,
            COUNT(*) FILTER (WHERE ch1_count > 0)                  AS ch1_responded_orgs
        FROM ch1_org
    ),
    org_totals AS (
        SELECT COUNT(*) AS org_count
        FROM public.organizations
        WHERE COALESCE(is_test, false) = false
    ),
    user_totals AS (
        SELECT
            COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true) AS active_users,
            COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true AND role = 'viewer') AS viewer_count,
            COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true AND role IS NOT NULL AND role <> 'viewer') AS admin_count
        FROM public.admin_user_roles_public
    ),
    trend AS (
        SELECT
            TO_CHAR(d::date, 'YYYY-MM-DD') AS day,
            COALESCE(cnt, 0) AS count
        FROM generate_series(
            (CURRENT_DATE - (p_trend_days - 1) * INTERVAL '1 day')::date,
            CURRENT_DATE,
            INTERVAL '1 day'
        ) AS d
        LEFT JOIN LATERAL (
            SELECT COUNT(*)::int AS cnt
            FROM survey s
            WHERE COALESCE(is_draft, false) = false
              AND s.submitted_at IS NOT NULL
              AND s.submitted_at::date = d::date
        ) AS t ON TRUE
        ORDER BY d
    ),
    trend_json AS (
        SELECT jsonb_agg(jsonb_build_object('date', day, 'count', count) ORDER BY day) AS trend
        FROM trend
    )
    SELECT jsonb_build_object(
        'generated_at',        NOW(),
        'org_count',           (SELECT org_count FROM org_totals),
        'wb_submitted',        (SELECT wb_submitted FROM survey_totals),
        'wb_draft',            (SELECT wb_draft FROM survey_totals),
        'wb_flagged',          (SELECT wb_flagged FROM survey_totals),
        'ch1_submitted_orgs',  (SELECT ch1_submitted_orgs FROM ch1_totals),
        'ch1_responded_orgs',  (SELECT ch1_responded_orgs FROM ch1_totals),
        'active_users',        (SELECT active_users FROM user_totals),
        'viewer_count',        (SELECT viewer_count FROM user_totals),
        'admin_count',         (SELECT admin_count FROM user_totals),
        'daily_trend',         COALESCE((SELECT trend FROM trend_json), '[]'::jsonb)
    );
$$;

COMMENT ON FUNCTION public.get_admin_dashboard_summary(integer) IS
    'Fast-path KPI summary for the admin dashboard. Returns a single JSON blob (~1-2 KB) so the client can render KPI cards and the daily trend chart before the heavy per-row fetches complete. SECURITY INVOKER enforces RLS of the caller.';

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_summary(integer) TO authenticated;
-- Intentionally NOT granting to anon: dashboard is authenticated-only.
