-- docs/migration_ch1_v2.sql
-- รัน 1 ครั้งใน Supabase SQL Editor

ALTER TABLE public.hrd_ch1_responses
  -- ส่วนที่ 1
  ADD COLUMN IF NOT EXISTS vision_mission TEXT,
  ADD COLUMN IF NOT EXISTS strategic_plan_summary TEXT,
  ADD COLUMN IF NOT EXISTS org_chart_url TEXT,
  ADD COLUMN IF NOT EXISTS retirement_risk_positions TEXT,
  ADD COLUMN IF NOT EXISTS service_u5 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_6_10 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_over10 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS age_over60 INTEGER DEFAULT 0,
  -- ส่วนที่ 2.1
  ADD COLUMN IF NOT EXISTS disease_diabetes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_hypertension INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_cardiovascular INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_kidney INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_liver INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_cancer INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_obesity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disease_other_detail TEXT,
  -- ส่วนที่ 2.2
  ADD COLUMN IF NOT EXISTS sick_leave_data JSONB,
  -- ส่วนที่ 2.3
  ADD COLUMN IF NOT EXISTS clinic_users_per_year INTEGER,
  ADD COLUMN IF NOT EXISTS clinic_top_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS clinic_top_medications TEXT,
  -- ส่วนที่ 3.1
  ADD COLUMN IF NOT EXISTS mental_stress_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mental_anxiety_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mental_sleep_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mental_burnout_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mental_depression_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mental_other TEXT,
  -- ส่วนที่ 3.2
  ADD COLUMN IF NOT EXISTS engagement_data JSONB,
  ADD COLUMN IF NOT EXISTS engagement_trend TEXT,
  -- ส่วนที่ 3.3
  ADD COLUMN IF NOT EXISTS turnover_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS transfer_rate NUMERIC(5,2),
  -- ส่วนที่ 4
  ADD COLUMN IF NOT EXISTS mentoring_system TEXT,
  ADD COLUMN IF NOT EXISTS job_rotation TEXT,
  ADD COLUMN IF NOT EXISTS idp_system TEXT,
  ADD COLUMN IF NOT EXISTS training_hours_range TEXT,
  ADD COLUMN IF NOT EXISTS career_path_system TEXT,
  -- ส่วนที่ 5
  ADD COLUMN IF NOT EXISTS ergonomics_status TEXT,
  ADD COLUMN IF NOT EXISTS ergonomics_detail TEXT,
  ADD COLUMN IF NOT EXISTS digital_systems TEXT[],
  ADD COLUMN IF NOT EXISTS digital_other TEXT,
  -- ส่วนที่ 6
  ADD COLUMN IF NOT EXISTS hrd_plan_url TEXT,
  ADD COLUMN IF NOT EXISTS hrd_budget_url TEXT,
  ADD COLUMN IF NOT EXISTS core_competency_url TEXT,
  ADD COLUMN IF NOT EXISTS functional_competency_url TEXT,
  ADD COLUMN IF NOT EXISTS hrd_opportunities TEXT[],
  ADD COLUMN IF NOT EXISTS hrd_opportunities_other TEXT,
  -- ส่วนที่ 7
  ADD COLUMN IF NOT EXISTS hr_strategy_map_url TEXT,
  ADD COLUMN IF NOT EXISTS strategic_priorities JSONB,
  ADD COLUMN IF NOT EXISTS strategic_priorities_other TEXT,
  -- Metadata
  ADD COLUMN IF NOT EXISTS form_version TEXT DEFAULT 'ch1-v2';

-- ตรวจสอบผล
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'hrd_ch1_responses'
ORDER BY ordinal_position;
