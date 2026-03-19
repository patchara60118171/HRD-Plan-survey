# DATA_SCOPE_AND_ACCESS_RULES.md

> Last updated: 2026-03-17

---

## Overview

เอกสารนี้อธิบายว่า role แต่ละ role เห็นข้อมูลอะไรได้บ้าง ทั้งระดับ UI และระดับ Database (RLS)

---

## Well-being Survey Data Scope

### Public respondents (anon)
- INSERT only — submit คำตอบของตัวเอง
- ไม่สามารถอ่าน records อื่นได้

### org_hr
- SELECT เฉพาะ rows ที่ `organization` ตรงกับ `org_name_th` ขององค์กรตัวเอง
- หรือ `raw_responses->>'org_code' = requester_org()`
- ไม่เห็นข้อมูลองค์กรอื่น

### admin / super_admin
- SELECT ทุก row
- DELETE ได้ (admin และ super_admin)

**RLS Policy:**
```sql
-- Role-aware select survey
USING (
  requester_is_admin()
  OR (
    requester_is_org_hr()
    AND (
      organization IN (
        SELECT org_name_th FROM organizations 
        WHERE org_code = requester_org()
      )
      OR COALESCE(raw_responses->>'org_code', '') = COALESCE(requester_org(), '__none__')
    )
  )
)
```

---

## CH1 Survey Data Scope

### org_hr
- SELECT เฉพาะ rows ที่ `org_code = requester_org()` หรือ `organization` ตรงกับ org ตัวเอง
- UPDATE ได้เฉพาะ rows ที่ status = 'draft' หรือ 'reopened' และเป็น org ตัวเอง
- INSERT ได้ (ผ่าน policy `hrd_insert_authenticated`)

### admin
- SELECT ทุก row
- UPDATE ทุก row
- ไม่สามารถ DELETE

### super_admin
- Full access รวม DELETE

**RLS Policy:**
```sql
-- Role-aware select ch1
USING (
  requester_is_admin()
  OR (
    requester_is_org_hr()
    AND (
      (org_code IS NOT NULL AND org_code = requester_org())
      OR (org_code IS NULL AND organization IN (
        SELECT org_name_th FROM organizations WHERE org_code = requester_org()
      ))
    )
  )
)
```

---

## Organization Data Scope

### org_hr
- ❌ ไม่เห็น organizations table โดยตรงผ่าน RLS (Read: authenticated = all)
- UI ต้องซ่อน org management จาก org_hr

### admin / super_admin
- เห็นทุก org
- admin: ไม่สามารถแก้ไขโครงสร้างองค์กร
- super_admin: full CRUD

---

## Test Organization Data Scope

Test org (`is_test = true`, `org_code = 'test-org'`):

| Context | Behavior |
|---|---|
| Official analytics | ❌ ถูก filter ออก (`WHERE is_test = false`) |
| Admin org list | ✅ แสดง (tagged as test) |
| CH1 unique constraint | ❌ ไม่นำมาคิด (INDEX มี WHERE clause) |
| Google Sheets sync | ❌ ไม่ sync |
| Export default | ❌ ไม่รวม (ต้อง explicitly include) |

Filter SQL ที่ควรใช้ใน production queries:
```sql
WHERE o.is_test = false
-- หรือ
WHERE h.is_test = false AND h.submission_mode = 'live'
```

---

## Well-being Link Model

ผู้ตอบแบบสำรวจ Well-being เข้าผ่านลิงก์เฉพาะองค์กร:

```
https://domain.vercel.app/?org=ACFS
-- หรือผ่าน token ใน org_form_links
```

Flow:
1. ผู้ตอบเปิด URL ที่มี org parameter
2. System ตรวจสอบ org_code ผ่าน `org_form_links`
3. Embed `org_code` ใน submission (raw_responses หรือ organization field)
4. ไม่มี org selection ใน UI

Table: `org_form_links`
```
org_id → organizations.id
form_id → survey_forms.id (form_key = 'wellbeing')
full_url → URL ที่แสดงให้องค์กร
is_active → ปิดได้โดยไม่ลบ record
```

---

## Export Rules

| Export Type | org_hr | admin | super_admin |
|---|---|---|---|
| Well-being CSV (own org) | ✅ | ✅ | ✅ |
| Well-being CSV (all orgs) | ❌ | ✅ | ✅ |
| CH1 data (own org) | ✅ | ✅ | ✅ |
| CH1 data (all orgs) | ❌ | ✅ | ✅ |
| Include test org | ❌ | ✅ (explicit) | ✅ (explicit) |

---

## Password Policy

- ไม่เก็บ plaintext password
- ใช้ Supabase Auth (hashed)
- Admin สร้าง temp password รูปแบบ `Word + Number` เช่น `Nida2026HR`
- แสดง temp password ครั้งเดียวตอนสร้าง/reset
- User ควร change password หลัง login ครั้งแรก

---

## Audit Trail

Table: `admin_audit_logs`

บันทึกเมื่อ:
- Create/update/delete user
- Role change
- Password reset
- CH1 status change (lock/reopen)
- Export performed

Fields: `actor_email`, `actor_role`, `action`, `target`, `details` (JSONB), `created_at`