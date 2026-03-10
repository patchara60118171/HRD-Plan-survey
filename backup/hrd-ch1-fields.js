(function (window) {
  const supportStatusLabels = {
    full: 'มีตามแผน',
    partial: 'มีไม่ครบตามแผน',
    none: 'ไม่มี'
  };

  const digitalSystemLabels = {
    e_doc: 'ระบบเอกสารอิเล็กทรอนิกส์',
    e_sign: 'ระบบลงนามอิเล็กทรอนิกส์ (E-Signature)',
    cloud: 'ระบบ Cloud',
    hr_digital: 'ระบบ HR Digital',
    health_db: 'ระบบฐานข้อมูลสุขภาพ',
    none: 'ไม่มีระบบดังกล่าว',
    other: 'อื่น ๆ'
  };

  const strategicPriorityLabels = {
    service_efficiency: 'การเพิ่มประสิทธิภาพการให้บริการประชาชน',
    digital_capability: 'การพัฒนาศักยภาพด้านดิจิทัล',
    new_leaders: 'การพัฒนาผู้นำรุ่นใหม่',
    reduce_sick_leave: 'การลดอัตราการลาป่วย',
    reduce_turnover: 'การลดอัตราการลาออก',
    other: 'อื่น ๆ'
  };

  const fieldSections = [
    {
      title: 'ส่วนที่ 1: ข้อมูลเบื้องต้นของส่วนราชการ',
      groups: [
        {
          questionNo: '0',
          title: 'ชื่อหน่วยงาน',
          fields: [
            { key: 'organization', label: 'สำนัก/กอง / ชื่อหน่วยงาน' }
          ]
        },
        {
          questionNo: '1',
          title: 'ภาพรวมยุทธศาสตร์และทิศทางของส่วนราชการ',
          fields: [
            { key: 'strategic_overview', label: 'คำตอบ' },
            { key: 'strategy_file_name', label: 'ชื่อไฟล์แนบภาพรวมยุทธศาสตร์' },
            { key: 'strategy_file_url', label: 'ลิงก์ไฟล์แนบภาพรวมยุทธศาสตร์' }
          ]
        },
        {
          questionNo: '2',
          title: 'โครงสร้างองค์กรและบทบาทหน้าที่หลัก',
          fields: [
            { key: 'org_structure', label: 'คำตอบ' },
            { key: 'org_structure_file_name', label: 'ชื่อไฟล์แนบโครงสร้างองค์กร' },
            { key: 'org_structure_file_url', label: 'ลิงก์ไฟล์แนบโครงสร้างองค์กร' }
          ]
        },
        {
          questionNo: '3',
          title: 'ข้อมูลโครงสร้างอัตรากำลัง',
          fields: [
            { key: 'total_staff', label: 'บุคลากรรวมทั้งหมด', unit: 'คน' },
            { key: 'type_official', label: 'ข้าราชการ', unit: 'คน' },
            { key: 'type_employee', label: 'พนักงานราชการ', unit: 'คน' },
            { key: 'type_contract', label: 'ลูกจ้าง', unit: 'คน' },
            { key: 'type_other', label: 'อื่น ๆ', unit: 'คน' },
            { key: 'age_u30', label: 'อายุไม่เกิน 30 ปี', unit: 'คน' },
            { key: 'age_31_40', label: 'อายุ 31-40 ปี', unit: 'คน' },
            { key: 'age_41_50', label: 'อายุ 41-50 ปี', unit: 'คน' },
            { key: 'age_51_60', label: 'อายุ 51-60 ปี', unit: 'คน' },
            { key: 'service_u1', label: 'อายุราชการไม่เกิน 1 ปี', unit: 'คน' },
            { key: 'service_1_5', label: 'อายุราชการ 1-5 ปี', unit: 'คน' },
            { key: 'service_6_10', label: 'อายุราชการ 6-10 ปี', unit: 'คน' },
            { key: 'service_11_15', label: 'อายุราชการ 11-15 ปี', unit: 'คน' },
            { key: 'service_16_20', label: 'อายุราชการ 16-20 ปี', unit: 'คน' },
            { key: 'service_21_25', label: 'อายุราชการ 21-25 ปี', unit: 'คน' },
            { key: 'service_26_30', label: 'อายุราชการ 26-30 ปี', unit: 'คน' },
            { key: 'service_over30', label: 'อายุราชการ 31 ปีขึ้นไป', unit: 'คน' },
            { key: 'pos_o1', label: 'ประเภททั่วไป ปฏิบัติงาน (O1)', unit: 'คน' },
            { key: 'pos_o2', label: 'ประเภททั่วไป ชำนาญงาน (O2)', unit: 'คน' },
            { key: 'pos_o3', label: 'ประเภททั่วไป อาวุโส (O3)', unit: 'คน' },
            { key: 'pos_o4', label: 'ประเภททั่วไป ทักษะพิเศษ (O4)', unit: 'คน' },
            { key: 'pos_k1', label: 'ประเภทวิชาการ ปฏิบัติการ (K1)', unit: 'คน' },
            { key: 'pos_k2', label: 'ประเภทวิชาการ ชำนาญการ (K2)', unit: 'คน' },
            { key: 'pos_k3', label: 'ประเภทวิชาการ ชำนาญการพิเศษ (K3)', unit: 'คน' },
            { key: 'pos_k4', label: 'ประเภทวิชาการ เชี่ยวชาญ (K4)', unit: 'คน' },
            { key: 'pos_k5', label: 'ประเภทวิชาการ ทรงคุณวุฒิ (K5)', unit: 'คน' },
            { key: 'pos_m1', label: 'ประเภทอำนวยการ ระดับต้น (M1)', unit: 'คน' },
            { key: 'pos_m2', label: 'ประเภทอำนวยการ ระดับสูง (M2)', unit: 'คน' },
            { key: 'pos_s1', label: 'ประเภทบริหาร ระดับต้น (S1)', unit: 'คน' },
            { key: 'pos_s2', label: 'ประเภทบริหาร ระดับสูง (S2)', unit: 'คน' }
          ]
        },
        {
          questionNo: '4',
          title: 'อัตราการลาออกและอัตราการโอนย้ายของหน่วยงาน',
          fields: [
            { key: 'turnover_count', label: 'จำนวนการลาออก', unit: 'คน' },
            { key: 'turnover_rate', label: 'อัตราการลาออก', unit: '%' },
            { key: 'transfer_count', label: 'จำนวนการโอนย้าย', unit: 'คน' },
            { key: 'transfer_rate', label: 'อัตราการโอนย้าย', unit: '%' }
          ]
        }
      ]
    },
    {
      title: 'ส่วนที่ 2: นโยบายและบริบทภายนอกองค์กร',
      groups: [
        {
          questionNo: '5',
          title: 'นโยบายและยุทธศาสตร์ที่เกี่ยวข้อง',
          fields: [
            { key: 'related_policies', label: 'คำตอบ' }
          ]
        },
        {
          questionNo: '6',
          title: 'ข้อมูลบริบทและความท้าทาย',
          fields: [
            { key: 'context_challenges', label: 'คำตอบ' }
          ]
        }
      ]
    },
    {
      title: 'ส่วนที่ 3: ข้อมูลสุขภาวะของบุคลากรในปีที่ผ่านมา',
      groups: [
        {
          questionNo: '7',
          title: 'สุขภาวะทางกาย',
          fields: [
            { key: 'disease_diabetes', label: 'เบาหวาน', unit: 'คน' },
            { key: 'disease_hypertension', label: 'ความดันโลหิตสูง', unit: 'คน' },
            { key: 'disease_cardiovascular', label: 'โรคหัวใจและหลอดเลือด', unit: 'คน' },
            { key: 'disease_kidney', label: 'โรคไต', unit: 'คน' },
            { key: 'disease_liver', label: 'โรคตับ', unit: 'คน' },
            { key: 'disease_cancer', label: 'โรคมะเร็ง', unit: 'คน' },
            { key: 'disease_obesity', label: 'ภาวะอ้วน/น้ำหนักเกิน', unit: 'คน' },
            { key: 'disease_other_count', label: 'โรคอื่น ๆ', unit: 'คน' },
            { key: 'disease_other_detail', label: 'รายละเอียดโรคอื่น ๆ' },
            { key: 'ncd_count', label: 'NCD รวม', unit: 'คน' },
            { key: 'ncd_ratio_pct', label: 'NCD (%)', unit: '%' }
          ]
        },
        {
          questionNo: '8',
          title: 'ข้อมูลการลาป่วย',
          fields: [
            { key: 'sick_leave_days', label: 'จำนวนวันลาป่วยรวมต่อปี', unit: 'วัน' },
            { key: 'sick_leave_avg', label: 'จำนวนวันลาป่วยเฉลี่ยต่อคนต่อปี', unit: 'วัน' }
          ]
        },
        {
          questionNo: '9',
          title: 'ข้อมูลการใช้บริการห้องพยาบาล',
          fields: [
            { key: 'clinic_users_per_year', label: 'จำนวนผู้ใช้บริการต่อปี', unit: 'คน' },
            { key: 'clinic_top_symptoms', label: 'กลุ่มอาการที่พบหลัก ๆ' },
            { key: 'clinic_top_medications', label: 'ประเภทยาที่จ่ายบ่อย' }
          ]
        },
        {
          questionNo: '10',
          title: 'ผลสำรวจสุขภาพจิต',
          fields: [
            { key: 'mental_stress', label: 'ภาวะเครียดเรื้อรัง' },
            { key: 'mental_anxiety', label: 'ภาวะวิตกกังวล' },
            { key: 'mental_sleep', label: 'ปัญหาการนอนหลับ' },
            { key: 'mental_burnout', label: 'ภาวะหมดไฟ (Burnout)' },
            { key: 'mental_depression', label: 'ภาวะซึมเศร้า' }
          ]
        },
        {
          questionNo: '11',
          title: 'ผลสำรวจความผูกพันองค์กร (Employee Engagement)',
          fields: [
            { key: 'engagement_score', label: 'คะแนนภาพรวมรายปี' },
            { key: 'engagement_low_areas', label: 'ประเด็นที่ได้คะแนนต่ำ' }
          ]
        },
        {
          questionNo: '12',
          title: 'ผลการสำรวจสุขภาวะด้วยเครื่องมืออื่น ๆ',
          fields: [
            { key: 'other_wellbeing_surveys', label: 'คำตอบ' }
          ]
        }
      ]
    },
    {
      title: 'ส่วนที่ 4: ระบบการบริหารและสภาพแวดล้อมที่เอื้อต่อสุขภาวะ',
      groups: [
        {
          questionNo: '13',
          title: 'สถานะระบบการบริหารบุคลากร',
          fields: [
            { key: 'mentoring_system', label: 'ระบบพี่เลี้ยง' },
            { key: 'job_rotation', label: 'ระบบหมุนเวียนงาน' },
            { key: 'idp_system', label: 'การจัดทำ IDP' },
            { key: 'career_path_system', label: 'เส้นทางความก้าวหน้า (Career Path)' }
          ]
        },
        {
          questionNo: '14',
          title: 'ชั่วโมงการอบรมเฉลี่ยต่อคนต่อปี',
          fields: [
            { key: 'training_hours', label: 'จำนวนชั่วโมงการอบรมเฉลี่ยต่อคนต่อปี', unit: 'ชั่วโมง' }
          ]
        },
        {
          questionNo: '15',
          title: 'ระบบสนับสนุนดิจิทัล',
          fields: [
            { key: 'digital_systems', label: 'ระบบที่หน่วยงานมี', type: 'array' }
          ]
        },
        {
          questionNo: '16',
          title: 'การจัดสภาพแวดล้อมตามหลักการยศาสตร์ (Ergonomics)',
          fields: [
            { key: 'ergonomics_status', label: 'สถานะการดำเนินการ' },
            { key: 'ergonomics_detail', label: 'รายละเอียด / ผลลัพธ์' }
          ]
        }
      ]
    },
    {
      title: 'ส่วนที่ 5: ทิศทาง เป้าหมาย และข้อเสนอแนะ',
      groups: [
        {
          questionNo: '17',
          title: 'จุดเน้นการพัฒนา',
          fields: [
            { key: 'strategic_priority_rank1', label: 'อันดับ 1', type: 'ranking' },
            { key: 'strategic_priority_rank2', label: 'อันดับ 2', type: 'ranking' },
            { key: 'strategic_priority_rank3', label: 'อันดับ 3', type: 'ranking' },
            { key: 'strategic_priority_other', label: 'อื่น ๆ (โปรดระบุ)' }
          ]
        },
        {
          questionNo: '18',
          title: 'ข้อเสนอแนะเกี่ยวกับฐานข้อมูล Intervention Packages เพิ่มเติม',
          fields: [
            { key: 'intervention_packages_feedback', label: 'คำตอบ' }
          ]
        },
        {
          questionNo: '19',
          title: 'ไฟล์ HRD PLAN ปี 2567-2570 พร้อมผลการปฏิบัติงาน',
          fields: [
            { key: 'hrd_plan_url', label: 'ลิงก์ HRD PLAN' },
            { key: 'hrd_plan_results', label: 'ผลการปฏิบัติงานตามแผน' },
            { key: 'hrd_plan_file_name', label: 'ชื่อไฟล์แนบ HRD PLAN' },
            { key: 'hrd_plan_file_url', label: 'ลิงก์ไฟล์แนบ HRD PLAN' }
          ]
        }
      ]
    }
  ];

  const flatFields = fieldSections.flatMap(function (section) {
    return section.groups.flatMap(function (group) {
      return group.fields.map(function (field) {
        return Object.assign({}, field, {
          sectionTitle: section.title,
          groupTitle: group.title,
          questionNo: group.questionNo,
          excelHeader: buildExcelHeader(group, field)
        });
      });
    });
  });

  function buildExcelHeader(group, field) {
    const base = group.questionNo ? `Q${group.questionNo} ${group.title}` : group.title;
    if (!field.label || field.label === 'คำตอบ') return base;
    if (field.label === group.title) return base;
    return `${base} — ${field.label}`;
  }

  function isBlank(value) {
    return value == null || value === '' || (Array.isArray(value) && value.length === 0);
  }

  function formatDateTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  }

  function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('th-TH');
  }

  function formatPlainValue(value) {
    if (isBlank(value)) return '—';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'number') return value.toLocaleString('th-TH');
    return String(value);
  }

  function formatResponseValue(key, value, field) {
    if (isBlank(value)) return '—';

    if (key === 'submitted_at') return formatDateTime(value);

    if (key === 'mentoring_system' || key === 'job_rotation' || key === 'idp_system' || key === 'career_path_system') {
      return supportStatusLabels[value] || String(value);
    }

    if (key === 'digital_systems') {
      const values = Array.isArray(value) ? value : [value];
      return values.map(function (item) {
        return digitalSystemLabels[item] || item;
      }).join(', ');
    }

    if (key === 'ergonomics_status') {
      const ergonomicsLabels = {
        none: 'ยังไม่มี',
        planned: 'มีแผนแต่ยังไม่ดำเนินการ',
        in_progress: 'อยู่ระหว่างดำเนินการ',
        done: 'ดำเนินการแล้ว',
        completed: 'ดำเนินการแล้ว'
      };
      return ergonomicsLabels[value] || String(value);
    }

    if (key === 'strategic_priority_rank1' || key === 'strategic_priority_rank2' || key === 'strategic_priority_rank3') {
      return strategicPriorityLabels[value] || String(value);
    }

    const plainValue = formatPlainValue(value);
    if (plainValue === '—') return plainValue;
    if (field && field.unit) return plainValue + ' ' + field.unit;
    return plainValue;
  }

  function resolveOrgCode(record, organizations) {
    if (record && record.org_code) return record.org_code;
    if (!record || !Array.isArray(organizations)) return '';
    const matched = organizations.find(function (org) {
      return org.org_name_th === record.organization;
    });
    return matched ? matched.org_code || '' : '';
  }

  function getRespondentEmail(record) {
    return record && (record.respondent_email || record.email) ? (record.respondent_email || record.email) : '—';
  }

  function buildSections(record) {
    return fieldSections.map(function (section) {
      return {
        title: section.title,
        groups: section.groups.map(function (group) {
          return {
            questionNo: group.questionNo,
            title: group.title,
            fields: group.fields.map(function (field) {
              return Object.assign({}, field, {
                value: formatResponseValue(field.key, record ? record[field.key] : null, field)
              });
            })
          };
        })
      };
    });
  }

  function buildWideRow(record, index, organizations) {
    const row = {
      'ลำดับ': index + 1,
      'วันที่ส่ง': formatDateTime(record && record.submitted_at),
      'วันที่': formatDate(record && record.submitted_at),
      'org_code': resolveOrgCode(record, organizations),
      'สำนัก/กอง': record && record.organization ? record.organization : '—',
      'อีเมลผู้ตอบ': getRespondentEmail(record),
      'เวอร์ชันแบบฟอร์ม': record && record.form_version ? record.form_version : '—'
    };

    flatFields.forEach(function (field) {
      row[field.excelHeader] = formatResponseValue(field.key, record ? record[field.key] : null, field);
    });

    return row;
  }

  function buildLongRows(records, organizations) {
    return records.flatMap(function (record, index) {
      const context = getContext(record, index, organizations);
      return buildSections(record).flatMap(function (section) {
        return section.groups.flatMap(function (group) {
          return group.fields.map(function (field) {
            return {
              'ลำดับ': index + 1,
              'วันที่ส่ง': context.submittedAt,
              'org_code': context.orgCode || '—',
              'สำนัก/กอง': context.organization,
              'อีเมลผู้ตอบ': context.respondentEmail,
              'ส่วน': section.title,
              'ข้อ': group.questionNo ? 'ข้อ ' + group.questionNo : '—',
              'คำถาม': group.title,
              'หัวข้อย่อย': field.label,
              'คำตอบ': field.value
            };
          });
        });
      });
    });
  }

  function getContext(record, index, organizations) {
    const submittedDate = formatDate(record && record.submitted_at);
    const organization = record && record.organization ? record.organization : 'ไม่ระบุ';
    return {
      index: index,
      indexLabel: index + 1,
      orgCode: resolveOrgCode(record, organizations),
      organization: organization,
      respondentEmail: getRespondentEmail(record),
      submittedAt: formatDateTime(record && record.submitted_at),
      submittedDate: submittedDate,
      title: 'ผู้ตอบ #' + (index + 1) + ' — ' + organization + ' — ' + submittedDate
    };
  }

  window.HRD_CH1_FIELDS = {
    supportStatusLabels: supportStatusLabels,
    digitalSystemLabels: digitalSystemLabels,
    strategicPriorityLabels: strategicPriorityLabels,
    sections: fieldSections,
    flatFields: flatFields,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatResponseValue: formatResponseValue,
    resolveOrgCode: resolveOrgCode,
    getRespondentEmail: getRespondentEmail,
    buildSections: buildSections,
    buildWideRow: buildWideRow,
    buildLongRows: buildLongRows,
    getContext: getContext
  };
})(window);
