-- =============================================
-- Migration: Create cleaned_responses table
-- Purpose: Store cleaned survey data while preserving raw responses
-- Date: 2026-05-02
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Create cleaned_responses table
-- =============================================
CREATE TABLE IF NOT EXISTS public.cleaned_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
    cleaned_data JSONB NOT NULL,
    
    -- Cleaning audit log
    cleaning_log JSONB DEFAULT '{}'::jsonb,
    
    -- Status tracking
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'verified', 'rejected', 'archived')),
    
    -- Metadata
    cleaning_version INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    
    -- User tracking (stores auth.uid() from Supabase Auth)
    cleaned_by UUID,
    verified_by UUID,
    
    -- Timestamps
    cleaned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.cleaned_responses IS 'Stores cleaned/transformed survey responses linked to raw data in survey_responses';
COMMENT ON COLUMN public.cleaned_responses.cleaning_log IS 'JSON object tracking what was changed during cleaning (e.g., {"trimmed_fields": ["email"], "normalized": ["phone"], "invalid_removed": ["age"]}';
COMMENT ON COLUMN public.cleaned_responses.cleaning_version IS 'Version number for iterative cleaning (1, 2, 3, etc.)';

-- =============================================
-- 2. Create indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_cleaned_responses_response_id 
    ON public.cleaned_responses(response_id);

CREATE INDEX IF NOT EXISTS idx_cleaned_responses_status 
    ON public.cleaned_responses(verification_status);

CREATE INDEX IF NOT EXISTS idx_cleaned_responses_cleaned_by 
    ON public.cleaned_responses(cleaned_by);

CREATE INDEX IF NOT EXISTS idx_cleaned_responses_cleaned_at 
    ON public.cleaned_responses(cleaned_at);

-- GIN index for JSONB queries on cleaned_data
CREATE INDEX IF NOT EXISTS idx_cleaned_responses_data_gin 
    ON public.cleaned_responses USING GIN(cleaned_data);

-- =============================================
-- 3. Enable RLS
-- =============================================
ALTER TABLE public.cleaned_responses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. RLS Policies
-- =============================================

-- Allow cleaners to insert their own cleaning records
CREATE POLICY "Cleaners can insert their own records"
    ON public.cleaned_responses
    FOR INSERT
    TO authenticated
    WITH CHECK (cleaned_by = auth.uid());

-- Cleaners can update their own records while pending
CREATE POLICY "Cleaners can update own pending records"
    ON public.cleaned_responses
    FOR UPDATE
    TO authenticated
    USING (cleaned_by = auth.uid() AND verification_status = 'pending')
    WITH CHECK (cleaned_by = auth.uid());

-- Cleaners can delete their own pending records
CREATE POLICY "Cleaners can delete own pending records"
    ON public.cleaned_responses
    FOR DELETE
    TO authenticated
    USING (cleaned_by = auth.uid() AND verification_status = 'pending');

-- Cleaners can view their own records
CREATE POLICY "Cleaners can view own records"
    ON public.cleaned_responses
    FOR SELECT
    TO authenticated
    USING (cleaned_by = auth.uid());

-- Verifiers (admins/supervisors) can view all
CREATE POLICY "Verifiers can view all records"
    ON public.cleaned_responses
    FOR SELECT
    TO authenticated
    USING (
        -- Check user role from auth metadata or custom user profile if exists
        -- For now, allow all authenticated users to view (can be tightened later)
        true
    );

-- Verifiers can update verification status
CREATE POLICY "Verifiers can update verification"
    ON public.cleaned_responses
    FOR UPDATE
    TO authenticated
    USING (
        -- Check user role from auth metadata or custom user profile if exists
        -- For now, allow all authenticated users (can be tightened later)
        true
    )
    WITH CHECK (
        -- Check user role from auth metadata or custom user profile if exists
        -- For now, allow all authenticated users (can be tightened later)
        true
    );

-- =============================================
-- 5. Helper Functions
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cleaned_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cleaned_responses_updated_at
    BEFORE UPDATE ON public.cleaned_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cleaned_responses_updated_at();

-- Function to create cleaned response with audit log
CREATE OR REPLACE FUNCTION public.create_cleaned_response(
    p_response_id UUID,
    p_cleaned_data JSONB,
    p_cleaning_log JSONB DEFAULT '{}'::jsonb,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cleaned_id UUID;
BEGIN
    INSERT INTO public.cleaned_responses (
        response_id,
        cleaned_data,
        cleaning_log,
        notes,
        cleaned_by,
        cleaned_at,
        cleaning_version
    ) VALUES (
        p_response_id,
        p_cleaned_data,
        p_cleaning_log,
        p_notes,
        auth.uid(),
        NOW(),
        COALESCE(
            (SELECT MAX(cleaning_version) + 1 
             FROM public.cleaned_responses 
             WHERE response_id = p_response_id),
            1
        )
    )
    RETURNING id INTO v_cleaned_id;
    
    RETURN v_cleaned_id;
END;
$$;

-- Function to verify a cleaned response
CREATE OR REPLACE FUNCTION public.verify_cleaned_response(
    p_cleaned_id UUID,
    p_status VARCHAR(20),
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify user has verifier role (can be enhanced with custom role check later)
    -- For now, allow all authenticated users
    -- TODO: Add role check from auth metadata or custom user profile table
    
    UPDATE public.cleaned_responses
    SET 
        verification_status = p_status,
        verified_by = auth.uid(),
        verified_at = NOW(),
        notes = COALESCE(notes || E'\n' || p_notes, p_notes)
    WHERE id = p_cleaned_id;
    
    RETURN FOUND;
END;
$$;

-- Function to get latest cleaned version for a response
CREATE OR REPLACE FUNCTION public.get_latest_cleaned_response(p_response_id UUID)
RETURNS TABLE (
    id UUID,
    cleaned_data JSONB,
    verification_status VARCHAR(20),
    cleaning_version INTEGER,
    cleaned_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        cr.id,
        cr.cleaned_data,
        cr.verification_status,
        cr.cleaning_version,
        cr.cleaned_at
    FROM public.cleaned_responses cr
    WHERE cr.response_id = p_response_id
    ORDER BY cr.cleaning_version DESC
    LIMIT 1;
$$;

-- Function to get cleaning statistics
CREATE OR REPLACE FUNCTION public.get_cleaning_stats()
RETURNS TABLE (
    total_cleaned BIGINT,
    pending_verification BIGINT,
    verified BIGINT,
    rejected BIGINT,
    avg_versions_per_response NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        COUNT(*)::BIGINT as total_cleaned,
        COUNT(*) FILTER (WHERE verification_status = 'pending')::BIGINT as pending_verification,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified,
        COUNT(*) FILTER (WHERE verification_status = 'rejected')::BIGINT as rejected,
        ROUND(AVG(cleaning_version)::NUMERIC, 2) as avg_versions_per_response
    FROM public.cleaned_responses;
$$;

-- =============================================
-- 6. Grant permissions
-- =============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaned_responses TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_cleaned_response(UUID, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cleaned_response(UUID, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_cleaned_response(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cleaning_stats() TO authenticated;

-- =============================================
-- 7. Views for convenience
-- =============================================

-- View: Raw vs Cleaned comparison
CREATE OR REPLACE VIEW public.v_raw_vs_cleaned AS
SELECT
    sr.id as raw_response_id,
    sr.raw_responses as raw_data,
    sr.submitted_at as raw_submitted_at,
    cr.id as cleaned_id,
    cr.cleaned_data,
    cr.verification_status,
    cr.cleaning_version,
    cr.cleaned_at,
    cr.cleaning_log,
    cr.cleaned_by as cleaner_user_id,
    cr.verified_by as verifier_user_id
FROM public.survey_responses sr
LEFT JOIN LATERAL (
    SELECT * FROM public.cleaned_responses
    WHERE response_id = sr.id
    ORDER BY cleaning_version DESC
    LIMIT 1
) cr ON true;

-- View: Pending verification queue
CREATE OR REPLACE VIEW public.v_pending_verification AS
SELECT
    cr.id,
    cr.response_id,
    cr.cleaned_data,
    cr.cleaning_log,
    cr.cleaning_version,
    cr.notes,
    cr.cleaned_at,
    cr.cleaned_by as cleaner_user_id,
    sr.raw_responses->>'organization' as organization_name
FROM public.cleaned_responses cr
JOIN public.survey_responses sr ON cr.response_id = sr.id
WHERE cr.verification_status = 'pending'
ORDER BY cr.cleaned_at DESC;

-- Grant view access
GRANT SELECT ON public.v_raw_vs_cleaned TO authenticated;
GRANT SELECT ON public.v_pending_verification TO authenticated;

