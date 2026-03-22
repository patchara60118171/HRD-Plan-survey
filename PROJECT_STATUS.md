# PROJECT STATUS
> Well-being Survey System — อัปเดตล่าสุด: 2026-03-22 (session 3)

---

## ✅ สรุปสถานะโดยรวม

| หมวด | สถานะ | หมายเหตุ |
|---|---|---|
| Supabase Schema | ✅ สมบูรณ์ | Migrations ครบ 30+ รายการ |
| RLS & Role Security | ✅ สมบูรณ์ | org_hr scoped, super_admin protected |
| Vercel Deployment | ✅ สมบูรณ์ | cleanUrls, rewrites ครบ incl. /ch1-form /ch1-preview /ch1-individual-pdf |
| Admin Portal UI | ✅ สมบูรณ์ | login overlay, role-aware nav, org scoping |
| Test Organization | ✅ พร้อม | test-org / hr@test-org.local / TestOrg2569 |
| CH1 Lifecycle | ✅ พร้อม | round_2569, status draft→submitted→locked |
| Well-being Public Form | ✅ ทำงาน | per-org links, anonymous |
| SSOT (project-ssot.js) | ✅ สมบูรณ์ | sectionsOrder static (8), api.js no raw-table fallback, consumer files cleaned |
| CH1 Org-Portal Files | ✅ ตรวจแล้ว | ch1-edit/preview/pdf.html: org param + cross-org guard + error handling ครบ |

---

## 🗂️ โครงสร้างไฟล์ (เทียบกับบรีฟ)

```
Well-being Survey/
├── index.html          ← Well-being public survey (runtime entry)
├── ch1.html            ← CH1 survey (runtime entry)
├── admin.html          ← Admin portal (runtime entry)
├── vercel.json         ← Route rewrites + cleanUrls
├── supabase-config.js  ← Supabase client config
│
├── apps/               ← Reference copies (NOT deployed, .vercelignore)
│   ├── public-survey/  ← index.html reference
│   ├── ch1-survey/     ← ch1.html reference
│   └── admin-portal/   ← admin.html reference
│
├── shared/             ← Shared utilities (NOT deployed)
├── backend/            ← Edge functions / server logic (NOT deployed)
│
├── supabase/
│   └── migrations/     ← 30+ migration files ✅
│
├── scripts/
│   ├── dev/            ← Development helpers
│   ├── ops/            ← Ops scripts (reset password, etc.)
│   ├── audit/          ← smoke-test.js
│   └── one-off/        ← One-time data scripts
│
└── docs/
    ├── deployment/INTEGRATION_CHECKLIST.md
    ├── product/USER_SETUP_GUIDE.md
    └── architecture/   ← SYSTEM_PLAN.md, ROLE_PERMISSION_MATRIX.md
```

**ตรงตามบรีฟ**: ✅ โครงสร้างครบทุกหมวด

---

## 👤 Role Matrix

| Role | Level | สิทธิ์หลัก | org_code required |
|---|---|---|---|
| `super_admin` | 2 | จัดการโครงสร้างทุกอย่าง | ไม่ต้อง |
| `admin` | 1 | จัดการ user, link, analytics ทุก org | ไม่ต้อง |
| `org_hr` | 0.5 | ดู+กรอก CH1, ดู Well-being ของ org ตัวเอง | **ต้องระบุ** |
| `viewer` | 0 | อ่านอย่างเดียว (legacy) | ไม่ต้อง |

### RLS Functions (Supabase)
- `requester_email()` — email จาก JWT
- `requester_role()` — role จาก admin_user_roles
- `requester_is_admin()` — true ถ้า super_admin หรือ admin
- `requester_is_org_hr()` — true ถ้า org_hr ✅ NEW
- `requester_org()` — org_code จาก admin_user_roles ✅ UPDATED

---

## 🔐 Security Fixes Applied

| Fix | Status |
|---|---|
| Logout redirect `/admin-login` → `/admin` | ✅ |
| `requireSession` แสดง inline login form แทน redirect 404 | ✅ |
| Password reset link redirect → `/admin` | ✅ |
| Role normalization `super_admin` ↔ `superadmin` | ✅ |
| LOCKED_SUPERADMIN_EMAILS protection | ✅ |
| org_hr blocked from admin-only pages | ✅ |

---

## 🏗️ CH1 Lifecycle

```
draft  →  submitted  →  locked
  ↑             ↓ (admin)
reopened  ←────────
```

- **round_code**: `round_2569` (fixed ปี 2569)
- **1 org = 1 submission**: unique index `hrd_ch1_unique_org_round`
- **org_code**: backfilled ทุก row แล้ว
- **is_test**: test-org records excluded from production analytics (`WHERE is_test = false`)

---

## 🧪 Test Organization

| Field | Value |
|---|---|
| org_code | `test-org` |
| org_name_th | องค์กรทดสอบระบบ |
| Auth email | `hr@test-org.local` |
| Temp password | `TestOrg2569` |
| CH1 status | `draft` / `round_2569` |
| Well-being link | `https://nidawellbeing.vercel.app/?org=test-org` |
| CH1 link | `https://nidawellbeing.vercel.app/ch1?org=test-org` |

---

## 🌐 Route Map

```
nidawellbeing.vercel.app/           → index.html   (Well-being)
nidawellbeing.vercel.app/ch1        → ch1.html     (CH1)
nidawellbeing.vercel.app/admin      → admin.html   (Admin portal)
```

---

## ⚠️ Known Issues (Medium Priority)

| Issue | Impact | Workaround |
|---|---|---|
| `org_code` NULL ใน 3 CH1 records เดิม | org_hr fallback ใช้ `organization` text match | Backfill migration applied (DSS/BOB/MOTS) |
| `survey_responses.org_code` เป็น NULL สำหรับ responses เก่า | RLS fallback ผ่าน `org_name_th` join | Migration backfill applied |
| org_code case inconsistency (`nesdc` vs `NESDC`) | อาจ duplicate ในอนาคต | Normalize ด้วย UPPER() ใน query |
| T5 manual sync check ยังไม่ได้ทำ | section count บน production อาจไม่ตรง | เปิด nidawellbeing.vercel.app → นับ section (ควร 8) และ /ch1 → นับ steps (ควร 5) |
| Admin portal: ยังไม่มี UI สำหรับ form_windows | ต้องแก้ผ่าน Supabase Dashboard | medium priority |
| Admin portal: ยังไม่มี UI สำหรับ form_question_overrides | ต้องแก้ผ่าน Supabase Dashboard | medium priority |
| smoke-test.js ไม่รันใน sandbox | รันจาก local machine เท่านั้น | ใช้ `node scripts/audit/smoke-test.js` |

---

## 📋 Migration Log (ล่าสุด)

```
20260317  add_is_test_to_organizations
20260317  upgrade_admin_user_roles         (org_code FK, display_name, org_hr role)
20260317  ch1_lifecycle_columns            (round_code, status, lifecycle timestamps)
20260317  create_form_windows              (open/close/edit_until per form+round)
20260317  create_form_question_overrides   (admin-editable labels)
20260317  survey_forms_editor_flags        (allow_label_edit_by_admin)
20260317  update_rls_for_org_hr            (requester_is_org_hr, requester_org updated)
20260317  seed_test_organization
20260317  seed_test_auth_user              (hr@test-org.local)
20260317  seed_test_ch1_draft
20260318  fix_ch1_link_clean_urls          (17 links /ch1.html → /ch1)
20260318  backfill_org_code_ch1            (3 records DSS/BOB/MOTS)
20260318  add_org_code_to_survey_responses (new column + backfill + RLS)
```

---

## 🚀 Quick Test Checklist

เปิดใน browser แล้วตรวจสอบ:

- [ ] `https://nidawellbeing.vercel.app/admin` → เห็น login form ✅
- [ ] Login ด้วย `hr@test-org.local` / `TestOrg2569` → เข้าได้, เห็นแค่ test-org
- [ ] `https://nidawellbeing.vercel.app/?org=test-org` → เห็น Well-being survey
- [ ] `https://nidawellbeing.vercel.app/ch1?org=test-org` → เห็น CH1 form
- [ ] ทดลอง navigate ไปหน้า Users → org_hr เห็น "⛔ ไม่มีสิทธิ์" toast
- [ ] Logout → กลับมาหน้า login form (ไม่ 404)
