/* ========== ADMIN PORTAL — WELLBEING ANALYTICS PAGE ========== */

function renderAnalytics(summary) {
  const allRows = state.surveyRows || [];
  const submitted = allRows.filter(r => !r.is_draft);
  console.log('[Analytics] surveyRows total:', allRows.length, '| non-draft:', submitted.length);

  _anwbPopulateOrgList(submitted);
  const selected = anwbGetSelectedOrgs();
  const rows = selected == null
    ? submitted
    : (selected.length ? submitted.filter(r => selected.includes(r.organization || r.org)) : []);

  const emptyEl = document.getElementById('anwb-empty');
  const contentEl = document.getElementById('anwb-content');

  // Always hide loading/empty first
  if (emptyEl) emptyEl.style.display = 'none';

  if (!rows.length) {
    let msg;
    if (!allRows.length) msg = '⚠️ ยังไม่มีข้อมูล Wellbeing Survey';
    else if (!submitted.length) msg = '⚠️ ข้อมูลทั้งหมดเป็น Draft ยังไม่มีการ Submit จริง';
    else msg = '⚠️ ไม่มีข้อมูลสำหรับองค์กรที่เลือก';
    if (emptyEl) { emptyEl.style.display = ''; emptyEl.textContent = msg; }
    if (contentEl) contentEl.style.display = 'none';
    return;
  }
  if (contentEl) contentEl.style.display = '';

  _anwbRenderKPICards(rows);
  _anwbRenderDistributions(rows);
  _anwbRenderDemographics(rows);
  _anwbRenderRiskSignals(rows);
  _anwbRenderNcd(rows);
  _anwbRenderBmiWhr(rows);
  _anwbRenderSubstance(rows);
  _anwbRenderNutrition(rows);
  _anwbRenderTpax(rows);
  _anwbRenderSedentary(rows);
  _anwbRenderTmhiDeep(rows);
  _anwbRenderLoneliness(rows);
  _anwbRenderSafety(rows);
  _anwbRenderQol(rows);
  _anwbRenderEnv(rows);
  _anwbRenderPollution(rows);
}

function anwbSwitchTab(tab) {
  document.querySelectorAll('.anwb-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.anwb-tab-panel').forEach(p => { p.style.display = p.id === `anwb-panel-${tab}` ? '' : 'none'; });
}

/* ── Org multi-select filter (mirrors CH1 pattern) ──────────────── */
function _anwbPopulateOrgList(submitted) {
  const orgList = document.getElementById('anwb-org-list');
  if (!orgList) return;
  const orgs = [...new Set((submitted || []).map(r => r.organization || r.org).filter(Boolean))].sort();
  const existing = [...orgList.querySelectorAll('input[type="checkbox"]')].map(cb => cb.value).sort();
  // Only rebuild when the org set changes
  if (existing.length === orgs.length && existing.every((v, i) => v === orgs[i])) return;
  orgList.innerHTML = orgs.map(org =>
    `<label class="org-check-item"><input type="checkbox" value="${esc(org)}" checked onchange="anwbOrgCheckOne()"> <span>${esc(org)}</span></label>`
  ).join('');
  anwbUpdateOrgLabel();
}

function anwbToggleOrgDropdown() {
  const dd = document.getElementById('anwb-org-dropdown');
  if (dd) dd.classList.toggle('show');
}

function anwbOrgCheckAll(allCb) {
  document.querySelectorAll('#anwb-org-list input[type="checkbox"]').forEach(cb => { cb.checked = allCb.checked; });
  anwbUpdateOrgLabel();
  renderAnalytics();
}

function anwbOrgCheckOne() {
  const boxes = [...document.querySelectorAll('#anwb-org-list input[type="checkbox"]')];
  const allCb = document.querySelector('#anwb-org-dropdown > label input[type="checkbox"]');
  if (allCb) allCb.checked = boxes.length > 0 && boxes.every(cb => cb.checked);
  anwbUpdateOrgLabel();
  renderAnalytics();
}

function anwbUpdateOrgLabel() {
  const btn = document.getElementById('anwb-org-toggle');
  if (!btn) return;
  const sel = anwbGetSelectedOrgs();
  if (sel == null) btn.textContent = 'ทุกองค์กร ▾';
  else if (sel.length === 0) btn.textContent = '(ไม่ได้เลือก) ▾';
  else if (sel.length === 1) btn.textContent = sel[0] + ' ▾';
  else btn.textContent = sel.length + ' องค์กร ▾';
}

function anwbGetSelectedOrgs() {
  const allCb = document.querySelector('#anwb-org-dropdown > label input[type="checkbox"]');
  if (!document.getElementById('anwb-org-list')) return null;
  if (allCb && allCb.checked) return null;
  return [...document.querySelectorAll('#anwb-org-list input[type="checkbox"]:checked')].map(cb => cb.value);
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('anwb-org-dropdown');
  const btn = document.getElementById('anwb-org-toggle');
  if (!wrap || !btn) return;
  if (!wrap.classList.contains('show')) return;
  if (wrap.contains(e.target) || btn.contains(e.target)) return;
  wrap.classList.remove('show');
});

/* ── KPI summary bar ───────────────────────────────────────────── */
function _anwbRenderKPICards(rows) {
  const n = rows.length;
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !Number.isNaN(getTmhi(r)));
  const avgTmhi = _avg(tmhiRows, r => getTmhi(r));
  const tmhiMeta = getTmhiLevelMeta(avgTmhi);
  const tmhiLowCount = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'poor').length;

  _setHtml('anwb-kpi', `
    <div class="anwb-kpi-grid">
      ${_kpiCard('👥 ผู้ตอบทั้งหมด', fmtNum(n) + ' คน', '', '#0F4C81')}
      ${_kpiCard('🫶 TMHI-15 เฉลี่ย', fmtNum(avgTmhi, 1), tmhiMeta.shortLabel, tmhiMeta.color)}
      ${_kpiCard('🟠 TMHI ต่ำกว่าคนทั่วไป', fmtNum(tmhiLowCount) + ' คน', fmtNum(tmhiRows.length ? (tmhiLowCount / tmhiRows.length) * 100 : 0, 1) + '% ของผู้มีคะแนน TMHI', tmhiLowCount > 0 ? '#DC2626' : '#059669')}
    </div>`);
}

/* ── Distribution chart: TMHI-15 ─────────────────────────────── */
function _anwbRenderDistributions(rows) {
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !Number.isNaN(getTmhi(r)));
  const tmhiBands = [
    { label: 'ต่ำกว่าคนทั่วไป (< 43)', min: 0, max: 42.999, color: '#DC2626' },
    { label: 'เท่ากับคนทั่วไป (44–50)', min: 44, max: 50, color: '#D97706' },
    { label: 'ดีกว่าคนทั่วไป (51–60)', min: 51, max: 60, color: '#059669' },
  ];
  const tmhiData = _bandCount(tmhiRows, r => getTmhi(r), tmhiBands);
  const tmhiInsights = _tmhiInsights(tmhiRows);

  _setHtml('anwb-dist', `
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>🫶 TMHI-15 การแปลผลตามเฉลย</h3></div><div class="card-body">${_barChart(tmhiData, tmhiRows.length)}<div style="margin-top:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;font-size:12px;line-height:1.7"><div style="font-weight:700;color:#0F4C81;margin-bottom:6px">เกณฑ์ที่ใช้จากไฟล์เฉลย</div><div>51–60 คะแนน = สุขภาพจิตดีกว่าคนทั่วไป</div><div>44–50 คะแนน = สุขภาพจิตเท่ากับคนทั่วไป</div><div>ต่ำกว่า 43 คะแนน = สุขภาพจิตต่ำกว่าคนทั่วไป</div><div style="margin-top:8px;color:#475569">${esc(tmhiInsights)}</div></div></div></div>
    </div>`);
}

/* ── Demographics: Age, Gender, BMI ────────────────────────────── */
function _anwbRenderDemographics(rows) {
  const ageCounts = _groupCount(rows, r => ageGroup(r));
  const genderCounts = _groupCount(rows, r => {
    const g = String(r.gender || '').toLowerCase();
    if (g === 'male' || g === 'ชาย' || g === 'm') return 'ชาย';
    if (g === 'female' || g === 'หญิง' || g === 'f') return 'หญิง';
    return 'ไม่ระบุ';
  });
  // ใช้ getBmiAsean() (สเปก WELLBEING_SCORING_REFERENCE.md) แทน r.bmi_category ที่เก็บใน DB
  // เพื่อให้ label ตรงตามเอกสาร (น้ำหนักน้อย / สมส่วน / น้ำหนักเกิน / อ้วนระดับ 1 / อ้วนระดับ 2)
  const bmiCounts = _groupCount(rows, r => getBmiAsean(r)?.label || '—');

  const ageColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const genderColors = ['#6366F1', '#EC4899', '#9CA3AF'];
  const bmiColors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#9CA3AF'];

  _setHtml('anwb-demo', `
    <div class="anwb-3col">
      <div class="card"><div class="card-head"><h3>👥 กลุ่มอายุ</h3></div><div class="card-body">${_donutChart(ageCounts, rows.length, ageColors)}</div></div>
      <div class="card"><div class="card-head"><h3>⚧ เพศ</h3></div><div class="card-body">${_donutChart(genderCounts, rows.length, genderColors)}</div></div>
      <div class="card"><div class="card-head"><h3>⚖️ BMI กลุ่ม</h3></div><div class="card-body">${_donutChart(bmiCounts, rows.length, bmiColors)}</div></div>
    </div>`);
}

/* ── Risk Signals ──────────────────────────────────────────────── */
function _anwbRenderRiskSignals(rows) {
  const n = rows.length;
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !Number.isNaN(getTmhi(r)));
  const lowTmhi = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'poor').length;
  const poorSleep = rows.filter(r => { const s = parseFloat(getSleep(r)); return !isNaN(s) && s < 6; }).length;
  const noExercise = rows.filter(r => {
    const e = String(getExercise(r) || '').toLowerCase();
    return e.includes('ไม่') || e === '0' || e === 'none' || e === 'never';
  }).length;

  // Top problems
  const probCounts = {};
  rows.forEach(r => {
    const p = getMainProblem(r);
    if (p && p !== '—') probCounts[p] = (probCounts[p] || 0) + 1;
  });
  const topProbs = Object.entries(probCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const riskItems = [
    { label: 'TMHI ต่ำกว่าคนทั่วไป', n: lowTmhi, color: '#DC2626' },
    { label: 'นอนหลับ < 6 ชั่วโมง', n: poorSleep, color: '#8B5CF6' },
    { label: 'ไม่ออกกำลังกาย', n: noExercise, color: '#6B7280' },
  ];

  const riskBars = riskItems.map(item => {
    const pct = n ? Math.round(item.n / n * 100) : 0;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span>${esc(item.label)}</span>
        <span style="font-weight:600;color:${item.color}">${fmtNum(item.n)} คน (${pct}%)</span>
      </div>
      <div style="background:#F3F4F6;border-radius:4px;height:8px">
        <div style="background:${item.color};width:${pct}%;height:8px;border-radius:4px;transition:width .4s"></div>
      </div>
    </div>`;
  }).join('');

  const probBars = topProbs.length ? topProbs.map(([prob, cnt], i) => {
    const pct = n ? Math.round(cnt / n * 100) : 0;
    const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#6366F1'];
    return `<div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span>${esc(prob)}</span><span style="font-weight:600">${fmtNum(cnt)} คน</span>
      </div>
      <div style="background:#F3F4F6;border-radius:4px;height:7px">
        <div style="background:${colors[i % colors.length]};width:${Math.max(pct, 1)}%;height:7px;border-radius:4px"></div>
      </div>
    </div>`;
  }).join('') : '<div style="color:var(--tx3);font-size:12px">ยังไม่มีข้อมูล</div>';

  _setHtml('anwb-risk', `
    <div class="anwb-2col">
      <div class="card">
        <div class="card-head"><h3>🚨 สัญญาณเสี่ยง</h3></div>
        <div class="card-body" style="padding:16px">${riskBars}</div>
      </div>
      <div class="card">
        <div class="card-head"><h3>📋 ปัญหาหลักที่รายงาน (Top 8)</h3></div>
        <div class="card-body" style="padding:16px">${probBars}</div>
      </div>
    </div>`);
}

/* ── Helper functions ─────────────────────────────────────────── */
function _avg(rows, fn) {
  const vals = rows.map(fn).filter(v => v != null && !isNaN(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function _bandCount(rows, fn, bands) {
  const n = rows.length;
  return bands.map(b => {
    const count = rows.filter(r => { const v = fn(r); return v != null && v >= b.min && v <= b.max; }).length;
    return { label: b.label, count, color: b.color, pct: n ? count / n * 100 : 0 };
  });
}

function _groupCount(rows, fn) {
  const map = {};
  rows.forEach(r => { const k = fn(r); map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function _tmhiInsights(rows) {
  if (!rows.length) return 'ยังไม่มีข้อมูล TMHI-15 เพียงพอสำหรับการสรุปผล';
  const counts = rows.reduce((acc, row) => {
    const key = getTmhiLevelMeta(getTmhi(row)).key;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const labels = {
    good: 'กลุ่มคะแนนสุขภาพจิตดีกว่าคนทั่วไปมีสัดส่วนมากที่สุด',
    average: 'กลุ่มคะแนนสุขภาพจิตเท่ากับคนทั่วไปมีสัดส่วนมากที่สุด',
    poor: 'กลุ่มคะแนนสุขภาพจิตต่ำกว่าคนทั่วไปมีสัดส่วนมากที่สุด'
  };
  return labels[top?.[0]] || 'ยังไม่สามารถสรุปการกระจายคะแนนสุขภาพจิตได้';
}

function _barChart(data, total) {
  if (!data.length) return '<div style="color:var(--tx3);font-size:12px">ไม่มีข้อมูล</div>';
  const maxPct = Math.max(...data.map(d => d.pct), 1);
  return data.map(d => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span>${esc(d.label)}</span>
        <span style="font-weight:600">${fmtNum(d.count)} คน (${fmtNum(d.pct, 1)}%)</span>
      </div>
      <div style="background:#F3F4F6;border-radius:4px;height:10px">
        <div style="background:${d.color};width:${(d.pct/maxPct*100).toFixed(1)}%;height:10px;border-radius:4px;transition:width .4s"></div>
      </div>
    </div>`).join('');
}

function _donutChart(entries, total, colors) {
  if (!entries.length) return '<div style="color:var(--tx3);font-size:12px">ไม่มีข้อมูล</div>';
  const legend = entries.map(([label, count], i) => {
    const pct = total ? (count / total * 100).toFixed(1) : 0;
    const color = colors[i % colors.length];
    return `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:6px">
      <div style="width:12px;height:12px;border-radius:3px;background:${color};flex-shrink:0"></div>
      <span style="flex:1">${esc(label)}</span>
      <span style="font-weight:600">${fmtNum(count)} (${pct}%)</span>
    </div>`;
  }).join('');

  // SVG donut
  const r = 42, cx = 50, cy = 50, stroke = 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = entries.map(([, count], i) => {
    const pct = total ? count / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${-offset.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
    return slice;
  }).join('');

  return `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    <svg width="100" height="100" viewBox="0 0 100 100">${slices}</svg>
    <div style="flex:1;min-width:120px">${legend}</div>
  </div>`;
}

function _heatColor(heat) {
  // heat 0=green, 0.5=yellow, 1=red
  const r = heat < 0.5 ? Math.round(heat * 2 * 220) : 220;
  const g = heat < 0.5 ? 180 : Math.round((1 - heat) * 2 * 180);
  const a = 0.25 + heat * 0.5;
  return `rgba(${r},${g},60,${a.toFixed(2)})`;
}

function _kpiCard(label, value, sub, color) {
  return `<div class="anwb-kpi-card" style="border-top:3px solid ${color}">
    <div style="font-size:11px;color:var(--tx3);margin-bottom:4px">${label}</div>
    <div style="font-size:22px;font-weight:700;color:${color}">${value}</div>
    ${sub ? `<div style="font-size:11px;color:var(--tx2);margin-top:2px">${sub}</div>` : ''}
  </div>`;
}

function _phqLabel(v) {
  if (v == null) return '';
  if (v < 5) return 'ปกติ';
  if (v < 10) return 'เล็กน้อย';
  if (v < 15) return 'ปานกลาง';
  if (v < 20) return 'ค่อนข้างรุนแรง';
  return 'รุนแรง';
}

function _gadLabel(v) {
  if (v == null) return '';
  if (v < 5) return 'ปกติ';
  if (v < 10) return 'เล็กน้อย';
  if (v < 15) return 'ปานกลาง';
  return 'รุนแรง';
}

function _setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}


// ─── Analytics: Ch1 + Wellbeing (moved from admin.html inline script) ────────
function _renderAnalyticsCh1(summary) {
  const ch1Page = document.getElementById('page-an-ch1');
  const totalCh1Staff = state.ch1Rows.reduce((sum, row) => sum + Number(row.total_personnel || row.total_staff || row.form_data?.total_personnel || 0), 0);
  const ch1Kpis = ch1Page.querySelectorAll('.kpi .kpi-val');
  if (ch1Kpis.length >= 4) {
    ch1Kpis[0].textContent = fmtNum(totalCh1Staff);
    ch1Kpis[1].textContent = fmtNum(state.ch1Rows.length ? (state.ch1Rows.reduce((sum, row) => sum + (parseFloat(row.ncd_ratio_pct ?? row.form_data?.ncd_ratio_pct) || 0), 0) / state.ch1Rows.length) : 0, 1) + '%';
    ch1Kpis[2].textContent = fmtNum(state.ch1Rows.length ? (state.ch1Rows.reduce((sum, row) => sum + (parseFloat(row.mental_burnout ?? row.form_data?.mental_burnout) || 0), 0) / state.ch1Rows.length) : 0, 1) + '%';
    ch1Kpis[3].textContent = fmtNum(state.ch1Rows.length ? (state.ch1Rows.reduce((sum, row) => sum + (parseFloat(row.engagement_score ?? row.form_data?.engagement_score) || 0), 0) / state.ch1Rows.length) : 0, 1);
  }

  const submitted = state.surveyRows.filter((row) => !row.is_draft);
  const activeOrgs = summary.filter((org) => org.wellbeingSubmitted > 0).length;
  const subEl = document.getElementById('an-wb-sub');
  if (subEl) subEl.textContent = `ผลการสำรวจรายบุคคล ${fmtNum(submitted.length)} คน จาก ${fmtNum(activeOrgs)} องค์กร`;

  // Populate org filter dropdown
  const orgFilter = document.getElementById('wba-org-filter');
  if (orgFilter && orgFilter.options.length <= 1) {
    const orgs = [...new Set(submitted.map((r) => r.organization || r.org).filter(Boolean))].sort();
    orgs.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o; opt.textContent = o;
      orgFilter.appendChild(opt);
    });
  }

  renderWbAnalytics();
}

function renderWbAnalytics() {
  const submitted = state.surveyRows.filter((r) => !r.is_draft);
  const orgSel = (document.getElementById('wba-org-filter') || {}).value || '';
  const genderSel = (document.getElementById('wba-gender-filter') || {}).value || '';

  const rows = submitted.filter((r) => {
    if (orgSel && (r.organization || r.org) !== orgSel) return false;
    if (genderSel && r.gender !== genderSel) return false;
    return true;
  });

  const n = rows.length;
  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  if (n === 0) {
    setEl('wba-total', '0 คน'); setEl('wba-phq-high', '—'); setEl('wba-gad-high', '—');
    setEl('wba-burnout-avg', '—'); setEl('wba-eng-avg', '—'); setEl('wba-wlb-avg', '—');
    ['wba-phq-dist', 'wba-scores', 'wba-heatmap'].forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = '<span style="color:var(--tx3)">ยังไม่มีข้อมูล</span>'; });
    const tb = document.getElementById('wba-org-table');
    if (tb) tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">ยังไม่มีข้อมูล</td></tr>';
    return;
  }

  const phqHighCount = rows.filter((r) => (getPhq9(r) || 0) >= 10).length;
  const gadHighCount = rows.filter((r) => (getGad7(r) || 0) >= 10).length;
  const avgBurnout = rows.reduce((s, r) => s + (getBurnout(r) || 0), 0) / n;
  const avgEng = rows.reduce((s, r) => s + (getEngagement(r) || 0), 0) / n;
  const avgWlb = rows.reduce((s, r) => s + (getWlb(r) || 0), 0) / n;
  const avgPhq = rows.reduce((s, r) => s + (getPhq9(r) || 0), 0) / n;
  const avgGad = rows.reduce((s, r) => s + (getGad7(r) || 0), 0) / n;

  setEl('wba-total', fmtNum(n) + ' คน');
  setEl('wba-phq-high', fmtNum(phqHighCount) + ' คน (' + fmtNum((phqHighCount / n) * 100, 1) + '%)');
  setEl('wba-gad-high', fmtNum(gadHighCount) + ' คน (' + fmtNum((gadHighCount / n) * 100, 1) + '%)');
  setEl('wba-burnout-avg', fmtNum(avgBurnout, 1));
  setEl('wba-eng-avg', fmtNum(avgEng, 1));
  setEl('wba-wlb-avg', fmtNum(avgWlb, 1));

  // PHQ-9 distribution bars
  const phqDist = document.getElementById('wba-phq-dist');
  if (phqDist) {
    const lvls = [
      { label: 'ปกติ (0–4)', cls: 'hm1', count: rows.filter((r) => (getPhq9(r) || 0) < 5).length },
      { label: 'เล็กน้อย (5–9)', cls: 'hm2', count: rows.filter((r) => { const p = getPhq9(r) || 0; return p >= 5 && p < 10; }).length },
      { label: 'ปานกลาง (10–14)', cls: 'hm3', count: rows.filter((r) => { const p = getPhq9(r) || 0; return p >= 10 && p < 15; }).length },
      { label: 'รุนแรง (≥15)', cls: 'hm5', count: rows.filter((r) => (getPhq9(r) || 0) >= 15).length },
    ];
    phqDist.innerHTML = lvls.map((l) => {
      const pct = fmtNum((l.count / n) * 100, 1);
      return `<div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span>${l.label}</span><span style="font-weight:600">${fmtNum(l.count)} คน (${pct}%)</span>
        </div>
        <div style="background:#F0F2F5;border-radius:4px;height:10px;overflow:hidden">
          <div class="${l.cls}" style="width:${pct}%;height:10px;border-radius:4px;transition:width .4s"></div>
        </div>
      </div>`;
    }).join('');
  }

  // Score summary table
  const scoresEl = document.getElementById('wba-scores');
  if (scoresEl) {
    scoresEl.innerHTML = `<table style="width:100%;font-size:12px;border-collapse:collapse">
      <thead><tr style="border-bottom:1px solid var(--brd)">
        <th style="text-align:left;padding:6px 4px">ตัวชี้วัด</th>
        <th style="text-align:right;padding:6px 4px">เฉลี่ย</th>
        <th style="text-align:right;padding:6px 4px">มีความเสี่ยง (≥10)</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:6px 4px">PHQ-9 (ซึมเศร้า)</td><td style="text-align:right;padding:6px 4px">${fmtNum(avgPhq, 1)}</td><td style="text-align:right;padding:6px 4px;${phqHighCount / n >= 0.2 ? 'color:#991B1B;font-weight:600' : ''}">${fmtNum(phqHighCount)} คน (${fmtNum((phqHighCount / n) * 100, 1)}%)</td></tr>
        <tr><td style="padding:6px 4px">GAD-7 (วิตกกังวล)</td><td style="text-align:right;padding:6px 4px">${fmtNum(avgGad, 1)}</td><td style="text-align:right;padding:6px 4px;${gadHighCount / n >= 0.2 ? 'color:#991B1B;font-weight:600' : ''}">${fmtNum(gadHighCount)} คน (${fmtNum((gadHighCount / n) * 100, 1)}%)</td></tr>
        <tr><td style="padding:6px 4px">Burnout Score</td><td style="text-align:right;padding:6px 4px">${fmtNum(avgBurnout, 1)}</td><td style="text-align:right;padding:6px 4px;color:var(--tx3)">—</td></tr>
        <tr><td style="padding:6px 4px">Engagement Score</td><td style="text-align:right;padding:6px 4px">${fmtNum(avgEng, 1)}</td><td style="text-align:right;padding:6px 4px;color:var(--tx3)">—</td></tr>
        <tr><td style="padding:6px 4px">Work-Life Balance</td><td style="text-align:right;padding:6px 4px">${fmtNum(avgWlb, 1)}</td><td style="text-align:right;padding:6px 4px;color:var(--tx3)">—</td></tr>
      </tbody>
    </table>`;
  }

  // Dynamic heatmap
  const heatmapEl = document.getElementById('wba-heatmap');
  if (heatmapEl) {
    const orgList = [...new Set(rows.map((r) => r.organization || r.org).filter(Boolean))].sort();
    if (orgList.length === 0) {
      heatmapEl.innerHTML = '<span style="color:var(--tx3)">ไม่มีข้อมูลองค์กร</span>';
    } else {
      const hmCls = (val, metric) => {
        if (metric === 'phq') { if (val < 5) return 'hm1'; if (val < 10) return 'hm2'; if (val < 15) return 'hm3'; if (val < 20) return 'hm4'; return 'hm5'; }
        if (metric === 'gad') { if (val < 5) return 'hm1'; if (val < 10) return 'hm2'; if (val < 15) return 'hm3'; return 'hm4'; }
        if (metric === 'burnout') { if (val < 2) return 'hm1'; if (val < 4) return 'hm2'; if (val < 6) return 'hm3'; if (val < 8) return 'hm4'; return 'hm5'; }
        if (metric === 'eng') { if (val >= 75) return 'hm1'; if (val >= 60) return 'hm2'; if (val >= 45) return 'hm3'; if (val >= 30) return 'hm4'; return 'hm5'; }
        if (metric === 'wlb') { if (val >= 7) return 'hm1'; if (val >= 5) return 'hm2'; if (val >= 3) return 'hm3'; if (val >= 1.5) return 'hm4'; return 'hm5'; }
        return 'hm3';
      };
      const abbr = (s) => s && s.length > 6 ? s.substring(0, 6) + '…' : (s || '?');
      const orgData = orgList.map((o) => {
        const orgRows = rows.filter((r) => (r.organization || r.org) === o);
        const m = orgRows.length;
        return {
          name: o,
          phq: m ? orgRows.reduce((s, r) => s + (getPhq9(r) || 0), 0) / m : 0,
          gad: m ? orgRows.reduce((s, r) => s + (getGad7(r) || 0), 0) / m : 0,
          burnout: m ? orgRows.reduce((s, r) => s + (getBurnout(r) || 0), 0) / m : 0,
          eng: m ? orgRows.reduce((s, r) => s + (getEngagement(r) || 0), 0) / m : 0,
          wlb: m ? orgRows.reduce((s, r) => s + (getWlb(r) || 0), 0) / m : 0,
        };
      });
      const metrics = [
        { key: 'phq', label: 'PHQ-9 (ซึมเศร้า)' },
        { key: 'gad', label: 'GAD-7 (วิตกกังวล)' },
        { key: 'burnout', label: 'Burnout' },
        { key: 'eng', label: 'Engagement' },
        { key: 'wlb', label: 'Work-Life Balance' },
      ];
      heatmapEl.innerHTML = `<div style="min-width:${Math.max(520, orgList.length * 42 + 160)}px">
        <div style="display:flex;gap:3px;margin-bottom:8px;padding-left:150px">
          ${orgData.map((o) => `<div style="width:36px;text-align:center;font-size:9px;color:var(--tx3);overflow:hidden;word-break:break-all">${abbr(o.name)}</div>`).join('')}
        </div>
        ${metrics.map((m) => `<div class="hm-row"><div class="hm-label">${m.label}</div><div class="hm-cells">${orgData.map((o) => `<div class="hm ${hmCls(o[m.key], m.key)}">${fmtNum(o[m.key], 1)}</div>`).join('')}</div></div>`).join('')}
        <div style="margin-top:10px;display:flex;gap:8px;align-items:center;font-size:11px;color:var(--tx3);flex-wrap:wrap">
          <div class="hm hm1" style="width:14px;height:14px;font-size:0"></div>ดีมาก
          <div class="hm hm2" style="width:14px;height:14px;font-size:0"></div>ดี
          <div class="hm hm3" style="width:14px;height:14px;font-size:0"></div>ปานกลาง
          <div class="hm hm4" style="width:14px;height:14px;font-size:0"></div>ต้องปรับปรุง
          <div class="hm hm5" style="width:14px;height:14px;font-size:0"></div>วิกฤต
        </div>
      </div>`;
    }
  }

  // Org ranking table
  const tbody = document.getElementById('wba-org-table');
  if (tbody) {
    const orgStats = [...new Set(rows.map((r) => r.organization || r.org).filter(Boolean))].sort().map((o) => {
      const orgRows = rows.filter((r) => (r.organization || r.org) === o);
      const m = orgRows.length;
      const phqAvg = m ? orgRows.reduce((s, r) => s + (getPhq9(r) || 0), 0) / m : 0;
      const phqH = m ? orgRows.filter((r) => (getPhq9(r) || 0) >= 10).length : 0;
      const burnoutAvg = m ? orgRows.reduce((s, r) => s + (getBurnout(r) || 0), 0) / m : 0;
      const engAvg = m ? orgRows.reduce((s, r) => s + (getEngagement(r) || 0), 0) / m : 0;
      return { name: o, count: m, phqAvg, phqHighPct: m ? (phqH / m) * 100 : 0, burnoutAvg, engAvg };
    }).sort((a, b) => b.phqHighPct - a.phqHighPct);

    tbody.innerHTML = orgStats.map((o, i) => `<tr>
      <td>${i + 1}</td>
      <td>${esc(o.name)}</td>
      <td>${fmtNum(o.count)}</td>
      <td class="${o.phqAvg >= 10 ? 'bad' : ''}">${fmtNum(o.phqAvg, 1)}</td>
      <td class="${o.phqHighPct >= 20 ? 'bad' : ''}">${fmtNum(o.phqHighPct, 1)}%</td>
      <td>${fmtNum(o.burnoutAvg, 1)}</td>
      <td>${fmtNum(o.engAvg, 1)}</td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล</td></tr>';
  }
}

/* ================================================================
   EXTENDED DASHBOARD — มิติกาย / ใจ / สังคม / สิ่งแวดล้อม
   ================================================================ */

function _pct(n, total) { return total ? ((n / total) * 100) : 0; }
function _pctStr(n, total) { return fmtNum(_pct(n, total), 1) + '%'; }

function _metricBar(label, count, total, color) {
  const p = _pct(count, total);
  return `<div class="anwb-metric-bar">
    <div class="anwb-metric-bar-label"><span>${esc(label)}</span><span style="font-weight:700;color:${color}">${fmtNum(count)} คน (${fmtNum(p,1)}%)</span></div>
    <div class="anwb-metric-bar-track"><div class="anwb-metric-bar-fill" style="width:${Math.max(p,0.5)}%;background:${color}"></div></div>
  </div>`;
}

function _cardWrap(icon, title, body) {
  return `<div class="card card-mb"><div class="card-head"><h3>${icon} ${esc(title)}</h3></div><div class="card-body" style="padding:14px 16px">${body}</div></div>`;
}

/* ── NCD & โรคประจำตัว ─────────────────────────────────────── */
function _anwbRenderNcd(rows) {
  const n = rows.length;
  const noneCount   = rows.filter(r => getDiseaseCount(r) === 0).length;
  const oneCount    = rows.filter(r => getDiseaseCount(r) === 1).length;
  const multiCount  = rows.filter(r => getDiseaseCount(r) >= 2).length;
  const diseaseNames = ['เบาหวาน','ความดันโลหิตสูง','โรคหัวใจและหลอดเลือด','โรคไต','โรคตับ','มะเร็ง'];
  const diseaseCounts = diseaseNames.map(d => ({
    name: d,
    count: rows.filter(r => getDiseaseList(r).includes(d)).length,
  })).sort((a, b) => b.count - a.count);

  _setHtml('anwb-ncd', _cardWrap('🏥', 'โรคประจำตัว (NCD Risk)', `
    <div class="anwb-kpi-row">
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(noneCount)}</div><div class="anwb-kpi-mini-label">กลุ่มปกติ<br>(ไม่มีโรค)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(oneCount)}</div><div class="anwb-kpi-mini-label">เสี่ยงปานกลาง<br>(1 โรค)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(multiCount)}</div><div class="anwb-kpi-mini-label">เสี่ยงสูง<br>(≥ 2 โรค)</div></div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:8px">ความชุกรายโรค</div>
    ${diseaseCounts.map(d => _metricBar(d.name, d.count, n, '#0F4C81')).join('')}
    <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">* ผู้ตอบ 1 คนอาจมีหลายโรค</div>
  `));
}

/* ── BMI & WHtR ────────────────────────────────────────────── */
function _anwbRenderBmiWhr(rows) {
  const bmiRows  = rows.filter(r => calcBmi(r) != null);
  const whrRows  = rows.filter(r => calcWHtR(r) != null);
  const nb = bmiRows.length;
  const nw = whrRows.length;

  const bmiGroups = [
    { key: 'underweight', label: 'น้ำหนักน้อย (< 18.5)',   color: '#3B82F6' },
    { key: 'normal',      label: 'สมส่วน (18.5–22.9)',     color: '#059669' },
    { key: 'overweight',  label: 'น้ำหนักเกิน (23–24.9)',  color: '#F59E0B' },
    { key: 'obese1',      label: 'อ้วนระดับ 1 (25–29.9)',  color: '#EF4444' },
    { key: 'obese2',      label: 'อ้วนระดับ 2 (≥ 30)',     color: '#991B1B' },
  ].map(g => ({ ...g, count: bmiRows.filter(r => getBmiAsean(r)?.key === g.key).length }));

  const whrNormal = whrRows.filter(r => getWHtRLevel(r)?.key === 'normal').length;
  const whrRisk   = whrRows.filter(r => getWHtRLevel(r)?.key === 'risk').length;
  const avgBmi    = nb ? bmiRows.reduce((s, r) => s + calcBmi(r), 0) / nb : null;
  const avgWhr    = nw ? whrRows.reduce((s, r) => s + calcWHtR(r), 0) / nw : null;

  _setHtml('anwb-bmi', `<div class="anwb-2col">
    ${_cardWrap('⚖️', 'BMI — มาตรฐานอาเซียน (กรมอนามัย)', `
      <div class="anwb-kpi-row" style="margin-bottom:14px">
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${nb ? fmtNum(avgBmi,1) : '—'}</div><div class="anwb-kpi-mini-label">BMI เฉลี่ย</div></div>
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${nb ? fmtNum(_pct(bmiGroups.find(g=>g.key==='normal').count,nb),1) : '—'}%</div><div class="anwb-kpi-mini-label">สมส่วน</div></div>
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${nb ? fmtNum(_pct(bmiGroups.filter(g=>['overweight','obese1','obese2'].includes(g.key)).reduce((s,g)=>s+g.count,0),nb),1) : '—'}%</div><div class="anwb-kpi-mini-label">น้ำหนักเกิน/อ้วน</div></div>
      </div>
      ${bmiGroups.map(g => _metricBar(g.label, g.count, nb, g.color)).join('')}
      <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">เกณฑ์อาเซียน กรมอนามัย กระทรวงสาธารณสุข · มีข้อมูล ${fmtNum(nb)} คน</div>
    `)}
    ${_cardWrap('📏', 'WHtR — อัตราส่วนรอบเอวต่อส่วนสูง', `
      <div class="anwb-kpi-row" style="margin-bottom:14px">
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${nw ? fmtNum(avgWhr,3) : '—'}</div><div class="anwb-kpi-mini-label">WHtR เฉลี่ย</div></div>
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${nw ? fmtNum(_pct(whrNormal,nw),1) : '—'}%</div><div class="anwb-kpi-mini-label">ปกติ (< 0.5)</div></div>
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${nw ? fmtNum(_pct(whrRisk,nw),1) : '—'}%</div><div class="anwb-kpi-mini-label">เสี่ยง (≥ 0.5)</div></div>
      </div>
      ${_metricBar('ปกติ (WHtR < 0.5)', whrNormal, nw, '#059669')}
      ${_metricBar('เริ่มเสี่ยง (WHtR ≥ 0.5)', whrRisk, nw, '#EF4444')}
      <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">รอบเอว (นิ้ว × 2.54 ÷ ส่วนสูง cm) · มีข้อมูล ${fmtNum(nw)} คน</div>
    `)}
  </div>`);
}

/* ── ยาสูบ / แอลกอฮอล์ / สิ่งเสพติด ─────────────────────── */
function _anwbRenderSubstance(rows) {
  const n = rows.length;
  const riskLevels = [
    { key: 'none',   label: 'ไม่มีความเสี่ยง',    color: '#059669' },
    { key: 'low',    label: 'ความเสี่ยงต่ำ',        color: '#F59E0B' },
    { key: 'medium', label: 'ความเสี่ยงปานกลาง',   color: '#D97706' },
    { key: 'high',   label: 'ความเสี่ยงสูง',        color: '#DC2626' },
  ].map(l => ({ ...l, count: rows.filter(r => getSubstanceRisk(r).key === l.key).length }));

  const qLabels = [
    { id: 'q2001', label: 'บุหรี่ (มวน)' },
    { id: 'q2002', label: 'บุหรี่ไฟฟ้า' },
    { id: 'q2003', label: 'แอลกอฮอล์' },
    { id: 'q2004', label: 'กัญชา/เครื่องดื่มกัญชา' },
    { id: 'q2005_drug', label: 'สารเสพติดอื่นๆ' },
  ];
  const _sv = (v) => { const s = String(v||''); if(s.includes('ทุกวัน')||s.includes('เป็นประจำ')) return 3; if(s.includes('2')&&s.includes('3')) return 2; if(s.includes('บางโอกาส')||s.includes('นาน')) return 1; return 0; };
  const segColors = ['#059669','#F59E0B','#D97706','#DC2626'];
  const segLabels = ['ไม่เคย','บางโอกาส','2-3ครั้ง/สัปดาห์','ทุกวัน'];

  const stackedBars = qLabels.map(q => {
    const counts = [0,1,2,3].map(v => rows.filter(r => _sv(r[q.id]) === v).length);
    const segs = counts.map((c, i) => {
      const w = _pct(c, n);
      return w > 0 ? `<div class="anwb-stacked-seg" style="width:${w}%;background:${segColors[i]}" title="${segLabels[i]}: ${fmtNum(c)} คน">${w >= 8 ? fmtNum(c) : ''}</div>` : '';
    }).join('');
    return `<div style="margin-bottom:10px">
      <div style="font-size:11.5px;color:var(--tx2);margin-bottom:4px;font-weight:600">${esc(q.label)}</div>
      <div class="anwb-stacked-bar">${segs}</div>
    </div>`;
  }).join('');

  _setHtml('anwb-substance', _cardWrap('🚬', 'ยาสูบ · แอลกอฮอล์ · สิ่งเสพติด', `
    <div class="anwb-2col">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:8px">ระดับความเสี่ยงรายบุคคล</div>
        ${riskLevels.map(l => _metricBar(l.label, l.count, n, l.color)).join('')}
        <div style="margin-top:8px;font-size:10.5px;color:var(--tx3);line-height:1.6">⚠️ Q2004 (กัญชา) และ Q2005 (สารเสพติด) ถือว่าเสี่ยงสูงทันทีที่มีการใช้</div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:8px">ความถี่รายพฤติกรรม</div>
        ${stackedBars}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          ${segColors.map((c,i) => `<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--tx3)"><div style="width:10px;height:10px;border-radius:2px;background:${c};flex-shrink:0"></div>${esc(segLabels[i])}</div>`).join('')}
        </div>
      </div>
    </div>
  `));
}

/* ── พฤติกรรมบริโภค หวาน / ไขมัน / โซเดียม ─────────────── */
function _anwbRenderNutrition(rows) {
  const n = rows.length;
  const _nutritionStats = (scoreFn, riskFn, type, bands) => {
    const scored = rows.filter(r => scoreFn(r) != null);
    const avg = scored.length ? scored.reduce((s, r) => s + scoreFn(r), 0) / scored.length : null;
    const bandCounts = bands.map(b => ({ ...b, count: scored.filter(r => { const s = scoreFn(r); return s != null && s >= b.min && s <= b.max; }).length }));
    return { avg, scored: scored.length, bandCounts };
  };

  const sweetBands = [{min:5,max:5,label:'เสี่ยงต่ำมาก',color:'#059669'},{min:6,max:9,label:'เสี่ยงปานกลาง',color:'#D97706'},{min:10,max:13,label:'เสี่ยงสูง',color:'#EF4444'},{min:14,max:15,label:'เสี่ยงสูงมาก',color:'#991B1B'}];
  const fatBands   = [{min:5,max:5,label:'เสี่ยงน้อย',color:'#059669'},{min:6,max:9,label:'เสี่ยงปานกลาง',color:'#D97706'},{min:10,max:13,label:'เสี่ยงสูง',color:'#EF4444'},{min:14,max:15,label:'เสี่ยงสูงมาก',color:'#991B1B'}];
  const saltBands  = [{min:5,max:5,label:'โซเดียมน้อย',color:'#059669'},{min:6,max:9,label:'โซเดียมปานกลาง',color:'#D97706'},{min:10,max:13,label:'โซเดียมสูง',color:'#EF4444'},{min:14,max:15,label:'โซเดียมสูงมาก',color:'#991B1B'}];

  const sweet = _nutritionStats(getSweetScore, getSweetRisk, 'sweet', sweetBands);
  const fat   = _nutritionStats(getFatScore,   getFatRisk,   'fat',   fatBands);
  const salt  = _nutritionStats(getSaltScore,  getSaltRisk,  'salt',  saltBands);

  const _nutCard = (icon, title, stat, maxScore) => `
    <div class="anwb-sub-card">
      <h4>${icon} ${esc(title)}</h4>
      <div style="text-align:center;margin-bottom:12px">
        <div style="font-size:24px;font-weight:800;color:var(--P)">${stat.avg != null ? fmtNum(stat.avg,1) : '—'}</div>
        <div style="font-size:10px;color:var(--tx3)">คะแนนเฉลี่ย / ${maxScore}</div>
      </div>
      ${stat.bandCounts.map(b => _metricBar(b.label, b.count, stat.scored, b.color)).join('')}
    </div>`;

  _setHtml('anwb-nutrition', _cardWrap('🍽️', 'พฤติกรรมบริโภค — หวาน · ไขมัน · โซเดียม', `
    <div class="anwb-sub-grid">
      ${_nutCard('🍬', 'หวาน', sweet, 15)}
      ${_nutCard('🥓', 'ไขมัน', fat, 15)}
      ${_nutCard('🧂', 'โซเดียม (เค็ม)', salt, 15)}
    </div>
    <div style="font-size:10.5px;color:var(--tx3);line-height:1.6">คะแนนสูง = พฤติกรรมเสี่ยงมาก · เกณฑ์อ้างอิง สสส. · มีข้อมูล ${fmtNum(sweet.scored)} คน</div>
  `));
}

/* ── กิจกรรมทางกาย TPAX ─────────────────────────────────────── */
function _anwbRenderTpax(rows) {
  const tpaxRows = rows.filter(r => getTpaxMinutes(r) != null);
  const n = tpaxRows.length;
  const avgMins = n ? tpaxRows.reduce((s, r) => s + getTpaxMinutes(r), 0) / n : null;
  const low  = tpaxRows.filter(r => getTpaxLevel(r)?.key === 'low').length;
  const ok   = tpaxRows.filter(r => getTpaxLevel(r)?.key === 'ok').length;
  const good = tpaxRows.filter(r => getTpaxLevel(r)?.key === 'good').length;

  _setHtml('anwb-tpax', _cardWrap('🏃', 'กิจกรรมทางกาย (TPAX) — เกณฑ์ WHO', `
    <div class="anwb-kpi-row">
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${avgMins != null ? fmtNum(avgMins,0) : '—'}</div><div class="anwb-kpi-mini-label">นาที/สัปดาห์<br>(เฉลี่ย)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(low)}</div><div class="anwb-kpi-mini-label">ไม่เพียงพอ<br>(< 150 นาที)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(ok)}</div><div class="anwb-kpi-mini-label">เพียงพอ<br>(150–299 นาที)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(good)}</div><div class="anwb-kpi-mini-label">ดี<br>(≥ 300 นาที)</div></div>
    </div>
    ${_metricBar('ไม่เพียงพอ (< 150 นาที/สัปดาห์)', low, n, '#DC2626')}
    ${_metricBar('เพียงพอ (150–299 นาที/สัปดาห์)', ok, n, '#D97706')}
    ${_metricBar('ดี (≥ 300 นาที/สัปดาห์)', good, n, '#059669')}
    <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">รวมกิจกรรมทำงาน + เดินทาง + นันทนาการ · มีข้อมูล ${fmtNum(n)} คน จาก ${fmtNum(rows.length)} คน</div>
  `));
}

/* ── พฤติกรรมเนือยนิ่ง ────────────────────────────────────────── */
function _anwbRenderSedentary(rows) {
  const sedRows = rows.filter(r => getSedentaryHours(r) != null);
  const n = sedRows.length;
  const avgH = n ? sedRows.reduce((s, r) => s + getSedentaryHours(r), 0) / n : null;
  const safe  = sedRows.filter(r => getSedentaryLevel(r)?.key === 'safe').length;
  const watch = sedRows.filter(r => getSedentaryLevel(r)?.key === 'watch').length;
  const risk  = sedRows.filter(r => getSedentaryLevel(r)?.key === 'risk').length;

  const screenWorkH  = n ? sedRows.reduce((s,r) => s + _parseTimeMins(r.screen_work)/60, 0) / n : null;
  const screenEntH   = n ? sedRows.reduce((s,r) => s + _parseTimeMins(r.screen_entertain)/60, 0) / n : null;
  const sedOnlyH     = n ? sedRows.reduce((s,r) => s + _parseTimeMins(r.sedentary_dur)/60, 0) / n : null;

  _setHtml('anwb-sedentary', _cardWrap('🪑', 'พฤติกรรมเนือยนิ่ง — เวลานั่ง/หน้าจอ', `
    <div class="anwb-2col">
      <div>
        <div class="anwb-kpi-row">
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${avgH != null ? fmtNum(avgH,1) : '—'}</div><div class="anwb-kpi-mini-label">ชม./วัน เฉลี่ย<br>(รวมทุกประเภท)</div></div>
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(risk)}</div><div class="anwb-kpi-mini-label">เสี่ยง<br>(> 10 ชม./วัน)</div></div>
        </div>
        ${_metricBar('ปลอดภัย (< 8 ชม./วัน)', safe, n, '#059669')}
        ${_metricBar('เฝ้าระวัง (8–10 ชม./วัน)', watch, n, '#D97706')}
        ${_metricBar('เสี่ยง (> 10 ชม./วัน)', risk, n, '#DC2626')}
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:10px">เวลาเฉลี่ยรายประเภท</div>
        ${_metricBar('นั่ง/เอนกาย (ชม./วัน)', sedOnlyH != null ? Math.round(sedOnlyH*10)/10 : 0, 16, '#6B7280')}
        ${_metricBar('หน้าจอเพื่อการทำงาน (ชม./วัน)', screenWorkH != null ? Math.round(screenWorkH*10)/10 : 0, 16, '#0F4C81')}
        ${_metricBar('หน้าจอเพื่อความบันเทิง (ชม./วัน)', screenEntH != null ? Math.round(screenEntH*10)/10 : 0, 16, '#7C3AED')}
        <div style="font-size:10px;color:var(--tx3);margin-top:6px">* แกนเทียบ 16 ชม./วัน (เวลาตื่นนอน)</div>
      </div>
    </div>
    <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">มีข้อมูล ${fmtNum(n)} คน</div>
  `));
}

/* ── TMHI-15 เชิงลึก ──────────────────────────────────────────── */
function _anwbRenderTmhiDeep(rows) {
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !isNaN(getTmhi(r)) && getTmhi(r) > 0);
  const n = tmhiRows.length;
  const avgTmhi = n ? tmhiRows.reduce((s, r) => s + getTmhi(r), 0) / n : null;
  const poor    = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'poor').length;
  const average = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'average').length;
  const good    = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'good').length;

  const subDomains = [
    { label: 'ด้านอารมณ์', keys: ['tmhi_1','tmhi_2','tmhi_3','tmhi_4','tmhi_5','tmhi_6'] },
    { label: 'ด้านการปรับตัว', keys: ['tmhi_7','tmhi_8','tmhi_9'] },
    { label: 'ด้านสังคม (เห็นอกเห็นใจ)', keys: ['tmhi_10','tmhi_11','tmhi_12'] },
    { label: 'ด้านครอบครัว', keys: ['tmhi_13','tmhi_14','tmhi_15'] },
  ].map(d => {
    const vals = tmhiRows.map(r => d.keys.reduce((s, k) => s + (Number(r[k]) || 0), 0)).filter(v => v > 0);
    const max = d.keys.length * 3;
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    return { ...d, avg, max, pct: avg != null ? (avg / max) * 100 : null };
  });

  _setHtml('anwb-tmhi-deep', _cardWrap('🧠', 'สุขภาพจิต TMHI-15 — วิเคราะห์เชิงลึก', `
    <div class="anwb-kpi-row">
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${avgTmhi != null ? fmtNum(avgTmhi,1) : '—'}</div><div class="anwb-kpi-mini-label">คะแนนเฉลี่ย<br>(เต็ม 45)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(poor)}</div><div class="anwb-kpi-mini-label">ต่ำกว่าคนทั่วไป<br>(< 44)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(average)}</div><div class="anwb-kpi-mini-label">เท่ากับคนทั่วไป<br>(44–50)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(good)}</div><div class="anwb-kpi-mini-label">ดีกว่าคนทั่วไป<br>(≥ 51)</div></div>
    </div>
    ${_metricBar('ต่ำกว่าคนทั่วไป (< 44)', poor, n, '#DC2626')}
    ${_metricBar('เท่ากับคนทั่วไป (44–50)', average, n, '#D97706')}
    ${_metricBar('ดีกว่าคนทั่วไป (≥ 51)', good, n, '#059669')}
    <div style="font-size:12px;font-weight:700;color:var(--tx2);margin:14px 0 8px">คะแนนรายด้าน (เฉลี่ย)</div>
    ${subDomains.map(d => `<div class="anwb-metric-bar">
      <div class="anwb-metric-bar-label"><span>${esc(d.label)}</span><span style="font-weight:700;color:var(--P)">${d.avg != null ? fmtNum(d.avg,1) : '—'} / ${d.max}</span></div>
      <div class="anwb-metric-bar-track"><div class="anwb-metric-bar-fill" style="width:${d.pct != null ? Math.max(d.pct,0.5) : 0}%;background:#0F4C81"></div></div>
    </div>`).join('')}
    <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">ที่มา: กรมสุขภาพจิต กระทรวงสาธารณสุข · มีข้อมูล ${fmtNum(n)} คน</div>
  `));
}

/* ── UCLA Loneliness Scale ────────────────────────────────────── */
function _anwbRenderLoneliness(rows) {
  const lRows = rows.filter(r => getLonelinessTotal(r) != null);
  const n = lRows.length;
  const avgScore = n ? lRows.reduce((s, r) => s + getLonelinessTotal(r), 0) / n : null;

  const l3 = [
    { key: 'low',    label: 'โดดเดี่ยวน้อย (0–20)',    color: '#059669' },
    { key: 'medium', label: 'โดดเดี่ยวปานกลาง (21–40)', color: '#D97706' },
    { key: 'high',   label: 'โดดเดี่ยวมาก (41–60)',     color: '#DC2626' },
  ].map(l => ({ ...l, count: lRows.filter(r => getLonelinessLevel3(getLonelinessTotal(r))?.key === l.key).length }));

  const l4 = [
    { key: 'very_low',  label: 'โดดเดี่ยวน้อยมาก (0–15)',       color: '#059669' },
    { key: 'low_mid',   label: 'โดดเดี่ยวน้อย–ปานกลาง (16–30)', color: '#84CC16' },
    { key: 'mid_high',  label: 'โดดเดี่ยวปานกลาง–มาก (31–45)',  color: '#D97706' },
    { key: 'very_high', label: 'โดดเดี่ยวมากที่สุด (46–60)',     color: '#DC2626' },
  ].map(l => ({ ...l, count: lRows.filter(r => getLonelinessLevel4(getLonelinessTotal(r))?.key === l.key).length }));

  const subLabels = { isolation: 'ความโดดเดี่ยว', social_relation: 'ความสัมพันธ์สังคม', self_disconnect: 'การตัดขาดตนเอง', social_behavior: 'พฤติกรรมสังคม' };
  const subAvgs = Object.fromEntries(Object.keys(subLabels).map(k => {
    const vals = lRows.map(r => getLonelinessSubScores(r)[k]).filter(v => v != null);
    return [k, vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null];
  }));

  _setHtml('anwb-loneliness', _cardWrap('💙', 'UCLA Loneliness Scale — ความโดดเดี่ยว', `
    <div class="anwb-kpi-row">
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${avgScore != null ? fmtNum(avgScore,1) : '—'}</div><div class="anwb-kpi-mini-label">คะแนนเฉลี่ย<br>(เต็ม 60)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${n ? fmtNum(_pct(l3.find(l=>l.key==='high').count, n), 1) : '—'}%</div><div class="anwb-kpi-mini-label">โดดเดี่ยวมาก<br>(≥ 41 คะแนน)</div></div>
    </div>
    <div class="anwb-2col">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:8px">เกณฑ์ 3 ระดับ (ต้นฉบับ 1978)</div>
        ${l3.map(l => _metricBar(l.label, l.count, n, l.color)).join('')}
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:8px">เกณฑ์ 4 ระดับ (แบ่งเชิงสถิติ)</div>
        ${l4.map(l => _metricBar(l.label, l.count, n, l.color)).join('')}
        <div style="font-size:10px;color:var(--tx3);margin-top:4px">* แบ่ง range 60 เป็น 4 ส่วนเท่ากัน (15 คะแนน)</div>
      </div>
    </div>
    <div class="anwb-lonely-sub">
      ${Object.entries(subLabels).map(([k, label]) => `
        <div class="anwb-lonely-sub-card">
          <div class="anwb-lonely-sub-val" style="color:var(--P)">${subAvgs[k] != null ? fmtNum(subAvgs[k],1) : '—'}</div>
          <div class="anwb-lonely-sub-name">${esc(label)}<br><span style="font-size:9px;color:var(--tx3)">/ 15 คะแนน</span></div>
        </div>`).join('')}
    </div>
    <div style="font-size:10.5px;color:var(--tx3);margin-top:10px">ที่มา: UCLA Loneliness Scale (1978) · O=3, S=2, R=1, N=0 · ทุกข้อบวกเดียวกัน (ไม่มี reverse) · มีข้อมูล ${fmtNum(n)} คน</div>
  `));
}

/* ── อุบัติเหตุ & ความปลอดภัย ────────────────────────────────── */
function _anwbRenderSafety(rows) {
  const n = rows.length;
  const complianceRows = rows.filter(r => getSafetyCompliance(r) != null);
  const nc = complianceRows.length;
  const avgComp = nc ? complianceRows.reduce((s, r) => s + getSafetyCompliance(r), 0) / nc : null;
  const fullComp = complianceRows.filter(r => getSafetyCompliance(r) === 100).length;
  const drunkCount    = rows.filter(r => hasDrunkDriving(r)).length;
  const accidentCount = rows.filter(r => hadAccident(r)).length;

  const safetyItems = [
    { id: 'helmet_driver',    label: 'หมวกนิรภัย (ขับขี่)' },
    { id: 'helmet_passenger', label: 'หมวกนิรภัย (โดยสาร)' },
    { id: 'seatbelt_driver',  label: 'เข็มขัดนิรภัย (ขับรถ)' },
    { id: 'seatbelt_passenger', label: 'เข็มขัดนิรภัย (โดยสาร)' },
  ].map(item => {
    const applicable = rows.filter(r => { const v = String(r[item.id]||'').trim(); return v !== 'ไม่เคยขี่' && v !== 'ไม่เคยนั่งซ้อนท้าย' && v !== 'ไม่เคยขับ' && v !== 'ไม่เคยนั่งข้างคนขับ' && v !== ''; });
    const always = applicable.filter(r => String(r[item.id]||'').trim() === 'ใช้ทุกครั้ง').length;
    return { ...item, applicable: applicable.length, always };
  });

  _setHtml('anwb-safety', _cardWrap('🛡️', 'อุบัติเหตุ & ความปลอดภัยทางถนน', `
    <div class="anwb-kpi-row">
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${avgComp != null ? fmtNum(avgComp,1) : '—'}%</div><div class="anwb-kpi-mini-label">ปฏิบัติตาม<br>เฉลี่ยทุกด้าน</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(fullComp)}</div><div class="anwb-kpi-mini-label">ปลอดภัยสมบูรณ์<br>(100%)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(drunkCount)}</div><div class="anwb-kpi-mini-label">เคยขับหลัง<br>ดื่มแอลกอฮอล์</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(accidentCount)}</div><div class="anwb-kpi-mini-label">เคยประสบ<br>อุบัติเหตุ (12 เดือน)</div></div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--tx2);margin-bottom:8px">% ใช้ทุกครั้ง (ผู้ที่เกี่ยวข้อง)</div>
    ${safetyItems.map(item => _metricBar(item.label, item.always, item.applicable, '#0F4C81')).join('')}
    <div style="margin-top:10px">
      ${_metricBar('เคยขับหลังดื่มแอลกอฮอล์ (12 เดือน)', drunkCount, n, '#DC2626')}
      ${_metricBar('เคยประสบอุบัติเหตุจราจร (12 เดือน)', accidentCount, n, '#D97706')}
    </div>
    <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">มีข้อมูล ${fmtNum(n)} คน</div>
  `));
}

/* ── คุณภาพชีวิต & ความพึงพอใจสภาพแวดล้อม ──────────────────── */
function _anwbRenderQol(rows) {
  // Normalize Likert 0-4 (string or number) → integer 0..4, null if unknown
  const _lk = (v) => {
    if (v == null || v === '') return null;
    const s = String(v).trim();
    if (/^[0-4]$/.test(s)) return parseInt(s, 10);
    if (s.includes('แย่มาก')) return 0;
    if (s.includes('แย่'))    return 1;
    if (s.includes('ปานกลาง')) return 2;
    if (s.includes('ดีมาก')) return 4;
    if (s.includes('ดี'))    return 3;
    return null;
  };
  const _dist = (field) => {
    const counts = [0,0,0,0,0];
    let scored = 0, sum = 0, good = 0;
    rows.forEach(r => {
      const v = _lk(r[field]);
      if (v == null) return;
      counts[v]++; scored++; sum += v; if (v >= 3) good++;
    });
    return { counts, scored, mean: scored ? sum / scored : null, goodPct: scored ? (good/scored)*100 : 0 };
  };

  const lifeQ = _dist('life_quality');
  const envSat = _dist('env_satisfaction');

  const labels = ['แย่มาก (0)', 'แย่ (1)', 'ปานกลาง (2)', 'ดี (3)', 'ดีมาก (4)'];
  const colors = ['#991B1B','#EF4444','#D97706','#84CC16','#059669'];

  const _stacked = (stat) => labels.map((lab, i) => {
    return _metricBar(lab, stat.counts[i], stat.scored, colors[i]);
  }).join('');

  _setHtml('anwb-qol', `<div class="anwb-2col">
    ${_cardWrap('🌟', 'คุณภาพชีวิตโดยรวม (ข้อ 92)', `
      <div class="anwb-kpi-row">
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${lifeQ.mean != null ? fmtNum(lifeQ.mean,2) : '—'}</div><div class="anwb-kpi-mini-label">คะแนนเฉลี่ย<br>(0–4)</div></div>
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(lifeQ.goodPct,1)}%</div><div class="anwb-kpi-mini-label">คุณภาพชีวิตดี<br>(≥ 3)</div></div>
      </div>
      ${_stacked(lifeQ)}
      <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">มีข้อมูล ${fmtNum(lifeQ.scored)} คน</div>
    `)}
    ${_cardWrap('😊', 'ความพึงพอใจสภาพแวดล้อมทำงาน', `
      <div class="anwb-kpi-row">
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${envSat.mean != null ? fmtNum(envSat.mean,2) : '—'}</div><div class="anwb-kpi-mini-label">คะแนนเฉลี่ย<br>(0–4)</div></div>
        <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(envSat.goodPct,1)}%</div><div class="anwb-kpi-mini-label">พึงพอใจ<br>(≥ 3)</div></div>
      </div>
      ${_stacked(envSat)}
      <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">มีข้อมูล ${fmtNum(envSat.scored)} คน</div>
    `)}
  </div>`);
}

/* ── มลพิษ · Climate · โรคอุบัติใหม่ · COVID ─────────────────── */
function _anwbRenderPollution(rows) {
  const n = rows.length;
  // Ordinal 0..4 (ไม่มีเลย..รุนแรงมาก)
  const _ord5 = (v) => {
    const s = String(v ?? '').trim();
    if (s.includes('รุนแรงมาก')) return 4;
    if (s === 'มาก') return 3;
    if (s.includes('ปานกลาง')) return 2;
    if (s === 'น้อย') return 1;
    if (s.includes('ไม่มีเลย')) return 0;
    return null;
  };
  const _distOrd = (field) => {
    const counts = [0,0,0,0,0];
    let scored = 0, sum = 0, high = 0;
    rows.forEach(r => {
      const v = _ord5(r[field]);
      if (v == null) return;
      counts[v]++; scored++; sum += v; if (v >= 3) high++;
    });
    return { counts, scored, mean: scored ? sum / scored : null, highPct: scored ? (high/scored)*100 : 0, high };
  };

  const pm25 = _distOrd('pm25_impact');
  const climate = _distOrd('climate_impact');

  const ordLabels = ['ไม่มีเลย','น้อย','ปานกลาง','มาก','รุนแรงมาก'];
  const ordColors = ['#059669','#84CC16','#D97706','#EF4444','#991B1B'];
  const _ordBar = (stat) => ordLabels.map((lab,i) => _metricBar(lab, stat.counts[i], stat.scored, ordColors[i])).join('');

  // PM2.5 symptoms (multi-select array field)
  const symptomCount = {};
  let withSymptom = 0;
  rows.forEach(r => {
    const list = Array.isArray(r.pm25_symptom) ? r.pm25_symptom
      : (typeof r.pm25_symptom === 'string' ? (() => { try { return JSON.parse(r.pm25_symptom); } catch { return []; } })() : []);
    if (list && list.length) withSymptom++;
    (list || []).forEach(s => { const k = String(s||'').trim(); if(k) symptomCount[k] = (symptomCount[k]||0) + 1; });
  });
  const topSymptoms = Object.entries(symptomCount).sort((a,b) => b[1]-a[1]).slice(0, 8);

  // Emerging diseases
  const emAware = rows.filter(r => {
    const s = String(r.emerging_known||'').trim();
    return s === 'เคย' || s === 'เคยได้ยิน';
  }).length;
  const emWithList = rows.filter(r => {
    const v = r.emerging_list;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string' && v.trim()) { try { return JSON.parse(v).length > 0; } catch { return v.trim().length > 0; } }
    return false;
  }).length;
  const diseaseCount = {};
  rows.forEach(r => {
    let list = r.emerging_list;
    if (typeof list === 'string') { try { list = JSON.parse(list); } catch { list = []; } }
    (Array.isArray(list) ? list : []).forEach(d => { const k = String(d||'').trim(); if(k) diseaseCount[k] = (diseaseCount[k]||0) + 1; });
  });
  const topDiseases = Object.entries(diseaseCount).sort((a,b) => b[1]-a[1]).slice(0, 10);

  // COVID history (normalize variants)
  const _covidBucket = (v) => {
    const s = String(v||'').trim();
    if (!s) return null;
    if (s.includes('ไม่เคย')) return 'never';
    if (s.includes('มากกว่า 1') || s.startsWith('>') || s.includes('> 1')) return 'repeat';
    if (s.includes('1 ครั้ง')) return 'once';
    return null;
  };
  const cov = { never: 0, once: 0, repeat: 0 };
  rows.forEach(r => { const b = _covidBucket(r.covid_history); if (b) cov[b]++; });
  const covScored = cov.never + cov.once + cov.repeat;
  const covEverPct = covScored ? ((cov.once + cov.repeat) / covScored) * 100 : 0;
  const covRepeatPct = covScored ? (cov.repeat / covScored) * 100 : 0;

  _setHtml('anwb-pollution', `
    <div class="anwb-2col">
      ${_cardWrap('🌫', 'PM2.5 — ผลกระทบและอาการ', `
        <div class="anwb-kpi-row">
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(pm25.highPct,1)}%</div><div class="anwb-kpi-mini-label">ผลกระทบสูง<br>(≥ มาก)</div></div>
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(n ? (withSymptom/n)*100 : 0,1)}%</div><div class="anwb-kpi-mini-label">มีอาการ<br>≥ 1 อาการ</div></div>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin:6px 0 8px">ระดับผลกระทบ</div>
        ${_ordBar(pm25)}
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin:10px 0 8px">Top อาการ (${fmtNum(withSymptom)} คน)</div>
        ${topSymptoms.length ? topSymptoms.map(([s,c]) => _metricBar(s, c, n, '#D97706')).join('') : '<div style="color:var(--tx3);font-size:12px">ไม่มีข้อมูลอาการ</div>'}
        <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(pm25.scored)} คน</div>
      `)}
      ${_cardWrap('🌡', 'การเปลี่ยนแปลงภูมิอากาศ', `
        <div class="anwb-kpi-row">
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${climate.mean != null ? fmtNum(climate.mean,2) : '—'}</div><div class="anwb-kpi-mini-label">คะแนนเฉลี่ย<br>(0–4)</div></div>
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(climate.highPct,1)}%</div><div class="anwb-kpi-mini-label">ผลกระทบสูง<br>(≥ มาก)</div></div>
        </div>
        ${_ordBar(climate)}
        <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(climate.scored)} คน</div>
      `)}
    </div>
    <div class="anwb-2col">
      ${_cardWrap('🦠', 'โรคอุบัติใหม่ — การรับรู้', `
        <div class="anwb-kpi-row">
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#0F4C81">${fmtNum(n ? (emAware/n)*100 : 0,1)}%</div><div class="anwb-kpi-mini-label">Awareness Rate<br>(เคย/เคยได้ยิน)</div></div>
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val">${fmtNum(emWithList)}</div><div class="anwb-kpi-mini-label">คนที่ระบุ<br>ชื่อโรคได้</div></div>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--tx2);margin:6px 0 8px">Top 10 โรคที่รู้จัก</div>
        ${topDiseases.length ? topDiseases.map(([d,c]) => _metricBar(d, c, n, '#0F4C81')).join('') : '<div style="color:var(--tx3);font-size:12px">ยังไม่มีข้อมูลโรค</div>'}
      `)}
      ${_cardWrap('🩺', 'ประวัติติด COVID-19', `
        <div class="anwb-kpi-row">
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(covEverPct,1)}%</div><div class="anwb-kpi-mini-label">เคยติด<br>(อย่างน้อย 1 ครั้ง)</div></div>
          <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#DC2626">${fmtNum(covRepeatPct,1)}%</div><div class="anwb-kpi-mini-label">ติดซ้ำ<br>(&gt; 1 ครั้ง)</div></div>
        </div>
        ${_metricBar('ไม่เคยติด', cov.never, covScored, '#059669')}
        ${_metricBar('ติด 1 ครั้ง', cov.once, covScored, '#D97706')}
        ${_metricBar('ติดมากกว่า 1 ครั้ง', cov.repeat, covScored, '#DC2626')}
        <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(covScored)} คน</div>
      `)}
    </div>
  `);
}

/* ── สภาพแวดล้อมทำงาน & มลพิษ ───────────────────────────────── */
function _anwbRenderEnv(rows) {
  const n = rows.length;
  const _envPct = (fieldId, positiveVals) => {
    const applicable = rows.filter(r => r[fieldId] != null && r[fieldId] !== '');
    const count = applicable.filter(r => positiveVals.includes(String(r[fieldId]).trim())).length;
    return { count, total: applicable.length };
  };

  // Scoring per factor: ใช่+มีผล=2, ใช่+ไม่มีผล=1, ไม่ใช่=0
  const _envScore = (v) => {
    if (v == null) return null;
    let s = '';
    if (Array.isArray(v)) s = v.join(' ');
    else if (typeof v === 'string') {
      const t = v.trim();
      try { const j = JSON.parse(t); if (Array.isArray(j)) s = j.join(' '); else s = t; } catch { s = t; }
    } else s = String(v);
    if (!s) return null;
    const hasYes = s.includes('ใช่') || (!s.includes('ไม่ใช่') && s.includes('มีผล'));
    const hasNo = s.startsWith('ไม่ใช่') || /(^|\s)ไม่ใช่(\s|$)/.test(s);
    const hasImpact = s.includes('มีผล') && !s.includes('ไม่มีผล') && !s.includes('ไม่มีผลกระทบ');
    if (hasNo && !hasYes) return 0;
    if (hasYes || s.includes('มีผล')) return hasImpact ? 2 : 1;
    return null;
  };

  const envDefs = [
    { id: 'env_glare',   label: 'ทำงานกลางแดด/แสงจ้า' },
    { id: 'env_noise',   label: 'เครื่องจักร/เสียงดัง/สั่นสะเทือน' },
    { id: 'env_smell',   label: 'กลิ่นสารเคมี' },
    { id: 'env_smoke',   label: 'ควัน/ไอระเหย' },
    { id: 'env_posture', label: 'ท่าทางซ้ำๆ > 1.5 ชม.' },
    { id: 'env_awkward', label: 'ท่าทางฝืนธรรมชาติ' },
  ];
  const envFactors = envDefs.map(f => {
    let affected = 0, exposed = 0, total = 0;
    rows.forEach(r => {
      const sc = _envScore(r[f.id]);
      if (sc == null) return;
      total++;
      if (sc === 2) affected++;
      else if (sc === 1) exposed++;
    });
    return { ...f, affected, exposed, total };
  });

  // Risk total per respondent (0-12)
  const riskTotals = rows.map(r => {
    const scores = envDefs.map(f => _envScore(r[f.id])).filter(v => v != null);
    return scores.length === envDefs.length ? scores.reduce((a,b) => a+b, 0) : null;
  }).filter(v => v != null);
  const riskGroups = {
    safe: riskTotals.filter(v => v === 0).length,
    watch: riskTotals.filter(v => v >= 1 && v <= 3).length,
    risk: riskTotals.filter(v => v >= 4 && v <= 6).length,
    high: riskTotals.filter(v => v >= 7).length,
  };
  const nRisk = riskTotals.length;

  _setHtml('anwb-env', _cardWrap('🏭', 'ปัจจัยเสี่ยงสภาพแวดล้อมการทำงาน (ข้อ 84–91)', `
    <div class="anwb-kpi-row">
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#059669">${fmtNum(riskGroups.safe)}</div><div class="anwb-kpi-mini-label">ปลอดภัย<br>(0)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#D97706">${fmtNum(riskGroups.watch)}</div><div class="anwb-kpi-mini-label">เฝ้าระวัง<br>(1–3)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#EF4444">${fmtNum(riskGroups.risk)}</div><div class="anwb-kpi-mini-label">เสี่ยง<br>(4–6)</div></div>
      <div class="anwb-kpi-mini"><div class="anwb-kpi-mini-val" style="color:#991B1B">${fmtNum(riskGroups.high)}</div><div class="anwb-kpi-mini-label">เสี่ยงสูง<br>(≥ 7)</div></div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--tx2);margin:6px 0 8px">% "ใช่ มีผลต่อสุขภาพ" รายปัจจัย</div>
    ${envFactors.map(f => _metricBar(f.label, f.affected, f.total, '#DC2626')).join('')}
    <div style="font-size:10.5px;color:var(--tx3);margin-top:8px">คะแนนปัจจัย: ไม่ใช่=0, ใช่ไม่มีผล=1, ใช่มีผลสุขภาพ=2 · คะแนนรวม 6 ปัจจัย (เต็ม 12) · มีข้อมูลครบ ${fmtNum(nRisk)} คน จาก ${fmtNum(n)} คน</div>
  `));
}
