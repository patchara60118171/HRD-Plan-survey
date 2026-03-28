# 📋 Cowork Handoff — Well-being Survey
> อัปเดต: 2026-03-21 17:30 UTC+7
> สถานะ: Sprint 3B เสร็จแล้ว → รอ Cowork ทำ Backend + Sprint 3C ต่อ

---

## สารบัญ

1. [สรุปสิ่งที่ทำเสร็จแล้ว](#1-สรุปสิ่งที่ทำเสร็จแล้ว)
2. [โครงสร้างไฟล์ปัจจุบัน](#2-โครงสร้างไฟล์ปัจจุบัน)
3. [งาน Cowork ที่ต้องทำ (Supabase)](#3-งาน-cowork-supabase)
4. [งาน Dev ที่เหลือ (Frontend)](#4-งาน-dev-frontend)
5. [ลำดับการทำงาน](#5-ลำดับการทำงาน)
6. [ข้อควรระวัง](#6-ข้อควรระวัง)

---

## 1. สรุปสิ่งที่ทำเสร็จแล้ว

### ✅ Sprint 3A — แยก CSS
| งาน | สถานะ | ไฟล์ |
|------|--------|------|
| Extract inline CSS → external file | ✅ เสร็จ | `admin/assets/css/admin.css` |
| Wire `<link>` ใน admin.html | ✅ เสร็จ | `admin.html` line 13 |

### ✅ Sprint 3B — แยก JS Services
สร้าง 9 service files ใน `admin/js/services/` แล้ว:

| ไฟล์ | บรรทัด | หน้าที่ | Globals ที่ define |
|------|-------:|---------|-------------------|
| `config.js` | 57 | Supabase client, titles, ORG_META, state | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `sb`, `titles`, `ORG_META`, `ORG_NAMES`, `ORG_LOOKUP`, `state` |
| `utils.js` | 215 | esc, fmtDate, scoring, toast, confirm | (functions only) |
| `data.js` | 81 | loadBackend, getOrgCatalog, summarizeOrgs | (functions only) |
| `nav.js` | 47 | go, st, swb + role-based access | (functions only) |
| `auth.js` | 49 | requireSession, renderChrome, logout | (functions only) |
| `users.js` | 678 | User CRUD, modals, password, Org HR batch | (functions only — refs globals from inline) |
| `export.js` | 102 | Excel exports ทุกหน้า | (functions only) |
| `audit.js` | 23 | Audit log export & filter | (functions only) |
| `forms.js` | 229 | Form editor functions | (functions only — refs globals from inline) |

**สถาปัตยกรรมปัจจุบัน:**
```
CDN libs (Supabase, XLSX, QRCode)
  ↓
config.js → shared state & constants (SUPABASE_URL, sb, titles, ORG_META, state)
  ↓
utils/data/nav/auth.js → service functions (ใช้ globals จาก config.js)
  ↓
users/export/audit/forms.js → domain services
  ↓
admin.html inline <script> → page rendering + init()
  + ยังมี constants: SURVEY_BASE_URL, LOCKED_SUPERADMIN_EMAILS, ORG_HR_MAP, etc.
  + ยังมี duplicated function definitions (harmless — inline overrides external)
```

**หมายเหตุ Sprint 3B:**
- `const`/`let` ที่ย้ายไป config.js แล้ว (SUPABASE_URL, sb, titles, ORG_META, ORG_NAMES, ORG_LOOKUP, state) → **ลบออกจาก inline แล้ว** ไม่มี conflict
- Constants ที่ยังอยู่ใน inline (SURVEY_BASE_URL, LOCKED_SUPERADMIN_EMAILS, ORG_HR_MAP, ORG_HR_EMAIL_DOMAIN, FORM_CONFIG_SCHEMAS, _feConfigCache) → external files **ไม่** ประกาศซ้ำ, reference globals เมื่อถูกเรียก
- Function definitions ที่ซ้ำใน inline → harmless (inline load ทีหลัง override) → จะลบใน Sprint 3C

---

## 2. โครงสร้างไฟล์ปัจจุบัน

```
Well-being Survey/
├── admin.html                          ← Main admin portal (5139 lines)
├── admin/
│   ├── assets/css/admin.css            ← ✅ Extracted CSS
│   └── js/services/
│       ├── config.js                   ← ✅ Supabase client + shared state
│       ├── utils.js                    ← ✅ Utility functions
│       ├── data.js                     ← ✅ Data loading
│       ├── nav.js                      ← ✅ Navigation
│       ├── auth.js                     ← ✅ Auth + session
│       ├── users.js                    ← ✅ User management
│       ├── export.js                   ← ✅ Excel exports
│       ├── audit.js                    ← ✅ Audit log
│       └── forms.js                    ← ✅ Form editor
├── supabase/migrations/                ← SQL migrations (ยังไม่ได้รันหลายไฟล์)
│   ├── 20260317_upgrade_admin_user_roles.sql
│   ├── 20260317_create_form_question_overrides.sql
│   ├── 20260317_create_form_windows.sql
│   ├── 20260317_update_rls_for_org_hr.sql
│   ├── 20260319_add_form_questions.sql
│   ├── 20260319_seed_form_questions.sql
│   ├── 20260319_reconcile_schema.sql
│   ├── 20260320_add_initial_password.sql
│   └── 20260320_seed_15_organizations.sql
├── js/form-schema.js                   ← Shared schema loader (สร้างแล้ว)
├── CLAUDE_BACKEND_HANDOFF.md           ← รายละเอียด backend tasks
├── COWORK_PROMPTS.md                   ← Prompts สำหรับ Cowork (copy-paste ได้)
└── DEVELOPMENT_PLAN_REMAINING.md       ← แผนพัฒนาทั้งหมด
```

---

## 3. งาน Cowork ที่ต้องทำ (Supabase) 🔵

> **Prompt ละเอียดอยู่ใน `COWORK_PROMPTS.md`** — copy-paste ส่งให้ Cowork ได้เลย

### 🔴 Priority 1 — SQL Migrations (ต้องทำก่อน)

| # | งาน | ไฟล์ SQL | หมายเหตุ |
|---|------|----------|----------|
| C1 | ตรวจ `requester_is_admin()` function มีหรือยัง | — | ถ้าไม่มีให้สร้าง (ดู COWORK_PROMPTS.md Prompt A) |
| C2 | รัน migration: upgrade admin_user_roles | `20260317_upgrade_admin_user_roles.sql` | เพิ่ม org_code, display_name, created_by |
| C3 | รัน migration: form_question_overrides | `20260317_create_form_question_overrides.sql` | สร้าง table |
| C4 | รัน migration: form_windows | `20260317_create_form_windows.sql` | สร้าง table |
| C5 | รัน migration: RLS for org_hr | `20260317_update_rls_for_org_hr.sql` | RLS policies |
| C6 | รัน migration: form_sections + form_questions | `20260319_add_form_questions.sql` | สร้าง tables + FK + RLS |
| C7 | รัน migration: Seed form questions | `20260319_seed_form_questions.sql` | Seed คำถาม wellbeing + ch1 |
| C8 | รัน migration: Reconcile schema | `20260319_reconcile_schema.sql` | rename label_text→label_th, add is_open |
| C9 | รัน migration: initial_password column | `20260320_add_initial_password.sql` | เพิ่ม column |
| C10 | รัน migration: Seed 15 organizations | `20260320_seed_15_organizations.sql` | Seed 15 org |

**ตรวจหลังรัน:**
```sql
-- ตรวจ tables ครบ
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('form_sections','form_questions','form_question_overrides','form_windows','organizations');

-- ตรวจ seed data
SELECT form_code, COUNT(*) FROM form_questions GROUP BY form_code;
SELECT org_code, org_name_th FROM organizations ORDER BY org_name_th;

-- ตรวจ admin_user_roles columns ครบ
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admin_user_roles' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 🔴 Priority 2 — Edge Function

| # | งาน | หมายเหตุ |
|---|------|----------|
| C11 | ตรวจ Edge Function `set-user-password` มีหรือยัง | ดู Supabase Dashboard → Edge Functions |
| C12 | ถ้ายังไม่มี → Deploy | โค้ดอยู่ใน `COWORK_PROMPTS.md` Prompt B |
| C13 | ทดสอบ create + update actions | curl หรือ Dashboard |

### 🟡 Priority 3 — Seed Data + Verification

| # | งาน | หมายเหตุ |
|---|------|----------|
| C14 | Seed form_windows สำหรับ 15 org | ดู `CLAUDE_BACKEND_HANDOFF.md` ข้อ 3 |
| C15 | สร้าง Auth Users 15 org_hr (ผ่าน Edge Function) | ดู `COWORK_PROMPTS.md` Prompt C |
| C16 | ทดสอบ login org_hr 1-2 org | เข้า admin.html → org_hr เห็นเฉพาะ org ตัวเอง |

### 🟢 Priority 4 — RLS Audit

| # | งาน | หมายเหตุ |
|---|------|----------|
| C17 | ตรวจ RLS status ทุกตาราง | ดู `DEVELOPMENT_PLAN_REMAINING.md` Sprint 4.1 |
| C18 | ระบุตารางที่ยังไม่มี RLS / policy ไม่ครบ | — |
| C19 | รัน migration เพิ่ม policies ที่ขาด (Dev จะเขียนไฟล์ SQL) | — |

**SQL ตรวจ RLS:**
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables WHERE schemaname = 'public';

SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies WHERE schemaname = 'public'
ORDER BY tablename;
```

### 🟢 Priority 5 — Vercel Deployment

| # | งาน | หมายเหตุ |
|---|------|----------|
| C20 | Redeploy Vercel (ไฟล์ใหม่: admin/js/services/*, admin/assets/css/admin.css) | — |
| C21 | ตรวจ routes: `/admin` ยังทำงาน | — |
| C22 | ตรวจ service files โหลดได้ (F12 → Network → ไม่มี 404) | — |

---

## 4. งาน Dev ที่เหลือ (Frontend) 🟢

### Sprint 3C — แยก JS Pages (ยังไม่ทำ)

แยก page rendering functions ออกจาก inline `<script>` ใน admin.html:

| # | ไฟล์ใหม่ | Functions ที่ย้าย |
|---|---------|------------------|
| D1 | `admin/js/pages/dashboard.js` | `renderDashboard` |
| D2 | `admin/js/pages/users.js` | `renderUsers`, `filterUsersTable`, `showAddUserModal`, `showEditUserModal` etc. |
| D3 | `admin/js/pages/organizations.js` | `renderOrgs`, `saveOrgProfile`, `saveSimpleOrg` etc. |
| D4 | `admin/js/pages/links.js` | `renderLinks`, `buildLinkUrl` etc. |
| D5 | `admin/js/pages/wellbeing.js` | `renderWellbeing`, `filterRawData`, `renderRawPage` etc. |
| D6 | `admin/js/pages/ch1.js` | `renderCh1Summary`, `filterCh1`, `showCh1PDF` etc. |
| D7 | `admin/js/pages/settings.js` | `renderSettings`, `saveDeadline`, `saveSettingsGlobal` etc. |

**หลังทำ Sprint 3C:**
- ลบ duplicated function definitions ออกจาก inline script ให้หมด
- ย้าย constants ที่เหลือ (SURVEY_BASE_URL, LOCKED_SUPERADMIN_EMAILS, ORG_HR_MAP etc.) ไปที่ service files
- admin.html inline script เหลือแค่ `init()` + event listeners

### Sprint 1 — Backend Integration (Dev)

| # | งาน | Dependencies |
|---|------|-------------|
| D8 | `ch1.html` — โหลดคำถามจาก DB (FormSchema) + fallback hardcode | ต้องรัน migrations ก่อน (C6-C8) |
| D9 | `index.html` — โหลดคำถามจาก DB + fallback `js/questions.js` | ต้องรัน migrations ก่อน (C6-C8) |
| D10 | Offline sync — `sw.js` + IndexedDB | — |

### Sprint 2 — Admin UI Features (Dev)

| # | งาน | Dependencies |
|---|------|-------------|
| D11 | UI จัดการ form windows (ตารางเวลาเปิด-ปิด) | ต้องมี form_windows table (C4) |
| D12 | UI จัดการ form question overrides | ต้องมี form_questions + overrides (C3, C6-C8) |
| D13 | Audit log — writeAuditLog ในทุก admin action | ต้องมี admin_audit_logs table |
| D14 | i18n — Well-being survey สลับ TH/EN | — |

### Sprint 4 — Testing (Dev + Cowork)

| # | งาน |
|---|------|
| D15 | เขียน RLS migration SQL สำหรับ policies ที่ขาด |
| D16 | Smoke tests (T1-T5) |
| D17 | E2E tests (E1-E5) |

### Sprint 5 — Long-term (ยังไม่ต้องทำ)

| # | งาน |
|---|------|
| D18 | Multi-app structure + vercel.json rewrites |
| D19 | PWA + Mobile responsive improvements |

---

## 5. ลำดับการทำงาน

```
═══════════════════════════════════════════════════════════
  Cowork (Supabase)              Dev (Frontend)
═══════════════════════════════════════════════════════════

  C1-C10: รัน SQL migrations ──→  (รอ Cowork เสร็จ)
         ↓
  C11-C13: Deploy Edge Function    Sprint 3C: แยก JS Pages
         ↓                                ↓
  C14-C16: Seed + สร้าง org_hr     D8-D9: DB integration
         ↓                                ↓
  C17-C19: RLS Audit               D11-D14: Admin UI features
         ↓                                ↓
  C20-C22: Vercel redeploy         D15-D17: Testing
         ↓
       ═══════════════════════════
       Sprint 5: Multi-app (ทีหลัง)
       ═══════════════════════════
```

**งานที่ทำพร้อมกันได้:**
- Cowork รัน migrations ↔ Dev ทำ Sprint 3C (ไม่มี dependency)
- Cowork deploy Edge Function ↔ Dev ทำ Sprint 3C
- Cowork สร้าง org_hr users → Dev ทดสอบ login flow

**งานที่ต้องรอ:**
- D8-D9 (DB integration) ต้องรอ C6-C8 (form_questions migrations) เสร็จก่อน
- D11 (form windows UI) ต้องรอ C4 (form_windows table) เสร็จก่อน
- D12 (question overrides UI) ต้องรอ C3 + C6-C8 เสร็จก่อน
- C15 (สร้าง org_hr users) ต้องรอ C11-C13 (Edge Function) เสร็จก่อน

---

## 6. ข้อควรระวัง

1. **ห้ามลบ** `hrd_ch1_responses` — 12 org มีข้อมูลจริงแล้ว
2. **ห้ามย้าย** `admin.html` ออกจาก root จนกว่าจะเสร็จ Sprint 3C+
3. **ห้ามเปลี่ยน** route `/admin`
4. `auth.admin.createUser` ต้องผ่าน Edge Function เท่านั้น — service_role key ห้าม expose frontend
5. Locked superadmin emails: `['admin@gmail.com']` — ห้ามแก้จาก UI
6. `js/questions.js` + `js/hrd-ch1-fields.js` ยังคงไว้เป็น offline fallback — ห้ามลบ
7. Frontend code รองรับ column เก่า+ใหม่ (ทั้ง `label_text`/`label_th` และ `is_active`/`is_open`) → ถ้ารัน reconcile migration ไม่ครบก็ยังทำงานได้

---

## Quick Reference — เอกสารที่เกี่ยวข้อง

| ไฟล์ | เนื้อหา |
|------|---------|
| `COWORK_PROMPTS.md` | Prompts copy-paste สำหรับ Cowork (7 prompts: A-G) |
| `CLAUDE_BACKEND_HANDOFF.md` | รายละเอียด backend tasks + SQL + Edge Function code |
| `DEVELOPMENT_PLAN_REMAINING.md` | แผนพัฒนาเต็ม Sprint 1-5 |
| `CLAUDE_COWORK_IMPLEMENTATION_BRIEF.md` | Implementation brief |

---

> 📌 **สำหรับ Cowork:** เริ่มจาก `COWORK_PROMPTS.md` → ทำ Prompt A (migrations) ก่อน → แล้วทำ Prompt B-G ตามลำดับ
> 📌 **สำหรับ Dev:** Sprint 3C ทำได้เลยไม่ต้องรอ Cowork (ไม่มี dependency)
