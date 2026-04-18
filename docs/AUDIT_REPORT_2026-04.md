# Project Audit Report — NIDA Wellbeing Survey

**Date:** 2026-04-18
**Last Update:** 2026-04-18 (Phase 1 fixes applied)
**Scope:** Whole project
**Skills applied:** `supabase-postgres-best-practices`, `web-design-guidelines`, `frontend-design`, `ui-ux-pro-max`
**Skills skipped (not applicable):** `vercel-react-best-practices` (vanilla HTML/JS), `pdf`, `remotion-best-practices`

## Progress Tracker

| ID | Status | Notes |
|----|--------|-------|
| C1 | ⏳ deferred | In-memory cache already exists; date-range filter needs schema + UI work |
| C2 | ✅ fixed | `admin/js/services/data.js` — introduced `CH1_FULL_FIELDS`, removed `select('*')` |
| C3 | 🟡 partial | `admin/js/pages/wellbeing.js:275` escaped. `links.js:108-110` inline-onclick quoting flagged for deeper refactor (pass via `data-*` + delegation) |
| C4 | ✅ fixed | `supabase/migrations/20260418_harden_survey_update_rls.sql` — replaced `survey_update_recent` with draft-only + admin/org_hr policies |
| H1 | ✅ fixed | `supabase/migrations/20260418_add_perf_indexes.sql` |
| H2 | ⏳ open | Schema drift — recommend `supabase db dump` → baseline snapshot |
| H3 | ⏳ open | Server-side aggregation view — design task |
| H4-H7 | ⏳ open | Accessibility refactor + file split + repo hygiene |
| M1-M14 | ⏳ open | Most medium items |
| M2 | ✅ fixed | `js/logger.js` — silences `console.log/info/debug` in production |
| M10 | ✅ fixed | Duplicate consent paragraphs removed from `index.html` |
| L1-L8 | ⏳ open | Polish |
| L7 | ✅ fixed | `.vercelignore` — blocks dev HTML / error screenshots / debug scripts |

**Migrations to apply:** deploy these in order to your Supabase project:
1. `supabase/migrations/20260418_harden_survey_update_rls.sql` (security)
2. `supabase/migrations/20260418_add_perf_indexes.sql` (performance)

---

## Executive Summary

ระดับความเสี่ยง: **ปานกลาง-สูง** — โครงสร้างฐานข้อมูลและระบบ auth แข็งแรงพอใช้ แต่มีปัญหาสำคัญด้าน **performance scaling**, **XSS surface**, และ **accessibility** ที่ควรแก้ก่อนขยายผู้ใช้งาน

| หมวด | Critical | High | Medium | Low |
|------|:-:|:-:|:-:|:-:|
| Security | 1 | 2 | 2 | 1 |
| Database / Performance | 2 | 3 | 2 | 1 |
| Frontend Code Quality | 1 | 3 | 4 | 2 |
| Accessibility (WCAG) | 0 | 3 | 3 | 2 |
| UX / Copy | 0 | 1 | 3 | 2 |
| **Total** | **4** | **12** | **14** | **8** |

---

## 🔴 CRITICAL (ต้องแก้ทันที)

### C1. Mass data fetch without pagination ใน admin dashboard
**File:** `admin/js/services/data.js:103-133, 240-244`
**Issue:** `fetchAllSurveyResponses()` fetch ทุก row แบ่งหน้าละ 1000 แต่ไม่มี cap รวม และ `loadBackendExtras` ดึง `hrd_ch1_responses.select('*')` + `org_form_links` ทั้งหมด → เมื่อมีข้อมูล 10k+ rows จะใช้ memory หลายร้อย MB และ TTI พังทันที
**Rule:** `supabase-postgres-best-practices/data-pagination`
**Fix:** ใช้ server-side aggregation (Postgres view/RPC) ส่งเฉพาะ KPI + trend แทนที่จะดึง raw rows ทั้งหมด หรืออย่างน้อยเพิ่ม date-range filter (เช่น 90 วันล่าสุด) เป็น default

### C2. `.select('*')` on JSONB-heavy table
**File:** `admin/js/services/data.js:241`
**Issue:** `sb.from('hrd_ch1_responses').select('*')` ดึง `form_data` JSONB ทั้ง blob ของทุกแถว ทั้งที่แสดงแค่ KPI + latest 10-20 rows
**Rule:** `supabase-postgres-best-practices/query-select-specific-columns`
**Fix:** select เฉพาะ column ที่ใช้; ถ้าต้อง `form_data` ให้ lazy-load ต่อ row เมื่อเปิด detail

### C3. Potential XSS via unescaped template literals
**Files:** ~55 ไฟล์ที่มี `innerHTML =` (231 matches) โดยเฉพาะใน `admin/js/pages/ch1.js` (20), `admin/js/pages/links.js` (12), `org-portal.html` (28)
**Issue:** ข้อมูลจากผู้ใช้/DB (ชื่อองค์กร, อีเมล, HR responses) ถูก inject เป็น template literal สู่ `innerHTML` หลายจุด — บางจุดใช้ `esc()` แต่ไม่ครบทุกจุด
**Rule:** `web-design-guidelines/xss-prevention`
**Fix:** ทำ audit ว่า `innerHTML =` ทุกจุดใน admin/* ใช้ `esc()` ครบ หรือ migrate ไปใช้ `textContent` / DOM API ซึ่งปลอดภัยกว่า

### C4. Anon key exposed ใน client (by design) แต่ RLS ยังอนุญาต public UPDATE
**File:** `supabase/rls-policies.sql:38-51` + `js/supabase-config.js:5-6`
**Issue:** `survey_update_recent` policy อนุญาตให้ anon user update row ที่ submitted ภายใน 24 ชม. แค่ข้าม email check → ใครก็ตามที่รู้ `id` ของ row สามารถเขียนทับข้อมูลผู้อื่นได้
**Rule:** `supabase-postgres-best-practices/security-rls-with-check`
**Fix:** เพิ่ม `USING (email = (current_setting('request.jwt.claims', true)::json ->> 'email'))` หรือบังคับ draft update ผ่าน Edge Function ที่ verify session

---

## 🟠 HIGH PRIORITY

### H1. Missing indexes on frequently filtered columns
**File:** `supabase/performance-indexes.sql`
**Issue:** ไม่มี index บน `hrd_ch1_responses.org_code`, `.status`, `.updated_at` — แต่ admin query เรียง by `updated_at DESC` และ filter by `org_code` เสมอ
**Rule:** `supabase-postgres-best-practices/query-missing-indexes`
**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_ch1_org_code_updated ON hrd_ch1_responses (org_code, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ch1_status ON hrd_ch1_responses (status) WHERE status IN ('draft','submitted');
CREATE INDEX IF NOT EXISTS idx_survey_organization_submitted ON survey_responses (organization, submitted_at DESC) WHERE is_draft = false;
```

### H2. 33 migration files = schema drift risk
**Folder:** `supabase/migrations/` (33 files, หลายไฟล์แก้ gap เดิม)
**Issue:** Migration เช่น `fix_survey_upsert`, `restore_public_survey_write_policies`, `restore_survey_insert_policy` บ่งชี้ว่า policy ถูกแก้ไป-มา → snapshot ปัจจุบันของ DB อาจไม่ตรงกับไฟล์เหล่านี้
**Rule:** `supabase-postgres-best-practices/schema-single-source`
**Fix:** Dump schema จริง (`supabase db dump`) เปรียบเทียบกับ migrations แล้วรวม migration เก่าเป็น baseline snapshot เดียว

### H3. N+1 loop ตอน summarize
**File:** `admin/js/services/data.js:302-399`
**Issue:** `summarizeOrgs()` วน `surveyRows` + `ch1Rows` ใน client หลัง fetch ทั้งหมดมา — ทำได้ใน SQL เดียวด้วย `GROUP BY`
**Rule:** `supabase-postgres-best-practices/data-aggregate-on-server`
**Fix:** สร้าง view `organization_dashboard_summary` ใน Postgres คืน row ต่อ org พร้อม counts

### H4. Accessibility — keyboard navigation & focus states
**Files:** `admin.html`, `ch1.html`, `index.html`
**Issue:** Custom buttons/tabs หลายจุดเป็น `<div onclick>` ไม่ใช่ `<button>` → keyboard users เข้าไม่ถึง; modal/popup ไม่ trap focus
**Rule:** `web-design-guidelines/keyboard-accessible`
**Fix:** แปลงเป็น semantic HTML (`<button>`, `<a>`), เพิ่ม `:focus-visible` ring, ใช้ `inert` บน background เมื่อเปิด modal

### H5. Missing `aria-label` on icon-only buttons
**File:** `admin.html`
**Issue:** `grep -i aria-` พบแค่ 1 match ในไฟล์ 75KB → screen reader users ไม่รู้ context ของปุ่มหลายตัว
**Rule:** `web-design-guidelines/aria-labels`
**Fix:** เพิ่ม `aria-label="ลบ"`, `aria-label="แก้ไข"` ฯลฯ บนปุ่ม icon ทุกตัว

### H6. ไฟล์ admin/js/pages/ch1.js ใหญ่ 114 KB
**File:** `admin/js/pages/ch1.js`
**Issue:** 1 ไฟล์ > 100 KB โหลด blocking parse time บน mobile; maintenance ยาก
**Rule:** `web-design-guidelines/bundle-size`
**Fix:** แยกเป็น `ch1-table.js`, `ch1-export.js`, `ch1-detail-modal.js`, `ch1-charts.js`

### H7. 16 error screenshots + 40 dev-tool scripts committed
**Folder:** root + `scripts/dev-tools/`
**Issue:** error-*.png (16 ไฟล์) และ `test-policy.js`, `debug-ch1.mjs` ที่ root ทำให้ repo รก; อาจรั่วข้อมูลถ้า screenshots มี PII
**Rule:** `web-design-guidelines/repo-hygiene`
**Fix:** ย้าย screenshots → `.gitignore` + ลบออกจาก history ถ้ามี PII; ย้าย dev scripts → `scripts/dev-tools/` ให้หมด

---

## 🟡 MEDIUM PRIORITY

### M1. Hardcoded canonical org list ใน 2 ที่
**File:** `admin/js/services/data.js:3-19` + DB `organizations` table
**Fix:** ลบ array hardcode ใช้จาก DB อย่างเดียว (ตรงกับเป้าหมาย SSOT)

### M2. `console.log` 54 matches ใน production JS
**Fix:** ใช้ build step ตัด console.log หรือสร้าง `logger.js` ที่ปิดเมื่อ `location.hostname !== 'localhost'`

### M3. ไม่มี loading skeleton — เห็นแค่ spinner
**Fix:** ใช้ skeleton ตามรูปแบบ card จริง (tailwind `animate-pulse`)

### M4. No service worker cache strategy ชัดเจน
**File:** `sw.js` (14KB)
**Fix:** ใช้ stale-while-revalidate สำหรับ API, cache-first สำหรับ static

### M5. `refreshData()` ดึงใหม่ทั้งหมด
**File:** `admin/js/app.js:9-34`
**Fix:** แค่ invalidate cache ของหน้าปัจจุบัน

### M6. Modal focus trap ไม่มี
**Files:** `admin.html`, `ch1.html` consent popup
**Fix:** ใช้ `<dialog>` native หรือ focus-trap library

### M7. Supabase URL/Key hardcode — ควรใส่ใน env
**Fix:** ใช้ build-time injection (ใน Vercel) แทน hardcode ใน `supabase-config.js`

### M8. Contrast ratio — สีเทาอ่อนบนพื้นขาว
**File:** `css/styles.css`
**Fix:** ตรวจ WCAG AA (4.5:1) โดยเฉพาะสี `var(--tx2)`, placeholder text

### M9. ไม่มี error boundary / fallback UI
**Fix:** wrap render functions ใน try/catch + แสดง error card ให้ user กด retry

### M10. Duplicate paragraphs ใน consent popup
**File:** `index.html:100-103` — 2 paragraph ซ้ำกัน
**Fix:** ลบ duplicate 1 ชุด

### M11. `<html lang="th">` ถูกต้อง แต่ body mix EN/TH
**Fix:** wrap English labels ใน `<span lang="en">` เพื่อ screen reader

### M12. ค่า timeout 12s session / 15s loader
**File:** `admin/js/services/auth.js:10`, `data.js:244`
**Fix:** แสดง progress indicator + ให้ user กด cancel ได้

### M13. Date picker ไม่แสดง Thai/Buddhist era ใน input
**File:** `admin/js/app.js:131-134`
**Fix:** มี `id+'-be'` label อยู่แล้ว แต่ควรใช้ `<input type="date">` + formatter + hint text

### M14. ไม่มี rate limiting ฝั่ง client ก่อน submit
**Fix:** debounce submit button, ปิดหลัง click แรก

---

## 🟢 LOW PRIORITY

### L1. Emoji icons แทนที่จะใช้ icon system
**Files:** ทั่วโปรเจค (🔒, 📊, ฯลฯ)
**Fix:** ใช้ Lucide icons (มีใน memory บอกว่าใช้ React+Lucide เป็นแนวทาง) — สำหรับ vanilla ใช้ inline SVG

### L2. ฟอนต์ 2 ตระกูลต่างกันระหว่าง pages
**Files:** `index.html` ใช้ IBM Plex Sans Thai Looped; memory บอก admin ใช้ Sarabun
**Fix:** เลือก 1 system font family

### L3. Chart colors ไม่มี design token
**Fix:** สร้าง `--chart-1` ถึง `--chart-8` ใน CSS

### L4. README 14KB แต่ไม่มี architecture diagram
**Fix:** เพิ่ม Mermaid diagram แสดง flow `form → Supabase → admin → export`

### L5. `.env.example` + `.env.local.example` + `.env.local` — 3 ไฟล์ confusing
**Fix:** รวมเหลือ `.env.example` + `.env.local` (gitignored)

### L6. ไม่มี e2e test (มีแค่ playwright-autotest-3orgs.js เดี่ยว)
**Fix:** ย้ายไปใน `tests/e2e/` + ตั้ง CI

### L7. `clear-all-caches.html`, `clear-cache.html`, `force-refresh.html` = dev tools ที่ deploy จริง
**Fix:** ใส่ใน `.vercelignore` หรือ protect ด้วย auth

### L8. CHANGELOG ไม่ update ตั้งแต่ schema v4
**Fix:** update ทุก release

---

## แผนการแก้ไขที่แนะนำ (phased)

**Phase 1 — Security & Data (สัปดาห์นี้):** C1, C2, C3, C4, H1
**Phase 2 — Performance (สัปดาห์หน้า):** H2, H3, H6, M4, M5
**Phase 3 — Accessibility (2 สัปดาห์):** H4, H5, M6, M8, M11
**Phase 4 — Code quality & UX polish:** ที่เหลือทั้งหมด

---

## ไฟล์ที่ควรลบ/จัดเก็บ

**ลบออกจาก root:**
- `error-*.png` (16 ไฟล์) → ย้ายไป `docs/debug-screenshots/` หรือลบ
- `debug-ch1.mjs`, `test-policy.js`, `playwright-autotest-3orgs.js` → `scripts/dev-tools/`
- `CHART_DESIGNS_REMAINING.html` → `docs/` หรือลบถ้าไม่ใช้

**ย้าย:**
- `SQL_DATA_AUDIT.sql`, `fix-rls-survey-select.sql` → `supabase/migrations/` หรือ `supabase/one-off/`

---

_Audit generated using skills: `.agents/skills/{supabase-postgres-best-practices,web-design-guidelines,frontend-design,ui-ux-pro-max}`_
