# Project Overview: Public Sector Well-being HRD Plan

โครงการพัฒนาแผนปฏิบัติการสร้างเสริมสุขภาวะองค์กรข้าราชการพลเรือน

## 1. Project Summary (สรุปโครงการ)

โครงการระดับชาติที่ร่วมมือกันระหว่าง สสส., NIDA และ สำนักงาน ก.พ. เพื่อพัฒนาระบบและแผนปฏิบัติการสร้างเสริมสุขภาวะ (Well-being) ให้กับข้าราชการพลเรือน โดยมีเป้าหมายเพื่อเปลี่ยนแนวทางการดูแลสุขภาพจาก "การรักษา (Curative)" เป็น "การป้องกันเชิงรุก (Preventive)" เพื่อลดภาระค่ารักษาพยาบาลของภาครัฐ (9.9 หมื่นล้านบาท/ปี)

หัวใจสำคัญของโปรเจกต์คือ การบูรณาการข้อมูลสุขภาวะแบบองค์รวม 4 มิติ เข้ากับ "แผนพัฒนาทรัพยากรบุคคล (HRD Plan)" และ "แผนพัฒนารายบุคคล (IDP)" ใน 15 หน่วยงานนำร่อง

## 2. Core Objectives (วัตถุประสงค์หลัก)

- Awareness: สร้างความเข้าใจให้ผู้บริหารและทีม HR ภาครัฐ เรื่องการนำ Well-being เข้าสู่ HRD Plan
- Assessment: สร้างเครื่องมือประเมินสุขภาวะเบื้องต้น (4 มิติ) และเชื่อมโยงข้อมูลกับ IDP
- Intervention & Tracking: พัฒนาฐานข้อมูลมาตรการส่งเสริมสุขภาวะ (Intervention Packages) พร้อมระบบติดตามประเมินผล
- Policy Impact: จัดทำข้อเสนอเชิงนโยบาย (Policy Brief) เพื่อยกระดับเข้าสู่ระบบบริหารทรัพยากรบุคคลของภาครัฐทั้งประเทศ

## 3. Context for Agentic IDE & Development Team (ข้อมูลสำคัญสำหรับทีมพัฒนาระบบ)

หากระบบนี้ต้องการการพัฒนา Software, Web Application หรือ Data Pipeline นอกเหนือจากงานวิจัย นี่คือสิ่งที่ AI/Dev Team ต้องทำความเข้าใจ:

### 3.1 Data Architecture & Domains (โครงสร้างข้อมูลสุขภาวะ 4 มิติ)

ข้อมูลที่ต้องจัดเก็บและวิเคราะห์จะถูกแบ่งเป็น 4 มิติหลัก (Holistic Well-being):

- Physical (กายภาพ): พฤติกรรมสุขภาพ, โรค NCDs, สถิติการลาป่วย (Absenteeism)
- Mental (จิตใจ): ความเครียด, ภาวะหมดไฟ (Burnout), ความพึงพอใจในงาน
- Social (สังคม): ความสัมพันธ์ในองค์กร, การมีส่วนร่วม, การสนับสนุนจากทีม
- Environment (สภาพแวดล้อม): ความปลอดภัย, ความยืดหยุ่นในงาน (Work-life balance)

### 3.2 Key Technical Deliverables (สิ่งที่ต้องถูกสร้างขึ้น)

- Well-being Assessment Tool: ระบบแบบสอบถาม/ประเมินผลสุขภาวะออนไลน์ (Survey/Form) สำหรับบุคลากร
- Intervention Packages Database (e-Database): คลังข้อมูลส่วนกลาง (Knowledge Base/Menu) ที่รวบรวมนวัตกรรม/กิจกรรมส่งเสริมสุขภาพ ให้ HR สามารถเข้ามาค้นหา เลือก (Filter) และนำไปใช้จัดทำแผนได้
- Data Dashboard / Analytics: ระบบแสดงผลการวิเคราะห์ข้อมูล (Baseline vs Endline) เปรียบเทียบก่อน-หลัง และเชื่อมโยง (Data Integration) ข้อมูลสุขภาวะเข้ากับข้อมูล HRD/IDP ของพนักงาน
- Monitoring System: ระบบติดตามความคืบหน้าของกิจกรรม (Activity Tracking) สำหรับ 15 หน่วยงานนำร่อง

### 3.3 User Roles (กลุ่มผู้ใช้งาน)

- System Admin / Researchers (NIDA): จัดการระบบ, ดึงข้อมูลภาพรวมเพื่อทำรายงานนโยบาย
- Wellness Champion / HRD (15 Pilot Agencies): ทำหน้าที่เลือก Intervention, วางแผน HRD Plan, บันทึกข้อมูลและติดตามผล (Monitoring)
- Civil Servants / Staff (End Users): ทำแบบประเมิน, เข้าร่วมกิจกรรม, รับข้อมูล Feedback เพื่อจัดทำ IDP ของตนเอง

## 4. Project Timeline & Phases (ระยะเวลา 18 เดือน)

- Phase 1: Foundation (ต.ค. 68 - ม.ค. 69) - ทบทวนวรรณกรรม, วิเคราะห์ช่องว่างนโยบาย
- Phase 2: Selection (ธ.ค. 68 - มี.ค. 69) - คัดเลือก 15 หน่วยงานนำร่อง, ตั้งทีม Wellness
- Phase 3: Deep Assessment (ก.พ. 69 - ก.ค. 69) - สำรวจสุขภาวะ 4 มิติ, เชื่อมข้อมูลหา Pain point
- Phase 4: Design & Tools (เม.ย. 69 - ส.ค. 69) - พัฒนา Intervention Packages, จัดทำ Action Plan ระดับหน่วยงาน
- Phase 5: Action & Learning (ก.ค. 69 - พ.ย. 69) - Implementation นำแผนไปปฏิบัติจริง, เก็บข้อมูลประเมินผล
- Phase 6: Policy Impact (พ.ย. 69 - ม.ค. 70) - จัดทำ Policy Brief เสนอ สำนักงาน ก.พ. / ก.พ.ร.

## 5. Potential Risks & Technical Constraints (ข้อควรระวังสำหรับระบบ)

- Data Integration Constraints: ระบบฐานข้อมูล IDP/HRD ของแต่ละหน่วยงานราชการอาจมีความแตกต่างกันทางเทคนิค (Legacy systems) การดึงข้อมูลมาเชื่อมโยงอาจต้องใช้วิธีนำเข้าผ่านไฟล์ (CSV/Excel) หรือออกแบบ API ที่ยืดหยุ่น
- Data Privacy & Security: การเก็บข้อมูลสุขภาพ (Health Data) และข้อมูลส่วนบุคคลของข้าราชการ ต้องปฏิบัติตาม PDPA อย่างเคร่งครัด การวิเคราะห์ผลต้องทำในลักษณะ Anonymized หรือ Aggregated data ในระดับนโยบาย
- Adoption Rate: ต้องออกแบบระบบให้ใช้งานง่าย (User-friendly) เพื่อจูงใจให้ข้าราชการตอบแบบประเมิน และจูงใจให้ HR อัปเดตข้อมูลต่อเนื่อง