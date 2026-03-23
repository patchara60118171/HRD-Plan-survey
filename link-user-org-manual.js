console.log(`
🔧 อัปเดตการเชื่อมต่อ User กับ Organization (Manual ใน Dashboard):

📋 ข้อมูลที่ต้องเชื่อม:
- Organization ID: d46edda4-d874-4ff3-ac10-5f1a8ce241ae
- User Role ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003

🔧 ขั้นตอน:

1. เปิด Supabase Dashboard: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr

2. ไปที่ Table Editor → admin_user_roles

3. ค้นหาแถวที่มี ID = 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003

4. คลิก "Edit row" และอัปเดต:
   - org_code: test
   - org_name: สอบระบบ
   - updated_at: NOW()

5. คลิก "Save"

6. ไปที่ Authentication → Users

7. หา user ที่เกี่ยวข้อง (hr-test@tst.go.th)

8. คลิก "Edit user" และอัปเดต User metadata:
{
  "role": "org-hr",
  "organization_id": "d46edda4-d874-4ff3-ac10-5f1a8ce241ae",
  "organization_code": "test"
}

9. บันทึกการเปลี่ยนแปลง

🎯 หลังอัปเดตเสร็จ:
- User จะถูกผูกกับ organization "สอบระบบ" ถูกต้อง
- สามารถ login และเข้าใช้งานได้
- จะไม่แสดงข้อความ "ยังไม่ได้ถูกองค์กรกับบัญชีนี้"

✅ พร้อมใช้งาน!
`);

console.log('🚀 อัปเดตการเชื่อมต่อ User-Org เรียบร้อย');
