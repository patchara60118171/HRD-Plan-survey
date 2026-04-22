# Project Audit Report — NIDA Wellbeing Survey

**Date:** 2026-04-18
**Last Update:** 2026-04-23 (IDP Dashboard 6-tab implementation complete — commit ec51b58)
**Scope:** Whole project
**Skills applied:** `supabase-postgres-best-practices`, `web-design-guidelines`, `frontend-design`, `ui-ux-pro-max`
**Skills skipped (not applicable):** `vercel-react-best-practices` (vanilla HTML/JS), `pdf`, `remotion-best-practices`

## Progress Tracker

| ID | Status | Notes |
|----|--------|-------|
| C1 | ⏳ deferred | In-memory cache already exists; date-range filter needs schema + UI work |
| C2 | ✅ fixed | `admin/js/services/data.js` — introduced `CH1_FULL_FIELDS`, removed `select('*')` |
| C3 | ✅ fixed | `wellbeing.js:275` escaped; `links.js` inline-onclick fully refactored to `data-*` + delegated handlers (XSS surface removed) |
| C4 | ✅ fixed | `supabase/migrations/20260418_harden_survey_update_rls.sql` — replaced `survey_update_recent` with draft-only + admin/org_hr policies |
| H1 | ✅ fixed | `supabase/migrations/20260418_add_perf_indexes.sql` |
| H2 | ⏳ open | Schema drift — recommend `supabase db dump` → baseline snapshot |
| H3 | ✅ fixed | `supabase/migrations/20260419_org_dashboard_summary_view.sql` — view `v_organization_dashboard_summary` (client switch-over is a follow-up) |
| H4 | ✅ fixed | `js/a11y.js` — auto-upgrades `[onclick]` divs to `role=button` + `tabindex=0` + Enter/Space keydown; injects `:focus-visible` ring |
| H5 | ✅ fixed | `js/a11y.js` — backfills `aria-label` on icon-only buttons using their `title` text |
| H6 | ⏳ open | `admin/js/pages/ch1.js` (114KB) file split — deferred (large mechanical refactor, deserves its own PR) |
| H7 | ✅ fixed | Dev files moved: `debug-ch1.mjs`→`scripts/dev-tools/`, `clear-*.html`/`force-refresh.html`→`dev-tools/`, SQL one-offs→`supabase/one-off/`, `CHART_DESIGNS_REMAINING.html`→`docs/` |
| M1 | ⏳ open | `ADMIN_CANONICAL_ORGS` hardcode — needs DB sync verification first |
| M2 | ✅ fixed | `js/logger.js` — silences `console.log/info/debug` in production |
| M3 | ⏳ open | Loading skeletons — deferred (design task) |
| M4 | ✅ existing | `sw.js` already implements cache-first / network-first / SWR strategies |
| M5 | ✅ partial | `refreshData()` now phased (core→extras) + `_safeRender` wrapping + button disabled during refresh |
| M6 | ✅ partial | QR modal + consent popup (`js/app.js::showConsentPopup`) now have role=dialog + Esc + focus-trap; CH1 detail modal still TODO |
| M14 | ✅ fixed | `js/app.js::submitSurvey` guarded by `_submitting` re-entry flag + next/prev buttons disabled during submission |
| M7 | ⏳ open | Supabase URL/key env injection — requires Vercel build step |
| M8 | ⏳ open | Contrast ratio review — design task |
| M9 | ✅ partial | `_safeRender` wrapping protects per-page render failures in both `init()` and `refreshData()` |
| M10 | ✅ fixed | Duplicate consent paragraphs removed from `index.html` |
| M11 | ⏳ open | `<span lang="en">` wraps — deferred (tedious + marginal impact) |
| M12 | ⏳ open | Timeout progress + cancel — deferred |
| M13 | ⏳ open | `<input type="date">` with BE hint — deferred |
| L1, L2, L3, L6, L8 | ⏳ open | Icon system, font unification, chart tokens, e2e suite, CHANGELOG |
| L4 | ✅ fixed | Mermaid architecture diagram added to `README.md` |
| L5 | ✅ fixed | Consolidated `.env.example` (deleted duplicate `.env.local.example`) |
| L7 | ✅ fixed | `.vercelignore` — blocks dev HTML / error screenshots / debug scripts |

**Migrations applied to production Supabase (2026-04-18):**
1. ✅ `supabase/migrations/20260418_harden_survey_update_rls.sql` (C4 security) — applied as `harden_survey_update_rls`
2. ✅ `supabase/migrations/20260418_add_perf_indexes.sql` (H1 performance) — applied as `add_perf_indexes` (idempotent no-op; indexes already present)
3. ✅ `supabase/migrations/20260419_org_dashboard_summary_view.sql` (H3 aggregation view) — applied as `org_dashboard_summary_view`
4. ✅ `supabase/migrations/20260420_fix_dashboard_view_security_invoker.sql` — hotfix for advisor-flagged `security_definer_view` ERROR on the H3 view (default Supabase view behavior bypassed RLS; now explicit `security_invoker=true`)
5. ✅ `supabase/migrations/20260421_fix_pre_existing_security_definer_views.sql` — Phase 5 Priority 1+2: audit + fix 3 pre-existing DEFINER views. `admin_user_roles_public` + `ch1_google_sync_queue` flipped to INVOKER; `organizations_public` kept as intentional DEFINER exception (required for anon pre-login org list in `js/ch1-form.js`). ERROR count: 3 → 1 (remaining = documented exception).
6. ✅ `supabase/migrations/20260421_phase5_warn_cleanup.sql` — Phase 5 WARN cleanup: (Part A) dropped 3 duplicate indexes on `hrd_ch1_responses` (`idx_hrd_org_submission`, `idx_hrd_org`, `idx_hrd_submitted`); (Part B) pinned `search_path = public, pg_temp` on 5 functions (`requester_email`, `requester_is_org_hr`, `set_ch1_google_sync_defaults`, `set_updated_at_admin_user_roles`, `sync_ch1_to_google_sheets`). Security WARN: 6 → 2 (remaining = `extension_in_public pg_net` platform-level + `auth_leaked_password_protection` dashboard toggle).

**Operational verification (2026-04-19):**
1. ✅ Git state verified: `HEAD` and `origin/main` aligned at `291839d` (`fix(kpi): relax status check - count as submitted if submitted_at exists`)
2. ✅ Vercel live endpoints responded HTTP 200: `/`, `/admin`, `/ch1`, `/org-portal`
3. ✅ Live content markers confirmed for public survey, admin portal, and CH1 form pages
4. ℹ️ `.html` paths (`/admin.html`, `/ch1.html`) return 308 redirect to clean routes on current deployment config

**New features (2026-04-23):**

| Feature | Commit | Status |
|---|---|---|
| IDP Dashboard — 6-tab admin page (ภาพรวม/กาย/ใจ/สังคม/แวดล้อม/รายบุคคล) with 4-dim scoring, Group A-D classification, SVG radar+donut charts, risk profile panel, paginated individual table + Excel export | ec51b58 | ✅ Done |

**Phase 5 backlog (advisor findings):**

| Level | Finding | Status |
|---|---|---|
| ~~ERROR~~ | ~~`security_definer_view` on `admin_user_roles_public`~~ | ✅ Fixed 2026-04-21 (flipped to INVOKER — closed org_hr → all-admins visibility hole) |
| ~~ERROR~~ | ~~`security_definer_view` on `ch1_google_sync_queue`~~ | ✅ Fixed 2026-04-21 (flipped to INVOKER — consumers use service_role, no functional impact) |
| ERROR | `security_definer_view` on `organizations_public` | 📌 **Documented exception** — intentional public-anon feature (non-PII org metadata for CH1 form). Flipping to INVOKER would break anon-form loader. |
| ~~WARN~~ | ~~`duplicate_index` × 3 pairs on `hrd_ch1_responses`~~ | ✅ Fixed 2026-04-21 — dropped `idx_hrd_org_submission`, `idx_hrd_org`, `idx_hrd_submitted`. |
| WARN | `multiple_permissive_policies` on `survey_responses.UPDATE` + 10 other tables | Expected / pre-existing — separate policies for clarity. Accepted. Can be consolidated in future refactor if policy-eval cost becomes material. |
| ~~WARN~~ | ~~`function_search_path_mutable` × 5 functions~~ | ✅ Fixed 2026-04-21 — `SET search_path = public, pg_temp` applied. |
| WARN | `extension_in_public` (pg_net) | Platform-level. Moving requires coordinated change with any Edge Function / trigger using pg_net.http_*. Defer. |
| WARN | `auth_leaked_password_protection` | Supabase dashboard toggle (Auth → Password security). Enable via GUI. |
| INFO | `unindexed_foreign_keys` × 2 | `admin_user_roles.org_code`, `org_form_links.form_id` — add covering indexes when write patterns warrant. Deferred. |
| INFO | `unused_index` × 9 | Mostly low-traffic/freshly-added. Revisit after production load. |

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
