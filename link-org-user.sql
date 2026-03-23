-- เชื่อมต่อองค์กรกับ user role
-- Organization ID: d46edda4-d874-4ff3-ac10-5f1a8ce241ae
-- User Role ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003

-- ตรวจสอบว่ามี organization นี้อยู่จริง
SELECT id, org_name_th, org_code, is_active 
FROM organizations 
WHERE id = 'd46edda4-d874-4ff3-ac10-5f1a8ce241ae';

-- ตรวจสอบว่ามี admin_user_roles นี้อยู่จริง  
SELECT id, role_name, permissions, is_active
FROM admin_user_roles 
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';

-- สร้างการเชื่อมต่อ (ถ้ายังไม่มี)
-- สมมติว่ามีตาราง org_user_roles หรือ user_organizations
-- ถ้าไม่มีตารางเหล่านี้ ต้องสร้างข้อมูลในตารางที่เกี่ยวข้อง

-- อัปเดต user metadata ให้มี organization_id
-- สมมติว่า user ID ที่ต้องการอัปเดตคือ user ที่มี email hr-test@tst.go.th

-- ถ้ามีตาราง user_organizations
INSERT INTO user_organizations (
  user_id,
  organization_id, 
  role_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003',
  'd46edda4-d874-4ff3-ac10-5f1a8ce241ae',
  '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003',
  true,
  NOW(),
  NOW()
) ON CONFLICT (user_id, organization_id) DO NOTHING;

-- หรือถ้าต้องการอัปเดตตารางอื่นๆ
-- ตรวจสอบโครงสร้างตารางทั้งหมดที่เกี่ยวข้องกับ user และ organization
