/* ============================================================================
 * ADMIN PORTAL — COMPARE ORGANIZATIONS PAGE
 * ----------------------------------------------------------------------------
 * Commit A: Foundation
 *   · Multi-select picker (chips + presets)
 *   · Metrics computation (per-org + benchmark)
 *   · KPI cards row
 *   · Benchmark table with traffic-light coloring
 *   · Auto-generated insights
 *
 * Dependencies (globals from other modules):
 *   state (surveyRows, ch1Rows, orgProfiles)
 *   summarizeOrgs(), getOrgCatalog(), ORG_NAMES, ORG_LOOKUP
 *   getPhq9, getGad7, getBurnout, getEngagement, getWlb
 *   esc, fmtNum, showToast
 * ============================================================================ */

// ───────────────────────────────────────────────────────────────────────────
// State
// ───────────────────────────────────────────────────────────────────────────
const cmpState = {
  selected: [],     // array of org names
  maxOrgs: 5,
};

// ───────────────────────────────────────────────────────────────────────────
// Entry point (called from nav.js when user navigates to 'compare')
// ───────────────────────────────────────────────────────────────────────────
function renderCompare() {
  cmpUpdateChipsUI();
  cmpRenderContent();
}

// ───────────────────────────────────────────────────────────────────────────
// Picker: Add / Remove / Presets
// ───────────────────────────────────────────────────────────────────────────
function cmpOpenPicker() {
  const sel = document.getElementById('cmp-add-select');
  if (!sel) return;
  const available = (ORG_NAMES || []).filter((n) => !cmpState.selected.includes(n));
  sel.innerHTML = `<option value="">— เลือกองค์กร —</option>` +
    available.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  sel.style.display = sel.style.display === 'none' ? 'inline-block' : 'none';
  if (sel.style.display !== 'none') sel.focus();
}

function cmpConfirmAdd(sel) {
  const name = sel.value;
  if (!name) return;
  if (cmpState.selected.length >= cmpState.maxOrgs) {
    showToast(`เปรียบเทียบได้สูงสุด ${cmpState.maxOrgs} องค์กร`, 'warn');
    sel.value = ''; sel.style.display = 'none'; return;
  }
  if (cmpState.selected.includes(name)) {
    showToast('องค์กรนี้อยู่ในรายการแล้ว', 'warn');
    sel.value = ''; sel.style.display = 'none'; return;
  }
  cmpState.selected.push(name);
  sel.value = ''; sel.style.display = 'none';
  renderCompare();
}

function cmpRemove(name) {
  cmpState.selected = cmpState.selected.filter((n) => n !== name);
  renderCompare();
}

function cmpClear() {
  cmpState.selected = [];
  renderCompare();
}

function cmpPresetTop() {
  const summary = summarizeOrgs();
  const sorted = [...summary].sort((a, b) => b.wellbeingSubmitted - a.wellbeingSubmitted);
  cmpState.selected = sorted.slice(0, 5).map((o) => o.name);
  renderCompare();
}

function cmpPresetBottom() {
  const summary = summarizeOrgs();
  const sorted = [...summary]
    .filter((o) => o.wellbeingSubmitted > 0) // skip orgs with zero respondents
    .sort((a, b) => a.wellbeingSubmitted - b.wellbeingSubmitted);
  cmpState.selected = sorted.slice(0, 5).map((o) => o.name);
  if (cmpState.selected.length === 0) {
    showToast('ยังไม่มีองค์กรที่มีผู้ตอบ', 'warn');
  }
  renderCompare();
}

// ───────────────────────────────────────────────────────────────────────────
// Chips UI
// ───────────────────────────────────────────────────────────────────────────
function cmpUpdateChipsUI() {
  const chips = document.getElementById('cmp-chips');
  const hint = document.getElementById('cmp-empty-hint');
  const countLbl = document.getElementById('cmp-count-label');
  if (!chips) return;

  const n = cmpState.selected.length;
  if (countLbl) countLbl.textContent = `${n} / ${cmpState.maxOrgs} องค์กร`;

  // Clear existing chips (preserve hint span)
  chips.querySelectorAll('.cmp-chip').forEach((el) => el.remove());

  if (n === 0) {
    if (hint) hint.style.display = '';
    return;
  }
  if (hint) hint.style.display = 'none';

  // Add chips
  const palette = _cmpPalette();
  cmpState.selected.forEach((name, i) => {
    const chip = document.createElement('span');
    chip.className = 'badge cmp-chip';
    chip.style.cssText = `padding:5px 10px;font-size:12px;cursor:pointer;background:${palette[i]}22;border:1px solid ${palette[i]};color:${palette[i]};font-weight:600`;
    chip.textContent = name + ' ✕';
    chip.onclick = () => cmpRemove(name);
    chip.title = `คลิกเพื่อลบ · สี: ${palette[i]}`;
    chips.appendChild(chip);
  });
}

// Fixed distinct palette (color-blind friendly enough)
function _cmpPalette() {
  return ['#0F4C81', '#EA580C', '#059669', '#7C3AED', '#C4444A'];
}

// ───────────────────────────────────────────────────────────────────────────
// Metrics Computation
// ───────────────────────────────────────────────────────────────────────────
function cmpComputeMetricsForOrg(orgName) {
  const catalog = ORG_LOOKUP?.get(orgName) || null;
  const wbRows = state.surveyRows.filter((r) => !r.is_draft && (r.organization || r.org) === orgName);
  const ch1Row = state.ch1Rows.find((r) => {
    const n = r.organization || r.form_data?.organization || r.org_name_th;
    return n === orgName;
  });
  const ch1 = ch1Row ? { ...(ch1Row.form_data || {}), ...ch1Row } : null;

  const n = wbRows.length;
  const avg = (fn) => n ? wbRows.reduce((s, r) => s + (fn(r) || 0), 0) / n : null;
  const pctHigh = (fn, threshold) => n ? (wbRows.filter((r) => (fn(r) || 0) >= threshold).length / n) * 100 : null;

  const totalStaff = ch1 ? (
    parseInt(ch1.total_staff) ||
    parseInt(ch1.total_personnel) ||
    ((parseInt(ch1.type_official) || 0) + (parseInt(ch1.type_employee) || 0) +
     (parseInt(ch1.type_contract) || 0) + (parseInt(ch1.type_other) || 0))
    || null
  ) : null;

  const responseRate = (totalStaff && n) ? (n / totalStaff) * 100 : null;

  return {
    name: orgName,
    ministry: catalog?.ministry || '—',
    // wellbeing (individual-level)
    wbCount: n,
    phq: avg(getPhq9),
    phqHighPct: pctHigh(getPhq9, 10),
    gad: avg(getGad7),
    gadHighPct: pctHigh(getGad7, 10),
    burnout: avg(getBurnout),
    engagementWb: avg(getEngagement),
    wlb: avg(getWlb),
    // ch1 (org-level)
    totalStaff,
    responseRate,
    ncdPct: ch1 ? (parseFloat(ch1.ncd_ratio_pct) || null) : null,
    sickLeaveAvg: ch1 ? (parseFloat(ch1.sick_leave_avg) || null) : null,
    turnover2568: ch1 ? (parseFloat(ch1.rate_2568) || null) : null,
    engagement2568: ch1 ? (parseFloat(ch1.engagement_score_2568) || null) : null,
    trainingHours2568: ch1 ? (parseFloat(ch1.training_hours_2568) || null) : null,
    hasCh1: !!ch1,
  };
}

// Benchmark = mean across ALL orgs (not just selected) — so user can see where each org stands vs everyone
function cmpComputeBenchmark() {
  const allOrgs = (getOrgCatalog() || []).map((o) => o.name);
  const metrics = allOrgs.map(cmpComputeMetricsForOrg);
  const mean = (key) => {
    const vals = metrics.map((m) => m[key]).filter((v) => v != null && !isNaN(v));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };
  return {
    wbCount: mean('wbCount'),
    phq: mean('phq'),
    phqHighPct: mean('phqHighPct'),
    gad: mean('gad'),
    gadHighPct: mean('gadHighPct'),
    burnout: mean('burnout'),
    engagementWb: mean('engagementWb'),
    wlb: mean('wlb'),
    totalStaff: mean('totalStaff'),
    responseRate: mean('responseRate'),
    ncdPct: mean('ncdPct'),
    sickLeaveAvg: mean('sickLeaveAvg'),
    turnover2568: mean('turnover2568'),
    engagement2568: mean('engagement2568'),
    trainingHours2568: mean('trainingHours2568'),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Main Render
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderContent() {
  const empty = document.getElementById('cmp-empty-state');
  const content = document.getElementById('cmp-content');
  if (cmpState.selected.length < 2) {
    if (empty) empty.style.display = '';
    if (content) content.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (content) content.style.display = '';

  const metrics = cmpState.selected.map(cmpComputeMetricsForOrg);
  const bench = cmpComputeBenchmark();

  cmpRenderKpiCards(metrics, bench);
  cmpRenderBenchmarkTable(metrics, bench);
  cmpRenderInsights(metrics, bench);
  cmpRenderRadar(metrics);
  cmpRenderHeatmap(metrics);
  cmpRenderHBar(metrics, bench);
  cmpRenderTrend(metrics);
  cmpRenderDemographics(metrics);
  cmpRenderNcd(metrics);
  cmpRenderHrMatrix(metrics);
  cmpRenderGap(metrics, bench);
  cmpRenderRanking(metrics, bench);
}

// ───────────────────────────────────────────────────────────────────────────
// KPI Cards
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderKpiCards(metrics, bench) {
  const container = document.getElementById('cmp-kpi');
  if (!container) return;
  const palette = _cmpPalette();

  const cards = metrics.map((m, i) => {
    const color = palette[i];
    const rowResp = m.responseRate != null ? `${fmtNum(m.responseRate, 1)}%` : '—';
    const rowPhq = m.phq != null ? fmtNum(m.phq, 1) : '—';
    const rowBurn = m.burnout != null ? fmtNum(m.burnout, 1) : '—';
    const rowEng = m.engagementWb != null ? fmtNum(m.engagementWb, 1) : '—';
    const rowNcd = m.ncdPct != null ? `${fmtNum(m.ncdPct, 1)}%` : '—';
    const rowTurn = m.turnover2568 != null ? `${fmtNum(m.turnover2568, 2)}%` : '—';

    return `
      <div style="background:#fff;border:1px solid var(--bdr);border-top:3px solid ${color};border-radius:10px;padding:14px 16px">
        <div style="font-size:12.5px;font-weight:700;color:${color};margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(m.name)}">${esc(m.name)}</div>
        <div style="font-size:10.5px;color:var(--tx3);margin-bottom:10px">${esc(m.ministry)} · ${m.totalStaff ? fmtNum(m.totalStaff) + ' คน' : 'ไม่มี Ch1'}</div>
        ${_cmpKpiRow('อัตราตอบ', rowResp, 'ตอบ ' + fmtNum(m.wbCount || 0) + ' คน')}
        ${_cmpKpiRow('PHQ-9', rowPhq, m.phqHighPct != null ? fmtNum(m.phqHighPct, 1) + '% เสี่ยงสูง' : '')}
        ${_cmpKpiRow('Burnout', rowBurn)}
        ${_cmpKpiRow('Engagement', rowEng)}
        ${_cmpKpiRow('NCD', rowNcd)}
        ${_cmpKpiRow('ลาออก 2568', rowTurn)}
      </div>`;
  }).join('');

  const benchCard = `
    <div style="background:#F8FAFC;border:1px dashed var(--bdr);border-radius:10px;padding:14px 16px">
      <div style="font-size:12.5px;font-weight:700;color:var(--tx2);margin-bottom:4px">📊 ค่าเฉลี่ยทุกองค์กร</div>
      <div style="font-size:10.5px;color:var(--tx3);margin-bottom:10px">Benchmark line</div>
      ${_cmpKpiRow('อัตราตอบ', bench.responseRate != null ? fmtNum(bench.responseRate, 1) + '%' : '—')}
      ${_cmpKpiRow('PHQ-9', bench.phq != null ? fmtNum(bench.phq, 1) : '—')}
      ${_cmpKpiRow('Burnout', bench.burnout != null ? fmtNum(bench.burnout, 1) : '—')}
      ${_cmpKpiRow('Engagement', bench.engagementWb != null ? fmtNum(bench.engagementWb, 1) : '—')}
      ${_cmpKpiRow('NCD', bench.ncdPct != null ? fmtNum(bench.ncdPct, 1) + '%' : '—')}
      ${_cmpKpiRow('ลาออก 2568', bench.turnover2568 != null ? fmtNum(bench.turnover2568, 2) + '%' : '—')}
    </div>`;

  const colCount = metrics.length + 1;
  container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(${colCount},1fr);gap:10px">${cards}${benchCard}</div>`;
}

function _cmpKpiRow(label, value, sub = '') {
  return `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-top:1px solid var(--bg2)">
    <div style="font-size:11px;color:var(--tx2)">${label}</div>
    <div style="text-align:right">
      <div style="font-size:13px;font-weight:700;color:var(--tx)">${value}</div>
      ${sub ? `<div style="font-size:9.5px;color:var(--tx3)">${sub}</div>` : ''}
    </div>
  </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Benchmark Table
// ───────────────────────────────────────────────────────────────────────────
// Metric definition: key, label, fmt, goodDir (1 = higher is better, -1 = lower is better, 0 = neutral)
const CMP_METRICS = [
  { key: 'totalStaff',        label: 'จำนวนบุคลากร',              fmt: (v) => fmtNum(v),                goodDir: 0 },
  { key: 'wbCount',           label: 'ผู้ตอบ Wellbeing (คน)',       fmt: (v) => fmtNum(v),                goodDir: 1 },
  { key: 'responseRate',      label: 'อัตราตอบ (%)',              fmt: (v) => fmtNum(v, 1) + '%',       goodDir: 1 },
  { key: 'phq',               label: 'PHQ-9 เฉลี่ย',               fmt: (v) => fmtNum(v, 1),             goodDir: -1 },
  { key: 'phqHighPct',        label: 'PHQ-9 เสี่ยงสูง (%)',         fmt: (v) => fmtNum(v, 1) + '%',       goodDir: -1 },
  { key: 'gad',               label: 'GAD-7 เฉลี่ย',               fmt: (v) => fmtNum(v, 1),             goodDir: -1 },
  { key: 'gadHighPct',        label: 'GAD-7 เสี่ยงสูง (%)',         fmt: (v) => fmtNum(v, 1) + '%',       goodDir: -1 },
  { key: 'burnout',           label: 'Burnout เฉลี่ย',             fmt: (v) => fmtNum(v, 1),             goodDir: -1 },
  { key: 'engagementWb',      label: 'Engagement (Wellbeing)',     fmt: (v) => fmtNum(v, 1),             goodDir: 1 },
  { key: 'wlb',               label: 'Work-Life Balance',          fmt: (v) => fmtNum(v, 1),             goodDir: 1 },
  { key: 'ncdPct',            label: 'NCD ต่อบุคลากร (%)',          fmt: (v) => fmtNum(v, 1) + '%',       goodDir: -1 },
  { key: 'sickLeaveAvg',      label: 'วันลาป่วยเฉลี่ย (วัน/คน)',    fmt: (v) => fmtNum(v, 1),             goodDir: -1 },
  { key: 'turnover2568',      label: 'อัตราลาออก ปี 2568 (%)',      fmt: (v) => fmtNum(v, 2) + '%',       goodDir: -1 },
  { key: 'engagement2568',    label: 'Engagement 2568 (Ch1)',      fmt: (v) => fmtNum(v, 1),             goodDir: 1 },
  { key: 'trainingHours2568', label: 'ฝึกอบรม 2568 (ชม./คน)',      fmt: (v) => fmtNum(v, 1),             goodDir: 1 },
];

// Return colored cell style + emoji based on deviation from benchmark
function _cmpCellStyle(val, benchVal, goodDir) {
  if (val == null || benchVal == null || isNaN(val) || isNaN(benchVal)) {
    return { style: 'color:var(--tx3)', icon: '' };
  }
  if (goodDir === 0) return { style: '', icon: '' };

  // Relative deviation
  const ref = Math.abs(benchVal) < 0.001 ? 1 : Math.abs(benchVal);
  const diff = (val - benchVal) / ref;  // +ve means val > bench

  // Threshold 10% = neutral, else good/bad
  let sign = 0;
  if (diff > 0.10) sign = 1;
  else if (diff < -0.10) sign = -1;

  const effective = sign * goodDir; // +1 good, -1 bad, 0 neutral
  if (effective > 0) return { style: 'background:#ECFDF5;color:#047857;font-weight:600', icon: '🟢' };
  if (effective < 0) return { style: 'background:#FEF2F2;color:#B91C1C;font-weight:600', icon: '🔴' };
  return { style: 'background:#FFFBEB;color:#92400E', icon: '🟡' };
}

function cmpRenderBenchmarkTable(metrics, bench) {
  const thead = document.getElementById('cmp-benchmark-thead');
  const tbody = document.getElementById('cmp-benchmark-tbody');
  if (!thead || !tbody) return;

  const palette = _cmpPalette();
  thead.innerHTML = `<tr>
    <th style="text-align:left;min-width:200px">ตัวชี้วัด</th>
    ${metrics.map((m, i) => `<th style="text-align:center;border-top:3px solid ${palette[i]};color:${palette[i]}" title="${esc(m.name)}">${esc(_cmpAbbr(m.name, 18))}</th>`).join('')}
    <th style="text-align:center;background:#F8FAFC;color:var(--tx2)">เฉลี่ยทั้งหมด</th>
  </tr>`;

  tbody.innerHTML = CMP_METRICS.map((def) => {
    const benchVal = bench[def.key];
    const cells = metrics.map((m) => {
      const v = m[def.key];
      const { style, icon } = _cmpCellStyle(v, benchVal, def.goodDir);
      const display = v == null || isNaN(v) ? '—' : def.fmt(v);
      return `<td style="text-align:center;${style}">${icon ? icon + ' ' : ''}${display}</td>`;
    }).join('');
    const benchDisplay = benchVal == null || isNaN(benchVal) ? '—' : def.fmt(benchVal);
    return `<tr>
      <td style="font-weight:500">${def.label}</td>
      ${cells}
      <td style="text-align:center;background:#F8FAFC;color:var(--tx2);font-weight:600">${benchDisplay}</td>
    </tr>`;
  }).join('');
}

function _cmpAbbr(s, max) {
  if (!s) return '';
  return s.length > max ? s.substring(0, max - 1) + '…' : s;
}

// ───────────────────────────────────────────────────────────────────────────
// Auto-Generated Insights
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderInsights(metrics, bench) {
  const container = document.getElementById('cmp-insights');
  if (!container) return;
  const insights = _cmpBuildInsights(metrics, bench);
  if (insights.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>💡 Auto Insights</h3><span style="font-size:11px;color:var(--tx3)">สรุปอัตโนมัติจากข้อมูล</span></div>
      <div style="padding:12px 18px;display:flex;flex-direction:column;gap:8px">
        ${insights.map((i) => `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 10px;background:${i.bg};border-left:3px solid ${i.color};border-radius:6px">
          <span style="font-size:16px;flex-shrink:0">${i.icon}</span>
          <div style="font-size:12.5px;line-height:1.55;color:var(--tx)">${i.text}</div>
        </div>`).join('')}
      </div>
    </div>`;
}

function _cmpBuildInsights(metrics, bench) {
  const out = [];
  const GREEN = { color: '#059669', bg: '#ECFDF5', icon: '✅' };
  const RED = { color: '#B91C1C', bg: '#FEF2F2', icon: '⚠️' };
  const BLUE = { color: '#0F4C81', bg: '#EFF6FF', icon: '💡' };
  const YELLOW = { color: '#92400E', bg: '#FFFBEB', icon: '🔔' };

  // 1. Highest PHQ risk
  const phqRanked = [...metrics].filter((m) => m.phqHighPct != null).sort((a, b) => b.phqHighPct - a.phqHighPct);
  if (phqRanked.length && bench.phqHighPct != null && phqRanked[0].phqHighPct > bench.phqHighPct * 1.3) {
    out.push({ ...RED, text: `<b>${esc(phqRanked[0].name)}</b> มี PHQ-9 เสี่ยงสูงถึง <b>${fmtNum(phqRanked[0].phqHighPct, 1)}%</b> — สูงกว่าค่าเฉลี่ยทั้งหมด (${fmtNum(bench.phqHighPct, 1)}%) อย่างมีนัยสำคัญ ควรมีมาตรการเฉพาะ` });
  }

  // 2. Best engagement
  const engRanked = [...metrics].filter((m) => m.engagementWb != null).sort((a, b) => b.engagementWb - a.engagementWb);
  if (engRanked.length >= 2 && engRanked[0].engagementWb > (bench.engagementWb || 0) * 1.1) {
    out.push({ ...GREEN, text: `<b>${esc(engRanked[0].name)}</b> มี Engagement สูงสุดในกลุ่ม (${fmtNum(engRanked[0].engagementWb, 1)}) — อาจเป็น case study สำหรับองค์กรอื่น` });
  }

  // 3. Burnout + Engagement paradox
  metrics.forEach((m) => {
    if (m.burnout != null && m.engagementWb != null && bench.burnout != null && bench.engagementWb != null) {
      if (m.burnout > bench.burnout * 1.15 && m.engagementWb > bench.engagementWb * 1.05) {
        out.push({ ...YELLOW, text: `<b>${esc(m.name)}</b> มี <b>Burnout</b> สูง (${fmtNum(m.burnout, 1)}) แต่ <b>Engagement</b> ก็สูง (${fmtNum(m.engagementWb, 1)}) — แสดงทีมที่ทุ่มเทแต่เสี่ยงหมดไฟ ควรดูเรื่อง workload/balance` });
      }
    }
  });

  // 4. High turnover
  metrics.forEach((m) => {
    if (m.turnover2568 != null && bench.turnover2568 != null && m.turnover2568 > bench.turnover2568 * 1.5) {
      out.push({ ...RED, text: `<b>${esc(m.name)}</b> มีอัตราลาออกปี 2568 สูงถึง <b>${fmtNum(m.turnover2568, 2)}%</b> — เทียบเฉลี่ย ${fmtNum(bench.turnover2568, 2)}% ควรทบทวนระบบ career path และ engagement` });
    }
  });

  // 5. Low response rate warning
  metrics.forEach((m) => {
    if (m.responseRate != null && m.responseRate < 30 && m.totalStaff) {
      out.push({ ...YELLOW, text: `<b>${esc(m.name)}</b> มีอัตราตอบเพียง <b>${fmtNum(m.responseRate, 1)}%</b> (${fmtNum(m.wbCount)}/${fmtNum(m.totalStaff)} คน) — ข้อมูลอาจไม่ representative ควรเพิ่มการประชาสัมพันธ์` });
    }
  });

  // 6. Missing Ch1
  const noCh1 = metrics.filter((m) => !m.hasCh1);
  if (noCh1.length) {
    out.push({ ...BLUE, text: `องค์กรที่ยังไม่ส่ง Ch1: ${noCh1.map((m) => `<b>${esc(m.name)}</b>`).join(', ')} — ตัวชี้วัดบางรายการ (NCD, ลาออก, Training) ยังแสดงไม่ได้` });
  }

  // 7. No wellbeing data
  const noWb = metrics.filter((m) => m.wbCount === 0);
  if (noWb.length) {
    out.push({ ...BLUE, text: `องค์กรที่ยังไม่มีผู้ตอบ Wellbeing: ${noWb.map((m) => `<b>${esc(m.name)}</b>`).join(', ')}` });
  }

  return out;
}

/* ============================================================================
 * COMMIT B — VISUALIZATIONS
 * ============================================================================ */

// ───────────────────────────────────────────────────────────────────────────
// Radar Chart (SVG) — 6 dimensions, higher = better for all axes
// ───────────────────────────────────────────────────────────────────────────
// Axes: PHQ-9 (inv) · GAD-7 (inv) · Burnout (inv) · Engagement · WLB · NCD (inv)
// Normalization: each axis 0-100, where 0 = worst observed, 100 = best observed
function cmpRenderRadar(metrics) {
  const container = document.getElementById('cmp-radar');
  if (!container) return;

  const axes = [
    { key: 'phq',           label: 'ภาวะซึมเศร้า',     invert: true  },
    { key: 'gad',           label: 'วิตกกังวล',         invert: true  },
    { key: 'burnout',       label: 'Burnout',           invert: true  },
    { key: 'engagementWb',  label: 'Engagement',       invert: false },
    { key: 'wlb',           label: 'Work-Life Balance', invert: false },
    { key: 'ncdPct',        label: 'สุขภาพกาย (ไม่มี NCD)', invert: true },
  ];

  // Compute min/max across ALL orgs for each axis (global normalization)
  const allOrgs = (getOrgCatalog() || []).map((o) => o.name).map(cmpComputeMetricsForOrg);
  const ranges = axes.map((ax) => {
    const vals = allOrgs.map((m) => m[ax.key]).filter((v) => v != null && !isNaN(v));
    return { min: vals.length ? Math.min(...vals) : 0, max: vals.length ? Math.max(...vals) : 1 };
  });

  // Check if we have enough data
  const hasAnyData = metrics.some((m) => axes.some((ax) => m[ax.key] != null));
  if (!hasAnyData) {
    container.innerHTML = `<div class="card"><div class="card-head"><h3>🕸️ Radar — สุขภาวะ 6 มิติ</h3></div>
      <div style="padding:24px;text-align:center;color:var(--tx3)">ยังไม่มีข้อมูลเพียงพอสำหรับ Radar chart</div></div>`;
    return;
  }

  const normalize = (val, i) => {
    if (val == null || isNaN(val)) return null;
    const { min, max } = ranges[i];
    if (max === min) return 50;
    const raw = (val - min) / (max - min); // 0..1
    return axes[i].invert ? (1 - raw) * 100 : raw * 100;
  };

  // SVG geometry
  const size = 360;
  const cx = size / 2, cy = size / 2;
  const radius = 130;
  const levels = 5; // concentric rings at 20,40,60,80,100
  const nAxes = axes.length;
  const angleOf = (i) => (-Math.PI / 2) + (2 * Math.PI * i) / nAxes;

  // Grid rings
  const rings = Array.from({ length: levels }, (_, k) => {
    const r = radius * ((k + 1) / levels);
    const pts = axes.map((_, i) => {
      const a = angleOf(i);
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#E5E7EB" stroke-width="1"/>`;
  }).join('');

  // Axis lines + labels
  const axisLines = axes.map((ax, i) => {
    const a = angleOf(i);
    const x2 = cx + radius * Math.cos(a);
    const y2 = cy + radius * Math.sin(a);
    const lx = cx + (radius + 24) * Math.cos(a);
    const ly = cy + (radius + 24) * Math.sin(a);
    return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#CBD5E1" stroke-width="1"/>
      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#475569" font-weight="600">${esc(ax.label)}</text>`;
  }).join('');

  // Data polygons per org
  const palette = _cmpPalette();
  const polygons = metrics.map((m, idx) => {
    const color = palette[idx];
    const pts = axes.map((ax, i) => {
      const normVal = normalize(m[ax.key], i);
      const v = normVal == null ? 0 : normVal;
      const r = radius * (v / 100);
      const a = angleOf(i);
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    const dots = axes.map((ax, i) => {
      const normVal = normalize(m[ax.key], i);
      if (normVal == null) return '';
      const r = radius * (normVal / 100);
      const a = angleOf(i);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${color}"/>`;
    }).join('');
    return `<g><polygon points="${pts}" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-width="2"/>${dots}</g>`;
  }).join('');

  // Legend
  const legend = metrics.map((m, i) =>
    `<div style="display:flex;align-items:center;gap:6px;font-size:12px">
      <div style="width:14px;height:14px;border-radius:3px;background:${palette[i]}33;border:2px solid ${palette[i]}"></div>
      <span>${esc(m.name)}</span>
    </div>`
  ).join('');

  container.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>🕸️ Radar — สุขภาวะ 6 มิติ</h3>
        <span style="font-size:11px;color:var(--tx3)">Normalize 0-100 · ยิ่งพื้นที่มาก ยิ่งสุขภาวะดี</span>
      </div>
      <div style="padding:14px 18px;display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0">
          ${rings}${axisLines}${polygons}
        </svg>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${legend}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:8px;line-height:1.55">
            💡 แกนที่กลับด้าน (ซึมเศร้า, วิตกกังวล, Burnout, NCD) ถูกปรับให้ <b>ค่ายิ่งสูง = ยิ่งดี</b> เพื่อให้อ่านรูปร่างภาพรวมได้ง่าย
          </div>
        </div>
      </div>
    </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Heatmap — Orgs × Metrics
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderHeatmap(metrics) {
  const container = document.getElementById('cmp-heatmap');
  if (!container) return;

  // Use a subset of key metrics for readability
  const heatMetrics = CMP_METRICS.filter((d) => d.goodDir !== 0 && [
    'responseRate', 'phqHighPct', 'gadHighPct', 'burnout',
    'engagementWb', 'wlb', 'ncdPct', 'sickLeaveAvg', 'turnover2568',
  ].includes(d.key));

  // Compute min/max across ALL orgs for each metric (global normalization)
  const allOrgs = (getOrgCatalog() || []).map((o) => o.name).map(cmpComputeMetricsForOrg);
  const ranges = {};
  heatMetrics.forEach((def) => {
    const vals = allOrgs.map((m) => m[def.key]).filter((v) => v != null && !isNaN(v));
    ranges[def.key] = { min: vals.length ? Math.min(...vals) : 0, max: vals.length ? Math.max(...vals) : 1 };
  });

  // Color scale: good = green, bad = red
  const heatColor = (val, def) => {
    if (val == null || isNaN(val)) return { bg: '#F9FAFB', fg: '#9CA3AF' };
    const { min, max } = ranges[def.key];
    if (max === min) return { bg: '#FEF3C7', fg: '#92400E' };
    const raw = (val - min) / (max - min); // 0..1
    const goodness = def.goodDir === 1 ? raw : (1 - raw); // 0 = bad, 1 = good
    // Interpolate: 0 → red, 0.5 → yellow, 1 → green
    let r, g, b;
    if (goodness < 0.5) {
      // red → yellow
      const t = goodness * 2;
      r = 239; g = Math.round(68 + (191 - 68) * t); b = Math.round(68 + (36 - 68) * t);
    } else {
      // yellow → green
      const t = (goodness - 0.5) * 2;
      r = Math.round(239 + (16 - 239) * t); g = Math.round(191 + (185 - 191) * t); b = Math.round(36 + (129 - 36) * t);
    }
    return { bg: `rgba(${r},${g},${b},0.25)`, fg: `rgb(${Math.max(r - 40, 0)},${Math.max(g - 40, 0)},${Math.max(b - 40, 0)})` };
  };

  const palette = _cmpPalette();
  const headCols = metrics.map((m, i) =>
    `<th style="text-align:center;min-width:100px;border-top:3px solid ${palette[i]};color:${palette[i]};font-size:11px" title="${esc(m.name)}">${esc(_cmpAbbr(m.name, 14))}</th>`
  ).join('');

  const rows = heatMetrics.map((def) => {
    const cells = metrics.map((m) => {
      const v = m[def.key];
      const { bg, fg } = heatColor(v, def);
      const display = v == null || isNaN(v) ? '—' : def.fmt(v);
      return `<td style="text-align:center;background:${bg};color:${fg};font-weight:600;padding:8px">${display}</td>`;
    }).join('');
    const dirIcon = def.goodDir === 1 ? '⬆️' : def.goodDir === -1 ? '⬇️' : '';
    return `<tr>
      <td style="padding:8px 12px;font-weight:500;font-size:12px" title="${dirIcon} ${def.goodDir === 1 ? 'สูง = ดี' : 'ต่ำ = ดี'}">${def.label} <span style="font-size:10px;color:var(--tx3)">${dirIcon}</span></td>
      ${cells}
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>🌡️ Heatmap — องค์กร × ตัวชี้วัด</h3>
        <span style="font-size:11px;color:var(--tx3)">🟥 แย่สุด → 🟨 กลาง → 🟩 ดีสุด (เทียบทุกองค์กรในระบบ)</span>
      </div>
      <div class="tbl-wrap">
        <table style="border-collapse:separate;border-spacing:2px">
          <thead><tr><th style="text-align:left;min-width:180px;padding:8px 12px">ตัวชี้วัด</th>${headCols}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Horizontal Bar — selectable metric, sorted good → bad
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderHBar(metrics, bench) {
  const container = document.getElementById('cmp-hbar');
  if (!container) return;

  const selectableMetrics = CMP_METRICS.filter((d) => d.goodDir !== 0);
  const currentKey = cmpState.hbarMetric || 'engagementWb';
  const def = selectableMetrics.find((d) => d.key === currentKey) || selectableMetrics[0];

  const options = selectableMetrics.map((d) =>
    `<option value="${d.key}" ${d.key === def.key ? 'selected' : ''}>${d.label}</option>`
  ).join('');

  // Sort metrics by selected key (best first, based on goodDir)
  const rows = metrics
    .map((m) => ({ name: m.name, val: m[def.key] }))
    .filter((r) => r.val != null && !isNaN(r.val))
    .sort((a, b) => def.goodDir === 1 ? b.val - a.val : a.val - b.val);

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="card-head">
          <h3>📊 Horizontal Bar — เรียงตามตัวชี้วัด</h3>
          <select id="cmp-hbar-select" class="sel" onchange="cmpHBarChange(this.value)" style="max-width:260px">${options}</select>
        </div>
        <div style="padding:24px;text-align:center;color:var(--tx3)">ไม่มีข้อมูลสำหรับองค์กรที่เลือก</div>
      </div>`;
    return;
  }

  const vals = rows.map((r) => r.val);
  const maxAbs = Math.max(...vals.map(Math.abs), bench[def.key] != null ? Math.abs(bench[def.key]) : 0, 1);
  const palette = _cmpPalette();
  const nameToIdx = new Map(cmpState.selected.map((n, i) => [n, i]));
  const benchVal = bench[def.key];
  const benchPct = benchVal != null ? (benchVal / maxAbs) * 100 : null;

  const bars = rows.map((r) => {
    const pct = (r.val / maxAbs) * 100;
    const color = palette[nameToIdx.get(r.name) || 0];
    return `
      <div style="display:grid;grid-template-columns:200px 1fr 80px;gap:12px;align-items:center;margin-bottom:8px">
        <div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(r.name)}">${esc(r.name)}</div>
        <div style="position:relative;height:22px;background:#F3F4F6;border-radius:4px;overflow:hidden">
          <div style="position:absolute;left:0;top:0;height:100%;width:${pct.toFixed(1)}%;background:${color};border-radius:4px;transition:width .4s"></div>
          ${benchPct != null ? `<div style="position:absolute;left:${benchPct.toFixed(1)}%;top:-3px;bottom:-3px;width:2px;background:#111827;z-index:2" title="เฉลี่ย: ${def.fmt(benchVal)}"></div>` : ''}
        </div>
        <div style="text-align:right;font-size:12px;font-weight:700;color:${color}">${def.fmt(r.val)}</div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>📊 Horizontal Bar — เรียงตามตัวชี้วัด</h3>
        <select id="cmp-hbar-select" class="sel" onchange="cmpHBarChange(this.value)" style="max-width:260px">${options}</select>
      </div>
      <div style="padding:14px 18px">
        ${bars}
        ${benchVal != null ? `<div style="font-size:11px;color:var(--tx3);margin-top:10px;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:2px;height:14px;background:#111827"></span> เส้นแนวตั้ง = ค่าเฉลี่ยทุกองค์กร (${def.fmt(benchVal)})</div>` : ''}
        <div style="font-size:11px;color:var(--tx3);margin-top:4px">เรียง: ${def.goodDir === 1 ? 'ดีสุด → แย่สุด' : 'ดีสุด (ต่ำสุด) → แย่สุด (สูงสุด)'}</div>
      </div>
    </div>`;
}

function cmpHBarChange(key) {
  cmpState.hbarMetric = key;
  const metrics = cmpState.selected.map(cmpComputeMetricsForOrg);
  const bench = cmpComputeBenchmark();
  cmpRenderHBar(metrics, bench);
}

// ───────────────────────────────────────────────────────────────────────────
// Time-series Trend — 5 years (2564-2568)
// ───────────────────────────────────────────────────────────────────────────
// Sources (Ch1 form_data):
//   engagement_score_{year} · rate_{year} (turnover) · training_hours_{year}
// Requires ch1Rows with form_data loaded (extras phase)
const CMP_TREND_YEARS = ['2564', '2565', '2566', '2567', '2568'];

function cmpRenderTrend(metrics) {
  const container = document.getElementById('cmp-trend');
  if (!container) return;

  // Pull raw ch1 rows by org
  const orgData = metrics.map((m) => {
    const ch1Row = state.ch1Rows.find((r) => {
      const n = r.organization || r.form_data?.organization || r.org_name_th;
      return n === m.name;
    });
    const fd = ch1Row ? { ...(ch1Row.form_data || {}), ...ch1Row } : null;
    return {
      name: m.name,
      engagement: fd ? CMP_TREND_YEARS.map((y) => parseFloat(fd[`engagement_score_${y}`]) || null) : null,
      turnover:   fd ? CMP_TREND_YEARS.map((y) => parseFloat(fd[`rate_${y}`]) || null) : null,
      training:   fd ? CMP_TREND_YEARS.map((y) => parseFloat(fd[`training_hours_${y}`]) || null) : null,
    };
  });

  const hasAny = orgData.some((o) => o.engagement || o.turnover || o.training);
  if (!hasAny) {
    container.innerHTML = `<div class="card">
      <div class="card-head"><h3>📈 แนวโน้ม 5 ปี (2564–2568)</h3></div>
      <div style="padding:24px;text-align:center;color:var(--tx3)">รอโหลดข้อมูล Ch1 (form_data) จาก extras phase...<br>หากยังไม่ส่ง Ch1 กราฟจะไม่แสดง</div>
    </div>`;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>📈 แนวโน้ม 5 ปี (2564–2568)</h3><span style="font-size:11px;color:var(--tx3)">จากข้อมูล Ch1 form_data</span></div>
      <div style="padding:14px 18px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
        <div>
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--tx2)">❤️ Engagement Score</div>
          ${_cmpLineChart(orgData.map((o) => ({ name: o.name, values: o.engagement })), { yLabel: 'คะแนน' })}
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--tx2)">📉 อัตราการลาออก (%)</div>
          ${_cmpLineChart(orgData.map((o) => ({ name: o.name, values: o.turnover })), { yLabel: '%', invert: true })}
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--tx2)">🎓 ชั่วโมงฝึกอบรม/คน</div>
          ${_cmpLineChart(orgData.map((o) => ({ name: o.name, values: o.training })), { yLabel: 'ชม.' })}
        </div>
      </div>
      <div style="padding:0 18px 14px;font-size:10.5px;color:var(--tx3)">
        💡 <b>Engagement/Training</b> สูงขึ้น = ดี · <b>ลาออก</b> ต่ำลง = ดี
      </div>
    </div>`;
}

// Mini line chart SVG for time-series
function _cmpLineChart(series, opts = {}) {
  // series = [{ name, values: [v2564, v2565, ...] | null }, ...]
  const width = 260, height = 180;
  const padL = 32, padR = 10, padT = 10, padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const years = CMP_TREND_YEARS;
  const n = years.length;

  const validSeries = series.filter((s) => s.values && s.values.some((v) => v != null && !isNaN(v)));
  if (!validSeries.length) {
    return `<div style="height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:11px;background:#F9FAFB;border-radius:6px">ไม่มีข้อมูล</div>`;
  }

  const allVals = validSeries.flatMap((s) => s.values.filter((v) => v != null && !isNaN(v)));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const pad = (maxV - minV) * 0.1 || 1;
  const yMin = Math.max(0, minV - pad);
  const yMax = maxV + pad;

  const xAt = (i) => padL + (plotW * i) / (n - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  // Y axis ticks (3 levels)
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];
  const gridLines = yTicks.map((t) =>
    `<line x1="${padL}" y1="${yAt(t)}" x2="${width - padR}" y2="${yAt(t)}" stroke="#E5E7EB" stroke-width="1"/>
     <text x="${padL - 4}" y="${yAt(t) + 3}" text-anchor="end" font-size="9" fill="#94A3B8">${fmtNum(t, 1)}</text>`
  ).join('');

  // X axis labels
  const xLabels = years.map((y, i) =>
    `<text x="${xAt(i)}" y="${height - padB + 14}" text-anchor="middle" font-size="10" fill="#64748B">${y}</text>`
  ).join('');

  // Lines + dots
  const palette = _cmpPalette();
  const nameToIdx = new Map(cmpState.selected.map((n, i) => [n, i]));
  const lines = validSeries.map((s) => {
    const color = palette[nameToIdx.get(s.name) || 0];
    const pts = s.values.map((v, i) => v == null || isNaN(v) ? null : { x: xAt(i), y: yAt(v) });
    // Draw line only between consecutive non-null points
    let path = '';
    let started = false;
    pts.forEach((p) => {
      if (p == null) { started = false; return; }
      path += started ? ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      started = true;
    });
    const dots = pts.filter(Boolean).map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${color}"/>`).join('');
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"/>${dots}`;
  }).join('');

  return `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
    ${gridLines}${xLabels}${lines}
  </svg>`;
}

/* ============================================================================
 * COMMIT C — DEEP DIVE
 * ============================================================================ */

// ───────────────────────────────────────────────────────────────────────────
// Helper: get ch1 form_data for an org (or null)
// ───────────────────────────────────────────────────────────────────────────
function _cmpGetCh1Data(orgName) {
  const row = state.ch1Rows.find((r) => {
    const n = r.organization || r.form_data?.organization || r.org_name_th;
    return n === orgName;
  });
  if (!row) return null;
  return { ...(row.form_data || {}), ...row };
}

// Helper: horizontal stacked bar for distribution (4+ segments)
function _cmpStackedBar(segments, total) {
  // segments = [{label, count, color}]
  if (!total || total <= 0) return '<div style="color:var(--tx3);font-size:11px">ไม่มีข้อมูล</div>';
  const bars = segments.map((s) => {
    const pct = (s.count / total) * 100;
    return pct > 0.5
      ? `<div style="width:${pct.toFixed(1)}%;background:${s.color};height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600" title="${esc(s.label)}: ${fmtNum(s.count)} (${fmtNum(pct, 1)}%)">${pct >= 6 ? fmtNum(pct, 0) + '%' : ''}</div>`
      : '';
  }).join('');
  return `<div style="display:flex;width:100%;height:18px;border-radius:4px;overflow:hidden;background:#F3F4F6">${bars}</div>`;
}

function _cmpLegendInline(segments) {
  return `<div style="display:flex;flex-wrap:wrap;gap:10px 14px;margin-top:6px">${segments.map((s) =>
    `<div style="display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--tx2)">
      <div style="width:10px;height:10px;border-radius:2px;background:${s.color}"></div>${esc(s.label)}
    </div>`
  ).join('')}</div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Demographics Comparison — age, service years, staff types
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderDemographics(metrics) {
  const container = document.getElementById('cmp-demographics');
  if (!container) return;

  const AGE_KEYS = [
    { key: 'age_u30',   label: '≤30 ปี',    color: '#10B981' },
    { key: 'age_31_40', label: '31–40 ปี',  color: '#0F4C81' },
    { key: 'age_41_50', label: '41–50 ปี',  color: '#F59E0B' },
    { key: 'age_51_60', label: '51+ ปี',    color: '#EF4444' },
  ];
  const SERVICE_KEYS = [
    { key: 'service_u1',     label: '<1 ปี',    color: '#A7F3D0' },
    { key: 'service_1_5',    label: '1–5',      color: '#6EE7B7' },
    { key: 'service_6_10',   label: '6–10',     color: '#34D399' },
    { key: 'service_11_15',  label: '11–15',    color: '#10B981' },
    { key: 'service_16_20',  label: '16–20',    color: '#059669' },
    { key: 'service_21_25',  label: '21–25',    color: '#047857' },
    { key: 'service_26_30',  label: '26–30',    color: '#065F46' },
    { key: 'service_over30', label: '30+ ปี',   color: '#064E3B' },
  ];
  const TYPE_KEYS = [
    { key: 'type_official', label: 'ข้าราชการ',        color: '#0F4C81' },
    { key: 'type_employee', label: 'พนักงานราชการ',    color: '#EA580C' },
    { key: 'type_contract', label: 'ลูกจ้าง/จ้างเหมา', color: '#7C3AED' },
    { key: 'type_other',    label: 'อื่นๆ',           color: '#8896A5' },
  ];

  const orgData = metrics.map((m) => ({
    name: m.name,
    ch1: _cmpGetCh1Data(m.name),
  }));

  if (orgData.every((o) => !o.ch1)) {
    container.innerHTML = `<div class="card"><div class="card-head"><h3>🍩 Demographics — โครงสร้างบุคลากร</h3></div>
      <div style="padding:24px;text-align:center;color:var(--tx3)">องค์กรที่เลือกยังไม่มีข้อมูล Ch1</div></div>`;
    return;
  }

  const sectionHtml = (title, keys) => {
    const rows = orgData.map((o) => {
      if (!o.ch1) {
        return `<tr><td style="padding:8px 10px;font-size:11.5px">${esc(o.name)}</td><td style="padding:8px 10px;color:var(--tx3);font-size:11px" colspan="2">— ไม่มี Ch1 —</td></tr>`;
      }
      const segs = keys.map((k) => ({
        label: k.label,
        count: parseInt(o.ch1[k.key]) || 0,
        color: k.color,
      }));
      const total = segs.reduce((s, x) => s + x.count, 0);
      return `<tr>
        <td style="padding:8px 10px;font-size:11.5px;vertical-align:top">${esc(o.name)}<div style="font-size:10px;color:var(--tx3)">รวม ${fmtNum(total)} คน</div></td>
        <td style="padding:8px 10px" colspan="2">${_cmpStackedBar(segs, total)}</td>
      </tr>`;
    }).join('');
    return `<div style="margin-bottom:18px">
      <div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">${title}</div>
      <table style="width:100%;border-collapse:collapse">
        <tbody>${rows}</tbody>
      </table>
      ${_cmpLegendInline(keys.map((k) => ({ label: k.label, color: k.color })))}
    </div>`;
  };

  container.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>🍩 Demographics — โครงสร้างบุคลากร</h3>
        <span style="font-size:11px;color:var(--tx3)">ใช้ประกอบการแปลผล — องค์กรที่อายุเฉลี่ยต่างกันอาจมีตัวชี้วัดที่เทียบกันไม่แฟร์</span>
      </div>
      <div style="padding:14px 18px">
        ${sectionHtml('โครงสร้างอายุ', AGE_KEYS)}
        ${sectionHtml('อายุราชการ', SERVICE_KEYS)}
        ${sectionHtml('ประเภทบุคลากร', TYPE_KEYS)}
      </div>
    </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// NCD Breakdown — 8 diseases, grouped horizontal bars per org
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderNcd(metrics) {
  const container = document.getElementById('cmp-ncd');
  if (!container) return;

  const NCD_KEYS = [
    { key: 'disease_diabetes',       label: 'เบาหวาน',            color: '#EF4444' },
    { key: 'disease_hypertension',   label: 'ความดันโลหิตสูง',    color: '#F59E0B' },
    { key: 'disease_cardiovascular', label: 'หัวใจ/หลอดเลือด',    color: '#DC2626' },
    { key: 'disease_kidney',         label: 'ไต',                 color: '#8B5CF6' },
    { key: 'disease_liver',          label: 'ตับ',                color: '#A16207' },
    { key: 'disease_cancer',         label: 'มะเร็ง',             color: '#991B1B' },
    { key: 'disease_obesity',        label: 'โรคอ้วน',            color: '#7C3AED' },
    { key: 'disease_other_count',    label: 'อื่นๆ',              color: '#6B7280' },
  ];

  const orgData = metrics.map((m) => {
    const ch1 = _cmpGetCh1Data(m.name);
    if (!ch1) return { name: m.name, ch1: null };
    const totalStaff = m.totalStaff || 0;
    const diseases = NCD_KEYS.map((k) => ({
      label: k.label,
      color: k.color,
      count: parseInt(ch1[k.key]) || 0,
      pct: totalStaff > 0 ? ((parseInt(ch1[k.key]) || 0) / totalStaff) * 100 : 0,
    }));
    return { name: m.name, ch1, diseases, totalStaff };
  });

  if (orgData.every((o) => !o.ch1)) {
    container.innerHTML = `<div class="card"><div class="card-head"><h3>🏥 NCD Breakdown — 8 โรคหลัก</h3></div>
      <div style="padding:24px;text-align:center;color:var(--tx3)">องค์กรที่เลือกยังไม่มีข้อมูล Ch1</div></div>`;
    return;
  }

  // Find max pct across all orgs for shared scale
  const maxPct = Math.max(1, ...orgData.filter((o) => o.ch1).flatMap((o) => o.diseases.map((d) => d.pct)));

  const grid = orgData.map((o) => {
    if (!o.ch1) {
      return `<div style="border:1px dashed var(--bdr);border-radius:8px;padding:12px;background:#FAFAFA">
        <div style="font-size:12.5px;font-weight:700;margin-bottom:6px">${esc(o.name)}</div>
        <div style="color:var(--tx3);font-size:11px">— ไม่มี Ch1 —</div>
      </div>`;
    }
    const totalNcd = o.diseases.reduce((s, d) => s + d.count, 0);
    const bars = o.diseases.map((d) => `
      <div style="display:grid;grid-template-columns:100px 1fr 60px;gap:8px;align-items:center;margin-bottom:4px">
        <div style="font-size:10.5px;color:var(--tx2)">${esc(d.label)}</div>
        <div style="background:#F3F4F6;border-radius:3px;height:10px;overflow:hidden">
          <div style="width:${(d.pct / maxPct * 100).toFixed(1)}%;height:100%;background:${d.color};border-radius:3px"></div>
        </div>
        <div style="font-size:10.5px;font-weight:600;color:${d.color};text-align:right">${fmtNum(d.count)} (${fmtNum(d.pct, 1)}%)</div>
      </div>`).join('');
    return `<div style="border:1px solid var(--bdr);border-radius:8px;padding:12px">
      <div style="font-size:12.5px;font-weight:700;margin-bottom:2px">${esc(o.name)}</div>
      <div style="font-size:10.5px;color:var(--tx3);margin-bottom:8px">NCD รวม ${fmtNum(totalNcd)} ราย จาก ${fmtNum(o.totalStaff)} คน (${fmtNum(totalNcd / (o.totalStaff || 1) * 100, 1)}%)</div>
      ${bars}
    </div>`;
  }).join('');

  const colCount = Math.min(orgData.length, 3);
  container.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>🏥 NCD Breakdown — 8 โรคหลัก</h3>
        <span style="font-size:11px;color:var(--tx3)">% ต่อบุคลากรทั้งหมด · scale ร่วมทุกองค์กร</span>
      </div>
      <div style="padding:14px 18px;display:grid;grid-template-columns:repeat(${colCount},1fr);gap:10px">
        ${grid}
      </div>
    </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// HR System Matrix — ✅ / ❌ / 🚧 per system
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderHrMatrix(metrics) {
  const container = document.getElementById('cmp-hr-matrix');
  if (!container) return;

  const SYSTEMS = [
    { key: 'mentoring_system',   label: 'ระบบพี่เลี้ยง (Mentoring)' },
    { key: 'job_rotation',       label: 'Job Rotation' },
    { key: 'idp_system',         label: 'ระบบ IDP (แผนพัฒนารายบุคคล)' },
    { key: 'career_path_system', label: 'Career Path' },
    { key: 'ergonomics_status',  label: 'Ergonomics / สภาพแวดล้อมการทำงาน' },
  ];

  // Parse status value → {icon, label, color}
  const parseStatus = (val) => {
    if (val == null || val === '') return { icon: '—', label: 'ไม่ระบุ', color: '#9CA3AF' };
    const v = String(val).toLowerCase();
    if (['yes', 'true', 'done', 'มี', 'มีครบ', 'complete'].includes(v)) return { icon: '✅', label: 'มี', color: '#059669' };
    if (['no', 'false', 'ไม่มี', 'none'].includes(v)) return { icon: '❌', label: 'ไม่มี', color: '#B91C1C' };
    if (['planned', 'plan', 'กำลังวางแผน', 'in_progress', 'in progress', 'กำลังดำเนินการ', 'wip', 'partial', 'บางส่วน', 'some'].includes(v)) return { icon: '🚧', label: v.includes('plan') ? 'วางแผน' : 'บางส่วน', color: '#D97706' };
    return { icon: '📋', label: val, color: '#0F4C81' };
  };

  const orgData = metrics.map((m) => ({ name: m.name, ch1: _cmpGetCh1Data(m.name) }));
  if (orgData.every((o) => !o.ch1)) {
    container.innerHTML = `<div class="card"><div class="card-head"><h3>✅ HR System Matrix</h3></div>
      <div style="padding:24px;text-align:center;color:var(--tx3)">องค์กรที่เลือกยังไม่มีข้อมูล Ch1</div></div>`;
    return;
  }

  const palette = _cmpPalette();
  const headCols = orgData.map((o, i) =>
    `<th style="text-align:center;min-width:110px;border-top:3px solid ${palette[i]};color:${palette[i]};font-size:11px" title="${esc(o.name)}">${esc(_cmpAbbr(o.name, 14))}</th>`
  ).join('');

  // Core system rows
  const rows = SYSTEMS.map((sys) => {
    const cells = orgData.map((o) => {
      if (!o.ch1) return `<td style="text-align:center;color:var(--tx3);font-size:11px">—</td>`;
      const { icon, label, color } = parseStatus(o.ch1[sys.key]);
      return `<td style="text-align:center;padding:10px 8px">
        <div style="font-size:18px">${icon}</div>
        <div style="font-size:10px;color:${color};font-weight:600">${esc(label)}</div>
      </td>`;
    }).join('');
    return `<tr><td style="padding:10px 12px;font-size:12px;font-weight:500">${sys.label}</td>${cells}</tr>`;
  }).join('');

  // Digital systems (array)
  const digitalRow = `<tr>
    <td style="padding:10px 12px;font-size:12px;font-weight:500;vertical-align:top">ระบบดิจิทัล (Digital Systems)</td>
    ${orgData.map((o) => {
      if (!o.ch1) return `<td style="text-align:center;color:var(--tx3);font-size:11px">—</td>`;
      const ds = o.ch1.digital_systems;
      if (!ds || (Array.isArray(ds) && ds.length === 0)) {
        return `<td style="text-align:center"><div style="font-size:18px">❌</div><div style="font-size:10px;color:#B91C1C;font-weight:600">ไม่มี</div></td>`;
      }
      const list = Array.isArray(ds) ? ds : String(ds).split(',').map((s) => s.trim()).filter(Boolean);
      return `<td style="padding:8px;text-align:center">
        <div style="font-size:18px;margin-bottom:4px">✅</div>
        <div style="font-size:10px;color:#059669;font-weight:600;margin-bottom:4px">${list.length} ระบบ</div>
        <div style="font-size:9.5px;color:var(--tx3);line-height:1.4;text-align:left">${list.map((x) => '• ' + esc(x)).join('<br>')}</div>
      </td>`;
    }).join('')}
  </tr>`;

  // "Maturity score" row — count ✅ and 🚧 as 1 and 0.5
  const scoreRow = `<tr style="background:#F8FAFC">
    <td style="padding:10px 12px;font-size:12px;font-weight:700">📊 คะแนนความพร้อม</td>
    ${orgData.map((o) => {
      if (!o.ch1) return `<td style="text-align:center;color:var(--tx3);font-size:11px">—</td>`;
      let score = 0;
      SYSTEMS.forEach((s) => {
        const { icon } = parseStatus(o.ch1[s.key]);
        if (icon === '✅') score += 1;
        else if (icon === '🚧') score += 0.5;
      });
      const ds = o.ch1.digital_systems;
      if (ds && (Array.isArray(ds) ? ds.length : String(ds).length) > 0) score += 1;
      const pct = (score / (SYSTEMS.length + 1)) * 100;
      const color = pct >= 75 ? '#059669' : pct >= 50 ? '#D97706' : '#B91C1C';
      return `<td style="text-align:center;padding:10px 8px">
        <div style="font-size:16px;font-weight:700;color:${color}">${fmtNum(score, 1)} / ${SYSTEMS.length + 1}</div>
        <div style="font-size:10px;color:${color}">${fmtNum(pct, 0)}%</div>
      </td>`;
    }).join('')}
  </tr>`;

  container.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>✅ HR System Matrix</h3>
        <span style="font-size:11px;color:var(--tx3)">✅ มี · 🚧 กำลังดำเนินการ/บางส่วน · ❌ ไม่มี</span>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th style="text-align:left;min-width:200px;padding:10px 12px">ระบบ</th>${headCols}</tr></thead>
          <tbody>${rows}${digitalRow}${scoreRow}</tbody>
        </table>
      </div>
    </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Gap Analysis — gap จากค่าเฉลี่ย + suggested priorities
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderGap(metrics, bench) {
  const container = document.getElementById('cmp-gap');
  if (!container) return;

  // Use a subset: most actionable KPIs
  const GAP_METRICS = CMP_METRICS.filter((d) => [
    'phqHighPct', 'gadHighPct', 'burnout', 'engagementWb', 'wlb',
    'ncdPct', 'sickLeaveAvg', 'turnover2568', 'responseRate',
  ].includes(d.key));

  const palette = _cmpPalette();

  const orgPanels = metrics.map((m, idx) => {
    const color = palette[idx];
    const gaps = GAP_METRICS.map((def) => {
      const val = m[def.key];
      const refVal = bench[def.key];
      if (val == null || refVal == null || isNaN(val) || isNaN(refVal) || refVal === 0) return null;
      const diff = val - refVal;
      const diffPct = (diff / Math.abs(refVal)) * 100;
      // "good" if direction aligns
      const isBetter = (def.goodDir === 1 && diff > 0) || (def.goodDir === -1 && diff < 0);
      const isWorse = (def.goodDir === 1 && diff < 0) || (def.goodDir === -1 && diff > 0);
      return { def, val, refVal, diff, diffPct, isBetter, isWorse };
    }).filter(Boolean);

    // Top 3 strengths (isBetter, sorted by |diffPct| desc)
    const strengths = gaps.filter((g) => g.isBetter).sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct)).slice(0, 3);
    // Top 3 weaknesses (isWorse, sorted by |diffPct| desc)
    const weaknesses = gaps.filter((g) => g.isWorse).sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct)).slice(0, 3);

    const renderList = (items, emptyText, goodSide) => {
      if (!items.length) return `<div style="font-size:11px;color:var(--tx3);font-style:italic;padding:6px 0">${emptyText}</div>`;
      return items.map((g) => {
        const arrow = goodSide ? '▲' : '▼';
        const c = goodSide ? '#059669' : '#B91C1C';
        return `<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px solid var(--bg2);font-size:11.5px">
          <div style="flex:1">${esc(g.def.label)}</div>
          <div style="text-align:right">
            <div style="font-weight:700;color:${c}">${arrow} ${fmtNum(Math.abs(g.diffPct), 1)}%</div>
            <div style="font-size:10px;color:var(--tx3)">${g.def.fmt(g.val)} vs ${g.def.fmt(g.refVal)}</div>
          </div>
        </div>`;
      }).join('');
    };

    // Priority suggestion
    let suggestion = 'ไม่มีข้อแนะนำเฉพาะ';
    if (weaknesses.length) {
      const top = weaknesses[0];
      const suggestions = {
        phqHighPct:   'เพิ่มโปรแกรม mental health support / ปรึกษาจิตแพทย์',
        gadHighPct:   'กิจกรรมลดความเครียด · mindfulness · จัดการภาระงาน',
        burnout:      'ทบทวน workload · เพิ่ม rest day · ปรับ job design',
        engagementWb: 'Employee recognition · career path · feedback culture',
        wlb:          'Flexible work · ลดการประชุมนอกเวลา · ส่งเสริมการลา',
        ncdPct:       'โปรแกรมสุขภาพ · ตรวจสุขภาพประจำปี · แคมเปญ NCD',
        sickLeaveAvg: 'ส่งเสริมสุขภาพเชิงรุก · คลินิกในองค์กร',
        turnover2568: 'Exit interview · ปรับระบบ career path · retention bonus',
        responseRate: 'สื่อสารชัดเจน · ประชาสัมพันธ์หลายช่องทาง · ผู้บริหารหนุน',
      };
      suggestion = suggestions[top.def.key] || 'พิจารณามาตรการเฉพาะด้าน';
    }

    return `
      <div style="border:1px solid var(--bdr);border-top:3px solid ${color};border-radius:10px;padding:14px">
        <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:10px">${esc(m.name)}</div>

        <div style="font-size:11px;font-weight:600;color:#059669;margin-bottom:4px">💪 จุดแข็ง (ดีกว่าค่าเฉลี่ย)</div>
        ${renderList(strengths, 'ไม่มีตัวชี้วัดที่ดีกว่าเฉลี่ย', true)}

        <div style="font-size:11px;font-weight:600;color:#B91C1C;margin-top:12px;margin-bottom:4px">⚠️ จุดที่ควรปรับปรุง</div>
        ${renderList(weaknesses, 'ไม่มีจุดที่ต่ำกว่าเฉลี่ย', false)}

        ${weaknesses.length ? `<div style="margin-top:12px;padding:10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:4px;font-size:11px;line-height:1.5">
          <div style="font-weight:700;color:#92400E;margin-bottom:3px">🎯 ข้อเสนอแนะ Priority #1:</div>
          <div style="color:#78350F">${esc(suggestion)}</div>
        </div>` : ''}
      </div>`;
  }).join('');

  const cols = Math.min(metrics.length, 3);
  container.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>📉 Gap Analysis — จุดแข็ง / จุดควรปรับปรุง</h3>
        <span style="font-size:11px;color:var(--tx3)">เทียบ % ความเบี่ยงเบนจากค่าเฉลี่ยทุกองค์กร</span>
      </div>
      <div style="padding:14px 18px;display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px">
        ${orgPanels}
      </div>
    </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Ranking Table — all orgs ranked, selected orgs highlighted
// ───────────────────────────────────────────────────────────────────────────
function cmpRenderRanking(metrics, bench) {
  const container = document.getElementById('cmp-ranking');
  if (!container) return;

  const selectableMetrics = CMP_METRICS.filter((d) => d.goodDir !== 0);
  const currentKey = cmpState.rankingMetric || 'engagementWb';
  const def = selectableMetrics.find((d) => d.key === currentKey) || selectableMetrics[0];

  const options = selectableMetrics.map((d) =>
    `<option value="${d.key}" ${d.key === def.key ? 'selected' : ''}>${d.label}</option>`
  ).join('');

  // Rank ALL orgs
  const allOrgs = (getOrgCatalog() || []).map((o) => o.name).map(cmpComputeMetricsForOrg);
  const ranked = allOrgs
    .map((m) => ({ name: m.name, ministry: m.ministry, val: m[def.key] }))
    .filter((r) => r.val != null && !isNaN(r.val))
    .sort((a, b) => def.goodDir === 1 ? b.val - a.val : a.val - b.val);

  const selectedSet = new Set(cmpState.selected);
  const palette = _cmpPalette();
  const nameToColorIdx = new Map(cmpState.selected.map((n, i) => [n, i]));

  const total = ranked.length;
  const topThreshold = Math.ceil(total * 0.2); // top 20%
  const bottomThreshold = Math.floor(total * 0.8); // bottom 20%

  const rows = ranked.map((r, i) => {
    const rank = i + 1;
    const isSelected = selectedSet.has(r.name);
    const color = isSelected ? palette[nameToColorIdx.get(r.name)] : null;

    let badge = '';
    if (rank <= 3) badge = `<span style="background:#DCFCE7;color:#166534;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:700">🥇 TOP ${rank}</span>`;
    else if (rank <= topThreshold) badge = `<span style="background:#ECFDF5;color:#047857;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600">Top 20%</span>`;
    else if (rank > bottomThreshold) badge = `<span style="background:#FEF2F2;color:#B91C1C;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600">Bottom 20%</span>`;

    const selectedStyle = isSelected
      ? `background:${color}11;border-left:4px solid ${color}`
      : '';

    return `<tr style="${selectedStyle}">
      <td style="text-align:center;font-weight:700;color:var(--tx3);padding:10px 8px">${rank}</td>
      <td style="padding:10px 8px">
        <div style="font-weight:${isSelected ? 700 : 500};color:${color || 'var(--tx)'}">${esc(r.name)}${isSelected ? ' ⭐' : ''}</div>
        <div style="font-size:10px;color:var(--tx3)">${esc(r.ministry || '—')}</div>
      </td>
      <td style="text-align:right;font-weight:700;padding:10px 8px;color:${color || 'var(--tx)'}">${def.fmt(r.val)}</td>
      <td style="text-align:center;padding:10px 8px">${badge}</td>
    </tr>`;
  }).join('');

  const benchDisplay = bench[def.key] != null ? def.fmt(bench[def.key]) : '—';

  container.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>🏆 Ranking — จัดอันดับองค์กรทั้งหมด</h3>
        <select id="cmp-ranking-select" class="sel" onchange="cmpRankingChange(this.value)" style="max-width:260px">${options}</select>
      </div>
      <div style="padding:8px 18px 0;font-size:11px;color:var(--tx3)">
        ทั้งหมด ${total} องค์กร · ค่าเฉลี่ย: <b>${benchDisplay}</b> · ${def.goodDir === 1 ? 'สูง = ดี (เรียงจากมากไปน้อย)' : 'ต่ำ = ดี (เรียงจากน้อยไปมาก)'}
      </div>
      <div class="tbl-wrap" style="max-height:440px;overflow-y:auto">
        <table>
          <thead style="position:sticky;top:0;background:#fff;z-index:1">
            <tr>
              <th style="width:50px;text-align:center">#</th>
              <th style="text-align:left">องค์กร</th>
              <th style="text-align:right;width:140px">${esc(def.label)}</th>
              <th style="text-align:center;width:120px">สถานะ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function cmpRankingChange(key) {
  cmpState.rankingMetric = key;
  const metrics = cmpState.selected.map(cmpComputeMetricsForOrg);
  const bench = cmpComputeBenchmark();
  cmpRenderRanking(metrics, bench);
}
