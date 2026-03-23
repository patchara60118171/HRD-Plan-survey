// สร้างองค์กรเพิ่มเติมผ่าน Dashboard แทน
// เนื่องจาก API keys มีปัญหา ให้ใช้วิธี manual ใน Supabase Dashboard

console.log(`
🏢 วิธีสร้างองค์กรใหม่ (Manual ใน Dashboard):

📋 ข้อมูลองค์กรที่ต้องการสร้าง:

=== องค์กรที่ 1 ===
ชื่อ: กรมทดสอบที่ 1
รหัส: TST1
ตัวย่อไทย: ทดสอบ1
ตัวย่ออังกฤษ: test1
Email: hr@tst1.go.th
Password: Tst1HR2569

=== องค์กรที่ 2 ===
ชื่อ: กรมทดสอบที่ 2  
รหัส: TST2
ตัวย่อไทย: ทดสอบ2
ตัวย่ออังกฤษ: test2
Email: hr@tst2.go.th
Password: Tst2HR2569

🔧 ขั้นตอน:

1. เปิด Supabase Dashboard: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr

2. ไปที่เมนู Table Editor → organizations

3. คลิก "Insert row" และกรอกข้อมูล:
   - org_code: TST1 (และ TST2 สำหรับองค์กรที่ 2)
   - org_name_th: กรมทดสอบที่ 1
   - org_name_en: Test Department 1
   - abbr_th: ทดสอบ1
   - abbr_en: test1
   - org_type: test
   - contact_email: hr@tst1.go.th
   - is_active: true
   - is_test: true
   - created_at: NOW()
   - updated_at: NOW()

4. ไปที่ Authentication → Users

5. คลิก "Add user" สร้าง user:
   - Email: hr@tst1.go.th
   - Password: Tst1HR2569
   - User metadata:
     {"role": "org-hr", "organization_id": "[ID_จาก_organizations]", "organization_code": "TST1"}

6. ทำซ้ำสำหรับองค์กรที่ 2 (TST2)

🎯 หลังสร้างเสร็จ:
- Login ได้ที่: http://localhost:3000/org-portal
- ใช้ email/password ของแต่ละองค์กร
- URL: https://nidawellbeing.vercel.app/?org=test-org-1 (และ test-org-2)
`);

console.log('✅ พร้อมใช้งาน!');
