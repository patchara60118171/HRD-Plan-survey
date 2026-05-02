-- =============================================
-- Migration: Auto-copy all survey_responses to cleaned_responses
-- Purpose: Initial data copy for cleaning workflow
-- Date: 2026-05-02
-- =============================================

-- Copy all existing survey_responses to cleaned_responses
-- This runs once during migration to populate the cleaned table
DO $$
DECLARE
    v_count BIGINT;
    v_response RECORD;
BEGIN
    v_count := 0;
    
    FOR v_response IN SELECT id, raw_responses FROM public.survey_responses
    LOOP
        -- Check if already exists (skip if already copied)
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
                NULL, -- No user context in migration
                NOW()
            );
            
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Copied % responses to cleaned_responses table', v_count;
END $$;
