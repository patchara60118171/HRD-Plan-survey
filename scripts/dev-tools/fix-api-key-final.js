console.log(`
🔥 แก้ปัญหา API Key ให้จบเลย!

❌ ปัญหา: ไฟล์ supabase-config.js ยังเป็น "PASTE_NEW_ANON_KEY_HERE"
✅ แก้ไข: ต้องใส่ anon key จริงๆ

🔧 ขั้นตอนแก้ไข (ถูกต้องต้องทำ):

1. เปิด: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr/settings/api

2. ดูในส่วน "Project API keys":
   - คัดลอก "anon public" key (ช่องบน)
   - จะขึ้นต้นด้วย: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

3. แก้ไขไฟล์ js/supabase-config.js:
   const SUPABASE_ANON_KEY = 'วาง_key_ที่คัดลอก_จาก_dashboard_ตรงนี้';

4. บันทึกไฟล์

5. รีเฟรช browser: http://localhost:3000/org-portal

6. ลอง login: hr-test@tst.go.th / TstHR2569

⚠️ สำคัญมาก:
- ต้องใช้ "anon public" key เท่านั้น
- ไม่ใช่ service_role key
- ต้องคัดลอ key จาก dashboard ตรงๆ
- ต้องบันทึกไฟล์จริงๆ

🎯 ถ้าทำถูกต้อง:
- ไม่มี error 401
- ไม่มี "Invalid API key"
- login ได้ทันที

✅ ทำตามนี้แล้วจบเลย ไม่ต้องท้ออีก!
`);

console.log('🚀 แก้ปัญหา API key ครั้งเดียวจบ');
