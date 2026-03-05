# 🔐 คู่มือการให้ Kiro เข้าถึง Supabase ในระดับ Admin

## 📋 ภาพรวม

เอกสารนี้อธิบายวิธีการให้ Kiro (AI Assistant) เข้าถึงฐานข้อมูล Supabase ของคุณเพื่อทำงานด้าน admin เช่น:
- รัน SQL queries
- จัดการ database schema
- ตั้งค่า RLS policies
- จัดการ storage buckets
- ดู logs และ metrics

---

## ⚠️ คำเตือนด้านความปลอดภัย

**CRITICAL**: Service Role Key มีสิทธิ์เต็มในการเข้าถึงฐานข้อมูล ต้องระมัดระวังมาก!

✅ **ควรทำ**:
- เก็บ keys ใน environment variables
- ไม่ commit keys ลง Git
- ใช้ `.env.local` สำหรับ local development
- Rotate keys เป็นประจำ

❌ **ไม่ควรทำ**:
- แชร์ Service Role Key ในที่สาธารณะ
- Hardcode keys ในโค้ด
- ใช้ Service Role Key ใน client-side code

---

## 🎯 วิธีที่ 1: ผ่าน Supabase CLI (แนะนำที่สุด)

### ขั้นตอนที่ 1: ติดตั้ง Supabase CLI

```bash
# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# หรือใช้ npm
npm install -g supabase

# ตรวจสอบการติดตั้ง
supabase --version
```

### ขั้นตอนที่ 2: Login เข้า Supabase

```bash
# Login ด้วย Access Token
supabase login

# จะเปิด browser ให้คุณ authorize
# หรือใช้ Access Token โดยตรง
supabase login --token YOUR_ACCESS_TOKEN
```

**วิธีหา Access Token**:
1. เข้า https://app.supabase.com/account/tokens
2. คลิก "Generate new token"
3. ตั้งชื่อ: "Kiro Admin Access"
4. คัดลอก token (จะแสดงครั้งเดียว!)

### ขั้นตอนที่ 3: Link Project

```bash
# Link กับ project ที่มีอยู่
supabase link --project-ref YOUR_PROJECT_REF

# หา Project Ref ได้จาก:
# https://app.supabase.com/project/YOUR_PROJECT_REF/settings/general
```

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
# สร้างไฟล์ .env.local
cat > .env.local << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Direct Connection (optional)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Project Info
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
SUPABASE_ACCESS_TOKEN=your_access_token_here
EOF
```

**วิธีหา Keys**:
1. เข้า https://app.supabase.com/project/YOUR_PROJECT_REF/settings/api
2. คัดลอก:
   - Project URL
   - anon/public key
   - service_role key (⚠️ ระวัง!)

### ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อ

```bash
# ทดสอบ CLI
supabase projects list

# ทดสอบ database connection
supabase db dump --local

# ดู database status
supabase status
```

---

## 🎯 วิธีที่ 2: ผ่าน Environment Variables (ง่ายกว่า)

### ขั้นตอนที่ 1: สร้างไฟล์ `.env.local`

```bash
# สร้างไฟล์
cat > .env.local << 'EOF'
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

### ขั้นตอนที่ 2: เพิ่มใน `.gitignore`

```bash
# ตรวจสอบว่ามีใน .gitignore แล้ว
cat .gitignore | grep ".env.local"

# ถ้ายังไม่มี ให้เพิ่ม
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
```

### ขั้นตอนที่ 3: สร้าง Helper Script

สร้างไฟล์ `scripts/supabase-admin.js`:

```javascript
// scripts/supabase-admin.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// สร้าง Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Export สำหรับใช้งาน
module.exports = { supabaseAdmin };

// ทดสอบการเชื่อมต่อ
async function testConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Connected to Supabase successfully!');
    console.log(`📊 Total records: ${data}`);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

// รันทดสอบถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  testConnection();
}
```

### ขั้นตอนที่ 4: ติดตั้ง Dependencies

```bash
# ติดตั้ง dotenv
npm install dotenv

# ทดสอบการเชื่อมต่อ
node scripts/supabase-admin.js
```

---

## 🎯 วิธีที่ 3: ผ่าน Direct Database Connection

### ขั้นตอนที่ 1: หา Database Connection String

1. เข้า https://app.supabase.com/project/YOUR_PROJECT_REF/settings/database
2. คัดลอก Connection String:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   ```

### ขั้นตอนที่ 2: ติดตั้ง PostgreSQL Client

```bash
# Windows (ใช้ scoop)
scoop install postgresql

# หรือดาวน์โหลดจาก
# https://www.postgresql.org/download/windows/
```

### ขั้นตอนที่ 3: เชื่อมต่อผ่าน psql

```bash
# เชื่อมต่อ
psql "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# ทดสอบ query
SELECT COUNT(*) FROM hrd_ch1_responses;
```

---

## 📝 สคริปต์ที่ Kiro สามารถรันได้

หลังจากตั้งค่าเสร็จแล้ว Kiro สามารถรันคำสั่งเหล่านี้:

### 1. ดูข้อมูล Database

```bash
# ผ่าน Supabase CLI
supabase db dump --schema public

# ผ่าน Node.js
node scripts/supabase-admin.js
```

### 2. รัน SQL Migrations

```bash
# รัน migration file
supabase db push

# หรือรัน SQL โดยตรง
supabase db execute --file supabase/migrations/your_migration.sql
```

### 3. จัดการ Storage

```bash
# List buckets
supabase storage list

# Create bucket
supabase storage create survey-attachments
```

### 4. ดู Logs

```bash
# Database logs
supabase logs db

# API logs
supabase logs api
```

---

## 🔧 การตั้งค่าเพิ่มเติม

### สร้าง npm scripts ใน package.json

```json
{
  "scripts": {
    "supabase:login": "supabase login",
    "supabase:link": "supabase link",
    "supabase:status": "supabase status",
    "supabase:db:dump": "supabase db dump",
    "supabase:db:push": "supabase db push",
    "supabase:logs": "supabase logs",
    "admin:test": "node scripts/supabase-admin.js"
  }
}
```

### สร้าง Helper Commands

สร้างไฟล์ `scripts/db-commands.js`:

```javascript
const { supabaseAdmin } = require('./supabase-admin');

// ดูจำนวน records
async function getRecordCount() {
  const { count, error } = await supabaseAdmin
    .from('hrd_ch1_responses')
    .select('*', { count: 'exact', head: true });
  
  if (error) throw error;
  return count;
}

// ดู database size
async function getDatabaseSize() {
  const { data, error } = await supabaseAdmin
    .rpc('pg_database_size', { database_name: 'postgres' });
  
  if (error) throw error;
  return data;
}

// Export functions
module.exports = {
  getRecordCount,
  getDatabaseSize
};
```

---

## ✅ Checklist การตั้งค่า

ทำตามลำดับนี้:

- [ ] ติดตั้ง Supabase CLI
- [ ] Login เข้า Supabase (`supabase login`)
- [ ] Link project (`supabase link`)
- [ ] สร้างไฟล์ `.env.local`
- [ ] เพิ่ม `.env.local` ใน `.gitignore`
- [ ] ใส่ SUPABASE_URL
- [ ] ใส่ SUPABASE_ANON_KEY
- [ ] ใส่ SUPABASE_SERVICE_ROLE_KEY
- [ ] ติดตั้ง dotenv (`npm install dotenv`)
- [ ] สร้าง `scripts/supabase-admin.js`
- [ ] ทดสอบการเชื่อมต่อ (`node scripts/supabase-admin.js`)
- [ ] ทดสอบ CLI (`supabase status`)

---

## 🚀 หลังจากตั้งค่าเสร็จ

บอก Kiro ว่า:

> "ผมตั้งค่า Supabase access เรียบร้อยแล้ว ตอนนี้คุณสามารถรันคำสั่งผ่าน Supabase CLI หรือ Node.js scripts ได้เลย"

Kiro จะสามารถ:
- รัน SQL queries
- สร้าง migrations
- ดู database metrics
- จัดการ storage
- ตั้งค่า RLS policies
- ดู logs และ analytics

---

## 🔒 Security Best Practices

### 1. Rotate Keys เป็นประจำ

```bash
# ทุก 90 วัน ควร rotate Service Role Key
# ทำได้ที่ Supabase Dashboard → Settings → API
```

### 2. ใช้ Read-Only Access เมื่อเป็นไปได้

```sql
-- สร้าง read-only role
CREATE ROLE kiro_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO kiro_readonly;
```

### 3. Monitor Access Logs

```bash
# ดู logs เป็นประจำ
supabase logs api --filter "service_role"
```

### 4. ใช้ IP Whitelist (ถ้าเป็น Production)

ตั้งค่าใน Supabase Dashboard → Settings → Database → Network Restrictions

---

## 📞 ติดต่อ Support

หากมีปัญหา:
- Supabase Discord: https://discord.supabase.com
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## 📚 Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Management API](https://supabase.com/docs/reference/api)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**สร้างเมื่อ**: March 2026  
**อัปเดตล่าสุด**: March 2026  
**เวอร์ชัน**: 1.0
