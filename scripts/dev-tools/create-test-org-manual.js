console.log(`
🏢 สร้างองค์กร "สอบระบบ" แบบ Manual (ง่ายที่สุด):

📋 ข้อมูลที่ต้องการ:
- ชื่อ: สอบระบบ
- ตัวย่อไทย: ทดสอบ  
- ตัวย่ออังกฤษ: test
- Email: hr-test@tst.go.th
- Password: TstHR2569
- Role: org-hr
- URL: https://nidawellbeing.vercel.app/?org=test-org

🔧 ขั้นตอน:

1. เปิด Supabase Dashboard: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr

2. ไปที่ Table Editor → organizations

3. คลิก "Insert row" และกรอก:
   - org_code: TEST
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

4. คลิก "Save" - จะได้ ID ของ organization มา

5. ไปที่ Authentication → Users

6. หา user: hr-test@tst.go.th (ถ้าไม่มีให้สร้างใหม่)

7. คลิก "Edit user" และอัปเดต User metadata:
{
  "role": "org-hr",
  "organization_id": "ใส่ ID_จากข้อ 4",
  "organization_code": "TEST"
}

8. บันทึกการเปลี่ยนแปลง

🎯 หลังสร้างเสร็จ:
- Login: http://localhost:3000/org-portal
- Email: hr-test@tst.go.th
- Password: TstHR2569
- URL: https://nidawellbeing.vercel.app/?org=test-org

✅ พร้อมทดสอบระบบทันที!
`);

console.log('🚀 สร้างองค์กรใหม่พร้อมใช้งาน');
