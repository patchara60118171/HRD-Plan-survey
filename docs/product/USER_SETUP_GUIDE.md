# USER_SETUP_GUIDE.md
> คู่มือสำหรับ Admin — สร้างและจัดการผู้ใช้ระบบ

---

## Roles ที่รองรับ

| Role | หน้าที่ | org_code required |
|---|---|---|
| `super_admin` | ควบคุมระบบทั้งหมด | ไม่ต้อง |
| `admin` | จัดการ user, เปิด-ปิด window, ดูข้อมูลทุก org | ไม่ต้อง |
| `org_hr` | กรอก CH1, ดูข้อมูลองค์กรตัวเอง | **ต้องระบุ** |

---

## Test Organization

| Field | Value |
|---|---|
| **org_code** | `test-org` |
| **org_name_th** | องค์กรทดสอบระบบ |
| **is_test** | `true` |
| **Test HR email** | `hr@test-org.local` |
| **Temp password** | `TestOrg2569` |

> ⚠️ เปลี่ยน password หลัง login ครั้งแรก

---

## วิธีสร้าง User ใหม่ (Admin ทำเอง)

### Step 1 — สร้าง Auth User ผ่าน Supabase Dashboard

1. ไปที่ [Supabase Dashboard → Authentication → Users](https://app.supabase.com/project/fgdommhiqhzvsedfzyrr/auth/users)
2. คลิก **"Add user"**
3. กรอก:
   - **Email**: เช่น `hr-acfs@nida.ac.th`
   - **Password**: ใช้ temp password แบบ `Word + Number`, เช่น `Acfs2569HR`
   - เปิด **"Auto Confirm User"**
4. คลิก **"Create User"**

### Step 2 — เพิ่ม Role Mapping ใน `admin_user_roles`

```sql
INSERT INTO public.admin_user_roles (
  email,
  role,
  org_code,
  org_name,
  display_name,
  created_by,
  is_active
)
VALUES (
  'hr-acfs@nida.ac.th',  -- email เดียวกับ Auth
  'org_hr',               -- หรือ 'admin'
  'ACFS',                 -- org_code จาก organizations table (สำหรับ org_hr เท่านั้น)
  'สำนักงานเศรษฐกิจการเกษตร',
  'ชื่อผู้ใช้',
  'admin@nida.ac.th',    -- email ของ admin ที่สร้าง
  true
);
```

> สำหรับ `admin` หรือ `super_admin` ไม่ต้องใส่ `org_code` (NULL)

---

## Temp Password Policy

| Pattern | ตัวอย่าง |
|---|---|
| `OrgCode + Year + Role` | `Acfs2569HR` |
| `ThaiWord + Number` | `Nida2026Admin` |
| `HappyWord + OrgCode` | `HappyWork15` |

**กฎ:**
- แสดง temp password ครั้งเดียวตอนสร้าง
- User ต้อง change password หลัง login ครั้งแรก
- ห้ามเก็บ plaintext password ไว้ในฐานข้อมูล

---

## Reset Password

### ผ่าน Supabase Dashboard
1. ไปที่ Authentication → Users
2. ค้นหา user
3. คลิก **"Send password recovery"** หรือ **"Change password"**

### ผ่าน Script (Admin)
```javascript
// scripts/ops/reset-user-password.js
import { createClient } from '@supabase/supabase-js';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

await admin.auth.admin.updateUserById(userId, {
  password: 'NewTempPass2569'
});
console.log('Password reset. แจ้ง user ด้วย temp password: NewTempPass2569');
```

---

## Deactivate User

```sql
-- ปิดการใช้งาน (ไม่ลบ)
UPDATE public.admin_user_roles
SET is_active = false, updated_at = now()
WHERE email = 'hr-acfs@nida.ac.th';

-- ต้อง disable ใน Supabase Auth ด้วย (ผ่าน Dashboard หรือ admin API)
```

---

## Business Rules

- **1 active org_hr ต่อ 1 org** — ก่อนสร้างใหม่ ให้ deactivate อันเก่าก่อน
- **org_hr ต้องมี org_code** — INSERT จะ fail ถ้าไม่ใส่
- **org_code ต้องมีอยู่ใน organizations** — FK constraint
- **ห้ามลบ super_admin คนสุดท้าย** — ต้องมีอย่างน้อย 1 super_admin เสมอ

---

## ตรวจสอบ User ทั้งหมด

```sql
SELECT
  r.email,
  r.role,
  r.org_code,
  o.org_name_th,
  r.display_name,
  r.is_active,
  r.created_at
FROM admin_user_roles r
LEFT JOIN organizations o ON o.org_code = r.org_code
ORDER BY r.role, r.org_code;
```

---

## Org Codes อ้างอิง (organizations table)

```sql
SELECT org_code, org_name_th, is_test, is_active
FROM organizations
ORDER BY is_test, org_code;
```

> Test org: `test-org` (is_test = true) — ใช้ทดสอบเท่านั้น
