# Well-being Survey System

ระบบสำรวจสุขภาวะบุคลากรสำหรับหน่วยงานภาครัฐ ประกอบด้วยแบบสำรวจหลัก 2 ส่วน และพอร์ทัลผู้ดูแลระบบสำหรับจัดการข้อมูล วิเคราะห์ผล และดูแลสิทธิ์การเข้าถึง

## ภาพรวมระบบ

โปรเจกต์นี้ไม่ได้มีเฉพาะแบบฟอร์ม CH1 อีกต่อไป แต่เป็นระบบสำรวจครบชุดที่ครอบคลุม

1. แบบสำรวจสุขภาวะรายบุคคลสำหรับบุคลากรทั่วไป
2. แบบสำรวจ CH1 สำหรับ HR หรือผู้ดูแลขององค์กร
3. Admin Portal สำหรับจัดการองค์กร ผู้ใช้ สิทธิ์ และดูรายงาน
4. Backend บน Supabase สำหรับฐานข้อมูล สิทธิ์ RLS การยืนยันตัวตน และ Edge Functions
5. Deployment บน Vercel สำหรับ production

## แอปหลักในระบบ

| ส่วนระบบ | ไฟล์หลัก | เส้นทางใช้งาน | จุดประสงค์ |
|---|---|---|---|
| Well-being Survey | `index.html` | `/` | แบบสำรวจสุขภาวะของบุคลากรทั่วไป |
| CH1 Survey | `ch1.html` | `/ch1` | แบบฟอร์มสำรวจข้อมูล HRD บทที่ 1 |
| Admin Portal | `admin.html` | `/admin` | จัดการระบบ ดูข้อมูล และวิเคราะห์ผล |

## ฟีเจอร์หลัก

### 1. Well-being Survey

- รองรับลิงก์เฉพาะองค์กรผ่าน `?org=`
- เรนเดอร์คำถามแบบไดนามิก
- รองรับคำถามหลายประเภท เช่น ตัวเลือก ตัวเลข เวลา และข้อความ
- บันทึกแบบร่างอัตโนมัติ
- กลับมากรอกต่อได้
- ตรวจสอบความถูกต้องของข้อมูลก่อนส่ง
- รองรับการสร้างไฟล์พิมพ์สำหรับดาวน์โหลด PDF
- มีโครงสร้างคำถามด้านสุขภาพจิตและ UCLA Loneliness Scale

### 2. CH1 Survey

- แบบฟอร์มหลายขั้นตอน
- โครงสร้าง 5 ส่วนตามแบบฟอร์มล่าสุด
- ตรวจสอบผลรวมข้อมูลกำลังคนและข้อมูลเชิงโครงสร้าง
- จัดอันดับประเด็นสำคัญได้
- รองรับแนบไฟล์ PDF ที่เกี่ยวข้อง
- มีสถานะ lifecycle ของแบบฟอร์ม เช่น `draft`, `submitted`, `reopened`, `locked`
- รองรับการพิมพ์/ดาวน์โหลด PDF จากข้อมูลจริง

### 3. Admin Portal

- ล็อกอินด้วย Supabase Auth
- แสดงเมนูตามบทบาทผู้ใช้
- แดชบอร์ดสรุปผลและกราฟวิเคราะห์
- ดูคำตอบรายบุคคล
- ส่งออกข้อมูลเป็น CSV/Excel
- จัดการข้อมูลองค์กร
- จัดการสิทธิ์ผู้ใช้และบทบาท
- จำกัดสิทธิ์ตามองค์กรสำหรับ `org_hr`

### 4. Backend และ Security

- ใช้ Supabase PostgreSQL เป็นฐานข้อมูลหลัก
- ใช้ Row Level Security (RLS) แยกสิทธิ์ตามบทบาท
- มี helper functions เช่น `requester_email()`, `requester_role()`, `requester_org()`, `requester_is_admin()`
- มีตาราง `admin_user_roles`, `organizations`, `survey_responses`, `hrd_ch1_responses`, `form_windows`, `form_question_overrides`
- มี Edge Functions สำหรับงาน integration บางส่วน

### 5. Integration และ Operations

- เชื่อม Google Sheets / Apps Script สำหรับงาน sync
- มีสคริปต์ช่วยตรวจ schema และ readiness
- มีสคริปต์ seed, clear test data, export และดูสถิติฐานข้อมูล
- มีการตั้งค่า route, headers และ cache ผ่าน `vercel.json`

## เทคโนโลยีที่ใช้

| ชั้นระบบ | เทคโนโลยี |
|---|---|
| Frontend | HTML5, CSS, Vanilla JavaScript |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Deployment | Vercel |
| Integration | Google Sheets, Google Apps Script |
| Utility Scripts | Node.js |

## โครงสร้างโปรเจกต์โดยสรุป

```text
Well-being Survey/
├── index.html                  # Well-being Survey
├── ch1.html                    # CH1 Survey
├── admin.html                  # Admin Portal
├── admin-login.html            # หน้าเข้าสู่ระบบแอดมิน
├── wb-printable.html           # หน้าแบบพิมพ์ Well-being
├── ch1-printable.html          # หน้าแบบพิมพ์ CH1
├── js/                         # JavaScript หลักของระบบ
├── css/                        # CSS หลักของระบบ
├── assets/                     # รูปภาพ ฟอนต์ และไฟล์ประกอบ
├── scripts/                    # สคริปต์ dev / audit / ops / one-off
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── functions/              # Edge Functions
├── apps/                       # โครงสร้างอ้างอิงสำหรับการแยกแอป
├── backend/                    # งานหลังบ้านเชิงโครงสร้าง
├── docs/                       # เอกสารระบบ
└── vercel.json                 # การตั้งค่า deployment บน Vercel
```

## ตารางหลักในฐานข้อมูล

| ตาราง | หน้าที่ |
|---|---|
| `organizations` | ข้อมูลองค์กรหลัก |
| `admin_user_roles` | ผู้ใช้และบทบาทของระบบ |
| `survey_responses` | คำตอบแบบสำรวจสุขภาวะรายบุคคล |
| `hrd_ch1_responses` | คำตอบแบบสำรวจ CH1 |
| `org_form_links` | ลิงก์ฟอร์มเฉพาะองค์กร |
| `survey_forms` | รายการฟอร์มและสิทธิ์การแก้ไข |
| `form_windows` | ช่วงเวลาเปิด-ปิดแบบฟอร์ม |
| `form_question_overrides` | ข้อความคำถามที่แอดมินแก้ไขได้ |
| `admin_audit_logs` | ประวัติการกระทำในระบบหลังบ้าน |

## การติดตั้งสำหรับพัฒนาในเครื่อง

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. เตรียม Environment Variables

สร้างไฟล์ `.env.local` แล้วกำหนดค่าอย่างน้อยดังนี้

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GOOGLE_SYNC_WEBHOOK_URL=YOUR_GOOGLE_APPS_SCRIPT_URL
GOOGLE_SYNC_SHARED_SECRET=YOUR_SHARED_SECRET
```

หมายเหตุ:

- ฝั่งหน้าเว็บใช้ค่า public/anon key
- ฝั่งสคริปต์ admin และงานหลังบ้านใช้ service role key

### 3. เปิดระบบในเครื่อง

ใช้ static server ตัวใดตัวหนึ่ง เช่น

```bash
npm run dev
```

หรือ

```bash
python -m http.server 8000
```

### 4. เตรียม Supabase CLI ถ้าต้อง deploy functions

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run supabase:deploy
```

## คำสั่งที่ใช้บ่อย

```bash
npm run dev
npm run deploy
npm run deploy:preview
npm run supabase:test
npm run supabase:stats
npm run supabase:export
npm run sync:google:pending
npm run sync:google:all
npm run db:clear-test
npm run supabase:deploy
```

## การ deploy

Production ใช้ Vercel โดยมีแนวทางดังนี้

1. Static files ที่ route หลักต้องคงไว้คือ `/`, `/ch1`, `/admin`
2. ใช้ `vercel.json` สำหรับ rewrite, security headers และ cache control
3. ถ้ามีการเปลี่ยน Edge Functions ให้ deploy ผ่าน Supabase CLI แยกจากตัวเว็บ

## สถานะปัจจุบันของระบบ

ภาพรวม ณ ปัจจุบัน

- Supabase schema และ migration หลักพร้อมใช้งาน
- ระบบบทบาทและ RLS หลักพร้อมใช้งาน
- Vercel deployment พร้อมใช้งาน
- Admin Portal ใช้งานได้จริง
- Well-being Survey และ CH1 Survey ใช้งานได้จริง
- ยังมีงานปรับปรุงต่อเนื่องในส่วน modularization, automation tests และ admin UI บางฟีเจอร์

## เอกสารที่ควรอ่านต่อ

- `PROJECT_STATUS.md`
- `SOURCE_OF_TRUTH.md`
- `docs/architecture/SYSTEM_PLAN.md`
- `docs/architecture/ROLE_PERMISSION_MATRIX.md`
- `docs/SUPABASE_SETUP.md`
- `docs/VERCEL_SETUP.md`
- `docs/TESTING_GUIDE.md`

## หมายเหตุสำคัญ

- Entry points หลักของระบบตอนนี้คือ `index.html`, `ch1.html`, `admin.html`
- โฟลเดอร์ `apps/` เป็นโครงสร้างอ้างอิงสำหรับการแยกแอปในระยะถัดไป ไม่ใช่ source of truth สำหรับ deployment ปัจจุบัน
- หากจะแก้ routing หรือ deployment ให้ตรวจ `vercel.json` และเอกสาร deployment ควบคู่กันเสมอ

## License

โปรเจกต์นี้เป็นของหน่วยงานภาครัฐ ใช้สำหรับงานสำรวจข้อมูลสุขภาวะบุคลากรและการบริหารข้อมูลที่เกี่ยวข้องเท่านั้น

อัปเดตล่าสุด: 20 มีนาคม 2569
