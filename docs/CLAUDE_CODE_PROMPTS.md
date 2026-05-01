# Prompts สำหรับ Claude Code (ต้องใช้ Supabase/Terminal Access)

> ใช้ copy-paste ทีละ prompt ให้ Claude Code ทำ  
> เรียงตาม priority — ทำจากบนลงล่าง

---

## 1. H2 — Schema Baseline Dump (30 นาที)

```
อ่าน CLAUDE.md ก่อนทำงาน

งาน: H2 Schema Baseline — dump production schema เก็บใน repo

ขั้นตอน:
1. รัน: npx supabase db dump --linked > supabase/schema_baseline.sql
   (ถ้าไม่มี supabase CLI ให้ติดตั้ง: npm i -D supabase)
2. ตรวจว่าไฟล์ schema_baseline.sql มีเนื้อหา (ไม่ว่าง)
3. git add supabase/schema_baseline.sql
4. git commit -m "docs(supabase): add schema baseline snapshot (H2)"
5. อัปเดต docs/AUDIT_REPORT_2026-04.md — mark H2 as ✅ done

หมายเหตุ:
- ห้าม modify migration files เก่า (กฎข้อ 2)
- ไฟล์นี้ทำ 1 ครั้ง ใช้เป็น reference สำหรับ recreate DB
```

---

## 2. Wave 5 — Performance Phase 1: RPC Functions (2-3 วัน)

```
อ่าน CLAUDE.md และ docs/TODO_SUMMARY.md ก่อนทำงาน
อ่าน admin/js/services/data.js เพื่อเข้าใจ data layer ปัจจุบัน

งาน: Performance Phase 1 — สร้าง RPC functions ลด dashboard load จาก 15s → <1s

แยก commit ตามกฎข้อ 4 (ห้ามรวม migration + refactor ใน commit เดียว):

### Commit 1: RPC get_admin_dashboard_kpis
- สร้าง migration ใหม่: supabase/migrations/2026MMDD_dashboard_kpis_rpc.sql
- ใช้ mcp1_apply_migration เท่านั้น (กฎข้อ 1)
- RPC ต้อง: SECURITY INVOKER (เคารพ RLS)
- Return: total_responses, total_orgs, avg_tmhi, response_by_org (JSON), latest_response_date
- commit: "feat(rpc): add get_admin_dashboard_kpis"

### Commit 2: RPC get_org_wellbeing_summary
- สร้าง migration: supabase/migrations/2026MMDD_org_wellbeing_summary_rpc.sql
- Return: org_code, org_name, response_count, avg_tmhi, avg_phq9, avg_gad7, avg_burnout
- Group by organization — ลดจาก ~4000 rows เหลือ ~15 rows
- commit: "feat(rpc): add get_org_wellbeing_summary"

### Commit 3: Refactor loadBackendCore() ใช้ KPI RPC
- แก้ admin/js/services/data.js
- เรียก sb.rpc('get_admin_dashboard_kpis') แทน fetch all rows
- คง fallback กรณี RPC fail (ใช้ fetch เดิม)
- ห้ามเพิ่ม console.log (กฎข้อ 7, มี js/logger.js silencer)
- commit: "refactor(data): use dashboard KPI RPC"

### Commit 4: Server-side pagination wellbeing raw
- แก้ renderWellbeingRaw() ใน admin/js/pages/wellbeing.js
- Fetch 50 rows per page แทน 4000+ rows ทั้งหมด
- เพิ่ม prev/next pagination controls
- commit: "feat(wellbeing): server-side pagination for raw table"

หลังทุก commit:
- อัปเดต docs/AUDIT_REPORT_2026-04.md progress tracker (กฎข้อ 6)
- Push → verify Vercel deploy (กฎข้อ 5)
```

---

## 3. M1 — SSOT Org List (1 วัน)

```
อ่าน CLAUDE.md ก่อนทำงาน

งาน: M1 — ลบ ADMIN_CANONICAL_ORGS hardcode ใน data.js, ใช้ DB เป็น SSOT

ขั้นตอน:
1. Query organizations table ใน Supabase → ยืนยันว่ามีครบ 15 org
2. ถ้าครบ:
   - แก้ admin/js/services/data.js: ลบ ADMIN_CANONICAL_ORGS (line 3-19)
   - ให้ getOrgCatalog() ดึงจาก state.orgProfiles โดยตรง (ซึ่งมาจาก DB แล้ว)
   - คง ADMIN_CANONICAL_ORG_CODES และ ADMIN_CANONICAL_ORG_NAMES ให้ derive จาก state แทน
3. คง js/project-ssot.js::orgHrMap ไว้เป็น fallback สำหรับ CH1 form (public, ไม่ login)
4. commit: "refactor(data): use organizations table as SSOT for org list (M1)"
5. อัปเดต docs/AUDIT_REPORT_2026-04.md

ข้อควรระวัง:
- ห้ามแก้/ลบ comment (กฎข้อ 8)
- admin.html onclick handlers ใช้ global functions — ต้องคงชื่อไว้ (กฎข้อ 9)
- ทดสอบว่า org dropdown ใน ch1-table.js / ch1-helpers.js ยังทำงานได้
```

---

## 4. M7 — Supabase Key → Vercel Env Injection (1 วัน)

```
อ่าน CLAUDE.md ก่อนทำงาน — โดยเฉพาะกฎข้อ 3

งาน: M7 — ย้าย Supabase URL + anon key ออกจาก js/supabase-config.js ไปใช้ Vercel env injection

แผน:
1. สร้าง js/supabase-config.template.js ที่ใช้ placeholder:
   const SUPABASE_URL = '__SUPABASE_URL__';
   const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

2. เพิ่ม Vercel build command ใน vercel.json หรือ package.json:
   - Copy template → supabase-config.js
   - Replace placeholders ด้วย env vars

3. ตั้ง Vercel env vars:
   - SUPABASE_URL = https://fgdommhiqhzvsedfzyrr.supabase.co
   - SUPABASE_ANON_KEY = [current anon key from js/supabase-config.js]

4. เพิ่ม js/supabase-config.js ใน .gitignore

5. commit แยก 2 commits:
   - "feat(config): add supabase-config template for env injection (M7)"
   - "chore: add supabase-config.js to gitignore"

6. อัปเดต docs/AUDIT_REPORT_2026-04.md

ข้อควรระวัง:
- anon key เป็น public by design แต่ควรย้ายออกจาก repo
- ต้องทดสอบ local dev ด้วย (อาจต้องมี script สร้าง config จาก .env)
- Push → verify Vercel deploy ทำงานปกติ (กฎข้อ 5)
```

---

## 5. Performance Phase 2 (3-5 วัน) — ทำหลัง Phase 1 เสถียร

```
อ่าน CLAUDE.md และ docs/TODO_SUMMARY.md ก่อนทำงาน

งาน: Performance Phase 2 — Materialized Views + Indexes + Lazy-load

แยก commit:

### Commit 1: Materialized View mv_idp_individual
- Migration: CREATE MATERIALIZED VIEW mv_idp_individual AS ...
- ใช้ mcp1_apply_migration เท่านั้น (กฎข้อ 1)
- commit: "feat(perf): add materialized view mv_idp_individual"

### Commit 2: Cron refresh
- ใช้ pg_cron extension (ถ้ามี) หรือ Supabase Edge Function + cron
- Refresh materialized view ทุก 1 ชม.
- commit: "feat(perf): add cron refresh for mv_idp_individual"

### Commit 3: Composite + Partial indexes
- เพิ่ม indexes บน columns ที่ query บ่อย
- Migration file ใหม่
- commit: "feat(perf): add composite and partial indexes"

### Commit 4: Lazy-load XLSX + html2canvas
- แก้ admin.html: ย้าย <script> ของ XLSX และ html2canvas ให้โหลดแบบ dynamic import
- ลด first load ~400KB+
- commit: "perf(admin): lazy-load XLSX and html2canvas libraries"

### Commit 5: Request deduplication
- เพิ่ม layer ใน data.js ป้องกัน duplicate fetch
- ใช้ Promise cache pattern
- commit: "perf(data): add request deduplication layer"

อัปเดต docs/AUDIT_REPORT_2026-04.md หลังทุก commit
```

---

## 6. L6 — E2E Test Suite (ตามสะดวก)

```
อ่าน CLAUDE.md ก่อนทำงาน

งาน: L6 — เพิ่ม Playwright E2E tests ครอบคลุม CH1 และ admin login

ขั้นตอน:
1. ตรวจ playwright.config.ts ที่มีอยู่
2. เพิ่ม test files:
   - tests/admin-login.spec.ts — login flow, role check
   - tests/ch1-form.spec.ts — CH1 form submission flow
   - tests/admin-ch1-page.spec.ts — CH1 admin page: table render, export, PDF
3. ใช้ test user credentials จาก env vars (ห้าม hardcode)
4. commit: "test(e2e): add Playwright tests for admin login and CH1 (L6)"
5. อัปเดต docs/AUDIT_REPORT_2026-04.md
```

---

## สรุปลำดับ

| # | Task | Priority | ใช้เวลา |
|---|------|----------|---------|
| 1 | H2 Schema Baseline | 🔴 High | 30 นาที |
| 2 | Wave 5 Perf Phase 1 | 🔴 Critical | 2-3 วัน |
| 3 | M1 SSOT Org List | 🟠 High | 1 วัน |
| 4 | M7 Env Injection | 🟠 Medium | 1 วัน |
| 5 | Perf Phase 2 | 🟢 Low | 3-5 วัน |
| 6 | L6 E2E Tests | 🟢 Low | 1-2 วัน |
