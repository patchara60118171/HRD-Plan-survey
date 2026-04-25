-- =============================================
-- Performance Optimization: Composite & Partial Indexes
-- Based on Supabase Postgres Best Practices
-- Date: 2026-04-18
-- =============================================

-- 1. Composite Indexes for Multi-Column Queries
-- These are more efficient than separate single-column indexes

-- Composite index for survey_responses: email + timestamp (for duplicate checks)
CREATE INDEX IF NOT EXISTS idx_survey_email_timestamp_composite 
ON survey_responses (email, timestamp DESC) 
WHERE is_draft = false;

-- Composite index for hrd_ch1_responses: org_code + submitted_at (for org-specific queries)
CREATE INDEX IF NOT EXISTS idx_hrd_org_submitted_composite 
ON hrd_ch1_responses (org_code, submitted_at DESC)
WHERE is_test = false;

-- Composite index for admin_user_roles: role + is_active (for user management)
CREATE INDEX IF NOT EXISTS idx_admin_role_active_composite 
ON admin_user_roles (role, is_active)
WHERE is_active = true;

-- Composite index for organizations: org_code + is_test (for filtering test orgs)
CREATE INDEX IF NOT EXISTS idx_org_code_test_composite 
ON organizations (org_code, is_test)
WHERE is_test = false;

-- 2. Partial Indexes for Filtered Queries
-- These indexes are smaller and faster for queries that consistently filter

-- Partial index for submitted survey responses (excludes drafts)
CREATE INDEX IF NOT EXISTS idx_survey_submitted_partial 
ON survey_responses (submitted_at DESC)
WHERE is_draft = false;

-- Partial index for non-test CH1 responses
CREATE INDEX IF NOT EXISTS idx_hrd_non_test_partial 
ON hrd_ch1_responses (submitted_at DESC)
WHERE is_test = false;

-- Partial index for active admin users
CREATE INDEX IF NOT EXISTS idx_admin_active_partial 
ON admin_user_roles (email)
WHERE is_active = true;

-- Partial index for active form windows
CREATE INDEX IF NOT EXISTS idx_form_windows_active_partial 
ON form_windows (form_id, opens_at)
WHERE is_active = true;

-- 3. Covering Indexes for Common Query Patterns
-- Include frequently selected columns to avoid table lookups

-- Covering index for survey_responses dashboard queries
CREATE INDEX IF NOT EXISTS idx_survey_dashboard_covering 
ON survey_responses (submitted_at DESC, email, organization)
WHERE is_draft = false;

-- Covering index for CH1 dashboard queries
CREATE INDEX IF NOT EXISTS idx_hrd_dashboard_covering 
ON hrd_ch1_responses (submitted_at DESC, org_code, organization)
WHERE is_test = false;

-- 4. JSONB GIN Indexes (if not already present)
-- For efficient JSONB queries on form_data

CREATE INDEX IF NOT EXISTS idx_hrd_form_data_gin 
ON hrd_ch1_responses USING gin (form_data);

CREATE INDEX IF NOT EXISTS idx_survey_form_data_gin 
ON survey_responses USING gin (raw_responses)
WHERE raw_responses IS NOT NULL;

-- 5. Function-based Indexes for Common Filters
-- Lowercase indexes for case-insensitive searches

CREATE INDEX IF NOT EXISTS idx_survey_email_lower 
ON survey_responses (lower(email));

CREATE INDEX IF NOT EXISTS idx_hrd_email_lower 
ON hrd_ch1_responses (lower(respondent_email));

CREATE INDEX IF NOT EXISTS idx_admin_email_lower 
ON admin_user_roles (lower(email));

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON INDEX idx_survey_email_timestamp_composite IS 'Composite index for email + timestamp filtering on non-draft survey responses';
COMMENT ON INDEX idx_hrd_org_submitted_composite IS 'Composite index for org_code + submitted_at on non-test CH1 responses';
COMMENT ON INDEX idx_admin_role_active_composite IS 'Composite index for role + is_active on active admin users';
COMMENT ON INDEX idx_org_code_test_composite IS 'Composite index for org_code + is_test on non-test organizations';

COMMENT ON INDEX idx_survey_submitted_partial IS 'Partial index for submitted survey responses only (excludes drafts)';
COMMENT ON INDEX idx_hrd_non_test_partial IS 'Partial index for non-test CH1 responses only';
COMMENT ON INDEX idx_admin_active_partial IS 'Partial index for active admin users only';
COMMENT ON INDEX idx_form_windows_active_partial IS 'Partial index for active form windows only';

COMMENT ON INDEX idx_survey_dashboard_covering IS 'Covering index for survey dashboard queries (includes email, organization)';
COMMENT ON INDEX idx_hrd_dashboard_covering IS 'Covering index for CH1 dashboard queries (includes org_code, organization)';

COMMENT ON INDEX idx_hrd_form_data_gin IS 'GIN index for efficient JSONB queries on form_data';
COMMENT ON INDEX idx_survey_form_data_gin IS 'GIN index for efficient JSONB queries on raw_responses';

COMMENT ON INDEX idx_survey_email_lower IS 'Function-based index for case-insensitive email searches';
COMMENT ON INDEX idx_hrd_email_lower IS 'Function-based index for case-insensitive respondent_email searches';
COMMENT ON INDEX idx_admin_email_lower IS 'Function-based index for case-insensitive admin email searches';
