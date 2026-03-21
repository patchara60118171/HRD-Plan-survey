# 📋 แผนพัฒนาระบบที่ยังไม่เสร็จ — Well-being Survey

> วันที่: 2026-03-21
> สถานะ: แผนงานรอดำเนินการ
> เวอร์ชัน: 1.0

---

## สารบัญ

1. [ภาพรวมงานที่เหลือ](#1-ภาพรวมงานที่เหลือ)
2. [Sprint 1 — ระบบฐานข้อมูลและ Backend](#sprint-1)
3. [Sprint 2 — Admin UI Features](#sprint-2)
4. [Sprint 3 — ปรับโครงสร้าง Admin Portal](#sprint-3)
5. [Sprint 4 — ความปลอดภัยและทดสอบ](#sprint-4)
6. [Sprint 5 — สถาปัตยกรรมหลายแอป + Mobile](#sprint-5)
7. [Dependencies Map](#dependencies-map)
8. [Prompt สำหรับ Cowork (Supabase + Vercel)](#prompt-สำหรับ-cowork)

---

## 1. ภาพรวมงานที่เหลือ

| # | ฟังก์ชัน | สถานะ | Sprint | ความสำคัญ |
|---|---------|--------|--------|-----------|
| 1 | ซิงก์ข้อมูลเมื่อกลับมาออนไลน์ | กำลังพัฒนา | 1 | สูง |
| 2 | สร้างตารางเวลาการเปิด-ปิดแบบฟอร์ม | กำลังพัฒนา | 2 | สูง |
| 3 | สร้างตารางแก้ข้อความคำถามได้โดยแอดมิน | กำลังพัฒนา | 2 | สูง |
| 4 | รองรับโครงสร้างคำถามจากฐานข้อมูล | กำลังพัฒนา | 1 | สูง |
| 5 | ระบบบันทึกเหตุการณ์แอดมิน (Audit Logs) | กำลังพัฒนา | 2 | กลาง |
| 6 | ระบบรองรับหลายภาษาเบื้องต้น | กำลังพัฒนา | 2 | กลาง |
| 7 | สร้าง username/password 15 หน่วยงาน (org_hr) | รอ | 1 | **สูงมาก** |
| 8 | แยก admin ออกเป็นโมดูล | รอ | 3 | สูง |
| 9 | UI จัดการ form windows ในแอดมิน | รอ | 2 | สูง |
| 10 | UI จัดการ form question overrides | รอ | 2 | สูง |
| 11 | ตรวจสอบ RLS ครบทุกตาราง | รอ | 4 | สูง |
| 12 | ทดสอบระบบอัตโนมัติเต็มรูปแบบ | รอ | 4 | กลาง |
| 13 | ปรับสถาปัตยกรรม Multi-app + Mobile | รอ | 5 | ต่ำ (ระยะยาว) |

---

## Sprint 1 — ระบบฐานข้อมูลและ Backend (สัปดาห์ที่ 1-2) {#sprint-1}

### 1.1 รองรับโครงสร้างคำถามจากฐานข้อมูล

**สถานะปัจจุบัน:** Migration files สร้างแล้ว ยังไม่ได้รันบน Supabase

**ไฟล์ที่เกี่ยวข้อง:**
- `supabase/migrations/20260319_add_form_questions.sql` — สร้างตาราง `form_sections`, `form_questions`
- `supabase/migrations/20260319_seed_form_questions.sql` — Seed คำถาม wellbeing + ch1
- `supabase/migrations/20260319_reconcile_schema.sql` — แก้ schema mismatch
- `js/form-schema.js` — Shared schema loader (สร้างแล้ว)

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ | หมายเหตุ |
|---|------|------------|----------|
| 1a | รัน migration `20260319_add_form_questions.sql` | 🔵 **Cowork** | สร้างตาราง + FK + RLS |
| 1b | รัน seed `20260319_seed_form_questions.sql` | 🔵 **Cowork** | Seed ข้อมูลคำถาม |
| 1c | รัน reconcile `20260319_reconcile_schema.sql` | 🔵 **Cowork** | rename `label_text`→`label_th`, add `is_open` |
| 1d | ตรวจสอบ tables ครบ: `form_sections`, `form_questions` | 🔵 **Cowork** | ใช้ SQL verify |
| 1e | `ch1.html` — เปลี่ยนจาก hardcode เป็น `FormSchema.loadFormSchema('ch1')` | 🟢 **Dev** | ไฟล์: `ch1.html`, `js/ch1-form.js` |
| 1f | `index.html` — เปลี่ยนจาก `js/questions.js` เป็น `FormSchema.loadFormSchema('wellbeing')` | 🟢 **Dev** | ไฟล์: `index.html`, `js/app.js` |
| 1g | เก็บ `js/questions.js` + `js/hrd-ch1-fields.js` ไว้เป็น offline fallback | 🟢 **Dev** | ไม่ลบ ใช้เป็น fallback |

**รายละเอียดสำหรับ Dev (1e-1f):**

```javascript
// ch1.html — เพิ่ม import
<script src="/js/form-schema.js"></script>

// ch1-form.js — เปลี่ยนการโหลดคำถาม
async function loadQuestions() {
    try {
        // Primary: โหลดจาก DB
        const schema = await FormSchema.loadFormSchema('ch1');
        if (schema && schema.sections.length > 0) {
            renderFromSchema(schema);
            return;
        }
    } catch (e) {
        console.warn('DB schema unavailable, using fallback');
    }
    // Fallback: ใช้ hardcoded fields
    renderFromHardcode();
}
```

**เงื่อนไขสำเร็จ:**
- [ ] Query `SELECT COUNT(*) FROM form_questions` ต้องมีข้อมูล
- [ ] `ch1.html` โหลดคำถามจาก DB ได้ + fallback ทำงาน
- [ ] `index.html` โหลดคำถามจาก DB ได้ + fallback ทำงาน

---

### 1.2 สร้าง username/password สำหรับ 15 หน่วยงาน (org_hr)

**สถานะปัจจุบัน:** Migration `20260320_seed_15_organizations.sql` สร้างแล้ว, `20260320_add_initial_password.sql` สร้างแล้ว แต่ยังไม่ได้รัน + ยังไม่มี Edge Function `set-user-password`

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ | หมายเหตุ |
|---|------|------------|----------|
| 2a | ตรวจว่า Edge Function `set-user-password` deploy แล้วหรือยัง | 🔵 **Cowork** | ดูใน Supabase Dashboard |
| 2b | ถ้ายังไม่มี → Deploy `set-user-password` | 🔵 **Cowork** | โค้ดอยู่ที่ `CLAUDE_BACKEND_HANDOFF.md` |
| 2c | รัน `20260320_add_initial_password.sql` | 🔵 **Cowork** | เพิ่ม column `initial_password` |
| 2d | รัน `20260320_seed_15_organizations.sql` | 🔵 **Cowork** | ถ้ายังไม่มี 15 org |
| 2e | สร้าง Auth users 15 คน ผ่าน Edge Function | 🔵 **Cowork** | ดู Prompt ด้านล่าง |
| 2f | บันทึก `initial_password` ลง `admin_user_roles` | 🔵 **Cowork** | เพื่อแอดมินดูรหัสได้ |
| 2g | ทดสอบ login 1-2 org | 🔵 **Cowork** | ผ่าน admin.html → org_hr เห็นเฉพาะ org ตัวเอง |

**รูปแบบ Username/Password ที่ต้องสร้าง:**

| org_code | email (แนะนำ) | password (ตัวอย่าง) | role |
|----------|----------------|---------------------|------|
| dcy | hr@dcy.go.th | DcyHR2569 | org_hr |
| probation | hr@probation.go.th | ProbHR2569 | org_hr |
| rid | hr@rid.go.th | RidHR2569 | org_hr |
| dss | hr@dss.go.th | DssHR2569 | org_hr |
| dcp | hr@dcp.go.th | DcpHR2569 | org_hr |
| dmh | hr@dmh.go.th | DmhHR2569 | org_hr |
| tmd | hr@tmd.go.th | TmdHR2569 | org_hr |
| hssd | hr@hssd.go.th | HssdHR2569 | org_hr |
| ocsc | hr@ocsc.go.th | OcscHR2569 | org_hr |
| nrct | hr@nrct.go.th | NrctHR2569 | org_hr |
| onep | hr@onep.go.th | OnepHR2569 | org_hr |
| tpso | hr@tpso.go.th | TpsoHR2569 | org_hr |
| mots | hr@mots.go.th | MotsHR2569 | org_hr |
| acfs | hr@acfs.go.th | AcfsHR2569 | org_hr |
| nesdc | hr@nesdc.go.th | NesdcHR2569 | org_hr |

> ⚠️ **หมายเหตุ:** email อาจต้องเปลี่ยนเป็น email จริงของ HR แต่ละองค์กร — ต้องตรวจสอบกับเจ้าของโปรเจค

**เงื่อนไขสำเร็จ:**
- [ ] 15 auth users สร้างใน Supabase Auth
- [ ] 15 records ใน `admin_user_roles` ที่ role = `org_hr` + มี `org_code`
- [ ] Login ด้วย org_hr → เห็นแค่ org ตัวเอง
- [ ] `initial_password` บันทึกแล้ว (แอดมินดูได้จาก admin panel)

---

### 1.3 ซิงก์ข้อมูลเมื่อกลับมาออนไลน์

**สถานะปัจจุบัน:** `sw.js` (Service Worker) มี framework สำหรับ Background Sync อยู่แล้ว แต่:
- `syncFormData()` เรียก `/api/submit` ซึ่งไม่มี endpoint จริง (ใช้ Supabase ตรง)
- IndexedDB store `WellbeingSurveyDB` มีโครงสร้างแล้ว
- ยังไม่มี logic ฝั่ง `app.js` / `ch1-form.js` ที่เก็บข้อมูลลง IndexedDB เมื่อ offline

**ไฟล์ที่ต้องแก้ไข:**
- `sw.js` — ปรับ sync endpoint ให้ตรงกับ Supabase
- `js/app.js` — เพิ่ม offline detection + save to IndexedDB
- `js/ch1-form.js` — เพิ่ม draft save ลง IndexedDB
- `js/progress-persistence.js` — อาจ merge logic

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ |
|---|------|------------|
| 3a | `sw.js` — เปลี่ยน `syncFormData()` ให้ส่งตรงไป Supabase แทน `/api/submit` | 🟢 **Dev** |
| 3b | `js/app.js` — เพิ่ม `navigator.onLine` check ก่อน submit | 🟢 **Dev** |
| 3c | ถ้า offline → save ลง IndexedDB พร้อม timestamp | 🟢 **Dev** |
| 3d | เมื่อกลับ online → trigger Background Sync | 🟢 **Dev** |
| 3e | แสดง UI indicator (🔴 Offline / 🟢 Online / 🔄 Syncing) | 🟢 **Dev** |
| 3f | `ch1-form.js` — เพิ่ม auto-save draft ลง IndexedDB ทุก 30 วินาที | 🟢 **Dev** |
| 3g | ทดสอบ: ปิด network → กรอกฟอร์ม → เปิด network → ข้อมูลไป DB | 🟢 **Dev** |

**รายละเอียดสำหรับ Dev (3a):**

```javascript
// sw.js — แก้ syncFormData()
async function syncFormData() {
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
        if (data.synced) continue;
        
        try {
            const { formType, formData, orgCode } = data;
            
            // ส่งตรงไป Supabase
            const supabaseUrl = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
            const supabaseAnonKey = '...'; // จาก env
            
            const tableName = formType === 'ch1' 
                ? 'hrd_ch1_responses' 
                : 'survey_responses';
            
            const response = await fetch(
                `${supabaseUrl}/rest/v1/${tableName}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${data.authToken}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(formData)
                }
            );
            
            if (response.ok) {
                data.synced = true;
            }
        } catch (error) {
            console.error('[SW] Sync failed for:', data.id, error);
        }
    }
    
    await saveOfflineData(offlineData);
    notifyClients('SYNC_COMPLETE');
}
```

**เงื่อนไขสำเร็จ:**
- [ ] Well-being survey: กรอก offline → online → data ไปถึง Supabase
- [ ] CH1: draft save offline → online → sync สำเร็จ
- [ ] มี visual indicator สถานะ online/offline
- [ ] ไม่มี data loss

---

## Sprint 2 — Admin UI Features (สัปดาห์ที่ 3-4) {#sprint-2}

### 2.1 UI จัดการ form windows (ตารางเวลาเปิด-ปิด)

**สถานะปัจจุบัน:** ตาราง `form_windows` สร้างแล้วใน DB, admin.html มี section สำหรับ form windows เตรียมไว้แล้วบางส่วน

**ไฟล์ที่ต้องแก้ไข:**
- `admin.html` — เพิ่ม/ปรับ section "ตั้งเวลาฟอร์ม"

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ |
|---|------|------------|
| 4a | ตรวจ column `form_windows` ว่ามี `is_open` หรือ `is_active` | 🔵 Cowork (SQL check) |
| 4b | สร้าง UI table แสดง form windows ทั้งหมด | 🟢 **Dev** |
| 4c | ฟอร์ม create/edit window: form_code, org_code, opens_at, closes_at, edit_until | 🟢 **Dev** |
| 4d | ปุ่ม toggle เปิด/ปิด window | 🟢 **Dev** |
| 4e | Badge แสดงสถานะ: 🟢 กำลังเปิด / 🔴 ปิดแล้ว / ⏳ ยังไม่ถึงเวลา | 🟢 **Dev** |
| 4f | Filter ตาม form_code (wellbeing, ch1) | 🟢 **Dev** |
| 4g | RLS check: เฉพาะ admin/super_admin แก้ได้ | 🔵 Cowork (อาจต้องเพิ่ม policy) |

**Mockup UI:**

```
┌─────────────────────────────────────────────────────────┐
│  📅 ตั้งเวลาเปิด-ปิดแบบฟอร์ม                          │
├────────────────────────────────────────────────────────── │
│ ┌──────┐ ┌──────┐                                       │
│ │ CH1  │ │ WB   │  ← Filter tabs                       │
│ └──────┘ └──────┘                                       │
│                                                         │
│ ┌─────────┬──────────────┬──────────┬──────────┬───────┐│
│ │ องค์กร  │ เปิดรับ       │ ปิดรับ   │ แก้ไขถึง │ สถานะ  ││
│ ├─────────┼──────────────┼──────────┼──────────┼───────┤│
│ │ NESDC  │ 01/01/2569   │ 31/12/69 │ 31/12/69 │ 🟢    ││
│ │ OPDC   │ 01/01/2569   │ 31/12/69 │ 31/12/69 │ 🟢    ││
│ └─────────┴──────────────┴──────────┴──────────┴───────┘│
│                                                         │
│ [+ เพิ่ม Window]  [📥 Seed ทุกองค์กร]                   │
└─────────────────────────────────────────────────────────┘
```

**เงื่อนไขสำเร็จ:**
- [ ] แอดมินเห็นตาราง form_windows ทั้งหมด
- [ ] สร้าง/แก้ไข/toggle window ได้
- [ ] สถานะ badge แสดงถูกต้องตามเวลาปัจจุบัน
- [ ] org_hr ไม่เห็นหน้านี้

---

### 2.2 UI จัดการ form question overrides

**สถานะปัจจุบัน:** ตาราง `form_question_overrides` สร้างแล้ว, admin.html มี section "จัดการข้อคำถาม" เตรียมไว้

**ไฟล์ที่ต้องแก้ไข:**
- `admin.html` — ปรับ section "จัดการข้อคำถาม"
- `js/form-schema.js` — ใช้ในการโหลด/merge overrides

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ |
|---|------|------------|
| 5a | โหลด `form_questions` + merge กับ `form_question_overrides` | 🟢 **Dev** |
| 5b | แสดงตารางคำถาม: question_key, label ปัจจุบัน, label override | 🟢 **Dev** |
| 5c | Inline editing: click แล้วแก้ label_th/label_en/help_text | 🟢 **Dev** |
| 5d | Save → upsert เข้า `form_question_overrides` | 🟢 **Dev** |
| 5e | ปุ่ม "Reset เป็นค่าเริ่มต้น" (ลบ override) | 🟢 **Dev** |
| 5f | Filter/search คำถาม | 🟢 **Dev** |
| 5g | Permission: admin แก้ label ได้, super_admin แก้โครงสร้างได้ | 🟢 **Dev** |

**Mockup UI:**

```
┌──────────────────────────────────────────────────────────────┐
│  📝 จัดการข้อคำถาม                                           │
├───────────────────────────────────────────────────────────────│
│ Form: [CH1 ▼]     ส่วน: [ทั้งหมด ▼]   🔍 ค้นหา: [.......] │
│                                                              │
│ ┌──────────┬──────────────────────┬────────────────────┬────┐│
│ │ Key      │ Label เดิม           │ Label ที่แก้ไข     │ ⚙️  ││
│ ├──────────┼──────────────────────┼────────────────────┼────┤│
│ │ q1_1     │ จำนวนข้าราชการ       │ [📝 click แก้ไข]   │ 🔄 ││
│ │ q1_2     │ จำนวนพนักงานราชการ   │ จำนวนพนง.ราชการ    │ 🔄 ││
│ └──────────┴──────────────────────┴────────────────────┴────┘│
│                                                              │
│ ℹ️ แก้ไข label ได้โดยไม่กระทบข้อมูลเดิม                       │
└──────────────────────────────────────────────────────────────┘
```

**เงื่อนไขสำเร็จ:**
- [ ] แอดมินเห็นคำถามทั้งหมดจาก DB
- [ ] แก้ไข label text ได้ + save สำเร็จ
- [ ] Override ไม่กระทบ question_key และ submission data เดิม
- [ ] Reset ลบ override ได้

---

### 2.3 ระบบบันทึกเหตุการณ์แอดมิน (Audit Logs)

**สถานะปัจจุบัน:** ตาราง `admin_audit_logs` มีอยู่แล้ว แต่ยังไม่มี UI แสดงผล และยังไม่มี logic เขียน log จาก frontend actions

**ไฟล์ที่ต้องแก้ไข:**
- `admin.html` — เพิ่ม section Audit Logs + เพิ่ม log writes ในทุก action

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ |
|---|------|------------|
| 6a | ตรวจ schema `admin_audit_logs` ว่ามี columns อะไร | 🔵 Cowork |
| 6b | สร้าง function `writeAuditLog(action, details, targetEmail)` | 🟢 **Dev** |
| 6c | เรียก `writeAuditLog` ใน actions ต่อไปนี้: | 🟢 **Dev** |
|    | - สร้าง user | | |
|    | - deactivate/reactivate user | | |
|    | - reset password | | |
|    | - แก้ไข form window | | |
|    | - แก้ไข question label | | |
|    | - lock/reopen CH1 | | |
| 6d | สร้าง UI หน้า Audit Logs: ตาราง + filter ตาม action/date/user | 🟢 **Dev** |
| 6e | เฉพาะ admin/super_admin เห็น | 🟢 **Dev** |
| 6f | Pagination (50 per page) | 🟢 **Dev** |

**Function writeAuditLog:**

```javascript
async function writeAuditLog(action, details = {}, targetEmail = null) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('admin_audit_logs').insert({
            action: action,
            performed_by: user?.email,
            target_email: targetEmail,
            details: JSON.stringify(details),
            created_at: new Date().toISOString()
        });
    } catch (e) {
        console.error('Audit log failed:', e);
    }
}
```

**เงื่อนไขสำเร็จ:**
- [ ] ทุก admin action เขียน audit log
- [ ] หน้า Audit Logs แสดงข้อมูลถูกต้อง
- [ ] Filter/search ใช้งานได้
- [ ] org_hr ไม่เห็นหน้า Audit Logs

---

### 2.4 ระบบรองรับหลายภาษาเบื้องต้น

**สถานะปัจจุบัน:**
- `js/i18n.js` — สร้างแล้ว มี class `I18n` พร้อม `t()`, `translateDOM()`, language switcher
- `js/locales/th.json` — มีแล้ว (7.6KB)
- `js/locales/en.json` — มีแล้ว (4.6KB)
- ยังไม่ได้ integrate จริงเข้ากับ `index.html` (Well-being form)

**ไฟล์ที่ต้องแก้ไข:**
- `index.html` — เพิ่ม `<script src="js/i18n.js">` + `data-i18n` attributes
- `js/app.js` — เรียก `i18n.init()` ตอน startup
- `js/locales/th.json` — เพิ่ม key สำหรับคำถาม survey
- `js/locales/en.json` — เพิ่ม key สำหรับคำถาม survey (English)

**ขั้นตอนดำเนินการ:**

| # | งาน | ผู้รับผิดชอบ |
|---|------|------------|
| 7a | เพิ่ม `<script src="js/i18n.js">` ใน `index.html` | 🟢 **Dev** |
| 7b | เพิ่ม `data-i18n` attributes ให้ static text ทั้งหมด | 🟢 **Dev** |
| 7c | เพิ่ม language keys ใน `th.json` / `en.json` สำหรับ: | 🟢 **Dev** |
|    | - หัวข้อส่วนต่างๆ ของ Well-being form | | |
|    | - ปุ่ม / labels | | |
|    | - ข้อความ error / success | | |
| 7d | เพิ่ม language switcher UI ที่มุมบนขวา | 🟢 **Dev** |
| 7e | เรียก `i18n.init()` ใน `app.js` | 🟢 **Dev** |
| 7f | ทดสอบสลับภาษา TH ↔ EN | 🟢 **Dev** |
| 7g | CH1 + Admin: เตรียม i18n keys แต่ยังไม่ต้องแปลทั้งหมด (Phase 2) | 🟢 **Dev** |

**เงื่อนไขสำเร็จ:**
- [ ] Well-being survey สลับ TH/EN ได้
- [ ] ภาษาถูก persist ข้าม session (localStorage)
- [ ] Fallback ไปภาษาไทยถ้าไม่มี key
- [ ] ไม่ break layout เมื่อสลับภาษา

---

## Sprint 3 — ปรับโครงสร้าง Admin Portal (สัปดาห์ที่ 5-6) {#sprint-3}

### 3.1 แยก admin ออกจากไฟล์เดียวเป็นโมดูล

**สถานะปัจจุบัน:** `admin.html` = **392KB** (ไฟล์เดียว) มี inline CSS + JS ทั้งหมด

**เป้าหมาย:** แยกเป็นโครงสร้างตาม `PROPOSED_PROJECT_STRUCTURE.md`

**ขั้นตอน (ทำทีละส่วน ไม่ rewrite ทีเดียว):**

#### Phase 3A — แยก CSS (สัปดาห์ 5 ต้น)

| # | งาน | Build impact |
|---|------|-------------|
| 8a | Extract inline `<style>` ทั้งหมดออกเป็น `admin/assets/css/admin.css` | ต่ำ |
| 8b | เพิ่ม `<link rel="stylesheet" href="admin/assets/css/admin.css">` ใน `admin.html` | ต่ำ |
| 8c | ตรวจว่า CSS ไม่ broken หลัง extract | ต่ำ |

#### Phase 3B — แยก JS Services (สัปดาห์ 5 ปลาย)

| # | ไฟล์ใหม่ | Logic ที่ย้าย |
|---|---------|-------------|
| 8d | `admin/js/services/auth.service.js` | Login, logout, session, requireSession |
| 8e | `admin/js/services/users.service.js` | CRUD users, reset password, roles |
| 8f | `admin/js/services/orgs.service.js` | Organizations CRUD |
| 8g | `admin/js/services/forms.service.js` | Form windows, question overrides |
| 8h | `admin/js/services/analytics.service.js` | Dashboard data, charts |
| 8i | `admin/js/services/export.service.js` | CSV/Excel export |
| 8j | `admin/js/services/audit.service.js` | Audit log read/write |

#### Phase 3C — แยก Pages (สัปดาห์ 6)

| # | ไฟล์ใหม่ | หน้าที่ |
|---|---------|--------|
| 8k | `admin/js/pages/dashboard.page.js` | หน้า Dashboard |
| 8l | `admin/js/pages/users.page.js` | หน้า จัดการผู้ใช้ |
| 8m | `admin/js/pages/organizations.page.js` | หน้า องค์กร |
| 8n | `admin/js/pages/links.page.js` | หน้า ลิงก์ |
| 8o | `admin/js/pages/wellbeing.page.js` | หน้า Well-being data |
| 8p | `admin/js/pages/ch1.page.js` | หน้า CH1 data |
| 8q | `admin/js/pages/settings.page.js` | หน้า ตั้งค่า |

**กฎสำคัญ:**
- ❌ ห้ามย้าย `admin.html` ออกจาก root จนกว่าจะเสร็จ Sprint ทั้งหมด
- ❌ ห้ามเปลี่ยน route `/admin`
- ✅ ใช้ `<script src="admin/js/services/xxx.js">` แยกโหลด
- ✅ ทดสอบทุก page หลังแยกทุกครั้ง

**เงื่อนไขสำเร็จ:**
- [ ] `admin.html` ลดขนาดลงอย่างน้อย 70%
- [ ] ทุกหน้าทำงานเหมือนเดิม
- [ ] Code อ่านง่ายขึ้น แก้ไขได้แม่นยำขึ้น

---

## Sprint 4 — ความปลอดภัยและทดสอบ (สัปดาห์ที่ 7-8) {#sprint-4}

### 4.1 ตรวจสอบความปลอดภัย RLS ครบทุกตาราง

**ตาราง + RLS Status ที่ต้องตรวจ:**

| ตาราง | RLS Enabled? | Policies ที่ต้องมี |
|-------|:------------:|-------------------|
| `organizations` | ต้องตรวจ | admin: full access, org_hr: เห็นเฉพาะ org ตัวเอง |
| `admin_user_roles` | ✅ มีแล้ว | admin: CRUD, org_hr: อ่านตัวเอง |
| `hrd_ch1_responses` | ✅ มีแล้ว | org_hr: เฉพาะ org ตัวเอง |
| `survey_responses` | ✅ มีแล้ว | org_hr: เฉพาะ org ตัวเอง |
| `org_form_links` | ต้องตรวจ | admin: CRUD, org_hr: อ่านเฉพาะ org |
| `survey_forms` | ต้องตรวจ | admin: update labels, super_admin: full |
| `form_windows` | ต้องตรวจ | admin: CRUD, org_hr: อ่านเฉพาะ org |
| `form_question_overrides` | ต้องตรวจ | admin: CRUD, org_hr: อ่านอย่างเดียว |
| `form_questions` | ต้องตรวจ | public read, admin edit |
| `form_sections` | ต้องตรวจ | public read, admin edit |
| `admin_audit_logs` | ต้องตรวจ | admin: อ่านอย่างเดียว, system: insert |

**ขั้นตอน:**

| # | งาน | ผู้รับผิดชอบ |
|---|------|------------|
| 9a | Query RLS status ทุกตาราง | 🔵 **Cowork** |
| 9b | ระบุตารางที่ยังไม่มี RLS / policy ไม่ครบ | 🔵 **Cowork** |
| 9c | เขียน migration SQL เพิ่ม policies ที่ขาด | 🟢 **Dev** (เขียนไฟล์) |
| 9d | รัน migration + ทดสอบ | 🔵 **Cowork** |
| 9e | Penetration test: org_hr พยายามเข้าถึง org อื่น | 🟢 **Dev** + 🔵 **Cowork** |

**SQL ตรวจ RLS:**
```sql
-- ตรวจว่า RLS เปิดอยู่
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- ดู policies ทั้งหมด
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

### 4.2 ทดสอบระบบอัตโนมัติเต็มรูปแบบ

**สถานะปัจจุบัน:** มี `scripts/audit/smoke-test.js` แต่ยังไม่ครอบคลุม + ใช้ `playwright-submit-*.js` สำหรับ form test

**แผนทดสอบ:**

#### Smoke Tests (ต้องผ่านทุกครั้งก่อน deploy)

| # | Test Case | ไฟล์ |
|---|-----------|------|
| T1 | `GET /` → returns 200, มี survey form | `tests/smoke/public-survey.test.js` |
| T2 | `GET /ch1?org=test-org` → returns 200, มี CH1 form | `tests/smoke/ch1-survey.test.js` |
| T3 | `GET /admin` → returns 200, มี login form | `tests/smoke/admin.test.js` |
| T4 | Login org_hr → เห็นเฉพาะ org ตัวเอง | `tests/smoke/org-hr-scope.test.js` |
| T5 | Login admin → เห็นทุก org | `tests/smoke/admin-scope.test.js` |

#### E2E Tests (รันเป็นระยะ)

| # | Test Case | ไฟล์ |
|---|-----------|------|
| E1 | Well-being form submit → data อยู่ใน DB | `tests/e2e/wellbeing-submit.test.js` |
| E2 | CH1 draft → submit → lock lifecycle | `tests/e2e/ch1-lifecycle.test.js` |
| E3 | Admin สร้าง user → org_hr login ได้ | `tests/e2e/user-management.test.js` |
| E4 | Form window ปิด → form ไม่รับส่ง | `tests/e2e/form-window.test.js` |
| E5 | Offline → Online sync | `tests/e2e/offline-sync.test.js` |

**Tech stack ที่แนะนำ:**
- `playwright` (ติดตั้งแล้ว ใน `package.json`)
- `node:test` (built-in, ไม่ต้อง install)

**เงื่อนไขสำเร็จ:**
- [ ] `npm test` รัน smoke tests ผ่านทั้งหมด
- [ ] CI/CD pipeline ผูก smoke tests (optional)
- [ ] ทุก core flow มี E2E test ครอบคลุม

---

## Sprint 5 — สถาปัตยกรรม Multi-app + Mobile (สัปดาห์ที่ 9+) {#sprint-5}

### 5.1 ปรับสถาปัตยกรรมสู่โครงสร้างหลายแอป

> ⚠️ **Sprint นี้เป็นระยะยาว ไม่ต้องทำจนกว่า Sprint 1-4 จะเสร็จ**

**เป้าหมาย:** ย้ายจาก root-level files → `apps/` structure ตามที่ออกแบบไว้ใน `PROPOSED_PROJECT_STRUCTURE.md`

**ขั้นตอน:**

| # | Phase | งาน |
|---|-------|------|
| 10a | Prepare | สร้าง `vercel.json` rewrites สำหรับ multi-app paths |
| 10b | Move Survey | ย้าย `index.html` → `apps/public-survey/index.html` |
| 10c | Move CH1 | ย้าย `ch1.html` → `apps/ch1-survey/index.html` |
| 10d | Move Admin | ย้าย `admin.html` → `apps/admin-portal/index.html` |
| 10e | Shared | รวม shared utils เข้า `shared/` |
| 10f | Verify | ทุก route ยังทำงาน: `/`, `/ch1`, `/admin` |

### 5.2 รองรับ Mobile

| # | งาน | หมายเหตุ |
|---|------|----------|
| 11a | PWA manifest + icons | `manifest.json` |
| 11b | Responsive CSS ทุกหน้า | Mobile-first |
| 11c | Touch-friendly UI | ปุ่ม ≥ 44px, swipe gestures |
| 11d | Performance optimization | Lazy load, code splitting |
| 11e | App-like navigation | Bottom nav bar |

---

## Dependencies Map {#dependencies-map}

```
Sprint 1 (DB + Backend)
  ├── 1.1 Form Questions → ต้องรัน migrations ก่อน
  ├── 1.2 15 org_hr → ต้องมี Edge Function + organizations table
  └── 1.3 Offline Sync → ต้องมี form questions ก่อน
         │
         ▼
Sprint 2 (Admin UI)
  ├── 2.1 Form Windows UI → ต้องมี form_windows table (✓)
  ├── 2.2 Question Overrides UI → ต้องมี form_questions (Sprint 1.1)
  ├── 2.3 Audit Logs → ต้องมี admin_audit_logs table (✓)
  └── 2.4 i18n → ไม่มี dependency
         │
         ▼
Sprint 3 (Admin Modular)
  └── 3.1 แยก admin → ควรทำหลัง Sprint 2 เพราะมี code ใหม่เข้ามา
         │
         ▼
Sprint 4 (Security + Testing)
  ├── 4.1 RLS Audit → ทำพร้อมกับ Sprint 1-3 ได้
  └── 4.2 Automated Tests → ต้องมี features ครบก่อน
         │
         ▼
Sprint 5 (Multi-app + Mobile) → ทำสุดท้าย
```

---

## Prompt สำหรับ Cowork (Supabase + Vercel) {#prompt-สำหรับ-cowork}

> 💡 **Prompt แยกไว้ในไฟล์** `COWORK_PROMPTS.md`
> ใช้คัดลอกส่งให้ Cowork ที่มี MCP เชื่อมต่อ Supabase + Vercel

---

## สรุป Timeline

```
สัปดาห์ 1-2:  Sprint 1 — DB migrations, 15 org_hr, offline sync
สัปดาห์ 3-4:  Sprint 2 — Admin UI (windows, questions, audit, i18n)
สัปดาห์ 5-6:  Sprint 3 — Admin modularization
สัปดาห์ 7-8:  Sprint 4 — RLS audit + automated tests
สัปดาห์ 9+:   Sprint 5 — Multi-app architecture + Mobile (ระยะยาว)
```

> ✅ งานที่ Cowork (MCP) ต้องดำเนินการแยกไว้ใน `COWORK_PROMPTS.md`
> ✅ งานที่ Dev ทำเองระบุด้วย 🟢 ในแต่ละตาราง
