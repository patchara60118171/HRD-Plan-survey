# INTEGRATION CHECKLIST
> Vercel × Supabase × Test Org — ตรวจสอบล่าสุด: 2026-03-18

---

## 🌐 Vercel

| Check | Detail | Status |
|---|---|---|
| Project name | `well-being-survey` | ✅ |
| Production domain | `nidawellbeing.vercel.app` | ✅ |
| Latest deployment | `READY` (production target) | ✅ |
| outputDirectory | `.` (root) | ✅ |
| cleanUrls | `true` | ✅ |
| trailingSlash | `false` | ✅ |
| `/` → `index.html` | served by Vercel default | ✅ |
| `/admin` → `admin.html` | rewrite in vercel.json | ✅ |
| `/ch1` → `ch1.html` | rewrite in vercel.json | ✅ |
| `/admin-login` broken route | **ลบออกแล้ว** (ไฟล์ไม่มี) | ✅ fixed |
| `.env.local` ไม่ถูก deploy | อยู่ใน `.vercelignore` | ✅ |
| `scripts/`, `supabase/`, `backend/` ไม่ deploy | อยู่ใน `.vercelignore` | ✅ |
| `apps/`, `shared/` ไม่ deploy | **เพิ่มเข้า `.vercelignore` แล้ว** | ✅ fixed |

---

## 🗄️ Supabase (Project: `fgdommhiqhzvsedfzyrr`, Region: ap-southeast-2)

### Connection
| Check | Detail | Status |
|---|---|---|
| Project status | `ACTIVE_HEALTHY` | ✅ |
| URL ใน supabase-config.js | `fgdommhiqhzvsedfzyrr.supabase.co` | ✅ |
| Anon key ถูก project | ตรงกับ JWT payload `ref: fgdommhiqhzvsedfzyrr` | ✅ |

### Schema (post all migrations)
| Table | Rows | Key Additions | Status |
|---|---|---|---|
| `organizations` | 21 | `is_test` column | ✅ |
| `admin_user_roles` | 4 | `org_code`, `display_name`, `created_by`; role รองรับ `org_hr` | ✅ |
| `hrd_ch1_responses` | 4 | `round_code`, `status`, lifecycle fields, `org_code` | ✅ |
| `survey_responses` | 0 | unchanged | ✅ |
| `org_form_links` | 34 | test-org links added, CH1 URLs fixed | ✅ |
| `survey_forms` | 2 | `allow_label_edit_by_admin`, `allow_structure_edit_by_admin` | ✅ |
| `form_windows` | 2 | NEW: ch1 + wellbeing windows for round_2569 | ✅ |
| `form_question_overrides` | 0 | NEW: ready for label edits | ✅ |
| `admin_audit_logs` | 0 | unchanged | ✅ |
| `form_configs` | 2 | unchanged (legacy, still functional) | ✅ |

### RLS Functions
| Function | Purpose | Status |
|---|---|---|
| `requester_email()` | email จาก JWT | ✅ |
| `requester_role()` | role จาก admin_user_roles | ✅ |
| `requester_is_admin()` | true ถ้า super_admin หรือ admin | ✅ |
| `requester_is_org_hr()` | true ถ้า org_hr | ✅ **NEW** |
| `requester_org()` | org_code จาก admin_user_roles | ✅ updated |

### RLS Policies
| Table | Policy | Status |
|---|---|---|
| `hrd_ch1_responses` | org_hr เห็นแค่ org ตัวเอง (via org_code) | ✅ updated |
| `hrd_ch1_responses` | org_hr update ได้เฉพาะ status=draft/reopened | ✅ updated |
| `survey_responses` | org_hr เห็นแค่ org ตัวเอง (via organization + org_code) | ✅ updated |
| `admin_user_roles` | admin manage org_hr/admin accounts | ✅ updated |
| `form_windows` | anon/authenticated อ่านได้, admin manage | ✅ NEW |
| `form_question_overrides` | อ่านได้ทุกคน, admin เขียนได้ | ✅ NEW |

---

## 🧪 Test Organization

| Check | Value | Status |
|---|---|---|
| org_code | `test-org` | ✅ |
| org_name_th | `องค์กรทดสอบระบบ` | ✅ |
| is_test | `true` | ✅ |
| is_active | `true` | ✅ |
| Auth user | `hr@test-org.local` (confirmed) | ✅ |
| Role | `org_hr` → `test-org` | ✅ |
| Temp password | `TestOrg2569` | ✅ |
| CH1 draft | `draft` / `round_2569` / `is_test=true` | ✅ |
| Well-being link | `https://nidawellbeing.vercel.app/?org=test-org` | ✅ |
| CH1 link | `https://nidawellbeing.vercel.app/ch1?org=test-org` | ✅ |
| Excluded from prod analytics | `WHERE is_test = false` | ✅ |
| RLS scope simulation | org_hr เห็นแค่ test-org CH1, org อื่น HIDDEN | ✅ |

---

## 🔗 Org Form Links

| Type | Org count | URL Pattern | Status |
|---|---|---|---|
| Well-being | 17 orgs | `nidawellbeing.vercel.app/?org=<code>` | ✅ |
| CH1 | 17 orgs | `nidawellbeing.vercel.app/ch1?org=<code>` | ✅ fixed (เคยใช้ `/ch1.html`) |

---

## 🛣️ Route Map

```
nidawellbeing.vercel.app/              → index.html   (Well-being public survey)
nidawellbeing.vercel.app/ch1           → ch1.html     (CH1 survey)
nidawellbeing.vercel.app/admin         → admin.html   (Admin portal)

nidawellbeing.vercel.app/?org=<code>          → Well-being ขององค์กรนั้น
nidawellbeing.vercel.app/ch1?org=<code>       → CH1 ขององค์กรนั้น
nidawellbeing.vercel.app/?org=test-org        → Well-being ทดสอบ
nidawellbeing.vercel.app/ch1?org=test-org     → CH1 ทดสอบ
```

---

## ⚠️ Known Issues / Follow-up

| Issue | Impact | Priority |
|---|---|---|
| `org_code` ใน `hrd_ch1_responses` ยังเป็น NULL สำหรับ 3 records เดิม | org_hr ที่มี org_code ใหม่จะ fallback ไปใช้ `organization` text match | Medium |
| `survey_responses` ไม่มี `org_code` column ยังอ้างอิงผ่าน `organization` text เท่านั้น | RLS ใช้ org_name_th match (อาจ miss ถ้าชื่อไม่ตรง) | Medium |
| org_code บางตัวใน `organizations` มีทั้ง upper/lower case เช่น `nesdc` vs `NESDC` | อาจเกิด duplicate ในอนาคต | Low |
| Admin portal UI ยังไม่มี user management / form window UI | ต้องทำ phase ถัดไป | Medium |
| smoke-test.js ไม่สามารถรันใน sandbox (fetch restricted) | รันได้จาก local machine เท่านั้น | Info |

---

## 🚀 Quick Test URLs

เปิดใน browser ทดสอบได้ทันที:

```
Well-being (test-org):  https://nidawellbeing.vercel.app/?org=test-org
CH1 (test-org):         https://nidawellbeing.vercel.app/ch1?org=test-org
Admin portal:           https://nidawellbeing.vercel.app/admin
```

Admin login สำหรับ test:
- Email: `hr@test-org.local`
- Password: `TestOrg2569`
- Expected: เห็นเฉพาะข้อมูล test-org เท่านั้น

---

## 📋 Migrations Applied (ทั้งหมด)

```
20250303  update_schema_v3
20250305  update_schema_v4
20250310  add_percentage_fields
20260309  add_test_mode_columns
20260310  add_ch1_yearly_fields
20260313  add_google_sync_fields
20260314  admin_security_hardening
20260314  restore_survey_insert_policy
20260314  add_organization_job_columns_to_survey_responses
20260315  create_form_configs_table
20260315  add_ch1_google_sheets_sync_trigger
20260315  add_training_hours_by_year
20260315  increase_google_sync_timeout_to_30s
20260317  fix_hrd_ch1_rls_email_regex
20260317  add_is_test_to_organizations           ← NEW
20260317  upgrade_admin_user_roles               ← NEW
20260317  ch1_lifecycle_columns                  ← NEW
20260317  create_form_windows                    ← NEW
20260317  create_form_question_overrides         ← NEW
20260317  survey_forms_editor_flags              ← NEW
20260317  update_rls_for_org_hr                  ← NEW
20260317  seed_test_organization                 ← NEW
20260317  seed_test_auth_user                    ← NEW
20260317  seed_test_ch1_draft                    ← NEW
20260318  fix_ch1_link_clean_urls                ← NEW
```
