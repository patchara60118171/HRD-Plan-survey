# 🚀 ขั้นตอนการ Setup และทดสอบระบบ Well-being Survey

## 📋 การ Setup ระบบ

### **ขั้นตอนที่ 1: Setup Supabase Database**

1. เข้าไปที่ Supabase Dashboard:
   - URL: https://supabase.com/dashboard/project/fgdommhiqhzvsedfzyrr

2. ไปที่ **SQL Editor**

3. รันไฟล์ SQL ตามลำดับ:

   **a) Run Migration v3:**
   ```
   supabase/migrations/20250303_update_schema_v3.sql
   ```
   
   **b) Run Migration v4:**
   ```
   supabase/migrations/20250305_update_schema_v4.sql
   ```
   
   **c) Run Setup Database:**
   ```
   supabase/setup-database.sql
   ```

4. ตรวจสอบใน **Storage**:
   - ✓ มี bucket ชื่อ `hrd-documents`
   - ✓ Bucket เป็น **Public**
   - ✓ File size limit = **5MB**
   - ✓ Allowed types = **PDF only**

5. ตรวจสอบใน **Authentication > Policies**:
   - ✓ มี RLS policies สำหรับ `hrd_ch1_responses`
   - ✓ มี Storage policies สำหรับ `storage.objects`

---

### **ขั้นตอนที่ 2: รันเซิร์ฟเวอร์ Local**

```powershell
# In PowerShell
cd "C:\Users\Pchr Pyl\Desktop\Well-being Survey"
npx serve
```

หรือ

```powershell
npm run dev
```

เปิดเบราว์เซอร์:
- Survey Form: http://localhost:3000/ch1.html
- Admin Dashboard: http://localhost:3000/admin.html

---

## ✅ การทดสอบระบบ (Testing Checklist)

### **Test 1: ทดสอบการกรอกแบบสอบถาม CH1**

#### **ส่วนที่ 0: เริ่มต้น (Landing)**
- [ ] กรอกอีเมล
- [ ] กดปุ่ม "เริ่มกรอกแบบสอบถาม"
- [ ] แบบฟอร์มแสดงขึ้น

#### **ส่วนที่ 1: ข้อมูลพื้นฐาน**

**1.1 ชื่อหน่วยงาน**
- [ ] กรอก "กรมทดสอบระบบ"
- [ ] ฟิลด์ต้องไม่เป็นค่าว่าง

**1.2 ภาพรวมยุทธศาสตร์**
- [ ] กรอกข้อความยาว 100-200 ตัวอักษร
- [ ] **Test PDF Upload #1 (Strategy)**:
  - [ ] คลิกหรือลากไฟล์ PDF (ขนาด < 512KB)
  - [ ] แสดงชื่อไฟล์และขนาด
  - [ ] กดปุ่ม "ดูไฟล์" เปิด PDF ได้
  - [ ] กดปุ่ม ✕ ลบไฟล์ได้

**1.3 โครงสร้างองค์กร**
- [ ] กรอกข้อความ
- [ ] **Test PDF Upload #2 (Org Structure)**:
  - [ ] อัพโหลด PDF อีกไฟล์
  - [ ] ตรวจสอบว่าอัพโหลดสำเร็จ

**1.4 จำนวนบุคลากรทั้งหมด**
- [ ] กรอก 150
- [ ] ทดสอบ error: กรอก 9999999 (เกิน max)
- [ ] ตรวจสอบว่าแสดง error message ชัดเจน

**1.5 กระจายอายุ (4 กลุ่ม)**
- [ ] อายุ < 30: กรอก 30
- [ ] อายุ 31-40: กรอก 50
- [ ] อายุ 41-50: กรอก 40
- [ ] อายุ 51-60: กรอก 30

**1.6 กระจายอายุราชการ (8 ช่วง)**
- [ ] กรอกครบ 8 ช่องทั้งหมด

**1.7 ตำแหน่ง (13 ระดับ)**
- [ ] กรอกอย่างน้อย 3 ระดับ
- [ ] ทดสอบกรอก 0 ในบางช่อง

**1.8 ประเภทบุคลากร**
- [ ] ข้าราชการ: 80
- [ ] พนักงาน: 40
- [ ] สัญญา: 20
- [ ] อื่นๆ: 10

**1.9 อัตราลาออก/ย้าย**
- [ ] จำนวนลาออก: 5
- [ ] % ลาออก: 3.33
- [ ] กดปุ่ม "ถัดไป →"

---

#### **ส่วนที่ 2: นโยบายและบริบท**

- [ ] กรอก "นโยบาย..."
- [ ] กรอก "บริบท..."  
- [ ] กดปุ่ม "ถัดไป →"

---

#### **ส่วนที่ 3: ข้อมูลสุขภาวะ**

**โรค NCD (7 ประเภท)**
- [ ] เบาหวาน: 10
- [ ] ความดัน: 15
- [ ] หัวใจ: 5
- [ ] ไต: 2
- [ ] ตับ: 1
- [ ] มะเร็ง: 1
- [ ] อ้วน: 20

**ข้อมูลคลินิก**
- [ ] จำนวนใช้คลินิก: 500
- [ ] อาการที่มา: "ปวดหัว, ปวดหลัง"

**สุขภาพจิต**
- [ ] กรอกข้อมูลอย่างน้อย 2 ข้อ

- [ ] กดปุ่ม "ถัดไป →"

---

#### **ส่วนที่ 4: ระบบและสภาพแวดล้อม**

**ระบบสนับสนุน (4 ระบบ)**
- [ ] เลือก radio button ทุกระบบ
- [ ] ทดสอบว่า selection ยังอยู่เมื่อกลับไปหน้าก่อน

**Digital Systems**
- [ ] เลือก checkbox อย่างน้อย 3 อัน

**Ergonomics**
- [ ] เลือก "มีการดำเนินการแล้ว"
- [ ] กรอกรายละเอียด

- [ ] กดปุ่ม "ถัดไป →"

---

#### **ส่วนที่ 5: ทิศทาง/เป้าหมาย**

**จุดเน้นการพัฒนา**
- [ ] เลือก Rank 1, 2, 3 จาก dropdown

**HRD Plan Files**
- [ ] **Test PDF Upload #3 (HRD Plan)**:
  - [ ] อัพโหลดไฟล์ PDF
  - [ ] ตรวจสอบว่าอัพโหลดสำเร็จ

**ข้อเสนอแนะ**
- [ ] กรอกข้อความ

- [ ] กดปุ่ม **"ส่งข้อมูล ✓"**

---

#### **การส่งข้อมูล**

- [ ] แสดง loading overlay
- [ ] แสดง success popup พร้อม Ref ID
- [ ] ไม่มี error popup
- [ ] ตรวจสอบใน Supabase Table Editor:
  - [ ] มี record ใหม่ใน `hrd_ch1_responses`
  - [ ] ทุก field มีข้อมูล
  - [ ] PDF files มี URL

---

### **Test 2: ทดสอบ Auto-save & Draft**

- [ ] กรอกข้อมูลครึ่งหนึ่ง (ส่วนที่ 1-2)
- [ ] รีเฟรชหน้า (F5)
- [ ] แสดง popup ถามว่าต้องการทำต่อหรือไม่
- [ ] กดปุ่ม "ทำต่อ"
- [ ] ข้อมูลที่กรอกไว้ยังอยู่

---

### **Test 3: ทดสอบ Error Handling**

#### **Test 3.1: Numeric Overflow**
- [ ] กรอกจำนวนบุคลากร: 99999999 (เกิน 6 หลัก)
- [ ] กดส่ง
- [ ] แสดง error popup เป็นภาษาไทย
- [ ] มีคำแนะนำว่าต้องแก้ไขอย่างไร
- [ ] แสดงว่าฟิลด์ไหนผิด

#### **Test 3.2: Duplicate Submission**
- [ ] ส่งแบบสอบถามสำเร็จแล้ว
- [ ] รอ 1 นาที
- [ ] ลองส่งอีกครั้งด้วยอีเมลเดิม
- [ ] แสดง warning หรืออนุญาตให้ส่ง (ตาม RLS policy)

---

### **Test 4: ทดสอบ Admin Dashboard**

#### **4.1 Login**
- [ ] เปิด http://localhost:3000/admin.html
- [ ] กรอก username/password ของ admin
- [ ] เข้าสู่ระบบสำเร็จ

#### **4.2 Dashboard Overview**
- [ ] แสดงจำนวน responses รวม
- [ ] แสดง Chart แนวโน้ม 30 วัน
- [ ] แสดง Pie Chart แบ่งตาม form
- [ ] แสดง Bar Chart แบ่งตามองค์กร

#### **4.3 ดูข้อมูล HRD CH1**
- [ ] คลิก "📋 HRD บทที่ 1" ในเมนู
- [ ] แสดงตารางข้อมูล
- [ ] แสดงครบทุก column:
  - [ ] วันที่
  - [ ] องค์กร
  - [ ] อีเมล
  - [ ] Actions (View/Delete)

#### **4.4 ดูรายละเอียด**
- [ ] คลิกปุ่ม "👁" (View) ที่ record แรก
- [ ] แสดง Modal/Page รายละเอียด
- [ ] ตรวจสอบว่าแสดงครบทุกส่วน:
  - [ ] ส่วนที่ 1: ข้อมูลพื้นฐาน
  - [ ] ส่วนที่ 2: นโยบาย
  - [ ] ส่วนที่ 3: สุขภาวะ
  - [ ] ส่วนที่ 4: ระบบ
  - [ ] ส่วนที่ 5: ทิศทาง
  - [ ] PDF Links (3 ไฟล์)

#### **4.5 Export Data**
- [ ] กดปุ่ม "📊 CSV"
- [ ] ดาวน์โหลดไฟล์ CSV สำเร็จ
- [ ] เปิดไฟล์ CSV ได้
- [ ] มีข้อมูลครบ

- [ ] กดปุ่ม "📗 Excel"
- [ ] ดาวน์โหลดไฟล์ .xlsx สำเร็จ
- [ ] เปิดใน Excel ได้

#### **4.6 Filter & Search**
- [ ] ใช้ Filter ตามองค์กร
- [ ] ใช้ Filter ตามวันที่
- [ ] ใช้ Search box

---

### **Test 5: ทดสอบ Responsive Design**

- [ ] เปิดในมือถือ (หรือ DevTools Mobile View)
- [ ] Layout ปรับตัวดี
- [ ] ปุ่มกดได้
- [ ] ฟอร์มใช้งานได้

---

### **Test 6: ทดสอบ Browser Compatibility**

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (ถ้ามี Mac)

---

## 🐛 ปัญหาที่พบและวิธีแก้

### **ปัญหา: PDF Upload ล้มเหลว**

**สาเหตุที่เป็นไปได้:**
1. Bucket name ไม่ตรงกัน (แก้แล้ว: ใช้ `hrd-documents`)
2. Storage policies ไม่ถูกต้อง
3. File size เกิน 5MB

**วิธีแก้:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'hrd-documents';
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

---

### **ปัญหา: Admin ไม่แสดงข้อมูล**

**วิธีแก้:**
1. ตรวจสอบ RLS policies:
```sql
-- Allow authenticated users to read
ALTER TABLE hrd_ch1_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read"
ON hrd_ch1_responses
FOR SELECT
TO authenticated
USING (true);
```

2. ตรวจสอบว่า Login สำเร็จ
3. เช็ค Console errors (F12)

---

### **ปัญหา: Numeric Field Overflow**

**วิธีแก้:**
- ตอนนี้มี validation แล้ว
- ระบบจะ cap ตัวเลขที่ 999,999 อัตโนมัติ
- แสดง error message เป็นภาษาไทย

---

## 📊 ตรวจสอบข้อมูลใน Supabase

### **1. ตรวจสอบ Table**
```sql
-- Count responses
SELECT COUNT(*) FROM hrd_ch1_responses;

-- View recent submissions
SELECT 
    id,
    respondent_email,
    organization,
    submitted_at,
    strategy_file_url,
    org_structure_file_url,
    hrd_plan_file_url
FROM hrd_ch1_responses
ORDER BY submitted_at DESC
LIMIT 10;

-- Check if all numeric fields are populated
SELECT 
    total_staff,
    age_u30,
    age_31_40,
    disease_diabetes,
    disease_hypertension
FROM hrd_ch1_responses
ORDER BY submitted_at DESC
LIMIT 5;
```

### **2. ตรวจสอบ Storage**
```sql
-- List uploaded files
SELECT 
    name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'hrd-documents'
ORDER BY created_at DESC
LIMIT 20;
```

### **3. ตรวจสอบ Policies**
```sql
-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'hrd_ch1_responses';

-- Check storage policies
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## ✅ สรุปการตรวจสอบ

หลังจากทดสอบแล้ว ควรได้:

- ✓ กรอกแบบสอบถามได้ครบทุกส่วน
- ✓ อัพโหลด PDF ได้ 3 ไฟล์
- ✓ ส่งข้อมูลสำเร็จ
- ✓ ข้อมูลบันทึกใน Supabase ครบถ้วน
- ✓ Admin Dashboard แสดงข้อมูลครบ
- ✓ Export เป็น CSV/Excel ได้
- ✓ Error handling ทำงานถูกต้อง

---

## 🚨 หากพบปัญหา

1. เช็ค Browser Console (F12) → Console tab
2. เช็ค Network tab → ดูว่า API calls สำเร็จหรือไม่
3. เช็ค Supabase Logs → Logs & Analytics
4. อ่าน error message ที่แสดง (ตอนนี้เป็นภาษาไทยแล้ว)

---

**สร้างเมื่อ:** 5 March 2026  
**เวอร์ชัน:** 3.1.0
