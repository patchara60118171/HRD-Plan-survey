# รายงานอัปเกรดระบบหลังบ้าน Admin (2026-03-14)

## 1) เป้าหมายการอัปเกรด
อัปเกรดระบบหลังบ้านให้ปลอดภัยและดูแลง่ายขึ้น โดยเน้น 3 เรื่องหลัก
- ย้ายการจัดการสิทธิ์ผู้ใช้จาก localStorage ไปฐานข้อมูล
- ลดความเสี่ยงการเรียกใช้ google-sync โดยไม่ได้รับอนุญาต
- เตรียมชุด SQL hardening สำหรับบังคับสิทธิ์ระดับฐานข้อมูล (RLS + RBAC)

## 2) สิ่งที่แก้ไขแล้วในโค้ด

### 2.1 ย้ายการจัดการ Role/Viewer ไปที่ฐานข้อมูล
ไฟล์ที่แก้
- `admin.html`

สิ่งที่เปลี่ยน
- เพิ่มการใช้งานตาราง `admin_user_roles` เป็นแหล่งสิทธิ์หลัก (`ROLE_TABLE`)
- เพิ่ม `loadRoleMappings()` เพื่ออ่านสิทธิ์จากฐานข้อมูล
- ปรับ `getUserRole()` ให้หา role จากฐานข้อมูลก่อน แล้ว fallback ไป metadata
- ปรับ `addViewer()` และ `removeViewer()` ให้เขียน/ลบจากตาราง `admin_user_roles`
- ปรับ `renderViewersTable()` ให้ดึงรายการ viewer จากฐานข้อมูลแทน localStorage
- คง bootstrap accounts ไว้ 2 บัญชีเพื่อกัน lock-out ก่อนรัน migration

ผลลัพธ์
- ข้อมูลสิทธิ์ผู้ใช้เป็นศูนย์กลางที่ฐานข้อมูล
- ลดปัญหาสิทธิ์ไม่ตรงกันข้ามเครื่อง/ข้ามเบราว์เซอร์

### 2.2 เพิ่มความปลอดภัย Edge Function `google-sync`
ไฟล์ที่แก้
- `supabase/functions/google-sync/index.ts`

สิ่งที่เปลี่ยน
- รองรับการตรวจ Bearer token ของผู้เรียกฟังก์ชันผ่าน `GOOGLE_SYNC_FUNCTION_TOKEN`
- หากตั้งค่า token แล้ว ผู้เรียกต้องส่ง `Authorization: Bearer <token>`
- เพิ่มข้อมูล `issuedAt` และ `nonce` ลง payload ก่อนส่งต่อไป Google Apps Script

ผลลัพธ์
- ลดความเสี่ยงการยิงฟังก์ชันจากผู้ไม่เกี่ยวข้อง
- รองรับการทำ anti-replay ปลายทางได้

### 2.3 เพิ่ม anti-replay ที่ Google Apps Script
ไฟล์ที่แก้
- `apps-script/google-sync.gs`

สิ่งที่เปลี่ยน
- ตรวจ `issuedAt` ต้องอยู่ในช่วงเวลาที่กำหนด (5 นาที)
- ตรวจ `nonce` ซ้ำด้วย `CacheService` (10 นาที)
- ปฏิเสธคำขอที่ timestamp เก่า/ไม่มี nonce/nonce ซ้ำ

ผลลัพธ์
- ลดความเสี่ยง replay attack ใน webhook

### 2.4 เพิ่ม migration สำหรับ Security Hardening
ไฟล์ใหม่
- `supabase/migrations/20260314_admin_security_hardening.sql`

สิ่งที่มีใน migration
- สร้างตาราง `admin_user_roles` พร้อม index + trigger อัปเดตเวลา
- สร้าง helper functions: `requester_email()`, `requester_role()`, `requester_org()`, `requester_is_admin()`
- ปรับ RLS/policies ให้ role-aware บนตารางหลัก
- ปรับ storage policies ของ `hrd-documents`
- เตรียมตาราง `admin_audit_logs`

หมายเหตุสำคัญ
- migration นี้มีผลกระทบด้านสิทธิ์และการอ่านไฟล์ ควรทดสอบใน staging ก่อนขึ้น production

### 2.5 อัปเดตไฟล์ตัวอย่าง Environment
ไฟล์ที่แก้
- `.env.example`
- `.env.local.example`

สิ่งที่เพิ่ม
- `GOOGLE_SYNC_FUNCTION_TOKEN`
- ตัวแปร google-sync ที่จำเป็นให้ครบ

## 3) วิธี Rollout (แนะนำ)

### ขั้นตอน A: Backup ก่อน
1. สำรอง schema + policies ปัจจุบันใน Supabase
2. สำรองข้อมูลตารางสำคัญ (`hrd_ch1_responses`, `survey_responses`, `organizations`)

### ขั้นตอน B: ตั้งค่า env ให้ครบ
กำหนดค่าใน Secrets/Environment
- `GOOGLE_SYNC_WEBHOOK_URL`
- `GOOGLE_SYNC_SHARED_SECRET`
- `GOOGLE_SYNC_FUNCTION_TOKEN`

### ขั้นตอน C: Deploy ฟังก์ชัน
1. deploy `supabase/functions/google-sync/index.ts`
2. ทดสอบเรียกโดยส่ง Bearer token ที่ถูกต้อง
3. ทดสอบ token ผิด ต้องได้ 401

### ขั้นตอน D: อัปเดต Apps Script
1. นำโค้ดจาก `apps-script/google-sync.gs` ขึ้น Apps Script
2. ตั้งค่า Script Property: `SYNC_SECRET`
3. ทดสอบ sync ปกติ + ทดสอบ replay (nonce เดิม)

### ขั้นตอน E: รัน migration hardening
1. รัน `supabase/migrations/20260314_admin_security_hardening.sql` บน staging
2. สร้าง role records ใน `admin_user_roles` สำหรับผู้ดูแลระบบจริง
3. ทดสอบหน้า admin ทุก role
4. ผ่านแล้วค่อยขึ้น production

## 4) เช็กลิสต์ทดสอบหลังอัปเกรด

### Functional
- [ ] ล็อกอิน super admin ได้
- [ ] เพิ่ม viewer ได้ และเห็นในตารางผู้ใช้
- [ ] ลบ viewer ได้
- [ ] viewer ที่เพิ่มใหม่เข้าได้เฉพาะส่วนที่กำหนด
- [ ] google-sync สำเร็จ (status = synced)

### Security
- [ ] เรียก edge function โดยไม่ใส่ token ถูกปฏิเสธ
- [ ] ใส่ token ผิดถูกปฏิเสธ
- [ ] replay payload เดิมถูกปฏิเสธ
- [ ] user ที่ไม่มี role เข้า admin ไม่ได้

## 5) ความเสี่ยงที่ยังเหลือ (ต้องทำต่อ)
- ควรเชื่อม audit log ให้บันทึกทุก action สำคัญจากหน้า admin
- ควรย้าย logic admin จากไฟล์เดียว (`admin.html`) เป็น modules/API ชัดเจน
- ควรเพิ่ม integration tests สำหรับ role matrix (super_admin/admin/viewer)

## 6) ผลกระทบต่อผู้ใช้งาน
- ผู้ใช้ทั่วไปแทบไม่รู้สึกต่าง
- ผู้ดูแลระบบจะได้ความเสถียรเรื่องสิทธิ์ผู้ใช้มากขึ้น
- ทีมดูแลระบบต้องเพิ่มขั้นตอนตั้งค่า role ในตาราง `admin_user_roles`

## 7) สรุปสถานะ
สถานะ: **พร้อมใช้งานในโหมด hardening rollout**
- โค้ดพร้อม
- มี migration พร้อม
- เหลือการรัน migration + ทดสอบ role matrix ในสภาพแวดล้อมจริง
