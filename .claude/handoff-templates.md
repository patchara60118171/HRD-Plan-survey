# Handoff Templates Library

## 🚀 พร้อมใช้งาน - เพียงก็อปและวาง

### Template 1: หลัง Implement Frontend
```
# 🎯 TASK HANDOFF - Frontend Implementation Complete

## ✅ งานที่เสร็จแล้ว
- ✅ Implement [ชื่อฟีเจอร์/หน้า] เสร็จ
- ✅ แก้ไขไฟล์: [ระบุไฟล์ที่เปลี่ยน]
- ✅ เพิ่ม functionality: [ระบุฟีเจอร์]

## 🔄 งานที่ Cowork ต้องทำต่อ

### Database/Configuration:
1. ตรวจสอบว่า database schema รองรับฟีเจอร์ใหม่
2. อัปเดต environment variables ถ้าต้องการ
3. ตั้งค่า RLS policies ถ้ามีการเพิ่มตาราง/คอลัมน์
4. ทดสอบการเชื่อมต่อ Supabase

### Deployment:
1. ตรวจสอบ Vercel configuration
2. Deploy ไปยัง production ถ้าพร้อม
3. ตรวจสอบ routes ทั้งหมด
4. ทดสอบ performance

## 🎯 คำสั่งสำหรับ Cowork
คุณเป็น Backend Configuration Specialist กรุณา:

1. **ตรวจสอบ** database schema ว่ารองรับ frontend ใหม่
2. **อัปเดต** configuration ที่จำเป็น
3. **ทดสอบ** การเชื่อมต่อและ functionality
4. **Deploy** ถ้าทุกอย่างพร้อม
5. **รายงาน** ผลการทดสอบและสถานะ deployment

## ⚠️ ข้อควรระวัง
- ตรวจสอบว่าไม่มีการเปลี่ยนแปลง database ที่กระทบข้อมูลเดิม
- ตรวจสอบ environment variables ให้ครบถ้วน
- ทดสอบใน staging ก่อน production

## 📊 Success Criteria
- [ ] Database รองรับฟีเจอร์ใหม่
- [ ] Configuration ถูกต้อง
- [ ] Frontend เชื่อมต่อ backend ได้
- [ ] Deploy สำเร็จ
- [ ] ทดสอบผ่านทุกฟีเจอร์

---
*สร้างเมื่อ: [วันที่/เวลา] โดย: [ชื่อคุณ]*
```

### Template 2: หลัง Bug Fix
```
# 🔧 FIX HANDOFF - Bug Resolution Complete

## ✅ ปัญหาที่แก้ไขแล้ว
- ✅ แก้ไข [ชื่อปัญหา] ใน [ส่วนที่แก้]
- ✅ วิธีแก้ไข: [อธิบายวิธีการแก้]
- ✅ ไฟล์ที่เปลี่ยน: [ระบุไฟล์]

## 🔄 งานที่ Cowork ต้องทำต่อ

### Validation:
1. ทดสอบฟีเจอร์ที่เกี่ยวข้องกับปัญหา
2. ตรวจสอบว่าปัญหาไม่กระทบส่วนอื่น
3. ทดสอบ edge cases ที่อาจเกิดขึ้น
4. ตรวจสอบ data integrity

### System Check:
1. ตรวจสอบ Supabase connections
2. ตรวจสอบ Vercel deployment
3. ทดสอบ performance impact
4. ตรวจสอบ error logs

## 🎯 คำสั่งสำหรับ Cowork
คุณเป็น Backend Configuration Specialist กรุณา:

1. **ทดสอบ** ฟีเจอร์ที่แก้ไขให้ทำงานถูกต้อง
2. **ตรวจสอบ** ว่าไม่มี side effects จากการแก้ไข
3. **Validate** ข้อมูลและการเชื่อมต่อทั้งระบบ
4. **Deploy** ถ้าทุกอย่างเรียบร้อย
5. **รายงาน** ผลการทดสอบและสถานะปัจจุบัน

## ⚠️ จุดที่ต้องตรวจสอบเป็นพิเศษ
- [สิ่งที่อาจเกิดปัญหาจากการแก้ไข]
- [ข้อมูลที่ต้อง validate อย่างละเอียด]
- [ฟีเจอร์ที่อาจได้รับผลกระทบ]

## 📊 Success Criteria
- [ ] ปัญหาถูกแก้ไขเรียบร้อย
- [ ] ไม่มี side effects
- [ ] ระบบทำงานปกติทั้งหมด
- [ ] Performance ไม่ลดลง
- [ ] Error logs ปกติ

---
*แก้ไขเมื่อ: [วันที่/เวลา] โดย: [ชื่อคุณ]*
```

### Template 3: หลัง Database Schema Change
```
# 🗄️ DATABASE HANDOFF - Schema Changes Complete

## ✅ งานที่เสร็จแล้ว
- ✅ สร้าง/แก้ไขตาราง: [ระบุตาราง]
- ✅ เพิ่มคอลัมน์: [ระบุคอลัมน์]
- ✅ อัปเดต RLS policies: [ระบุ policies]
- ✅ Migration script: [ระบุไฟล์ migration]

## 🔄 งานที่ Cowork ต้องทำต่อ

### Database Operations:
1. รัน migration scripts บน Supabase
2. ตรวจสอบว่า schema ถูกต้อง
3. ทดสอบ RLS policies
4. ตรวจสอบ data integrity

### Application Sync:
1. อัปเดต environment variables
2. ทดสอบการเชื่อมต่อจาก frontend
3. ตรวจสอบ API responses
4. ทดสอบ CRUD operations

## 🎯 คำสั่งสำหรับ Cowork
คุณเป็น Backend Configuration Specialist กรุณา:

1. **รัน** migration scripts บน Supabase
2. **ตรวจสอบ** database schema ว่าถูกต้อง
3. **ทดสอบ** RLS policies ทั้งหมด
4. **Validate** การเชื่อมต่อจาก application
5. **รายงาน** สถานะ database และผลการทดสอบ

## ⚠️ ข้อควรระวัง
- สำรองข้อมูลก่อนรัน migration
- ทดสอบใน staging ก่อน production
- ตรวจสอบว่าไม่มี data loss

## 📊 Success Criteria
- [ ] Migration รันสำเร็จ
- [ ] Schema ถูกต้องตามที่ต้องการ
- [ ] RLS policies ทำงาน
- [ ] Application เชื่อมต่อได้
- [ ] Data integrity ปกติ

---
*สร้างเมื่อ: [วันที่/เวลา] โดย: [ชื่อคุณ]*
```

### Template 4: หลัง Environment Setup
```
# 🌍 ENVIRONMENT HANDOFF - Setup Complete

## ✅ งานที่เสร็จแล้ว
- ✅ ตั้งค่า local environment
- ✅ อัปเดต environment variables
- ✅ ตั้งค่า development tools
- ✅ ทดสอบ local connections

## 🔄 งานที่ Cowork ต้องทำต่อ

### Production Setup:
1. อัปเดต Vercel environment variables
2. ตั้งค่า Supabase production
3. ตั้งค่า MCP connections
4. ทดสอบ production endpoints

### Validation:
1. ทดสอบ deployment pipeline
2. ตรวจสอบ service connections
3. ทดสอบ authentication flows
4. ตรวจสอบ monitoring

## 🎯 คำสั่งสำหรับ Cowork
คุณเป็น Backend Configuration Specialist กรุณา:

1. **อัปเดต** production environment ทั้งหมด
2. **ตั้งค่า** MCP services connections
3. **ทดสอบ** deployment pipeline
4. **Validate** การทำงานใน production
5. **รายงาน** สถานะ environment ทั้งหมด

## ⚠️ ข้อควรระวัง
- ตรวจสอบความถูกต้องของ environment variables
- ทดสอบ connections ทั้งหมด
- ตรวจสอบ security settings

## 📊 Success Criteria
- [ ] Environment variables ถูกต้อง
- [ ] MCP services เชื่อมต่อได้
- [ ] Deployment pipeline ทำงาน
- [ ] Production ทำงานปกติ
- [ ] Monitoring ตั้งค่าเรียบร้อย

---
*สร้างเมื่อ: [วันที่/เวลา] โดย: [ชื่อคุณ]*
```

## 🎯 วิธีใช้งานแบบรวดเร็ว

### 1. เลือก Template ที่เหมาะสม
- **Template 1**: หลังทำ frontend/programming
- **Template 2**: หลังแก้ไขปัญหา
- **Template 3**: หลังเปลี่ยน database schema
- **Template 4**: หลังตั้งค่า environment

### 2. แก้ไขข้อมูลใน `[...]`
- เปลี่ยนข้อมูลในวงเล็บเหลี่ยม
- เพิ่มรายละเอียดที่จำเป็น
- ตรวจสอบความครบถ้วน

### 3. ก็อปและวาง
- ก็อป template ทั้งหมด
- วางใน chat กับ cowork
- Cowork จะดำเนินการต่อทันที

### 4. ติดตามผล
- Cowork จะรายงานผลกลับมา
- ตรวจสอบว่างานเสร็จตามต้องการ
- ถ้ามีปัญหาสามารถแจ้งกลับได้

---

*เหล่านี้คือ templates พร้อมใช้ สำหรับการส่งมอบงานที่รวดเร็วและมีประสิทธิภาพ*
