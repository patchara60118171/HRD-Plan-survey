# Supabase -> Google Sheets + Google Drive Sync Setup

เอกสารนี้อธิบายการตั้งค่าระบบตามแนวทาง:

- หน้าเว็บ submit เข้า `Supabase` ตามเดิม
- ฝั่ง `Supabase` หรือ worker ฝั่ง admin เป็นคน sync ข้อมูลไป `Google Sheets`
- ไฟล์แนบที่อยู่ใน `Supabase Storage` ถูกคัดลอกเข้า `Google Drive`

## ไฟล์ที่ถูกเตรียมไว้ใน repo แล้ว

- `supabase/migrations/20260313_add_google_sync_fields.sql`
- `supabase/functions/google-sync/index.ts`
- `scripts/sync-ch1-google.js`
- `apps-script/google-sync.gs`
- `.env.local.example`

## ภาพรวมการทำงาน

1. ผู้ใช้กรอก `ch1.html`
2. ข้อมูลถูกบันทึกเข้า table `public.hrd_ch1_responses`
3. trigger/migration ตั้งสถานะ `google_sync_status` และ `google_drive_sync_status`
4. worker จะหยิบ record ที่ `pending` ไปส่งเข้า `Google Apps Script Web App`
5. Apps Script:
   - upsert ข้อมูลเข้า `Google Sheet`
   - ดาวน์โหลดไฟล์แนบจาก `Supabase Storage public URL`
   - คัดลอกไฟล์เข้า `Google Drive`
   - ส่งผลกลับมาว่า sync สำเร็จหรือไม่
6. worker อัปเดตสถานะใน Supabase

## ส่วนที่คุณต้องทำใน Supabase Dashboard

### 1) รัน migration

เปิด `SQL Editor` แล้วรันไฟล์นี้:

- `supabase/migrations/20260313_add_google_sync_fields.sql`

สิ่งที่จะได้:

- เพิ่มคอลัมน์สถานะ sync ใน `hrd_ch1_responses`
- เพิ่ม trigger สำหรับตั้งค่า default sync status
- เพิ่ม view `public.ch1_google_sync_queue`

### 2) Deploy Edge Function

ถ้าคุณใช้ Supabase CLI:

```bash
supabase functions deploy google-sync
```

ถ้ายังไม่ login:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3) ตั้ง secrets ให้ Edge Function

ตั้งค่าต่อไปนี้ใน Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SYNC_WEBHOOK_URL`
- `GOOGLE_SYNC_SHARED_SECRET`
- `GOOGLE_SYNC_BATCH_SIZE`

ตัวอย่าง:

```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set GOOGLE_SYNC_WEBHOOK_URL=https://script.google.com/macros/s/XXX/exec
supabase secrets set GOOGLE_SYNC_SHARED_SECRET=YOUR_LONG_RANDOM_SECRET
supabase secrets set GOOGLE_SYNC_BATCH_SIZE=10
```

### 4) ตั้ง schedule ให้ Edge Function

ทำได้ 2 แบบ:

#### แบบ A: ใช้ Supabase Scheduled Functions
ตั้งให้เรียก function `google-sync` ทุก 5 หรือ 10 นาที

#### แบบ B: ใช้ external cron
เช่น GitHub Actions, cron-job.org, หรือ server ภายในองค์กร ยิง POST ไปที่ function URL

ตัวอย่าง body:

```json
{
  "limit": 10
}
```

## ส่วนที่คุณต้องทำใน Google

### 1) เตรียม Google Sheet

สร้าง Google Sheet ใหม่ 1 ไฟล์สำหรับ CH1

แนะนำชื่อ:

- `CH1 Responses`

Apps Script จะสร้าง/ใช้ 2 sheet:

- `CH1 Responses`
- `CH1 Files`

### 2) เปิด Apps Script

ที่ Google Sheet:

- `Extensions` -> `Apps Script`

จากนั้นวางโค้ดจากไฟล์:

- `apps-script/google-sync.gs`

### 3) ตั้งค่า Script Properties

ใน Apps Script:

- `Project Settings` -> `Script Properties`

เพิ่มค่า:

- Key: `SYNC_SECRET`
- Value: secret เดียวกับ `GOOGLE_SYNC_SHARED_SECRET`

### 4) ใส่ Folder IDs ของ Google Drive

ในไฟล์ `apps-script/google-sync.gs` ให้แก้ค่า:

- `ROOT_DRIVE_FOLDER_ID`
- `FOLDER_MAP.strategy`
- `FOLDER_MAP.org_structure`
- `FOLDER_MAP.hrd_plan`

จากภาพที่คุณให้มา ตอนนี้คุณมีโฟลเดอร์แยกแล้ว ซึ่งเหมาะมาก

คุณต้องเอา `folder id` ของแต่ละโฟลเดอร์มาใส่แทน `CHANGE_ME`

ตัวอย่าง URL ของ folder:

```text
https://drive.google.com/drive/folders/1ZzsIupFp8m4UlTdzJk4X8vSdl6dUDhKG
```

ค่า folder id คือส่วนท้าย:

```text
1ZzsIupFp8m4UlTdzJk4X8vSdl6dUDhKG
```

### 5) Deploy Apps Script เป็น Web App

- `Deploy` -> `New deployment`
- Type: `Web app`
- Execute as: `Me`
- Who has access: `Anyone`

จากนั้นคัดลอก URL ที่ได้มาใส่ใน:

- `.env.local` -> `GOOGLE_SYNC_WEBHOOK_URL`
- Supabase secret -> `GOOGLE_SYNC_WEBHOOK_URL`

## ส่วนที่คุณทำได้จากเครื่องตัวเอง

### 1) สร้าง `.env.local`

คัดลอกจาก `.env.local.example`

แล้วเติมค่า:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_REF=
SUPABASE_ACCESS_TOKEN=
GOOGLE_SYNC_WEBHOOK_URL=
GOOGLE_SYNC_SHARED_SECRET=
GOOGLE_SYNC_BATCH_SIZE=10
```

### 2) ทดสอบ sync แบบ manual

เฉพาะ record ที่ pending:

```bash
npm run sync:google:pending
```

บังคับ sync ชุดแรกทั้งหมดที่เจอ:

```bash
npm run sync:google:all
```

## การทดสอบที่แนะนำ

### ทดสอบข้อมูล

1. ส่งแบบฟอร์ม CH1 ใหม่ 1 รายการ
2. ตรวจว่า record เข้า `hrd_ch1_responses`
3. ตรวจว่า `google_sync_status = pending`
4. รัน sync manual หรือรอ schedule
5. ตรวจว่า record ไปโผล่ใน Google Sheet
6. ตรวจว่าไฟล์แนบถูกคัดลอกเข้า Drive folder ที่ถูกต้อง

### ทดสอบสถานะใน Supabase

หลัง sync สำเร็จ ควรได้ประมาณนี้:

- `google_sync_status = synced`
- `google_synced_at` มีค่า
- `google_sheet_row_number` มีค่า
- `google_drive_sync_status = synced` หรือ `not_applicable`
- `google_drive_files` มี metadata ของไฟล์ใน Drive

## ข้อควรระวัง

- Apps Script ต้องถูก deploy ใหม่ทุกครั้งที่แก้โค้ด
- ถ้าไฟล์ใน Supabase Storage ไม่เป็น public URL, Apps Script จะดาวน์โหลดไม่ได้
- ถ้า folder id ผิด ไฟล์จะ copy เข้า Drive ไม่สำเร็จ
- ถ้า record เก่าไม่มี `submitted_at`, migration จะ mark เป็น `draft`

## ถ้าคุณอยากให้ผมช่วยต่อในรอบถัดไป

ส่งข้อมูลพวกนี้มาได้เลย:

- `GOOGLE_SYNC_WEBHOOK_URL`
- `SUPABASE_PROJECT_REF`
- ยืนยันว่ารัน migration แล้ว
- folder id ของ
  - ไฟล์แนบ 1
  - ไฟล์แนบ 2
  - ไฟล์แนบ 3

แล้วผมจะช่วยคุณต่อได้ในเรื่อง:

- ตรวจ config ให้ครบ
- เช็ค script/manual sync
- ช่วยไล่ error ที่ขึ้นตอน deploy หรือ run sync
- ถ้าคุณต้องการ ผมช่วยเตรียมคำสั่ง deploy CLI ให้ต่อได้อีก
