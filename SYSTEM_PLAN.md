# SYSTEM_PLAN.md

> Last updated: 2026-03-17
> Status: Active — incremental refactor phase

---

## Objective

Well-being Survey System คือแพลตฟอร์มสำรวจสุขภาวะสำหรับองค์กรภาครัฐ ประกอบด้วย 2 แบบสำรวจหลัก:

- **Well-being Survey** — แบบสำรวจสุขภาวะรายบุคคล (ไม่ต้อง login)
- **CH1 Survey** — แบบสำรวจ HRD บทที่ 1 สำหรับ HR ขององค์กร (มี auth)

ระบบรองรับองค์กรจริง 15+ แห่ง และ 1 องค์กรทดสอบ (`test-org`)

---

## Current Runtime Files (Source of Truth)

| App | Entry File | Route |
|---|---|---|
| Well-being Survey | `index.html` | `/` |
| CH1 Survey | `ch1.html` | `/ch1` |
| Admin Portal | `admin.html` | `/admin` |

**ห้ามย้าย entry points เหล่านี้จนกว่าจะมีแผน migration อย่างเป็นทางการ**

---

## Target Architecture

```
apps/
  public-survey/       # Well-being survey runtime
  ch1-survey/          # CH1 survey runtime
  admin-portal/        # Admin portal runtime

shared/
  config/              # Supabase config, routes, constants
  ui/                  # Shared UI components
  utils/               # Shared helpers

backend/
  supabase/
    migrations/        # Database migrations (DDL)
    functions/         # Edge functions
    policies/          # RLS SQL files (reference)
    seeds/             # Seed data

scripts/
  dev/                 # Local dev helpers, seed scripts
  ops/                 # Operational scripts (sync, etc.)
  audit/               # Schema audits, readiness checks
  one-off/             # One-time fix scripts (risky, document before run)
```

Migration กำลังดำเนินการแบบ incremental ไม่ rewrite ทั้งระบบทีเดียว

---

## Role Model

| Role | Scope | Key Permissions |
|---|---|---|
| `super_admin` | Global | Full access, manage structure, manage all users |
| `admin` | Global | Manage users, edit labels, manage windows, view all orgs |
| `org_hr` | Single org | Fill CH1, view own org data, export own org data |

ดู `ROLE_PERMISSION_MATRIX.md` สำหรับรายละเอียด permission ทุกตาราง/action

---

## Key Business Rules

### Well-being Survey
- ผู้ตอบเป็นบุคลากรทั่วไป ไม่ต้อง login
- องค์กรถูกกำหนดผ่านลิงก์เฉพาะ (`org_code` embed ใน URL / token)
- ไม่มี org selection dropdown ในฟอร์มสาธารณะ
- `org_hr` เห็นเฉพาะ raw data ขององค์กรตัวเอง

### CH1 Survey
- กรอกโดย `org_hr` หรือ `admin` (แทนองค์กร)
- **1 องค์กร = 1 submission ต่อ round** (`round_2569` สำหรับ phase นี้)
- Reopen/edit อัปเดต submission เดิม ไม่สร้างใหม่
- Lifecycle: `draft` → `submitted` → `reopened` → `locked`

### Test Organization
- `org_code = 'test-org'`, `is_test = true`
- รองรับทั้ง Well-being และ CH1 flow
- **ไม่นับรวมใน official analytics โดย default**
- Filter: `WHERE is_test = false` ในทุก production report

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Deployment | Vercel (static hosting) |
| Integration | Google Sheets / Drive via Apps Script |

---

## Deployment

- Host: Vercel
- Config: `vercel.json`
- Routes ที่ต้องคงไว้เสมอ: `/`, `/ch1`, `/admin`
- Static assets: `/js/`, `/css/`, `/assets/`

ดู `DEPLOYMENT.md` สำหรับรายละเอียด

---

## Database Overview

Tables หลัก:

| Table | Purpose |
|---|---|
| `organizations` | รายชื่อองค์กร (is_test flag) |
| `admin_user_roles` | User accounts + roles (super_admin, admin, org_hr) |
| `hrd_ch1_responses` | CH1 submissions (lifecycle: status, round_code) |
| `survey_responses` | Well-being individual responses |
| `org_form_links` | Per-org survey links |
| `survey_forms` | Form registry + editor permission flags |
| `form_windows` | Open/close/edit time window per form+round |
| `form_question_overrides` | Admin-editable question labels |
| `admin_audit_logs` | Audit trail |

---

## Execution Phases

### Phase 1 (Current) — Schema + Role Model
- [x] Add `is_test` to organizations
- [x] Add `org_hr` role support + `org_code` to admin_user_roles
- [x] CH1 lifecycle columns (status, round_code, locked_at, reopened_at)
- [x] `form_windows` table
- [x] `form_question_overrides` table
- [x] Updated RLS policies for org_hr
- [x] Seed test-org

### Phase 2 — Admin Portal Modularization
- [ ] Extract admin CSS to external file
- [ ] Extract admin JS services to modules
- [ ] Move files toward `apps/admin-portal/` structure

### Phase 3 — Feature Completion
- [ ] Admin UI: user management (create/deactivate/reset password)
- [ ] Admin UI: form window management
- [ ] Admin UI: org_hr scoped dashboard
- [ ] org_hr: raw data export (own org)
- [ ] form_question_overrides: admin label editing UI

### Phase 4 — Hardening
- [ ] Smoke tests
- [ ] Full RLS audit
- [ ] Org_code backfill on existing submissions
- [ ] Production analytics filters confirmed
