-- สร้างองค์กร "สอบระบบ"
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
    'TEST',
    'สอบระบบ',
    'Test Organization',
    'ทดสอบ',
    'test',
    'test',
    'hr-test@tst.go.th',
    true,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (org_code) DO NOTHING;

-- แสดงองค์กรที่สร้าง
SELECT id, org_code, org_name_th, abbr_th, is_active 
FROM organizations 
WHERE org_code = 'TEST'
ORDER BY org_code;
