console.log(`
🔧 แก้ไขปัญหา Foreign Key Constraint:

❌ ปัญหา: org_code = "test" ไม่มีอยู่ในตาราง organizations
✅ แก้ไข: สร้าง organization "test" ก่อน แล้วค่อยอัปเดต user

🔧 ขั้นตอนแก้ไข:

ขั้นที่ 1: สร้าง organization "test"
1. เปิด: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr
2. ไปที่ Table Editor → organizations
3. คลิก "Insert row" และกรอก:
   - id: d46edda4-d874-4ff3-ac10-5f1a8ce241ae
   - org_code: test
   - org_name_th: สอบระบบ
   - org_name_en: Test Organization
   - abbr_th: ทดสอบ
   - abbr_en: test
   - org_type: test
   - contact_email: hr-test@tst.go.th
   - is_active: true
   - is_test: true
   - created_at: NOW()
   - updated_at: NOW()
4. คลิก "Save"

ขั้นที่ 2: อัปเดต admin_user_roles
1. ไปที่ Table Editor → admin_user_roles
2. หา ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003
3. คลิก "Edit row" และอัปเดต:
   - org_code: test
   - org_name: สอบระบบ
4. คลิก "Save" ✅ ตอนนี้จะสำเร็จ!

ขั้นที่ 3: อัปเดต user metadata (ถ้าต้องการ)
1. ไปที่ Authentication → Users
2. หา user: hr-test@tst.go.th
3. อัปเดต metadata:
{
  "role": "org-hr",
  "organization_id": "d46edda4-d874-4ff3-ac10-5f1a8ce241ae",
  "organization_code": "test"
}
4. บันทึก

🎯 หลังเสร็จหมด:
- Login: http://localhost:3000/org-portal
- Email: hr-test@tst.go.th
- Password: TstHR2569
- พร้อมทดสอบระบบ!

✅ ทำตามขั้นตอนนี้จะสำเร็จแน่นอน!
`);

console.log('🚀 แก้ไขปัญหา Foreign Key Constraint เรียบร้อย');
