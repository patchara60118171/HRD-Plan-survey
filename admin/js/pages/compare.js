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
