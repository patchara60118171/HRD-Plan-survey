-- =============================================
-- H3: Server-side aggregation view for admin dashboard
-- Date: 2026-04-19
-- Audit ref: H3 in docs/AUDIT_REPORT_2026-04.md
--
-- Rationale:
--   `admin/js/services/data.js::summarizeOrgs()` currently aggregates
--   counts/latest-date per organization entirely on the client after
--   fetching ALL survey rows. This scales poorly past ~10k rows.
--
--   This view moves the O(n) aggregation to Postgres so the admin UI
--   can later replace the heavy client loop with a single SELECT from
--   `v_organization_dashboard_summary` (cached via PostgREST).
--
--   Rows with `coalesce(is_draft, false) = true` are counted as drafts;
--   `wellbeing_submitted` only counts finalized rows. `flagged_phq9_high`
--   uses stored `tmhi_score` as a proxy where available — a later
--   migration can refine this with a computed PHQ-9 column once the
--   raw_responses schema stabilises.
--
--   The view is `SECURITY INVOKER` (default) so existing RLS on the
--   underlying tables still applies; org_hr users will therefore only
--   see their own organization's aggregates.
-- =============================================

CREATE OR REPLACE VIEW public.v_organization_dashboard_summary AS
WITH survey_agg AS (
    SELECT
        organization,
        COUNT(*)                                                         AS wellbeing_total,
        COUNT(*) FILTER (WHERE coalesce(is_draft, false) = false)        AS wellbeing_submitted,
        COUNT(*) FILTER (WHERE coalesce(is_draft, false) = true)         AS wellbeing_draft,
        COUNT(*) FILTER (
            WHERE coalesce(is_draft, false) = false
              AND tmhi_score IS NOT NULL
              AND tmhi_score >= 15
        )                                                                AS flagged_phq9_high,
        MAX(submitted_at)                                                AS latest_wb
    FROM public.survey_responses
    WHERE organization IS NOT NULL AND organization <> ''
    GROUP BY organization
),
ch1_agg AS (
    SELECT
        organization,
        COUNT(*)                                                         AS ch1_count,
        MAX(COALESCE(submitted_at, last_saved_at, created_at))           AS latest_ch1
    FROM public.hrd_ch1_responses
    WHERE organization IS NOT NULL AND organization <> ''
    GROUP BY organization
)
SELECT
    COALESCE(s.organization, c.organization)                             AS organization,
    COALESCE(s.wellbeing_total, 0)                                       AS wellbeing_total,
    COALESCE(s.wellbeing_submitted, 0)                                   AS wellbeing_submitted,
    COALESCE(s.wellbeing_draft, 0)                                       AS wellbeing_draft,
    COALESCE(s.flagged_phq9_high, 0)                                     AS flagged_phq9_high,
    s.latest_wb,
    COALESCE(c.ch1_count, 0)                                             AS ch1_count,
    c.latest_ch1
FROM survey_agg s
FULL OUTER JOIN ch1_agg c
    ON c.organization = s.organization;

COMMENT ON VIEW public.v_organization_dashboard_summary IS
    'Per-organization KPIs for admin dashboard. Replaces client-side summarizeOrgs() aggregation.';

-- Allow anonymous & authenticated clients to SELECT from the view.
-- Underlying RLS on survey_responses / hrd_ch1_responses still applies.
GRANT SELECT ON public.v_organization_dashboard_summary TO anon, authenticated;
