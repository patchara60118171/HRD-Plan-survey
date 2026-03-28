# SOURCE OF TRUTH

> Last updated: 2026-03-17
> Phase: Incremental Refactor — target structure created, runtime entry points preserved

---

# 1) Runtime entry points ที่ใช้งานจริงในปัจจุบัน

## Public survey (Well-being)
- `index.html` — **RUNTIME ENTRY (root)**
- `js/app.js`
- `js/questions.js`
- `js/components.js`
- `js/utils.js`
- `css/styles.css`

Route: `/`

## CH1 survey
- `ch1.html` — **RUNTIME ENTRY (root)**
- `js/ch1-form.js`
- `js/pdf-upload.js`
- `js/supabase-config.js`
- `js/loading-states.js`
- `js/rate-limiter.js`
- `js/progress-persistence.js`
- `js/error-tracker.js`
- `js/analytics.js`
- `js/web-vitals.js`
- `js/hrd-ch1-fields.js`

Route: `/ch1`

## Admin portal
- `admin.html` — **RUNTIME ENTRY (root)**

Route: `/admin`

## Deployment / infra
- `vercel.json` — rewrites: `/admin` → `admin.html`, `/ch1` → `ch1.html`
- `supabase/` — DB migrations, functions, policies
- `package.json`

---

# 2) Target structure (migration target — NOT yet runtime)

โฟลเดอร์ `apps/`, `shared/`, `backend/`, `scripts/` ถูกสร้างแล้วใน 2026-03-17
ไฟล์ใน target structure เป็น **copies** เพื่อ reference — ยังไม่ใช่ runtime หลัก

```
apps/public-survey/     ← copy จาก root index.html + js/
apps/ch1-survey/        ← copy จาก root ch1.html + js/
apps/admin-portal/      ← copy จาก root admin.html
shared/config/          ← copy supabase-config.js, config.js
shared/utils/           ← copy utils.js, i18n.js
backend/supabase/       ← copy migrations/, functions/, policies/
scripts/dev|ops|audit|one-off/ ← categorized copies
```

กติกา: อย่าแก้ไฟล์ใน `apps/` โดยตรง ถ้า source of truth ยังอยู่ที่ root
เมื่อย้าย runtime จริง ให้ประกาศใน section 1 ของเอกสารนี้

---

# 3) Supporting files ที่มีบทบาทจริง

## Database / infra / operations
- `supabase/migrations/*` — **migration ที่ apply แล้ว** (อ้างอิงที่นี่)
- `supabase/functions/*`
- `supabase/setup-database.sql`
- `supabase/rls-policies.sql`
- `supabase/storage-policies.sql`
- `supabase/performance-indexes.sql`

## Integration / automation
- `scripts/sync-ch1-google.js` — Google Sheets sync
- `scripts/check-supabase-setup.js` — audit tool
- `scripts/supabase-admin.js` — admin operations
- `apps-script/*` — Google Apps Script

---

# 4) Architecture docs (ปัจจุบัน)

เอกสารเหล่านี้เป็น source of truth สำหรับการออกแบบระบบ:

| File | Purpose |
|---|---|
| `SYSTEM_PLAN.md` | ภาพรวมสถาปัตยกรรม, tech stack, execution phases |
| `ROLE_PERMISSION_MATRIX.md` | Permission ทุก action แยกตาม role |
| `CH1_LIFECYCLE.md` | CH1 state machine, reopen rules, round 2569 |
| `DATA_SCOPE_AND_ACCESS_RULES.md` | RLS rules, org scoping, export rules |
| `CLAUDE_COWORK_IMPLEMENTATION_BRIEF.md` | Original requirements brief |

---

# 5) Database schema (ปัจจุบัน หลัง migrations 2026-03-17)

Tables:

| Table | Status | หมายเหตุ |
|---|---|---|
| `organizations` | ✅ Updated | เพิ่ม `is_test` column |
| `admin_user_roles` | ✅ Updated | เพิ่ม `org_code`, `display_name`, `created_by`; role constraint รองรับ `org_hr` |
| `hrd_ch1_responses` | ✅ Updated | เพิ่ม `round_code`, `status`, lifecycle fields, `org_code` |
| `survey_responses` | ✅ Unchanged | ยังใช้ `organization` text field |
| `org_form_links` | ✅ Unchanged | มี test-org link แล้ว |
| `survey_forms` | ✅ Updated | เพิ่ม `allow_label_edit_by_admin`, `allow_structure_edit_by_admin` |
| `form_windows` | ✅ **NEW** | ตาราง window management สำหรับ CH1 และ Well-being |
| `form_question_overrides` | ✅ **NEW** | Admin-editable question labels |
| `admin_audit_logs` | ✅ Unchanged | Audit trail |
| `form_configs` | ✅ Unchanged | Legacy form config (ยังใช้ได้) |

Migrations ที่ apply แล้ว (2026-03-17):
- `20260317_add_is_test_to_organizations`
- `20260317_upgrade_admin_user_roles`
- `20260317_ch1_lifecycle_columns`
- `20260317_create_form_windows`
- `20260317_create_form_question_overrides`
- `20260317_survey_forms_editor_flags`
- `20260317_update_rls_for_org_hr`
- `20260317_seed_test_organization`

---

# 6) Known fixes

## Admin-login route bug — FIXED
- ✅ ลบ `/admin-login` → `admin-login.html` rewrite ออกจาก `vercel.json` แล้ว
- ไฟล์ `admin-login.html` ไม่มีใน repo — route เดิมจะ 404 ถ้ายังคงอยู่
- ถ้าต้องการ login page แยก: สร้าง `admin-login.html` แล้วเพิ่ม rewrite กลับ

## Routes ที่คงไว้
- `/` → `index.html` (auto by Vercel)
- `/ch1` → `ch1.html` (explicit rewrite)
- `/admin` → `admin.html` (explicit rewrite)

---

# 7) Legacy / candidate for deprecation

## js/modules/* — ยังไม่ใช่ runtime
- `js/modules/admin.js`, `core.js`, `survey.js`, `services.js` ฯลฯ
- Status: **legacy candidate** — ห้ามแก้โดยสมมติว่าเป็น production runtime

## Files ที่ควร cleanup
- `test-hrd-plan.pdf`, `test-org-structure.pdf`, `test-strategy.pdf`
- `fix.js`
- โฟลเดอร์ `แบบสอบถามบท 1/`

---

# 8) กติกาใช้งานเอกสารนี้

- ถ้าจะแก้ **public survey** → แก้ root `index.html` และ `js/app.js`, `js/questions.js`
- ถ้าจะแก้ **CH1** → แก้ root `ch1.html` และ `js/ch1-form.js`
- ถ้าจะแก้ **admin** → แก้ root `admin.html` (source of truth หลัก)
- ถ้าจะแก้ **DB schema** → สร้าง migration ใหม่ใน `supabase/migrations/`
- ถ้าจะแก้ **docs** → แก้ที่ root ก่อน แล้ว sync ไปที่ `docs/` ด้วย
- ห้ามแก้ `apps/*` โดยตรง จนกว่าจะย้าย runtime อย่างเป็นทางการ
