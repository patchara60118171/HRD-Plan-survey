-- =============================================
-- Seed org_form_links for 14 organizations (Wellbeing Survey)
-- Date: 2026-03-22
-- URL format: https://nidawellbeing.vercel.app/?org={code}
-- =============================================

-- Step 1: Upsert 2 new orgs not in the original 15 (doh, opdc)
INSERT INTO public.organizations (org_code, org_name_th, org_name_en, is_test, is_active)
VALUES
  ('doh',  'กองฝึกอบรม กรมทางหลวง',                               'Training Division, Department of Highways',               false, true),
  ('opdc', 'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',           'Office of the Public Sector Development Commission',      false, true)
ON CONFLICT (org_code) DO UPDATE SET
  org_name_th = EXCLUDED.org_name_th,
  org_name_en = EXCLUDED.org_name_en,
  is_active   = true,
  is_test     = false;

-- Step 2: Ensure the other 12 orgs are active (in case they were deactivated)
UPDATE public.organizations
SET is_active = true, is_test = false
WHERE org_code IN ('probation','rid','dss','dcp','dmh','tmd','nrct','onep','tpso','mots','acfs','nesdc');

-- Step 3: Create org_form_links (Wellbeing Survey) for all 14 orgs
-- Uses a CTE to look up the wellbeing form UUID safely
WITH wb_form AS (
  SELECT id FROM public.survey_forms WHERE form_key = 'wellbeing' LIMIT 1
),
target_orgs AS (
  SELECT id, org_code
  FROM public.organizations
  WHERE org_code IN (
    'probation', 'rid', 'dss', 'dcp', 'dmh', 'tmd',
    'doh', 'nrct', 'opdc', 'onep', 'tpso', 'mots', 'acfs', 'nesdc'
  )
)
INSERT INTO public.org_form_links (org_id, form_id, full_url, is_active)
SELECT
  o.id,
  wb.id,
  'https://nidawellbeing.vercel.app/?org=' || o.org_code,
  true
FROM target_orgs o CROSS JOIN wb_form wb
ON CONFLICT DO NOTHING;

-- Verify result
SELECT
  o.org_code,
  o.org_name_th,
  l.full_url,
  l.is_active
FROM public.org_form_links l
JOIN public.organizations  o ON o.id = l.org_id
WHERE o.org_code IN (
  'probation', 'rid', 'dss', 'dcp', 'dmh', 'tmd',
  'doh', 'nrct', 'opdc', 'onep', 'tpso', 'mots', 'acfs', 'nesdc'
)
ORDER BY o.org_name_th;
