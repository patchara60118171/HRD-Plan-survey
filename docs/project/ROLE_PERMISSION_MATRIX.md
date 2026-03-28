# ROLE_PERMISSION_MATRIX.md

> Last updated: 2026-03-17

---

## Roles

| Role | Scope | Description |
|---|---|---|
| `super_admin` | Global | Full system control. Manages all settings and structure. |
| `admin` | Global | Day-to-day admin. Manages users, windows, labels. Cannot change question structure. |
| `org_hr` | Own org only | HR ขององค์กร กรอก CH1, ดูข้อมูลองค์กรตัวเอง |

> หมายเหตุ: role `viewer` (legacy) ยังคงอยู่ใน DB constraint เพื่อ backward compatibility แต่ไม่ใช้ใน product direction ใหม่

---

## Permission Matrix

### User Management

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| Create super_admin account | ✅ | ❌ | ❌ |
| Create admin account | ✅ | ✅ | ❌ |
| Create org_hr account | ✅ | ✅ | ❌ |
| Deactivate/reactivate user | ✅ | ✅ (not super_admin) | ❌ |
| Reset password | ✅ | ✅ | ❌ |
| View all users | ✅ | ✅ | ❌ |
| View own account | ✅ | ✅ | ✅ |

Guardrails:
- ไม่สามารถลบ `super_admin` คนสุดท้ายได้
- `org_hr` ต้องมี `org_code` เสมอ
- 1 active `org_hr` ต่อ 1 org (soft rule: deactivate old before creating new)

---

### Organization Management

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| View all organizations | ✅ | ✅ | ❌ |
| View own organization info | ✅ | ✅ | ✅ |
| Create/edit organization | ✅ | ❌ | ❌ |
| Toggle org active/inactive | ✅ | ❌ | ❌ |
| Mark org as is_test | ✅ | ❌ | ❌ |

---

### CH1 Survey

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| View CH1 all orgs | ✅ | ✅ | ❌ |
| View CH1 own org | ✅ | ✅ | ✅ |
| Create/submit CH1 (own org) | ✅ | ✅ (on behalf) | ✅ |
| Edit CH1 draft/reopened (own org) | ✅ | ✅ | ✅ |
| Reopen CH1 (within window) | ✅ | ✅ | ✅ |
| Lock CH1 | ✅ | ✅ | ❌ |
| Delete CH1 | ✅ | ❌ | ❌ |

Rules:
- Reopen อนุญาตเฉพาะเมื่ออยู่ใน `edit_until` window ของ `form_windows`
- Status flow: `draft` → `submitted` → `reopened` → `locked`
- `round_code = 'round_2569'` สำหรับ phase นี้ (1 record per org per round)

---

### Well-being Survey

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| View all responses | ✅ | ✅ | ❌ |
| View own org responses | ✅ | ✅ | ✅ |
| Export all responses | ✅ | ✅ | ❌ |
| Export own org responses | ✅ | ✅ | ✅ |
| Delete responses | ✅ | ❌ | ❌ |

Public respondents: ไม่มี account, submit ผ่านลิงก์เฉพาะองค์กร (anon)

---

### Form Configuration

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| Edit question label text | ✅ | ✅ | ❌ |
| Edit question help text | ✅ | ✅ | ❌ |
| Add new questions | ✅ | ❌ | ❌ |
| Remove questions | ✅ | ❌ | ❌ |
| Change question type | ✅ | ❌ | ❌ |
| Change question keys | ✅ | ❌ | ❌ |

> Warning: การเปลี่ยน question keys จะกระทบ submission data ที่มีอยู่แล้ว ต้องมี migration plan

---

### Form Window Management

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| Set open/close dates | ✅ | ✅ | ❌ |
| Set edit_until date | ✅ | ✅ | ❌ |
| Toggle window active | ✅ | ✅ | ❌ |

---

### Dashboard & Analytics

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| View global dashboard | ✅ | ✅ | ❌ |
| View all-org CH1 status | ✅ | ✅ | ❌ |
| View own org dashboard | ✅ | ✅ | ✅ |
| View test org data | ✅ | ✅ | ✅ (if org_hr of test-org) |
| Filter out test org | ✅ | ✅ | — |

---

### Audit Logs

| Action | super_admin | admin | org_hr |
|---|:---:|:---:|:---:|
| Read audit logs | ✅ | ✅ | ❌ |
| Audit logs are written by | System | System | System |

---

## RLS Implementation Notes

Helper functions ใน DB:
- `requester_email()` — email จาก JWT
- `requester_role()` — role จาก `admin_user_roles`
- `requester_org()` — `org_code` จาก `admin_user_roles` (สำหรับ org_hr)
- `requester_is_admin()` — true ถ้า super_admin หรือ admin
- `requester_is_org_hr()` — true ถ้า org_hr

Policies ที่ใช้ org scoping:
- `hrd_ch1_responses`: org_hr เห็นเฉพาะ row ที่ `org_code = requester_org()` หรือ `organization` ตรงกับ org ของตัวเอง
- `survey_responses`: org_hr เห็นเฉพาะ row ที่ organization ตรงกับ org_name_th ขององค์กรตัวเอง