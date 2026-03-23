/* ========== PROJECT SINGLE SOURCE OF TRUTH (SSOT) ========== */

const PROJECT_SSOT = {
  constants: {
    surveyBaseUrl: 'https://nidawellbeing.vercel.app',
    lockedSuperadminEmails: ['admin@gmail.com'],
    orgHrEmailDomain: '@wellbeing.go.th',
  },

  wellbeing: {
    sectionsOrder: ['personal', 'consumption', 'nutrition', 'activity', 'mental', 'loneliness', 'safety', 'environment'],
    surveyData: {} // populated at runtime by questions.js → setWellbeingSurveyData()
  },

  ch1: {
    stepNames: ['เริ่มต้น', 'ข้อมูลพื้นฐาน', 'นโยบาย/บริบท', 'สุขภาวะ', 'ระบบ/สภาพแวดล้อม', 'ทิศทาง/เป้าหมาย'],
    supportSystems: [
      { id: 'mentoring_system', label: 'ระบบพี่เลี้ยง (Mentoring)' },
      { id: 'job_rotation', label: 'ระบบหมุนเวียนงาน (Job Rotation)' },
      { id: 'idp_system', label: 'การจัดทำแผนพัฒนารายบุคคล (IDP)' },
      { id: 'career_path_system', label: 'เส้นทางความก้าวหน้า (Career Path)' },
    ],
    supportOptions: [
      { v: 'full', l: 'มีตามแผน' },
      { v: 'partial', l: 'มีไม่ครบตามแผน' },
      { v: 'none', l: 'ไม่มี' },
    ],
    strategicTopics: [
      { id: 'service_efficiency', label: 'การเพิ่มประสิทธิภาพการให้บริการประชาชน' },
      { id: 'digital_capability', label: 'การพัฒนาศักยภาพด้านดิจิทัล' },
      { id: 'new_leaders', label: 'การพัฒนาผู้นำรุ่นใหม่' },
      { id: 'reduce_sick_leave', label: 'การลดอัตราการลาป่วย' },
      { id: 'reduce_turnover', label: 'การลดอัตราการลาออก' },
      { id: 'other', label: 'อื่น ๆ' },
    ],
    fallbackFields: {
      organization: 'หน่วยงาน',
      org_code: 'รหัสหน่วยงาน',
      strategic_overview: 'ภาพรวมยุทธศาสตร์',
      org_structure: 'โครงสร้างองค์กร',
      total_staff: 'บุคลากรรวม',
      type_official: 'ข้าราชการ',
      type_employee: 'พนักงานราชการ',
      type_contract: 'ลูกจ้าง',
      type_other: 'อื่นๆ',
      age_u30: 'อายุ ≤30 ปี',
      age_31_40: 'อายุ 31-40 ปี',
      age_41_50: 'อายุ 41-50 ปี',
      age_51_60: 'อายุ 51-60 ปี',
      turnover_count: 'จำนวนลาออก',
      turnover_rate: 'อัตราลาออก (%)',
      transfer_count: 'จำนวนโอนย้าย',
      transfer_rate: 'อัตราโอนย้าย (%)',
      related_policies: 'นโยบายที่เกี่ยวข้อง',
      context_challenges: 'บริบทและความท้าทาย',
      ncd_count: 'NCD รวม',
      ncd_ratio_pct: 'NCD (%)',
      disease_diabetes: 'เบาหวาน',
      disease_hypertension: 'ความดันโลหิตสูง',
      disease_cardiovascular: 'โรคหัวใจและหลอดเลือด',
      disease_kidney: 'โรคไต',
      disease_liver: 'โรคตับ',
      disease_cancer: 'มะเร็ง',
      disease_obesity: 'ภาวะอ้วน',
      sick_leave_days: 'วันลาป่วยรวม/ปี',
      sick_leave_avg: 'วันลาป่วยเฉลี่ย/คน',
      clinic_users_per_year: 'ผู้ใช้บริการห้องพยาบาล/ปี',
      engagement_score: 'Engagement Score',
      mentoring_system: 'ระบบพี่เลี้ยง',
      job_rotation: 'Job Rotation',
      idp_system: 'IDP',
      career_path_system: 'Career Path',
      training_hours: 'ชั่วโมงอบรม/คน/ปี',
      strategic_priority_rank1: 'จุดเน้น อันดับ 1',
      strategic_priority_rank2: 'จุดเน้น อันดับ 2',
      strategic_priority_rank3: 'จุดเน้น อันดับ 3'
    }
  },

  organizations: {
    // orgHrMap — canonical order (1–15) synced with Supabase `organizations` table (SSOT) 2026-03-23
    // Migration canonicalize_org_codes_abbr_sort applied: hssd→dhss(sort4), probation→dop(sort7), ocsc→opdc(sort13)
    // abbr_th / abbr_en confirmed by project owner 2026-03-23
    orgHrMap: [
      { org_code: 'nesdc', abbr_th: 'สศช.',          abbr_en: 'NESDC', org_name_th: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ' },         // 1
      { org_code: 'tpso',  abbr_th: 'สนค.',          abbr_en: 'TPSO',  org_name_th: 'สำนักงานนโยบายและยุทธศาสตร์การค้า' },                    // 2
      { org_code: 'dss',   abbr_th: 'วศ.',           abbr_en: 'DSS',   org_name_th: 'กรมวิทยาศาสตร์บริการ' },                                 // 3
      { org_code: 'dhss',  abbr_th: 'สบส.',          abbr_en: 'DHSS',  org_name_th: 'กรมสนับสนุนบริการสุขภาพ' },                              // 4
      { org_code: 'tmd',   abbr_th: 'อต.',           abbr_en: 'TMD',   org_name_th: 'กรมอุตุนิยมวิทยา' },                                     // 5
      { org_code: 'dcp',   abbr_th: 'สวธ.',          abbr_en: 'DCP',   org_name_th: 'กรมส่งเสริมวัฒนธรรม' },                                  // 6
      { org_code: 'dop',   abbr_th: 'คป.',           abbr_en: 'DOP',   org_name_th: 'กรมคุมประพฤติ' },                                         // 7
      { org_code: 'mots',  abbr_th: 'สป.กก.',        abbr_en: 'MOTS',  org_name_th: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา' },             // 8
      { org_code: 'dmh',   abbr_th: 'สจ.',           abbr_en: 'DMH',   org_name_th: 'กรมสุขภาพจิต' },                                         // 9
      { org_code: 'onep',  abbr_th: 'สผ.',           abbr_en: 'ONEP',  org_name_th: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม' }, // 10
      { org_code: 'nrct',  abbr_th: 'วช.',           abbr_en: 'NRCT',  org_name_th: 'สำนักงานการวิจัยแห่งชาติ' },                             // 11
      { org_code: 'acfs',  abbr_th: 'มกอช.',         abbr_en: 'ACFS',  org_name_th: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ' },          // 12
      { org_code: 'opdc',  abbr_th: 'สำนักงาน ก.พ.ร.', abbr_en: 'OPDC', org_name_th: 'สำนักงานคณะกรรมการพัฒนาระบบราชการ' },                  // 13
      { org_code: 'rid',   abbr_th: 'ชป.',           abbr_en: 'RID',   org_name_th: 'กรมชลประทาน' },                                           // 14
      { org_code: 'dcy',   abbr_th: 'ดย.',           abbr_en: 'DCY',   org_name_th: 'กรมกิจการเด็กและเยาวชน' },                               // 15
    ],
    // orgCodeNameMap — lowercase keys; ch1-form.js normalises ?org= param to lowercase.
    // Admin portal uses Supabase `organizations` table as SSOT; this is the form-side static fallback.
    // Old codes (hssd, probation, ocsc) kept as backward-compat aliases.
    orgCodeNameMap: {
      nesdc:      'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',        // 1
      tpso:       'สำนักงานนโยบายและยุทธศาสตร์การค้า',                   // 2
      dss:        'กรมวิทยาศาสตร์บริการ',                                // 3
      dhss:       'กรมสนับสนุนบริการสุขภาพ',                             // 4 (canonical)
      hssd:       'กรมสนับสนุนบริการสุขภาพ',                             // 4 legacy alias
      tmd:        'กรมอุตุนิยมวิทยา (สถาบันอุตุนิยมวิทยา)',             // 5
      dcp:        'กรมส่งเสริมวัฒนธรรม',                                // 6
      dop:        'กรมคุมประพฤติ',                                        // 7 (canonical)
      probation:  'กรมคุมประพฤติ',                                        // 7 legacy alias
      mots:       'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',            // 8
      dmh:        'กรมสุขภาพจิต',                                        // 9
      onep:       'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', // 10
      nrct:       'สำนักงานการวิจัยแห่งชาติ',                            // 11
      acfs:       'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ (มกอช.)', // 12
      opdc:       'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',         // 13 (canonical)
      ocsc:       'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',         // 13 legacy alias
      rid:        'กรมชลประทาน',                                          // 14
      dcy:        'กรมกิจการเด็กและเยาวชน',                               // 15
      doh:        'กองฝึกอบรม กรมทางหลวง',                               // extra
    },
  },
};

PROJECT_SSOT.setWellbeingSurveyData = function setWellbeingSurveyData(sectionsOrder, surveyData) {
  this.wellbeing.sectionsOrder = Array.isArray(sectionsOrder) ? sectionsOrder : [];
  this.wellbeing.surveyData = surveyData && typeof surveyData === 'object' ? surveyData : {};
};
