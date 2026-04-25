-- =============================================
-- Canonicalize org_codes + add missing org_form_links
-- Date: 2026-03-23
--
-- Problems fixed:
--   1. org_code 'hssd'     → rename to 'dhss'  (canonical per SSOT)
--   2. org_code 'probation'→ rename to 'dop'   (canonical per SSOT)
--   3. 'ocsc' (สำนักงาน กพร. เก่า) → rename to 'opdc' if canonical opdc not yet present
--   4. Add org_form_link for 'dcy' (missing from 20260322 seed)
--   5. Add org_form_link for 'dhss' and 'dop' (were missing due to old code)
-- =============================================

-- ─── 1. Rename hssd → dhss ───────────────────────────────────────────────────
UPDATE public.organizations
SET org_code = 'dhss', abbr_th = 'สบส.', abbr_en = 'DHSS',
    org_name_th = 'กรมสนับสนุนบริการสุขภาพ',
    org_name_en = 'Department of Health Service Support',
    updated_at  = now()
WHERE org_code = 'hssd'
  AND NOT EXISTS (SELECT 1 FROM public.organizations WHERE org_code = 'dhss');

-- If dhss already exists (e.g. inserted separately), just delete the duplicate hssd
DELETE FROM public.organizations WHERE org_code = 'hssd';

-- ─── 2. Rename probation → dop ───────────────────────────────────────────────
UPDATE public.organizations
SET org_code    = 'dop', abbr_th = 'คป.', abbr_en = 'DOP',
    org_name_th = 'กรมคุมประพฤติ',
    org_name_en = 'Department of Probation',
    updated_at  = now()
WHERE org_code = 'probation'
  AND NOT EXISTS (SELECT 1 FROM public.organizations WHERE org_code = 'dop');

-- If dop already exists, remove the duplicate probation
DELETE FROM public.organizations WHERE org_code = 'probation';

-- ─── 3. Rename ocsc → opdc (if canonical opdc not yet in table) ──────────────
-- (20260322 migration may have already inserted opdc; this handles the legacy ocsc row)
UPDATE public.organizations
SET org_code    = 'opdc', abbr_th = 'สำนักงาน ก.พ.ร.', abbr_en = 'OPDC',
    org_name_th = 'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',
    org_name_en = 'Office of the Public Sector Development Commission',
    updated_at  = now()
WHERE org_code = 'ocsc'
  AND NOT EXISTS (SELECT 1 FROM public.organizations WHERE org_code = 'opdc');

-- If opdc already exists, remove duplicate ocsc
DELETE FROM public.organizations WHERE org_code = 'ocsc';

-- ─── 4. Ensure dhss, dop, dcy, opdc, doh are active ─────────────────────────
UPDATE public.organizations
SET is_active = true, is_test = false
WHERE org_code IN ('dhss', 'dop', 'dcy', 'opdc', 'doh');

-- ─── 5. Add missing org_form_links ───────────────────────────────────────────
-- Covers: dhss, dop, dcy  (other 13 already seeded by 20260322)
WITH wb_form AS (
  SELECT id FROM public.survey_forms WHERE form_key = 'wellbeing' LIMIT 1
),
target_orgs AS (
  SELECT id, org_code
  FROM public.organizations
  WHERE org_code IN ('dhss', 'dop', 'dcy')
)
INSERT INTO public.org_form_links (org_id, form_id, full_url, is_active)
SELECT
  o.id,
  wb.id,
  'https://nidawellbeing.vercel.app/?org=' || o.org_code,
  true
FROM target_orgs o CROSS JOIN wb_form wb
ON CONFLICT DO NOTHING;

-- ─── 6. Fix test-org URL (was placeholder 'your-domain.vercel.app') ──────────
UPDATE public.org_form_links
SET full_url = 'https://nidawellbeing.vercel.app/?org=test-org'
WHERE org_id = (SELECT id FROM public.organizations WHERE org_code = 'test-org')
  AND full_url LIKE '%your-domain%';

-- ─── Verify final state ───────────────────────────────────────────────────────
SELECT
  o.org_code,
  o.org_name_th,
  o.is_active,
  CASE WHEN l.id IS NOT NULL THEN '✅' ELSE '❌' END AS has_link,
  l.full_url
FROM public.organizations o
LEFT JOIN public.org_form_links l ON l.org_id = o.id
WHERE o.org_code IN (
  'nesdc','tpso','dss','dhss','tmd','dcp','dop',
  'mots','dmh','onep','nrct','acfs','opdc','rid','dcy','test-org','doh'
)
ORDER BY o.org_code;
