# Well-being Survey Chapter 1 Form v3.0

แบบสอบถามสำรวจข้อมูลสุขภาวะบุคลากร บทที่ 1 - โครงสร้างใหม่ 5 ส่วน

## 📋 ภาพรวม

โปรเจคนี้พัฒนาแบบสอบถามสำรวจข้อมูลสุขภาวะบุคลากรสำหรับหน่วยงานภาครัฐ ปรับปรุงจากเวอร์ชัน 7 ส่วนเป็น 5 ส่วนเพื่อความกระชับและใช้งานง่ายขึ้น

### 🔄 การเปลี่ยนแปลงหลัก v2.1 → v3.0

- **โครงสร้าง**: 7 ส่วน → 5 ส่วน + Landing page
- **ฟิลด์ใหม่**: เพิ่ม ~30 ฟิลด์ (โครงสร้างอัตรากำลัง 13 ระดับ, อายุราชการ 8 ช่วง)
- **ฟิลด์เก่า**: ลบฟิลด์ที่ไม่จำเป็น (vision_mission, hrd_budget_url, etc.)
- **UI**: ปรับปรุงการแสดงผลและการนำทาง

## 🏗️ โครงสร้างแบบสอบถาม (5 ส่วน)

### ส่วนที่ 1: ข้อมูลเบื้องต้นของส่วนราชการ
- ชื่อหน่วยงาน
- ภาพรวมยุทธศาสตร์
- โครงสร้างองค์กร
- จำนวนบุคลากรรวม
- การกระจายอายุ (4 กลุ่ม)
- การกระจายอายุราชการ (8 ช่วง)
- ประเภทตำแหน่ง (13 ระดับ)
- อัตราการลาออก/ย้าย

### ส่วนที่ 2: นโยบายและบริบทภายนอก
- นโยบายที่เกี่ยวข้อง
- บริบทและความท้าทาย

### ส่วนที่ 3: ข้อมูลสุขภาวะ
- โรค NCD (7 ประเภท)
- ข้อมูลการลาป่วย (5 ปีย้อนหลัง)
- ข้อมูลคลินิก
- สุขภาพจิต (5 ประเภท)
- ข้อมูลความผูกพัน (5 ปีย้อนหลัง)
- แบบสอบถามอื่นๆ

### ส่วนที่ 4: ระบบการบริหารและสภาพแวดล้อม
- ระบบสนับสนุนบุคลากร (4 ระบบ)
- ชั่วโมงการอบรม
- ระบบดิจิทัล
- การจัดสภาพแวดล้อมตามหลักการยศาสตร์
- การวิเคราะห์สุขภาวะ

### ส่วนที่ 5: ทิศทาง เป้าหมาย และข้อเสนอแนะ
- จุดเน้นการพัฒนา (สูงสุด 3 ประเด็น)
- ข้อเสนอแนะ Intervention Packages
- ไฟล์แผน HRD และผลการดำเนินงาน

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Features**: Auto-save, Form validation, Multi-step navigation

## 📁 โครงสร้างโปรเจค

```
Well-being Survey/
├── ch1.html                     # หน้าแบบสอบถามหลัก
├── js/
│   ├── supabase-config.js       # ค่า Supabase
│   └── ch1-form.js             # Logic แบบสอบถาม
├── css/
│   └── ch1-form.css            # สไตล์เพิ่มเติม
├── supabase/
│   └── migrations/
│       └── 20250303_update_schema_v3.sql  # Migration ฐานข้อมูล
├── scripts/
│   └── seed-test-data.js       # สคริปต์เติมข้อมูลทดสอบ
├── docs/
│   └── README.md               # ไฟล์นี้
└── แบบสอบถามบท 1(ร่าง) แบบฟอร์มสำรวจข้อมูล บท 1.md  # เอกสารอ้างอิง
```

## 🚀 การติดตั้งและใช้งาน

### 1. เตรียม Supabase

```sql
-- รัน migration ใน Supabase SQL Editor
-- ไฟล์: supabase/migrations/20250303_update_schema_v3.sql
```

### 2. ตั้งค่า Supabase

แก้ไข `js/supabase-config.js`:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. เติมข้อมูลทดสอบ (ถ้าต้องการ)

```bash
# ติดตั้ง dependencies
npm install @supabase/supabase-js

# แก้ไข SERVICE_KEY ใน scripts/seed-test-data.js
# รันสคริปต์
node scripts/seed-test-data.js
```

### 4. เปิดใช้งาน

เปิด `ch1.html` ในเว็บเบราว์เซอร์

## 📊 ฐานข้อมูล

### ตาราง: `hrd_ch1_responses`

คอลัมน์หลัก:
- **Metadata**: `organization`, `form_version`, `submitted_at`
- **Step 1**: `strategic_overview`, `org_structure`, ฟิลด์อายุ/อายุราชการ/ตำแหน่ง
- **Step 2**: `related_policies`, `context_challenges`
- **Step 3**: ฟิลด์ NCD, `sick_leave_data`, `clinic_*`, `mental_*`, `engagement_data`
- **Step 4**: `mentoring_system`, `training_hours`, `digital_systems`, `ergonomics_status`
- **Step 5**: `strategic_priorities`, `intervention_suggestions`, `hrd_plan_results`

## 🔄 การพัฒนา

### Local Development
```bash
# ใช้ Live Server ใน VS Code หรือ
python -m http.server 8000
```

### Testing
- ทดสอบ validation ในแต่ละส่วน
- ทดสอบ auto-save ทุก 30 วินาที
- ทดสอบการ submit ข้อมูล

### Deployment
- **GitHub Pages**: สำหรับ demo
- **Vercel/Netlify**: สำหรับ production
- **Custom Domain**: สำหรับการใช้งานจริง

## 📝 การบำรุงรักษา

### เวอร์ชัน
- v1.0: เวอร์ชันเริ่มต้น
- v2.1: 7 ส่วน พร้อมฟีเจอร์ครบ
- v3.0: 5 ส่วน ปรับปรุง UI/UX

### Roadmap
- [ ] เพิ่ม dashboard สำหรับดูผลลัพธ์
- [ ] รองรับการอัพโหลดไฟล์
- [ ] ระบบแจ้งเตือนอีเมล
- [ ] รองรับภาษาอังกฤษ

## 👥 ทีมพัฒนา

- **Frontend**: HTML5, Tailwind CSS, JavaScript
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Testing**: Manual testing

## 📄 License

โปรเจคนี้เป็นของหน่วยงานภาครัฐ ใช้สำหรับการสำรวจข้อมูลสุขภาวะบุคลากรเท่านั้น

---

**ติดต่อ**: ทีมพัฒนาระบบสุขภาวะบุคลากร  
**อัพเดตล่าสุด**: 3 มีนาคม 2568
