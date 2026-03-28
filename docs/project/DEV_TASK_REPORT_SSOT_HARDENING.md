# Developer Task Report — SSOT Refactor + DB Hardening
**วันที่:** 2026-03-22
**จัดทำโดย:** Cowork Backend Specialist
**Version:** 2.0 (อัปเดตจาก SSOT_REFACTOR_REPORT.md)
**สถานะรวม:** 🟡 In Progress — ทำไปบางส่วน ยังมีค้าง

---

## สรุปสถานะ — ภาพรวมทั้งหมด

| Task | หัวข้อ | สถานะ |
|------|--------|-------|
| T1 | ย้าย Wellbeing data เข้า `project-ssot.js` | ⚠️ Partial (runtime OK แต่ static SSOT ยังว่าง) |
| T2 | ลบ CH1 schema ซ้ำใน `survey.js` | 🔴 Pending |
| T3 | ลบ `FORM_CONFIG_SCHEMAS` ซ้ำใน `admin.html` | ✅ Done |
| T4 | ลบ fallback pattern ใน consumer files | 🔴 Pending (รอ T1) |
| T5 | ตรวจ sync Public Forms | 🔴 Pending (manual check) |
| T6 | ลบ duplicate constants 4 ตัวใน `admin.html` | 🔴 Pending |
| T7 | Regression test | 🔴 Pending (ทำสุดท้าย) |
| **T8** | **DB Hardening — api.js/users.js ยังเรียก `admin_user_roles` ตรง** | **🔴 Pending** |

---

## T1 — ย้าย Wellbeing data เข้า `project-ssot.js` ⚠️ Partial

### สถานะปัจจุบัน
`questions.js` เรียก `setWellbeingSurveyData()` ตอน load → runtime ใช้ได้
แต่ `project-ssot.js` ยังเป็น empty placeholder:
```js
// js/project-ssot.js (ปัจจุบัน)
wellbeing: {
  sectionsOrder: [],   // ← EMPTY
  surveyData: {}       // ← EMPTY
},
```

Consumer ทุกตัวจึงตก fallback ไปหา `SECTIONS_ORDER` / `SURVEY_DATA` จาก `questions.js` อยู่

### งาน Dev

**Step 1: เติมค่าจริงใน `js/project-ssot.js`**
```js
wellbeing: {
  sectionsOrder: ['personal','consumption','nutrition','activity','mental','loneliness','safety','environment'],
  surveyData: { /* ย้าย object ทั้งหมดจาก SURVEY_DATA ใน questions.js มาใส่ที่นี่ */ }
},
```

**Step 2: แก้ `js/questions.js` เป็น alias (backward compat)**
```js
// แทนที่ const SECTIONS_ORDER = [...] และ const SURVEY_DATA = {...}
const SECTIONS_ORDER = PROJECT_SSOT.wellbeing.sectionsOrder;
const SURVEY_DATA    = PROJECT_SSOT.wellbeing.surveyData;
```

**Step 3: หลัง T1 เสร็จ → ลบ fallback ออกจาก consumer (รวมกับ T4)**

---

## T2 — ลบ CH1 schema ซ้ำใน `survey.js` 🔴 Pending

### สถานะปัจจุบัน
```
js/modules/survey.js L484-756:
  const SECTIONS_ORDER = ['basic_info','policies_context','health_data','management_systems','strategic_goals']
  const SURVEY_DATA    = { basic_info: {...}, ... }
```
ชื่อตัวแปรซ้ำกับ Wellbeing — **runtime conflict ถ้าโหลดพร้อมกัน**

### งาน Dev
1. ตรวจก่อนว่า `survey.js` ถูก `<script>` โหลดที่ไหน:
   ```bash
   grep -rn "survey.js\|modules/survey" *.html
   ```
2. ลบ block `SECTIONS_ORDER` + `SURVEY_DATA` ออกจาก `survey.js` (L480–760)
3. ถ้า consumer ใน module ต้องการ CH1 schema → ให้ import จาก `js/form-schema.js` หรือ `PROJECT_SSOT.ch1` แทน

---

## T3 — ลบ FORM_CONFIG_SCHEMAS ซ้ำใน admin.html ✅ Done

Confirmed: `admin.html` เหลือแค่ `<script src="admin/js/services/form-editor-schema.js">` (L899) แล้ว
ไม่มี inline duplicate อีกต่อไป — ปิด task นี้ได้

---

## T4 — ลบ fallback pattern ใน consumer files 🔴 Pending (รอ T1)

### Files ที่ต้องแก้หลัง T1 เสร็จ

| File | บรรทัด | Pattern ที่ต้องลบ |
|------|--------|-----------------|
| `js/app.js` | L1046, 1047, 1221, 1222, 1251, 1252, 1267–1290 | `? PROJECT_SSOT... : SECTIONS_ORDER` |
| `js/components.js` | L361–362 | fallback pattern เดิม |
| `js/utils.js` | L155 | `SURVEY_DATA` fallback |
| `js/reporting.js` | ยังไม่ได้ตรวจ | hardcode label mapping |
| `wb-printable.html` | ยังไม่ได้ตรวจ | section label hardcode |

### Pattern ที่ต้องเปลี่ยน (ทำหลัง T1)
```js
// จาก (fallback pattern เก่า):
const sectionsOrder = PROJECT_SSOT?.wellbeing?.sectionsOrder?.length
  ? PROJECT_SSOT.wellbeing.sectionsOrder
  : SECTIONS_ORDER;

// เป็น (direct SSOT):
const sectionsOrder = PROJECT_SSOT.wellbeing.sectionsOrder;
```

---

## T5 — ตรวจ sync Public Forms 🔴 Pending

Dev ต้องตรวจ manual:
1. เปิด https://nidawellbeing.vercel.app → นับ section จริงบนหน้า (ควร = 8)
2. เปิด https://nidawellbeing.vercel.app/ch1 → นับ step + ชื่อ (ควร = 5 steps)
3. เปรียบเทียบกับ `js/questions.js` (wellbeing) และ `admin/js/services/form-editor-schema.js` (CH1)
4. ถ้าไม่ตรง → แก้ SSOT ก่อน แล้วค่อย refactor consumer

---

## T6 — ลบ duplicate constants 4 ตัวใน admin.html 🔴 Pending

### Duplicates ที่ต้องลบ (inline script ใน admin.html)

| บรรทัด | constant | SSOT จริง |
|--------|----------|-----------|
| L2134 | `const SURVEY_BASE_URL = 'https://...'` | `admin/js/services/config.js` L5 |
| L2136 | `const LOCKED_SUPERADMIN_EMAILS = [...]` | `admin/js/services/config.js` L6 |
| L3848–3865 | `const ORG_HR_MAP = [...]` (ทั้ง block) | `admin/js/services/config.js` L7 |
| L3866 | `const ORG_HR_EMAIL_DOMAIN = '@...'` | `admin/js/services/config.js` L8 |

`config.js` ถูกโหลดที่ L891 → inline ที่ซ้ำมาทีหลังจะ **override ค่าจาก SSOT** → ต้องลบออก

### ⚠️ ก่อนลบ — ตรวจ functions ที่ใช้ constants เหล่านี้ใน admin.html:
- `SURVEY_BASE_URL` → L3881, L4061, L4111 (และอื่นๆ) ยังรับค่าจาก global ได้ถ้าอยู่ scope เดียวกัน
- `ORG_HR_MAP` → L3889, L3901 ตรวจว่า config.js export เป็น global ให้แล้วหรือยัง

---

## T8 — DB Hardening: api.js + users.js ยังเรียก `admin_user_roles` ตรง 🔴 NEW

### ปัญหา
Prompt H สร้าง VIEW `admin_user_roles_public` (ไม่มี `initial_password`) ไว้แล้ว
แต่ `api.js` และ `users.js` ยังมีจุดที่ query `admin_user_roles` (raw table) ตรง:

### จุดที่ต้องแก้ใน `admin/js/services/api.js`

| บรรทัด | Query ปัจจุบัน | แก้เป็น |
|--------|--------------|--------|
| L42 | `sb.from('admin_user_roles').select('*')` | fallback (ถ้า view ล้มเหลว) — ตรวจว่าจำเป็นไหม หรือลบ fallback ออก |
| L57 | `.from('admin_user_roles').select('id,org_code,...,initial_password,...')` | เปลี่ยนเป็น RPC `get_org_hr_credentials()` แทน (SECURITY DEFINER — admin only) |
| L67–70 | `.from('admin_user_roles').update(payload)` / `.insert(payload)` | ยังใช้ direct ได้ถ้า RLS permit write สำหรับ admin role |
| L81 | `.from('admin_user_roles').delete()` | ยังใช้ direct ได้ถ้า RLS permit delete สำหรับ admin role |

### จุดที่ต้องแก้ใน `admin/js/services/users.js`

| บรรทัด | Query ปัจจุบัน | ความเสี่ยง |
|--------|--------------|-----------|
| L261 | `sb.from('admin_user_roles').update({ initial_password: newPwd })` | เขียน `initial_password` ตรง — OK สำหรับ admin write |
| L322 | `sb.from('admin_user_roles').update({ initial_password: pwd })` | เหมือนกัน |
| L340 | `sb.from('admin_user_roles').update({ initial_password: pwd })` | เหมือนกัน |

> **Note:** การเขียน `initial_password` จาก admin ยังทำได้ผ่าน raw table (RLS อนุญาต admin write)
> ปัญหาหลักคือ **การ READ `initial_password` โดยไม่ผ่าน RPC** — ต้องแก้ L57 ให้ใช้ `get_org_hr_credentials()` แทน

### งาน Dev

**1. แก้ L57 ใน `api.js` — เปลี่ยนจาก direct SELECT เป็น RPC**
```js
// จาก:
const { data, error } = await sb.from('admin_user_roles')
  .select('id,org_code,org_name,display_name,email,initial_password,is_active,created_at')
  .eq('role', 'org_hr');

// เป็น:
const { data, error } = await sb.rpc('get_org_hr_credentials');
```

**2. แก้ L42 ใน `api.js` — ลบ fallback ที่ยังเรียก raw table**
```js
// บรรทัด L37 ใช้ admin_user_roles_public ถูกต้องแล้ว
// L42 เป็น fallback ถ้า view ล้มเหลว → ถ้า view stable แล้ว ลบ block นี้ออก
```

**3. L67–70, L81 (write/delete)** → ใช้ direct table ได้ปกติ admin RLS อนุญาต — ไม่ต้องแก้

---

## ลำดับการทำงานที่แนะนำ

```
1. T6   → ลบ 4 duplicate constants ออกจาก admin.html  (เร็ว, ไม่มี dependency)
2. T3   → ✅ Done แล้ว (ข้ามได้)
3. T8   → แก้ api.js L42 + L57 (DB Hardening)
4. T1   → เติม SSOT wellbeing + แก้ questions.js เป็น alias
5. T2   → ลบ CH1 schema ซ้ำใน survey.js
6. T4   → ลบ fallback ใน app.js / components.js / utils.js
7. T5   → Manual sync check กับ production forms
8. T7   → Regression test ทุกหน้า
```

---

## Regression Checklist (T7 — ทำสุดท้าย)

```bash
# ตรวจ duplicate constants ที่เหลือ — ผลที่ต้องการ: 0 lines
grep -n "const SURVEY_BASE_URL\|const LOCKED_SUPERADMIN\|const ORG_HR_MAP\|const ORG_HR_EMAIL_DOMAIN\|const FORM_CONFIG_SCHEMAS\|let _feConfigCache" admin.html

# ตรวจ SSOT wellbeing ไม่ empty — ผลที่ต้องการ: 8
node -e "const s=require('./js/project-ssot.js'); console.log(s.PROJECT_SSOT.wellbeing.sectionsOrder.length)"

# ตรวจ api.js ไม่มี direct SELECT initial_password อีก
grep -n "initial_password" admin/js/services/api.js
```

| หน้า | จุดเสี่ยง | วิธีทดสอบ |
|-----|---------|----------|
| `index.html` | section order ครบ 8 section | โหลดหน้า → นับ section card |
| `ch1.html` | step count = 5, wording ถูก | โหลดหน้า → ดู step title |
| `admin.html` | ไม่มี JS error duplicate const | F12 console → ไม่มี "already declared" |
| `admin.html` → Form Editor | FORM_CONFIG_SCHEMAS โหลดจาก service | inspect schema ยังมีครบ |
| `admin.html` → Create org_hr | ORG_HR_MAP ยังมีค่าหลังลบ inline | dropdown org แสดงครบ |
| `admin.html` → User Credentials | `get_org_hr_credentials()` ทำงาน | เปิดหน้า Users → ดู initial_password |
| Org-portal login | org_hr เข้าระบบได้ | login → เห็นแค่ org ตัวเอง |

---

## เกณฑ์ปิดงานทั้งหมด

- [ ] `grep` duplicate constants ใน `admin.html` → **0 results**
- [ ] `PROJECT_SSOT.wellbeing.sectionsOrder.length === 8`
- [ ] `PROJECT_SSOT.wellbeing.surveyData` ไม่ empty
- [ ] F12 console ใน `admin.html` ไม่มี duplicate declaration error
- [ ] `api.js` ไม่มี direct `SELECT initial_password` จาก raw table
- [ ] Org-portal: org_hr login → เห็นแค่ org ตัวเอง (CH1 + Wellbeing)
- [ ] Form editor แสดง schema ครบทุก section

---

*Cowork scope: รายงานนี้ครอบคลุม code audit และ spec ทั้งหมด — Dev ดำเนินการ code changes ต่อได้เลยครับ*
*อ้างอิง DB schema: VIEW `admin_user_roles_public`, RPC `get_org_hr_credentials()` สร้างไว้ใน Supabase แล้ว*
