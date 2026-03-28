-- อัปเดต admin_user_roles ให้ผูกกับ organization ที่ถูกต้อง
-- Organization ID: d46edda4-d874-4ff3-ac10-5f1a8ce241ae
-- User Role ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003

-- ตรวจสอบว่ามี user นี้อยู่จริง
SELECT id, email, role, org_name, org_code 
FROM admin_user_roles 
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';

-- ตรวจสอบว่ามี organization นี้อยู่จริง
SELECT id, org_name_th, org_code, is_active 
FROM organizations 
WHERE id = 'd46edda4-d874-4ff3-ac10-5f1a8ce241ae';

-- อัปเดต admin_user_roles ให้มีข้อมูล organization ที่ถูกต้อง
UPDATE admin_user_roles 
SET 
    org_code = 'test',
    org_name = 'สอบระบบ',
    updated_at = NOW()
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';

-- ตรวจสอบผลลัพธ์
SELECT id, email, role, org_name, org_code, is_active
FROM admin_user_roles 
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';
