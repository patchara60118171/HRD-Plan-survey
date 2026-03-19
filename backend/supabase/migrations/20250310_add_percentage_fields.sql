-- =============================================
-- Migration: Add turnover/transfer percentage fields per year
-- เก็บค่าร้อยละอัตโนมัติ ย้อนหลัง 5 ปี (2564-2568)
-- =============================================

-- Add percentage fields for turnover rate per year
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS rate_2564 NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS rate_2565 NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS rate_2566 NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS rate_2567 NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS rate_2568 NUMERIC(5,2);

-- Add comments for documentation
COMMENT ON COLUMN hrd_ch1_responses.rate_2564 IS 'ร้อยละการลาออกและโอนย้าย ปี 2564 (คำนวณอัตโนมัติ)';
COMMENT ON COLUMN hrd_ch1_responses.rate_2565 IS 'ร้อยละการลาออกและโอนย้าย ปี 2565 (คำนวณอัตโนมัติ)';
COMMENT ON COLUMN hrd_ch1_responses.rate_2566 IS 'ร้อยละการลาออกและโอนย้าย ปี 2566 (คำนวณอัตโนมัติ)';
COMMENT ON COLUMN hrd_ch1_responses.rate_2567 IS 'ร้อยละการลาออกและโอนย้าย ปี 2567 (คำนวณอัตโนมัติ)';
COMMENT ON COLUMN hrd_ch1_responses.rate_2568 IS 'ร้อยละการลาออกและโอนย้าย ปี 2568 (คำนวณอัตโนมัติ)';

-- =============================================
-- Verify the migration
-- =============================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    col_description('hrd_ch1_responses'::regclass, ordinal_position) as comment
FROM information_schema.columns 
WHERE table_name = 'hrd_ch1_responses'
AND column_name LIKE 'rate_%'
ORDER BY column_name;
