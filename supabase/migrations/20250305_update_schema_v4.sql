-- =============================================
-- Supabase Schema Migration: Update hrd_ch1_responses for v4.0
-- Support new 5-step well-being survey form structure
-- =============================================

-- Step 1: Add file upload fields for PDF attachments
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS strategy_file_path TEXT,
ADD COLUMN IF NOT EXISTS strategy_file_url TEXT,
ADD COLUMN IF NOT EXISTS strategy_file_name TEXT,
ADD COLUMN IF NOT EXISTS org_structure_file_path TEXT,
ADD COLUMN IF NOT EXISTS org_structure_file_url TEXT,
ADD COLUMN IF NOT EXISTS org_structure_file_name TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_file_path TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_file_url TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_file_name TEXT;

-- Step 2: Add new ranking system fields for section 17
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS strategic_priority_rank1 TEXT,
ADD COLUMN IF NOT EXISTS strategic_priority_rank2 TEXT,
ADD COLUMN IF NOT EXISTS strategic_priority_rank3 TEXT,
ADD COLUMN IF NOT EXISTS strategic_priority_other TEXT;

-- Step 3: Add intervention packages feedback (section 18)
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS intervention_packages_feedback TEXT;

-- Step 4: Update existing fields to match new form structure
-- Rename or add fields that might be missing
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS hrd_plan_url TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_results TEXT;

-- Step 5: Add support systems fields (section 13)
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS support_systems TEXT; -- JSON array of support systems status

-- Step 6: Add digital systems as proper array (section 15)
-- Note: digital_systems already exists as TEXT[], but ensure it's properly configured
DO $$
BEGIN
    -- Check if column exists and is not already TEXT[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hrd_ch1_responses' 
        AND column_name = 'digital_systems'
        AND data_type != 'text[]'
    ) THEN
        ALTER TABLE hrd_ch1_responses DROP COLUMN IF EXISTS digital_systems;
        ALTER TABLE hrd_ch1_responses ADD COLUMN digital_systems TEXT[];
    END IF;
END $$;

-- Step 7: Add ergonomics detail fields (section 16)
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS ergonomics_planned_detail TEXT,
ADD COLUMN IF NOT EXISTS ergonomics_in_progress_detail TEXT,
ADD COLUMN IF NOT EXISTS ergonomics_done_detail TEXT;

-- Step 8: Ensure all numeric fields exist for staff distribution
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS total_staff INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS type_official INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS type_employee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS type_contract INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS type_other INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS age_u30 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS age_31_40 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS age_41_50 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS age_51_60 INTEGER DEFAULT 0;

-- Step 9: Add wellbeing data fields
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS sick_leave_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sick_leave_avg NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS clinic_users_per_year INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clinic_top_symptoms TEXT,
ADD COLUMN IF NOT EXISTS clinic_top_medications TEXT,
ADD COLUMN IF NOT EXISTS mental_stress TEXT,
ADD COLUMN IF NOT EXISTS mental_anxiety TEXT,
ADD COLUMN IF NOT EXISTS mental_sleep TEXT,
ADD COLUMN IF NOT EXISTS mental_burnout TEXT,
ADD COLUMN IF NOT EXISTS mental_depression TEXT,
ADD COLUMN IF NOT EXISTS other_wellbeing_surveys TEXT,
ADD COLUMN IF NOT EXISTS engagement_score TEXT,
ADD COLUMN IF NOT EXISTS engagement_low_areas TEXT;

-- Step 10: Update form version
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS form_version TEXT DEFAULT 'ch1-v4';

-- Update existing records to new version if NULL
UPDATE hrd_ch1_responses 
SET form_version = 'ch1-v4' 
WHERE form_version IS NULL OR form_version = 'ch1-v2' OR form_version = 'ch1-v3';

-- =============================================
-- Add indexes for performance
-- =============================================

-- Index for file metadata searches
CREATE INDEX IF NOT EXISTS idx_hrd_file_uploads 
ON hrd_ch1_responses(strategy_file_url, org_structure_file_url, hrd_plan_file_url) 
WHERE strategy_file_url IS NOT NULL 
   OR org_structure_file_url IS NOT NULL 
   OR hrd_plan_file_url IS NOT NULL;

-- Index for strategic priorities
CREATE INDEX IF NOT EXISTS idx_hrd_strategic_priorities 
ON hrd_ch1_responses(strategic_priority_rank1, strategic_priority_rank2, strategic_priority_rank3) 
WHERE strategic_priority_rank1 IS NOT NULL;

-- Index for organization and submission time
CREATE INDEX IF NOT EXISTS idx_hrd_org_submission 
ON hrd_ch1_responses(organization, submitted_at DESC);

-- =============================================
-- Add comments for documentation
-- =============================================

COMMENT ON COLUMN hrd_ch1_responses.strategy_file_path IS 'Path to strategy PDF file in storage';
COMMENT ON COLUMN hrd_ch1_responses.strategy_file_url IS 'Public URL for strategy PDF file';
COMMENT ON COLUMN hrd_ch1_responses.strategy_file_name IS 'Original filename of strategy PDF';
COMMENT ON COLUMN hrd_ch1_responses.org_structure_file_path IS 'Path to org structure PDF file';
COMMENT ON COLUMN hrd_ch1_responses.org_structure_file_url IS 'Public URL for org structure PDF';
COMMENT ON COLUMN hrd_ch1_responses.org_structure_file_name IS 'Original filename of org structure PDF';
COMMENT ON COLUMN hrd_ch1_responses.hrd_plan_file_path IS 'Path to HRD plan PDF file';
COMMENT ON COLUMN hrd_ch1_responses.hrd_plan_file_url IS 'Public URL for HRD plan PDF';
COMMENT ON COLUMN hrd_ch1_responses.hrd_plan_file_name IS 'Original filename of HRD plan PDF';

COMMENT ON COLUMN hrd_ch1_responses.strategic_priority_rank1 IS 'อันดับ 1 จุดเน้นการพัฒนา';
COMMENT ON COLUMN hrd_ch1_responses.strategic_priority_rank2 IS 'อันดับ 2 จุดเน้นการพัฒนา';
COMMENT ON COLUMN hrd_ch1_responses.strategic_priority_rank3 IS 'อันดับ 3 จุดเน้นการพัฒนา';
COMMENT ON COLUMN hrd_ch1_responses.strategic_priority_other IS 'รายละเอียดประเด็นอื่นๆที่เลือก';

COMMENT ON COLUMN hrd_ch1_responses.intervention_packages_feedback IS 'ข้อเสนอแนะเกี่ยวกับ Intervention Packages';
COMMENT ON COLUMN hrd_ch1_responses.support_systems IS 'สถานะระบบการบริหารบุคลากร (JSON array)';
COMMENT ON COLUMN hrd_ch1_responses.digital_systems IS 'ระบบสนับสนุนดิจิทัลที่มี (TEXT array)';

COMMENT ON COLUMN hrd_ch1_responses.total_staff IS 'จำนวนข้าราชการรวม';
COMMENT ON COLUMN hrd_ch1_responses.type_official IS 'จำนวนข้าราชการประเภททั่วไป';
COMMENT ON COLUMN hrd_ch1_responses.type_employee IS 'จำนวนพนักงานราชการ';
COMMENT ON COLUMN hrd_ch1_responses.type_contract IS 'จำนวนลูกจ้าง';
COMMENT ON COLUMN hrd_ch1_responses.type_other IS 'จำนวนอื่นๆ';

-- =============================================
-- Verify the migration
-- =============================================

-- Display final column count
SELECT 
    'hrd_ch1_responses' as table_name,
    COUNT(*) as column_count,
    MAX(form_version) as latest_version
FROM information_schema.columns 
WHERE table_name = 'hrd_ch1_responses';

-- Display new columns added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'hrd_ch1_responses'
AND column_name IN (
    'strategy_file_path', 'strategy_file_url', 'strategy_file_name',
    'org_structure_file_path', 'org_structure_file_url', 'org_structure_file_name',
    'hrd_plan_file_path', 'hrd_plan_file_url', 'hrd_plan_file_name',
    'strategic_priority_rank1', 'strategic_priority_rank2', 'strategic_priority_rank3',
    'strategic_priority_other', 'intervention_packages_feedback',
    'support_systems', 'ergonomics_planned_detail', 'ergonomics_in_progress_detail',
    'ergonomics_done_detail', 'total_staff', 'sick_leave_days', 'sick_leave_avg'
)
ORDER BY column_name;
