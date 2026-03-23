/* ========== ADMIN PORTAL — EXPORT SERVICE ========== */

function exportCurrentPage() {
  const pageId = visiblePageId();
  if (pageId === 'page-ch1-summary') {
    exportCh1SummaryReport();
    return;
  }
  if (pageId === 'page-form-wb') {
    exportRawTable();
    return;
  }
  if (pageId === 'page-users') {
    downloadWorkbook('admin_users.xlsx', 'Users', state.userRows);
    return;
  }
  if (pageId === 'page-links') {
    downloadWorkbook('org_form_links.xlsx', 'Links', state.linkRows.length ? state.linkRows : getOrgCatalog().map((org) => ({ organization: org.name, url: buildLinkUrl(org) })));
    return;
  }
  const summary = summarizeOrgs();
  downloadWorkbook('admin_org_summary.xlsx', 'Summary', summary.map((org) => ({
    organization: org.name,
    ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted,
    wellbeing_draft: org.draft,
    high_phq9_count: org.flagged,
    ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb,
    latest_ch1: org.latestCh1,
  })));
}

function exportRawTable() {
  downloadWorkbook('wellbeing_raw_data.xlsx', 'Raw', state.rawFiltered.map((row, index) => ({
    index: index + 1,
    organization: row.organization,
    gender: row.gender,
    age: row.age,
    age_group: ageGroup(row),
    phq9: getPhq9(row),
    gad7: getGad7(row),
    burnout: getBurnout(row),
    engagement: getEngagement(row),
    wlb: getWlb(row),
    sleep: getSleep(row),
    exercise: getExercise(row),
    chronic: getChronic(row),
    job_satisfaction: getJobSat(row),
    submitted_at: row.submitted_at,
  })));
}

function exportCh1All() {
  if (!state.ch1Rows.length) { showToast('ยังไม่มีข้อมูล Ch1 ในระบบ', 'warn'); return; }
  const stripHtml = (s) => {
    if (s == null) return '';
    return String(s).replace(/<[^>]*>/g, '').replace(/📎 ดูไฟล์/g, '').trim();
  };
  const rows = state.ch1Rows.map((row, i) => {
    const obj = { '#': i + 1 };
    CH1_COLUMNS.forEach((col) => {
      let val = col.get(row);
      val = stripHtml(val);
      if (val === '—') val = '';
      obj[col.label] = val;
    });
    return obj;
  });
  downloadWorkbook('ch1_all_data.xlsx', 'Ch1_Raw', rows);
}

function exportCh1Filtered(orgFilter) {
  const rows = orgFilter ? state.ch1Rows.filter((r) => getCh1Org(r) === orgFilter) : state.ch1Rows;
  if (!rows.length) { showToast('ไม่มีข้อมูลสำหรับองค์กรที่เลือก','warn'); return; }
  downloadWorkbook(`ch1_${orgFilter || 'all'}.xlsx`, 'Ch1', rows.map((row, i) => ({
    index: i + 1, organization: getCh1Org(row), submitted_at: getRowDate(row),
    total_personnel: row.total_personnel || row.total_staff || row.form_data?.total_personnel,
    engagement_score: row.engagement_score || row.form_data?.engagement_score,
  })));
}

function exportWbFiltered(orgFilter) {
  const rows = orgFilter ? state.surveyRows.filter((r) => r.organization === orgFilter && !r.is_draft) : state.surveyRows.filter((r) => !r.is_draft);
  if (!rows.length) { showToast('ไม่มีข้อมูล Wellbeing สำหรับองค์กรที่เลือก','warn'); return; }
  downloadWorkbook(`wellbeing_${orgFilter || 'all'}.xlsx`, 'Wellbeing', rows.map((row, i) => ({
    index: i + 1, organization: row.organization, submitted_at: row.submitted_at,
    gender: row.gender, age_group: ageGroup(row),
    phq9: getPhq9(row), gad7: getGad7(row), burnout: getBurnout(row),
    engagement: getEngagement(row), wlb_score: getWlb(row),
  })));
}

function exportCompareReport() {
  const summary = summarizeOrgs();
  downloadWorkbook('compare_report.xlsx', 'Compare', summary.map((org) => ({
    organization: org.name, ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted, wellbeing_draft: org.draft,
    high_phq9: org.flagged, ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb, latest_ch1: org.latestCh1,
  })));
}

function mdEscapeCell(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br/>')
    .replace(/\|/g, '\\|');
}

function mdTableFromObjects(rows, columns) {
  const header = `| ${columns.map((c) => c.label).join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => (
    `| ${columns.map((c) => mdEscapeCell(row?.[c.key])).join(' | ')} |`
  )).join('\n');
  return [header, sep, body].join('\n');
}

function downloadDocs(fileName, markdown) {
  // Convert markdown to HTML that Word can open with proper Thai support
  const htmlContent = markdownToHtml(markdown);
  const docFileName = fileName.replace(/\.md$/, '.doc').replace(/\.docx$/, '.doc').replace(/\.rtf$/, '.doc');
  
  // Create Word-compatible HTML with proper Thai encoding
  const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word">
  <meta name="Originator" content="Microsoft Word">
  <title>${escapeHtml(docFileName)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'TH Sarabun New', 'Sarabun', 'Cordia New', 'Angsana New', sans-serif;
      font-size: 16pt;
      line-height: 1.6;
      color: #1A2433;
    }
    h1 {
      font-size: 24pt;
      font-weight: bold;
      color: #0F4C81;
      margin-bottom: 12pt;
      margin-top: 0;
    }
    h2 {
      font-size: 20pt;
      font-weight: bold;
      color: #0F4C81;
      margin-top: 20pt;
      margin-bottom: 10pt;
      border-bottom: 2px solid #E8F1FB;
      padding-bottom: 6pt;
    }
    h3 {
      font-size: 18pt;
      font-weight: bold;
      color: #374151;
      margin-top: 16pt;
      margin-bottom: 8pt;
    }
    p {
      margin-bottom: 10pt;
      margin-top: 0;
    }
    ul, ol {
      margin-left: 30pt;
      margin-bottom: 10pt;
    }
    li {
      margin-bottom: 6pt;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
    }
    hr {
      border: none;
      border-top: 1px solid #D8DCE3;
      margin: 20pt 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16pt;
    }
    th, td {
      border: 1px solid #D8DCE3;
      padding: 8pt 12pt;
      text-align: left;
    }
    th {
      background-color: #F4F6F9;
      font-weight: bold;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  
  // Use BOM for UTF-8 encoding
  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = docFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function markdownToHtml(markdown) {
  let html = markdown;
  
  // Escape HTML special characters first
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
  
  // Headers (must be done before other replacements)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');
  
  // Lists - handle multi-line lists properly
  const lines = html.split('\n');
  const processed = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^- /)) {
      if (!inList) {
        processed.push('<ul>');
        inList = true;
      }
      processed.push('<li>' + line.substring(2) + '</li>');
    } else {
      if (inList) {
        processed.push('</ul>');
        inList = false;
      }
      processed.push(line);
    }
  }
  if (inList) processed.push('</ul>');
  
  html = processed.join('\n');
  
  // Tables
  const tableLines = [];
  let inTable = false;
  const finalLines = html.split('\n');
  const output = [];
  
  for (let i = 0; i < finalLines.length; i++) {
    const line = finalLines[i];
    
    if (line.match(/^\|.+\|$/)) {
      if (!inTable) {
        inTable = true;
        tableLines.length = 0;
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        output.push(convertTableToHtml(tableLines));
        tableLines.length = 0;
        inTable = false;
      }
      output.push(line);
    }
  }
  if (inTable) {
    output.push(convertTableToHtml(tableLines));
  }
  
  html = output.join('\n');
  
  // Paragraphs - wrap non-tagged content
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (!para) return '';
    if (para.match(/^<(h[123]|ul|ol|table|hr|p)/)) {
      return para;
    }
    // Split by newlines and wrap each in p tag
    return para.split('\n').filter(l => l.trim()).map(l => '<p>' + l + '</p>').join('\n');
  }).join('\n\n');
  
  return html;
}

function convertTableToHtml(lines) {
  if (lines.length === 0) return '';
  
  const rows = lines.map(line => {
    return line.split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim());
  });
  
  // Check if second row is separator
  const hasSeparator = rows.length > 1 && rows[1].every(cell => cell.match(/^-+$/));
  
  let html = '<table>\n';
  
  if (hasSeparator && rows.length > 0) {
    // First row is header
    html += '<thead>\n<tr>\n';
    rows[0].forEach(cell => {
      html += `<th>${cell}</th>\n`;
    });
    html += '</tr>\n</thead>\n';
    
    // Rest are body rows (skip separator)
    if (rows.length > 2) {
      html += '<tbody>\n';
      for (let i = 2; i < rows.length; i++) {
        html += '<tr>\n';
        rows[i].forEach(cell => {
          html += `<td>${cell}</td>\n`;
        });
        html += '</tr>\n';
      }
      html += '</tbody>\n';
    }
  } else {
    // All rows are body
    html += '<tbody>\n';
    rows.forEach(row => {
      html += '<tr>\n';
      row.forEach(cell => {
        html += `<td>${cell}</td>\n`;
      });
      html += '</tr>\n';
    });
    html += '</tbody>\n';
  }
  
  html += '</table>';
  return html;
}

function formatThaiLongDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'ยังไม่ได้ส่ง';
  const dd = String(date.getDate());
  const mm = date.getMonth();
  const yyyy = date.getFullYear() + 543;
  const monthNames = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  return `${dd} ${monthNames[mm] || ''} ${yyyy}`;
}

const CH1_ORG_DOC_META = [
  { num: '01', orgName: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', fileBase: '01-สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', pdfFile: '03-nesdc.pdf' },
  { num: '02', orgName: 'สำนักงานนโยบายและยุทธศาสตร์การค้า', fileBase: '02-สำนักงานนโยบายและยุทธศาสตร์การค้า', pdfFile: '01-tpso.pdf' },
  { num: '03', orgName: 'กรมวิทยาศาสตร์บริการ', fileBase: '03-กรมวิทยาศาสตร์บริการ', pdfFile: '12-dss.pdf' },
  { num: '04', orgName: 'กรมอุตุนิยมวิทยา', fileBase: '04-กรมอุตุนิยมวิทยา', pdfFile: '04-mots-ops.pdf' },
  { num: '05', orgName: 'กรมส่งเสริมวัฒนธรรม', fileBase: '05-กรมส่งเสริมวัฒนธรรม', pdfFile: '10-dcp.pdf' },
  { num: '06', orgName: 'กรมคุมประพฤติ', fileBase: '06-กรมคุมประพฤติ', pdfFile: '06-dmh.pdf' },
  { num: '07', orgName: 'กรมสนับสนุนบริการสุขภาพ', fileBase: '07-กรมสนับสนุนบริการสุขภาพ', pdfFile: '07-nrct.pdf' },
  { num: '08', orgName: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', fileBase: '08-สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', pdfFile: '04-mots-ops.pdf' },
  { num: '09', orgName: 'กรมสุขภาพจิต', fileBase: '09-กรมสุขภาพจิต', pdfFile: '06-dmh.pdf' },
  { num: '10', orgName: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', fileBase: '10-สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', pdfFile: '08-onep.pdf' },
  { num: '11', orgName: 'สำนักงานการวิจัยแห่งชาติ', fileBase: '11-สำนักงานการวิจัยแห่งชาติ', pdfFile: '07-nrct.pdf' },
  { num: '12', orgName: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', fileBase: '12-สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', pdfFile: '09-acfs.pdf' },
  { num: '13', orgName: 'สำนักงานคณะกรรมการพัฒนาระบบราชการ', fileBase: '13-สำนักงานคณะกรรมการพัฒนาระบบราชการ', pdfFile: null },
  { num: '14', orgName: 'กรมชลประทาน', fileBase: '14-กรมชลประทาน', pdfFile: null },
  { num: '15', orgName: 'กรมกิจการเด็กและเยาวชน', fileBase: '15-กรมกิจการเด็กและเยาวชน', pdfFile: null },
];

function getCh1OrgDocMeta(orgName) {
  return CH1_ORG_DOC_META.find((m) => m.orgName === orgName) || null;
}

function buildCh1OrgDocsMarkdown({ meta, submittedAt, count, isSubmitted, rowData }) {
  const orgName = meta.orgName;
  const num = meta.num;
  const dateText = isSubmitted ? formatThaiLongDate(submittedAt) : 'ยังไม่ได้ส่ง';
  const cntText = isSubmitted ? `${count} รายการ` : '0 รายการ';

  const blankPlaceholder = '-';

  // Helper to get value from row data
  const v = (key) => {
    if (!rowData) return blankPlaceholder;
    const fd = rowData.form_data || rowData;
    const val = fd[key] ?? rowData[key];
    return (val !== undefined && val !== null && val !== '') ? val : blankPlaceholder;
  };
  
  const n = (key) => {
    const val = v(key);
    if (val === blankPlaceholder) return blankPlaceholder;
    const num = parseFloat(val);
    return isNaN(num) ? blankPlaceholder : num.toLocaleString('th-TH');
  };

  if (!isSubmitted) {
    return [
      `# รายงาน CH1: ${orgName}`,
      '',
      '## 📊 ข้อมูลทั่วไป',
      '',
      `- **ชื่อองค์กร**: ${orgName}`,
      `- **เลขที่**: ${num}`,
      `- **วันที่ส่งข้อมูล**: ${dateText}`,
      `- **จำนวนรายการ**: ${cntText}`,
      '',
      '## 📋 สรุปข้อมูล CH1',
      '',
      '### ข้อมูลพื้นฐานองค์กร',
      `- ชื่อองค์กร: ${orgName}`,
      '- ประเภทหน่วยงาน: -',
      '- สังกัด: -',
      '',
      '### ข้อมูลบุคลากร',
      `- **จำนวนบุคลากรรวม**: ${blankPlaceholder}`,
      `- **โครงสร้างบุคลากร**: ${blankPlaceholder}`,
      `- **การกระจายอายุ**: ${blankPlaceholder}`,
      '',
      '### นโยบายและแผนงาน',
      `- **แผนยุทธศาสตร์**: ${blankPlaceholder}`,
      `- **เป้าหมายประจำปี**: ${blankPlaceholder}`,
      `- **KPIs**: ${blankPlaceholder}`,
      '',
      '### ข้อมูลสุขภาวะ',
      `- **โรค NCDs**: ${blankPlaceholder}`,
      `- **วันลาป่วย**: ${blankPlaceholder}`,
      `- **สุขภาพจิต**: ${blankPlaceholder}`,
      '',
      '### ระบบการจัดการ',
      `- **ระบบ HR**: ${blankPlaceholder}`,
      `- **การฝึกอบรม**: ${blankPlaceholder}`,
      `- **ดิจิทัล**: ${blankPlaceholder}`,
      '',
      '## 📎 ไฟล์ที่เกี่ยวข้อง',
      '',
      '- 📄 **PDF**: ยังไม่มี',
      '- 📝 **Word**: ยังไม่มี',
      '',
      '---',
      '',
      '## 📝 หมายเหตุ',
      '',
      '- องค์กรนี้ยังไม่ได้ส่งข้อมูล CH1',
      '- รอการส่งข้อมูลจากองค์กร',
      '',
      `*รายงานนี้สร้างเมื่อ ${new Date().toLocaleString('th-TH')}*`,
      '',
    ].join('\n');
  }

  // Extract real data from Supabase
  return [
    `# รายงาน CH1: ${orgName}`,
    '',
    '## 📊 ข้อมูลทั่วไป',
    '',
    `- **ชื่อองค์กร**: ${orgName}`,
    `- **เลขที่**: ${num}`,
    `- **วันที่ส่งข้อมูล**: ${dateText}`,
    `- **จำนวนรายการ**: ${cntText}`,
    '',
    '## 📋 สรุปข้อมูล CH1',
    '',
    '### ข้อมูลพื้นฐานองค์กร',
    `- **ชื่อองค์กร**: ${orgName}`,
    `- **นโยบายที่เกี่ยวข้อง**: ${v('related_policies')}`,
    `- **บริบทและความท้าทาย**: ${v('context_challenges')}`,
    '',
    '### ข้อมูลบุคลากร',
    `- **จำนวนบุคลากรรวม**: ${n('total_personnel')} คน`,
    `- **ข้าราชการ**: ${n('type_official')} คน`,
    `- **พนักงานราชการ**: ${n('type_employee')} คน`,
    `- **ลูกจ้าง/จ้างเหมา**: ${n('type_contract')} คน`,
    '',
    '#### การกระจายอายุ',
    `- อายุ ≤ 30 ปี: ${n('age_under30')} คน`,
    `- อายุ 31-40 ปี: ${n('age_31_40')} คน`,
    `- อายุ 41-50 ปี: ${n('age_41_50')} คน`,
    `- อายุ 51-60 ปี: ${n('age_51_60')} คน`,
    '',
    '#### อายุราชการ',
    `- น้อยกว่า 1 ปี: ${n('service_u1')} คน`,
    `- 1-5 ปี: ${n('service_1_5')} คน`,
    `- 6-10 ปี: ${n('service_6_10')} คน`,
    `- 11-15 ปี: ${n('service_11_15')} คน`,
    `- 16-20 ปี: ${n('service_16_20')} คน`,
    `- 21-25 ปี: ${n('service_21_25')} คน`,
    `- 26-30 ปี: ${n('service_26_30')} คน`,
    `- มากกว่า 30 ปี: ${n('service_over30')} คน`,
    '',
    '#### ระดับตำแหน่ง',
    `- ปฏิบัติงาน (O1): ${n('pos_o1')} คน`,
    `- ชำนาญงาน (O2): ${n('pos_o2')} คน`,
    `- อาวุโส (O3): ${n('pos_o3')} คน`,
    `- ทักษะพิเศษ (O4): ${n('pos_o4')} คน`,
    `- ปฏิบัติการ (K1): ${n('pos_k1')} คน`,
    `- ชำนาญการ (K2): ${n('pos_k2')} คน`,
    `- ชำนาญการพิเศษ (K3): ${n('pos_k3')} คน`,
    `- เชี่ยวชาญ (K4): ${n('pos_k4')} คน`,
    `- ทรงคุณวุฒิ (K5): ${n('pos_k5')} คน`,
    `- อำนวยการต้น (M1): ${n('pos_m1')} คน`,
    `- อำนวยการสูง (M2): ${n('pos_m2')} คน`,
    `- บริหารต้น (S1): ${n('pos_s1')} คน`,
    `- บริหารสูง (S2): ${n('pos_s2')} คน`,
    '',
    '#### อัตราการลาออก/โอนย้าย',
    `- **จำนวนลาออก**: ${n('turnover_count')} คน`,
    `- **อัตราการลาออก**: ${v('turnover_rate')}%`,
    `- **จำนวนโอนย้าย**: ${n('transfer_count')} คน`,
    '',
    '### ข้อมูลสุขภาวะ',
    '',
    '#### โรค NCDs',
    `- **โรคเบาหวาน**: ${n('ncd_diabetes')} คน`,
    `- **โรคความดันโลหิตสูง**: ${n('ncd_hypertension')} คน`,
    `- **โรคหัวใจและหลอดเลือด**: ${n('disease_cardiovascular')} คน`,
    `- **โรคไต**: ${n('disease_kidney')} คน`,
    `- **โรคตับ**: ${n('disease_liver')} คน`,
    `- **มะเร็ง**: ${n('disease_cancer')} คน`,
    `- **โรคอ้วน**: ${n('disease_obesity')} คน`,
    '',
    '#### สุขภาพจิตและการลา',
    `- **วันลาป่วยเฉลี่ย/คน/ปี**: ${v('sick_leave_days')} วัน`,
    `- **ภาวะเครียด**: ${v('mental_stress')}%`,
    `- **ภาวะวิตกกังวล**: ${v('mental_anxiety')}%`,
    `- **ปัญหาการนอนหลับ**: ${v('mental_sleep')}%`,
    `- **ภาวะซึมเศร้า**: ${v('mental_depression')}%`,
    `- **ภาวะหมดไฟ (Burnout)**: ${v('mental_burnout')}%`,
    '',
    '#### ข้อมูลคลินิก',
    `- **ผู้ใช้บริการคลินิก/ปี**: ${n('clinic_users_per_year')} คน`,
    `- **อาการที่พบบ่อย**: ${v('clinic_top_symptoms')}`,
    `- **ยาที่สั่งจ่ายบ่อย**: ${v('clinic_top_medications')}`,
    '',
    '### ระบบการจัดการและพัฒนาบุคลากร',
    '',
    '#### ระบบ Engagement',
    `- **Engagement Score (ปัจจุบัน)**: ${v('engagement_score')} / 100`,
    `- **Engagement ปี 2568**: ${v('engagement_score_2568')}`,
    `- **Engagement ปี 2567**: ${v('engagement_score_2567')}`,
    `- **Engagement ปี 2566**: ${v('engagement_score_2566')}`,
    `- **ด้านที่คะแนนต่ำ**: ${v('engagement_low_areas')}`,
    '',
    '#### ระบบพัฒนาบุคลากร',
    `- **ระบบพี่เลี้ยง (Mentoring)**: ${v('mentoring_system')}`,
    `- **หมุนเวียนงาน (Job Rotation)**: ${v('job_rotation')}`,
    `- **แผนพัฒนารายบุคคล (IDP)**: ${v('idp_system')}`,
    `- **เส้นทางความก้าวหน้า (Career Path)**: ${v('career_path_system')}`,
    `- **ชั่วโมงฝึกอบรมเฉลี่ย/คน/ปี**: ${v('training_hours')} ชั่วโมง`,
    `- **สภาพแวดล้อมการทำงาน (Ergonomics)**: ${v('ergonomics_status')}`,
    '',
    '### ทิศทางและเป้าหมายสุขภาวะ',
    `- **ประเด็นสุขภาวะสำคัญ**: ${v('strategic_priorities')}`,
    `- **อันดับ 1**: ${v('strategic_priority_rank1')}`,
    `- **อันดับ 2**: ${v('strategic_priority_rank2')}`,
    `- **อันดับ 3**: ${v('strategic_priority_rank3')}`,
    `- **Feedback ชุดมาตรการ**: ${v('intervention_packages_feedback')}`,
    `- **ผลลัพธ์แผน HRD ที่คาดหวัง**: ${v('hrd_plan_results')}`,
    '',
    '## 📎 ไฟล์ที่เกี่ยวข้อง',
    '',
    `- **ไฟล์แผนยุทธศาสตร์**: ${v('strategy_file_url') !== blankPlaceholder ? 'มีไฟล์แนบ' : 'ยังไม่มี'}`,
    `- **ไฟล์โครงสร้างองค์กร**: ${v('org_structure_file_url') !== blankPlaceholder ? 'มีไฟล์แนบ' : 'ยังไม่มี'}`,
    `- **ไฟล์แผน HRD**: ${v('hrd_plan_file_url') !== blankPlaceholder ? 'มีไฟล์แนบ' : 'ยังไม่มี'}`,
    '',
    '---',
    '',
    '## 📝 หมายเหตุ',
    '',
    '- ข้อมูลนี้ดึงจากฐานข้อมูล Supabase โดยตรง',
    '- สามารถตรวจสอบข้อมูลเพิ่มเติมได้ในระบบ Admin Portal',
    '',
    `*รายงานนี้สร้างเมื่อ ${new Date().toLocaleString('th-TH')}*`,
    '',
  ].join('\n');
}
    '- ข้อมูลนี้สร้างจาก PDF ต้นฉบับ อาจต้องการแก้ไขรูปแบบใน Word',
    '- สามารถตรวจสอบข้อมูลละเอียดจากไฟล์ PDF ได้',
    '',
    `*รายงานนี้สร้างเมื่อ ${new Date().toLocaleString('th-TH')}*`,
    '',
  ].join('\n');
}

function exportCh1FilteredDocs(orgFilter) {
  // orgFilter: ชื่อองค์กร (เหมือนในตาราง) หรือ '' = ทุกองค์กร
  if (!orgFilter) {
    const metas = CH1_ORG_DOC_META;
    showConfirm(
      `จะดาวน์โหลดไฟล์ Markdown ทั้งหมด ${metas.length} ไฟล์ (ตามรูปแบบ docs/ch1-org-reports)\n\nกด "ยืนยัน" เพื่อดาวน์โหลด`,
      () => {
        metas.forEach((meta) => {
          const rows = state.ch1Rows.filter((r) => getCh1Org(r) === meta.orgName);
          const isSubmitted = rows.length > 0;
          const submittedAt = rows[0] ? getRowDate(rows[0]) : null;
          const count = rows.length || 0;
          const rowData = rows[0] || null;
          const markdown = buildCh1OrgDocsMarkdown({
            meta,
            submittedAt,
            count,
            isSubmitted,
            rowData,
          });
          downloadDocs(`${meta.fileBase}.doc`, markdown);
        });
        showToast(`Export Docs (Ch1) สำเร็จ — ดาวน์โหลด ${metas.length} ไฟล์ ✅`, 'success');
      },
      () => showToast('ยกเลิกการ Export Docs', 'info')
    );
    return;
  }

  const meta = getCh1OrgDocMeta(orgFilter);
  if (!meta) { showToast('ไม่พบข้อมูลองค์กรใน mapping สำหรับ Docs', 'warn'); return; }

  const rows = state.ch1Rows.filter((r) => getCh1Org(r) === orgFilter);
  const isSubmitted = rows.length > 0;
  const submittedAt = rows[0] ? getRowDate(rows[0]) : null;
  const count = rows.length || 0;
  const rowData = rows[0] || null;

  const markdown = buildCh1OrgDocsMarkdown({ meta, submittedAt, count, isSubmitted, rowData });
  downloadDocs(`${meta.fileBase}.doc`, markdown);
  showToast(`Export Docs (Ch1) สำเร็จ: ${meta.fileBase}.doc ✅`, 'success');
}

function exportCh1RowDocs(idx) {
  const row = state.ch1Rows[idx];
  if (!row) { showToast('ไม่พบข้อมูล Ch1 ในตำแหน่งนี้', 'warn'); return; }
  const orgName = getCh1Org(row);
  exportCh1FilteredDocs(orgName);
}

function exportWbFilteredDocs(orgFilter) {
  const rows = orgFilter
    ? state.surveyRows.filter((r) => r.organization === orgFilter && !r.is_draft)
    : state.surveyRows.filter((r) => !r.is_draft);
  if (!rows.length) { showToast('ไม่มีข้อมูล Wellbeing สำหรับองค์กรที่เลือก','warn'); return; }

  const exportRows = rows.map((row, i) => ({
    index: i + 1,
    organization: row.organization,
    submitted_at: row.submitted_at,
    gender: row.gender,
    age_group: ageGroup(row),
    phq9: getPhq9(row),
    gad7: getGad7(row),
    burnout: getBurnout(row),
    engagement: getEngagement(row),
    wlb_score: getWlb(row),
  }));

  const orgLabel = orgFilter ? `องค์กร: ${orgFilter}` : 'ทุกองค์กร';
  const columns = [
    { key: 'index', label: '#' },
    { key: 'organization', label: 'องค์กร' },
    { key: 'submitted_at', label: 'วันที่ตอบ' },
    { key: 'gender', label: 'เพศ' },
    { key: 'age_group', label: 'กลุ่มอายุ' },
    { key: 'phq9', label: 'PHQ-9' },
    { key: 'gad7', label: 'GAD-7' },
    { key: 'burnout', label: 'Burnout' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'wlb_score', label: 'WLB Score' },
  ];

  const markdown = [
    `# Export Docs — รายงาน Wellbeing`,
    `Generated: ${new Date().toLocaleString('th-TH')}`,
    `Filter: ${orgLabel}`,
    '',
    mdTableFromObjects(exportRows, columns),
  ].join('\n');

  downloadDocs(`wellbeing_${orgFilter || 'all'}.doc`, markdown);
  showToast('Export Docs (Wellbeing) สำเร็จ ✅', 'success');
}

function exportCompareReportDocs() {
  const summary = summarizeOrgs();
  const exportRows = summary.map((org) => ({
    organization: org.name,
    ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted,
    wellbeing_draft: org.draft,
    high_phq9: org.flagged,
    ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb,
    latest_ch1: org.latestCh1,
  }));

  const columns = [
    { key: 'organization', label: 'องค์กร' },
    { key: 'ministry', label: 'กระทรวง/หน่วยงาน' },
    { key: 'wellbeing_submitted', label: 'Wellbeing ตอบแล้ว' },
    { key: 'wellbeing_draft', label: 'Wellbeing Draft' },
    { key: 'high_phq9', label: 'PHQ-9 สูง (≥15)' },
    { key: 'ch1_count', label: 'จำนวน Ch1' },
    { key: 'latest_wellbeing', label: 'อัปเดตล่าสุด Wellbeing' },
    { key: 'latest_ch1', label: 'อัปเดตล่าสุด Ch1' },
  ];

  const markdown = [
    `# Export Docs — รายงานเปรียบเทียบองค์กร`,
    `Generated: ${new Date().toLocaleString('th-TH')}`,
    '',
    mdTableFromObjects(exportRows, columns),
  ].join('\n');

  downloadDocs('compare_report.doc', markdown);
  showToast('Export Docs (Compare) สำเร็จ ✅', 'success');
}
