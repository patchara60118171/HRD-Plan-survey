# 🤖 Prompt สำหรับ Cowork — Supabase + Vercel MCP

> ใช้คัดลอกส่งให้ Claude/AI ที่มี MCP เชื่อมต่อ Supabase + Vercel
> แต่ละ Prompt แยกเป็นงานอิสระ สามารถส่งทีละงานได้
> วันที่: 2026-03-21

---

## สารบัญ

1. [Prompt A — ตรวจสอบ + รัน SQL Migrations ที่ยังไม่ได้รัน](#prompt-a)
2. [Prompt B — Deploy Edge Function `set-user-password`](#prompt-b)
3. [Prompt C — สร้าง Auth Users 15 หน่วยงาน (org_hr)](#prompt-c)
4. [Prompt D — Seed form_windows สำหรับทุกองค์กร](#prompt-d)
5. [Prompt E — ตรวจสอบ RLS ครบทุกตาราง](#prompt-e)
6. [Prompt F — Vercel Redeploy + Route Verification](#prompt-f)
7. [Prompt G — Full Verification Test](#prompt-g)

---

## Prompt A — ตรวจสอบ + รัน SQL Migrations ที่ยังไม่ได้รัน {#prompt-a}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Supabase ของโปรเจค Well-being Survey แล้ว

## ข้อมูลโปรเจค
- Supabase URL: https://fgdommhiqhzvsedfzyrr.supabase.co
- Workspace: Well-being Survey

## งานที่ต้องทำ
ตรวจสอบและรัน SQL migrations ที่ยังไม่ได้รันบน Supabase ตามลำดับ

### Step 0: ตรวจสอบ prerequisite
```sql
-- ตรวจว่า function requester_is_admin() มีอยู่แล้ว
SELECT proname FROM pg_proc WHERE proname = 'requester_is_admin';
```
ถ้าไม่มี ให้สร้าง:
```sql
CREATE OR REPLACE FUNCTION public.requester_is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_user_roles
    WHERE email = auth.jwt() ->> 'email'
    AND role IN ('super_admin', 'admin') AND is_active = true
  )
$$;
```

### Step 1: ตรวจว่า tables/columns เหล่านี้มีหรือยัง
```sql
-- ตรวจ tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'form_sections','form_questions','form_question_overrides','form_windows'
);

-- ตรวจ columns ของ admin_user_roles
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admin_user_roles' AND table_schema = 'public';

-- ตรวจ initial_password column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admin_user_roles' AND column_name = 'initial_password';
```

### Step 2: รัน migrations ที่ยังไม่ได้รัน (ตามลำดับ)
ไฟล์ migration อยู่ในเครื่อง Dev ที่ `supabase/migrations/` 
ตรวจ = ดูว่า table/column ที่ migration จะสร้างมีอยู่แล้วหรือยัง
ถ้ายังไม่มี → รัน SQL ของไฟล์นั้น

ลำดับ:
1. `20260317_upgrade_admin_user_roles.sql` — เพิ่ม org_code, display_name, created_by
2. `20260317_create_form_question_overrides.sql` — สร้าง table overrides
3. `20260317_create_form_windows.sql` — สร้าง table form_windows
4. `20260317_update_rls_for_org_hr.sql` — RLS policies สำหรับ org_hr
5. `20260319_add_form_questions.sql` — สร้าง form_sections, form_questions
6. `20260319_seed_form_questions.sql` — Seed ข้อมูลคำถาม
7. `20260319_reconcile_schema.sql` — Rename columns, add is_open
8. `20260320_add_initial_password.sql` — เพิ่ม initial_password column
9. `20260320_seed_15_organizations.sql` — Seed 15 องค์กร

### Step 3: ตรวจสอบผลลัพธ์
```sql
-- ตรวจ tables ครบ
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('form_sections','form_questions','form_question_overrides','form_windows');

-- ตรวจ seed data
SELECT form_code, COUNT(*) FROM form_questions GROUP BY form_code;
SELECT form_code, COUNT(*) FROM form_sections GROUP BY form_code;

-- ตรวจ organizations
SELECT org_code, org_name_th, is_test FROM organizations ORDER BY org_name_th;

-- ตรวจ admin_user_roles columns ครบ
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admin_user_roles' AND table_schema = 'public'
ORDER BY ordinal_position;
```

## ผลลัพธ์ที่ต้องการ
รายงานว่า:
1. Migrations ไหนรันแล้ว / ไหนรันใหม่
2. Tables ที่สร้าง/อัปเดต
3. จำนวน seed data
4. ปัญหาที่พบ (ถ้ามี)
```

</details>

---

## Prompt B — Deploy Edge Function `set-user-password` {#prompt-b}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Supabase ของโปรเจค Well-being Survey แล้ว

## งาน
ตรวจสอบและ deploy Edge Function `set-user-password`

### Step 1: ตรวจว่ามี function นี้แล้วหรือยัง
ตรวจใน Supabase Dashboard → Edge Functions ว่ามี `set-user-password` หรือยัง

### Step 2: ถ้ายังไม่มี ให้สร้างและ deploy
สร้างไฟล์ `supabase/functions/set-user-password/index.ts` ด้วยโค้ดนี้:

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

### Step 3: Deploy
```bash
supabase functions deploy set-user-password --no-verify-jwt
```

### Step 4: ทดสอบ
ทดสอบเรียก function ผ่าน curl หรือ Supabase Dashboard:
- Action: `create` — สร้าง test user
- Action: `update` — เปลี่ยนรหัสผ่าน test user

## ผลลัพธ์ที่ต้องการ
- Edge Function `set-user-password` deploy สำเร็จ
- ทดสอบ create + update สำเร็จ
```

</details>

---

## Prompt C — สร้าง Auth Users 15 หน่วยงาน (org_hr) {#prompt-c}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Supabase ของโปรเจค Well-being Survey แล้ว

## Prerequisite
- Edge Function `set-user-password` ต้อง deploy แล้ว
- ตาราง `organizations` ต้องมี 15 องค์กรแล้ว
- ตาราง `admin_user_roles` ต้องมี column `initial_password`, `org_code`, `display_name`

## งาน
สร้าง Auth User + admin_user_roles record สำหรับ 15 หน่วยงาน role = org_hr

### ข้อมูลที่ต้องสร้าง

| org_code | email | password | display_name |
|----------|-------|----------|--------------|
| dcy | hr@dcy.go.th | DcyHR2569 | HR กรมกิจการเด็กและเยาวชน |
| probation | hr@probation.go.th | ProbHR2569 | HR กรมคุมประพฤติ |
| rid | hr@rid.go.th | RidHR2569 | HR กรมชลประทาน |
| dss | hr@dss.go.th | DssHR2569 | HR กรมวิทยาศาสตร์บริการ |
| dcp | hr@dcp.go.th | DcpHR2569 | HR กรมส่งเสริมวัฒนธรรม |
| dmh | hr@dmh.go.th | DmhHR2569 | HR กรมสุขภาพจิต |
| tmd | hr@tmd.go.th | TmdHR2569 | HR กรมอุตุนิยมวิทยา |
| hssd | hr@hssd.go.th | HssdHR2569 | HR กรมสนับสนุนบริการสุขภาพ |
| ocsc | hr@ocsc.go.th | OcscHR2569 | HR สำนักงาน กพร. |
| nrct | hr@nrct.go.th | NrctHR2569 | HR สำนักงานการวิจัยแห่งชาติ |
| onep | hr@onep.go.th | OnepHR2569 | HR สำนักงานนโยบายฯ ทรัพยากรธรรมชาติ |
| tpso | hr@tpso.go.th | TpsoHR2569 | HR สำนักงานนโยบายฯ การค้า |
| mots | hr@mots.go.th | MotsHR2569 | HR สำนักงานปลัดกระทรวงฯ ท่องเที่ยว |
| acfs | hr@acfs.go.th | AcfsHR2569 | HR สำนักงานมาตรฐานสินค้าเกษตรฯ |
| nesdc | hr@nesdc.go.th | NesdcHR2569 | HR สำนักงานสภาพัฒนาเศรษฐกิจฯ |

### ขั้นตอน สำหรับแต่ละ org:

#### 1. สร้าง Auth User (ผ่าน Edge Function หรือ admin.createUser)
```javascript
// ผ่าน Supabase Admin API
const { data, error } = await supabase.auth.admin.createUser({
    email: 'hr@dcy.go.th',
    password: 'DcyHR2569',
    email_confirm: true
});
```

#### 2. สร้าง admin_user_roles record
```sql
INSERT INTO admin_user_roles (email, role, org_code, display_name, initial_password, is_active, created_at)
VALUES 
  ('hr@dcy.go.th', 'org_hr', 'dcy', 'HR กรมกิจการเด็กและเยาวชน', 'DcyHR2569', true, NOW()),
  ('hr@probation.go.th', 'org_hr', 'probation', 'HR กรมคุมประพฤติ', 'ProbHR2569', true, NOW()),
  ('hr@rid.go.th', 'org_hr', 'rid', 'HR กรมชลประทาน', 'RidHR2569', true, NOW()),
  ('hr@dss.go.th', 'org_hr', 'dss', 'HR กรมวิทยาศาสตร์บริการ', 'DssHR2569', true, NOW()),
  ('hr@dcp.go.th', 'org_hr', 'dcp', 'HR กรมส่งเสริมวัฒนธรรม', 'DcpHR2569', true, NOW()),
  ('hr@dmh.go.th', 'org_hr', 'dmh', 'HR กรมสุขภาพจิต', 'DmhHR2569', true, NOW()),
  ('hr@tmd.go.th', 'org_hr', 'tmd', 'HR กรมอุตุนิยมวิทยา', 'TmdHR2569', true, NOW()),
  ('hr@hssd.go.th', 'org_hr', 'hssd', 'HR กรมสนับสนุนบริการสุขภาพ', 'HssdHR2569', true, NOW()),
  ('hr@ocsc.go.th', 'org_hr', 'ocsc', 'HR สำนักงาน กพร.', 'OcscHR2569', true, NOW()),
  ('hr@nrct.go.th', 'org_hr', 'nrct', 'HR สำนักงานการวิจัยแห่งชาติ', 'NrctHR2569', true, NOW()),
  ('hr@onep.go.th', 'org_hr', 'onep', 'HR สำนักงานนโยบายฯ ทรัพยากรธรรมชาติ', 'OnepHR2569', true, NOW()),
  ('hr@tpso.go.th', 'org_hr', 'tpso', 'HR สำนักงานนโยบายฯ การค้า', 'TpsoHR2569', true, NOW()),
  ('hr@mots.go.th', 'org_hr', 'mots', 'HR สำนักงานปลัดกระทรวงฯ ท่องเที่ยว', 'MotsHR2569', true, NOW()),
  ('hr@acfs.go.th', 'org_hr', 'acfs', 'HR สำนักงานมาตรฐานสินค้าเกษตรฯ', 'AcfsHR2569', true, NOW()),
  ('hr@nesdc.go.th', 'org_hr', 'nesdc', 'HR สำนักงานสภาพัฒนาเศรษฐกิจฯ', 'NesdcHR2569', true, NOW())
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  org_code = EXCLUDED.org_code,
  display_name = EXCLUDED.display_name,
  initial_password = EXCLUDED.initial_password,
  is_active = EXCLUDED.is_active;
```

### ตรวจสอบผลลัพธ์
```sql
-- ตรวจ admin_user_roles
SELECT email, role, org_code, display_name, is_active 
FROM admin_user_roles 
WHERE role = 'org_hr'
ORDER BY org_code;

-- ตรวจว่า org_code match กับ organizations
SELECT aur.email, aur.org_code, o.org_name_th
FROM admin_user_roles aur
JOIN organizations o ON o.org_code = aur.org_code
WHERE aur.role = 'org_hr';
```

## ผลลัพธ์ที่ต้องการ
- 15 Auth users สร้างใน Supabase Auth
- 15 records ใน admin_user_roles ที่ role = 'org_hr'
- ทุก org_code match กับ organizations table
- initial_password บันทึกแล้ว

## ⚠️ ข้อควรระวัง
- ถ้า email ซ้ำ → ใช้ ON CONFLICT อัปเดตแทน
- ห้ามลบ super_admin / admin users ที่มีอยู่แล้ว
- initial_password เก็บเป็น plain text ใน DB เพื่อให้แอดมินดูได้ (ตาม business requirement)
```

</details>

---

## Prompt D — Seed form_windows สำหรับทุกองค์กร {#prompt-d}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Supabase ของโปรเจค Well-being Survey แล้ว

## งาน
Seed form_windows records สำหรับทุกองค์กร ทั้ง CH1 และ Wellbeing form

### Step 1: ตรวจ schema ของ form_windows
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'form_windows' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Step 2: ตรวจว่ามี form_windows อยู่แล้วหรือยัง
```sql
SELECT form_code, org_code, opens_at, closes_at 
FROM form_windows 
ORDER BY form_code, org_code;
```

### Step 3: Seed form_windows
```sql
-- CH1 form windows สำหรับทุกองค์กร
INSERT INTO form_windows (form_code, org_code, opens_at, closes_at, edit_until, is_active)
SELECT 
    'ch1', 
    org_code, 
    '2025-01-01'::timestamptz, 
    '2026-12-31'::timestamptz,
    '2026-12-31'::timestamptz,
    true
FROM organizations
WHERE org_code != 'test-org'
ON CONFLICT DO NOTHING;

-- Wellbeing form windows สำหรับทุกองค์กร
INSERT INTO form_windows (form_code, org_code, opens_at, closes_at, edit_until, is_active)
SELECT 
    'wellbeing', 
    org_code, 
    '2025-01-01'::timestamptz, 
    '2026-12-31'::timestamptz,
    '2026-12-31'::timestamptz,
    true
FROM organizations
WHERE org_code != 'test-org'
ON CONFLICT DO NOTHING;

-- Test org windows
INSERT INTO form_windows (form_code, org_code, opens_at, closes_at, edit_until, is_active)
VALUES 
    ('ch1', 'test-org', '2025-01-01'::timestamptz, '2027-12-31'::timestamptz, '2027-12-31'::timestamptz, true),
    ('wellbeing', 'test-org', '2025-01-01'::timestamptz, '2027-12-31'::timestamptz, '2027-12-31'::timestamptz, true)
ON CONFLICT DO NOTHING;
```

⚠️ หมายเหตุ: ถ้า table มี column `is_open` แทน `is_active` → ให้ใช้ `is_open` แทน

### Step 4: ตรวจสอบ
```sql
SELECT form_code, COUNT(*) as window_count 
FROM form_windows 
GROUP BY form_code;

SELECT form_code, org_code, opens_at, closes_at, is_active
FROM form_windows
ORDER BY form_code, org_code;
```

## ผลลัพธ์ที่ต้องการ
- ทุกองค์กรมี form_windows สำหรับ ch1 และ wellbeing
- windows ตั้ง active = true, opens_at = 2025-01-01, closes_at = 2026-12-31
```

</details>

---

## Prompt E — ตรวจสอบ RLS ครบทุกตาราง {#prompt-e}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Supabase ของโปรเจค Well-being Survey แล้ว

## งาน
ตรวจสอบ Row Level Security (RLS) ทุกตารางที่มีข้อมูลสำคัญ

### Step 1: ตรวจว่า RLS เปิดอยู่ทุกตาราง

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Step 2: ดู policies ทั้งหมด

```sql
SELECT tablename, policyname, permissive, roles, cmd, 
       LEFT(qual::text, 200) as qual_preview
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Step 3: ตรวจว่าตารางเหล่านี้มี RLS + policies ครบ

| ตาราง | ต้อง RLS? | Policies ที่ต้องมี |
|-------|:---------:|-------------------|
| organizations | ✅ | SELECT: admin เห็นทั้งหมด, org_hr เห็นเฉพาะ org ตัวเอง, anon ไม่เห็น |
| admin_user_roles | ✅ | SELECT: admin เห็นทั้งหมด, org_hr เห็นตัวเอง; INSERT/UPDATE: admin only |
| hrd_ch1_responses | ✅ | SELECT/UPDATE: org_hr เฉพาะ org ตัวเอง, admin ทั้งหมด |
| survey_responses | ✅ | SELECT: org_hr เฉพาะ org, admin ทั้งหมด; INSERT: anon (public form) |
| org_form_links | ✅ | SELECT: admin ทั้งหมด, org_hr เฉพาะ org; CRUD: admin |
| survey_forms | ✅ | SELECT: ทุกคน; UPDATE: admin (labels), super_admin (structure) |
| form_windows | ✅ | SELECT: admin ทั้งหมด, org_hr เฉพาะ org; CRUD: admin |
| form_question_overrides | ✅ | SELECT: ทุกคน; CRUD: admin |
| form_questions | ✅ | SELECT: ทุกคน (public need); CRUD: admin |
| form_sections | ✅ | SELECT: ทุกคน; CRUD: admin |
| admin_audit_logs | ✅ | SELECT: admin; INSERT: system/authenticated |

### Step 4: Helper functions ที่ต้องมี
```sql
SELECT proname FROM pg_proc 
WHERE proname IN (
  'requester_email', 'requester_role', 'requester_is_admin', 
  'requester_is_org_hr', 'requester_org'
);
```

### Step 5: สร้าง policies ที่ยังขาด (ถ้ามี)
สำหรับแต่ละตารางที่ยังขาด RLS/policies ให้:
1. เปิด RLS: `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;`
2. สร้าง SELECT policy: เหมาะกับ role
3. สร้าง INSERT/UPDATE/DELETE policy: ตาม permission matrix

## ผลลัพธ์ที่ต้องการ
รายงาน:
1. ตารางที่ RLS เปิดแล้ว / ยังไม่เปิด
2. Policies ที่ครบ / ที่ขาด
3. Policies ที่สร้างใหม่ (ถ้ามี)
4. ช่องโหว่ที่พบ (ถ้ามี)
5. คำแนะนำเพิ่มเติม
```

</details>

---

## Prompt F — Vercel Redeploy + Route Verification {#prompt-f}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Vercel ของโปรเจค Well-being Survey แล้ว

## ข้อมูลโปรเจค
- Vercel URL: https://nidawellbeing.vercel.app
- GitHub Repo: เชื่อมกับ Vercel auto-deploy

## งาน
ตรวจสอบและ redeploy Vercel ให้มีไฟล์ใหม่ทั้งหมด

### Step 1: ตรวจ vercel.json rewrites
ตรวจว่า rewrites ต่อไปนี้มีใน vercel.json:
```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/admin", "destination": "/admin.html" },
    { "source": "/ch1", "destination": "/ch1.html" },
    { "source": "/org-portal", "destination": "/org-portal.html" }
  ]
}
```

### Step 2: ตรวจว่าไฟล์เหล่านี้มีอยู่ใน deployment
- `/index.html`
- `/ch1.html`
- `/admin.html`
- `/org-portal.html` (ถ้ามี)
- `/js/form-schema.js`
- `/js/supabase-config.js`
- `/admin/assets/css/admin.css` (ถ้ามี)
- `/sw.js`

### Step 3: Trigger redeploy
ถ้ามีไฟล์ที่ยังไม่ deploy → trigger redeploy

### Step 4: ตรวจ routes หลัง deploy
ทดสอบ URL เหล่านี้ ต้อง return 200:
- https://nidawellbeing.vercel.app/
- https://nidawellbeing.vercel.app/ch1
- https://nidawellbeing.vercel.app/admin
- https://nidawellbeing.vercel.app/ch1?org=test-org

### Step 5: ตรวจ headers + caching
ตรวจว่า:
- HTML pages ไม่ถูก aggressive cache
- JS/CSS ถูก cache อย่างเหมาะสม
- ไม่มี CORS issues

## ผลลัพธ์ที่ต้องการ
- ทุก route ทำงานถูกต้อง
- ไฟล์ใหม่ทุกไฟล์ accessible
- ไม่มี 404 errors
```

</details>

---

## Prompt G — Full Verification Test {#prompt-g}

<details>
<summary>📋 คลิกเพื่อดู Prompt เต็ม</summary>

```
คุณเชื่อมต่อกับ Supabase ของโปรเจค Well-being Survey แล้ว

## งาน
ทดสอบ integration ทั้งระบบหลังจาก migrations + user creation เสร็จ

### Test 1: Database Schema
```sql
-- 1.1 ตรวจ organizations ครบ 16 (15 จริง + 1 test)
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN is_test = false THEN 1 END) as real_orgs,
       COUNT(CASE WHEN is_test = true THEN 1 END) as test_orgs
FROM organizations;

-- 1.2 ตรวจ admin_user_roles
SELECT role, COUNT(*) 
FROM admin_user_roles 
WHERE is_active = true 
GROUP BY role;

-- 1.3 ตรวจ org_hr ทุกคนมี org_code
SELECT email, org_code 
FROM admin_user_roles 
WHERE role = 'org_hr' AND org_code IS NULL;
-- ต้องไม่มี row (ทุก org_hr ต้องมี org_code)

-- 1.4 ตรวจ form_questions
SELECT form_code, COUNT(*) as question_count
FROM form_questions
GROUP BY form_code;

-- 1.5 ตรวจ form_windows
SELECT form_code, COUNT(*) as window_count
FROM form_windows
WHERE is_active = true
GROUP BY form_code;
```

### Test 2: RLS Verification
```sql
-- 2.1 ตรวจว่า RLS เปิดทุกตาราง
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'organizations','admin_user_roles','hrd_ch1_responses',
  'survey_responses','form_windows','form_question_overrides',
  'form_questions','form_sections','admin_audit_logs'
);

-- 2.2 ตรวจ policies ทั้งหมด
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### Test 3: Auth Integration
ทดสอบ login ด้วย org_hr account (test-org):
- email: hr@test-org.local
- password: TestOrg2569
→ ต้อง login สำเร็จ

ทดสอบ query ด้วย org_hr token:
- `SELECT * FROM hrd_ch1_responses` → เห็นเฉพาะ test-org
- `SELECT * FROM organizations` → เห็นเฉพาะ test-org
- `SELECT * FROM form_windows` → เห็นเฉพาะ test-org

### Test 4: Data Integrity
```sql
-- 4.1 ตรวจ org_code ไม่มี NULL ใน hrd_ch1_responses
SELECT COUNT(*) as null_org_count 
FROM hrd_ch1_responses 
WHERE org_code IS NULL;

-- 4.2 ตรวจ CH1 unique constraint
SELECT org_code, round_code, COUNT(*) 
FROM hrd_ch1_responses 
GROUP BY org_code, round_code 
HAVING COUNT(*) > 1;
-- ต้องไม่มี row (1 org = 1 submission per round)
```

## ผลลัพธ์ที่ต้องการ
รายงานผลทดสอบทุกข้อ:
✅ ผ่าน / ❌ ไม่ผ่าน (พร้อมรายละเอียด)
```

</details>

---

## ลำดับการส่ง Prompt ให้ Cowork

```
1. Prompt A → ตรวจ + รัน migrations (ทำก่อนเลย)
2. Prompt B → Deploy Edge Function (ทำพร้อม A ได้)
3. Prompt C → สร้าง 15 org_hr users (ต้องรอ A + B เสร็จ)
4. Prompt D → Seed form_windows (ต้องรอ A เสร็จ)
5. Prompt E → ตรวจ RLS (ต้องรอ A เสร็จ)
6. Prompt F → Vercel redeploy (ทำเมื่อมีไฟล์ใหม่)
7. Prompt G → Full test (ทำหลังสุด)
```

> 📌 หลังจาก Cowork ทำ Prompt A-G เสร็จแล้ว Dev สามารถเริ่มทำงาน Sprint 2 (Admin UI) ได้ทันที
