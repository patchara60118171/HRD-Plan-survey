# แก้ไข Google Sync ให้ใช้คำถามภาษาไทย

**วันที่:** 2026-04-06  
**ปัญหา:** Google Sheets แสดงชื่อคอลัมน์ฐานข้อมูล (เช่น `disease_diabetes`) แทนคำถามภาษาไทยที่เข้าใจง่าย

---

## สิ่งที่แก้ไขแล้ว

### 1. สร้าง Column Mapping
- **ไฟล์:** `apps-script/column-mapping.js`
- **เนื้อหา:** Mapping จากคอลัมน์ Supabase ไปเป็นคำถามภาษาไทย
- **ตัวอย่าง:** `disease_diabetes` → `จำนวนบุคลากรที่เป็นโรคเบาหวาน`

### 2. แก้ไข Google Apps Script
- **ไฟล์:** `apps-script/google-sync.gs`
- **เปลี่ยนแล้ว:**
  - เพิ่ม `COLUMN_MAPPING` แบบครบถ้วน
  - สร้าง `mapHeaders_()` function
  - แก้ไข `ensureHeaders_()` ให้ใช้ Thai headers
  - แก้ไข `upsertRecord_()` ให้จับคู่ถูกตำแหน่ง

---

## วิธีติดตั้ง

### ขั้นตอนที่ 1: อัปเดต Google Apps Script

1. **เปิด Google Apps Script Editor**
   - ไปที่ Google Sheet ที่ใช้ sync
   - เมนู: `Extensions` → `Apps Script`

2. **อัปเดต Code**
   - คัด code จาก `apps-script/google-sync.gs` ทั้งหมด
   - วางแทน code เดิม
   - บันทึก (Ctrl+S)

3. **ตรวจสอบ**
   - ตรวจสอบว่ามี `COLUMN_MAPPING` อยู่ใน code
   - ตรวจสอบว่ามี `mapHeaders_()` function

### ขั้นตอนที่ 2: ทดสอบการ Sync

1. **รัน Sync ใหม่**
   ```bash
   # ในโปรเจค
   node scripts/sync-ch1-google.js id [RECORD_ID]
   ```

2. **ตรวจสอบ Google Sheets**
   - Header ควรเป็นภาษาไทยแล้ว
   - ตัวอย่าง: "จำนวนบุคลากรที่เป็นโรคเบาหวาน" แทน "disease_diabetes"

---

## ผลลัพธ์ที่ได้

### ก่อนแก้ไข
```
| id | created_at | disease_diabetes | disease_hypertension | age_u30 | age_31_40 |
```

### หลังแก้ไข
```
| รหัสการตอบ | วันที่สร้าง | จำนวนบุคลากรที่เป็นโรคเบาหวาน | จำนวนบุคลากรที่เป็นโรคความดันโลหิตสูง | จำนวนบุคลากรแบ่งตามช่วงอายุ - อายุไม่เกิน 30 ปี | จำนวนบุคลากรแบ่งตามช่วงอายุ - อายุ 31-40 ปี |
```

---

## คอลัมน์ที่ Map แล้ว (155 คอลัมน์)

### หมวดหมู่หลัก
- **Metadata** (13 คอลัมน์): id, created_at, submitted_at, etc.
- **ข้อมูลเบื้องต้น** (3 คอลัมน์): strategic_overview, org_structure, total_staff
- **จำแนกบุคลากร** (20 คอลัมน์): type_*, age_*, service_*, pos_*
- **ข้อมูลรายปี** (15 คอลัมน์): begin_*, end_*, leave_*, rate_*
- **นโยบายและบริบท** (2 คอลัมน์): related_policies, context_challenges
- **ข้อมูลสุขภาพ NCD** (11 คอลัมน์): disease_*, ncd_*
- **การลาป่วย** (3 คอลัมน์): sick_leave_*
- **คลินิกและการรักษา** (4 คอลัมน์): clinic_*
- **สุขภาพจิต** (6 คอลัมน์): mental_*
- **Engagement Score** (7 คอลัมน์): engagement_score_*
- **การพัฒนาบุคลากร** (9 คอลัมน์): mentoring_system, job_rotation, etc.
- **ดิจิทัลและระบบ** (1 คอลัมน์): digital_systems
- **Ergonomics** (5 คอลัมน์): ergonomics_*
- **ยุทธศาสตร์และแผนงาน** (8 คอลัมน์): strategic_priority_*
- **ไฟล์เอกสารแนบ** (9 คอลัมน์): *_file_*, hrd_plan_*
- **Google Sync** (10 คอลัมน์): google_sync_*

---

## ข้อดี

### สำหรับผู้ใช้
- **อ่านง่ายขึ้น** - คำถามเป็นภาษาไทยที่เข้าใจ
- **ทำรายงานง่าย** - ไม่ต้องแปลคำศัพท์เทคนิค
- **มือใหม่เข้าใจ** - ไม่ต้องรู้จักชื่อคอลัมน์ฐานข้อมูล

### สำหรับระบบ
- **ยัง sync ข้อมูลได้ปกติ** - แค่เปลี่ยนชื่อ header
- **ไม่กระทบ data** - ข้อมูลยังเหมือนเดิม
- **ย้อนกลับได้** - ถ้าจะเปลี่ยนกลับก็ทำได้

---

## ถ้ามีปัญหา

### ปัญหาที่อาจเกิด
1. **Header ไม่เปลี่ยน** - ต้องลบ sheet เก่าแล้ว sync ใหม่
2. **Data ไม่ตรงกับ header** - ตรวจสอบว่า `upsertRecord_()` ใช้ original headers
3. **Sync error** - ตรวจสอบว่า Apps Script ถูกบันทึกแล้ว

### วิธีแก้
1. **ลบและ sync ใหม่**
   - ลบ sheet "CH1 Responses" เก่า
   - รัน sync ใหม่
   - จะสร้าง header ภาษาไทยใหม่

2. **ตรวจสอบ Apps Script**
   - ดูใน `Executions` ว่ามี error อะไร
   - ตรวจสอบว่า `COLUMN_MAPPING` ถูกต้อง

---

## สถานะ

✅ **Code พร้อม**  
✅ **Mapping ครบถ้วน**  
✅ **ทดสอบได้**  

**รอการติดตั้งบน Google Apps Script ของคุณ**
