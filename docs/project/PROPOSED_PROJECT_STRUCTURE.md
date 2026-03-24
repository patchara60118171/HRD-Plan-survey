# PROPOSED PROJECT STRUCTURE

## วัตถุประสงค์
เอกสารนี้เสนอการจัดโครงสร้างโปรเจคใหม่สำหรับระบบ Well-being Survey / HRD Survey เพื่อแก้ปัญหาโค้ดปนกันหลายแนว, source of truth ไม่ชัด, route และ docs ไม่ sync, และทำให้การพัฒนาระยะต่อไปปลอดภัยขึ้น

---

# 1) ปัญหาของโครงสร้างปัจจุบัน

โครงสร้างปัจจุบันมีลักษณะดังนี้:

- `index.html`, `ch1.html`, `admin.html` อยู่ root เดียวกัน
- `admin.html` มี inline CSS และ inline JavaScript จำนวนมาก
- มีไฟล์ `js/modules/*` อีกชุดที่ไม่ได้เป็น runtime หลักชัดเจน
- scripts สำหรับ dev, seed, cleanup, audit, sync ปะปนกัน
- เอกสารบางส่วนอธิบายระบบไม่ตรงกับ runtime จริง
- route บางจุด เช่น `admin-login` ไม่สอดคล้องกับไฟล์จริง

ผลที่ตามมา:

- แก้ไขยาก
- review ยาก
- คนใหม่เข้าใจระบบช้า
- มีโอกาสแก้ผิดไฟล์สูง
- AI/dev คนถัดไปมีโอกาสสร้างโค้ดซ้ำหรือวางผิดที่

---

# 2) หลักการออกแบบโครงสร้างใหม่

โครงสร้างใหม่ควรยึดหลักดังนี้:

- แยกตาม **ขอบเขตของแอป** ไม่ใช่กองไฟล์รวม
- แต่ละแอปมี **entry point ชัดเจน**
- shared code ต้องอยู่ที่เดียว
- backend / infra ต้องแยกจาก frontend
- scripts ต้องแยกตามประเภทการใช้งานและระดับความเสี่ยง
- legacy code ต้องถูกประกาศชัดเจนว่าไม่ใช่ source of truth

---

# 3) โครงสร้างที่แนะนำ

```text
well-being-survey/
├── apps/
│   ├── public-survey/
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   │       ├── main.js
│   │       ├── questions.js
│   │       ├── renderers/
│   │       ├── services/
│   │       └── utils/
│   │
│   ├── ch1-survey/
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   │       ├── main.js
│   │       ├── form/
│   │       ├── upload/
│   │       ├── validation/
│   │       ├── services/
│   │       └── utils/
│   │
│   └── admin-portal/
│       ├── index.html
│       ├── login.html
│       ├── css/
│       └── js/
│           ├── main.js
│           ├── pages/
│           ├── components/
│           ├── services/
│           ├── state/
│           └── utils/
│
├── shared/
│   ├── config/
│   │   ├── supabase.js
│   │   ├── routes.js
│   │   └── constants.js
│   ├── org/
│   │   └── org-meta.js
│   ├── ui/
│   │   ├── toast.js
│   │   ├── modal.js
│   │   ├── loading.js
│   │   └── table.js
│   └── utils/
│       ├── dom.js
│       ├── format.js
│       ├── storage.js
│       └── validate.js
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/
│   │   ├── functions/
│   │   ├── policies/
│   │   └── seeds/
│   └── apps-script/
│
├── scripts/
│   ├── dev/
│   ├── ops/
│   ├── audit/
│   └── one-off/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── deployment/
│   ├── product/
│   └── legacy/
│
├── tests/
│   ├── smoke/
│   └── e2e/
│
├── public/
│   └── assets/
│
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

---

# 4) ความหมายของแต่ละส่วน

## `apps/public-survey/`
สำหรับแบบสำรวจสุขภาวะรายบุคคล

Source of truth ของส่วนนี้ควรอยู่ที่นี่ทั้งหมด เช่น:
- คำถาม
- ตัว render UI
- submit logic
- helper ที่เฉพาะกับ public survey

## `apps/ch1-survey/`
สำหรับแบบสำรวจ HRD บทที่ 1

ควรแยก concern ภายในเป็น:
- form flow
- validation
- totals calculation
- PDF upload
- submit service
- org mapping

## `apps/admin-portal/`
สำหรับหลังบ้าน

ควรแยกเป็น:
- login
- dashboard
- organizations
- users
- settings
- analytics
- data tables
- exports

ไม่ควรเก็บทุกอย่างใน `admin.html` ไฟล์เดียวในระยะยาว

## `shared/`
เก็บของใช้ร่วมจริง เช่น:
- supabase config
- org metadata
- toast / modal / loading
- formatting helpers
- storage helpers
- validation helper พื้นฐาน

## `backend/`
เก็บ infrastructure และ integration ฝั่ง backend เช่น:
- Supabase migrations
- Edge functions
- SQL policies
- Google Apps Script

## `scripts/`
แยกให้ชัดว่าอะไรใช้ทำอะไร เช่น:
- `dev/` สำหรับ local development และ seed ข้อมูลทดสอบ
- `ops/` สำหรับสคริปต์ operational จริง
- `audit/` สำหรับตรวจ schema / readiness / report
- `one-off/` สำหรับงานแก้ครั้งเดียว

---

# 5) Source of truth ที่ควรกำหนดใหม่

## Public Survey
- HTML หลัก: `apps/public-survey/index.html`
- JS entry: `apps/public-survey/js/main.js`

## CH1 Survey
- HTML หลัก: `apps/ch1-survey/index.html`
- JS entry: `apps/ch1-survey/js/main.js`

## Admin Portal
- HTML หลัก: `apps/admin-portal/index.html`
- Login page: `apps/admin-portal/login.html`
- JS entry: `apps/admin-portal/js/main.js`

## Shared Config
- Supabase config: `shared/config/supabase.js`
- Org metadata: `shared/org/org-meta.js`

## Backend
- Database / functions / policies: `backend/supabase/*`

---

# 6) โครงสร้างภายใน admin ที่แนะนำ

```text
apps/admin-portal/js/
├── main.js
├── state/
│   └── store.js
├── services/
│   ├── auth.service.js
│   ├── users.service.js
│   ├── orgs.service.js
│   ├── wellbeing.service.js
│   ├── ch1.service.js
│   ├── analytics.service.js
│   └── export.service.js
├── pages/
│   ├── dashboard.page.js
│   ├── users.page.js
│   ├── organizations.page.js
│   ├── links.page.js
│   ├── wellbeing.page.js
│   ├── ch1.page.js
│   ├── analytics.page.js
│   └── settings.page.js
├── components/
│   ├── sidebar.js
│   ├── topbar.js
│   ├── modal.js
│   ├── table.js
│   ├── chart.js
│   └── toast.js
└── utils/
    ├── dom.js
    ├── guard.js
    ├── format.js
    └── permissions.js
```

ข้อดี:
- หน้าไหน logic ของหน้านั้น
- state ชัดขึ้น
- service layer ชัดขึ้น
- ลดการแก้โค้ดกองรวม

---

# 7) Product direction ที่ควรรองรับในโครงสร้างใหม่

จากแนวคิดการใช้งานของระบบ ควรรองรับสิ่งต่อไปนี้โดยตรง

## A. บัญชี HR รายองค์กร
ระบบควรมี user ของแต่ละองค์กร ไม่ใช่มีแต่ admin กลาง

แนวทาง role ที่แนะนำ:
- `super_admin`
- `central_admin`
- `org_hr`
- `viewer`

## B. การเข้าถึงข้อมูลตามองค์กร
ผู้ใช้ `org_hr` ควรเห็นเฉพาะ:
- ข้อมูลขององค์กรตัวเอง
- สถานะการกรอกขององค์กรตัวเอง
- dashboard ขององค์กรตัวเอง
- ผู้ที่กรอกแล้ว / ยังไม่กรอก ในขอบเขตที่อนุญาต

## C. การกรอกแบบ draft / กลับมาแก้ไขภายหลัง
ระบบควรรองรับสถานะเช่น:
- `draft`
- `submitted`
- `reopened`
- `locked`

เพื่อให้ HR เข้ามากรอกเท่าที่มี แล้วกลับมาแก้ได้ภายหลัง

## D. การเปิด-ปิดช่วงเวลาใช้งาน
ควรมีฟิลด์/setting ระดับฟอร์ม เช่น:
- `open_at`
- `close_at`
- `allow_edit_until`
- `status`

เพื่อนำไปใช้กับ:
- เปิดรับกรอกช่วงเวลา
- ปิดระบบอัตโนมัติ
- เปิดเฉพาะแก้ไขหลัง submit
- ขยายเวลาบางองค์กรได้ในอนาคต

## E. Dashboard แยกตามองค์กร
ระบบในอนาคตควรมี dashboard 2 ชั้น:
- dashboard กลางสำหรับผู้ดูแลส่วนกลาง
- dashboard เฉพาะองค์กรสำหรับ HR ขององค์กรนั้น

ข้อมูลที่ควรเห็นใน org dashboard เช่น:
- องค์กรกรอกแล้วกี่ส่วน
- กรอกครบหรือยัง
- มีผู้ตอบ wellbeing survey กี่คน
- แยกตามฝ่าย/กลุ่มงาน/เพศ/ช่วงอายุ
- เอกสารแนบอัปโหลดครบหรือยัง

---

# 8) แผน migration ที่แนะนำ

## Phase 1: Clarify
- ทำ `SOURCE_OF_TRUTH.md`
- แก้ route ที่ไม่ตรงกับไฟล์จริง
- แยก legacy ออกจาก runtime จริง
- ย้าย test artifacts ออกจาก root

## Phase 2: Stabilize
- แยก CSS ของ `admin.html` ออกก่อน
- แยก JS utility / service / state ออกทีละส่วน
- คง HTML layout เดิมเพื่อลด regression

## Phase 3: Modularize
- ย้าย admin ไป `apps/admin-portal/`
- ย้าย ch1 ไป `apps/ch1-survey/`
- ย้าย public survey ไป `apps/public-survey/`
- รวม shared helpers เข้ากลาง

## Phase 4: Product Expansion
- เพิ่ม org-scoped auth
- เพิ่ม org dashboard
- เพิ่ม draft / reopen / lock window
- เพิ่ม monitoring และ smoke tests

---

# 9) สิ่งที่ไม่ควรทำตอนนี้

- ไม่ควร rewrite ใหม่ทั้งระบบในรอบเดียว
- ไม่ควรย้ายไป framework ใหม่ทันที ถ้ายังไม่เคลียร์ source of truth
- ไม่ควรเพิ่ม feature ใหญ่ก่อนแก้ route และ auth model ให้ชัด

---

# 10) ข้อสรุป

โครงสร้างใหม่ที่เหมาะกับระบบนี้คือ **multi-app static architecture ที่แยก public, ch1, admin, shared, backend ออกจากกันชัดเจน**

เหตุผล:
- สอดคล้องกับสภาพของโปรเจคปัจจุบัน
- ไม่ต้อง rewrite ทันที
- ย้ายทีละส่วนได้
- รองรับแผนอนาคตเรื่อง HR รายองค์กร, เปิด-ปิดการกรอก, draft/edit, และ dashboard เฉพาะองค์กรได้ดี
