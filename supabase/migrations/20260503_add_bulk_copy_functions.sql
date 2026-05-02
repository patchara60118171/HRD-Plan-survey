-- =============================================
-- Migration: Add bulk copy functions for cleaning
-- Purpose: Easy copy from survey_responses to cleaned_responses
-- Date: 2026-05-02
-- =============================================

-- =============================================
-- Function: Copy all survey_responses to cleaned_responses
-- =============================================
CREATE OR REPLACE FUNCTION public.copy_all_responses_to_cleaned()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count BIGINT;
    v_response RECORD;
BEGIN
    v_count := 0;
    
    FOR v_response IN SELECT id, raw_responses FROM public.survey_responses
    LOOP
        -- Check if already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.cleaned_responses 
            WHERE response_id = v_response.id
        ) THEN
            INSERT INTO public.cleaned_responses (
                response_id,
                cleaned_data,
                cleaning_log,
                verification_status,
                cleaning_version,
                cleaned_by,
                cleaned_at
            ) VALUES (
                v_response.id,
                v_response.raw_responses,
                '{"copied_from_raw": true}'::jsonb,
                'pending',
                1,
                auth.uid(),
                NOW()
            );
            
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$;

-- =============================================
-- Function: Copy single response to cleaned
-- =============================================
CREATE OR REPLACE FUNCTION public.copy_response_to_cleaned(p_response_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_raw_data JSONB;
    v_cleaned_id UUID;
BEGIN
    -- Get raw data
    SELECT raw_responses INTO v_raw_data
    FROM public.survey_responses
    WHERE id = p_response_id;
    
    IF v_raw_data IS NULL THEN
        RAISE EXCEPTION 'Response not found';
    END IF;
    
    -- Check if already exists
    IF EXISTS (
        SELECT 1 FROM public.cleaned_responses 
        WHERE response_id = p_response_id
    ) THEN
        -- Update existing
        UPDATE public.cleaned_responses
        SET 
            cleaned_data = v_raw_data,
            cleaning_log = '{"copied_from_raw": true}'::jsonb,
            verification_status = 'pending',
            cleaning_version = cleaning_version + 1,
            cleaned_by = auth.uid(),
            cleaned_at = NOW()
        WHERE response_id = p_response_id
        RETURNING id INTO v_cleaned_id;
    ELSE
        -- Insert new
        INSERT INTO public.cleaned_responses (
            response_id,
            cleaned_data,
            cleaning_log,
            verification_status,
            cleaning_version,
            cleaned_by,
            cleaned_at
        ) VALUES (
            p_response_id,
            v_raw_data,
            '{"copied_from_raw": true}'::jsonb,
            'pending',
            1,
            auth.uid(),
            NOW()
        )
        RETURNING id INTO v_cleaned_id;
    END IF;
    
    RETURN v_cleaned_id;
END;
$$;

-- =============================================
-- Function: Get responses without cleaned version
-- =============================================
CREATE OR REPLACE FUNCTION public.get_responses_needing_cleaning()
RETURNS TABLE (
    response_id UUID,
    raw_data JSONB,
    email TEXT,
    submitted_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        sr.id as response_id,
        sr.raw_responses as raw_data,
        sr.email,
        sr.submitted_at
    FROM public.survey_responses sr
    WHERE NOT EXISTS (
        SELECT 1 FROM public.cleaned_responses cr 
        WHERE cr.response_id = sr.id
    )
    ORDER BY sr.submitted_at DESC
    LIMIT 100;
$$;

-- =============================================
-- View: Easy editing view (Raw + Cleaned side by side)
-- =============================================
CREATE OR REPLACE VIEW public.v_cleaning_workspace AS
SELECT 
    sr.id as response_id,
    sr.raw_responses as raw_data,
    sr.email,
    sr.submitted_at,
    cr.id as cleaned_id,
    cr.cleaned_data,
    cr.verification_status,
    cr.cleaning_version,
    cr.notes,
    CASE 
        WHEN cr.id IS NULL THEN 'NOT_COPIED'
        WHEN cr.verification_status = 'pending' THEN 'PENDING'
        WHEN cr.verification_status = 'verified' THEN 'VERIFIED'
        WHEN cr.verification_status = 'rejected' THEN 'REJECTED'
        ELSE cr.verification_status
    END as status
FROM public.survey_responses sr
LEFT JOIN public.cleaned_responses cr ON sr.id = cr.response_id
ORDER BY sr.submitted_at DESC;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.copy_all_responses_to_cleaned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_response_to_cleaned(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_responses_needing_cleaning() TO authenticated;
GRANT SELECT ON public.v_cleaning_workspace TO authenticated;

-- Comments
COMMENT ON FUNCTION public.copy_all_responses_to_cleaned() IS 'คัดลอกทุก survey_responses ไป cleaned_responses (คัดลอกเฉพาะที่ยังไม่มี)';
COMMENT ON FUNCTION public.copy_response_to_cleaned(UUID) IS 'คัดลอก response เดียว ถ้ามีแล้วจะ update version';
COMMENT ON FUNCTION public.get_responses_needing_cleaning() IS 'ดึง responses ที่ยังไม่มี cleaned version';
COMMENT ON VIEW public.v_cleaning_workspace IS 'View สำหรับแก้ไขข้อมูลแบบง่าย (raw + cleaned อยู่ข้างกัน)';
