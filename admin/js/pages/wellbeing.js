/**
 * wellbeing.js — Page: Well-being Survey Data + Analytics
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES), utils.js (esc, fmtDate, fmtNum, getPhq9, getBurnout, getRowDate)
 *             export.js (downloadWorkbook)
 *
 * Functions:
 *   renderWellbeingControl(summary)
 *   renderWellbeingOrg(summary)
 *   renderWellbeingRaw()         → TODO: move full impl from admin.html ~line 1936
 *   renderRawTable()             → TODO: move full impl from admin.html ~line 2009
 *   exportRawTable()             → TODO: move full impl from admin.html ~line 2056
 *   filterRawData()              (inline filter helper)
 *   openWbRaw(orgName)
 *   showWbRowPDF(idx)            → TODO: move full impl from admin.html ~line 5036
 *   exportWbFiltered(orgFilter)  → TODO: move from export.js integration
 */

// ─── Wellbeing Control Panel ─────────────────────────────────────────────────

function renderWellbeingControl(summary) {
  const ctrl = document.getElementById('wb-ctrl');
  const submitted = state.surveyRows.filter((row) => !row.is_draft);
  const drafts = state.surveyRows.filter((row) => row.is_draft);
  const values = ctrl.querySelectorAll('.st-val');
  values[0].textContent = fmtNum(submitted.length);
  const phqHighCount = submitted.filter((r) => (getPhq9(r) || 0) >= 10).length;
  values[1].textContent = fmtNum(phqHighCount) + ' คน (' + (submitted.length ? fmtNum((phqHighCount / submitted.length) * 100, 1) : '0') + '%)';
  values[2].textContent = fmtNum(submitted.length ? submitted.reduce((s, r) => s + (getBurnout(r) || 0), 0) / submitted.length : 0, 1);

  const summaryLines = ctrl.querySelectorAll('.set-row b');
  summaryLines[0].textContent = `${fmtNum(submitted.length)} คน`;
  summaryLines[1].textContent = `${fmtNum(drafts.length)} คน`;
  summaryLines[2].textContent = `${fmtNum(summary.filter((org) => org.wellbeingSubmitted === 0).length)} องค์กร`;
  summaryLines[3].textContent = fmtDate(submitted[0] ? getRowDate(submitted[0]) : null, true);
  const avgPhq = submitted.length
    ? submitted.reduce((sum, row) => sum + (getPhq9(row) || 0), 0) / submitted.length
    : 0;
  summaryLines[4].textContent = `PHQ-9 เฉลี่ย ${fmtNum(avgPhq, 1)}`;

  const actions = ctrl.querySelectorAll('.fc-actions .btn');
  if (actions[1]) {
    actions[1].textContent = '🔗 เปิดฟอร์ม';
    actions[1].onclick = () => { window.open('index.html', '_blank'); };
  }
  if (actions[2]) {
    actions[2].textContent = '🗂️ Raw Data ครบทุกข้อ';
    actions[2].onclick = () => { window.location.href = 'admin-wb-rawdata.html'; };
  }
}

// ─── Wellbeing By Org ─────────────────────────────────────────────────────────

function renderWellbeingOrg(summary) {
  const section = document.getElementById('wb-org');
  section.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>👥 สถิติรายองค์กร</h3>
        <div class="filter-bar">
          <select class="sel" id="wb-org-filter"><option value="">ทุกสถานะ</option><option value="active">มีข้อมูล</option><option value="empty">ยังไม่มีข้อมูล</option></select>
          <button class="btn b-gray" id="wb-org-export">📤 Export</button>
        </div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>องค์กร</th><th>ตอบแล้ว</th><th>Draft</th><th>% สัดส่วนผู้ตอบ</th><th>PHQ-9 สูง</th><th>อัปเดตล่าสุด</th><th>จัดการ</th></tr></thead>
          <tbody id="wb-org-tbody"></tbody>
        </table>
      </div>
    </div>`;

  const totalSubmitted = Math.max(state.surveyRows.filter((row) => !row.is_draft).length, 1);
  const renderBody = () => {
    const filter = document.getElementById('wb-org-filter').value;
    const rows = summary.filter((org) => {
      if (filter === 'active') return org.wellbeingSubmitted > 0;
      if (filter === 'empty') return org.wellbeingSubmitted === 0;
      return true;
    });
    document.getElementById('wb-org-tbody').innerHTML = rows.map((org) => `<tr>
      <td>${esc(org.name)}</td>
      <td>${fmtNum(org.wellbeingSubmitted)}</td>
      <td>${fmtNum(org.draft)}</td>
      <td><span class="badge ${org.wellbeingSubmitted > 0 ? 'bg' : 'br'}">${fmtNum((org.wellbeingSubmitted / totalSubmitted) * 100, 1)}%</span></td>
      <td>${org.flagged ? `<span style="color:#991B1B;font-weight:700">⚠️ ${fmtNum(org.flagged)}</span>` : '—'}</td>
      <td>${fmtDate(org.latestWb)}</td>
      <td class="td-act"><button class="btn b-blue" onclick="openWbRaw('${esc(org.name)}')">ดูรายคน</button></td>
    </tr>`).join('');
  };

  document.getElementById('wb-org-filter').onchange = renderBody;
  document.getElementById('wb-org-export').onclick = () => downloadWorkbook('wellbeing_org_stats.xlsx', 'Wellbeing_By_Org', summary.map((org) => ({
    organization: org.name,
    submitted: org.wellbeingSubmitted,
    draft: org.draft,
    response_share_pct: Number(((org.wellbeingSubmitted / totalSubmitted) * 100).toFixed(1)),
    high_phq9_count: org.flagged,
    latest_submitted_at: org.latestWb,
  })));
  renderBody();
}

function openWbRaw(orgName) {
  if (typeof go === 'function') go('wellbeing-raw');
  setTimeout(() => {
    const orgFilter = document.getElementById('raw-org-filter');
    if (orgFilter) { orgFilter.value = orgName; filterRawData(); }
  }, 100);
}

// ─── Wellbeing Raw Data Page ──────────────────────────────────────────────────

function renderWellbeingRaw() {
  const section = document.getElementById('wb-sheet');
  section.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>🗂️ ข้อมูลรายคน — Wellbeing Survey</h3>
        <div class="filter-bar">
          <input class="si" id="wb-search" placeholder="🔍 ค้นหาองค์กร/อีเมล/ปัญหา...">
          <select class="sel" id="wb-org-select"><option value="">ทุกองค์กร</option>${ORG_NAMES.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select>
          <select class="sel" id="wb-gender-select"><option value="">ทุกเพศ</option><option value="ชาย">ชาย</option><option value="หญิง">หญิง</option><option value="ไม่ระบุ">ไม่ระบุ</option></select>
          <select class="sel" id="wb-age-select"><option value="">ทุกกลุ่มอายุ</option><option value="≤30 ปี">≤30 ปี</option><option value="31–40 ปี">31–40 ปี</option><option value="41–50 ปี">41–50 ปี</option><option value="51+ ปี">51+ ปี</option></select>
          <button class="btn b-gray" id="wb-raw-export">📤 Export .xlsx</button>
          <button class="btn b-blue" id="wb-full-raw">เปิด Raw ครบทุกข้อ</button>
        </div>
      </div>
      <div id="wb-raw-meta" style="padding:8px 18px;background:var(--bg);border-bottom:1px solid var(--bdr);font-size:11.5px;color:var(--tx2)"></div>
      <div class="sheet-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>องค์กร</th><th>วันที่ตอบ</th><th>เพศ</th><th>กลุ่มอายุ</th><th>ประเภทตำแหน่ง</th><th>ระดับ</th><th>อายุราชการ</th><th>PHQ-9</th><th>GAD-7</th><th>Burnout</th><th>Engagement</th><th>WLB Score</th><th>นอนหลับ</th><th>ออกกำลังกาย</th><th>โรคเรื้อรัง</th><th>BMI</th><th>ความพึงพอใจงาน</th><th>ปัญหาสำคัญสุด</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody id="wb-raw-tbody"></tbody>
        </table>
      </div>
      <div style="padding:10px 18px;border-top:1px solid var(--bdr);display:flex;align-items:center;gap:10px;background:var(--bg)">
        <div style="font-size:11.5px;color:var(--tx2)" id="wb-page-info"></div>
        <div style="flex:1"></div>
        <button class="btn b-gray" style="padding:5px 10px" id="wb-prev">← ก่อนหน้า</button>
        <button class="btn b-gray" style="padding:5px 10px" id="wb-next">ถัดไป →</button>
        <select class="sel" style="font-size:11.5px" id="wb-size"><option value="50">50 แถว/หน้า</option><option value="100">100 แถว/หน้า</option><option value="99999">ทั้งหมด</option></select>
      </div>
    </div>
    <div class="info yellow" style="margin-top:10px" id="wb-flag-note">กำลังประมวลผลคะแนน PHQ-9...</div>`;

  document.getElementById('wb-search').oninput = applyRawFilters;
  document.getElementById('wb-org-select').onchange = applyRawFilters;
  document.getElementById('wb-gender-select').onchange = applyRawFilters;
  document.getElementById('wb-age-select').onchange = applyRawFilters;
  document.getElementById('wb-size').onchange = () => {
    state.rawPageSize = Number(document.getElementById('wb-size').value);
    state.rawPage = 1;
    renderRawTable();
  };
  document.getElementById('wb-prev').onclick = () => { state.rawPage -= 1; renderRawTable(); };
  document.getElementById('wb-next').onclick = () => { state.rawPage += 1; renderRawTable(); };
  document.getElementById('wb-raw-export').onclick = exportRawTable;
  document.getElementById('wb-full-raw').onclick = () => { window.location.href = 'admin-wb-rawdata.html'; };

  applyRawFilters();
}

// ─── Raw Data Filters ────────────────────────────────────────────────────────

function applyRawFilters() {
  const search = (document.getElementById('wb-search')?.value || '').toLowerCase();
  const org = document.getElementById('wb-org-select')?.value || '';
  const gender = document.getElementById('wb-gender-select')?.value || '';
  const age = document.getElementById('wb-age-select')?.value || '';

  state.rawFiltered = state.surveyRows.filter((row) => {
    if (org && row.organization !== org) return false;
    if (gender && row.gender !== gender) return false;
    if (age && ageGroup(row) !== age) return false;
    if (search) {
      const hay = [row.organization, row.email, row.name, getMainProblem(row), getChronic(row)].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  state.rawPage = 1;
  renderRawTable();
}

function filterRawData() { applyRawFilters(); }

// ─── Raw Data Table (paginated) ──────────────────────────────────────────────

function renderRawTable() {
  const total = state.rawFiltered.length;
  const pageSize = state.rawPageSize;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (state.rawPage < 1) state.rawPage = 1;
  if (state.rawPage > pageCount) state.rawPage = pageCount;

  const start = (state.rawPage - 1) * pageSize;
  const rows = state.rawFiltered.slice(start, start + pageSize);
  document.getElementById('wb-raw-meta').textContent = `แสดง ${fmtNum(total)} รายการ · เชื่อมต่อจาก survey_responses จริง`;
  document.getElementById('wb-page-info').textContent = `แสดง ${total ? start + 1 : 0}–${Math.min(start + pageSize, total)} จาก ${fmtNum(total)} รายการ`;
  document.getElementById('wb-prev').disabled = state.rawPage === 1;
  document.getElementById('wb-next').disabled = state.rawPage === pageCount;

  document.getElementById('wb-raw-tbody').innerHTML = rows.map((row, index) => {
    const phq = getPhq9(row);
    const flagged = (phq || 0) >= 15;
    return `<tr${flagged ? ' style="background:#FFF7F7"' : ''}>
      <td>${start + index + 1}</td>
      <td>${esc(row.organization)}</td>
      <td>${fmtDate(row.submitted_at, true)}</td>
      <td>${esc(row.gender)}</td>
      <td>${esc(ageGroup(row))}</td>
      <td>${esc(row.org_type)}</td>
      <td>${esc(row.job)}</td>
      <td>${esc(row.job_duration)}</td>
      <td>${flagged ? `<b style="color:#991B1B">${fmtNum(phq)}</b>` : fmtNum(phq)}</td>
      <td>${fmtNum(getGad7(row))}</td>
      <td>${fmtNum(getBurnout(row), 1)}</td>
      <td>${fmtNum(getEngagement(row), 1)}</td>
      <td>${fmtNum(getWlb(row), 1)}</td>
      <td>${esc(getSleep(row))}</td>
      <td>${esc(getExercise(row))}</td>
      <td>${esc(getChronic(row))}</td>
      <td>${row.bmi != null ? fmtNum(row.bmi, 1) + ' (' + esc(row.bmi_category) + ')' : '—'}</td>
      <td>${esc(getJobSat(row))}</td>
      <td>${esc(getMainProblem(row))}</td>
      <td class="td-act"><button class="btn b-gray" style="padding:3px 8px;font-size:11px" onclick="showWbRowPDF(${start+index})">📄 PDF</button></td>
    </tr>`;
  }).join('');

  const flaggedCount = state.rawFiltered.filter((row) => (getPhq9(row) || 0) >= 15).length;
  document.getElementById('wb-flag-note').textContent = flaggedCount
    ? `⚠️ พบผู้ตอบที่มี PHQ-9 ≥ 15 จำนวน ${fmtNum(flaggedCount)} คนในผลลัพธ์ปัจจุบัน แถวสีแดงควรติดตามดูแลเพิ่มเติม`
    : 'ไม่พบผู้ตอบที่มี PHQ-9 สูงมากในผลลัพธ์ปัจจุบัน';
}

// ─── Export Raw Table ────────────────────────────────────────────────────────

function exportRawTable() {
  downloadWorkbook('wellbeing_raw_data.xlsx', 'Raw', state.rawFiltered.map((row, index) => ({
    index: index + 1,
    organization: row.organization,
    submitted_at: row.submitted_at,
    gender: row.gender,
    age_group: ageGroup(row),
    position_type: row.org_type,
    level: row.job,
    service_years: row.job_duration,
    phq9: getPhq9(row),
    gad7: getGad7(row),
    burnout: getBurnout(row),
    engagement: getEngagement(row),
    wlb_score: getWlb(row),
    sleep: getSleep(row),
    exercise: getExercise(row),
    chronic: getChronic(row),
    bmi: row.bmi,
    bmi_category: row.bmi_category,
    job_satisfaction: getJobSat(row),
    main_problem: getMainProblem(row),
  })));
}

// ─── Show Individual Wellbeing PDF ───────────────────────────────────────────

function showWbRowPDF(idx) {
  const row = state.rawFiltered[idx];
  if (!row) { showToast('ไม่พบข้อมูลในตำแหน่งนี้', 'warn'); return; }
  const phq = getPhq9(row);
  const gad = getGad7(row);
  const burnout = getBurnout(row);
  const engagement = getEngagement(row);
  const wlb = getWlb(row);
  const flagged = (phq || 0) >= 15;
  const pdfHtml = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<title>Wellbeing Report — ${row.organization || 'ไม่ระบุ'}</title>
<style>
  body{font-family:'Sarabun',sans-serif;margin:32px;color:#1A2433;font-size:13px;line-height:1.7}
  h1{font-size:18px;color:#0F4C81;margin-bottom:4px}
  h2{font-size:14px;color:#0F4C81;margin:18px 0 6px;border-bottom:2px solid #E8F1FB;padding-bottom:4px}
  .meta{font-size:12px;color:#6B7280;margin-bottom:20px}
  .alert{background:#FEE2E2;border:1px solid #FCA5A5;border-radius:6px;padding:10px 14px;margin-bottom:14px;font-weight:600;color:#991B1B}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
  .kpi{background:#F4F6F9;border:1px solid #D8DCE3;border-radius:8px;padding:10px 14px;text-align:center}
  .kpi-val{font-size:22px;font-weight:700;color:#0F4C81}
  .kpi-val.red{color:#991B1B}
  .kpi-label{font-size:11px;color:#6B7280;margin-top:3px}
  table{width:100%;border-collapse:collapse;margin-bottom:12px}
  th,td{padding:7px 10px;border:1px solid #D8DCE3;text-align:left;font-size:12.5px}
  th{background:#F4F6F9;font-weight:600;color:#374151;width:45%}
  .footer{margin-top:30px;font-size:11px;color:#9CA3AF;border-top:1px solid #E5E7EB;padding-top:10px}
  @media print{body{margin:16px}}
</style>
</head><body>
<h1>💚 รายงาน Wellbeing Survey — รายบุคคล</h1>
<div class="meta">องค์กร: <b>${esc(row.organization || '—')}</b> &nbsp;|&nbsp; วันที่ตอบ: <b>${fmtDate(row.submitted_at, true)}</b></div>
${flagged ? '<div class="alert">⚠️ คะแนน PHQ-9 ≥ 15 บุคคลนี้ควรได้รับการดูแลสุขภาพจิตเพิ่มเติม</div>' : ''}
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val ${flagged?'red':''}">${fmtNum(phq)}</div><div class="kpi-label">PHQ-9 (ภาวะซึมเศร้า)</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(gad)}</div><div class="kpi-label">GAD-7 (ความวิตกกังวล)</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(burnout,1)}</div><div class="kpi-label">Burnout Score</div></div>
</div>
<h2>ข้อมูลส่วนตัว</h2>
<table>
  <tr><th>เพศ</th><td>${esc(row.gender || '—')}</td></tr>
  <tr><th>กลุ่มอายุ</th><td>${esc(ageGroup(row))}</td></tr>
  <tr><th>ประเภทตำแหน่ง</th><td>${esc(row.org_type || '—')}</td></tr>
  <tr><th>ระดับ</th><td>${esc(row.job || '—')}</td></tr>
  <tr><th>อายุราชการ</th><td>${esc(row.job_duration || '—')}</td></tr>
</table>
<h2>ตัวชี้วัดสุขภาวะ</h2>
<table>
  <tr><th>PHQ-9 (ภาวะซึมเศร้า)</th><td><b>${fmtNum(phq)}</b> ${(phq||0) >= 15 ? '⚠️ ระดับรุนแรง' : (phq||0) >= 10 ? '⚠️ ระดับปานกลาง' : '✓ ปกติ'}</td></tr>
  <tr><th>GAD-7 (ความวิตกกังวล)</th><td>${fmtNum(gad)}</td></tr>
  <tr><th>Burnout Score</th><td>${fmtNum(burnout, 1)}</td></tr>
  <tr><th>Engagement Score</th><td>${fmtNum(engagement, 1)}</td></tr>
  <tr><th>Work-Life Balance</th><td>${fmtNum(wlb, 1)}</td></tr>
</table>
<h2>พฤติกรรมสุขภาพ</h2>
<table>
  <tr><th>การนอนหลับ</th><td>${esc(getSleep(row))}</td></tr>
  <tr><th>การออกกำลังกาย</th><td>${esc(getExercise(row))}</td></tr>
  <tr><th>โรคเรื้อรัง</th><td>${esc(getChronic(row))}</td></tr>
  <tr><th>BMI</th><td>${row.bmi != null ? fmtNum(row.bmi, 1) + ' (' + esc(row.bmi_category) + ')' : '—'}</td></tr>
  <tr><th>ความพึงพอใจในงาน</th><td>${esc(getJobSat(row))}</td></tr>
  <tr><th>ปัญหาสำคัญที่สุด</th><td>${esc(getMainProblem(row))}</td></tr>
</table>
<div class="footer">พิมพ์เมื่อ: ${new Date().toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})} &nbsp;|&nbsp; ระบบ Admin Portal Well-being Survey | ข้อมูลนี้เป็นความลับ</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
  const w = window.open('', '_blank', 'width=900,height=700');
  if (w) { w.document.write(pdfHtml); w.document.close(); }
  else showToast('กรุณาอนุญาต Popup เพื่อดู PDF', 'warn');
}

// ─── Export Filtered Wellbeing ───────────────────────────────────────────────

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
