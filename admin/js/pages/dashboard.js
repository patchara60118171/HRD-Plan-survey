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

  const top5 = summary.slice().sort((a, b) => b.ch1Count - a.ch1Count).slice(0, 5);
  const progBody = dashboard.querySelector('.card.card-mb .card-body');
  progBody.innerHTML = top5.map((org) => {
    const pct = org.ch1Count > 0 ? 100 : 0;
    const cls = pct === 100 ? 'bg' : pct > 0 ? 'bw' : 'br';
    const fillCls = pct === 100 ? '' : pct > 0 ? 'w' : 'r';
    const status = pct === 100 ? 'ส่งแล้ว' : pct > 0 ? 'กำลังกรอก' : 'ยังไม่เริ่ม';
    return `<div class="prog-item"><div class="prog-org">${esc(org.name)}</div><div class="prog-track"><div class="prog-fill ${fillCls}" style="width:${Math.max(pct, 2)}%"></div></div><div class="prog-pct ${fillCls}">${pct}%</div><div class="prog-status"><span class="badge ${cls}">${status}</span></div></div>`;
  }).join('');
}

// ─── Progress ────────────────────────────────────────────────────────────────

function renderProgress(summary) {
  const page = document.getElementById('page-progress');
  const orgCount = ORG_NAMES.length;
  const respondedCh1 = summary.filter((org) => org.ch1Count > 0).length;
  page.querySelector('.page-sub').textContent = `ติดตามความคืบหน้าทุกองค์กร · ส่งครบ ${respondedCh1}/${orgCount} (${fmtNum((respondedCh1 / Math.max(orgCount, 1)) * 100, 1)}%)`;
  page.querySelector('.info.yellow').textContent = `⚠️ มี ${orgCount - respondedCh1} องค์กรที่ยังไม่ส่ง Ch1 ครบ — หน้านี้ผูกกับข้อมูลจริงจาก hrd_ch1_responses แล้ว`;
  const tbody = page.querySelector('tbody');
  tbody.innerHTML = summary.map((org) => {
    const statusCls = org.ch1Count > 0 ? 'bg' : 'br';
    const status = org.ch1Count > 0 ? 'ส่งแล้ว' : 'ยังไม่เริ่ม';
    return `<tr>
      <td>${esc(org.name)}</td>
      <td>${esc(org.ministry)}</td>
      <td><span class="badge ${statusCls}">${status}</span></td>
      <td>${org.ch1Count > 0 ? '100%' : '0%'}</td>
      <td>${fmtNum(org.wellbeingSubmitted)}</td>
      <td>${fmtDate(org.latestCh1 || org.latestWb)}</td>
      <td class="td-act"><button class="btn b-blue" onclick="openOrgData('${esc(org.name)}')">ดูข้อมูล</button></td>
    </tr>`;
  }).join('');
}

function filterProgressTable() {
  const q = (document.getElementById('progress-search')?.value || '').toLowerCase();
  document.querySelectorAll('#page-progress tbody tr').forEach((tr) => {
    tr.style.display = q && !tr.textContent.toLowerCase().includes(q) ? 'none' : '';
  });
}

function openOrgData(orgName) {
  const idx = state.ch1Rows.findIndex((row) => getCh1Org(row) === orgName);
  if (idx < 0) {
    showToast('ยังไม่มีข้อมูล Ch1 สำหรับ ' + orgName, 'warn');
    return;
  }
  showCh1RowDetail(idx);
}
