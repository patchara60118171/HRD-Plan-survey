# CH1_LIFECYCLE.md

> Last updated: 2026-03-17

---

## Overview

CH1 (HRD บทที่ 1) คือแบบสำรวจข้อมูลองค์กรด้านการพัฒนาบุคลากร กรอกโดย HR ขององค์กร

**Business Rule หลัก:**
- **1 องค์กร = 1 submission ต่อ round**
- Round ปัจจุบัน: `round_2569` (ปี พ.ศ. 2569)
- Reopen/edit อัปเดต record เดิม ไม่สร้างใหม่
- Unique constraint: `(organization, round_code)` สำหรับ live submissions

---

## Lifecycle States

```
draft ──► submitted ──► locked
              │               ▲
              └──► reopened ──┘
```

| Status | คำอธิบาย | ใครเปลี่ยนได้ |
|---|---|---|
| `draft` | กรอกบางส่วน ยังไม่ submit | org_hr, admin, super_admin |
| `submitted` | Submit เรียบร้อย | org_hr, admin, super_admin |
| `reopened` | เปิดให้แก้ไข (ภายใน edit window) | admin, super_admin, org_hr (ใน window) |
| `locked` | ปิดถาวร ไม่สามารถแก้ได้ | admin, super_admin เท่านั้น |

---

## Key Fields

```sql
-- เพิ่มใน Phase 2026-03-17 migration
hrd_ch1_responses:
  round_code    text DEFAULT 'round_2569'    -- รอบการรายงาน
  status        text DEFAULT 'submitted'     -- draft | submitted | reopened | locked
  last_saved_at timestamptz                  -- เวลา save ล่าสุด
  reopened_at   timestamptz                  -- เวลาที่ reopen
  locked_at     timestamptz                  -- เวลาที่ lock
  updated_by    text                         -- email ที่แก้ล่าสุด
  org_code      text                         -- FK to organizations.org_code (nullable ระหว่าง migration)
```

Fields เดิมที่ยังใช้อยู่:
- `organization` — org name (text, legacy, ยังคงเป็น primary org identifier)
- `is_test` — true = test submission
- `submission_mode` — 'live' | 'test'
- `submitted_at` — เวลา submit

---

## Reopen Rules

Reopen ทำได้เมื่อ:
1. Current time อยู่ภายใน `form_windows.edit_until` ของ `form_code='ch1'`, `round_code='round_2569'`
2. Status ปัจจุบันเป็น `submitted` (ไม่ใช่ `locked`)

Logic ตรวจ edit window:
```javascript
const window = await supabase
  .from('form_windows')
  .select('edit_until, closes_at, is_active')
  .eq('form_code', 'ch1')
  .eq('round_code', 'round_2569')
  .eq('is_active', true)
  .single();

const canEdit = window.edit_until 
  ? new Date() <= new Date(window.edit_until) 
  : window.closes_at 
    ? new Date() <= new Date(window.closes_at) 
    : true; // no window set = always open
```

---

## Data Integrity

Unique constraint (DB level):
```sql
CREATE UNIQUE INDEX hrd_ch1_unique_org_round
  ON hrd_ch1_responses (organization, round_code)
  WHERE submission_mode = 'live' AND is_test = false;
```

Application level: ก่อน INSERT ให้ตรวจว่ามี record อยู่แล้วหรือไม่ ถ้ามี → UPDATE แทน

---

## Test vs Production

| Field | Production | Test |
|---|---|---|
| `is_test` | `false` | `true` |
| `submission_mode` | `'live'` | `'test'` |
| Included in unique constraint | ✅ | ❌ |
| Synced to Google Sheets | ✅ | ❌ |
| Shown in official reports | ✅ | ❌ (filter `is_test=false`) |

---

## Single Round Architecture

Phase นี้ใช้ `round_code = 'round_2569'` เป็น fixed value

เหตุผล:
- Business ต้องการเพียง 1 รอบในขอบเขตนี้
- ไม่ over-engineer ระบบ multi-cycle
- เมื่อต้องการรอบใหม่ในอนาคต: เพิ่ม row ใน `form_windows` + migration เพิ่ม round code ใหม่

---

## Google Sheets Sync

CH1 submissions ที่ `submitted_at IS NOT NULL` และ `is_test = false` จะ trigger sync ไปยัง Google Sheets ผ่าน Edge Function (trigger: `sync_ch1_to_google_sheets`)

Sync ไม่เกิดขึ้นเมื่อ:
- `is_test = true`
- `submission_mode = 'test'`
- `submitted_at IS NULL`