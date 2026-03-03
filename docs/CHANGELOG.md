# Changelog - Well-being Survey

## [v3.1.0] - 2025-03-03

### 🔒 Security (Priority 1)
- ✅ เพิ่ม Rate Limiting ป้องกัน spam
  - จำกัด 5 ครั้งต่อชั่วโมงต่ออีเมล
  - บล็อกอัตโนมัติ 24 ชั่วโมงถ้าเกิน
  - ตรวจสอบ disposable email domains
  
- ✅ ปรับปรุง RLS Policies ใน Supabase
  - จำกัดการ INSERT ซ้ำภายใน 1 ชั่วโมง
  - จำกัดขนาดข้อมูล (1MB สำหรับ survey, 2MB สำหรับ HRD)
  - เพิ่ม validation email format ใน database level
  - Admin เท่านั้นที่อ่านข้อมูลได้
  
- ✅ เพิ่มระบบ Resume Survey
  - Auto-detect draft ที่ค้างไว้
  - แสดง popup ถามว่าต้องการทำต่อหรือไม่
  - ลบ draft อัตโนมัติถ้าเก่าเกิน 7 วัน
  
- ✅ ปรับปรุง Validation
  - ตรวจสอบ email format เข้มงวดขึ้น
  - เพิ่ม validation ขนาดข้อมูล
  - แสดง error messages ที่ชัดเจน

### ⚡ Performance (Priority 2)
- ✅ เพิ่ม Pagination ใน Admin Dashboard
  - แสดง 20 รายการต่อหน้า
  - มี navigation controls ที่ใช้งานง่าย
  - แสดงจำนวนรายการทั้งหมด
  
- ✅ Cache Chart Data
  - บันทึก chart data ไว้ใน memory
  - ลด calculation ซ้ำซ้อน
  - ล้าง cache เมื่อ filter เปลี่ยน
  
- ✅ ปรับปรุง Error Messages
  - แปลเป็นภาษาไทยทั้งหมด
  - แสดงสาเหตุที่เข้าใจง่าย
  - มี error summary ใน validation
  
- ✅ เพิ่ม Loading States
  - Global loading overlay
  - Inline loading สำหรับ sections
  - Progress bar สำหรับ long operations
  - แสดงความคืบหน้าชัดเจน

### 📝 Documentation
- เพิ่ม CHANGELOG.md
- อัพเดท README.md
- เพิ่ม SQL migration scripts
- เพิ่ม comments ในโค้ด

### 🐛 Bug Fixes
- แก้ไข auto-save ที่อาจ fail ใน private mode
- แก้ไข validation ที่ไม่แสดง error message
- แก้ไข chart rendering ซ้ำซ้อน

---

## [v3.0.0] - 2025-03-01

### ✨ Features
- โครงสร้างใหม่ 5 ส่วน (จาก 7 ส่วน)
- เพิ่มฟิลด์ใหม่ ~30 ฟิลด์
- ปรับปรุง UI/UX
- Auto-save ทุก 30 วินาที

### 🗄️ Database
- Migration schema v3
- เพิ่ม indexes
- ปรับปรุง RLS policies

---

## [v2.1.0] - 2025-02-15

### ✨ Features
- แบบสอบถาม 7 ส่วน
- BMI & TMHI calculator
- Admin dashboard
- Export Excel

---

## Roadmap

### Priority 3 (Nice to have)
- [ ] Export PDF สำหรับผลลัพธ์
- [ ] ระบบแจ้งเตือนทาง email
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode ด้วย Service Worker
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Mobile app

### Future Enhancements
- [ ] AI-powered insights
- [ ] Automated reporting
- [ ] Integration with HR systems
- [ ] Benchmarking dashboard
- [ ] Custom survey builder
