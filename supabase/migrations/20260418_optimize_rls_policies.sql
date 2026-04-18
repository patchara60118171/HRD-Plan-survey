-- =============================================
-- RLS Policy Optimization
-- Based on Supabase Postgres Best Practices
-- Date: 2026-04-18
-- =============================================

-- This migration optimizes RLS policies to reduce function call overhead
-- by using direct column comparisons where possible and caching function results

-- 1. Optimize survey_responses policies
-- Reduce repeated function calls by using direct email comparison

DROP POLICY IF EXISTS "Role-aware select survey" ON survey_responses;

CREATE POLICY "Role-aware select survey"
ON survey_responses
FOR SELECT
TO authenticated
USING (
    -- Super admin: full access
    EXISTS (
        SELECT 1 FROM admin_user_roles aur
        WHERE aur.email = lower(auth.jwt() ->> 'email')
        AND aur.role IN ('super_admin', 'admin')
        AND aur.is_active = true
    )
    OR (
        -- Viewer: org-scoped access
        EXISTS (
            SELECT 1 FROM admin_user_roles aur
            WHERE aur.email = lower(auth.jwt() ->> 'email')
            AND aur.role = 'viewer'
            AND aur.is_active = true
        )
        AND coalesce(raw_responses ->> 'organization', '') = coalesce(
            (SELECT aur.org_name FROM admin_user_roles aur 
             WHERE aur.email = lower(auth.jwt() ->> 'email') AND aur.is_active = true LIMIT 1),
            '__none__'
        )
    )
);

-- 2. Optimize hrd_ch1_responses policies
-- Use direct org_code comparison instead of function calls

DROP POLICY IF EXISTS "Role-aware select ch1" ON hrd_ch1_responses;

CREATE POLICY "Role-aware select ch1"
ON hrd_ch1_responses
FOR SELECT
TO authenticated
USING (
    -- Super admin: full access
    EXISTS (
        SELECT 1 FROM admin_user_roles aur
        WHERE aur.email = lower(auth.jwt() ->> 'email')
        AND aur.role IN ('super_admin', 'admin')
        AND aur.is_active = true
    )
    OR (
        -- Viewer: org-scoped access
        EXISTS (
            SELECT 1 FROM admin_user_roles aur
            WHERE aur.email = lower(auth.jwt() ->> 'email')
            AND aur.role = 'viewer'
            AND aur.is_active = true
        )
        AND (
            org_code = (
                SELECT aur.org_code FROM admin_user_roles aur 
                WHERE aur.email = lower(auth.jwt() ->> 'email') AND aur.is_active = true LIMIT 1
            )
            OR organization = (
                SELECT aur.org_name FROM admin_user_roles aur 
                WHERE aur.email = lower(auth.jwt() ->> 'email') AND aur.is_active = true LIMIT 1
            )
        )
    )
);

-- 3. Optimize admin_user_roles policies
-- Add partial index hints for common queries

DROP POLICY IF EXISTS "Users can read own role" ON admin_user_roles;

CREATE POLICY "Users can read own role"
ON admin_user_roles
FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- 4. Optimize organizations policies
-- Add role-based access with direct comparisons

DROP POLICY IF EXISTS "Read organizations authenticated" ON organizations;

CREATE POLICY "Read organizations authenticated"
ON organizations
FOR SELECT
TO authenticated
USING (
    -- Admins can see all
    EXISTS (
        SELECT 1 FROM admin_user_roles aur
        WHERE aur.email = lower(auth.jwt() ->> 'email')
        AND aur.role IN ('super_admin', 'admin')
        AND aur.is_active = true
    )
    OR (
        -- Viewers see only their org
        EXISTS (
            SELECT 1 FROM admin_user_roles aur
            WHERE aur.email = lower(auth.jwt() ->> 'email')
            AND aur.role = 'viewer'
            AND aur.is_active = true
        )
        AND (
            org_code = (
                SELECT aur.org_code FROM admin_user_roles aur 
                WHERE aur.email = lower(auth.jwt() ->> 'email') AND aur.is_active = true LIMIT 1
            )
            OR org_name_th = (
                SELECT aur.org_name FROM admin_user_roles aur 
                WHERE aur.email = lower(auth.jwt() ->> 'email') AND aur.is_active = true LIMIT 1
            )
        )
    )
);

-- 5. Add function-based index for RLS email lookups
-- This speeds up the repeated email comparisons in RLS policies

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_email_lower_active 
ON admin_user_roles (lower(email))
WHERE is_active = true;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON POLICY "Role-aware select survey" IS 'Optimized RLS policy with direct email comparisons to reduce function call overhead';
COMMENT ON POLICY "Role-aware select ch1" IS 'Optimized RLS policy with direct org_code/org_name comparisons for faster org-scoped queries';
COMMENT ON POLICY "Users can read own role" IS 'Optimized policy with lowercase email comparison';
COMMENT ON POLICY "Read organizations authenticated" IS 'Optimized policy with role-based access and direct org comparisons';

COMMENT ON INDEX idx_admin_user_roles_email_lower_active IS 'Function-based index for RLS email lookups on active users';
