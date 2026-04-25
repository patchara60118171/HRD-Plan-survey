-- Migration: Seed test organization
INSERT INTO public.organizations (
  org_code, org_name_th, org_name_en, org_type, is_active, is_test, settings
)
VALUES (
  'test-org', 'องค์กรทดสอบระบบ', 'System Test Organization', 'government', true, true,
  jsonb_build_object('description','องค์กรสำหรับทดสอบระบบ ไม่นับรวมในรายงานทางการ','created_reason','system_test')
)
ON CONFLICT (org_code) DO UPDATE SET
  org_name_th = EXCLUDED.org_name_th, org_name_en = EXCLUDED.org_name_en,
  is_test = true, is_active = true, updated_at = now();

WITH wellbeing_form AS (SELECT id FROM public.survey_forms WHERE form_key = 'wellbeing' LIMIT 1),
     test_org AS (SELECT id FROM public.organizations WHERE org_code = 'test-org' LIMIT 1)
INSERT INTO public.org_form_links (org_id, form_id, full_url, is_active)
SELECT test_org.id, wellbeing_form.id, 'https://your-domain.vercel.app/?org=test-org', true
FROM wellbeing_form, test_org
ON CONFLICT DO NOTHING;
