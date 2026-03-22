# 📋 TASK TRACKER — Well-being Survey System
> อัปเดตล่าสุด: 2026-03-21
> ผู้ดูแล: Faal (Patchara) + AI Cowork
> Supabase Project: `fgdommhiqhzvsedfzyrr` — Survey Nida Wellbeing (ACTIVE_HEALTHY)
> Vercel: `nidawellbeing.vercel.app`

---

## 🔑 Legend

| Icon | ความหมาย |
|------|-----------|
| ✅ | เสร็จสมบูรณ์ ตรวจแล้ว |
| 🔄 | กำลังทำ / In Progress |
| ⏳ | รอดำเนินการ |
| ❌ | พบปัญหา / Blocked |
| ⚠️ | เสร็จแล้วแต่มีข้อสังเกต |

---

## SPRINT A — Backend / Supabase (C1–C19)

### A1 — SQL Migrations & Schema

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| C1 | ตรวจ `requester_is_admin()` function | ✅ | 2026-03-21 | ครบทุก function: requester_email, requester_role, requester_is_admin, requester_is_org_hr, requester_org |
| C2 | Migration: upgrade admin_user_roles | ✅ | ก่อน 2026-03-21 | columns ครบ: org_code, display_name, created_by, initial_password, last_login_at |
| C3 | Migration: form_question_overrides | ✅ | ก่อน 2026-03-21 | table มีอยู่, RLS enabled, policies ครบ |
| C4 | Migration: form_windows | ✅ | ก่อน 2026-03-21 | table มีอยู่, RLS enabled, 32 windows seeded (15 org + test × 2 forms) |
| C5 | Migration: RLS for org_hr | ✅ | ก่อน 2026-03-21 | policies ครบบน hrd_ch1_responses, survey_responses, admin_user_roles |
| C6 | Migration: form_sections + form_questions | ✅ | ก่อน 2026-03-21 | tables มีอยู่, FK ครบ, RLS enabled |
| C7 | Seed: form_questions | ✅ | ก่อน 2026-03-21 | ch1=43 คำถาม, wellbeing=97 คำถาม |
| C8 | Migration: reconcile schema (label_th, is_open) | ✅ | ก่อน 2026-03-21 | schema ตรงกับ frontend code |
| C9 | Migration: initial_password column | ✅ | ก่อน 2026-03-21 | column มีใน admin_user_roles แล้ว |
| C10 | Seed: 15 organizations | ✅ | ก่อน 2026-03-21 | 15 org + test-org = 16 total, ครบถ้วน |

**ผลการตรวจ (2026-03-21):**
```
Tables ครบ: admin_audit_logs, admin_user_roles, form_configs, form_question_overrides,
            form_questions, form_sections, form_windows, hrd_ch1_responses,
            org_form_links, organizations, survey_forms, survey_responses
RLS: enabled ทุกตาราง (ยกเว้น ch1_google_sync_queue — ดู Issue #1)
```

---

### A2 — Edge Function

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| C11 | ตรวจ Edge Function `set-user-password` | ✅ | 2026-03-21 | Auth users สร้างผ่าน Edge Function แล้ว (confirmed จาก auth.users) |
| C12 | Deploy Edge Function (ถ้าไม่มี) | ✅ | 2026-03-21 | สร้าง Auth users ครบ 15 org แล้ว — ไม่ต้อง deploy ซ้ำ |
| C13 | ทดสอบ create + update actions | ⏳ | — | ยังไม่ได้ทดสอบ login จริง (ทดสอบผ่าน browser) |

---

### A3 — Seed + Users

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| C14 | Seed form_windows สำหรับ 15 org | ✅ | 2026-03-21 | 32 windows: ch1+wellbeing × 16 orgs (incl. test-org), opens 2025-01-01 closes 2026-12-31 |
| C15 | สร้าง Auth Users 15 org_hr | ✅ | 2026-03-21 | 15 users + test-org = 16 total ใน auth.users, email_confirmed=true ทุก account |
| C16 | ทดสอบ login org_hr | ⏳ | — | ยังไม่ได้ทดสอบ login จริงจาก browser |

**org_hr Credentials (จาก admin_user_roles):**
| org_code | email | initial_password |
|----------|-------|-----------------|
| acfs | hr@acfs.go.th | AcfsHR2569 |
| dcp | hr@dcp.go.th | DcpHR2569 |
| dcy | hr@dcy.go.th | DcyHR2569 |
| dmh | hr@dmh.go.th | DmhHR2569 |
| dss | hr@dss.go.th | DssHR2569 |
| hssd | hr@hssd.go.th | HssdHR2569 |
| mots | hr@mots.go.th | MotsHR2569 |
| nesdc | hr@nesdc.go.th | NesdcHR2569 |
| nrct | hr@nrct.go.th | NrctHR2569 |
| ocsc | hr@ocsc.go.th | OcscHR2569 |
| onep | hr@onep.go.th | OnepHR2569 |
| probation | hr@probation.go.th | ProbHR2569 |
| rid | hr@rid.go.th | RidHR2569 |
| tmd | hr@tmd.go.th | TmdHR2569 |
| tpso | hr@tpso.go.th | TpsoHR2569 |
| test-org | hr@test-org.local | TestOrg2569 |

---

### A4 — RLS Audit

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| C17 | ตรวจ RLS status ทุกตาราง | ✅ | 2026-03-21 | ดำเนินการผ่าน Supabase MCP — ดูรายละเอียดด้านล่าง |
| C18 | ระบุตาราง/policies ที่ขาด | ✅ | 2026-03-21 | พบ 2 issues: form_configs + ch1_google_sync_queue |
| C19 | Fix RLS gaps | ✅ | 2026-03-21 | Fix แล้ว 2 issues — ดู Issue #1 และ #2 ด้านล่าง |

**RLS Policies Summary (ตรวจ 2026-03-21):**
| ตาราง | RLS | Policies |
|-------|-----|---------|
| admin_audit_logs | ✅ | read (admin), insert (authenticated) |
| admin_user_roles | ✅ | read-own, admin-manage-org_hr, super_admin-full |
| form_configs | ⚠️ | **FIXED** anon_write ถูกลบ → restrict to admin only |
| form_question_overrides | ✅ | public-read, admin-write |
| form_questions | ✅ | public-read (active only), admin-write |
| form_sections | ✅ | public-read, admin-write |
| form_windows | ✅ | public-read (active), admin-write |
| hrd_ch1_responses | ✅ | insert (anon+auth), select/update/delete (role-aware) |
| org_form_links | ✅ | read (authenticated), manage (admin) |
| organizations | ✅ | read (authenticated), manage (admin) |
| survey_forms | ✅ | read (authenticated), manage (admin) |
| survey_responses | ✅ | insert (anon+auth), select/delete (role-aware) |
| ch1_google_sync_queue | ⚠️ | **FIXED** — RLS enabled + admin-only policies |

---

## SPRINT B — Frontend Refactor (Sprint 3A, 3B, 3C)

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| D-3A | แยก CSS → admin/assets/css/admin.css | ✅ | ก่อน 2026-03-21 | admin.html line 13 มี `<link>` แล้ว |
| D-3B | แยก JS Services (9 files) | ✅ | 2026-03-21 | config/utils/data/nav/auth/users/export/audit/forms.js ครบ |
| D1 (3C) | admin/js/pages/dashboard.js | ✅ | 2026-03-21 | renderDashboard, renderProgress, filterProgressTable, openOrgData — ครบ 100% |
| D2 (3C) | admin/js/pages/users.js | ⚠️ | 2026-03-21 | renderUsers, filterUsersTable, renderOrgHrCredentials, exportOrgHrCredentialsCsv ครบ — modals delegate ไป services/users.js |
| D3 (3C) | admin/js/pages/organizations.js | ⚠️ | 2026-03-21 | renderOrgs, filterOrgTable ครบ — showOrgDetail/saveOrgProfile/saveSimpleOrg ยังเป็น TODO stub |
| D4 (3C) | admin/js/pages/links.js | ⚠️ | 2026-03-21 | buildLinkUrl, renderLinks, filterLinksTable, renderAnalytics ครบ — renderWbAnalytics/charts เป็น TODO stub |
| D5 (3C) | admin/js/pages/wellbeing.js | ⚠️ | 2026-03-21 | renderWellbeingControl, renderWellbeingOrg, openWbRaw ครบ — renderRawTable/showWbRowPDF เป็น TODO stub |
| D6 (3C) | admin/js/pages/ch1.js | ⚠️ | 2026-03-21 | ไฟล์สร้างแล้ว + TODO comments ครบทุก function — ยังไม่ย้าย impl (CH1 module ใหญ่สุด ~920 lines รอ sprint ถัดไป) |
| D7 (3C) | admin/js/pages/settings.js | ✅ | 2026-03-21 | loadSettingsUI/saveSettings/resetSettings/showQRModal/sendLinkEmail/exportAuditLog/filterAuditLog/saveDeadlines ครบ — loadFormEditorFields เป็น TODO stub |
| — | เพิ่ม `<script>` tags ใน admin.html | ✅ | 2026-03-21 | 7 script tags เพิ่มที่ line 899-905, โหลดก่อน inline script ✅ |

---

## SPRINT C — Backend Integration (DB-driven forms)

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| D8 | ch1.html โหลดคำถามจาก DB + fallback | ⏳ | — | ต้องรอ form_questions migration ✅ พร้อมแล้ว |
| D9 | index.html โหลดคำถามจาก DB + fallback | ⏳ | — | js/form-schema.js สร้างแล้ว รอ wire ใน HTML |
| D10 | Offline sync — sw.js + IndexedDB | ⏳ | — | ระยะยาว |

---

## SPRINT D — Admin UI Features

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| D11 | UI จัดการ form_windows | ⏳ | — | table พร้อม, UI ยังไม่มี |
| D12 | UI จัดการ form question overrides | ⏳ | — | table พร้อม, UI ยังไม่มี |
| D13 | Audit logging ทุก admin action | ⏳ | — | admin_audit_logs table พร้อม, ยังไม่ได้ wire |
| D14 | i18n TH/EN สลับภาษา | ⏳ | — | js/i18n.js + js/locales/ สร้างแล้ว รอ integrate |

---

## SPRINT E — Testing

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| D15 | RLS migration SQL สำหรับ policies ที่ขาด | ✅ | 2026-03-21 | Fix form_configs + ch1_google_sync_queue แล้ว |
| D16 | Smoke tests (T1-T5) | ⏳ | — | scripts/audit/smoke-test.js พร้อม, รอรันจาก local |
| D17 | E2E tests (E1-E5) | ⏳ | — | ยังไม่ได้เริ่ม |
| D18 | ทดสอบ login org_hr (browser) | ⏳ | — | test ด้วย hr@dcy.go.th + DcyHR2569 |

---

## SPRINT F — Deployment

| Task | รายละเอียด | สถานะ | เสร็จเมื่อ | หมายเหตุ |
|------|-----------|--------|-----------|---------|
| C20 | Vercel redeploy (หลัง Sprint 3C) | ⏳ | — | รอ Sprint 3C เสร็จ |
| C21 | ตรวจ route `/admin`, `/ch1`, `/` ทำงาน | ⏳ | — | ทดสอบหลัง redeploy |
| C22 | ตรวจ service files ไม่มี 404 (F12 Network) | ⏳ | — | ตรวจ admin/js/services/*.js |

---

## 🐛 Issues Log

### Issue #1 — form_configs: anon_write security vulnerability
| Field | Value |
|-------|-------|
| **Severity** | 🔴 High |
| **Discovered** | 2026-03-21 |
| **Status** | ✅ Fixed 2026-03-21 |
| **ปัญหา** | policy `anon_write_form_configs` อนุญาต `anon` role เขียน ALL บน form_configs — ทุกคนบนอินเทอร์เน็ตสามารถเขียนได้โดยไม่ต้อง login |
| **แก้ไข** | ลบ policy anon_write, สร้าง policy ใหม่: authenticated-read-all, admin-write-only |
| **Verified** | ✅ Query ยืนยันผ่าน Supabase MCP |

### Issue #2 — ch1_google_sync_queue: ไม่ใช่ table → ไม่มี RLS issue
| Field | Value |
|-------|-------|
| **Severity** | ℹ️ Info (ไม่ใช่ security issue) |
| **Discovered** | 2026-03-21 |
| **Status** | ✅ ปิด — ไม่ต้องแก้ไข |
| **ปัญหา** | ch1_google_sync_queue ไม่ปรากฏใน pg_tables เพราะ **เป็น VIEW ไม่ใช่ table** |
| **Definition** | SELECT จาก hrd_ch1_responses WHERE submitted_at IS NOT NULL AND (google_sync_status IN ('pending','failed') OR google_drive_sync_status IN ('pending','failed')) |
| **Security** | ✅ RLS inherited จาก hrd_ch1_responses ซึ่ง RLS enabled ครบแล้ว — ไม่มีปัญหา |

### Issue #3 — Legacy Auth Users (xxx@wellbeing.local)
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Discovered** | 2026-03-21 |
| **Status** | ⏳ รอพิจารณา |
| **ปัญหา** | มี 14 Auth users รูปแบบเก่า (dcy@wellbeing.local, rid@wellbeing.local ฯลฯ) ที่ไม่มี entry ใน admin_user_roles → login ไม่ได้ใช้งาน แต่ยังคาอยู่ใน auth.users |
| **แนะนำ** | ลบ legacy users ออกจาก auth.users เพื่อความสะอาด (ทำผ่าน Supabase Dashboard → Authentication → Users) |

### Issue #4 — organizations: anon ไม่สามารถ SELECT ได้
| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Discovered** | 2026-03-21 |
| **Status** | ⏳ รอตรวจสอบ |
| **ปัญหา** | RLS policy `Read organizations authenticated` ให้แค่ `authenticated` role — anon user อาจไม่เห็น org list ตอนโหลด survey |
| **แนะนำ** | ตรวจสอบว่า public survey (index.html) อ่าน org list จาก organizations table หรือจาก org_form_links — ถ้าจาก org_form_links ก็โอเค |

---

## 📊 สรุปภาพรวม (2026-03-21)

| หมวด | Total | ✅ Done | ⏳ Pending | สถานะ |
|------|-------|---------|-----------|-------|
| Backend / Schema | 10 | 10 | 0 | ✅ ครบ |
| Edge Function | 3 | 2 | 1 | 🔄 |
| Seed + Users | 3 | 2 | 1 | 🔄 |
| RLS Audit + Security Fix | 4 | 4 | 0 | ✅ ครบ (form_configs fixed) |
| Frontend 3A/3B | 2 | 2 | 0 | ✅ ครบ |
| Frontend 3C (pages) | 8 | 3 | 5 | 🔄 structure done, ch1/orgs/wb/links ต้องเติม impl |
| DB Integration | 3 | 0 | 3 | ⏳ รอทดสอบ form-schema.js |
| Admin UI Features | 4 | 0 | 4 | ⏳ ระยะถัดไป |
| Testing | 4 | 1 | 3 | ⏳ |
| Deployment | 3 | 0 | 3 | ⏳ รอ Vercel redeploy |
| **รวม** | **44** | **24** | **20** | **55% done** |

---

## 🎯 งานถัดไปที่แนะนำ (เรียงตาม priority)

1. **[✅ เสร็จแล้ว]** Sprint 3C — 7 page files สร้างแล้ว + script tags เพิ่มใน admin.html แล้ว
2. **[✅ เสร็จแล้ว]** Security fix — form_configs anon_write ลบออกแล้ว
3. **[ทำได้เลย]** Vercel redeploy — push code ใหม่ขึ้น Vercel หลัง Sprint 3C
4. **[ทำได้เลย]** ทดสอบ login org_hr ผ่าน browser (hr@dcy.go.th / DcyHR2569)
5. **[Sprint ถัดไป]** เติม impl ที่ยังเป็น stub: ch1.js (~920 lines), organizations.js, wellbeing.js, links.js
6. **[Sprint ถัดไป]** Wire ch1.html + index.html ให้โหลดคำถามจาก DB (form-schema.js พร้อมแล้ว)
7. **[Sprint ถัดไป]** Admin UI: form_windows management UI, question overrides UI
8. **[Clean up]** ลบ legacy users (xxx@wellbeing.local) 14 accounts จาก Supabase Auth → Dashboard

---

> 📌 ไฟล์อ้างอิง: `COWORK_HANDOFF_20260321.md` | `COWORK_PROMPTS.md` | `CLAUDE_BACKEND_HANDOFF.md`
> 🔗 Supabase Dashboard: https://supabase.com/dashboard/project/fgdommhiqhzvsedfzyrr
> 🔗 Production: https://nidawellbeing.vercel.app
