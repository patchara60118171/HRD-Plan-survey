/**
 * dashboard.js — Page: Dashboard + Progress
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, ORG_LOOKUP), utils.js (esc, fmtDate, fmtNum)
 *
 * Functions:
 *   renderDashboard(summary)
 *   renderProgress(summary)
 *   openOrgData(orgName)
 */

// ─── Dashboard ──────────────────────────────────────────────────────────────

function renderDashboard(summary) {
  const dashboard = document.getElementById('page-dashboard');
  const orgCount = ORG_NAMES.length;
  const submittedWb = state.surveyRows.filter((row) => !row.is_draft);
  const respondedCh1 = summary.filter((org) => org.ch1Count > 0).length;
  const welcome = dashboard.querySelector('.welcome');
  welcome.querySelector('.w-title').textContent = `สวัสดีครับ, ${state.session?.user?.email || 'ผู้ดูแลระบบ'}`;
  welcome.querySelector('.w-sub').innerHTML = `โครงการสำรวจสุขภาวะบุคลากรภาครัฐ พ.ศ. 2566–2570 · อัปเดต ${fmtDate(new Date(), true)}`;
  const wVals = welcome.querySelectorAll('.w-val');
  wVals[0].textContent = orgCount;
  wVals[1].textContent = respondedCh1;
  wVals[2].textContent = fmtNum(submittedWb.length);

  const kpis = dashboard.querySelectorAll('.kpi');
  kpis[0].querySelector('.kpi-val').textContent = orgCount;
  kpis[0].querySelector('.kpi-sub').textContent = `${orgCount} หน่วยงานภาครัฐ`;
  kpis[1].querySelector('.kpi-val').textContent = respondedCh1;
  kpis[1].querySelector('.kpi-sub').textContent = `${fmtNum((respondedCh1 / Math.max(orgCount, 1)) * 100, 1)}% · ยังไม่ส่ง ${orgCount - respondedCh1} องค์กร`;
  kpis[2].querySelector('.kpi-val').textContent = fmtNum(submittedWb.length);
  kpis[2].querySelector('.kpi-sub').textContent = `Draft ${fmtNum(state.surveyRows.filter((row) => row.is_draft).length)} รายการ`;
  kpis[3].querySelector('.kpi-val').textContent = fmtNum(state.userRows.filter((row) => row.is_active !== false).length);
  kpis[3].querySelector('.kpi-sub').textContent = `${fmtNum(state.userRows.filter((row) => row.role === 'viewer').length)} Viewer · ${fmtNum(state.userRows.filter((row) => row.role !== 'viewer').length)} Admin`;

  const chartEl = document.getElementById('wb-daily-chart');
  const rangeLabel = document.getElementById('chart-range-label');
  const perDay = {};
  submittedWb.forEach((row) => {
    const key = String(getRowDate(row) || '').slice(0, 10);
    if (!key) return;
    perDay[key] = (perDay[key] || 0) + 1;
  });
  const dailyRows = Object.entries(perDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);

  if (!dailyRows.length) {
    chartEl.innerHTML = '<div class="cph-icon">📈</div><div>ยังไม่มีข้อมูล Wellbeing ที่ submit แล้ว</div>';
  } else {
    const maxCount = Math.max(...dailyRows.map(e => e[1]), 1);
    const totalPeriod = dailyRows.reduce((s, e) => s + e[1], 0);
    const avgPerDay = (totalPeriod / dailyRows.length).toFixed(1);
    const peakDay = dailyRows.reduce((a, b) => b[1] > a[1] ? b : a);
    if (rangeLabel) rangeLabel.textContent = `${fmtDate(dailyRows[0][0])} — ${fmtDate(dailyRows[dailyRows.length - 1][0])}`;

    const shortDate = (dateStr) => {
      const d = new Date(dateStr + 'T00:00:00');
      return `${d.getDate()}/${d.getMonth() + 1}`;
    };
    const thaiDay = (dateStr) => {
      const d = new Date(dateStr + 'T00:00:00');
      return ['อา','จ','อ','พ','พฤ','ศ','ส'][d.getDay()] || '';
    };

    // SVG area chart
    const W = 600, H = 110, PAD = { t: 12, r: 8, b: 4, l: 8 };
    const n = dailyRows.length;
    const xStep = (W - PAD.l - PAD.r) / Math.max(n - 1, 1);
    const yScale = (v) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxCount);

    const pts = dailyRows.map(([, c], i) => [PAD.l + i * xStep, yScale(c)]);
    const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPath = `M${pts[0][0]},${H - PAD.b} ` +
      pts.map(([x, y]) => `L${x},${y}`).join(' ') +
      ` L${pts[pts.length - 1][0]},${H - PAD.b} Z`;

    // Y-axis grid lines (3 lines)
    const gridLines = [0.25, 0.5, 0.75].map(f => {
      const yv = Math.round(maxCount * f);
      const y = yScale(yv);
      return `<line x1="${PAD.l}" y1="${y}" x2="${W - PAD.r}" y2="${y}" stroke="var(--bdr)" stroke-width="1" stroke-dasharray="3,3"/>
              <text x="${PAD.l}" y="${y - 3}" font-size="8" fill="var(--tx3)" text-anchor="start">${yv}</text>`;
    }).join('');

    // Hover dots (invisible, activated via JS)
    const hoverDots = pts.map(([x, y], i) =>
      `<circle class="area-dot" cx="${x}" cy="${y}" r="4" fill="var(--A)" stroke="#fff" stroke-width="2"
        style="opacity:0;transition:opacity .1s;cursor:pointer"
        data-idx="${i}" data-x="${x}" data-y="${y}"/>`
    ).join('');

    // Show only some x-labels to avoid crowding
    const showLabel = (i) => n <= 7 || i === 0 || i === n - 1 || i % Math.ceil(n / 5) === 0;
    const xLabels = dailyRows.map(([day], i) => showLabel(i)
      ? `<div class="area-x-label" style="flex:${i === 0 || i === n - 1 ? '0 0 auto' : '1'}"><b>${thaiDay(day)}</b>${shortDate(day)}</div>`
      : `<div class="area-x-label" style="flex:1"></div>`
    ).join('');

    chartEl.style.height = 'auto';
    chartEl.style.background = 'transparent';
    chartEl.innerHTML = `
      <div class="area-chart-wrap">
        <div class="area-stats">
          <div class="area-stat">
            <div class="area-stat-label"><span class="area-stat-dot" style="background:var(--A)"></span>ตอบช่วงนี้</div>
            <div class="area-stat-val">${fmtNum(totalPeriod)}</div>
            <div class="area-stat-sub">${dailyRows.length} วันล่าสุด</div>
          </div>
          <div class="area-stat">
            <div class="area-stat-label"><span class="area-stat-dot" style="background:var(--P)"></span>เฉลี่ย/วัน</div>
            <div class="area-stat-val">${avgPerDay}</div>
            <div class="area-stat-sub">คน/วัน</div>
          </div>
          <div class="area-stat">
            <div class="area-stat-label"><span class="area-stat-dot" style="background:#C08F2A"></span>สูงสุด</div>
            <div class="area-stat-val">${fmtNum(peakDay[1])}</div>
            <div class="area-stat-sub">${shortDate(peakDay[0])}</div>
          </div>
          <div class="area-stat">
            <div class="area-stat-label"><span class="area-stat-dot" style="background:var(--tx3)"></span>สะสมทั้งหมด</div>
            <div class="area-stat-val">${fmtNum(submittedWb.length)}</div>
            <div class="area-stat-sub">ทุกช่วงเวลา</div>
          </div>
        </div>
        <div class="area-svg-wrap" id="area-svg-wrap">
          <div class="area-tooltip" id="area-tooltip"></div>
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:120px">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00A86B" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#00A86B" stop-opacity="0.01"/>
              </linearGradient>
            </defs>
            ${gridLines}
            <path d="${areaPath}" fill="url(#areaGrad)"/>
            <polyline points="${polyline}" fill="none" stroke="#00A86B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
            ${hoverDots}
          </svg>
          <div class="area-x-labels">${xLabels}</div>
        </div>
      </div>`;

    // Attach hover interactions
    const wrap = chartEl.querySelector('#area-svg-wrap');
    const tooltip = chartEl.querySelector('#area-tooltip');
    chartEl.querySelectorAll('.area-dot').forEach((dot) => {
      const idx = parseInt(dot.dataset.idx);
      const [day, count] = dailyRows[idx];
      dot.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        tooltip.textContent = `${fmtDate(day)}: ${fmtNum(count)} คน`;
        const svgRect = wrap.querySelector('svg').getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();
        const x = dotRect.left + dotRect.width / 2 - wrapRect.left;
        const y = dotRect.top - wrapRect.top;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 34}px`;
        tooltip.style.opacity = '1';
      });
      dot.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        tooltip.style.opacity = '0';
      });
    });
  }

  const statusGrid = document.getElementById('ch1-status-grid');
  const statusLabel = document.getElementById('ch1-status-label');
  if (statusGrid) {
    const sent = summary.filter(o => o.ch1Count > 0).length;
    const total = summary.length;
    if (statusLabel) statusLabel.textContent = `${sent}/${total} ส่งแล้ว`;
    statusGrid.innerHTML = summary.map(org => {
      const done = org.ch1Count > 0;
      const shortName = org.name.replace(/^สำนักงาน/, 'สนง.').replace(/^กรม/, 'กรม');
      const tooltip = `${org.name}${done ? ` · ส่งแล้ว (${org.ch1Count} รายการ)` : ' · ยังไม่ส่ง'}`;
      return `<div class="ch1-org-dot" title="${esc(tooltip)}">
        <div class="ch1-dot-ind ${done ? 'done' : 'miss'}"></div>
        <div class="ch1-dot-name">${esc(shortName)}</div>
      </div>`;
    }).join('');
  }

  window._wbSummary = summary.slice();
  const sortByEl = document.getElementById('wb-sort-by');
  const sortDirEl = document.getElementById('wb-sort-dir');
  if (sortByEl && !sortByEl.dataset.initialized) {
    sortByEl.value = 'pct';
    sortByEl.dataset.initialized = 'true';
  }
  if (sortDirEl && !sortDirEl.dataset.initialized) {
    sortDirEl.value = 'desc';
    sortDirEl.dataset.initialized = 'true';
  }
  renderWbTable();
}

// ─── Progress ────────────────────────────────────────────────────────────────

function getProgressOrgSequence(orgName) {
  const seq = ORG_NAMES.indexOf(orgName);
  return seq >= 0 ? seq + 1 : null;
}

function renderProgress(summary) {
  const page = document.getElementById('page-progress');
  const orgCount = ORG_NAMES.length;
  const respondedCh1 = summary.filter((org) => org.ch1CompletionPct >= 60).length;
  page.querySelector('.page-sub').textContent = `ติดตามความคืบหน้าทุกองค์กร · ส่งครบ ${respondedCh1}/${orgCount} (${fmtNum((respondedCh1 / Math.max(orgCount, 1)) * 100, 1)}%)`;
  page.querySelector('.info.yellow').textContent = `⚠️ มี ${orgCount - respondedCh1} องค์กรที่ยังไม่ส่ง Ch1 ครบ — หน้านี้ผูกกับข้อมูลจริงจาก hrd_ch1_responses แล้ว`;
  const tbody = page.querySelector('tbody');
  tbody.innerHTML = summary.map((org, index) => {
    const statusCls = org.ch1Count === 0 ? 'br' : (org.ch1CompletionPct >= 60 ? 'bg' : 'bw');
    const status = org.ch1Count === 0 ? 'ยังไม่ได้ส่ง' : (org.ch1CompletionPct >= 60 ? 'ส่งแล้ว' : 'ยังไม่เรียบร้อย');
    const wbCount = org.wellbeingSubmitted || 0;
    const official = org.typeOfficial;
    const wbCell = official != null
      ? `${fmtNum(wbCount)}/${fmtNum(official)}`
      : fmtNum(wbCount) || '—';
    const pct = official > 0
      ? `${fmtNum(Math.round((wbCount / official) * 100), 0)}%`
      : wbCount > 0 ? '—' : '0%';
    const safeOrgName = JSON.stringify(org.name);
    const sequence = getProgressOrgSequence(org.name);
    return `<tr>
      <td>${sequence ?? '—'}</td>
      <td>${esc(org.name)}</td>
      <td><button class="badge ${statusCls}" type="button" style="border:none;cursor:pointer" onclick='showCh1StatusPopup(${safeOrgName})'>${status}</button></td>
      <td>${wbCell}</td>
      <td>${pct}</td>
      <td>${fmtDate(org.latestWb)}</td>
      <td class="td-act"><button class="btn b-blue" onclick='openOrgData(${safeOrgName})'>ดูข้อมูล</button></td>
    </tr>`;
  }).join('');
}

function getLatestCh1RowForOrg(orgName) {
  let latestRow = null;
  let latestDate = null;
  state.ch1Rows.forEach((row) => {
    const rowOrgName = getCh1Org(row);
    const rowCode = String(row.org_code || row.form_data?.org_code || '').toLowerCase();
    const orgCode = String(ORG_LOOKUP.get(orgName)?.code || '').toLowerCase();
    const isMatch = rowOrgName === orgName || (orgCode && rowCode === orgCode);
    if (!isMatch) return;
    const rowDate = getRowDate(row);
    if (!latestRow) {
      latestRow = row;
      latestDate = rowDate ? new Date(rowDate) : null;
      return;
    }
    if (!rowDate) return;
    const nextDate = new Date(rowDate);
    if (!latestDate || nextDate > latestDate) {
      latestRow = row;
      latestDate = nextDate;
    }
  });
  return latestRow;
}

function getCh1FieldAudit(row) {
  const source = row?.form_data && typeof row.form_data === 'object' ? row.form_data : row;
  if (!source || typeof source !== 'object') return { filled: [], missing: [] };

  const ignoredKeys = new Set([
    'id', 'created_at', 'updated_at', 'submitted_at', 'timestamp', 'org_code', 'organization', 'org_name', 'agency_name', 'status', 'user_id', 'email',
    'respondent_email', 'form_version', 'ncd_ratio_pct', 'sick_leave_avg',
    'turnover_rate_2564', 'turnover_rate_2565', 'turnover_rate_2566', 'turnover_rate_2567', 'turnover_rate_2568',
    'google_sync_status', 'google_sync_attempts', 'google_synced_at', 'google_sheet_row_id', 'google_sync_error',
    'attachment_urls', 'attachments', 'files', 'file_urls'
  ]);
  const fieldLabels = {
    respondent_email: 'อีเมลผู้กรอก',
    form_version: 'เวอร์ชันแบบฟอร์ม',
    strategic_overview: '1. ภาพรวมยุทธศาสตร์และทิศทางของส่วนราชการ',
    org_structure: '2. โครงสร้างองค์กรและบทบาทหน้าที่หลัก',
    total_staff: '3. ข้อมูลโครงสร้างอัตรากำลัง - จำนวนข้าราชการรวม',
    type_official: '3. จำนวนอัตรากำลังจำแนกตามประเภท - ข้าราชการ',
    type_employee: '3. จำนวนอัตรากำลังจำแนกตามประเภท - พนักงานราชการ',
    type_contract: '3. จำนวนอัตรากำลังจำแนกตามประเภท - ลูกจ้าง',
    type_other: '3. จำนวนอัตรากำลังจำแนกตามประเภท - อื่น ๆ',
    age_u30: '3. จำแนกตามช่วงอายุ - ไม่เกิน 30 ปี',
    age_31_40: '3. จำแนกตามช่วงอายุ - 31–40 ปี',
    age_41_50: '3. จำแนกตามช่วงอายุ - 41–50 ปี',
    age_51_60: '3. จำแนกตามช่วงอายุ - 51–60 ปี',
    begin_2564: '4. ข้อมูลบุคลากรรายปี 2564 - ต้นปี',
    begin_2565: '4. ข้อมูลบุคลากรรายปี 2565 - ต้นปี',
    begin_2566: '4. ข้อมูลบุคลากรรายปี 2566 - ต้นปี',
    begin_2567: '4. ข้อมูลบุคลากรรายปี 2567 - ต้นปี',
    begin_2568: '4. ข้อมูลบุคลากรรายปี 2568 - ต้นปี',
    in_2564: '4. ข้อมูลบุคลากรรายปี 2564 - รับเข้า',
    in_2565: '4. ข้อมูลบุคลากรรายปี 2565 - รับเข้า',
    in_2566: '4. ข้อมูลบุคลากรรายปี 2566 - รับเข้า',
    in_2567: '4. ข้อมูลบุคลากรรายปี 2567 - รับเข้า',
    in_2568: '4. ข้อมูลบุคลากรรายปี 2568 - รับเข้า',
    out_2564: '4. ข้อมูลบุคลากรรายปี 2564 - ออก',
    out_2565: '4. ข้อมูลบุคลากรรายปี 2565 - ออก',
    out_2566: '4. ข้อมูลบุคลากรรายปี 2566 - ออก',
    out_2567: '4. ข้อมูลบุคลากรรายปี 2567 - ออก',
    out_2568: '4. ข้อมูลบุคลากรรายปี 2568 - ออก',
    end_2564: '4. ข้อมูลบุคลากรรายปี 2564 - ปลายปี',
    end_2565: '4. ข้อมูลบุคลากรรายปี 2565 - ปลายปี',
    end_2566: '4. ข้อมูลบุคลากรรายปี 2566 - ปลายปี',
    end_2567: '4. ข้อมูลบุคลากรรายปี 2567 - ปลายปี',
    end_2568: '4. ข้อมูลบุคลากรรายปี 2568 - ปลายปี',
    leave_count_2564: '4. ข้อมูลบุคลากรรายปี 2564 - จำนวนลาออก',
    leave_count_2565: '4. ข้อมูลบุคลากรรายปี 2565 - จำนวนลาออก',
    leave_count_2566: '4. ข้อมูลบุคลากรรายปี 2566 - จำนวนลาออก',
    leave_count_2567: '4. ข้อมูลบุคลากรรายปี 2567 - จำนวนลาออก',
    leave_count_2568: '4. ข้อมูลบุคลากรรายปี 2568 - จำนวนลาออก',
    turnover_rate_2564: '4. ข้อมูลบุคลากรรายปี 2564 - อัตราการลาออก (%)',
    turnover_rate_2565: '4. ข้อมูลบุคลากรรายปี 2565 - อัตราการลาออก (%)',
    turnover_rate_2566: '4. ข้อมูลบุคลากรรายปี 2566 - อัตราการลาออก (%)',
    turnover_rate_2567: '4. ข้อมูลบุคลากรรายปี 2567 - อัตราการลาออก (%)',
    turnover_rate_2568: '4. ข้อมูลบุคลากรรายปี 2568 - อัตราการลาออก (%)',
    related_policies: '5. นโยบาย/มาตรการ/โครงการที่เกี่ยวข้อง',
    context_challenges: '6. บริบท ปัญหา และความท้าทายขององค์กร',
    ncd_count: '7. จำนวนบุคลากรโรค NCD รวม',
    ncd_ratio_pct: '7. ร้อยละของบุคลากรโรค NCD',
    disease_diabetes: '7. กลุ่มโรค NCD - เบาหวาน',
    disease_hypertension: '7. กลุ่มโรค NCD - ความดันโลหิตสูง',
    disease_cardiovascular: '7. กลุ่มโรค NCD - โรคหัวใจและหลอดเลือด',
    disease_kidney: '7. กลุ่มโรค NCD - โรคไต',
    disease_liver: '7. กลุ่มโรค NCD - โรคตับ',
    disease_cancer: '7. กลุ่มโรค NCD - มะเร็ง',
    disease_obesity: '7. กลุ่มโรค NCD - ภาวะอ้วน',
    disease_other_count: '7. กลุ่มโรค NCD - อื่น ๆ (จำนวน)',
    disease_other_detail: '7. กลุ่มโรค NCD - อื่น ๆ (ระบุ)',
    sick_leave_days: '8. วันลาป่วยรวมต่อปี',
    sick_leave_avg: '8. วันลาป่วยเฉลี่ยต่อคน',
    clinic_users_per_year: '9. จำนวนผู้ใช้บริการห้องพยาบาล/ปี',
    clinic_top_symptoms: '9. อาการเจ็บป่วยที่พบบ่อย',
    clinic_top_medications: '9. ยาที่ใช้บ่อย',
    mental_stress: '10. สถานการณ์ความเครียด/สุขภาพจิต',
    suicide_risk: '10. สถานการณ์ความเสี่ยงฆ่าตัวตาย',
    engagement_score_2568: '11. Engagement Score ปี 2568',
    engagement_score_2567: '11. Engagement Score ปี 2567',
    engagement_score_2566: '11. Engagement Score ปี 2566',
    engagement_score_2565: '11. Engagement Score ปี 2565',
    engagement_score_2564: '11. Engagement Score ปี 2564',
    burnout_score_2568: '12. Burnout Score ปี 2568',
    burnout_score_2567: '12. Burnout Score ปี 2567',
    burnout_score_2566: '12. Burnout Score ปี 2566',
    burnout_score_2565: '12. Burnout Score ปี 2565',
    burnout_score_2564: '12. Burnout Score ปี 2564',
    work_life_balance: '13. สถานการณ์ Work-Life Balance',
    welfare_support: '14. สวัสดิการ/การสนับสนุนที่มีอยู่',
    hrd_needs: '15. ความต้องการด้าน HRD/Wellbeing',
    strategic_priority_rank1: '16. ประเด็นสำคัญอันดับ 1',
    strategic_priority_rank2: '16. ประเด็นสำคัญอันดับ 2',
    strategic_priority_rank3: '16. ประเด็นสำคัญอันดับ 3'
  };
  const formatLabel = (key) => fieldLabels[key] || key.replace(/_/g, ' ');

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'ยังไม่ได้กรอกข้อมูล';
    if (value && typeof value === 'object') {
      const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
      return entries.length ? entries.map(([k, v]) => `${k}: ${v}`).join(' | ') : 'ยังไม่ได้กรอกข้อมูล';
    }
    if (value === null || value === undefined) return 'ยังไม่ได้กรอกข้อมูล';
    const text = String(value).trim();
    return text || 'ยังไม่ได้กรอกข้อมูล';
  };

  const isFilled = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0 && Object.values(value).some((item) => item !== null && item !== undefined && String(item).trim() !== '');
    return value !== null && value !== undefined && String(value).trim() !== '';
  };

  const entries = Object.entries(source)
    .filter(([key]) => !ignoredKeys.has(key))
    .map(([key, value]) => ({ key, label: formatLabel(key), value, filled: isFilled(value), displayValue: formatValue(value) }));

  return {
    filled: entries.filter((item) => item.filled),
    missing: entries.filter((item) => !item.filled),
  };
}

function closeCh1StatusPopup() {
  const el = document.getElementById('ch1-status-popup-overlay');
  if (el) el.remove();
}

function showCh1StatusPopup(orgName) {
  closeCh1StatusPopup();

  const orgSummary = summarizeOrgs().find((org) => org.name === orgName);
  const latestRow = getLatestCh1RowForOrg(orgName);
  const overlay = document.createElement('div');
  overlay.id = 'ch1-status-popup-overlay';
  overlay.className = 'umodal-overlay';

  if (!latestRow) {
    overlay.innerHTML = `
      <div class="umodal" style="max-width:760px">
        <div class="umodal-head">
          <h3>สถานะ Ch1: ${esc(orgName)}</h3>
          <button class="btn b-gray" style="padding:5px 10px;min-width:32px" onclick="closeCh1StatusPopup()">✕</button>
        </div>
        <div class="umodal-body">
          <div style="font-size:13px;color:var(--tx2);margin-bottom:10px">ยังไม่พบข้อมูลในตาราง hrd_ch1_responses สำหรับองค์กรนี้</div>
          <div class="info yellow">แนะนำให้ติดตามให้องค์กรเริ่มกรอกแบบสำรวจข้อมูลองค์กร</div>
        </div>
        <div class="umodal-foot">
          <button class="btn b-gray" onclick="closeCh1StatusPopup()">ปิด</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCh1StatusPopup(); });
    return;
  }

  const audit = getCh1FieldAudit(latestRow);
  const completionPct = orgSummary?.ch1CompletionPct || 0;
  const filledCount = orgSummary?.ch1FilledFields || audit.filled.length;
  const totalCount = orgSummary?.ch1TotalFields || (audit.filled.length + audit.missing.length);
  const status = latestRow ? (completionPct >= 60 ? 'ส่งแล้ว' : 'ยังไม่เรียบร้อย') : 'ยังไม่ได้ส่ง';
  const submittedAt = getRowDate(latestRow);
  const safeOrgName = JSON.stringify(orgName);

  overlay.innerHTML = `
    <div class="umodal" style="max-width:960px">
      <div class="umodal-head">
        <h3>สถานะ Ch1: ${esc(orgName)}</h3>
        <button class="btn b-gray" style="padding:5px 10px;min-width:32px" onclick="closeCh1StatusPopup()">✕</button>
      </div>
      <div class="umodal-body">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <span class="badge ${completionPct >= 60 ? 'bg' : 'bw'}">${status}</span>
          <span class="badge">กรอกแล้ว ${fmtNum(filledCount)}/${fmtNum(totalCount)} ฟิลด์</span>
          <span class="badge">ความครบถ้วน ${fmtNum(completionPct, 1)}%</span>
          <span class="badge">อัปเดตล่าสุด ${fmtDate(submittedAt, true)}</span>
        </div>
        <div class="info blue" style="margin-bottom:12px">ข้อมูลนี้ดึงจาก hrd_ch1_responses แถวล่าสุดขององค์กร เพื่อดูว่าฟิลด์ใดกรอกแล้ว และฟิลด์ใดยังไม่ได้กรอกข้อมูล</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start">
          <div style="border:1px solid var(--bdr);border-radius:12px;padding:12px;background:#fff">
            <div style="font-size:13px;font-weight:700;color:var(--A);margin-bottom:8px">กรอกแล้ว (${fmtNum(audit.filled.length)})</div>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:420px;overflow:auto">
              ${audit.filled.length ? audit.filled.map((item) => `<div style="border:1px solid #DDE7F2;border-radius:10px;padding:10px"><div style="font-size:12px;font-weight:600;color:var(--tx2);margin-bottom:4px">${esc(item.label)}</div><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${esc(item.key)}</div><div style="font-size:12px;color:var(--tx1);word-break:break-word">${esc(item.displayValue)}</div></div>`).join('') : '<div style="font-size:12px;color:var(--tx3)">ยังไม่มีข้อมูลที่กรอก</div>'}
            </div>
          </div>
          <div style="border:1px solid var(--bdr);border-radius:12px;padding:12px;background:#fff">
            <div style="font-size:13px;font-weight:700;color:var(--D);margin-bottom:8px">ยังไม่ได้กรอกข้อมูล (${fmtNum(audit.missing.length)})</div>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:420px;overflow:auto">
              ${audit.missing.length ? audit.missing.map((item) => `<div style="border:1px solid #F1D7D7;border-radius:10px;padding:10px"><div style="font-size:12px;font-weight:600;color:var(--tx2);margin-bottom:4px">${esc(item.label)}</div><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${esc(item.key)}</div><div style="font-size:12px;color:var(--D)">ยังไม่ได้กรอกข้อมูล</div></div>`).join('') : '<div style="font-size:12px;color:var(--tx3)">ไม่มีฟิลด์ที่ขาด</div>'}
            </div>
          </div>
        </div>
      </div>
      <div class="umodal-foot">
        <button class="btn b-gray" onclick="closeCh1StatusPopup()">ปิด</button>
        <button class="btn b-blue" onclick='openOrgData(${safeOrgName})'>ไปหน้า ch1-preview</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCh1StatusPopup(); });
}

function exportProgressTable() {
  const summary = summarizeOrgs();
  const rows = summary.map((org) => {
    const wbCount = org.wellbeingSubmitted || 0;
    const official = org.typeOfficial;
    const progressPct = official > 0 ? Math.round((wbCount / official) * 100) : 0;
    const status = org.ch1Count === 0 ? 'ยังไม่ได้ส่ง' : (org.ch1CompletionPct >= 60 ? 'ส่งแล้ว' : 'ยังไม่เรียบร้อย');
    return {
      organization: org.name,
      ch1_status: status,
      ch1_completion_pct: Number((org.ch1CompletionPct || 0).toFixed(1)),
      ch1_filled_fields: org.ch1FilledFields || 0,
      ch1_total_fields: org.ch1TotalFields || 0,
      wellbeing_responded: wbCount,
      officials_total: official ?? '',
      wellbeing_ratio: official != null ? `${wbCount}/${official}` : `${wbCount}`,
      wellbeing_progress_pct: official > 0 ? progressPct : '',
      latest_submitted_at: org.latestWb || '',
    };
  });
  downloadWorkbook(`organization_status_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Org_Status', rows);
  showToast('ดาวน์โหลด Excel สถานะองค์กรสำเร็จ ✅', 'success');
}

function filterProgressTable() {
  const q = (document.getElementById('prog-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('prog-status-filter')?.value || '';
  document.querySelectorAll('#page-progress tbody tr').forEach((tr) => {
    const matchesText = !q || tr.textContent.toLowerCase().includes(q);
    const statusText = tr.children[2]?.textContent?.trim() || '';
    const matchesStatus = !statusFilter || statusText === statusFilter;
    tr.style.display = matchesText && matchesStatus ? '' : 'none';
  });
}

let progressSortState = { key: 'seq', dir: 'asc' };

function sortProgressTable(key) {
  if (progressSortState.key === key) {
    progressSortState.dir = progressSortState.dir === 'asc' ? 'desc' : 'asc';
  } else {
    progressSortState = { key, dir: key === 'date' ? 'desc' : 'asc' };
  }

  // Update sort icons
  document.querySelectorAll('#page-progress .sort-icon').forEach(icon => {
    icon.textContent = '⇅';
  });
  
  const currentIcon = document.querySelector(`#prog-th-${key} .sort-icon`);
  if (currentIcon) {
    currentIcon.textContent = progressSortState.dir === 'asc' ? '↑' : '↓';
  }

  const summary = summarizeOrgs().slice();
  const getStatusRank = (org) => {
    if (org.ch1Count === 0) return 0;
    if (org.ch1CompletionPct >= 60) return 2;
    return 1;
  };
  const getPct = (org) => {
    const wbCount = org.wellbeingSubmitted || 0;
    const official = org.typeOfficial;
    return official > 0 ? (wbCount / official) * 100 : 0;
  };
  const getDateTs = (org) => {
    const value = org.latestWb;
    return value ? new Date(value).getTime() : 0;
  };

  summary.sort((a, b) => {
    let diff = 0;
    if (key === 'seq') diff = (getProgressOrgSequence(a.name) || Number.MAX_SAFE_INTEGER) - (getProgressOrgSequence(b.name) || Number.MAX_SAFE_INTEGER);
    else if (key === 'org') diff = String(a.name || '').localeCompare(String(b.name || ''), 'th');
    else if (key === 'status') diff = getStatusRank(a) - getStatusRank(b);
    else if (key === 'count') diff = (a.wellbeingSubmitted || 0) - (b.wellbeingSubmitted || 0);
    else if (key === 'pct') diff = getPct(a) - getPct(b);
    else if (key === 'date') diff = getDateTs(a) - getDateTs(b);
    else diff = String(a.name || '').localeCompare(String(b.name || ''), 'th');
    return progressSortState.dir === 'asc' ? diff : -diff;
  });

  renderProgress(summary);
  filterProgressTable();
}

function openOrgData(orgName) {
  const row = getLatestCh1RowForOrg(orgName);
  if (!row) {
    showToast('ยังไม่มีข้อมูล Ch1 สำหรับ ' + orgName, 'warn');
    return;
  }
  const orgCode = String(row.org_code || row.form_data?.org_code || ORG_LOOKUP.get(orgName)?.code || '').trim().toLowerCase();
  const qs = new URLSearchParams({ org: orgCode, id: String(row.id || '') });
  const win = window.open(`ch1-preview?${qs.toString()}`, '_blank');
  if (!win) showToast('กรุณาอนุญาต Popup เพื่อเปิดหน้าดูข้อมูล', 'warn');
}

// ─── Download Card as Image ─────────────────────────────────────────────────

async function downloadCard(selector, filename) {
  if (typeof html2canvas === 'undefined') {
    showToast('html2canvas ยังไม่โหลด กรุณารอสักครู่', 'warn');
    return;
  }
  const el = document.querySelector(selector);
  if (!el) return;

  // Show loading state
  const dlBtns = el.querySelectorAll('.card-dl-btn');
  dlBtns.forEach(b => { b.dataset.prevDisplay = b.style.display; b.style.display = 'none'; });

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#F4F6F9',
      logging: false,
      foreignObjectRendering: false,
    });

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `${filename}_${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('ดาวน์โหลดรูปภาพสำเร็จ ✓', 'ok');
  } catch (err) {
    console.error('downloadCard error:', err);
    showToast('เกิดข้อผิดพลาดในการดาวน์โหลด', 'warn');
  } finally {
    dlBtns.forEach(b => { b.style.display = b.dataset.prevDisplay || ''; });
  }
}


// ─── Send Reminder (moved from admin.html inline script) ────────────────────
function sendReminderAll() {
  const summary = summarizeOrgs();
  const pending = summary.filter((org) => org.ch1Count === 0);
  if (!pending.length) { showToast('ทุกองค์กรส่ง Ch1 ครบแล้ว ไม่จำเป็นต้องส่ง Reminder','info'); return; }
  showConfirm(
    `จะส่ง Reminder ไปยัง ${pending.length} องค์กรที่ยังไม่ส่ง Ch1\n\n${pending.slice(0,8).map((o) => '• ' + o.name).join('\n')}${pending.length > 8 ? `\n...และอีก ${pending.length - 8} องค์กร` : ''}`,
    () => {
      const msg = document.getElementById('notif-msg');
      if (msg) { msg.style.color = 'var(--A)'; msg.textContent = `✅ ส่ง Reminder ไปยัง ${pending.length} องค์กรเรียบร้อย (Simulation)`; }
      showToast(`ส่ง Reminder ไปยัง ${pending.length} องค์กรเรียบร้อย (ต้องต่อ Email Service จริง)`,'success',5000);
    }
  );
}
