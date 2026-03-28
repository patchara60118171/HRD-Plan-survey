# Claude Backend Handoff — Supabase + Vercel

> คำสั่งสำหรับ Claude (MCP-connected to Supabase + Vercel) เพื่อดำเนินการหลังบ้านให้เสร็จ

---

## Project Info

- **Workspace:** `c:\Users\Pchr Pyl\Desktop\Well-being Survey`
- **Supabase URL:** `https://fgdommhiqhzvsedfzyrr.supabase.co`
- **Vercel:** deployed at `https://nidawellbeing.vercel.app`
- **Supabase Anon Key:** อยู่ใน `js/supabase-config.js`

---

## สิ่งที่ Frontend ทำเสร็จแล้ว

| Phase | Status | Files |
|-------|--------|-------|
| A — SQL migrations (files) | ✅ สร้างไฟล์แล้ว | `supabase/migrations/20260319_*.sql` |
| B — `js/form-schema.js` | ✅ สร้างแล้ว | `js/form-schema.js` |
| C1 — Admin Users (org_hr, display_name, org_code) | ✅ | `admin.html` |
| C2 — Admin Questions Editor + Form Windows | ✅ | `admin.html` |
| D — Org Portal | ✅ | `org-portal.html` |
| E — CH1 Pages Refactor | ❌ Pending | `ch1.html`, `ch1-edit.html` etc |
| F — PDF | ❌ Pending | |
| G — Wellbeing Refactor | ❌ Pending | |

---

## 🔴 งานที่ต้องทำบน Supabase (เรียงตามลำดับ)

### 1. รัน SQL Migrations

มีไฟล์ migration พร้อมแล้วใน `supabase/migrations/` — **รันตามลำดับนี้**:

> ⚠️ **ก่อนรัน**: ตรวจว่า function `requester_is_admin()` มีอยู่แล้ว (ใช้โดย RLS policies)
> ```sql
> SELECT proname FROM pg_proc WHERE proname = 'requester_is_admin';
> ```
> ถ้าไม่มี ให้สร้างก่อน:
> ```sql
> CREATE OR REPLACE FUNCTION public.requester_is_admin()
> RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
>   SELECT EXISTS (
>     SELECT 1 FROM public.admin_user_roles
>     WHERE email = auth.jwt() ->> 'email'
>     AND role IN ('super_admin', 'admin') AND is_active = true
>   )
> $$;
> ```

#### Step 1: Existing table patches (ถ้ายังไม่เคยรัน)
| ลำดับ | ไฟล์ | หน้าที่ |
|-------|------|---------|
| 1 | `20260317_upgrade_admin_user_roles.sql` | เพิ่ม `org_code`, `display_name`, `created_by` + role constraint |
| 2 | `20260317_create_form_question_overrides.sql` | สร้าง table overrides (column `label_text`) |
| 3 | `20260317_create_form_windows.sql` | สร้าง table form_windows (column `is_active`) |
| 4 | `20260317_update_rls_for_org_hr.sql` | RLS: org_hr เห็น/แก้เฉพาะ org ตัวเอง |

#### Step 2: New tables — form_sections + form_questions
| ลำดับ | ไฟล์ | หน้าที่ |
|-------|------|---------|
| 5 | `20260319_add_form_questions.sql` | สร้าง `form_sections`, `form_questions`, FK, RLS |
| 6 | `20260319_seed_form_questions.sql` | Seed คำถาม wellbeing + ch1 |

#### Step 3: Reconciliation (แก้ schema mismatch)
| ลำดับ | ไฟล์ | หน้าที่ |
|-------|------|---------|
| 7 | `20260319_reconcile_schema.sql` | Rename `label_text`→`label_th`, add `is_open` + `last_login_at`, UNIQUE constraint |

> **สำคัญ**: Frontend code รองรับทั้ง column เก่า + ใหม่ (fallback) ดังนั้นถ้ารันไม่ครบก็ยังทำงานได้

#### Step 4: ตรวจสอบหลังรัน
```sql
-- ตรวจ tables ที่สร้าง
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('form_sections','form_questions','form_question_overrides','form_windows');

-- ตรวจ columns ของ admin_user_roles
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admin_user_roles' AND table_schema = 'public';

-- ตรวจ RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('hrd_ch1_responses','form_windows','form_questions','admin_user_roles');

-- ตรวจ seed data
SELECT form_code, COUNT(*) FROM form_questions GROUP BY form_code;
SELECT form_code, COUNT(*) FROM form_sections GROUP BY form_code;
```

---

### 2. Edge Function: set-user-password

> ⚠️ **admin.html เรียก `set-user-password` อยู่แล้ว** (ไม่ใช่ `create-org-user`)
> ตรวจว่า function นี้ deploy แล้ว — ถ้ายังไม่มี ให้สร้าง:

**Path:** `supabase/functions/set-user-password/index.ts`
**Frontend เรียก:** `${SUPABASE_URL}/functions/v1/set-user-password`
**Actions:** `create` (สร้าง auth user + email_confirm) | `update` (เปลี่ยนรหัสผ่าน)

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !user) throw new Error('Unauthorized')

    const { data: callerRole } = await supabaseAdmin
      .from('admin_user_roles')
      .select('role')
      .eq('email', user.email)
      .single()

    if (!callerRole || !['super_admin', 'admin'].includes(callerRole.role)) {
      throw new Error('Forbidden: admin only')
    }

    const { email, password, action } = await req.json()

    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) throw error
      return new Response(JSON.stringify({ success: true, user_id: data.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      // Find user by email
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
      const targetUser = users.find(u => u.email === email)
      if (!targetUser) throw new Error('User not found')

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password }
      )
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

**Deploy:**
```bash
supabase functions deploy set-user-password --no-verify-jwt
```

> Note: ตรวจว่า Edge Function `set-user-password` ถูก deploy แล้วหรือยัง — admin.html เรียกใช้อยู่แล้ว

---

### 3. Seed form_windows สำหรับ 15 องค์กร

```sql
-- เปิด ch1 form window สำหรับทุกองค์กร (default open)
-- ใช้ทั้ง is_open + is_active เพื่อ compat กับ DB schema ทั้งก่อน/หลัง reconciliation
INSERT INTO public.form_windows (form_code, org_code, is_open, is_active, opens_at, closes_at)
SELECT 'ch1', org_code, true, true, '2025-01-01'::timestamptz, '2026-12-31'::timestamptz
FROM public.organizations
ON CONFLICT (form_code, org_code) DO NOTHING;
```

> ⚠️ ถ้า `is_open` column ยังไม่มี (ยังไม่รัน reconcile) ให้ตัด `is_open` ออกจาก INSERT

---

### 4. ตรวจสอบ Organizations table

```sql
-- ตรวจว่ามี org_code ทุก row
SELECT org_code, org_name_th FROM organizations WHERE org_code IS NULL;

-- ตรวจว่า admin_user_roles.org_code match กับ organizations.org_code
SELECT aur.email, aur.org_code, o.org_code as org_exists
FROM admin_user_roles aur
LEFT JOIN organizations o ON o.org_code = aur.org_code
WHERE aur.role = 'org_hr';
```

---

## 🔵 Vercel Deployment

### Redeploy with new files:
1. `org-portal.html` — Org HR portal (new)
2. `js/form-schema.js` — Shared schema loader (new)
3. `admin.html` — Updated (Phase C changes)
4. `admin/assets/css/admin.css` — Updated (org_hr badge CSS)

### Vercel routes (verify in `vercel.json`):
```json
{
  "routes": [
    { "src": "/org-portal", "dest": "/org-portal.html" },
    { "src": "/org-portal.html", "dest": "/org-portal.html" }
  ]
}
```

---

## 🟡 Phase E-G (ยังไม่ทำ — ให้ Claude ทำต่อ)

### Phase E — CH1 Pages Refactor

แต่ละหน้า CH1 ต้อง:
1. Import `js/form-schema.js`
2. เรียก `FormSchema.loadFormSchema('ch1')` แทน hardcode
3. Auth gate: ตรวจ session + role + org_code
4. org_hr เห็นเฉพาะ org ตัวเอง
5. แก้ไขได้เฉพาะ `status IN ('draft','reopened')`

**ไฟล์ที่ต้อง refactor:**
- `ch1.html` — form filling
- เพิ่ม `ch1-edit.html` หรือใช้ `ch1.html?mode=edit` — editing existing response
- เพิ่ม `ch1-preview.html` หรือใช้ `ch1.html?mode=preview` — read-only view

### Phase F — PDF Generation

- `ch1.html?mode=pdf` หรือ `ch1-individual-pdf.html`
- Labels จาก `FormSchema.getFieldLabel(key, 'ch1')`
- Auth gate: org_hr เห็นเฉพาะ org ตัวเอง
- PDF layout: header + logo + ข้อมูลครบ
- ปุ่ม "🖨️ พิมพ์ / 📥 ดาวน์โหลด PDF"

### Phase G — Well-being Refactor

- `index.html` ดึง `FormSchema.loadFormSchema('wellbeing')` แทน `js/questions.js`
- Dashboard labels จาก schema
- `js/questions.js` เก็บไว้เป็น offline fallback

---

## ⚠️ ข้อควรระวัง

1. **ห้ามลบ** `hrd_ch1_responses` — ทุก query ใช้ SELECT/UPDATE เท่านั้น (12 org มีข้อมูลจริงแล้ว)
2. `auth.admin.createUser` ต้องผ่าน Edge Function เท่านั้น — service_role key ห้าม expose frontend
3. `js/questions.js` + `js/hrd-ch1-fields.js` ยังคงอยู่เป็น fallback กรณี DB ไม่ตอบสนอง
4. org_hr แก้ไขได้เฉพาะ `status IN ('draft','reopened')` — RLS บังคับ
5. Locked superadmin emails: `['admin@gmail.com']` — ห้ามแก้จาก UI

---

## Quick Start สำหรับ Claude

```
1. เชื่อมต่อ Supabase MCP → ตรวจ requester_is_admin() function มีหรือยัง
2. รัน SQL Step 1: migrations 20260317_*.sql (4 ไฟล์) ตามลำดับ
3. รัน SQL Step 2: 20260319_add_form_questions.sql → 20260319_seed_form_questions.sql
4. รัน SQL Step 3: 20260319_reconcile_schema.sql
5. ตรวจ: form_sections, form_questions, form_question_overrides, form_windows มีครบ
6. ตรวจ admin_user_roles มี columns: display_name, org_code, created_by, last_login_at
7. Deploy Edge Function: set-user-password (ไฟล์อยู่ที่ supabase/functions/set-user-password/index.ts)
8. Seed form_windows สำหรับ 15 org (ดู SQL ข้อ 3 ด้านบน)
9. เชื่อมต่อ Vercel MCP → redeploy (ไฟล์ใหม่: org-portal.html, js/form-schema.js)
10. ทดสอบ:
    - admin.html → หน้า "จัดการข้อคำถาม" โหลดคำถามจาก DB
    - admin.html → หน้า "ตั้งเวลาฟอร์ม" แสดง windows
    - org-portal.html → login flow ของ org_hr
11. ดำเนินการ Phase E (CH1 refactor) → F (PDF) → G (Wellbeing)
```

## Schema Mismatch Notes

Frontend code รองรับ column ชื่อเก่าและใหม่:
- `form_question_overrides`: รองรับทั้ง `label_text` (เดิม) และ `label_th` (หลัง reconcile)
- `form_windows`: รองรับทั้ง `is_active` (เดิม) และ `is_open` (หลัง reconcile)
- ดังนั้นถ้ายังไม่ได้รัน reconcile migration ก็ยังทำงานได้
