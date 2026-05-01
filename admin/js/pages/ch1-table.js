/**
 * ch1-table.js — CH1 Table rendering: raw sheet, pdf list, summary dashboard
 * Split from ch1.js (H6 fix). Depends on: config.js, utils.js, ch1-helpers.js
 * All function names preserved for admin.html global onclick compatibility (rule 9).
 */

// ─── renderCh1RawSheet ────────────────────────────────────────────────────────

const CH1_RAW_ORG_ORDER = [
  'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
  'สำนักงานนโยบายและยุทธศาสตร์การค้า',
  'กรมวิทยาศาสตร์บริการ',
  'กรมสนับสนุนบริการสุขภาพ',
  'กรมอุตุนิยมวิทยา',
  'กรมส่งเสริมวัฒนธรรม',
  'กรมคุมประพฤติ',
  'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
  'กรมสุขภาพจิต',
  'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
  'สำนักงานการวิจัยแห่งชาติ',
  'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ',
  'สำนักงานคณะกรรมการพัฒนาระบบราชการ',
  'กรมชลประทาน',
  'กรมกิจการเด็กและเยาวชน',
];

const CH1_RAW_ORG_ALIASES = {
  'สำนักงาน ก.พ.ร.': 'สำนักงานคณะกรรมการพัฒนาระบบราชการ',
  'สำนักงาน กพร.': 'สำนักงานคณะกรรมการพัฒนาระบบราชการ',
};

function normalizeOrgKey(name) {
  return String(name || '').toLowerCase().replace(/[\s.]/g, '').trim();
}

function canonicalizeCh1OrgName(name) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  if (CH1_RAW_ORG_ALIASES[raw]) return CH1_RAW_ORG_ALIASES[raw];

  const key = normalizeOrgKey(raw);
  const aliasHit = Object.keys(CH1_RAW_ORG_ALIASES).find((alias) => normalizeOrgKey(alias) === key);
  if (aliasHit) return CH1_RAW_ORG_ALIASES[aliasHit];

  const canonicalHit = CH1_RAW_ORG_ORDER.find((org) => normalizeOrgKey(org) === key);
  return canonicalHit || raw;
}

function buildCh1RawRows() {
  const latestByOrg = new Map();

  state.ch1Rows.forEach((row) => {
    const canonicalOrg = canonicalizeCh1OrgName(getCh1Org(row));
    if (!CH1_RAW_ORG_ORDER.includes(canonicalOrg)) return;

    const prev = latestByOrg.get(canonicalOrg);
    const rowDate = new Date(getRowDate(row) || 0).getTime();
    const prevDate = prev ? new Date(getRowDate(prev) || 0).getTime() : -1;
    if (!prev || rowDate >= prevDate) latestByOrg.set(canonicalOrg, row);
  });

  return CH1_RAW_ORG_ORDER.map((orgName) => ({ orgName, row: latestByOrg.get(orgName) || null }));
}

function renderCh1RawSheet() {
  const thead = document.getElementById('c1-sheet-thead');
  const tbody = document.getElementById('c1-sheet-tbody');
  if (!thead || !tbody) return;

  thead.innerHTML = '<th style="position:sticky;left:0;background:var(--bg);z-index:5;width:52px;min-width:52px;max-width:52px">#</th>' +
    CH1_COLUMNS.map((col, index) => `<th${index === 0 ? ' class="c1-col-org"' : ''}>${esc(col.label)}</th>`).join('');

  const rows = buildCh1RawRows();
  tbody.innerHTML = rows.map((entry, index) => {
    const cells = CH1_COLUMNS.map((col, colIndex) => {
      if (colIndex === 0) return `<td class="c1-col-org">${esc(entry.orgName)}</td>`;
      if (!entry.row) return '<td>Null</td>';
      return `<td>${col.get(entry.row)}</td>`;
    }).join('');

    return `<tr><td style="position:sticky;left:0;background:#F8FAFC;font-weight:600;z-index:3;border-right:1.5px solid var(--bdr);width:52px;min-width:52px;max-width:52px;text-align:center">${index + 1}</td>${cells}</tr>`;
  }).join('');

  enableCh1SheetHorizontalScroll();
}

function enableCh1SheetHorizontalScroll() {
  const wrap = document.querySelector('#c1-sheet .sheet-wrap');
  if (!wrap || wrap.dataset.hScrollReady === '1') return;
  wrap.dataset.hScrollReady = '1';

  wrap.addEventListener('wheel', (event) => {
    if (wrap.scrollWidth <= wrap.clientWidth) return;
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    wrap.scrollLeft += event.deltaY;
    event.preventDefault();
  }, { passive: false });

  let isDragging = false;
  let startX = 0;
  let startLeft = 0;

  wrap.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('a,button,input,select,textarea')) return;
    isDragging = true;
    wrap.classList.add('is-dragging');
    startX = event.clientX;
    startLeft = wrap.scrollLeft;
    event.preventDefault();
  });

  window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    wrap.scrollLeft = startLeft - (event.clientX - startX);
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('is-dragging');
  });
}

// ─── Helper function to sort organizations according to desired order ─────────────────
function sortOrganizations(orgList) {
  const desiredOrder = [
    'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
    'สำนักงานนโยบายและยุทธศาสตร์การค้า',
    'กรมวิทยาศาสตร์บริการ',
    'กรมสนับสนุนบริการสุขภาพ',
    'กรมอุตุนิยมวิทยา',
    'กรมส่งเสริมวัฒนธรรม',
    'กรมคุมประพฤติ',
    'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
    'กรมสุขภาพจิต',
    'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    'สำนักงานการวิจัยแห่งชาติ',
    'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ',
    'สำนักงานคณะกรรมการพัฒนาระบบราชการ',
    'กรมชลประทาน',
    'กรมกิจการเด็กและเยาวชน'
  ];

  return [...orgList].sort((a, b) => {
    const aName = a.display_name || a.org_name || a.org_code || a.name || '';
    const bName = b.display_name || b.org_name || b.org_code || b.name || '';

    const aIndex = desiredOrder.indexOf(aName);
    const bIndex = desiredOrder.indexOf(bName);

    // If both are in desired order, sort by index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only one is in desired order, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // If neither is in desired order, sort alphabetically
    return aName.localeCompare(bName, 'th');
  });
}

// ─── renderCh1Pdf ─────────────────────────────────────────────────────────────

function renderCh1Pdf() {
  const tbody = document.getElementById('c1-pdf-tbody');
  if (!tbody) return;
  const orgSel = document.getElementById('c1pdf-org');
  if (orgSel) {
    const orgs = [...new Set(state.ch1Rows.map((r) => getCh1Org(r)).filter(Boolean))];
    // Sort organizations using the helper function
    const sortedOrgs = sortOrganizations(orgs.map(o => ({ name: o }))).map(o => o.name);
    orgSel.innerHTML = '<option value="">ทุกองค์กร</option>' +
      sortedOrgs.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  }
  if (!state.ch1Rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล Ch1</td></tr>';
    return;
  }

  // Sort ch1Rows using the helper function — preserve original index to avoid indexOf bug on copies
  const sortedCh1Rows = sortOrganizations(state.ch1Rows.map((row, idx) => ({
    ...row,
    name: getCh1Org(row),
    _origIdx: idx
  })));

  tbody.innerHTML = sortedCh1Rows.map((row, i) => `<tr data-org="${esc(getCh1Org(row))}">
    <td style="text-align:center;font-weight:600;color:var(--tx3)">${i + 1}</td>
    <td>${esc(getCh1Org(row))}</td>
    <td>${fmtDate(getRowDate(row), true)}</td>
    <td class="td-act"><button class="btn b-gray" onclick="goCh1Preview(${row._origIdx})">📋 ดูรายละเอียด</button><button class="btn b-blue" onclick="showCh1PDF(${row._origIdx})">📄 PDF</button><button class="btn b-solid" onclick="exportCh1RowDocs(${row._origIdx})">📝 Docs</button></td>
  </tr>`).join('');
}

// ─── filterCh1Pdf ─────────────────────────────────────────────────────────────

function filterCh1Pdf() {
  const search = (document.getElementById('c1pdf-search')?.value || '').toLowerCase();
  const org = document.getElementById('c1pdf-org')?.value || '';
  document.querySelectorAll('#c1-pdf-tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const rowOrg = tr.dataset.org || '';
    tr.style.display = (!search || text.includes(search)) && (!org || rowOrg === org) ? '' : 'none';
  });
}

// ─── renderCh1Summary ─────────────────────────────────────────────────────────

function renderCh1Summary() {
  const page = document.getElementById('page-ch1-summary');
  if (!page) return;

  const orgList = document.getElementById('ch1-org-list');
  if (orgList && !orgList.hasChildNodes()) {
    const orgs = [...new Set(state.ch1Rows.map((row) => getCh1Org(row)).filter(Boolean))].sort();
    orgList.innerHTML = orgs.map(org => `<label class="org-check-item"><input type="checkbox" value="${esc(org)}" checked onchange="ch1OrgCheckOne()"> <span>${esc(org)}</span></label>`).join('');
  }

  const rows = ch1VisibleRows();
  const selectedOrgs = ch1GetSelectedOrgs();
  const orgsInScope = [...new Set(rows.map((row) => getCh1Org(row)).filter(Boolean))];
  const totalStaff = ch1Sum(rows, ['total_staff', 'total_personnel']);
  const totalNcd = ch1Sum(rows, 'ncd_count');
  const ncdRatio = ch1Pct(totalNcd, totalStaff);
  const sickLeave = ch1Sum(rows, 'sick_leave_days');
  const burnoutAvg = ch1Avg(rows, 'mental_burnout');
  const engAvg = ch1Avg(rows, 'engagement_score');

  const sub = document.getElementById('ch1-summary-sub');
  if (sub) {
    sub.textContent = !selectedOrgs
      ? `สรุปข้อมูลที่กรอกแล้วทั้งหมด ${fmtNum(orgsInScope.length)} องค์กร จาก ${fmtNum(state.ch1Rows.length)} รายการ`
      : selectedOrgs.length === 1
        ? `สรุปเฉพาะองค์กร: ${selectedOrgs[0]}`
        : `สรุป ${selectedOrgs.length} องค์กรที่เลือก จาก ${fmtNum(state.ch1Rows.length)} รายการ`;
  }

  const setEl = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setEl('ch1sum-kpi-orgs', !selectedOrgs ? fmtNum(orgsInScope.length) : selectedOrgs.length === 1 ? '1' : fmtNum(selectedOrgs.length));
  setEl('ch1sum-kpi-staff', totalStaff ? fmtNum(totalStaff) + ' คน' : '—');
  setEl('ch1sum-kpi-ncd', ncdRatio == null ? '—' : `${fmtNum(ncdRatio, 1)}%`);
  setEl('ch1sum-kpi-sick', sickLeave ? fmtNum(sickLeave) + ' วัน' : '—');
  setEl('ch1sum-kpi-burnout', burnoutAvg == null ? '—' : fmtNum(burnoutAvg, 1));
  setEl('ch1sum-kpi-eng', engAvg == null ? '—' : fmtNum(engAvg, 1));

  // ─── Personnel Type KPIs + Donut + Per-org bars ───────────────────────────
  const official = ch1Sum(rows, 'type_official');
  const employee = ch1Sum(rows, 'type_employee');
  const contract = ch1Sum(rows, 'type_contract');
  const other    = ch1Sum(rows, 'type_other');
  const typeTotal = official + employee + contract + other || 1;

  const setTypeKpi = (id, barId, subId, val) => {
    setEl(id, fmtNum(val) + ' คน');
    const pct = (val / typeTotal) * 100;
    setEl(subId, `${fmtNum(pct, 1)}% ของบุคลากรรวม`);
    const bar = document.getElementById(barId);
    if (bar) bar.style.width = `${Math.min(pct, 100).toFixed(1)}%`;
  };
  setTypeKpi('ch1sum-kpi-official', 'ch1sum-bar-official', 'ch1sum-kpi-official-sub', official);
  setTypeKpi('ch1sum-kpi-employee', 'ch1sum-bar-employee', 'ch1sum-kpi-employee-sub', employee);
  setTypeKpi('ch1sum-kpi-contract', 'ch1sum-bar-contract', 'ch1sum-kpi-contract-sub', contract);
  setTypeKpi('ch1sum-kpi-other',    'ch1sum-bar-other',    'ch1sum-kpi-other-sub',    other);

  // Donut SVG (circumference = 2π×44 ≈ 276.46)
  const CIRC = 2 * Math.PI * 44;
  const donutSegs = [
    { id: 'ch1sum-donut-official', val: official },
    { id: 'ch1sum-donut-employee', val: employee },
    { id: 'ch1sum-donut-contract', val: contract },
    { id: 'ch1sum-donut-other',    val: other    },
  ];
  let donutOffset = 0;
  donutSegs.forEach((seg) => {
    const el = document.getElementById(seg.id);
    if (!el) return;
    const dash = (seg.val / typeTotal) * CIRC;
    el.setAttribute('stroke-dasharray', `${dash.toFixed(2)} ${(CIRC - dash).toFixed(2)}`);
    el.setAttribute('stroke-dashoffset', (-donutOffset).toFixed(2));
    donutOffset += dash;
  });
  setEl('ch1sum-donut-center', fmtNum(official + employee + contract + other));
  setEl('ch1sum-type-total-badge', `รวม ${fmtNum(official + employee + contract + other)} คน`);

  // Legend values
  [
    ['ch1sum-leg-official', 'ch1sum-leg-official-pct', official],
    ['ch1sum-leg-employee', 'ch1sum-leg-employee-pct', employee],
    ['ch1sum-leg-contract', 'ch1sum-leg-contract-pct', contract],
    ['ch1sum-leg-other',    'ch1sum-leg-other-pct',    other],
  ].forEach(([vid, pid, val]) => {
    setEl(vid, fmtNum(val));
    setEl(pid, `${fmtNum((val / typeTotal) * 100, 1)}%`);
  });

  // Per-org official bar chart
  const orgBarsEl = document.getElementById('ch1sum-official-org-bars');
  if (orgBarsEl) {
    const orgOfficialData = orgsInScope.map((org) => {
      const orgRows = rows.filter((r) => getCh1Org(r) === org);
      return { label: org, value: ch1Sum(orgRows, 'type_official') };
    }).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
    if (orgOfficialData.length) {
      const maxVal = orgOfficialData[0].value || 1;
      orgBarsEl.innerHTML = orgOfficialData.map((d) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
          <div style="width:96px;flex-shrink:0;font-size:11.5px;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(d.label)}">${esc(d.label)}</div>
          <div style="flex:1;height:8px;background:var(--bg2);border-radius:99px;overflow:hidden">
            <div style="height:100%;border-radius:99px;background:var(--P);width:${((d.value / maxVal) * 100).toFixed(1)}%;transition:width .4s"></div>
          </div>
          <div style="width:52px;text-align:right;font-size:11.5px;font-weight:600;color:var(--tx2);flex-shrink:0">${fmtNum(d.value)}</div>
        </div>`).join('');
    } else {
      orgBarsEl.innerHTML = '<div style="color:var(--tx3);font-size:12px">ยังไม่มีข้อมูล type_official</div>';
    }
  }
  // ─── end Personnel Type ───────────────────────────────────────────────────

  renderCh1SummaryChart(document.getElementById('ch1sum-age-chart'), [
    { label: '≤30 ปี', value: ch1Sum(rows, ['age_u30', 'age_under30']) },
    { label: '31–40 ปี', value: ch1Sum(rows, 'age_31_40') },
    { label: '41–50 ปี', value: ch1Sum(rows, 'age_41_50') },
    { label: '51–60 ปี', value: ch1Sum(rows, 'age_51_60') },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderCh1SummaryChart(document.getElementById('ch1sum-service-chart'), [
    { label: '<1 ปี', value: ch1Sum(rows, 'service_u1') },
    { label: '1–5 ปี', value: ch1Sum(rows, 'service_1_5') },
    { label: '6–10 ปี', value: ch1Sum(rows, 'service_6_10') },
    { label: '11–15 ปี', value: ch1Sum(rows, 'service_11_15') },
    { label: '16–20 ปี', value: ch1Sum(rows, 'service_16_20') },
    { label: '21–25 ปี', value: ch1Sum(rows, 'service_21_25') },
    { label: '26–30 ปี', value: ch1Sum(rows, 'service_26_30') },
    { label: '>30 ปี', value: ch1Sum(rows, 'service_over30') },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderCh1SummaryChart(document.getElementById('ch1sum-position-chart'), [
    { label: 'O1', value: ch1Sum(rows, 'pos_o1') },
    { label: 'O2', value: ch1Sum(rows, 'pos_o2') },
    { label: 'O3', value: ch1Sum(rows, 'pos_o3') },
    { label: 'O4', value: ch1Sum(rows, 'pos_o4') },
    { label: 'K1', value: ch1Sum(rows, 'pos_k1') },
    { label: 'K2', value: ch1Sum(rows, 'pos_k2') },
    { label: 'K3', value: ch1Sum(rows, 'pos_k3') },
    { label: 'K4', value: ch1Sum(rows, 'pos_k4') },
    { label: 'K5', value: ch1Sum(rows, 'pos_k5') },
    { label: 'M1', value: ch1Sum(rows, 'pos_m1') },
    { label: 'M2', value: ch1Sum(rows, 'pos_m2') },
    { label: 'S1', value: ch1Sum(rows, 'pos_s1') },
    { label: 'S2', value: ch1Sum(rows, 'pos_s2') },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderTrendLine(document.getElementById('ch1sum-turnover-chart'), [
    { label: '2564', value: ch1AvgRate(rows, '2564') || 0 },
    { label: '2565', value: ch1AvgRate(rows, '2565') || 0 },
    { label: '2566', value: ch1AvgRate(rows, '2566') || 0 },
    { label: '2567', value: ch1AvgRate(rows, '2567') || 0 },
    { label: '2568', value: ch1AvgRate(rows, '2568') || 0 },
  ], { unit: '%' });

  const years = ['2564', '2565', '2566', '2567', '2568'];
  renderTrendLines(document.getElementById('ch1sum-headcount-trend-chart'), years, [
    { name: 'ต้นปี (คน)', color: '#0F4C81', values: years.map((y) => ch1Avg(rows, `begin_${y}`) || 0) },
    { name: 'ปลายปี (คน)', color: '#1E8E3E', values: years.map((y) => ch1Avg(rows, `end_${y}`) || 0) },
    { name: 'ลาออก/โอนย้าย (คน)', color: '#C2410C', values: years.map((y) => ch1Avg(rows, `leave_${y}`) || 0) },
  ]);

  renderTrendLines(document.getElementById('ch1sum-eng-trend-chart'), years, [
    { name: 'Engagement (คะแนน)', color: '#7C3AED', values: [
      ch1Avg(rows, 'engagement_score_2564') || 0,
      ch1Avg(rows, 'engagement_score_2565') || 0,
      ch1Avg(rows, 'engagement_score_2566') || 0,
      ch1Avg(rows, 'engagement_score_2567') || 0,
      ch1Avg(rows, 'engagement_score_2568') || 0,
    ] },
  ]);

  renderCh1SummaryChart(document.getElementById('ch1sum-ncd-chart'), [
    { label: 'เบาหวาน', value: ch1Sum(rows, 'disease_diabetes') },
    { label: 'ความดัน', value: ch1Sum(rows, 'disease_hypertension') },
    { label: 'หัวใจ/หลอดเลือด', value: ch1Sum(rows, 'disease_cardiovascular') },
    { label: 'ไต', value: ch1Sum(rows, 'disease_kidney') },
    { label: 'อ้วน/น้ำหนักเกิน', value: ch1Sum(rows, 'disease_obesity') },
    { label: 'NCD รวม', value: totalNcd },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderCh1SummaryChart(document.getElementById('ch1sum-mental-chart'), [
    { label: 'Burnout', value: burnoutAvg || 0 },
    { label: 'Engagement', value: engAvg || 0 },
    { label: 'ลาป่วยเฉลี่ย', value: ch1Avg(rows, 'sick_leave_avg') || 0 },
    { label: 'ผู้ใช้คลินิก', value: ch1Sum(rows, 'clinic_users_per_year') || 0 },
  ], (item) => `${fmtNum(item.value, 1)}`);

  // Top-3 Priority Rankings
  const priorityEl = document.getElementById('ch1sum-priority-ranking');
  if (priorityEl) {
    const priorityCounts = {};
    rows.forEach(row => {
      ['strategic_priority_rank1', 'strategic_priority_rank2', 'strategic_priority_rank3'].forEach((field, idx) => {
        const val = (ch1v(row, field) || '').toString().trim();
        if (val && val !== '—' && val !== '-') {
          if (!priorityCounts[val]) priorityCounts[val] = { topic: val, rank1: 0, rank2: 0, rank3: 0, total: 0, isNew: false };
          if (idx === 0) priorityCounts[val].rank1++;
          else if (idx === 1) priorityCounts[val].rank2++;
          else priorityCounts[val].rank3++;
          priorityCounts[val].total++;
        }
      });
      const other = (ch1v(row, 'strategic_priority_other') || '').toString().trim();
      if (other && other !== '—' && other !== '-') {
        if (!priorityCounts[other]) priorityCounts[other] = { topic: other, rank1: 0, rank2: 0, rank3: 0, total: 0, isNew: true };
        priorityCounts[other].total++;
        priorityCounts[other].isNew = true;
      }
    });
    const sorted = Object.values(priorityCounts).sort((a, b) => b.total - a.total || b.rank1 - a.rank1);
    if (sorted.length) {
      priorityEl.innerHTML = sorted.map((item, i) => `<tr>
        <td style="width:32px;text-align:center;color:var(--tx3);font-size:11px">${i + 1}</td>
        <td style="font-size:12px;color:var(--tx);font-weight:500;padding-left:8px">${esc(item.topic)}${item.isNew ? ' <span style="background:#FEF3C7;color:#92400E;padding:1px 6px;border-radius:99px;font-size:9.5px;font-weight:600">เสนอใหม่</span>' : ''}</td>
        <td style="width:56px;text-align:center;font-size:12px;font-weight:600;color:var(--P)">${item.rank1 || '—'}</td>
        <td style="width:56px;text-align:center;font-size:12px;color:var(--tx2)">${item.rank2 || '—'}</td>
        <td style="width:56px;text-align:center;font-size:12px;color:var(--tx3)">${item.rank3 || '—'}</td>
        <td style="width:50px;text-align:center;font-size:12.5px;font-weight:700;color:var(--tx)">${item.total}</td>
      </tr>`).join('');
    } else {
      priorityEl.innerHTML = '<tr><td colspan="6" class="summary-empty">ยังไม่มีข้อมูลจุดเน้น</td></tr>';
    }
  }

  const sectionsEl = document.getElementById('ch1-summary-sections');
  if (!sectionsEl) return;

  const questionSummaries = buildCh1QuestionSummaries(rows);
  const visibleSummaries = questionSummaries.filter((item) => !ch1IsEmptyQuestionSummary(item));
  const hiddenCount = questionSummaries.length - visibleSummaries.length;
  const summaryRows = visibleSummaries.map((item, index) => `<tr>
      <td style="width:52px;color:var(--tx3);font-size:11px">${index + 1}</td>
      <td class="summary-label" style="width:34%">${esc(item.question)}</td>
      <td>
        <div class="summary-value">${esc(item.value)}</div>
        <div class="summary-note">${esc(item.note)}</div>
      </td>
    </tr>`).join('');

  sectionsEl.innerHTML = `<div class="card summary-section-card" style="grid-column:1/-1">
    <div class="card-head"><h3>สรุปรายข้อคำถาม Ch1</h3><span class="section-badge">แสดง ${fmtNum(visibleSummaries.length)} / ${fmtNum(questionSummaries.length)} ข้อ</span></div>
    <div style="padding:0 14px 10px;color:var(--tx3);font-size:11.5px">ซ่อนข้อที่ยังไม่มีข้อมูลแล้ว ${fmtNum(hiddenCount)} ข้อ</div>
    <div class="card-body" style="max-height:640px;overflow:auto">
      <table class="summary-table"><tbody>${summaryRows || '<tr><td class="summary-empty" colspan="3">ยังไม่มีข้อมูล</td></tr>'}</tbody></table>
    </div>
  </div>`;
}

// ─── filterCh1Data ────────────────────────────────────────────────────────────

function filterCh1Data() {
  const search = (document.getElementById('c1data-search')?.value || '').toLowerCase();
  const org = document.getElementById('c1data-org')?.value || '';
  document.querySelectorAll('#c1-data tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const matchSearch = !search || text.includes(search);
    const matchOrg = !org || tr.cells[0]?.textContent?.trim() === org;
    tr.style.display = (matchSearch && matchOrg) ? '' : 'none';
  });
}

// ─── filterCh1Sheet ───────────────────────────────────────────────────────────

function filterCh1Sheet() {
  const search = (document.getElementById('c1sheet-search')?.value || '').toLowerCase();
  const org = document.getElementById('c1sheet-org')?.value || '';
  document.querySelectorAll('#c1-sheet tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const matchSearch = !search || text.includes(search);
    const matchOrg = !org || tr.cells[1]?.textContent?.trim() === org;
    tr.style.display = (matchSearch && matchOrg) ? '' : 'none';
  });
}
