# ⚡ Quick Test Script

## 🚀 ทดสอบเร็ว 5 นาที

### ✅ Pre-requisites
- ✓ Server กำลังรัน: http://localhost:3000
- ✓ Supabase setup เสร็จแล้ว
- ✓ Browser เปิดอยู่

---

## 📝 Test 1: กรอกแบบสอบถาม CH1 (3 นาที)

### เปิด: http://localhost:3000/ch1.html

**Step 0: เริ่มต้น**
```
Email: test@example.com
→ คลิก "เริ่มกรอกแบบสอบถาม"
```

**Step 1: ข้อมูลพื้นฐาน**
```
ชื่อหน่วยงาน: กรมทดสอบระบบ
ยุทธศาสตร์: "ทดสอบระบบเพื่อพัฒนาบุคลากร"
โครงสร้าง: "มี 5 กอง 20 ส่วน"
จำนวนบุคลากร: 150
```

**PDF Upload #1**
```
→ คลิก/ลาก PDF file (< 512KB)
→ ตรวจสอบว่าแสดงชื่อไฟล์
→ คลิก "ดูไฟล์" ต้องเปิดได้
```

**กรอกข้อมูลอื่นๆ**
```
อายุ < 30: 30
อายุ 31-40: 50
อายุ 41-50: 40
อายุ 51-60: 30
(กรอกอายุราชการและตำแหน่งตามต้องการ)
```

**→ คลิก "ถัดไป"**

---

**Step 2: นโยบาย**
```
นโยบาย: "ทดสอบ"
บริบท: "ทดสอบ"
→ คลิก "ถัดไป"
```

---

**Step 3: สุขภาวะ**
```
เบาหวาน: 10
ความดัน: 15
ใช้คลินิก: 100
→ คลิก "ถัดไป"
```

---

**Step 4: ระบบ**
```
เลือก radio button ระบบสนับสนุน: "มีตามแผน" (1 อันพอ)
เลือก checkbox ระบบดิจิทัล: "ระบบ HR Online" (1 อันพอ)
→ คลิก "ถัดไป"
```

---

**Step 5: ทิศทาง**
```
Rank 1: เลือก "การเพิ่มประสิทธิภาพการให้บริการประชาชน"
อัพโหลด PDF HRD Plan
ข้อเสนอแนะ: "ทดสอบระบบ"
```

**→ คลิก "ส่งข้อมูล ✓"**

### ✅ ผลลัพธ์ที่ต้องการ:
- [ ] แสดง loading
- [ ] แสดง success popup พร้อม Ref ID
- [ ] ไม่มี error

---

## 🖥️ Test 2: Admin Dashboard (2 นาที)

### เปิด: http://localhost:3000/admin.html

**Login**
```
Username: [your-admin-username]
Password: [your-admin-password]
→ คลิก "เข้าสู่ระบบ"
```

**Dashboard**
```
✓ แสดงจำนวน responses
✓ แสดง charts
✓ แสดง recent activity
```

**ดูข้อมูล CH1**
```
→ คลิกเมนู "📋 HRD บทที่ 1"
✓ แสดงตารางข้อมูล
✓ เห็น record ที่เพิ่งส่ง
```

**ดูรายละเอียด**
```
→ คลิกปุ่ม "👁" (View)
✓ แสดงข้อมูลครบ 5 ส่วน
✓ แสดง PDF links
```

**Export**
```
→ คลิก "📊 CSV"
✓ ดาวน์โหลดไฟล์สำเร็จ
```

---

## 🐛 Test 3: Error Handling (30 วินาที)

**กลับไป ch1.html**
```
→ กรอก Email: test2@example.com
→ จำนวนบุคลากร: 99999999 (เกิน max)
→ คลิก "ถัดไป"
```

### ✅ ผลลัพธ์ที่ต้องการ:
- [ ] ระบบ cap ตัวเลขที่ 999,999
- [ ] ถ้า submit ได้ → OK
- [ ] ถ้า error → แสดง error ภาษาไทยพร้อมคำแนะนำ

---

## 📊 ตรวจสอบ Supabase

### เปิด: https://supabase.com/dashboard/project/fgdommhiqhzvsedfzyrr

**Table Editor**
```
→ Tables → hrd_ch1_responses
✓ เห็น record ใหม่
✓ มีข้อมูลครบทุก column
```

**Storage**
```
→ Storage → hrd-documents
✓ มีไฟล์ PDF ที่อัพโหลด
✓ คลิกไฟล์เปิดได้
```

---

## ✅ สรุปผล Quick Test

### ผ่านทุก test หมายความว่า:
- ✅ ฟอร์มทำงานได้
- ✅ PDF อัพโหลดได้
- ✅ ข้อมูลบันทึกลง Database
- ✅ Admin Dashboard แสดงข้อมูลได้
- ✅ Export ทำงานได้
- ✅ Error handling ทำงานได้

---

## 🚨 ถ้าพบปัญหา

1. **PDF อัพโหลดไม่ได้**
   ```sql
   -- Run in Supabase SQL Editor
   \i supabase/setup-database.sql
   ```

2. **Admin ไม่แสดงข้อมูล**
   - เช็คว่า Login แล้ว
   - F12 → Console → ดู errors

3. **Numeric Overflow**
   - ตอนนี้ควรป้องกันแล้ว
   - ถ้ายังเกิด → ดู error message ภาษาไทย

---

## 📞 Next Steps

หลังผ่าน Quick Test:
1. อ่าน **TESTING_GUIDE_COMPLETE.md** สำหรับทดสอบแบบละเอียด
2. อ่าน **SETUP_COMPLETE_SUMMARY.md** สำหรับรายละเอียดระบบ
3. ใช้งานจริงได้เลย! 🎉

---

**เวอร์ชัน:** 3.1.0  
**ใช้เวลาทดสอบ:** ~5 นาที
