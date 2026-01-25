# 📘 คู่มือการตั้งค่า Supabase สำหรับ Well-being Survey

## 🌟 ทำไมต้อง Supabase?
- ✅ ฟรี (Free tier เก็บได้ 500MB)
- ✅ Real-time sync ระหว่างอุปกรณ์
- ✅ Export CSV ได้โดยตรง
- ✅ ใช้ PostgreSQL (มาตรฐานสากล)
- ✅ มี Dashboard จัดการข้อมูลง่าย

---

## 📋 ขั้นตอนที่ 1: สมัครและสร้าง Project

### 1.1 สมัคร Supabase
1. ไปที่ **https://supabase.com**
2. คลิก **"Start your project"** หรือ **"Sign Up"**
3. เลือก **"Continue with GitHub"** หรือ **"Sign up with Email"**
4. ยืนยันอีเมล (ถ้าใช้ Email)

### 1.2 สร้าง Project ใหม่
1. คลิก **"New Project"**
2. กรอกข้อมูล:
   - **Name**: `wellbeing-survey`
   - **Database Password**: (จดไว้ให้ดี!)
   - **Region**: `Southeast Asia (Singapore)` ← เร็วที่สุดสำหรับไทย
3. คลิก **"Create new project"**
4. รอ 1-2 นาที ให้ setup เสร็จ

---

## 📋 ขั้นตอนที่ 2: สร้าง Table สำหรับเก็บข้อมูล

### 2.1 เปิด SQL Editor
1. ในหน้า Dashboard คลิก **"SQL Editor"** ที่เมนูซ้าย
2. คลิก **"New query"**

### 2.2 รันคำสั่ง SQL นี้:
คัดลอกโค้ดด้านล่างแล้ววางใน SQL Editor:

```sql
-- สร้างตาราง survey_responses
CREATE TABLE survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- ข้อมูลส่วนตัว
    title TEXT,
    name TEXT,
    gender TEXT,
    age INTEGER,
    status TEXT,
    region TEXT,
    education TEXT,
    religion TEXT,
    job TEXT,
    job_duration INTEGER,
    income TEXT,
    activity_org TEXT,
    activity_thaihealth TEXT,
    diseases TEXT[],
    
    -- ข้อมูลร่างกาย
    height DECIMAL,
    weight DECIMAL,
    waist DECIMAL,
    bmi DECIMAL,
    bmi_category TEXT,
    
    -- คะแนน TMHI
    tmhi_score INTEGER,
    tmhi_level TEXT,
    
    -- ข้อมูลดิบทั้งหมด (เก็บเป็น JSON)
    raw_responses JSONB,
    
    -- สถานะ
    is_draft BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ
);

-- สร้าง Index สำหรับค้นหาเร็ว
CREATE INDEX idx_email ON survey_responses(email);
CREATE INDEX idx_timestamp ON survey_responses(timestamp);
CREATE INDEX idx_is_draft ON survey_responses(is_draft);

-- เปิดให้ผู้ใช้อ่านและเขียนข้อมูลของตัวเอง
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy: ใครก็อ่านได้ (สำหรับ Admin)
CREATE POLICY "Allow public read" ON survey_responses
    FOR SELECT USING (true);

-- Policy: ใครก็เขียนได้ (ใช้ anon key)
CREATE POLICY "Allow public insert" ON survey_responses
    FOR INSERT WITH CHECK (true);

-- Policy: อัพเดทได้ถ้า email ตรงกัน
CREATE POLICY "Allow update own data" ON survey_responses
    FOR UPDATE USING (true);
```

3. คลิก **"Run"** (ปุ่มสีเขียว)
4. ควรเห็น **"Success. No rows returned"**

---

## 📋 ขั้นตอนที่ 3: ดู API Keys

### 3.1 เปิดหน้า Settings
1. คลิก **"Settings"** ที่เมนูซ้าย (ไอคอนเฟือง)
2. คลิก **"API"**

### 3.2 จดค่าเหล่านี้ไว้:
- **Project URL**: `https://xxxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIs...` (ยาวมาก)

> ⚠️ **หมายเหตุ**: anon key สามารถใช้ใน client-side ได้

---

## 📋 ขั้นตอนที่ 4: เพิ่มโค้ดในเว็บ

### 4.1 เพิ่ม Supabase Client ใน index.html
เพิ่มก่อน `</head>`:

```html
<!-- Supabase Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 4.2 แก้ไข app.js
เพิ่มที่ด้านบนสุดของไฟล์:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // ← แทนที่ด้วย Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'; // ← แทนที่ด้วย anon key

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## 📋 ขั้นตอนที่ 5: Export ข้อมูลเป็น CSV

### 5.1 จาก Supabase Dashboard
1. คลิก **"Table Editor"** ที่เมนูซ้าย
2. เลือกตาราง `survey_responses`
3. คลิก **"Export"** → **"Export as CSV"**

### 5.2 เปิดใน Google Sheets
1. ไปที่ **Google Sheets** (sheets.google.com)
2. คลิก **"File"** → **"Import"**
3. อัปโหลดไฟล์ CSV
4. วิเคราะห์ข้อมูลได้เลย!

---

## 🎯 สรุปค่าที่ต้องใช้

| ค่า | ตัวอย่าง |
|-----|----------|
| Project URL | `https://abcdefghijk.supabase.co` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## ❓ หากมีปัญหา

1. **ตรวจสอบ RLS Policy**: ใน Table Editor → คลิกตาราง → Authentication policies
2. **ตรวจสอบ API Key**: ตรวจว่าใช้ anon key ไม่ใช่ service_role key
3. **ตรวจสอบ CORS**: Supabase อนุญาตทุก origin โดยอัตโนมัติ

---

> 📌 **ขั้นตอนถัดไป**: แจ้ง Project URL และ Anon Key มา แล้วผมจะแก้โค้ดให้เชื่อมต่อกับ Supabase ครับ!
