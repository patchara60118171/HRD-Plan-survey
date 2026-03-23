-- Migration: Connect User to Organization
-- Organization ID: d46edda4-d874-4ff3-ac10-5f1a8ce241ae
-- User Role ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003

-- Update admin_user_roles to connect with organization
UPDATE admin_user_roles 
SET 
    org_code = 'test',
    org_name = 'สอบระบบ',
    updated_at = NOW()
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';

-- Verify the connection
SELECT 
    ar.id as user_role_id,
    ar.email,
    ar.role,
    ar.org_name,
    ar.org_code,
    o.id as org_id,
    o.org_name_th,
    o.org_code as db_org_code
FROM admin_user_roles ar
LEFT JOIN organizations o ON ar.org_code = o.org_code
WHERE ar.id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';
