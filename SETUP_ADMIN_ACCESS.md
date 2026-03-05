# 🚀 Quick Start: ตั้งค่า Kiro Admin Access

## ⚡ ขั้นตอนด่วน (5 นาที)

### 1️⃣ ติดตั้ง Dependencies

```bash
npm install
```

### 2️⃣ สร้างไฟล์ `.env.local`

```bash
# คัดลอกจาก template
copy .env.local.example .env.local

# หรือใช้ PowerShell
Copy-Item .env.local.example .env.local
```

### 3️⃣ หา Supabase Credentials

#### A. เข้า Supabase Dashboard
```
https://app.supabase.com
```

#### B. เลือก Project ของคุณ

#### C. ไปที่ Settings → API
```
https://app.supabase.com/project/YOUR_PROJECT/settings/api
```

#### D. คัดลอกข้อมูลเหล่านี้:

1. **Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

2. **anon/public key** (ส่วน "Project API keys")
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **service_role key** ⚠️ (คลิก "Reveal" ข้าง service_role)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4️⃣ แก้ไขไฟล์ `.env.local`

เปิดไฟล์ `.env.local` และแทนที่:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5️⃣ ทดสอบการเชื่อมต่อ

```bash
npm run supabase:test
```

ถ้าสำเร็จจะเห็น:
```
✅ Connected to Supabase successfully!
📊 Total records in hrd_ch1_responses: 17
```

---

## ✅ เสร็จแล้ว!

ตอนนี้ Kiro สามารถ:
- ✅ เข้าถึงฐานข้อมูล Supabase
- ✅ รัน SQL queries
- ✅ ดูสถิติและข้อมูล
- ✅ จัดการ storage
- ✅ Export ข้อมูล

---

## 🎯 คำสั่งที่ใช้บ่อย

```bash
# ดูสถานะฐานข้อมูล
npm run db:status

# ดูสถิติ
npm run supabase:stats

# Export ข้อมูล
npm run supabase:export
```

---

## 🔒 Security Checklist

- [x] ไฟล์ `.env.local` อยู่ใน `.gitignore`
- [x] ไม่ commit Service Role Key ลง Git
- [ ] เปลี่ยน Service Role Key ทุก 90 วัน
- [ ] ใช้ IP Whitelist (ถ้าเป็น production)

---

## 📚 เอกสารเพิ่มเติม

อ่านรายละเอียดเพิ่มเติมได้ที่:
- `docs/SUPABASE_ADMIN_ACCESS.md` - คู่มือฉบับเต็ม
- `scripts/supabase-admin.js` - Admin client code

---

## ❓ มีปัญหา?

### ปัญหา: "Missing Supabase credentials"
**แก้ไข**: ตรวจสอบว่าไฟล์ `.env.local` มีค่าครบทั้ง 3 ตัว

### ปัญหา: "Connection failed"
**แก้ไข**: 
1. ตรวจสอบ SUPABASE_URL ถูกต้อง
2. ตรวจสอบ SERVICE_ROLE_KEY ไม่หมดอายุ
3. ตรวจสอบ internet connection

### ปัญหา: "Permission denied"
**แก้ไข**: ใช้ SERVICE_ROLE_KEY ไม่ใช่ ANON_KEY

---

## 💬 บอก Kiro

หลังจากตั้งค่าเสร็จ บอก Kiro ว่า:

> "ผมตั้งค่า Supabase admin access เรียบร้อยแล้ว คุณสามารถรันคำสั่งผ่าน `npm run supabase:test` หรือใช้ `scripts/supabase-admin.js` ได้เลย"

Kiro จะเริ่มใช้งานได้ทันที! 🎉
