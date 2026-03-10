# 🗃️ NocoDB Smart Spreadsheet — คู่มือการติดตั้ง

NocoDB เป็น Open Source No-Code Platform ที่นำ Database มาแสดงผลเป็นหน้าตาแบบ Spreadsheet คล้าย Google Sheets ช่วยให้ผู้ดูแลระบบจัดการข้อมูล Well-being Survey ได้ง่ายขึ้น โดยไม่ต้องเขียน SQL

---

## ✨ คุณสมบัติที่ได้รับ

- **Spreadsheet View** — เพิ่ม / แก้ไข / ลบข้อมูลเหมือน Google Sheets
- **หลาย View** — Gallery, Kanban, Calendar นอกจาก Grid
- **Filter & Sort** — กรองและเรียงข้อมูลได้อิสระ
- **Export** — ส่งออกเป็น CSV / Excel ได้ในคลิกเดียว
- **Automation** — เชื่อม Webhook, Slack, n8n, Zapier
- **REST & GraphQL API** — ใช้กับ Frontend ได้เลย
- **ไม่แก้โครงสร้าง DB เดิม** — NocoDB เป็นแค่ UI Layer

---

## 🚀 วิธีติดตั้ง (Docker Compose)

### ขั้นตอนที่ 1 — สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

เพิ่มค่าต่อไปนี้ใน `.env`:

```dotenv
# Supabase PostgreSQL Connection URL
# ดูได้จาก Supabase Dashboard → Settings → Database → Connection string (URI mode)
DATABASE_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# NocoDB Admin Credentials (ใช้ login ครั้งแรก)
NC_ADMIN_EMAIL=admin@your-domain.com
NC_ADMIN_PASSWORD=YourSecurePassword@123

# NocoDB JWT Secret (ควรเป็น string แบบสุ่ม ยาว 32+ ตัวอักษร)
NC_AUTH_JWT_SECRET=your-random-secret-key-here-minimum-32-chars
```

### ขั้นตอนที่ 2 — รัน NocoDB

```bash
docker compose up -d
```

รอ 30 วินาที แล้วเปิด: **http://localhost:8080**

### ขั้นตอนที่ 3 — เชื่อม Supabase PostgreSQL

1. เข้าสู่ระบบด้วย Admin Email และ Password ที่ตั้งไว้
2. คลิก **"New Project"** → เลือก **"Connect to External DB"**
3. วาง `DATABASE_URL` จาก Supabase
4. NocoDB จะดึง schema มาแสดงเป็น Tables อัตโนมัติ

---

## 🔗 เชื่อม NocoDB กับ Admin Portal

เมื่อ NocoDB รันอยู่แล้ว ไปที่ **Admin Portal → Smart Spreadsheet** แล้วกรอก NocoDB URL เพื่อฝัง Spreadsheet View โดยตรงในหน้า Admin

---

## 📊 Tables ที่จะเห็นใน NocoDB

| Table | คำอธิบาย |
|-------|----------|
| `organizations` | ข้อมูลองค์กรที่เข้าร่วม |
| `survey_forms` | ทะเบียนแบบสอบถาม |
| `survey_responses` | ผลตอบรับ Wellbeing Survey |
| `hrd_ch1_responses` | ผลตอบรับ HRD บทที่ 1 |
| `org_form_links` | URL Shortlink ต่อองค์กร |

---

## ⚙️ Production Deployment

สำหรับ Production แนะนำให้เปลี่ยน metadata database จาก SQLite เป็น PostgreSQL:

```yaml
# docker-compose.yml
environment:
  NC_DB: "pg://host:port?u=user&p=password&d=noco_meta"
```

---

## 🔒 Security Notes

- เปลี่ยน `NC_AUTH_JWT_SECRET` ให้เป็น random string ที่ซับซ้อน
- ตั้ง `NC_ADMIN_PASSWORD` ให้แข็งแรง (อักษรใหญ่ + ตัวเลข + อักขระพิเศษ)
- ใช้ HTTPS ใน production (ผ่าน reverse proxy เช่น nginx หรือ Traefik)
- ตั้ง Supabase RLS policies ให้ถูกต้อง (ดู `supabase/rls-policies.sql`)

---

## 📚 เอกสารเพิ่มเติม

- [NocoDB Documentation](https://nocodb.com/docs/product-docs)
- [NocoDB GitHub](https://github.com/nocodb/nocodb)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
