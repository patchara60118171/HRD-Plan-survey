# 📋 CHANGELOG — Well-being Survey System

> รายงานการเปลี่ยนแปลงทั้งหมดของระบบ  
> Repository: https://github.com/patchara60118171/HRD-Plan-survey

---

## [2026-04-25] — Audit Fixes: Security, Performance & Docs (Wave 1/2/4)

**Branch:** main  
**Ref:** docs/AUDIT\_REPORT\_2026-04.md

---

### 🔒 Security (W1-B)
- **`admin/js/services/utils.js`** — escape `message` ใน `showToast()` ด้วย `esc()` เพื่อป้องกัน XSS จาก Supabase error message ที่ contain HTML characters

### ⚡ Performance — C1 Pagination Cap (W2)
- **`admin/js/services/data.js`** — เพิ่ม `SURVEY_FETCH_CAP = 10000` ใน `fetchAllSurveyResponses()` และ `fetchAllSurveyRaw()` คุม memory spike เมื่อ dataset โตขึ้น
- เปลี่ยน `Promise.all` ที่ไม่มี limit เป็น `_batchedFetch()` (max concurrency = 3) เพื่อลด burst request ต่อ Supabase
- ถ้า `rawTotal > SURVEY_FETCH_CAP` จะแสดง warning ใน connection-status bar และ `console.warn`

### 🧹 Code Quality (W1-A)
- **`admin/js/pages/analytics-wb.js`** — ลบ `console.log('[Analytics] surveyRows total:...')` ที่หลุดอยู่ (audit M2 / rule 7)
- **`admin/js/services/data.js`** — ลบ debug `console.log` ใน `summarizeOrgs()` (audit M2 / rule 7)

### 📄 Docs (W1-C, W4)
- ลบ `docs/CURRENT_PROJECT_STATUS.md` — ไฟล์ progress ล้าสมัย (audit rule 7)
- **`README.md`** — แก้ path ผิด: `apps/public-survey/index.html` → `index.html`, routing `/ch1` → `org-portal.html` (ตรงตาม `vercel.json` จริง), ปรับโครงสร้างโปรเจกต์ให้ตรงกับ repo จริง
- **`CHANGELOG.md`** — เพิ่ม entries สำหรับ April 2026 audit fixes (IDP Dashboard, security migrations, Wave 1/2/4)

### 📦 Migrations (ก่อนหน้านี้ — บันทึกย้อนหลัง 2026-04-18 — 2026-04-23)
| Migration | สถานะ | รายละเอียด |
|---|---|---|
| `20260418_harden_survey_update_rls` | ✅ applied | C4 security: แทน survey_update_recent ด้วย draft-only policy |
| `20260418_add_perf_indexes` | ✅ applied | H1: เพิ่ม indexes บน columns ที่ filter บ่อย |
| `20260419_org_dashboard_summary_view` | ✅ applied | H3: view `v_organization_dashboard_summary` |
| `20260420_fix_dashboard_view_security_invoker` | ✅ applied | Hotfix: เพิ่ม `security_invoker=true` |
| `20260421_fix_pre_existing_security_definer_views` | ✅ applied | Phase 5: flip DEFINER views เป็น INVOKER |
| `20260421_phase5_warn_cleanup` | ✅ applied | ลบ duplicate indexes + pin search_path บน 5 functions |
| `20260425_dashboard_kpis_rpc` | ✅ applied | เพิ่ม RPC `get_admin_dashboard_summary` สำหรับ IDP Dashboard |

---

## [2026-04-06] — Update Dashboard, Wellbeing Metrics & Sync Project Changes

**Commit:** `cd3374f`  
**Author:** Patchara  
**Branch:** main  
**Files Changed:** 46 files | +6,789 insertions | -364 deletions

---

### 🗄️ ฐานข้อมูล (Database)

#### Migration ใหม่: ลบคอลัมน์ Legacy CH1
- **ไฟล์:** `supabase/migrations/20260406_drop_legacy_ch1_turnover_transfer_columns.sql`
- ลบคอลัมน์ summary ของ CH1 ที่ไม่ได้ใช้งานแล้ว (turnover/transfer เก่า)
- รักษาโมเดล 5 ปีของการย้ายบุคลากรไว้ครบถ้วน
- จัดการ dependency ของ `ch1_google_sync_queue` view อย่างปลอดภัย
- อัปเดต seed queries ใน `20260319_seed_form_questions.sql`

#### RLS Policy Fix
- **ไฟล์:** `fix-rls-survey-select.sql`
- แก้ไข Row Level Security ของ `survey_responses`
- Admin อ่านข้อมูลได้ทุก row
- Org-HR อ่านข้อมูลของหน่วยงานตนเองได้ (กรองด้วย `org_code`, `org_name_th`, `raw_responses`)
- ป้องกัน conflicting policies โดยลบ policy เก่าก่อนสร้างใหม่

---

### 📊 Admin Dashboard

#### ปรับปรุง Wellbeing Org Metrics
- **ไฟล์:** `admin/js/pages/dashboard.js` (+403 บรรทัด)
- เพิ่มการแสดงผล KPI สุขภาวะแยกตามองค์กร
- ปรับปรุง parallel data fetching สำหรับ wellbeing และ CH1
- เพิ่ม UI สำหรับแสดง org-level metrics ในตาราง dashboard
- ปรับปรุง error handling และ loading states

#### Admin CSS
- **ไฟล์:** `admin/assets/css/admin.css` (+122 บรรทัด)
- เพิ่ม styles สำหรับ dashboard metrics ใหม่
- ปรับปรุง responsive layout ของตาราง

#### Admin Navigation
- **ไฟล์:** `admin/js/services/nav.js` (+6 บรรทัด)
- ปรับปรุง link สำหรับ navigation items

#### CH1 Admin Page
- **ไฟล์:** `admin/js/pages/ch1.js` (+16 บรรทัด)
- ปรับปรุง data loading และ display logic

#### Organizations Page
- **ไฟล์:** `admin/js/pages/organizations.js` (+17 บรรทัด)
- ปรับปรุงการแสดงรายชื่อองค์กร

#### Wellbeing Admin Page
- **ไฟล์:** `admin/js/pages/wellbeing.js` (minor fix)
- แก้ไข edge case ในการโหลดข้อมูล

#### Data Service
- **ไฟล์:** `admin/js/services/data.js` (+50 บรรทัด)
- เพิ่ม helper functions สำหรับดึงข้อมูล wellbeing metrics

---

### 📄 CH1 Form & PDF

#### CH1 Printable View
- **ไฟล์:** `ch1-printable.html` (+457 lines, refactored)
- ปรับปรุง layout PDF รูปแบบใหม่
- รองรับ font ภาษาไทยอย่างถูกต้อง
- เพิ่ม backup versions: `ch1-printable.a55f07c.old.html`, `ch1-printable.a55f07c.raw.html`

#### CH1 All Responses View
- **ไฟล์:** `ch1-all-responses.html` (minor update)
- ปรับปรุง query parameters สำหรับ filter

---

### 🔄 Google Apps Script Sync

#### Column Mapping (ใหม่)
- **ไฟล์:** `apps-script/column-mapping.js` (ไฟล์ใหม่ +197 บรรทัด)
- Map คอลัมน์ฐานข้อมูล → Google Sheet columns
- รองรับ CH1 form ทุก field

#### Google Sync Update
- **ไฟล์:** `apps-script/google-sync.gs` (+227 บรรทัด)
- เพิ่ม sync logic สำหรับ CH1 turnover/transfer data
- ปรับปรุง error handling
- รองรับ column mapping ใหม่

---

### 🌐 Frontend

#### Admin.html
- **ไฟล์:** `admin.html` (refactored, +157/-นำออก)
- ปรับปรุง layout สำหรับ new dashboard sections

#### Org Portal
- **ไฟล์:** `org-portal.html` (minor fix)
- แก้ไข script loading order

#### Force Refresh Utility (ใหม่)
- **ไฟล์:** `force-refresh.html` (+40 บรรทัด)
- Tool สำหรับ clear cache และ force reload ทุก JS/CSS

#### JavaScript Cleanup
- **ไฟล์:** `js/admin-ch1-enhancements.js`, `js/ch1-form.js`, `js/project-ssot.js`
- ลบ dead code และ unused functions รวม ~18 บรรทัด

#### Scripts Cleanup
- **ไฟล์:** `scripts/audit/check-ch1-ready.js`, `scripts/schema-audit.js` และอื่นๆ
- ลบ `console.log` debug statements ที่ไม่จำเป็น

---

### 📝 เอกสาร (Documentation)

| ไฟล์ | คำอธิบาย |
|------|----------|
| `CH1_Columns_Questions_Report.md` | รายงาน mapping คอลัมน์ CH1 ←→ คำถาม (316 บรรทัด) |
| `CH1_Unused_Columns_Report.md` | รายงานคอลัมน์ที่ไม่ได้ใช้งาน (180 บรรทัด) |
| `CURRENT_PROJECT_STATUS.md` | สถานะโปรเจกต์ปัจจุบัน |
| `PROJECT_DOCUMENTATION.md` | เอกสารโปรเจกต์สมบูรณ์ |
| `REACT_VS_VANILLA_COMPARISON.md` | เปรียบเทียบ Tech Stack |
| `UPDATE_REPORT.md` | รายงาน update ฉบับก่อนหน้า |
| `Google_Sync_Fix_Instructions.md` | คู่มือแก้ไข Google Sync |

---

### 📦 Output Files

ไฟล์ผลลัพธ์การ verify org links (23 มีนาคม 2026):
- `output/wb-org-link-verification-2026-03-23T17-46-59-493Z.json`
- `output/wb-org-link-verification-2026-03-23T17-49-06-282Z.json`
- `output/wb-org-link-verification-2026-03-23T17-50-03-133Z.json`
- `output/wb-org-link-verification-2026-03-23T18-03-58-300Z.json`
- `output/wb-org-link-verification-2026-03-23T18-27-43-113Z.json`
- `output/wb-org-link-verification-2026-03-23T18-48-34-521Z.json`

---

## [2026-04-06] — Merge HRD-Plan-Survey + Critical Bug Fixes

**Commits:** `c410f84`, `116946a`, `eadd149`, `e4adddd`, `bf4240b`, `d5faf33`

---

### 🚨 Critical Bug Fix
- **แก้ไข SyntaxError บนหน้า `/admin`** ที่ทำให้หน้าค้างทั้งหมด
- ลบ duplicate JS declarations ~1,814 บรรทัด จาก `admin.html`
- **ไฟล์:** `admin.html`

### 🔐 Authentication
- เพิ่ม timeout 12 วินาที ให้ `requireSession`
- แสดงปุ่ม refresh ตลอดเวลา (ไม่รอ timeout)
- Auto-label session หลัง 10 วินาที

### 🗂️ Service Worker
- Bump cache version → v3.4 เพื่อ invalidate stale JS
- แก้ไข org kpi-sub text

### 📊 Admin Table
- Isolate table scroll (แยก scroll ตาราง)
- Freeze org column (คอลัมน์แรก sticky)
- รองรับ drag/wheel scroll
- ลบปุ่ม detail ที่ไม่จำเป็น
- Parallel data fetching
- Service Worker cache bypass
- 15 วินาที timeout

### 🎨 UI Cleanup
- ลบ hardcoded `admin@ocsc.go.th` จาก sidebar
- ลบ hardcoded badge จาก progress nav item
- Rename `renderAnalytics` → `_renderAnalyticsCh1`
- Cache bust `nav.js` และ `analytics-wb.js`

---

## สถิติภาพรวม

| ตัวชี้วัด | ค่า |
|---------|-----|
| Commits ล่าสุด (เมษายน 2026) | 7 commits |
| Files changed | 46+ files |
| Lines added | ~6,800+ |
| Lines removed | ~2,200+ |
| Supabase migrations ใหม่ | 2 migrations |
| เอกสารใหม่ | 7 ไฟล์ |
| Bug fixes สำคัญ | 3 (SyntaxError, RLS, Auth) |

---

*สร้างอัตโนมัติโดย GitHub Copilot | 6 เมษายน 2026*
