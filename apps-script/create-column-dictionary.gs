/**
 * สร้าง tab "📋 คำอธิบายคอลัมน์" ใน Google Sheet
 * วิธีใช้: เปิด Extensions > Apps Script > วางโค้ดนี้ > Run createColumnDictionary
 */
function createColumnDictionary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const SHEET_NAME = '📋 คำอธิบายคอลัมน์';

  // ลบ sheet เดิมถ้ามีอยู่แล้ว
  const existing = ss.getSheetByName(SHEET_NAME);
  if (existing) ss.deleteSheet(existing);

  const sheet = ss.insertSheet(SHEET_NAME);

  // ============================================================
  // ข้อมูลคำอธิบาย: [column_name, ชื่อภาษาไทย, หมวดหมู่, หมายเหตุ]
  // ============================================================
  const columns = [
    // ─── ระบบ ───
    ['id',                          'รหัสเอกสาร (UUID)',                           'ระบบ',        'สร้างอัตโนมัติ'],
    ['created_at',                  'วันที่บันทึกข้อมูลลงฐานข้อมูล',               'ระบบ',        'Timestamp อัตโนมัติ'],
    ['submitted_at',                'วันที่ผู้ใช้กดส่งแบบฟอร์ม',                   'ระบบ',        ''],
    ['respondent_email',            'อีเมลผู้กรอกแบบฟอร์ม',                        'ระบบ',        ''],
    ['organization',                'ชื่อหน่วยงาน',                                'ระบบ',        ''],
    ['form_version',                'เวอร์ชันของแบบฟอร์ม',                          'ระบบ',        ''],
    ['is_test',                     'ข้อมูลทดสอบ (true = ทดสอบ)',                  'ระบบ',        ''],
    ['submission_mode',             'โหมดการส่งข้อมูล (live/test)',                'ระบบ',        ''],
    ['test_run_id',                 'รหัส Run สำหรับการทดสอบ',                      'ระบบ',        ''],

    // ─── ข้อ 1: ไฟล์แนบเอกสาร ───
    ['strategic_overview',          'URL ไฟล์แนบ: ภาพรวมยุทธศาสตร์',              'ข้อ 1 เอกสาร', ''],
    ['org_structure',               'URL ไฟล์แนบ: โครงสร้างองค์กร',               'ข้อ 1 เอกสาร', ''],
    ['strategy_file_path',          'Path ไฟล์ยุทธศาสตร์ใน Storage',              'ข้อ 1 เอกสาร', ''],
    ['strategy_file_url',           'URL ดาวน์โหลด: ไฟล์ยุทธศาสตร์',              'ข้อ 1 เอกสาร', ''],
    ['strategy_file_name',          'ชื่อไฟล์ยุทธศาสตร์',                          'ข้อ 1 เอกสาร', ''],
    ['org_structure_file_path',     'Path ไฟล์โครงสร้างองค์กรใน Storage',         'ข้อ 1 เอกสาร', ''],
    ['org_structure_file_url',      'URL ดาวน์โหลด: ไฟล์โครงสร้างองค์กร',        'ข้อ 1 เอกสาร', ''],
    ['org_structure_file_name',     'ชื่อไฟล์โครงสร้างองค์กร',                    'ข้อ 1 เอกสาร', ''],
    ['hrd_plan_url',                'URL ไฟล์แนบ: แผน HRD',                        'ข้อ 1 เอกสาร', ''],
    ['hrd_plan_results',            'ผลลัพธ์แผน HRD',                              'ข้อ 1 เอกสาร', ''],
    ['hrd_plan_file_path',          'Path ไฟล์แผน HRD ใน Storage',                'ข้อ 1 เอกสาร', ''],
    ['hrd_plan_file_url',           'URL ดาวน์โหลด: ไฟล์แผน HRD',                'ข้อ 1 เอกสาร', ''],
    ['hrd_plan_file_name',          'ชื่อไฟล์แผน HRD',                             'ข้อ 1 เอกสาร', ''],

    // ─── ข้อ 2: จำนวนบุคลากร ───
    ['total_staff',                 'จำนวนบุคลากรทั้งหมด (คน)',                    'ข้อ 2 บุคลากร', ''],
    ['type_official',               'ข้าราชการ (คน)',                               'ข้อ 2 บุคลากร', ''],
    ['type_employee',               'พนักงานราชการ (คน)',                           'ข้อ 2 บุคลากร', ''],
    ['type_contract',               'ลูกจ้าง/จ้างเหมา (คน)',                       'ข้อ 2 บุคลากร', ''],
    ['type_other',                  'บุคลากรประเภทอื่น (คน)',                       'ข้อ 2 บุคลากร', ''],

    // ─── ข้อ 3: อายุ ───
    ['age_u30',                     'อายุต่ำกว่า 30 ปี (คน)',                       'ข้อ 3 อายุ',   ''],
    ['age_31_40',                   'อายุ 31–40 ปี (คน)',                           'ข้อ 3 อายุ',   ''],
    ['age_41_50',                   'อายุ 41–50 ปี (คน)',                           'ข้อ 3 อายุ',   ''],
    ['age_51_60',                   'อายุ 51–60 ปี (คน)',                           'ข้อ 3 อายุ',   ''],

    // ─── ข้อ 3: อายุราชการ ───
    ['service_u1',                  'อายุราชการน้อยกว่า 1 ปี (คน)',                'ข้อ 3 อายุราชการ', ''],
    ['service_1_5',                 'อายุราชการ 1–5 ปี (คน)',                      'ข้อ 3 อายุราชการ', ''],
    ['service_6_10',                'อายุราชการ 6–10 ปี (คน)',                     'ข้อ 3 อายุราชการ', ''],
    ['service_11_15',               'อายุราชการ 11–15 ปี (คน)',                    'ข้อ 3 อายุราชการ', ''],
    ['service_16_20',               'อายุราชการ 16–20 ปี (คน)',                    'ข้อ 3 อายุราชการ', ''],
    ['service_21_25',               'อายุราชการ 21–25 ปี (คน)',                    'ข้อ 3 อายุราชการ', ''],
    ['service_26_30',               'อายุราชการ 26–30 ปี (คน)',                    'ข้อ 3 อายุราชการ', ''],
    ['service_over30',              'อายุราชการมากกว่า 30 ปี (คน)',                'ข้อ 3 อายุราชการ', ''],

    // ─── ข้อ 3: ตำแหน่ง ───
    ['pos_o1',                      'ประเภทอำนวยการ ระดับต้น (คน)',                'ข้อ 3 ตำแหน่ง', ''],
    ['pos_o2',                      'ประเภทอำนวยการ ระดับสูง (คน)',                'ข้อ 3 ตำแหน่ง', ''],
    ['pos_o3',                      'ประเภทอำนวยการ ระดับ 3 (คน)',                 'ข้อ 3 ตำแหน่ง', ''],
    ['pos_o4',                      'ประเภทอำนวยการ ระดับ 4 (คน)',                 'ข้อ 3 ตำแหน่ง', ''],
    ['pos_k1',                      'ประเภทวิชาการ ระดับปฏิบัติการ (คน)',          'ข้อ 3 ตำแหน่ง', ''],
    ['pos_k2',                      'ประเภทวิชาการ ระดับชำนาญการ (คน)',            'ข้อ 3 ตำแหน่ง', ''],
    ['pos_k3',                      'ประเภทวิชาการ ระดับชำนาญการพิเศษ (คน)',       'ข้อ 3 ตำแหน่ง', ''],
    ['pos_k4',                      'ประเภทวิชาการ ระดับเชี่ยวชาญ (คน)',           'ข้อ 3 ตำแหน่ง', ''],
    ['pos_k5',                      'ประเภทวิชาการ ระดับทรงคุณวุฒิ (คน)',          'ข้อ 3 ตำแหน่ง', ''],
    ['pos_m1',                      'ประเภทบริหาร ระดับต้น (คน)',                  'ข้อ 3 ตำแหน่ง', ''],
    ['pos_m2',                      'ประเภทบริหาร ระดับสูง (คน)',                  'ข้อ 3 ตำแหน่ง', ''],
    ['pos_s1',                      'ประเภทสนับสนุน ระดับปฏิบัติงาน (คน)',         'ข้อ 3 ตำแหน่ง', ''],
    ['pos_s2',                      'ประเภทสนับสนุน ระดับชำนาญงาน (คน)',           'ข้อ 3 ตำแหน่ง', ''],

    // ─── ข้อ 4: อัตราลาออก/โอนย้าย ───
    ['turnover_count',              'จำนวนบุคลากรลาออก (คน)',                      'ข้อ 4 Turnover', ''],
    ['turnover_rate',               'อัตราลาออก (%)',                               'ข้อ 4 Turnover', ''],
    ['transfer_count',              'จำนวนบุคลากรโอนย้าย (คน)',                    'ข้อ 4 Turnover', ''],
    ['transfer_rate',               'อัตราโอนย้าย (%)',                             'ข้อ 4 Turnover', ''],
    ['begin_2564',                  'จำนวนบุคลากร ต้นปี 2564',                     'ข้อ 4 ต้น/ปลายปี', ''],
    ['begin_2565',                  'จำนวนบุคลากร ต้นปี 2565',                     'ข้อ 4 ต้น/ปลายปี', ''],
    ['begin_2566',                  'จำนวนบุคลากร ต้นปี 2566',                     'ข้อ 4 ต้น/ปลายปี', ''],
    ['begin_2567',                  'จำนวนบุคลากร ต้นปี 2567',                     'ข้อ 4 ต้น/ปลายปี', ''],
    ['begin_2568',                  'จำนวนบุคลากร ต้นปี 2568',                     'ข้อ 4 ต้น/ปลายปี', ''],
    ['end_2564',                    'จำนวนบุคลากร ปลายปี 2564',                    'ข้อ 4 ต้น/ปลายปี', ''],
    ['end_2565',                    'จำนวนบุคลากร ปลายปี 2565',                    'ข้อ 4 ต้น/ปลายปี', ''],
    ['end_2566',                    'จำนวนบุคลากร ปลายปี 2566',                    'ข้อ 4 ต้น/ปลายปี', ''],
    ['end_2567',                    'จำนวนบุคลากร ปลายปี 2567',                    'ข้อ 4 ต้น/ปลายปี', ''],
    ['end_2568',                    'จำนวนบุคลากร ปลายปี 2568',                    'ข้อ 4 ต้น/ปลายปี', ''],
    ['leave_2564',                  'จำนวนบุคลากรลาออก/โอนย้าย ปี 2564',          'ข้อ 4 ต้น/ปลายปี', ''],
    ['leave_2565',                  'จำนวนบุคลากรลาออก/โอนย้าย ปี 2565',          'ข้อ 4 ต้น/ปลายปี', ''],
    ['leave_2566',                  'จำนวนบุคลากรลาออก/โอนย้าย ปี 2566',          'ข้อ 4 ต้น/ปลายปี', ''],
    ['leave_2567',                  'จำนวนบุคลากรลาออก/โอนย้าย ปี 2567',          'ข้อ 4 ต้น/ปลายปี', ''],
    ['leave_2568',                  'จำนวนบุคลากรลาออก/โอนย้าย ปี 2568',          'ข้อ 4 ต้น/ปลายปี', ''],
    ['rate_2564',                   'อัตราลาออก/โอนย้าย ปี 2564 (%)',              'ข้อ 4 ต้น/ปลายปี', ''],
    ['rate_2565',                   'อัตราลาออก/โอนย้าย ปี 2565 (%)',              'ข้อ 4 ต้น/ปลายปี', ''],
    ['rate_2566',                   'อัตราลาออก/โอนย้าย ปี 2566 (%)',              'ข้อ 4 ต้น/ปลายปี', ''],
    ['rate_2567',                   'อัตราลาออก/โอนย้าย ปี 2567 (%)',              'ข้อ 4 ต้น/ปลายปี', ''],
    ['rate_2568',                   'อัตราลาออก/โอนย้าย ปี 2568 (%)',              'ข้อ 4 ต้น/ปลายปี', ''],

    // ─── ข้อ 5: บริบทและนโยบาย ───
    ['related_policies',            'นโยบายที่เกี่ยวข้อง',                          'ข้อ 5 บริบท',  ''],
    ['context_challenges',          'บริบทและความท้าทาย',                           'ข้อ 5 บริบท',  ''],

    // ─── ข้อ 6: โรค NCD ───
    ['disease_report_type',         'ประเภทข้อมูลโรค (ข้าราชการ/รวม)',             'ข้อ 6 NCD',    ''],
    ['disease_diabetes',            'โรคเบาหวาน (คน)',                              'ข้อ 6 NCD',    ''],
    ['disease_hypertension',        'โรคความดันโลหิตสูง (คน)',                      'ข้อ 6 NCD',    ''],
    ['disease_cardiovascular',      'โรคหัวใจและหลอดเลือด (คน)',                   'ข้อ 6 NCD',    ''],
    ['disease_kidney',              'โรคไต (คน)',                                   'ข้อ 6 NCD',    ''],
    ['disease_liver',               'โรคตับ (คน)',                                  'ข้อ 6 NCD',    ''],
    ['disease_cancer',              'โรคมะเร็ง (คน)',                               'ข้อ 6 NCD',    ''],
    ['disease_obesity',             'ภาวะอ้วน/น้ำหนักเกิน (คน)',                   'ข้อ 6 NCD',    ''],
    ['disease_other_count',         'โรคอื่นๆ จำนวน (คน)',                          'ข้อ 6 NCD',    ''],
    ['disease_other_detail',        'โรคอื่นๆ รายละเอียด',                          'ข้อ 6 NCD',    ''],
    ['ncd_count',                   'จำนวนผู้ป่วย NCD รวม (คน)',                    'ข้อ 6 NCD',    ''],
    ['ncd_ratio_pct',               'สัดส่วนผู้ป่วย NCD (%)',                       'ข้อ 6 NCD',    ''],

    // ─── ข้อ 8: การลาป่วย ───
    ['sick_leave_report_type',      'ประเภทข้อมูลการลาป่วย (ข้าราชการ/รวม)',       'ข้อ 8 การลา',  ''],
    ['sick_leave_days',             'จำนวนวันลาป่วยรวม (วัน)',                      'ข้อ 8 การลา',  ''],
    ['sick_leave_avg',              'วันลาป่วยเฉลี่ยต่อคน (วัน/คน)',               'ข้อ 8 การลา',  ''],

    // ─── ข้อ 9: คลินิก ───
    ['clinic_report_type',          'ประเภทข้อมูลคลินิก (ข้าราชการ/รวม)',          'ข้อ 9 คลินิก', ''],
    ['clinic_users_per_year',       'จำนวนผู้ใช้คลินิกต่อปี (คน)',                 'ข้อ 9 คลินิก', ''],
    ['clinic_top_symptoms',         'อาการ/โรคที่พบมากที่สุด',                      'ข้อ 9 คลินิก', ''],
    ['clinic_top_medications',      'ยาที่ใช้มากที่สุด',                            'ข้อ 9 คลินิก', ''],

    // ─── ข้อ 10: สุขภาวะทางใจ ───
    ['mental_health_report_type',   'ประเภทข้อมูลสุขภาวะทางใจ',                    'ข้อ 10 Mental', ''],
    ['mental_stress',               'ความเครียด (ระดับ/จำนวน)',                     'ข้อ 10 Mental', ''],
    ['mental_anxiety',              'ความวิตกกังวล (ระดับ/จำนวน)',                  'ข้อ 10 Mental', ''],
    ['mental_sleep',                'ปัญหาการนอนหลับ (ระดับ/จำนวน)',               'ข้อ 10 Mental', ''],
    ['mental_burnout',              'ภาวะหมดไฟ Burnout (ระดับ/จำนวน)',             'ข้อ 10 Mental', ''],
    ['mental_depression',           'ภาวะซึมเศร้า (ระดับ/จำนวน)',                  'ข้อ 10 Mental', ''],

    // ─── ข้อ 11: Engagement ───
    ['engagement_score',            'คะแนน Engagement รวม',                         'ข้อ 11 Engagement', ''],
    ['engagement_score_2564',       'คะแนน Engagement ปี 2564',                     'ข้อ 11 Engagement', ''],
    ['engagement_score_2565',       'คะแนน Engagement ปี 2565',                     'ข้อ 11 Engagement', ''],
    ['engagement_score_2566',       'คะแนน Engagement ปี 2566',                     'ข้อ 11 Engagement', ''],
    ['engagement_score_2567',       'คะแนน Engagement ปี 2567',                     'ข้อ 11 Engagement', ''],
    ['engagement_score_2568',       'คะแนน Engagement ปี 2568',                     'ข้อ 11 Engagement', ''],
    ['engagement_low_areas',        'พื้นที่/ประเด็นที่ Engagement ต่ำ',            'ข้อ 11 Engagement', ''],
    ['other_wellbeing_surveys',     'การสำรวจ Wellbeing อื่นๆ ที่เคยทำ',           'ข้อ 11 Engagement', ''],

    // ─── ข้อ 12–13: ระบบ HRD ───
    ['mentoring_system',            'มีระบบ Mentoring/Coaching (ใช่/ไม่ใช่)',       'ข้อ 12-13 HRD', ''],
    ['job_rotation',                'มีระบบ Job Rotation (ใช่/ไม่ใช่)',             'ข้อ 12-13 HRD', ''],
    ['idp_system',                  'มีระบบ IDP (ใช่/ไม่ใช่)',                      'ข้อ 12-13 HRD', ''],
    ['career_path_system',          'มีระบบ Career Path (ใช่/ไม่ใช่)',              'ข้อ 12-13 HRD', ''],

    // ─── ข้อ 14: ชั่วโมงอบรม ───
    ['training_hours',              'ชั่วโมงอบรมรวม (ชั่วโมง)',                     'ข้อ 14 อบรม',  ''],
    ['training_hours_2564',         'ชั่วโมงอบรม ปี 2564 (ชั่วโมง/คน/ปี)',         'ข้อ 14 อบรม',  ''],
    ['training_hours_2565',         'ชั่วโมงอบรม ปี 2565 (ชั่วโมง/คน/ปี)',         'ข้อ 14 อบรม',  ''],
    ['training_hours_2566',         'ชั่วโมงอบรม ปี 2566 (ชั่วโมง/คน/ปี)',         'ข้อ 14 อบรม',  ''],
    ['training_hours_2567',         'ชั่วโมงอบรม ปี 2567 (ชั่วโมง/คน/ปี)',         'ข้อ 14 อบรม',  ''],
    ['training_hours_2568',         'ชั่วโมงอบรม ปี 2568 (ชั่วโมง/คน/ปี)',         'ข้อ 14 อบรม',  ''],

    // ─── ข้อ 15: ระบบดิจิทัล ───
    ['digital_systems',             'ระบบสนับสนุนดิจิทัลที่มี (เลือกได้หลายข้อ)',  'ข้อ 15 Digital', 'e_doc, e_sign, cloud, hr_digital, health_db, none'],

    // ─── ข้อ 16: Ergonomics ───
    ['ergonomics_status',           'สถานะการจัดสภาพแวดล้อม Ergonomics',           'ข้อ 16 Ergonomics', 'none/planned/in_progress/done'],
    ['ergonomics_detail',           'รายละเอียด Ergonomics (กรณีทั่วไป)',           'ข้อ 16 Ergonomics', ''],
    ['ergonomics_planned_detail',   'รายละเอียด Ergonomics (แผนจะดำเนินการ)',       'ข้อ 16 Ergonomics', ''],
    ['ergonomics_in_progress_detail','รายละเอียด Ergonomics (กำลังดำเนินการ)',      'ข้อ 16 Ergonomics', ''],
    ['ergonomics_done_detail',      'รายละเอียด Ergonomics (ดำเนินการแล้ว)',        'ข้อ 16 Ergonomics', ''],

    // ─── ข้อ 17–19: วิเคราะห์และลำดับความสำคัญ ───
    ['wellbeing_analysis',          'การวิเคราะห์ Wellbeing ของหน่วยงาน',           'ข้อ 17-19', ''],
    ['strategic_priorities',        'ประเด็นยุทธศาสตร์ที่เลือก (Array)',            'ข้อ 17-19', ''],
    ['strategic_priority_other',    'ประเด็นยุทธศาสตร์อื่นๆ (ระบุเพิ่ม)',          'ข้อ 17-19', ''],
    ['strategic_priority_rank1',    'ลำดับความสำคัญอันดับ 1',                       'ข้อ 17-19', ''],
    ['strategic_priority_rank2',    'ลำดับความสำคัญอันดับ 2',                       'ข้อ 17-19', ''],
    ['strategic_priority_rank3',    'ลำดับความสำคัญอันดับ 3',                       'ข้อ 17-19', ''],
    ['intervention_suggestions',    'ข้อเสนอแนะ Intervention',                      'ข้อ 17-19', ''],
    ['intervention_packages_feedback','Feedback เกี่ยวกับ Intervention Packages',   'ข้อ 17-19', ''],
    ['support_systems',             'ระบบสนับสนุนที่ต้องการ',                       'ข้อ 17-19', ''],

    // ─── Google Sync ───
    ['google_sync_status',          'สถานะ Sync ไป Google Sheets',                  'Google Sync', 'pending/success/failed'],
    ['google_sync_attempts',        'จำนวนครั้งที่พยายาม Sync',                     'Google Sync', ''],
    ['google_sync_error',           'ข้อผิดพลาดจาก Google Sync',                   'Google Sync', ''],
    ['google_sync_requested_at',    'เวลาที่ขอ Sync',                               'Google Sync', ''],
    ['google_synced_at',            'เวลาที่ Sync สำเร็จ',                          'Google Sync', ''],
    ['google_sheet_row_number',     'หมายเลข Row ใน Google Sheets',                 'Google Sync', ''],
    ['google_drive_sync_status',    'สถานะ Sync ไฟล์ไป Google Drive',              'Google Sync', ''],
    ['google_drive_synced_at',      'เวลาที่ Sync ไฟล์สำเร็จ',                     'Google Sync', ''],
    ['google_drive_error',          'ข้อผิดพลาดจาก Google Drive Sync',             'Google Sync', ''],
    ['google_drive_files',          'ข้อมูล JSON ไฟล์ที่ Sync ไป Drive',           'Google Sync', ''],
  ];

  // ─── สร้างหัวตาราง ───
  const headers = ['ชื่อคอลัมน์ (อังกฤษ)', 'ความหมาย (ไทย)', 'หมวดหมู่ / ข้อที่', 'หมายเหตุ'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1e3a5f');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);

  // ─── เติมข้อมูล ───
  sheet.getRange(2, 1, columns.length, 4).setValues(columns);

  // ─── ระบายสีสลับแถว + สีตาม category ───
  const categoryColors = {
    'ระบบ':              '#e8f0fe',
    'ข้อ 1 เอกสาร':     '#fce8e6',
    'ข้อ 2 บุคลากร':    '#e6f4ea',
    'ข้อ 3 อายุ':       '#fff3e0',
    'ข้อ 3 อายุราชการ': '#fff8e1',
    'ข้อ 3 ตำแหน่ง':    '#fef9c3',
    'ข้อ 4 Turnover':   '#f3e8ff',
    'ข้อ 4 ต้น/ปลายปี': '#ede7f6',
    'ข้อ 5 บริบท':      '#e0f7fa',
    'ข้อ 6 NCD':        '#fce4ec',
    'ข้อ 8 การลา':      '#e8f5e9',
    'ข้อ 9 คลินิก':     '#e3f2fd',
    'ข้อ 10 Mental':    '#fdf6ec',
    'ข้อ 11 Engagement':'#f1f8e9',
    'ข้อ 12-13 HRD':    '#e8eaf6',
    'ข้อ 14 อบรม':      '#fff3e0',
    'ข้อ 15 Digital':   '#e0f2f1',
    'ข้อ 16 Ergonomics':'#fbe9e7',
    'ข้อ 17-19':        '#f9fbe7',
    'Google Sync':      '#f5f5f5',
  };

  columns.forEach(function(row, i) {
    const category = row[2];
    const color = categoryColors[category] || '#ffffff';
    sheet.getRange(i + 2, 1, 1, 4).setBackground(color);
  });

  // ─── ปรับ column width ───
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 320);
  sheet.setColumnWidth(3, 170);
  sheet.setColumnWidth(4, 200);

  // ─── Freeze header row ───
  sheet.setFrozenRows(1);

  // ─── Auto filter ───
  sheet.getRange(1, 1, columns.length + 1, 4).createFilter();

  // ─── ย้าย tab ไปติดกับ CH1 Responses ───
  const ch1Sheet = ss.getSheetByName('CH1 Responses');
  if (ch1Sheet) {
    ss.moveActiveSheet(ch1Sheet.getIndex() + 1);
  }

  SpreadsheetApp.getUi().alert('✅ สร้าง tab "' + SHEET_NAME + '" เรียบร้อยแล้ว!\nมีคอลัมน์ทั้งหมด ' + columns.length + ' รายการ');
}
