console.log(`
🔧 วิธีผูก user กับ organization (Manual ใน Dashboard):

📋 ปัญหา: "ยังไม่ได้ถูกองค์กรกับบัญชีนี้"
หมายความว่า user hr-test@tst.go.th ไม่มี organization_id ที่ถูกต้องใน metadata

🔧 ขั้นตอนแก้ไข:

1. เปิด Supabase Dashboard: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr

2. ไปที่ Authentication → Users

3. ค้นหา user: hr-test@tst.go.th

4. คลิกที่ user เพื่อดูรายละเอียด

5. คลิก "Edit user" หรือไปที่ "User metadata"

6. อัปเดต metadata ให้เป็น:
{
  "role": "org-hr",
  "organization_id": "d46edda4-d874-4ff3-ac10-5f1a8ce241ae",
  "organization_code": "test-org"
}

⚠️ สำคัญ: organization_id ต้องตรงกับ ID ของ organization ในตาราง organizations

7. ถ้าไม่มี organization_id ให้:
   - ไปที่ Table Editor → organizations
   - ค้นหา organization ที่มี org_code = "test-org" หรือ "TST"
   - คัดลอก ID จากคอลัมน์ id
   - นำ ID นั้นไปใส่ใน user metadata

8. บันทึกการเปลี่ยนแปลง

9. กลับไปทดสอบ login ใหม่ที่: http://localhost:3000/org-portal

🎯 หลังแก้ไขเสร็จ:
- User จะถูกผูกกับ organization ถูกต้อง
- สามารถ login และเข้าใช้งานได้
- จะไม่แสดงข้อความ "ยังไม่ได้ถูกองค์กรกับบัญชีนี้"

✅ พร้อมใช้งาน!
`);

console.log('📋 สรุปขั้นตอนการแก้ไข');
