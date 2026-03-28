# 📋 Work Plan — CH1 Fix + Org-Portal Role Testing
> วันที่: 2026-03-22 | จัดทำโดย: Cowork
> สถานะ: Cowork ทำ Code Fixes เสร็จแล้ว → รอ Dev ทดสอบ Production

---

## สรุป Root Cause ที่พบ (Cowork วิเคราะห์)

| ปัญหา | Root Cause | แก้แล้วหรือยัง |
|-------|-----------|----------------|
| CH1 ฟอร์มว่างเปล่า / กรอกไม่ได้ | `ch1-edit.html` ไม่ได้โหลด `project-ssot.js` → `PROJECT_SSOT = undefined` → fallback fields = `{}` → 0 questions | ✅ Cowork แก้แล้ว |
| Schema fallback silent fail | `schema.sections.length > 0` แต่ questions = 0 → ฟอร์มโชว์แต่กรอกไม่ได้ ไม่มี error | ✅ Cowork แก้แล้ว (เพิ่ม debug alert) |
| admin/super_admin เข้า org-portal → หน้าค้าง | ไม่ redirect ไป admin.html | ✅ Cowork แก้แล้ว (auto-redirect 1.2s) |
| CH1 questions ไม่มีใน Supabase DB | ตาราง `form_questions` อาจไม่มีข้อมูล `form_code='ch1'` | ⚠️ **Dev ต้องตรวจ** |

---

## แผนงานแบ่ง Role

### 🔵 COWORK — เสร็จแล้วใน session นี้

| # | งาน | ไฟล์ที่แก้ | สถานะ |
|---|-----|-----------|-------|
| C1 | เพิ่ม `<script src="js/project-ssot.js">` ใน ch1-edit.html (ก่อน form-schema.js) | `ch1-edit.html` | ✅ Done |
| C2 | เพิ่ม guard: ตรวจ `totalQuestions > 0` ก่อน render form / แสดง debug info ถ้าไม่มี questions | `ch1-edit.html` | ✅ Done |
| C3 | admin/super_admin เข้า org-portal → auto-redirect ไป admin.html (1.2s delay) | `org-portal.html` | ✅ Done |
| C4 | จัดทำ Work Plan นี้ | `WORKPLAN_CH1_ORGPORTAL_ROLETEST.md` | ✅ Done |

---

### 🟠 DEV — งานที่ Dev ต้องทำ (ต้องการ access Supabase + localhost/Vercel)

#### D1 — ตรวจ Supabase `form_questions` table [CRITICAL]
```sql
-- รันใน Supabase SQL Editor
SELECT COUNT(*)
FROM form_questions
WHERE form_code = 'ch1' AND is_active = true;
```
- ถ้า count = 0 → **ต้อง seed คำถาม** (ดู D2)
- ถ้า count > 0 → ฟอร์มควรโหลดได้จาก DB แล้ว

#### D2 — Seed form_questions ถ้าว่าง [ทำถ้า D1 = 0]
```sql
-- Seed section
INSERT INTO form_sections (form_code, section_key, title_th, section_order, is_active)
VALUES ('ch1', 'ch1_basic', 'ข้อมูลพื้นฐานองค์กร', 1, true)
ON CONFLICT DO NOTHING;

-- Seed คำถามหลัก (ตัวอย่าง — Dev ขยายตามต้องการ)
INSERT INTO form_questions
  (form_code, section_key, question_key, label_th, input_type, question_order, is_required, is_active)
VALUES
  ('ch1','ch1_basic','organization','ชื่อหน่วยงาน','text',1,true,true),
  ('ch1','ch1_basic','total_staff','บุคลากรรวมทั้งหมด (คน)','number',2,true,true),
  ('ch1','ch1_basic','type_official','ข้าราชการ (คน)','number',3,false,true),
  ('ch1','ch1_basic','type_employee','พนักงานราชการ (คน)','number',4,false,true),
  ('ch1','ch1_basic','type_contract','ลูกจ้าง (คน)','number',5,false,true),
  ('ch1','ch1_basic','strategic_overview','ภาพรวมยุทธศาสตร์ขององค์กร','textarea',6,false,true),
  ('ch1','ch1_basic','context_challenges','บริบทและความท้าทาย','textarea',7,false,true),
  ('ch1','ch1_basic','training_hours','ชั่วโมงอบรม/คน/ปี','number',8,false,true),
  ('ch1','ch1_basic','sick_leave_avg','วันลาป่วยเฉลี่ย/คน/ปี','number',9,false,true),
  ('ch1','ch1_basic','engagement_score','Engagement Score (ถ้ามี)','number',10,false,true)
ON CONFLICT DO NOTHING;
```

#### D3 — ทดสอบ Flow CH1 บน localhost / Vercel [Regression Test]

```
Test Matrix:
┌─────────────────────────────────────────────────────────────────┐
│  Scenario                           │ Expected Result            │
├─────────────────────────────────────────────────────────────────┤
│  1. org_hr (ไม่มี ch1) เข้า portal  │ เห็นปุ่ม "เริ่มกรอก CH1" │
│  2. คลิก "เริ่มกรอก CH1"            │ ไป /ch1-form?org=xxx       │
│  3. ch1-edit.html โหลดขึ้น          │ เห็น Form มีคำถาม          │
│  4. กรอก → "บันทึก Draft"           │ INSERT สำเร็จ status=draft │
│  5. กลับ portal → คลิก "แก้ไข CH1" │ ไป ch1-edit.html?id=...    │
│  6. กรอก → "ส่งข้อมูล"             │ UPDATE status=submitted    │
│  7. กลับ portal → ดูปุ่ม           │ เห็นแค่ Preview + PDF      │
│  8. org_hr กรอก org อื่น (security) │ RLS block, error แจ้งชัด  │
└─────────────────────────────────────────────────────────────────┘
```

#### D4 — ทดสอบ Role บน org-portal [Role Test]

```
Role Test Matrix:
┌──────────────────────────────────────────────────────────────────┐
│  User Role     │ Action                  │ Expected              │
├──────────────────────────────────────────────────────────────────┤
│  org_hr        │ Login org-portal        │ เห็น portal ปกติ      │
│  org_hr        │ ไม่มี org_code          │ Toast "ติดต่อ Admin"   │
│  admin         │ Login org-portal        │ Redirect → admin.html │
│  super_admin   │ Login org-portal        │ Redirect → admin.html │
│  org_hr ORG=A  │ เข้า ch1-form?org=B    │ Error "ไม่มีสิทธิ์"   │
│  unauthenticated│ เข้า org-portal        │ เห็น Login form       │
│  unauthenticated│ เข้า ch1-edit.html     │ Redirect → org-portal │
└──────────────────────────────────────────────────────────────────┘
```

#### D5 — Deploy + Smoke Test บน Vercel Production

```bash
# วิธีทดสอบ local (ใช้ vercel dev เพื่อให้ rewrites ใน vercel.json ทำงาน)
npx vercel dev

# จากนั้นเปิด browser:
# http://localhost:3000/org-portal   → org-portal.html
# http://localhost:3000/ch1-form?org=dss → ch1-edit.html
```

---

## ลำดับการทำงาน (Timeline)

```
[Cowork — เสร็จแล้ว] ─────────────────────────────────────────
  ✅ C1: Fix script loading ch1-edit.html
  ✅ C2: Fix fallback guard + debug info
  ✅ C3: Admin redirect fix org-portal
  ✅ C4: Work Plan นี้

[Dev — ต้องทำต่อ] ────────────────────────────────────────────
  🔲 D1: ตรวจ form_questions table ใน Supabase    ← ทำก่อน
  🔲 D2: Seed คำถาม (ถ้าว่าง)                     ← ทำถ้า D1=0
  🔲 D3: Regression Test CH1 Flow (8 scenarios)   ← ทำหลัง D2
  🔲 D4: Role Test บน org-portal (7 scenarios)    ← ทำพร้อม D3
  🔲 D5: Deploy + Smoke Test Production            ← ทำสุดท้าย
```

---

## Files ที่ Cowork แก้ในรอบนี้

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `ch1-edit.html` | เพิ่ม `<script src="js/project-ssot.js">` (line 87), เพิ่ม `totalQuestions` guard + debug info |
| `org-portal.html` | เพิ่ม auto-redirect ไป admin.html สำหรับ admin/super_admin |

---

## ข้อสังเกตเพิ่มเติมจาก Cowork

1. **`hrd-ch1-fields.js`** ปัจจุบันทำแค่ `= PROJECT_SSOT?.ch1?.fallbackFields || {}` — หลังจากเพิ่ม project-ssot.js แล้ว fallback จะมี 38 fields พร้อมใช้แม้ DB ล่ม
2. **Security**: RLS ใน Supabase enforce `org_code = requester_org()` อยู่แล้ว (ทำใน session ก่อน) — org_hr ไม่สามารถ INSERT data ของ org อื่นได้ระดับ DB
3. **Status flow** ที่ตรวจแล้ว: `draft → submitted → (admin reopen) → reopened → submitted → (admin lock) → locked` — logic ใน ch1-edit.html และ org-portal.html ถูกต้อง
4. **org_hr ที่มี status=submitted** จะเห็นฟอร์มแบบ read-only พร้อม alert แจ้งว่าต้องติดต่อ Admin เพื่อ reopen — behavior ถูกต้องตาม ROLE_PERMISSION_MATRIX

---

*Cowork scope สิ้นสุด — Dev ดำเนินการ D1–D5 ต่อได้เลย*
