-- Insert new test organizations
INSERT INTO organizations (
  id, 
  org_code, 
  org_name_th, 
  org_name_en, 
  abbr_th, 
  abbr_en, 
  org_type, 
  contact_email, 
  is_active, 
  is_test,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    'TST1',
    'กรมทดสอบที่ 1',
    'Test Department 1',
    'ทดสอบ1',
    'test1',
    'test',
    'hr@tst1.go.th',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'TST2',
    'กรมทดสอบที่ 2',
    'Test Department 2',
    'ทดสอบ2',
    'test2',
    'test',
    'hr@tst2.go.th',
    true,
    true,
    NOW(),
    NOW()
  );

-- Show the created organizations
SELECT id, org_code, org_name_th, abbr_th, is_active 
FROM organizations 
WHERE org_code IN ('TST1', 'TST2')
ORDER BY org_code;
