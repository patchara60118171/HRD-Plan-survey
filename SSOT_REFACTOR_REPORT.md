# SSOT Refactor — Implementation Report
**วันที่:** 2026-03-22
**จัดทำโดย:** Cowork Backend Specialist
**Priority:** High — ต้องทำก่อน Sprint ถัดไป
**Type:** Frontend Code Refactoring — Dev Action Required

---

## สรุป Root Cause (จากการ audit ไฟล์จริง)

| ปัญหา | ไฟล์ที่เกี่ยวข้อง | ความรุนแรง |
|------|-----------------|-----------|
| `PROJECT_SSOT.wellbeing` เป็น empty placeholder | `js/project-ssot.js` L10-13 | 🔴 Critical |
| CH1 schema คนละชุดใน `survey.js` | `js/modules/survey.js` L484-490 | 🔴 Critical |
| `FORM_CONFIG_SCHEMAS` + `_feConfigCache` ซ้ำใน `admin.html` | `admin.html` L4444, L4607 | 🔴 Critical |
| `SURVEY_BASE_URL` ประกาศซ้ำ | `admin.html` L2134 | 🟡 Medium |
| `LOCKED_SUPERADMIN_EMAILS` ประกาศซ้ำ | `admin.html` L2136 | 🟡 Medium |
| `ORG_HR_MAP` ประกาศซ้ำ | `admin.html` L3848 | 🟡 Medium |
| `ORG_HR_EMAIL_DOMAIN` ประกาศซ้ำ | `admin.html` L3866 | 🟡 Medium |

---

## Task 1 — ย้าย Wellbeing canonical data เข้า `js/project-ssot.js`

### สถานะปัจจุบัน
```
js/project-ssot.js  → wellbeing: { sectionsOrder: [], surveyData: {} }  ← EMPTY!
js/questions.js     → SECTIONS_ORDER = [8 sections]                     ← ข้อมูลจริงอยู่ที่นี่
                    → SURVEY_DATA = { personal, consumption, ... }
```

**Consumer fallback pattern ที่ใช้อยู่ใน app.js / components.js / utils.js:**
```js
// ทุก consumer ใช้ pattern นี้ซ้ำๆ 5+ ครั้ง
const sectionsOrder = PROJECT_SSOT?.wellbeing?.sectionsOrder?.length
  ? PROJECT_SSOT.wellbeing.sectionsOrder
  : SECTIONS_ORDER;   // ← ตกมาที่ questions.js ตลอด เพราะ SSOT ว่าง
const surveyData = Object.keys(PROJECT_SSOT?.wellbeing?.surveyData || {}).length
  ? PROJECT_SSOT.wellbeing.surveyData
  : SURVEY_DATA;
```

### งานที่ Dev ต้องทำ

**Step 1: เติม `js/project-ssot.js` section `wellbeing`**
```js
// ใน js/project-ssot.js — แก้ส่วนนี้:
wellbeing: {
  sectionsOrder: [],   // ← เปลี่ยนเป็น array จริงจาก questions.js
  surveyData: {}       // ← เปลี่ยนเป็น object จริงจาก questions.js
},
```
ค่าที่ต้องย้ายมา (จาก `js/questions.js`):
- `SECTIONS_ORDER` = `['personal','consumption','nutrition','activity','mental','loneliness','safety','environment']`
- `SURVEY_DATA` = object ทั้งหมดที่มี 8 sections (personal, consumption, ...)

**Step 2: แก้ `js/questions.js` ให้เป็น alias ชั่วคราว**
```js
// js/questions.js — เปลี่ยนเป็น alias (backward compat ระหว่าง transition)
const SECTIONS_ORDER = PROJECT_SSOT.wellbeing.sectionsOrder;
const SURVEY_DATA    = PROJECT_SSOT.wellbeing.surveyData;
```

**Step 3 (ทีหลัง): ลบ fallback ออกจาก consumer**
```js
// เปลี่ยน pattern ใน app.js / components.js / utils.js
// จาก:
const sectionsOrder = PROJECT_SSOT?.wellbeing?.sectionsOrder?.length
  ? PROJECT_SSOT.wellbeing.sectionsOrder : SECTIONS_ORDER;
// เป็น:
const sectionsOrder = PROJECT_SSOT.wellbeing.sectionsOrder;
```

---

## Task 2 — ลบ CH1 schema ซ้ำใน `js/modules/survey.js`

### สถานะปัจจุบัน
```
js/modules/survey.js L484-756:
  const SECTIONS_ORDER = ['basic_info','policies_context','health_data','management_systems','strategic_goals']
  const SURVEY_DATA    = { basic_info: { title: 'ส่วนที่ 1: ข้อมูลเบื้องต้น...' }, ... }
```

**ปัญหา:** นี่คือ CH1 schema คนละชุดกับ:
- `js/form-schema.js` (public CH1 form schema)
- `PROJECT_SSOT.ch1` (step names + field keys)

และชื่อตัวแปรซ้ำกับ Wellbeing SECTIONS_ORDER/SURVEY_DATA — **runtime conflict ถ้าโหลดพร้อมกัน**

### งานที่ Dev ต้องทำ

**Step 1: ตรวจว่า `survey.js` ถูก import ที่ไหนบ้าง**
```bash
grep -rn "survey.js\|modules/survey" index.html ch1.html admin.html --include="*.html"
```

**Step 2: ลบ SECTIONS_ORDER + SURVEY_DATA block จาก `survey.js` (L480-760)**
- ถ้า consumer ที่ใช้ต้องการ CH1 schema → ให้ import จาก `js/form-schema.js` หรือ `PROJECT_SSOT.ch1`
- ถ้า module นี้ไม่มีใครใช้แล้ว → พิจารณา deprecate ทั้งไฟล์

---

## Task 3 — ลบ `FORM_CONFIG_SCHEMAS` + `_feConfigCache` ที่ค้างใน `admin.html`

### สถานะปัจจุบัน
```
admin.html:
  L899:  <script src="admin/js/services/form-editor-schema.js">  ← โหลดถูกแล้ว
  ...
  L4444: const FORM_CONFIG_SCHEMAS = { ch1: {...}, wellbeing: {...} }  ← ประกาศซ้ำ!
  L4607: let _feConfigCache = { ch1: {}, wellbeing: {} }               ← ประกาศซ้ำ!
```

**ปัญหา:** inline `<script>` ที่ L910 ใน admin.html redeclare ทับของที่ service file โหลดมา → ขึ้นอยู่กับ JS engine ว่าจะใช้ตัวไหน (เสี่ยง silent override)

### งานที่ Dev ต้องทำ

**Step 1: ลบ block L4444-4605 ออกจาก `admin.html`** (ทั้ง `FORM_CONFIG_SCHEMAS` object)

**Step 2: ลบ `let _feConfigCache` ออกจาก `admin.html` L4607**

**Step 3: ตรวจว่า functions ที่ใช้ FORM_CONFIG_SCHEMAS และ _feConfigCache (L4627, L4767, L4794, L4805, L4808, L4814, L4826, L4832) ยังทำงานได้หลังลบ**
- ถ้า `form-editor-schema.js` export ตัวแปรชื่อเดียวกัน → ไม่มีปัญหา (ใช้ global ได้เลย)
- ถ้าไม่ export → ย้าย _feConfigCache ไปไว้ใน `admin/js/services/forms.js` แทน

---

## Task 4 — ไล่ Consumer ที่ยังอ่าน Global เดิม

### Files ที่ต้องตรวจ

| File | สิ่งที่ตรวจ | สถานะ |
|------|-----------|-------|
| `js/app.js` | `SECTIONS_ORDER`, `SURVEY_DATA` fallback (L1046, 1047, 1221, 1222, 1251, 1252, 1267-1290) | ⚠️ ใช้ fallback — รอ Task 1 เสร็จแล้ว simplify |
| `js/components.js` | `SECTIONS_ORDER`, `SURVEY_DATA` fallback (L361-362) | ⚠️ ใช้ fallback |
| `js/utils.js` | `SURVEY_DATA` fallback (L155) | ⚠️ ใช้ fallback |
| `js/reporting.js` | ตรวจ label mapping hardcode | ❓ ยังไม่ได้ตรวจ |
| `wb-printable.html` | ตรวจ label/section hardcode | ❓ ยังไม่ได้ตรวจ |

### งานที่ Dev ต้องทำ
1. หลัง Task 1 เสร็จ (SSOT มีข้อมูลจริง) → ลบ fallback ออกจากทุก consumer
2. ตรวจ `js/reporting.js` + `wb-printable.html` ว่ามี hardcode wording ที่ไม่ตรงกับ SSOT ไหม
3. export label ทุกอย่างมาจาก `PROJECT_SSOT.wellbeing.surveyData[section].title` หรือ `questions.id`

---

## Task 6 — ลบ Constants ซ้ำใน `admin.html`

### Duplicate declarations (ทั้งหมดอยู่ใน inline script ใน `admin.html`)

| constant | ที่ซ้ำใน admin.html | SSOT/Source จริง |
|----------|---------------------|-----------------|
| `SURVEY_BASE_URL` | L2134 | `admin/js/services/config.js` L5 (อ่านจาก SSOT) |
| `LOCKED_SUPERADMIN_EMAILS` | L2136 | `admin/js/services/config.js` L6 |
| `ORG_HR_MAP` | L3848-3865 | `admin/js/services/config.js` L7 |
| `ORG_HR_EMAIL_DOMAIN` | L3866 | `admin/js/services/config.js` L8 |

**ทั้ง 4 constants ถูก config.js โหลดไว้ก่อนแล้วที่ L891 ใน admin.html**
→ inline ที่ซ้ำมาทีหลังจะ override ค่าจาก config.js (ซึ่งอ่านจาก SSOT)

### งานที่ Dev ต้องทำ
**ลบ 4 บรรทัดออกจาก admin.html:**
- L2134: `const SURVEY_BASE_URL = 'https://nidawellbeing.vercel.app';`
- L2136: `const LOCKED_SUPERADMIN_EMAILS = ['admin@gmail.com'];`
- L3848-3865: `const ORG_HR_MAP = [...]` (ทั้ง block)
- L3866: `const ORG_HR_EMAIL_DOMAIN = '@wellbeing.go.th';`

**⚠️ ระวัง:** ตรวจก่อนลบว่า functions ที่ใช้ constants เหล่านี้ใน admin.html (เช่น L3881, L3889, L3901, L4061, L4111) จะยังรับค่าจาก config.js ได้ถ้าทำงานใน global scope เดียวกัน

---

## Task 5 — ตรวจ Sync กับ Public Forms (เฉพาะจากโค้ด)

### เนื่องจาก nidawellbeing.vercel.app ถูก block จาก VM — ตรวจจาก local source แทน

**Wellbeing Form canonical data (ใน `js/questions.js`):**
- Sections: 8 หมวด (personal, consumption, nutrition, activity, mental, loneliness, safety, environment)
- SSOT section `personal.title` = `'ส่วนที่ 1 ข้อมูลส่วนบุคคล และการตรวจวัดร่างกาย'`

**CH1 Form canonical data (ใน `admin/js/services/form-editor-schema.js`):**
- Steps: 5 ส่วน (step1-step5 titles)
- `step1_title` default = `'🏛️ ส่วนที่ 1: ข้อมูลเบื้องต้นของส่วนราชการ'`

**CH1 schema ซ้ำใน `js/modules/survey.js`:**
- SECTIONS_ORDER = `['basic_info','policies_context','health_data','management_systems','strategic_goals']`
- ชื่อ section ตรงกับ form-editor-schema แต่ใช้ key ต่างกัน → **Dev ต้องตรวจ sync**

**Action สำหรับ Dev:**
```
1. เปิด https://nidawellbeing.vercel.app/ → นับจำนวนข้อ + ชื่อ section
2. เปิด https://nidawellbeing.vercel.app/ch1 → นับ steps + wording
3. เปรียบเทียบกับ js/questions.js (wellbeing) และ form-editor-schema.js (CH1)
4. ถ้าไม่ตรง → แก้ SSOT ก่อน แล้วค่อย refactor consumer
```

---

## Task 7 — Regression Checklist (Dev ทำหลัง Refactor เสร็จ)

### จุดเสี่ยงที่ต้องตรวจ

| หน้า | จุดเสี่ยง | วิธีทดสอบ |
|-----|---------|----------|
| `index.html` (Wellbeing public) | section order ถูกต้อง ครบ 8 section | โหลดหน้า → นับ section card |
| `ch1.html` | step count = 5, wording ตรงกับ form-editor-schema | โหลดหน้า → ดู step title |
| `admin.html` → Users page | ไม่มี JS error จาก duplicate const | F12 console → ไม่มี "already declared" |
| `admin.html` → Form Editor | FORM_CONFIG_SCHEMAS load จาก service ไม่ใช่ inline | inspect ว่า schema ยังมีครบ |
| `admin.html` → Create org_hr | ORG_HR_MAP ยังมีค่าหลังลบ inline | สร้าง user ใหม่แล้ว dropdown แสดง org ครบ |
| `admin.html` → Dashboard | survey/ch1 data filter ถูก org | login org_hr → เห็นแค่ org ตัวเอง |
| `wb-printable.html` | section label ตรงกับ SSOT | print preview → ชื่อ section ถูก |

### Command line regression check (ก่อน deploy)
```bash
# ตรวจ duplicate const declarations ที่เหลือ
grep -n "const SURVEY_BASE_URL\|const LOCKED_SUPERADMIN\|const ORG_HR_MAP\|const ORG_HR_EMAIL_DOMAIN\|const FORM_CONFIG_SCHEMAS\|let _feConfigCache" admin.html
# ผลลัพธ์ที่ต้องการ: ไม่มีผลลัพธ์เลย (0 lines)

# ตรวจ SSOT wellbeing ไม่ empty
node -e "const s=require('./js/project-ssot.js'); console.log(s.PROJECT_SSOT.wellbeing.sectionsOrder.length)"
# ผลลัพธ์ที่ต้องการ: 8
```

---

## ลำดับการทำงานที่แนะนำ

```
1. Task 1  → เติม SSOT wellbeing (project-ssot.js)
            → แก้ questions.js เป็น alias
2. Task 6  → ลบ duplicate constants 4 ตัวออกจาก admin.html
3. Task 3  → ลบ FORM_CONFIG_SCHEMAS + _feConfigCache ออกจาก admin.html
4. Task 2  → ลบ CH1 schema ซ้ำออกจาก survey.js
5. Task 4  → ลบ fallback pattern ใน app.js/components.js/utils.js
            → ตรวจ reporting.js + wb-printable.html
6. Task 5  → ตรวจ sync manual กับ public forms
7. Task 7  → Regression test ทุกหน้า
```

**เกณฑ์ปิดงาน:**
- [ ] `grep "const SURVEY_BASE_URL\|const LOCKED_SUPERADMIN\|const ORG_HR_MAP\|const ORG_HR_EMAIL_DOMAIN\|const FORM_CONFIG_SCHEMAS\|let _feConfigCache" admin.html` → 0 results
- [ ] `PROJECT_SSOT.wellbeing.sectionsOrder.length === 8`
- [ ] `PROJECT_SSOT.wellbeing.surveyData` ไม่ empty
- [ ] F12 console ใน admin.html ไม่มี duplicate declaration error
- [ ] login org_hr → เห็นแค่ org ตัวเองทั้ง CH1 + Wellbeing
- [ ] Form editor แสดง schema ครบทุก section

---

*Cowork scope: รายงานนี้ครอบคลุม code audit และ implementation spec ทั้งหมด — Dev ดำเนินการ code changes ต่อได้เลยครับ*
