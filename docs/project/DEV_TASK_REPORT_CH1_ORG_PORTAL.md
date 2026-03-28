# Developer Task Report — CH1 Form บน Org-Portal
**วันที่:** 2026-03-22
**จัดทำโดย:** Cowork Backend Specialist
**Priority:** High — org_hr ยังกรอก CH1 จาก org-portal ไม่ได้

---

## สิ่งที่ Cowork ทำไปแล้ว (ไม่ต้องทำซ้ำ)

| งาน | รายละเอียด |
|-----|-----------|
| ✅ `vercel.json` | `/ch1-form` → `ch1-edit.html` (แก้จาก ch1.html), เพิ่ม `/ch1-preview` → `ch1-preview.html`, `/ch1-individual-pdf` → `ch1-individual-pdf.html` |
| ✅ RLS INSERT hardened | `hrd_insert_authenticated` with_check เปลี่ยนเป็น `org_code = requester_org()` — org_hr insert ได้เฉพาะ org ตัวเองเท่านั้น |

---

## Root Cause Analysis

```
org-portal.html ─── click "กรอก CH1" ───► navigateCh1('new')
                                              │
                                              ▼
                                    window.location.href = '/ch1-form?org=...'
                                              │
                         vercel.json (เดิม)   │   vercel.json (แก้แล้ว)
                         /ch1-form → ch1.html │   /ch1-form → ch1-edit.html ✅
                         (public survey form) │   (org_hr edit form)
```

**ปัญหาเดิม:**
- `/ch1-form` ชี้ไปที่ `ch1.html` (public staff survey) ไม่ใช่ form สำหรับ org_hr
- `/ch1-preview` และ `/ch1-individual-pdf` ไม่มีใน vercel.json → 404

---

## สิ่งที่ Dev ต้องตรวจและทำ

### 1. ตรวจ `ch1-edit.html` รับ org_code จาก URL param ถูกต้องไหม

ไฟล์ `ch1-edit.html` มี logic ดังนี้:
- อ่าน `?org=` จาก URL → `ORG_PARAM`
- ตรวจ session → redirect ไป `org-portal.html` ถ้าไม่ได้ login
- อ่าน `admin_user_roles` → get `userOrgCode`
- INSERT: `formData.org_code = ORG_PARAM || userOrgCode`

**จุดที่ต้องตรวจ:**
```js
// ch1-edit.html L115 (approx)
userOrgCode = roleRow.org_code || null;
```
ตรวจว่า `userOrgCode` ที่ได้จาก DB ตรงกับ `ORG_PARAM` จาก URL ถ้าไม่ตรง → ควร alert หรือ redirect กลับ org-portal

**⚠️ Security note:** ตอนนี้ RLS enforce แล้ว (`org_code = requester_org()`) — ถ้า org_hr พยายาม insert org อื่นจะ error 403 จาก DB ตรงๆ Dev ควรจัดการ error นี้ให้ user-friendly

---

### 2. ตรวจ `ch1-edit.html` อ่าน `admin_user_roles` ตรง

```js
// ch1-edit.html L107
.from('admin_user_roles')
.select('role, org_code, display_name')
```

การอ่านเฉพาะ `role, org_code, display_name` (ไม่ได้อ่าน `initial_password`) → ยังรับได้ ไม่ใช่ security issue

---

### 3. ตรวจ Flow บน localhost:3000

เนื่องจาก `npx serve` ไม่ process `vercel.json` rewrites → route `/ch1-form` จะ 404 บน localhost

**วิธีทดสอบ local แบบถูกต้อง:**

Option A — เปิดไฟล์ตรง:
```
http://localhost:3000/ch1-edit.html?org=dss
http://localhost:3000/ch1-preview.html?org=dss&id=<UUID>
```

Option B — ใช้ vercel dev (recommended):
```bash
npm i -g vercel
vercel dev  # รันที่ port 3000, process vercel.json rewrites
# จากนั้น http://localhost:3000/ch1-form?org=dss จะทำงานได้
```

---

### 4. ตรวจ `ch1-preview.html` และ `ch1-individual-pdf.html` รับ param ครบไหม

`org-portal.html` ส่ง params ดังนี้:
```js
// preview
/ch1-preview?org=${orgCode}&id=${ch1Id}

// pdf
/ch1-individual-pdf?org=${orgCode}&id=${ch1Id}
```

Dev ต้องตรวจว่า `ch1-preview.html` และ `ch1-individual-pdf.html`:
- อ่าน `?org=` และ `?id=` จาก URL
- ตรวจ session ก่อน load (redirect ถ้า unauthenticated)
- Query `hrd_ch1_responses` ด้วย `id` ที่รับมา
- RLS จะ enforce ให้ org_hr เห็นเฉพาะ org ตัวเองโดยอัตโนมัติ

---

### 5. Regression Test หลัง deploy

| ขั้นตอน | คาดหวัง |
|---------|---------|
| Login org_hr (เช่น hr@dss.go.th) | เข้า org-portal ได้ |
| คลิก tab CH1 | เห็น status และปุ่ม "เริ่มกรอก CH1" (ถ้า window เปิด) |
| คลิก "เริ่มกรอก CH1" | redirect ไป `/ch1-form?org=dss` → โหลด `ch1-edit.html` |
| กรอกข้อมูล → บันทึกร่าง | INSERT สำเร็จ, status = draft |
| กรอกข้อมูล → ส่งข้อมูล | UPDATE status = submitted, read-only mode |
| คลิก "ดูข้อมูล" | redirect ไป `/ch1-preview?org=dss&id=...` → โหลด `ch1-preview.html` |
| คลิก "PDF" | redirect ไป `/ch1-individual-pdf?org=dss&id=...` |
| org_hr พยายามกรอก org อื่น (security test) | RLS block → error 403 |

---

## ลำดับการทำงาน

```
1. vercel dev หรือ deploy to Vercel
2. ตรวจ ch1-edit.html รับ ORG_PARAM + session ถูกต้อง
3. ตรวจ ch1-preview.html + ch1-individual-pdf.html รับ params ครบ
4. Regression test ตาม checklist ด้านบน
5. T5 (SSOT sync check) — ตรวจ section count บน production URLs manual
```

---

*อ้างอิง: vercel.json แก้ไขแล้ว (commit หลังจากนี้), RLS hardened ใน Supabase แล้ว*
*Cowork scope: config + DB เสร็จแล้ว — Dev ดำเนินการตรวจ frontend logic ต่อได้เลย*
