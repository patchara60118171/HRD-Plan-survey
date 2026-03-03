-- =============================================
-- Supabase Schema Migration: Update hrd_ch1_responses for v3.0
-- Add new columns for 5-part well-being survey structure
-- =============================================

-- Step 1: Add new columns for basic org info
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS strategic_overview TEXT,
ADD COLUMN IF NOT EXISTS org_structure TEXT,
ADD COLUMN IF NOT EXISTS turnover_count INTEGER,
ADD COLUMN IF NOT EXISTS transfer_count INTEGER;

-- Step 1: Add age distribution (4 ranges, removed age_over60)
-- Note: Keep existing age fields, just update usage in app

-- Step 1: Add service years (8 new ranges, replacing old 3 ranges)
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS service_u1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_1_5 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_11_15 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_16_20 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_21_25 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_26_30 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_over30 INTEGER DEFAULT 0;

-- Step 1: Add position types (13 categories)
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS pos_o1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_o2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_o3 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_o4 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_k1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_k2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_k3 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_k4 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_k5 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_m1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_m2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_s1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pos_s2 INTEGER DEFAULT 0;

-- Step 2: Add policy and context fields
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS related_policies TEXT,
ADD COLUMN IF NOT EXISTS context_challenges TEXT;

-- Step 3: Add other wellbeing surveys
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS other_wellbeing_surveys TEXT;

-- Step 4: Add support systems and environment
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS training_hours NUMERIC,
ADD COLUMN IF NOT EXISTS wellbeing_analysis TEXT;

-- Step 5: Add direction and goals fields
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS intervention_suggestions TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_results TEXT;

-- Update form_version to track new records
-- Note: Existing records will keep 'ch1-v2' or NULL

-- =============================================
-- Optional: Create comments for documentation
-- =============================================

COMMENT ON COLUMN hrd_ch1_responses.strategic_overview IS 'ภาพรวมยุทธศาสตร์และทิศทางของส่วนราชการ';
COMMENT ON COLUMN hrd_ch1_responses.org_structure IS 'โครงสร้างองค์กรและบทบาทหน้าที่หลัก';
COMMENT ON COLUMN hrd_ch1_responses.service_u1 IS 'อายุราชการไม่เกิน 1 ปี';
COMMENT ON COLUMN hrd_ch1_responses.service_1_5 IS 'อายุราชการ 1-5 ปี';
COMMENT ON COLUMN hrd_ch1_responses.pos_o1 IS 'ประเภททั่วไป ระดับปฏิบัติงาน';
COMMENT ON COLUMN hrd_ch1_responses.pos_k1 IS 'ประเภทวิชาการ ระดับปฏิบัติการ';
COMMENT ON COLUMN hrd_ch1_responses.related_policies IS 'นโยบายและยุทธศาสตร์ที่เกี่ยวข้อง';
COMMENT ON COLUMN hrd_ch1_responses.context_challenges IS 'ข้อมูลบริบทและความท้าทาย';
COMMENT ON COLUMN hrd_ch1_responses.training_hours IS 'ชั่วโมงการอบรมเฉลี่ยต่อคนต่อปี (เลข)';
COMMENT ON COLUMN hrd_ch1_responses.intervention_suggestions IS 'ข้อเสนอแนะเกี่ยวกับฐานข้อมูล Intervention Packages';
