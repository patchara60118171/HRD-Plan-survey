-- =============================================
-- Finalize all 16 organizations + org_hr roles
-- Date: 2026-03-24
--
-- Source of truth: ตารางส่วนราชการ 16 หน่วยงาน (ลำดับ 1-16)
--
-- Operations:
--   1. Upsert 16 organizations with canonical data
--   2. Upsert admin_user_roles for all 16 org_hr accounts
--   3. Ensure org_form_links exist for all 16 orgs
-- =============================================

-- ─── 1. Upsert 16 organizations ──────────────────────────────────────────────
INSERT INTO public.organizations
    (org_code, org_name_th, org_name_en, abbr_th, abbr_en,
     is_active, is_test, show_in_dashboard, display_order)
VALUES
  ('nesdc', 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
   'Office of the National Economic and Social Development Council',
   'สศช.', 'NESDC',  true, false, true,  1),
  ('tpso',  'สำนักงานนโยบายและยุทธศาสตร์การค้า',
   'Trade Policy and Strategy Office',
   'สนค.', 'TPSO',   true, false, true,  2),
  ('dss',   'กรมวิทยาศาสตร์บริการ',
   'Department of Science Service',
   'วศ.',   'DSS',    true, false, true,  3),
  ('dhss',  'กรมสนับสนุนบริการสุขภาพ',
   'Department of Health Service Support',
   'สบส.', 'DHSS',   true, false, true,  4),
  ('tmd',   'กรมอุตุนิยมวิทยา',
   'Thai Meteorological Department',
   'อต.',   'TMD',    true, false, true,  5),
  ('dcp',   'กรมส่งเสริมวัฒนธรรม',
   'Department of Cultural Promotion',
   'สวธ.', 'DCP',    true, false, true,  6),
  ('dop',   'กรมคุมประพฤติ',
   'Department of Probation',
   'คป.',   'DOP',    true, false, true,  7),
  ('mots',  'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
   'Office of the Permanent Secretary, Ministry of Tourism and Sports',
   'สป.กก.', 'MOTS', true, false, true,  8),
  ('dmh',   'กรมสุขภาพจิต',
   'Department of Mental Health',
   'สจ.',   'DMH',    true, false, true,  9),
  ('onep',  'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
   'Office of Natural Resources and Environmental Policy and Planning',
   'สผ.',   'ONEP',   true, false, true, 10),
  ('nrct',  'สำนักงานการวิจัยแห่งชาติ',
   'National Research Council of Thailand',
   'วช.',   'NRCT',   true, false, true, 11),
  ('acfs',  'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ',
   'National Bureau of Agricultural Commodity and Food Standards',
   'มกอช.', 'ACFS',  true, false, true, 12),
  ('opdc',  'สำนักงานคณะกรรมการพัฒนาระบบราชการ',
   'Office of the Public Sector Development Commission',
   'สำนักงาน ก.พ.ร.', 'OPDC', true, false, true, 13),
  ('rid',   'กรมชลประทาน',
   'Royal Irrigation Department',
   'ชป.',   'RID',    true, false, true, 14),
  ('dcy',   'กรมกิจการเด็กและเยาวชน',
   'Department of Children and Youth',
   'ดย.',   'DCY',    true, false, true, 15),
  ('test-org', 'ทดสอบระบบ',
   'System Test',
   'ทดสอบ', 'test',   true,  true, true, 99)
ON CONFLICT (org_code) DO UPDATE SET
    org_name_th      = EXCLUDED.org_name_th,
    org_name_en      = EXCLUDED.org_name_en,
    abbr_th          = EXCLUDED.abbr_th,
    abbr_en          = EXCLUDED.abbr_en,
    is_active        = EXCLUDED.is_active,
    is_test          = EXCLUDED.is_test,
    show_in_dashboard = EXCLUDED.show_in_dashboard,
    display_order    = EXCLUDED.display_order,
    updated_at       = now();

-- ─── 2. Upsert admin_user_roles for all 16 org_hr accounts ───────────────────
-- Note: unique index is on lower(email); use DO UPDATE to handle re-runs
INSERT INTO public.admin_user_roles
    (email, role, org_code, display_name, initial_password, is_active)
VALUES
  ('hr@nesdc.go.th',    'org_hr', 'nesdc',    'HR สศช.',          'NesdcHR2569',  true),
  ('hr@tpso.go.th',     'org_hr', 'tpso',     'HR สนค.',          'TpsoHR2569',   true),
  ('hr@dss.go.th',      'org_hr', 'dss',      'HR วศ.',           'DssHR2569',    true),
  ('hr@dhss.go.th',     'org_hr', 'dhss',     'HR สบส.',          'DhssHR2569',   true),
  ('hr@tmd.go.th',      'org_hr', 'tmd',      'HR อต.',           'TmdHR2569',    true),
  ('hr@dcp.go.th',      'org_hr', 'dcp',      'HR สวธ.',          'DcpHR2569',    true),
  ('hr@dop.go.th',      'org_hr', 'dop',      'HR คป.',           'DopHR2569',    true),
  ('hr@mots.go.th',     'org_hr', 'mots',     'HR สป.กก.',        'MotsHR2569',   true),
  ('hr@dmh.go.th',      'org_hr', 'dmh',      'HR สจ.',           'DmhHR2569',    true),
  ('hr@onep.go.th',     'org_hr', 'onep',     'HR สผ.',           'OnepHR2569',   true),
  ('hr@nrct.go.th',     'org_hr', 'nrct',     'HR วช.',           'NrctHR2569',   true),
  ('hr@acfs.go.th',     'org_hr', 'acfs',     'HR มกอช.',         'AcfsHR2569',   true),
  ('hr@opdc.go.th',     'org_hr', 'opdc',     'HR สำนักงาน ก.พ.ร.', 'OpdcHR2569', true),
  ('hr@rid.go.th',      'org_hr', 'rid',      'HR ชป.',           'RidHR2569',    true),
  ('hr@dcy.go.th',      'org_hr', 'dcy',      'HR ดย.',           'DcyHR2569',    true),
  ('hr-test@tst.go.th', 'org_hr', 'test-org', 'HR ทดสอบระบบ',    'TstHR2569',    true)
ON CONFLICT ((lower(email))) DO UPDATE SET
    role             = EXCLUDED.role,
    org_code         = EXCLUDED.org_code,
    display_name     = EXCLUDED.display_name,
    initial_password = EXCLUDED.initial_password,
    is_active        = EXCLUDED.is_active,
    updated_at       = now();

-- ─── 3. Ensure org_form_links for all 16 orgs ────────────────────────────────
-- Insert missing links; ignore if already exists (on_conflict = nothing)
INSERT INTO public.org_form_links (org_id, form_id, full_url, is_active)
SELECT
    o.id   AS org_id,
    f.id   AS form_id,
    'https://nidawellbeing.vercel.app/?org=' || o.org_code AS full_url,
    true   AS is_active
FROM public.organizations  o
JOIN public.survey_forms   f ON f.form_key = 'wellbeing'
WHERE o.org_code IN (
    'nesdc','tpso','dss','dhss','tmd','dcp','dop','mots',
    'dmh','onep','nrct','acfs','opdc','rid','dcy','test-org'
)
ON CONFLICT (org_id, form_id) DO UPDATE SET
    full_url   = EXCLUDED.full_url,
    is_active  = true;

-- ─── 4. Verify final state ────────────────────────────────────────────────────
SELECT
    o.org_code,
    o.abbr_en,
    o.abbr_th,
    o.org_name_th,
    o.is_active,
    o.is_test,
    ur.email,
    ur.role,
    ur.initial_password,
    CASE WHEN fl.id IS NOT NULL THEN '✓' ELSE '✗ MISSING' END AS form_link
FROM public.organizations o
LEFT JOIN public.admin_user_roles ur ON ur.org_code = o.org_code
LEFT JOIN public.org_form_links   fl ON fl.org_id   = o.id
WHERE o.org_code IN (
    'nesdc','tpso','dss','dhss','tmd','dcp','dop','mots',
    'dmh','onep','nrct','acfs','opdc','rid','dcy','test-org'
)
ORDER BY o.display_order, o.org_code;
