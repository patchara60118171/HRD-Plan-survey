# รายงานวิเคราะห์โครงสร้างโปรเจคเชิงลึก

## ชื่อโปรเจค
- **ชื่อระบบ**: Well-being Survey / HRD Plan Survey
- **ลักษณะระบบ**: ระบบแบบฟอร์มสำรวจ + ระบบแอดมิน + งานเชื่อมข้อมูล Supabase / Google Sheets
- **รูปแบบการ deploy**: Static web app + Serverless backend services

---

# 1) ภาพรวมโปรเจคนี้คืออะไร

โปรเจคนี้ไม่ใช่ระบบเว็บแบบ full-stack framework เช่น Next.js, Laravel หรือ React app ที่มี build pipeline ชัดเจน แต่เป็น **ชุดหน้าเว็บ static หลายหน้า** ที่ใช้ JavaScript ฝั่ง client คุยกับ **Supabase** โดยตรง

ระบบแบ่งเป็น 3 กลุ่มหลัก:

- **หน้าสาธารณะสำหรับผู้ใช้ทั่วไป**
  - `index.html` = แบบสำรวจสุขภาวะบุคลากรรายบุคคล
  - `ch1.html` = แบบสำรวจ HRD บทที่ 1 สำหรับกรอกข้อมูลระดับหน่วยงาน

- **หน้าหลังบ้านสำหรับผู้ดูแล**
  - `admin.html` = Admin portal ขนาดใหญ่ที่รวม dashboard, users, organizations, links, exports, raw data, analytics, settings ไว้ในหน้าเดียว

- **งาน backend/supporting infrastructure**
  - Supabase database / auth / storage / edge functions
  - Node scripts ใน `scripts/`
  - Google Apps Script ใน `apps-script/`
  - SQL และ config ใน `supabase/`

สรุปง่าย ๆ คือ:

```text
ผู้ใช้กรอกแบบฟอร์มบนหน้าเว็บ
    -> JavaScript ฝั่ง browser รวบรวมข้อมูล
    -> ส่งไป Supabase
    -> admin.html ดึงข้อมูลกลับมาแสดง/กรอง/ส่งออก
    -> บาง flow มีการ sync ข้อมูลไป Google Sheets / Drive
```

---

# 2) โครงสร้างระบบจริงในปัจจุบัน

## 2.1 Entry points ที่ใช้งานจริง

### `index.html`
หน้าสำรวจสุขภาวะบุคลากรรายบุคคล

โหลดไฟล์หลักเหล่านี้:
- `js/questions.js`
- `js/utils.js`
- `js/components.js`
- `js/supabase-config.js`
- `js/app.js`

ลักษณะหน้า:
- มี loading screen
- มี progress bar
- มี main content ที่ render แบบ dynamic
- มีปุ่ม next / prev
- ใช้ CSS จาก `css/styles.css`

### `ch1.html`
หน้าสำรวจ HRD Chapter 1

โหลดไฟล์หลักเหล่านี้:
- `js/supabase-config.js`
- `js/loading-states.js`
- `js/rate-limiter.js`
- `js/progress-persistence.js`
- `js/error-tracker.js`
- `js/analytics.js`
- `js/web-vitals.js`
- `js/ch1-form.js`
- `js/pdf-upload.js`

ลักษณะหน้า:
- เป็น multi-step form
- ใช้ Tailwind ผ่าน CDN
- มี validation, progress, autosave, anti-spam, upload PDF
- submit ไปตาราง `hrd_ch1_responses`

### `admin.html`
หน้า admin portal

ลักษณะสำคัญ:
- เป็น **monolithic SPA หน้าเดียวขนาดใหญ่มาก**
- CSS inline จำนวนมาก
- JavaScript inline จำนวนมาก
- ใช้ Supabase จากหน้า browser โดยตรง
- ใช้ CDN libraries เช่น Supabase JS, SheetJS, QRCode.js

หน้าที่รวมอยู่ในไฟล์นี้มีจำนวนมาก เช่น:
- Dashboard
- Users
- Organizations
- Links / URL manager
- CH1 raw data / PDF / detail view
- Wellbeing raw data
- Notifications
- Timeline / deadline
- Compare / analytics
- Settings
- Form editor

---

# 3) สถาปัตยกรรมเทคนิค (Tech Stack)

## Frontend
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **Tailwind CSS via CDN** (อย่างน้อยใน `ch1.html`)
- **Inline CSS + inline JS** จำนวนมากใน `admin.html`

## Libraries / Services ฝั่ง browser
- `@supabase/supabase-js`
- `SheetJS` สำหรับ Excel export
- `QRCode.js` สำหรับ QR code
- Tailwind CDN

## Backend / Platform
- **Supabase**
  - PostgreSQL database
  - Auth
  - Storage
  - Edge Functions

## Supporting tools
- **Node.js**
- **Playwright** อยู่ใน dependencies แต่จาก `package.json` ยังไม่มี test workflow จริง
- **Vercel** สำหรับ deploy
- **Google Apps Script** สำหรับ integration บางส่วน

## Package / Runtime
จาก `package.json`
- Node >= 18
- scripts หลักเป็นแนว utility มากกว่า build app
- ไม่มี build step จริง
- ไม่มี lint / format / test pipeline ที่ทำงานจริง

สรุปคือระบบนี้เป็น **static client-heavy app + Supabase-backed app** มากกว่าจะเป็น project structure แบบ modern frontend framework

---

# 4) Flow การทำงานของระบบ

## 4.1 Flow ผู้ใช้ทั่วไป - แบบสำรวจบุคคล (`index.html`)

```text
เปิด index.html
-> โหลดคำถามจาก questions.js
-> render UI ผ่าน app.js / components.js
-> ผู้ใช้ตอบแบบสอบถามทีละ step
-> JavaScript คำนวณ / validate / เก็บคำตอบ
-> submit ไป Supabase
-> แสดงผลลัพธ์ / toast / success state
```

ลักษณะการทำงาน:
- form content ถูก render แบบ dynamic
- ใช้ progress bar
- ใช้ next / prev navigation
- มี logic คำนวณข้อมูลสุขภาวะบางส่วน

## 4.2 Flow ผู้ใช้หน่วยงาน - แบบสำรวจบทที่ 1 (`ch1.html`)

```text
เปิด ch1.html?org=xxx
-> parse org จาก query string
-> auto-select หน่วยงาน
-> กรอกข้อมูล 5 ส่วน + landing
-> validation ระหว่างกรอก
-> autosave / persist progress
-> upload PDF บางส่วนไป Supabase Storage
-> submit ไปตาราง hrd_ch1_responses
-> แสดง success / error overlay
```

รายละเอียดที่เห็นจากโค้ด:
- query param `org` ถูก map เป็นชื่อหน่วยงานใน `js/ch1-form.js`
- มีการคำนวณผลรวม เช่น age / type / service / position
- มี rate limiter / loading state / analytics / web vitals แยกไฟล์ช่วยงาน
- file upload แยกอยู่ที่ `js/pdf-upload.js`
- upload ไป bucket `hrd-documents`
- กำหนดขนาด PDF ไม่เกิน `512 KB`

## 4.3 Flow ผู้ดูแล - Admin (`admin.html`)

```text
เปิด /admin หรือ /admin.html
-> โหลดหน้า admin portal
-> เช็ก Supabase session
-> ถ้าไม่มี session redirect ไป /admin-login
-> ถ้ามี session ดึงข้อมูลหลายตารางจาก Supabase
-> render dashboard / data tables / modals / exports
-> ผู้ดูแลจัดการข้อมูล, users, orgs, links, settings
```

สิ่งที่ admin ทำได้จากโค้ดที่พบ:
- login/logout ผ่าน Supabase auth
- load responses จากหลายตาราง
- แสดงสถิติ dashboard
- export Excel / CSV
- สร้าง QR code
- จัดการ user / password reset / password set ผ่าน edge function
- ดูข้อมูล CH1 และ wellbeing ในรูป raw data / detail / printable view
- จัดการ settings และ form editor
- ดึง session แล้วใช้ token เรียก edge function `set-user-password`

---

# 5) ฟังก์ชันหลักของโปรเจค

## 5.1 ฝั่งหน้าบ้าน (Frontend / User-facing)

### A. แบบสำรวจสุขภาวะบุคคล (`index.html`)
- แสดงคำถามแบบหลายขั้นตอน
- progress tracking
- next / prev
- validation
- collect คำตอบทั้งหมดก่อนส่ง
- submit ไป Supabase

### B. แบบสำรวจ HRD บทที่ 1 (`ch1.html`)
- landing page
- multi-step form
- auto-select หน่วยงานจาก query string
- validation ของแต่ละ section
- autosave / draft / progress persistence
- การคำนวณผลรวมในบางหมวด
- warning เมื่อผลรวมเกินจำนวนบุคลากรรวม
- upload PDF ประกอบ
- error overlay / success overlay / toast

### C. ประสิทธิภาพ/ความเสถียร
ใน `ch1.html` ยังมีการโหลดไฟล์ช่วยงานเพิ่มเติม:
- `loading-states.js`
- `rate-limiter.js`
- `progress-persistence.js`
- `error-tracker.js`
- `analytics.js`
- `web-vitals.js`

แปลว่ามีการพยายามเสริมเรื่อง UX, monitoring, และลด spam/submit ซ้ำ

## 5.2 ฝั่งหลังบ้าน (Admin / Back-office)

### A. Authentication
- login ด้วย Supabase auth
- logout
- session check
- redirect เมื่อไม่มี session

### B. Dashboard
- total responses
- wellbeing responses
- CH1 responses
- responses today / this month
- chart หลายประเภท

### C. Data management
- load ข้อมูลจาก `survey_responses` หรือ `wellbeing_responses` และ `hrd_ch1_responses`
- ดู raw data
- ดูรายละเอียดแถว
- พิมพ์/preview แบบ printable
- export

### D. Organizations / Links / Settings
- CRUD หน่วยงาน
- สร้างลิงก์แบบเจาะ org/form
- QR code generation
- ตั้งค่าแบบฟอร์มและระบบ

### E. User management
- เพิ่ม/แก้ไขผู้ใช้
- เปลี่ยนรหัสผ่าน
- reset password link
- เรียก Supabase Edge Function เพื่อ set password

### F. Form/config management
- มี form editor ใน admin
- มีแนวคิดรองรับหลายฟอร์มในระบบ
- มีการใช้ metadata สำหรับ forms และ links

---

# 6) โครงสร้างไฟล์สำคัญ

## ไฟล์ใช้งานจริงสูง
- `index.html`
- `ch1.html`
- `admin.html`
- `js/supabase-config.js`
- `js/app.js`
- `js/questions.js`
- `js/components.js`
- `js/utils.js`
- `js/ch1-form.js`
- `js/pdf-upload.js`
- `css/styles.css`
- `vercel.json`
- `supabase/` ทั้งชุด
- `scripts/` บางตัวที่ใช้ดูแลระบบจริง

## ไฟล์ที่เป็น supporting / operational
- `scripts/sync-ch1-google.js`
- `scripts/supabase-admin.js`
- `scripts/check-supabase-setup.js`
- `scripts/check-ch1-ready.js`
- `apps-script/`
- `supabase/functions/`
- `supabase/migrations/`

## ไฟล์ที่น่าสงสัยว่าเป็นขยะ / test artifact / ค้างจากงานก่อน
- `test-hrd-plan.pdf`
- `test-org-structure.pdf`
- `test-strategy.pdf`
- `fix.js`
- บางไฟล์ใน `js/modules/`
- docs บางส่วนที่อาจไม่ตรงกับโค้ดปัจจุบัน
- โฟลเดอร์ `แบบสอบถามบท 1/` ที่ว่าง

---

# 7) สิ่งที่พบว่า “โค้ดจริง” กับ “โค้ดซ้อน/ค้าง” ปนกันอยู่

นี่คือประเด็นสำคัญที่สุดของ audit ครั้งนี้

## 7.1 มี module architecture อีกชุด แต่ไม่เห็นว่าเป็นตัวที่หน้าเว็บหลักโหลดจริง
ใน `js/modules/` มีไฟล์เช่น:
- `admin.js`
- `core.js`
- `survey.js`
- `services.js`
- `storage.js`
- `validation.js`

ปัญหา:
- จาก entry points ที่อ่านจริง `index.html`, `ch1.html`, `admin.html` **ไม่ได้เห็นการโหลด module ชุดนี้โดยตรง**
- `admin.html` ใช้ JS inline เองจำนวนมาก
- `index.html` โหลด `js/app.js` ตรง
- `ch1.html` โหลด `js/ch1-form.js` ตรง

สรุป:
- `js/modules/` มีโอกาสสูงว่าเป็น **โครงสร้างสำรอง / refactor ที่ทำไม่สุด / โค้ด generated ที่ไม่ได้เป็น runtime หลัก**
- ถ้าปล่อยไว้จะทำให้ทีมสับสนว่าอันไหนคือ source of truth

## 7.2 มี route ที่ deployment ชี้ไปหา แต่ไฟล์ปลายทางหายแล้ว
จาก `vercel.json`
- `/admin-login` -> `/admin-login.html`
- `/admin` -> `/admin.html`

แต่จากโครงสร้างโปรเจคปัจจุบัน **ไม่มี `admin-login.html` แล้ว**

ผลกระทบ:
- route `/admin-login` จะ 404
- และ `admin.html` ก็มี code redirect ไป `/admin-login`
- แปลว่า flow login ของ admin มีความเสี่ยงเสีย

นี่คือ **บั๊กเชิงสถาปัตยกรรม** ไม่ใช่แค่ไฟล์หายธรรมดา

## 7.3 เอกสารกับโค้ดจริงไม่ตรงกันบางส่วน
ตัวอย่าง:
- `README.md` ยังอธิบายโครงสร้างบางส่วนแบบเก่า
- roadmap ใน README บอกว่า “เพิ่ม dashboard / file upload” ทั้งที่ระบบตอนนี้มีอยู่แล้วบางส่วน
- docs หลายไฟล์อาจไม่ใช่สถานะล่าสุดของระบบ

ผลกระทบ:
- คนใหม่เข้ามาจะเข้าใจระบบผิด
- AI หรือ developer คนอื่นอาจแก้ผิดไฟล์

## 7.4 มีไฟล์ test artifact หลุดค้างใน root
เจอไฟล์:
- `test-hrd-plan.pdf`
- `test-org-structure.pdf`
- `test-strategy.pdf`

ไฟล์พวกนี้ไม่น่าควรอยู่ใน root ของ production repo

## 7.5 ยังมี utility/test scripts จำนวนมาก
ใน `scripts/` มีทั้ง:
- clear data
- seed data
- generate test pdf
- schema audit
- cleanup
- sync

ไฟล์พวกนี้ไม่ได้ผิดที่มี แต่ตอนนี้ยังไม่มีการแยกชัดว่า:
- อะไรคือ operational script ใช้จริง
- อะไรคือ one-off script
- อะไรคือ dangerous script ที่ไม่ควรรันใน production

---

# 8) วิเคราะห์หน้าบ้าน vs หลังบ้าน

## 8.1 หน้าบ้าน

### รูปแบบหน้าบ้าน
ระบบหน้าบ้านมี 2 แนว:

- **แบบ dynamic survey app** (`index.html`)
- **แบบ form-heavy structured page** (`ch1.html`)

### จุดเด่นหน้าบ้าน
- UX ดีพอสมควรสำหรับงานแบบฟอร์ม
- มี progress
- มี validation
- มี auto-fill org จาก query string
- มี upload เอกสารประกอบ
- มี overlay feedback ชัดเจน

### จุดเสี่ยงหน้าบ้าน
- browser ทำงานหนัก เพราะ logic อยู่ฝั่ง client เยอะ
- hardcoded config หลายจุด
- query-string/org mapping ฝังอยู่ใน JS
- ถ้าโครงสร้าง DB เปลี่ยน มีโอกาสพังเงียบ

## 8.2 หลังบ้าน

### รูปแบบหลังบ้าน
- admin portal เป็น single-file SPA ขนาดใหญ่
- มี feature เยอะมาก แต่กระจุกอยู่ในไฟล์เดียว

### จุดเด่นหลังบ้าน
- ครอบคลุมงานจริงเยอะ
- ใช้งานเร็ว เพราะทุกอย่างอยู่หน้าเดียว
- ไม่ต้อง build
- export / dashboard / user management ครบระดับหนึ่ง

### จุดเสี่ยงหลังบ้าน
- maintain ยากมาก
- เปลี่ยนบางส่วนอาจกระทบทั้งระบบ
- test ยาก
- ความเสี่ยง regression สูง
- source of truth ไม่ชัดถ้ามี module ชุดซ้อน

---

# 9) จุดแข็งของระบบ

## ด้านธุรกิจ
- ครอบคลุม use case หลักของการสำรวจและงาน admin ค่อนข้างครบ
- รองรับทั้ง survey ระดับบุคคลและระดับหน่วยงาน
- รองรับ export / report / raw data / link distribution

## ด้านเทคนิค
- ใช้ Supabase ทำให้ backend ขึ้นระบบเร็ว
- static deployment ทำให้ deploy ง่าย
- ไม่มี build pipeline ซับซ้อน
- หน้า `ch1.html` มีการแยก concern บางส่วนออกเป็นไฟล์ย่อยค่อนข้างดี

## ด้านการใช้งาน
- ใช้งานผ่าน browser ได้ตรง
- มี progress / toast / warning / overlay
- มี query param สำหรับยิงลิงก์ให้แต่ละหน่วยงาน

---

# 10) ปัญหาเชิงโครงสร้างที่น่าจะมาจาก AI-generated code หรือการต่อเติมหลายรอบ

จากสภาพ repo ปัจจุบัน มี pattern ที่ชัดว่าเคยถูก generate / refactor / patch หลายรอบ:

## A. มีหลายสถาปัตยกรรมซ้อนกัน
- แบบ inline monolith (`admin.html`)
- แบบ modular (`js/modules/*`)
- แบบ script-based page logic (`js/app.js`, `js/ch1-form.js`)

ปกติถ้าระบบสะอาด จะมี source of truth ชัดกว่านี้

## B. มีโค้ดที่พยายามปรับปรุงคุณภาพ แต่ยังไม่ได้ integrate เต็ม
เช่น:
- error tracking
- web vitals
- progress persistence
- rate limiter
- modules architecture

สิ่งเหล่านี้สะท้อนว่าเคยมีการยกระดับระบบหลายรอบ แต่ยังไม่ consolidate

## C. เอกสาร/route/file structure ไม่ sync กัน
ตัวอย่างเด่นสุดคือ:
- `vercel.json` ยัง rewrite ไป `admin-login.html`
- `admin.html` ยัง redirect ไป `/admin-login`
- แต่ไฟล์ `admin-login.html` ไม่มีแล้ว

## D. test artifacts และ helper scripts ยังหลงเหลือ
- root PDFs
- `fix.js`
- scripts จำนวนมากที่ยังไม่จัดชั้น

ทั้งหมดนี้ **ไม่ใช่หลักฐาน 100% ว่า AI เขียนแล้วทิ้งขยะ** แต่เป็น pattern ที่มักเกิดจากการใช้ AI ช่วยเขียน/patch หลายรอบโดยไม่มีรอบ cleanup เชิงสถาปัตยกรรม

---

# 11) จุดเสี่ยงสำคัญที่ควรแก้ก่อน

## Priority 1 - ต้องแก้ก่อน

### 1. แก้ flow admin login ให้ชัด
ปัจจุบันมีความไม่สอดคล้องระหว่าง:
- `vercel.json`
- `admin.html`
- ไฟล์จริงใน repo

ต้องตัดสินใจว่า:
- จะมี `admin-login.html` จริง
- หรือจะให้ `admin.html` เป็นหน้า login + app ในตัว

แล้วแก้ route ให้ตรงทั้งหมด

### 2. ระบุ source of truth ของ frontend ให้ชัด
ต้องกำหนดว่าอะไรคือของจริง:
- `js/modules/*`
- หรือ `js/app.js` / `js/ch1-form.js`
- หรือ inline script ใน `admin.html`

ถ้าไม่ทำ จุดนี้จะเป็นต้นเหตุของการแก้ผิดไฟล์ตลอด

### 3. เอา test artifacts ออกจาก root
ลบหรือย้าย:
- `test-hrd-plan.pdf`
- `test-org-structure.pdf`
- `test-strategy.pdf`
- utility files ที่ไม่ใช่ production assets

### 4. ตรวจ hardcoded config / secret exposure
ใน `js/supabase-config.js` มี URL + anon key ฝังอยู่ตรง ๆ
โดยทั่วไป anon key ใช้ฝั่ง client ได้ แต่ต้องแน่ใจว่า:
- RLS ถูกต้องจริง
- storage policy ถูกต้อง
- edge function ป้องกันดีพอ

## Priority 2 - ควรทำต่อ

### 5. แยก admin.html ออกเป็น modules จริง
ตอนนี้ไฟล์ใหญ่เกินไป
ผลเสีย:
- อ่านยาก
- review ยาก
- test ยาก
- merge conflict ง่ายมาก

### 6. อัปเดต README / docs ให้ตรงปัจจุบัน
ให้เอกสารบอกความจริงของระบบตอนนี้ ไม่ใช่ภาพเก่า

### 7. แยก scripts เป็นหมวด
เช่น:
- `scripts/ops/`
- `scripts/dev/`
- `scripts/one-off/`
- `scripts/dangerous/`

### 8. เพิ่ม inventory ของ database tables / storage buckets / functions
ตอนนี้ต้องไล่จากโค้ดกระจัดกระจาย
ควรมีไฟล์กลางอธิบาย schema และ integration

---

# 12) สรุปสภาพโปรเจคตอนนี้แบบตรงไปตรงมา

## ภาพรวม
โปรเจคนี้ **ยังใช้งานได้ในหลายส่วน** และมีฟีเจอร์จริงค่อนข้างเยอะ ไม่ใช่ระบบปลอม หรือ skeleton เปล่า ๆ

แต่ในเชิงวิศวกรรมซอฟต์แวร์ ตอนนี้อยู่ในสภาพ:
- **ทำงานได้ แต่มีความรกเชิงโครงสร้าง**
- **มีโค้ดหลายยุคหลายแนวปนกัน**
- **มีบางจุดไม่ sync กันแล้ว**
- **มีไฟล์ค้าง/ไฟล์ test/route mismatch ที่ควร cleanup**

## คำตอบต่อคำถามว่า “AI เขียนแล้วทิ้งขยะไว้เยอะไหม?”
คำตอบที่ตรงที่สุดคือ:

- **มีร่องรอยของการต่อเติมแบบไม่ consolidate จริง**
- **มีไฟล์/สถาปัตยกรรมซ้อนกันจริง**
- **มี route และ docs ที่ไม่ตรงกับ runtime จริง**
- **มีไฟล์ test artifact และ helper scripts ที่ยังปะปนอยู่**

ดังนั้นพูดได้ว่า **มี “ขยะเชิงโครงสร้าง” และ “ความซ้อนของโค้ด” อยู่จริง**
แต่ไม่ใช่ว่าทั้งโปรเจคใช้ไม่ได้ เพียงแต่ต้องมีรอบ cleanup และ architecture normalization อย่างจริงจัง

---

# 13) ข้อเสนอแนะเชิงปฏิบัติ

## ระยะสั้น
- fix admin login route ให้ทำงานจริง
- ทำไฟล์ `PROJECT_SOURCE_OF_TRUTH.md`
  - ระบุชัดว่าไฟล์ไหนใช้งานจริง
  - ไฟล์ไหน legacy
  - ไฟล์ไหน draft/test
- ลบ test PDFs และไฟล์ utility ที่ไม่ควรอยู่ root
- อัปเดต README ใหม่ให้ตรงระบบปัจจุบัน

## ระยะกลาง
- แตก `admin.html` ออกเป็น JS modules จริง
- แยก config กลาง
- ทำ schema map ของ database / storage / functions
- เพิ่ม smoke test ขั้นพื้นฐาน

## ระยะยาว
- พิจารณาย้าย admin ไป architecture ที่ modular กว่านี้
- เพิ่ม CI ตรวจ route / missing file / broken references
- เพิ่ม automated tests โดยเฉพาะ flow submit และ login

---

# 14) ข้อสรุปสุดท้าย

ถ้ามองในมุมธุรกิจ ระบบนี้มีของจริงครบพอสมควร:
- แบบสำรวจ
- ส่งข้อมูล
- หลังบ้าน
- export
- analytics
- user management
- file upload
- integration

แต่ถ้ามองในมุมโครงสร้างโค้ด ตอนนี้ยังมี 4 ปัญหาใหญ่:

- **โค้ดหลายแนวปนกัน**
- **source of truth ไม่ชัด**
- **มี route/file mismatch**
- **มีไฟล์ค้าง/ขยะ/เอกสารไม่ตรง runtime**

ถ้าจะพัฒนาต่ออย่างปลอดภัย ควรทำ **cleanup + architecture clarification** ก่อนเพิ่มฟีเจอร์ใหม่
