# รายงานการทำงานของระบบ Well-being Survey

> สรุปการทำงานของโปรเจคหลังการ cleanup (ลบไฟล์ไม่จำเป็น 35 ไฟล์)

---

## 1. ภาพรวมระบบ

Well-being Survey System เป็นระบบสำรวจสุขภาวะบุคลากรสำหรับหน่วยงานภาครัฐ ประกอบด้วยแบบสำรวจ 2 ส่วนหลัก:

1. **Individual Well-being Survey** - แบบสำรวจสุขภาวะรายบุคคล
2. **CH1 Survey** - แบบฟอร์ม HRD (Human Resource Development) บทที่ 1

---

## 2. โครงสร้างระบบ

### 2.1 Frontend (HTML + JavaScript)

| ไฟล์หลัก | หน้าที่ |
|----------|---------|
| `index.html` | แบบสำรวจสุขภาวะรายบุคคล (Well-being Survey) |
| `ch1.html` | แบบสำรวจ CH1 สำหรับ HR |
| `ch1-edit.html` | หน้าแก้ไขข้อมูล CH1 |
| `admin.html` | Admin Portal สำหรับจัดการระบบ |
| `admin-login.html` | หน้าเข้าสู่ระบบ Admin |
| `admin-wb-rawdata.html` | ดูข้อมูลดิบ Well-being |
| `ch1-all-responses.html` | ดูคำตอบ CH1 ทั้งหมด |
| `wellbeing-all-responses.html` | ดูคำตอบ Well-being ทั้งหมด |

### 2.2 JavaScript Modules (`js/`)

```
js/
├── modules/
│   ├── core.js          # Core logic + UI components
│   ├── admin.js         # Admin functionality
│   ├── error-handler.js # Error handling
│   ├── form-renderer.js # Dynamic form rendering
│   ├── pdf-generator.js # PDF generation
│   ├── question-bank.js # Question definitions
│   └── i18n.js          # Internationalization
├── locales/
│   ├── th.json          # Thai translations
│   └── en.json          # English translations
├── admin-dashboard.js   # Admin dashboard functions
├── admin-ch1-enhancements.js
├── analytics.js         # Data analytics
├── api-integration.js   # API integrations
├── form-renderer.js     # Form rendering engine
└── (อื่น ๆ)
```

### 2.3 Data Files (`data/`)

| ไฟล์ | หน้าที่ |
|------|---------|
| `questions-wellbeing.json` | โครงสร้างคำถาม Well-being Survey |
| `questions-ch1.json` | โครงสร้างคำถาม CH1 |
| `organizations.json` | รายชื่อหน่วยงาน |
| `form-config.json` | การตั้งค่าฟอร์ม |

---

## 3. กระบวนการทำงานหลัก

### 3.1 แบบสำรวจสุขภาวะ (Well-being Survey)

```
┌─────────────────┐
│   index.html    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  1. โหลดคำถามจาก questions-wellbeing.json  │
│     ผ่าน FormRenderer                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  2. แสดงฟอร์มแบบ Multi-step          │
│     - Personal info                 │
│     - Consumption                   │
│     - Nutrition                     │
│     - Activity                      │
│     - Mental health                 │
│     - Loneliness (UCLA Scale)       │
│     - Safety                        │
│     - Environment                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  3. Validation & Auto-save           │
│     - ตรวจสอบความถูกต้อง            │
│     - บันทึกแบบร่างอัตโนมัติ        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  4. ส่งข้อมูลไป Supabase             │
│     ตาราง: survey_responses         │
└─────────────────────────────────────┘
```

**คำถามสำคัญ:**
- **UCLA Loneliness Scale** - วัดความโดดเดี่ยว 20 ข้อ
- **Mental health indicators** - ตัวชี้วัดสุขภาพจิต
- **Physical measurements** - ข้อมูลร่างกาย (น้ำหนัก ส่วนสูง ความดัน)

### 3.2 แบบสำรวจ CH1 (HRD Plan)

```
┌─────────────────┐
│    ch1.html     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  1. โหลดโครงสร้าง 5 ส่วน             │
│     จาก questions-ch1.json          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  2. 5 Sections หลัก                  │
│     A: ข้อมูลทั่วไปขององค์กร         │
│     B: ข้อมูลบุคลากร (กำลังคน)        │
│     C: ข้อมูลเชิงโครงสร้าง            │
│     D: ประเด็นสำคัญ                  │
│     E: แผนพัฒนาบุคลากร               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  3. Validation พิเศษ                 │
│     - ผลรวมอายุ = จำนวนบุคลากร       │
│     - ผลรวมตำแหน่ง = จำนวนบุคลากร    │
│     - จำกัดไฟล์ PDF (max 10MB)      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  4. บันทึกที่ hrd_ch1_responses      │
│     สถานะ: draft → submitted         │
│            → reopened → locked       │
└─────────────────────────────────────┘
```

### 3.3 Admin Portal

```
┌─────────────────┐
│   admin.html    │
│  (admin-login)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Authentication ผ่าน Supabase Auth  │
│  ตรวจสอบบทบาทจาก admin_user_roles    │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────────┐
│ admin │ │  org_hr   │
└───┬───┘ └─────┬─────┘
    │           │
    ▼           ▼
ดูทุกหน่วยงาน  ดูเฉพาะหน่วยงานตัวเอง
    │           │
    └─────┬─────┘
          ▼
┌─────────────────────────────────────┐
│  ฟีเจอร์ Admin                      │
│  • Dashboard + กราฟวิเคราะห์         │
│  • ดูคำตอบรายบุคคล                  │
│  • Export CSV/Excel                 │
│  • จัดการองค์กร                     │
│  • จัดการสิทธิ์ผู้ใช้               │
│  • เปิด/ปิดช่วงเวลาฟอร์ม           │
│  • แก้ไขข้อความคำถาม               │
└─────────────────────────────────────┘
```

---

## 4. ฐานข้อมูล (Supabase PostgreSQL)

### 4.1 ตารางหลัก

| ตาราง | คำอธิบาย | ข้อมูลสำคัญ |
|-------|----------|-------------|
| `organizations` | ข้อมูลองค์กร | org_id, org_name, org_type |
| `admin_user_roles` | ผู้ใช้และบทบาท | user_id, email, role, org_id |
| `survey_responses` | คำตอบ Well-being | respondent_data, scores, submitted_at |
| `hrd_ch1_responses` | คำตอบ CH1 | org_id, section_data, status |
| `org_form_links` | ลิงก์เฉพาะองค์กร | org_id, form_id, access_url |
| `form_windows` | ช่วงเวลาเปิด-ปิดฟอร์ม | form_id, open_date, close_date |
| `admin_audit_logs` | ประวัติการกระทำ | action, user_id, timestamp |

### 4.2 Row Level Security (RLS)

```sql
-- ตัวอย่าง RLS Policy
CREATE POLICY "Users can only see their org data" 
ON survey_responses 
FOR SELECT 
USING (
  org_id = requester_org()  
  OR requester_role() = 'admin'
);
```

Helper functions:
- `requester_email()` - อีเมลผู้ใช้ปัจจุบัน
- `requester_role()` - บทบาทผู้ใช้
- `requester_org()` - องค์กรผู้ใช้
- `requester_is_admin()` - ตรวจสอบแอดมิน

---

## 5. Security & Authentication

### 5.1 การยืนยันตัวตน

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ผู้ใช้กรอก    │────▶│  Supabase Auth  │────▶│   JWT Token     │
│  email/password  │     │  (PostgreSQL)   │     │   (สำหรับ API)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 5.2 สิทธิ์การเข้าถึง

| บทบาท | สิทธิ์ |
|-------|--------|
| `admin` | ทุกอย่างในระบบ |
| `org_hr` | ดู/แก้ไขเฉพาะองค์กรตัวเอง |
| `viewer` | ดูข้อมูลอย่างเดียว |

---

## 6. Integration

### 6.1 Google Sheets Sync (ถ้าใช้)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Supabase      │────▶│  Edge Function  │────▶│ Google Apps     │
│   (Trigger)     │     │  google-sync    │     │  Script         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 6.2 Service Worker (`sw.js`)

- ทำงาน offline ได้บางส่วน
- Cache static assets
- Background sync (ถ้าเปิดใช้)

---

## 7. Deployment

### 7.1 โครงสร้าง Deployment

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ index   │ │  ch1    │ │ admin   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
                   │
                   ▼ (API Calls)
┌─────────────────────────────────────────┐
│         Supabase (Backend)             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │PostgreSQL│ │  Auth   │ │ Storage │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

### 7.2 ไฟล์ Config สำคัญ

| ไฟล์ | หน้าที่ |
|------|---------|
| `vercel.json` | Routing, headers, cache control |
| `supabase/config.toml` | Supabase project config |
| `.env.local` | Environment variables |
| `package.json` | Dependencies & scripts |

---

## 8. การพัฒนา

### 8.1 คำสั่งที่ใช้บ่อย

```bash
# เริ่ม dev server
npm run dev

# Deploy ไป Vercel
npm run deploy

# Deploy preview
npm run deploy:preview

# Supabase operations
npm run supabase:test
npm run supabase:stats
npm run supabase:export
npm run supabase:deploy

# Sync Google Sheets
npm run sync:google:pending
npm run sync:google:all

# Database
npm run db:clear-test
```

---

## 9. สรุปไฟล์ที่ลบไป (35 ไฟล์)

### ลบแล้ว:
- ✅ Test PDFs: 3 ไฟล์
- ✅ Surveys TXT: 4 ไฟล์  
- ✅ docs/screenshots: (ว่าง)
- ✅ docs/ch1-org-reports: 28 ไฟล์ (reports เก่า)

### ไฟล์สำคัญที่เหลือ:
- HTML หลัก: `index.html`, `ch1.html`, `admin.html`, `ch1-edit.html`, etc.
- JS: `js/modules/core.js`, `js/admin-dashboard.js`, etc.
- Data: `data/questions-wellbeing.json`, `data/questions-ch1.json`
- Config: `vercel.json`, `package.json`
- Docs: `docs/ADMIN_GUIDE.md`, `docs/DEPLOYMENT_GUIDE.md`, etc.
- Supabase: `supabase/migrations/`, `supabase/functions/`

---

## 10. จุดเชื่อมต่อสำคัญ

| Entry Point | ไฟล์ | คำอธิบาย |
|-------------|------|---------|
| Well-being Survey | `index.html` | `/` - แบบสำรวจบุคลากร |
| CH1 Survey | `ch1.html` | `/ch1` - แบบฟอร์ม HRD |
| Admin | `admin.html` | `/admin` - จัดการระบบ |
| API | Supabase | RESTful API endpoint |

---

**รายงานจัดทำเมื่อ:** 24 มีนาคม 2569
**โดย:** Cascade AI
**โปรเจค:** Well-being Survey System for Government
