-- =============================================
-- Performance: indexes for admin dashboard queries
-- Date: 2026-04-18
-- Audit ref: H1 in docs/AUDIT_REPORT_2026-04.md
--
-- Rationale:
--   Admin portal filters by organization and orders by submitted_at DESC
--   on hrd_ch1_responses. It also filters survey_responses by organization
--   and orders by submitted_at DESC. The existing indexes in
--   supabase/performance-indexes.sql only cover email/submitted_at and a
--   heavy GIN over form_data::text — nothing tailored to the primary
--   admin-list access pattern.
-- =============================================

-- 1) hrd_ch1_responses: composite index for org + submitted_at (admin dashboard pattern)
CREATE INDEX IF NOT EXISTS idx_ch1_org_submitted
    ON public.hrd_ch1_responses (organization, submitted_at DESC);

-- 2) survey_responses: org dashboards order submissions by org & recency
CREATE INDEX IF NOT EXISTS idx_survey_org_submitted
    ON public.survey_responses (organization, submitted_at DESC)
    WHERE coalesce(is_draft, false) = false;
