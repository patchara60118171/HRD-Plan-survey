# Developer Guide: การทำงานกับ Claude Cowork

## 🎯 ภาพรวมการทำงาน

### แบ่งหน้าที่ชัดเจน:
- **Developer (คุณ)**: ทำงาน programming, frontend, business logic
- **Cowork**: ทำงาน backend configuration, database, deployment

### Workflow:
```
คุณทำงาน → เสร็จ → สร้าง Handoff Report → ก็อปวางให้ Cowork → Cowork ทำต่อ → รายงานผล
```

## 🚀 การเริ่มต้นใช้งาน

### Step 1: ติดตั้ง Configuration
เมื่อเปิด project ครั้งแรก:
1. อ่าน `.claude/cowork-role-config.md` เพื่อเข้าใจบทบาท
2. อ่าน `.claude/quick-reference.md` สำหรับ decision flow
3. ทดลองใช้ templates ดูครั้งหนึ่ง

### Step 2: ทำงานตามปกติ
ทำงาน programming ของคุณตามปกติ:
- Frontend development
- Business logic
- UI/UX improvements
- Bug fixes

### Step 3: ส่งมอบงาน
เมื่องานเสร็จ:
1. เลือก handoff template ที่เหมาะสม
2. แก้ไขข้อมูลใน `[...]`
3. ก็อปทั้งหมด วางให้ cowork

## 📋 สถานการณ์ที่พบบ่อย

### สถานการณ์ 1: ทำ Frontend เสร็จ
```
คุณ: Implement login page เสร็จ
→ ใช้ Template 1: Frontend Implementation Complete
→ Cowork: จะตั้งค่า database, RLS, deploy
```

### สถานการณ์ 2: แก้ Bug เสร็จ
```
คุณ: แก้ปัญหา form validation เสร็จ
→ ใช้ Template 2: Bug Resolution Complete  
→ Cowork: จะทดสอบและ validate ทั้งระบบ
```

### สถานการณ์ 3: เปลี่ยน Database Schema
```
คุณ: เพิ่มตาราง user_profiles เสร็จ
→ ใช้ Template 3: Database Schema Changes
→ Cowork: จะรัน migration และตั้งค่า RLS
```

### สถานการณ์ 4: ตั้งค่า Environment
```
คุณ: ตั้งค่า local development เสร็จ
→ ใช้ Template 4: Environment Setup
→ Cowork: จะตั้งค่า production และ MCP
```

## 🎯 คำแนะนำการใช้ Templates

### เลือก Template ให้ถูกต้อง:
- **งานใหม่/ฟีเจอร์ใหม่** → Template 1
- **แก้ไขปัญหา** → Template 2  
- **เปลี่ยน database** → Template 3
- **ตั้งค่า environment** → Template 4

### กรอกข้อมูลให้ครบถ้วน:
- **[ชื่องาน]**: ชัดเจน สั้นกระชับ
- **[ไฟล์ที่เปลี่ยน]**: ระบุ path ให้ชัดเจน
- **[รายละเอียด]**: เพิ่มเฉพาะที่จำเป็น
- **[ข้อควรระวัง]**: สิ่งที่ cowork ต้องระวัง

### ตัวอย่างการกรอก:
```
## ✅ งานที่เสร็จแล้ว
- ✅ Implement admin dashboard page เสร็จ
- ✅ แก้ไขไฟล์: admin.html, js/admin-dashboard.js
- ✅ เพิ่ม functionality: user management, data export
```

## ⚠️ ข้อควรระวัง

### อย่าทำให้ Cowork สับสน:
- อย่าให้ทำงาน programming
- อย่าให้เขียน HTML/CSS/JS
- อย่าให้ implement business logic

### อย่าลืมรายละเอียดสำคัญ:
- ไฟล์ที่เปลี่ยนแปลงทั้งหมด
- ฐานข้อมูลที่เกี่ยวข้อง
- environment variables ที่ต้องการ
- จุดที่ต้องทดสอบเป็นพิเศษ

### ตรวจสอบก่อนส่ง:
- งานของคุณเสร็จจริงหรือไม่
- Template ที่เลือกถูกต้องหรือไม่
- ข้อมูลครบถ้วนหรือไม่

## 🔄 การติดต่อกลับ

### หลังจากส่ง Handoff:
- Cowork จะดำเนินการตามคำสั่ง
- จะรายงานผลกลับมา
- ถ้ามีปัญหาจะถามคำชี้แจง

### ถ้า Cowork ถามกลับ:
- ตอบคำถามโดยตรง
- ให้ข้อมูลเพิ่มเติมที่จำเป็น
- ชี้แจงปัญหาที่เกิดขึ้น

### ถ้าต้องการให้ทำงานเพิ่ม:
- สร้าง handoff report ใหม่
- ระบุงานที่ต้องการเพิ่ม
- ส่งให้ cowork ทำต่อ

## 📊 วัดผลการทำงาน

### Success Metrics:
- **Handoff Speed**: เวลาจากเสร็จงานถึงส่งให้ cowork
- **Clarity**: ความชัดเจนของคำสั่ง
- **Completion Rate**: เปอร์เซ็นต์งานที่ cowork ทำสำเร็จ
- **Quality**: คุณภาพของการตั้งค่า backend

### Continuous Improvement:
- บันทึกวิธีการที่ดีที่สุด
- ปรับปรุง template ตามการใช้จริง
- แชร์ tips กับ team members

## 🎯 Best Practices

### ทำตามนี้เสมอ:
1. **ทำงานของคุณให้เสร็จก่อน**
2. **เลือก template ที่เหมาะสม**
3. **กรอกข้อมูลให้ครบถ้วน**
4. **ก็อปวางทั้งหมด**
5. **รอผลลัพธ์จาก cowork**

### หลีกเี่ยงสิ่งเหล่านี้:
- ส่งงานที่ยังไม่เสร็จ
- ให้คำสั่งที่ไม่ชัดเจน
- ลืมระบุไฟล์ที่เปลี่ยน
- ให้ cowork ทำงาน programming

---

*การทำงานร่วมกับ Claude Cowork จะมีประสิทธิภาพเมื่อทุกคนเข้าใจบทบาทและทำตาม process อย่างเคร่งครัด*
