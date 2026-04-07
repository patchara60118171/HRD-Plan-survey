# รายงานคอลัมน์ที่ฟอร์ม CH1 ปัจจุบันไม่ได้ถาม

**วันที่สร้าง:** 2026-04-06  
**เปรียบเทียบระหว่างคอลัมน์ในฐานข้อมูล hrd_ch1_responses (155 คอลัมน์) กับฟอร์ม CH1 ปัจจุบัน**

---

## คอลัมน์ที่ฟอร์ม CH1 ไม่ได้ถาม (ปัจจุบัน)

### 1. คอลัมน์ Legacy ที่ถูกลบไปแล้ว ✅
| คอลัมน์ | สถานะ | หมายเหตุ |
|----------|--------|----------|
| `turnover_count` | **ถูกลบ 2026-04-06** | จำนวนลาออก (เปลี่ยนไปใช้โมเดล 5 ปี) |
| `turnover_rate` | **ถูกลบ 2026-04-06** | อัตราลาออก % (เปลี่ยนไปใช้โมเดล 5 ปี) |
| `transfer_count` | **ถูกลบ 2026-04-06** | จำนวนโอนย้าย (เปลี่ยนไปใช้โมเดล 5 ปี) |
| `transfer_rate` | **ถูกลบ 2026-04-06** | อัตราโอนย้าย % (เปลี่ยนไปใช้โมเดล 5 ปี) |

### 2. คอลัมน์ Metadata (ไม่ใช่คำถามในฟอร์ม) ✅
| คอลัมน์ | สถานะ | หมายเหตุ |
|----------|--------|----------|
| `id` | ใช้ระบบ | Primary Key UUID |
| `created_at` | ใช้ระบบ | เวลาสร้างอัตโนมัติ |
| `submitted_at` | ใช้ระบบ | เวลาส่งฟอร์ม |
| `form_version` | ใช้ระบบ | เวอร์ชันฟอร์ม (ch1-v4.0) |
| `status` | ใช้ระบบ | submitted/draft/reopened |
| `is_test` | ใช้ระบบ | true/false สำหรับทดสอบ |
| `submission_mode` | ใช้ระบบ | live/test |
| `test_run_id` | ใช้ระบบ | ID สำหรับการทดสอบ |
| `round_code` | ใช้ระบบ | round_2569 |
| `last_saved_at` | ใช้ระบบ | เวลาบันทึกล่าสุด |
| `reopened_at` | ใช้ระบบ | เวลาเปิดแก้ไข |
| `locked_at` | ใช้ระบบ | เวลาล็อก |
| `updated_by` | ใช้ระบบ | ผู้อัปเดตล่าสุด |

### 3. คอลัมน์ Google Sync (ระบบอัตโนมัติ) ✅
| คอลัมน์ | สถานะ | หมายเหตุ |
|----------|--------|----------|
| `google_sync_status` | ใช้ระบบ | pending/synced/failed |
| `google_sync_attempts` | ใช้ระบบ | จำนวนครั้งที่พยายาม sync |
| `google_sync_error` | ใช้ระบบ | ข้อความ error |
| `google_sync_requested_at` | ใช้ระบบ | เวลาที่ขอ sync |
| `google_synced_at` | ใช้ระบบ | เวลาที่ sync เสร็จ |
| `google_sheet_row_number` | ใช้ระบบ | หมายเลขแถวใน Google Sheet |
| `google_drive_sync_status` | ใช้ระบบ | pending/synced/failed |
| `google_drive_synced_at` | ใช้ระบบ | เวลา sync Drive |
| `google_drive_error` | ใช้ระบบ | ข้อความ error |
| `google_drive_files` | ใช้ระบบ | JSON array ของไฟล์ |

### 4. คอลัมน์ที่อาจไม่ได้ใช้ในฟอร์มปัจจุบัน ⚠️

| คอลัมน์ | สถานะ | หมายเหตุ |
|----------|--------|----------|
| `engagement_score` | **ไม่พบในฟอร์ม** | Engagement Score ปัจจุบัน (มีแต่แยกรายปี) |
| `strategic_priorities` | **ไม่พบในฟอร์ม** | Array ของลำดับความสำคัญ (ใช้ rank1-3 แทน) |
| `strategic_priority_other` | **ไม่พบในฟอร์ม** | ลำดับความสำคัญอื่น ๆ |
| `intervention_packages_feedback` | **ไม่พบในฟอร์ม** | ข้อเสนอแนะการแทรกแซง |
| `support_systems` | **ไม่พบในฟอร์ม** | ระบบสนับสนุน (อาจเป็นคอลัมน์เก่า) |
| `wellbeing_analysis` | **ไม่พบในฟอร์ม** | การวิเคราะห์สวัสดิภาพ |

---

## คอลัมน์ที่ฟอร์ม CH1 ปัจจุบันใช้จริง

### ฟอร์ม CH1 ใช้ไฟล์ไหนเป็นฐาน?

**ฟอร์ม CH1 ปัจจุบันใช้:**
1. **`ch1.html`** - หน้าเว็บฟอร์มหลัก (3581 บรรทัด)
2. **`js/ch1-form.js`** - JavaScript logic สำหรับจัดการฟอร์ม (1143 บรรทัด)

### คำถามที่ฟอร์มถามจริง (จาก `collectAllData()` ใน js/ch1-form.js)

#### Step 1: ข้อมูลเบื้องต้น
- `organization` - หน่วยงาน
- `strategic_overview` - ภาพรวมยุทธศาสตร์
- `org_structure` - โครงสร้างองค์กร
- `total_staff` - จำนวนบุคลากรรวม
- `age_u30`, `age_31_40`, `age_41_50`, `age_51_60` - จำแนกตามอายุ
- `service_u1`, `service_1_5`, `service_6_10`, `service_11_15`, `service_16_20`, `service_21_25`, `service_26_30`, `service_over30` - จำแนกตามระยะเวลาทำงาน
- `pos_o1`-`pos_o4`, `pos_k1`-`pos_k5`, `pos_m1`-`pos_m2`, `pos_s1`-`pos_s2` - จำแนกตามระดับตำแหน่ง
- `type_official`, `type_employee`, `type_contract`, `type_other` - จำแนกตามประเภทบุคลากร

#### Step 2: ข้อมูลรายปี (5 ปีย้อนหลัง)
- `begin_2564`-`begin_2568` - จำนวนต้นปี
- `end_2564`-`end_2568` - จำนวนปลายปี
- `leave_2564`-`leave_2568` - จำนวนลาออก
- `rate_2564`-`rate_2568` - อัตราการลาออก (คำนวณอัตโนมัติ)

#### Step 3: นโยบายและบริบท
- `related_policies` - นโยบายที่เกี่ยวข้อง
- `context_challenges` - บริบทและความท้าทาย

#### Step 4: สุขภาวะ
- `disease_diabetes`, `disease_hypertension`, `disease_cardiovascular`, `disease_kidney`, `disease_liver`, `disease_cancer`, `disease_obesity` - จำนวนผู้ป่วยแต่ละโรค
- `disease_other_count`, `disease_other_detail` - โรคอื่น ๆ
- `disease_report_type` - ประเภทรายงานโรค
- `ncd_count` - จำนวน NCD รวม (คำนวณอัตโนมัติ)
- `ncd_ratio_pct` - สัดส่วน NCD (คำนวณอัตโนมัติ)
- `sick_leave_days`, `sick_leave_avg` - ข้อมูลการลาป่วย
- `sick_leave_report_type` - ประเภทรายงานการลาป่วย
- `clinic_report_type`, `clinic_users_per_year`, `clinic_top_symptoms`, `clinic_top_medications` - ข้อมูลคลินิก
- `mental_stress`, `mental_anxiety`, `mental_sleep`, `mental_burnout`, `mental_depression` - สุขภาพจิต
- `mental_health_report_type` - ประเภทรายงานสุขภาพจิต
- `engagement_score_2564`-`engagement_score_2568` - Engagement Score รายปี
- `engagement_low_areas` - ด้านที่มีคะแนนต่ำ
- `other_wellbeing_surveys` - แบบสำรวจอื่น ๆ

#### Step 5: ระบบและสภาพแวดล้อม
- `mentoring_system`, `job_rotation`, `idp_system`, `career_path_system` - ระบบการพัฒนาบุคลากร
- `training_hours` - จำนวนชั่วโมงการอบรมโดยรวม
- `training_hours_2564`-`training_hours_2568` - จำนวนชั่วโมงการอบรมรายปี
- `digital_systems` - ระบบดิจิทัลที่ใช้ (checkbox)
- `ergonomics_status`, `ergonomics_detail` - สภาพแวดล้อมการทำงาน

#### Step 6: ทิศทางและเป้าหมาย
- `strategic_priority_rank1`, `strategic_priority_rank2`, `strategic_priority_rank3` - ลำดับความสำคัญยุทธศาสตร์
- `hrd_plan_url`, `hrd_plan_results` - แผนพัฒนาบุคลากร

#### ไฟล์แนบ
- `strategy_file_path`, `strategy_file_url`, `strategy_file_name` - ไฟล์แผนยุทธศาสตร์
- `org_structure_file_path`, `org_structure_file_url`, `org_structure_file_name` - ไฟล์โครงสร้างองค์กร
- `hrd_plan_file_path`, `hrd_plan_file_url`, `hrd_plan_file_name` - ไฟล์แผนพัฒนาบุคลากร

---

## สรุป

### คอลัมน์ที่ฟอร์มไม่ได้ถามจริง ๆ

**เพียง 5-6 คอลัมน์** ที่อาจไม่ได้ใช้ในฟอร์มปัจจุบัน:

1. `engagement_score` - Engagement Score ปัจจุบัน (มีแต่แยกรายปี)
2. `strategic_priorities` - Array ของลำดับความสำคัญ (ใช้ rank1-3 แทน)
3. `strategic_priority_other` - ลำดับความสำคัญอื่น ๆ
4. `intervention_packages_feedback` - ข้อเสนอแนะการแทรกแซง
5. `support_systems` - ระบบสนับสนุน (อาจเป็นคอลัมน์เก่า)
6. `wellbeing_analysis` - การวิเคราะห์สวัสดิภาพ

### คอลัมน์อื่น ๆ ที่ไม่ได้ถาม

- **4 legacy columns** - ถูกลบไปแล้ว ✅
- **12 metadata columns** - ใช้ระบบอัตโนมัติ ✅
- **10 google sync columns** - ใช้ระบบอัตโนมัติ ✅

### ฐานที่มาของคำถาม

**ฟอร์ม CH1 ปัจจุบันใช้:**
1. **`ch1.html`** - หน้าเว็บฟอร์มหลัก
2. **`js/ch1-form.js`** - JavaScript logic ที่รวบรวมข้อมูลจากฟอร์ม

**ไม่ใช้:** `supabase/migrations/20260319_seed_form_questions.sql` (นี้คือ seed data สำหรับฐานข้อมูล ไม่ใช่ฟอร์มจริง)

---

## คำแนะนำ

### คอลัมน์ที่อาจต้องการทำความสะอาด

ถ้าต้องการทำความสะอาดฐานข้อมูลให้สมบูรณ์ สามารถพิจารณา:

1. **ตรวจสอบ** ว่า 5-6 คอลัมน์ข้างบนยังใช้จริงหรือไม่
2. **ถ้าไม่ใช้** สามารถสร้าง migration เพื่อลบได้
3. **ถ้ายังใช้** ตรวจสอบว่ามีการใช้งานในส่วนไหนของระบบ

### การตรวจสอบการใช้งาน

รัน SQL เพื่อตรวจสอบว่าคอลัมน์เหล่านี้มีข้อมูลจริงหรือไม่:

```sql
-- ตรวจสอบคอลัมน์ที่อาจไม่ได้ใช้
SELECT 
    COUNT(*) FILTER (WHERE engagement_score IS NOT NULL) as engagement_score_count,
    COUNT(*) FILTER (WHERE strategic_priorities IS NOT NULL) as strategic_priorities_count,
    COUNT(*) FILTER (WHERE strategic_priority_other IS NOT NULL) as strategic_priority_other_count,
    COUNT(*) FILTER (WHERE intervention_packages_feedback IS NOT NULL) as intervention_feedback_count,
    COUNT(*) FILTER (WHERE support_systems IS NOT NULL) as support_systems_count,
    COUNT(*) FILTER (WHERE wellbeing_analysis IS NOT NULL) as wellbeing_analysis_count
FROM hrd_ch1_responses;
```

ถ้า count เป็น 0 หรือต่ำมาก ๆ แสดงว่าคอลัมน์เหล่านั้นอาจไม่ได้ใช้จริง
