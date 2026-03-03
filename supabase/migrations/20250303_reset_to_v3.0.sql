-- =============================================
-- Migration: Reset to Well-being Survey v3.0
-- Delete all old data and create new schema
-- =============================================

-- WARNING: This will delete ALL existing data in hrd_ch1_responses
-- Make sure to backup if needed before running!

-- Step 1: Delete all existing data
TRUNCATE TABLE hrd_ch1_responses;

-- Step 2: Drop all existing columns (optional - we'll just replace the table)
-- Actually, let's drop and recreate the table completely for a clean slate

DROP TABLE IF EXISTS hrd_ch1_responses;

-- Step 3: Create new table with v3.0 schema (5-part structure)
CREATE TABLE hrd_ch1_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    
    -- Metadata
    respondent_email TEXT,
    organization TEXT,
    form_version TEXT DEFAULT 'ch1-v3.0',
    
    -- Step 1: ข้อมูลเบื้องต้นของส่วนราชการ
    strategic_overview TEXT,
    org_structure TEXT,
    total_staff INTEGER,
    
    -- Age distribution (4 groups)
    age_u30 INTEGER DEFAULT 0,
    age_31_40 INTEGER DEFAULT 0,
    age_41_50 INTEGER DEFAULT 0,
    age_51_60 INTEGER DEFAULT 0,
    
    -- Service years (8 ranges)
    service_u1 INTEGER DEFAULT 0,
    service_1_5 INTEGER DEFAULT 0,
    service_6_10 INTEGER DEFAULT 0,
    service_11_15 INTEGER DEFAULT 0,
    service_16_20 INTEGER DEFAULT 0,
    service_21_25 INTEGER DEFAULT 0,
    service_26_30 INTEGER DEFAULT 0,
    service_over30 INTEGER DEFAULT 0,
    
    -- Position types (13 levels)
    pos_o1 INTEGER DEFAULT 0,
    pos_o2 INTEGER DEFAULT 0,
    pos_o3 INTEGER DEFAULT 0,
    pos_o4 INTEGER DEFAULT 0,
    pos_k1 INTEGER DEFAULT 0,
    pos_k2 INTEGER DEFAULT 0,
    pos_k3 INTEGER DEFAULT 0,
    pos_k4 INTEGER DEFAULT 0,
    pos_k5 INTEGER DEFAULT 0,
    pos_m1 INTEGER DEFAULT 0,
    pos_m2 INTEGER DEFAULT 0,
    pos_s1 INTEGER DEFAULT 0,
    pos_s2 INTEGER DEFAULT 0,
    
    -- Turnover and transfer
    turnover_count INTEGER,
    turnover_rate DECIMAL(5,2),
    transfer_count INTEGER,
    transfer_rate DECIMAL(5,2),
    
    -- Step 2: นโยบายและบริบทภายนอก
    related_policies TEXT,
    context_challenges TEXT,
    
    -- Step 3: ข้อมูลสุขภาวะ
    -- NCD diseases
    disease_diabetes INTEGER DEFAULT 0,
    disease_hypertension INTEGER DEFAULT 0,
    disease_cardiovascular INTEGER DEFAULT 0,
    disease_kidney INTEGER DEFAULT 0,
    disease_liver INTEGER DEFAULT 0,
    disease_cancer INTEGER DEFAULT 0,
    disease_obesity INTEGER DEFAULT 0,
    disease_other_count INTEGER DEFAULT 0,
    disease_other_detail TEXT,
    ncd_count INTEGER DEFAULT 0,
    ncd_ratio_pct DECIMAL(5,2),
    
    -- Sick leave
    sick_leave_days INTEGER,
    sick_leave_avg DECIMAL(5,2),
    
    -- Clinic
    clinic_users_per_year INTEGER,
    clinic_top_symptoms TEXT,
    clinic_top_medications TEXT,
    
    -- Mental health (text descriptions)
    mental_stress TEXT,
    mental_anxiety TEXT,
    mental_sleep TEXT,
    mental_burnout TEXT,
    mental_depression TEXT,
    
    -- Engagement
    engagement_score TEXT,
    engagement_low_areas TEXT,
    
    -- Other wellbeing surveys
    other_wellbeing_surveys TEXT,
    
    -- Step 4: ระบบการบริหารและสภาพแวดล้อม
    mentoring_system TEXT,
    job_rotation TEXT,
    idp_system TEXT,
    career_path_system TEXT,
    training_hours TEXT,
    digital_systems TEXT[], -- Array of selected values
    ergonomics_status TEXT,
    ergonomics_detail TEXT,
    wellbeing_analysis TEXT,
    
    -- Step 5: ทิศทาง เป้าหมาย และข้อเสนอแนะ
    strategic_priorities TEXT[], -- Array of selected values
    strategic_priority_other TEXT,
    intervention_suggestions TEXT,
    hrd_plan_url TEXT,
    hrd_plan_results TEXT,
    
    -- Indexes for common queries
    CONSTRAINT valid_organization CHECK (organization IS NOT NULL AND length(organization) > 0),
    CONSTRAINT valid_total_staff CHECK (total_staff IS NULL OR total_staff > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_hrd_ch1_organization ON hrd_ch1_responses(organization);
CREATE INDEX idx_hrd_ch1_submitted_at ON hrd_ch1_responses(submitted_at DESC);
CREATE INDEX idx_hrd_ch1_form_version ON hrd_ch1_responses(form_version);

-- Add RLS (Row Level Security) policies
ALTER TABLE hrd_ch1_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON hrd_ch1_responses
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read" ON hrd_ch1_responses
    FOR SELECT TO authenticated
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE hrd_ch1_responses IS 'Well-being Survey Chapter 1 responses - v3.0 (5-part structure)';
COMMENT ON COLUMN hrd_ch1_responses.form_version IS 'Version of the form: ch1-v3.0';
COMMENT ON COLUMN hrd_ch1_responses.strategic_overview IS 'Step 1: ภาพรวมยุทธศาสตร์และทิศทาง';
COMMENT ON COLUMN hrd_ch1_responses.related_policies IS 'Step 2: นโยบายและยุทธศาสตร์ที่เกี่ยวข้อง';
COMMENT ON COLUMN hrd_ch1_responses.ncd_count IS 'Step 3: จำนวนผู้ป่วย NCD รวมทุกประเภท';
COMMENT ON COLUMN hrd_ch1_responses.mentoring_system IS 'Step 4: สถานะระบบพี่เลี้ยง';
COMMENT ON COLUMN hrd_ch1_responses.strategic_priorities IS 'Step 5: จุดเน้นการพัฒนาที่เลือก';

-- =============================================
-- Verification query
-- =============================================
SELECT 'Table hrd_ch1_responses recreated with v3.0 schema' as status;
