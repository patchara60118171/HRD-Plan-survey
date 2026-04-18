-- =============================================
-- Performance: indexes for admin dashboard queries
-- Date: 2026-04-18
-- Audit ref: H1 in docs/AUDIT_REPORT_2026-04.md
--
-- Rationale:
--   Admin portal filters by (org_code, status) and orders by updated_at DESC
--   on hrd_ch1_responses. It also filters survey_responses by organization
--   and orders by submitted_at DESC. The existing indexes in
--   supabase/performance-indexes.sql only cover email/submitted_at and a
--   heavy GIN over form_data::text — nothing tailored to the primary
--   admin-list access pattern.
-- =============================================

-- 1) hrd_ch1_responses: common admin-list pattern (filter by org, recent first)
CREATE INDEX IF NOT EXISTS idx_ch1_org_code_updated
    ON public.hrd_ch1_responses (org_code, updated_at DESC);

-- 2) hrd_ch1_responses: narrow index on open/in-progress rows
CREATE INDEX IF NOT EXISTS idx_ch1_status_updated
    ON public.hrd_ch1_responses (status, updated_at DESC)
    WHERE status IS NOT NULL;

-- 3) survey_responses: org dashboards order submissions by org & recency
CREATE INDEX IF NOT EXISTS idx_survey_org_submitted
    ON public.survey_responses (organization, submitted_at DESC)
    WHERE coalesce(is_draft, false) = false;

-- 4) survey_responses: cover org_code lookups (org-HR scope)
CREATE INDEX IF NOT EXISTS idx_survey_org_code
    ON public.survey_responses (org_code)
    WHERE org_code IS NOT NULL;

-- 5) org_form_links: lookup by org_code + form_slug is the hot path
CREATE INDEX IF NOT EXISTS idx_org_form_links_org_form
    ON public.org_form_links (org_code, form_slug);
