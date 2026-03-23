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
  welcome.querySelector('.w-sub').textContent = `อัปเดต ${fmtDate(new Date(), true)}`;
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

    // Build cumulative
    let cum = 0;
    const cumArr = dailyRows.map(([, c]) => { cum += c; return cum; });
    const cumMax = cumArr[cumArr.length - 1] || 1;

    // Bar colors — gradient feel via hsl
    const barColor = (count) => {
      const intensity = 0.3 + 0.7 * (count / maxCount);
      return `rgba(0,168,107,${intensity.toFixed(2)})`;
    };

    const thaiDay = (dateStr) => {
      const d = new Date(dateStr);
      const days = ['อา','จ','อ','พ','พฤ','ศ','ส'];
      return days[d.getDay()] || '';
    };
    const shortDate = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    chartEl.innerHTML = `<div class="daily-chart-wrap">
      <div class="daily-chart-summary">
        <div class="dcs-item"><div class="dcs-dot" style="background:#00A86B"></div><div><div class="dcs-val">${fmtNum(totalPeriod)}</div><div>ตอบช่วงนี้</div></div></div>
        <div class="dcs-item"><div class="dcs-dot" style="background:#0F4C81"></div><div><div class="dcs-val">${avgPerDay}</div><div>เฉลี่ย/วัน</div></div></div>
        <div class="dcs-item"><div class="dcs-dot" style="background:#C08F2A"></div><div><div class="dcs-val">${fmtNum(peakDay[1])}</div><div>สูงสุด (${shortDate(peakDay[0])})</div></div></div>
        <div class="dcs-item"><div class="dcs-dot" style="background:#8896A5"></div><div><div class="dcs-val">${fmtNum(submittedWb.length)}</div><div>สะสมทั้งหมด</div></div></div>
      </div>
      <div class="daily-bars">
        ${dailyRows.map(([day, count], i) => {
          const pct = Math.max(3, (count / maxCount) * 100);
          const cumPct = (cumArr[i] / cumMax) * 100;
          const isToday = day === new Date().toISOString().slice(0, 10);
          const borderStyle = isToday ? 'box-shadow:0 0 0 2px #0F4C81,0 0 0 4px rgba(15,76,129,.15);' : '';
          return `<div class="daily-bar-col">
            <div class="daily-bar-val">${fmtNum(count)}</div>
            <div class="daily-bar-inner" style="height:${pct}%;background:${barColor(count)};${borderStyle}" title="${fmtDate(day)}: ${fmtNum(count)} คน">
              <div class="daily-cum-line" style="top:${Math.max(0, 100 - cumPct)}%"></div>
            </div>
            <div class="daily-bar-date"><div class="dbd-day">${thaiDay(day)}</div>${shortDate(day)}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="daily-chart-footer">
        <div class="dcf-legend">
          <div class="dcf-leg"><div class="dcf-dot" style="background:#00A86B"></div>จำนวนผู้ตอบ/วัน</div>
          <div class="dcf-leg"><div class="dcf-dot" style="background:#0F4C81;border-radius:50%"></div>สะสม</div>
        </div>
        <div>แสดง ${dailyRows.length} วันล่าสุด</div>
      </div>
    </div>`;
    chartEl.style.height = 'auto';
    chartEl.style.background = 'transparent';
  }

  const donutCard = dashboard.querySelectorAll('.card')[1];
  const ministryCounts = getOrgCatalog().reduce((acc, org) => {
    acc[org.ministry] = (acc[org.ministry] || 0) + 1;
    return acc;
  }, {});
  donutCard.querySelector('.card-body').innerHTML = Object.entries(ministryCounts)
    .map(([ministry, count], idx) =>
      `<div class="legend-row"><div class="ld" style="background:${['#0F4C81','#00A86B','#C08F2A','#8896A5','#C4444A'][idx % 5]}"></div>${esc(ministry)} — ${fmtNum(count)} หน่วยงาน</div>`)
    .join('');

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
