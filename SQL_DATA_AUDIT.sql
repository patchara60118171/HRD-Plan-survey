-- SQL Audit Script for Chart Data Validation
-- Run these queries in Supabase to verify data fields exist and have values

-- 1. Check hrd_ch1_responses table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
ORDER BY ordinal_position;

-- 2. Sample data for Personnel Type charts
SELECT
  org_code,
  organization,
  type_official,
  type_employee,
  type_contract,
  type_other,
  age_under_30,
  age_31_40,
  age_41_50,
  age_51_60,
  pos_o1, pos_o2, pos_o3, pos_o4,
  pos_k1, pos_k2, pos_k3, pos_k4, pos_k5,
  pos_m1, pos_m2,
  pos_s1, pos_s2,
  service_under_1,
  service_1_5,
  service_6_10,
  service_11_15,
  service_16_20,
  service_21_25,
  service_26_30,
  service_over_30,
  created_at,
  updated_at
FROM hrd_ch1_responses
ORDER BY updated_at DESC
LIMIT 1;

-- 3. Check for BMI-related fields (for Health Summary chart)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
AND column_name ILIKE '%bmi%'
ORDER BY column_name;

-- 4. Check for TMHI/Mental Health fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
AND (column_name ILIKE '%tmhi%' OR column_name ILIKE '%mental%' OR column_name ILIKE '%health%')
ORDER BY column_name;

-- 5. Check for Health Clinic fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
AND (column_name ILIKE '%clinic%' OR column_name ILIKE '%health_service%')
ORDER BY column_name;

-- 6. Check for Sick Leave fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
AND column_name ILIKE '%sick%'
ORDER BY column_name;

-- 7. Check for Training Hours fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
AND column_name ILIKE '%training%'
ORDER BY column_name;

-- 8. Data completeness check - count non-null values
SELECT
  COUNT(*) as total_records,
  COUNT(type_official) as type_official_count,
  COUNT(age_under_30) as age_data_count,
  COUNT(pos_o1) as position_data_count,
  COUNT(service_under_1) as service_data_count,
  ROUND(AVG(CASE WHEN type_official IS NOT NULL THEN 1 ELSE 0 END)::numeric, 2) * 100 as type_data_percent,
  ROUND(AVG(CASE WHEN age_under_30 IS NOT NULL THEN 1 ELSE 0 END)::numeric, 2) * 100 as age_data_percent
FROM hrd_ch1_responses;

-- 9. Identify missing field values (data quality check)
SELECT
  id,
  org_code,
  organization,
  COALESCE(type_official, 0) as type_official,
  COALESCE(type_employee, 0) as type_employee,
  COALESCE(type_contract, 0) as type_contract,
  COALESCE(type_other, 0) as type_other
FROM hrd_ch1_responses
WHERE (type_official IS NULL OR type_employee IS NULL OR type_contract IS NULL OR type_other IS NULL)
LIMIT 10;
