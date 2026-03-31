/* ========== ADMIN PORTAL — WELLBEING ANALYTICS PAGE ========== */

function renderAnalytics(summary) {
  const rows = (state.surveyRows || []).filter(r => !r.is_draft);
  if (!rows.length) {
    document.getElementById('anwb-content')?.replaceChildren();
    const el = document.getElementById('anwb-empty');
    if (el) el.style.display = '';
    return;
  }
  const el = document.getElementById('anwb-empty');
  if (el) el.style.display = 'none';

  _anwbRenderKPICards(rows);
  _anwbRenderDistributions(rows);
  _anwbRenderHeatmap(rows, summary);
  _anwbRenderDemographics(rows);
  _anwbRenderRiskSignals(rows);
}

/* ── KPI summary bar ───────────────────────────────────────────── */
function _anwbRenderKPICards(rows) {
  const n = rows.length;
  const avgPhq = _avg(rows, r => getPhq9(r));
  const avgGad = _avg(rows, r => getGad7(r));
  const avgBurn = _avg(rows, r => getBurnout(r));
  const avgEng = _avg(rows, r => getEngagement(r));
  const highRisk = rows.filter(r => (getPhq9(r) || 0) >= 10 || (getGad7(r) || 0) >= 10).length;

  _setHtml('anwb-kpi', `
    <div class="anwb-kpi-grid">
      ${_kpiCard('👥 ผู้ตอบทั้งหมด', fmtNum(n) + ' คน', '', '#0F4C81')}
      ${_kpiCard('🧠 PHQ-9 เฉลี่ย', fmtNum(avgPhq, 1), _phqLabel(avgPhq), avgPhq >= 10 ? '#DC2626' : avgPhq >= 5 ? '#D97706' : '#059669')}
      ${_kpiCard('😰 GAD-7 เฉลี่ย', fmtNum(avgGad, 1), _gadLabel(avgGad), avgGad >= 10 ? '#DC2626' : avgGad >= 5 ? '#D97706' : '#059669')}
      ${_kpiCard('🔥 Burnout เฉลี่ย', fmtNum(avgBurn, 2), avgBurn >= 4 ? 'สูง' : avgBurn >= 3 ? 'ปานกลาง' : 'ต่ำ', avgBurn >= 4 ? '#DC2626' : avgBurn >= 3 ? '#D97706' : '#059669')}
      ${_kpiCard('💪 Engagement เฉลี่ย', fmtNum(avgEng, 1), avgEng >= 70 ? 'ดี' : avgEng >= 50 ? 'ปานกลาง' : 'ต่ำ', avgEng >= 70 ? '#059669' : avgEng >= 50 ? '#D97706' : '#DC2626')}
      ${_kpiCard('⚠️ กลุ่มเสี่ยงสูง', fmtNum(highRisk) + ' คน', fmtNum(n ? (highRisk/n*100) : 0, 1) + '% ของทั้งหมด', highRisk / n > 0.2 ? '#DC2626' : '#D97706')}
    </div>`);
}

/* ── Distribution charts: PHQ9, GAD7, Burnout, Engagement ─────── */
function _anwbRenderDistributions(rows) {
  const phqBands = [
    { label: 'ปกติ (0–4)', min: 0, max: 4, color: '#059669' },
    { label: 'เล็กน้อย (5–9)', min: 5, max: 9, color: '#84CC16' },
    { label: 'ปานกลาง (10–14)', min: 10, max: 14, color: '#F59E0B' },
    { label: 'ค่อนข้างรุนแรง (15–19)', min: 15, max: 19, color: '#EF4444' },
    { label: 'รุนแรง (20–27)', min: 20, max: 27, color: '#991B1B' },
  ];
  const gadBands = [
    { label: 'ปกติ (0–4)', min: 0, max: 4, color: '#059669' },
    { label: 'เล็กน้อย (5–9)', min: 5, max: 9, color: '#84CC16' },
    { label: 'ปานกลาง (10–14)', min: 10, max: 14, color: '#F59E0B' },
    { label: 'รุนแรง (15–21)', min: 15, max: 21, color: '#EF4444' },
  ];

  const phqData = _bandCount(rows, r => getPhq9(r), phqBands);
  const gadData = _bandCount(rows, r => getGad7(r), gadBands);

  const burnBands = [
    { label: 'ต่ำ (1–2.9)', min: 0, max: 2.9, color: '#059669' },
    { label: 'ปานกลาง (3–3.9)', min: 3, max: 3.9, color: '#F59E0B' },
    { label: 'สูง (4–5)', min: 4, max: 5, color: '#EF4444' },
  ];
  const engBands = [
    { label: 'ต่ำ (0–49)', min: 0, max: 49, color: '#EF4444' },
    { label: 'ปานกลาง (50–69)', min: 50, max: 69, color: '#F59E0B' },
    { label: 'ดี (70–100)', min: 70, max: 100, color: '#059669' },
  ];
  const burnData = _bandCount(rows, r => getBurnout(r), burnBands);
  const engData = _bandCount(rows, r => getEngagement(r), engBands);

  _setHtml('anwb-dist', `
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>🧠 PHQ-9 ภาวะซึมเศร้า</h3></div><div class="card-body">${_barChart(phqData, rows.length)}</div></div>
      <div class="card"><div class="card-head"><h3>😰 GAD-7 ความวิตกกังวล</h3></div><div class="card-body">${_barChart(gadData, rows.length)}</div></div>
      <div class="card"><div class="card-head"><h3>🔥 Burnout Score</h3></div><div class="card-body">${_barChart(burnData, rows.length)}</div></div>
      <div class="card"><div class="card-head"><h3>💪 Engagement Score</h3></div><div class="card-body">${_barChart(engData, rows.length)}</div></div>
    </div>`);
}

/* ── Heatmap องค์กร × 5 ตัวชี้วัด ─────────────────────────────── */
function _anwbRenderHeatmap(rows, summary) {
  const orgs = getOrgCatalog().filter(o => o.code !== 'test-org');
  const metrics = [
    { key: 'phq', label: 'PHQ-9', fn: r => getPhq9(r), max: 27, reverse: true },
    { key: 'gad', label: 'GAD-7', fn: r => getGad7(r), max: 21, reverse: true },
    { key: 'burn', label: 'Burnout', fn: r => getBurnout(r), max: 5, reverse: true },
    { key: 'eng', label: 'Engagement', fn: r => getEngagement(r), max: 100, reverse: false },
    { key: 'wlb', label: 'WLB', fn: r => getWlb(r), max: 5, reverse: false },
  ];

  const orgRows = orgs.map(org => {
    const orgData = rows.filter(r => {
      const n = (r.organization || '').trim();
      return n === org.name || (r.org_code || '').toLowerCase() === org.code;
    });
    if (!orgData.length) return null;
    const vals = metrics.map(m => _avg(orgData, m.fn));
    return { name: org.name, n: orgData.length, vals };
  }).filter(Boolean);

  if (!orgRows.length) { _setHtml('anwb-heatmap', '<div class="info">ยังไม่มีข้อมูลรายองค์กร</div>'); return; }

  const headerRow = `<tr><th>องค์กร</th><th>n</th>${metrics.map(m => `<th>${m.label}</th>`).join('')}</tr>`;
  const dataRows = orgRows.map(org => {
    const cells = metrics.map((m, i) => {
      const v = org.vals[i];
      if (v == null) return '<td style="color:var(--tx3)">—</td>';
      const pct = Math.min(Math.max(v / m.max, 0), 1);
      const heat = m.reverse ? pct : (1 - pct);
      const bg = _heatColor(heat);
      return `<td style="background:${bg};font-weight:600;font-size:12px">${fmtNum(v, 1)}</td>`;
    }).join('');
    return `<tr><td style="font-size:12px;max-width:160px">${esc(org.name)}</td><td style="color:var(--tx3);font-size:11px">${org.n}</td>${cells}</tr>`;
  }).join('');

  _setHtml('anwb-heatmap', `
    <div class="card">
      <div class="card-head"><h3>🌡️ Heatmap สุขภาวะรายองค์กร</h3><span style="font-size:11px;color:var(--tx3)">🔴 = ต้องระวัง · 🟢 = ดี</span></div>
      <div class="tbl-wrap"><table class="anwb-heat-table"><thead>${headerRow}</thead><tbody>${dataRows}</tbody></table></div>
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
  const bmiCounts = _groupCount(rows, r => {
    const b = String(r.bmi_category || '').trim();
    return b || '—';
  });

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
  const highPhq = rows.filter(r => (getPhq9(r) || 0) >= 10).length;
  const highGad = rows.filter(r => (getGad7(r) || 0) >= 10).length;
  const highBurn = rows.filter(r => (getBurnout(r) || 0) >= 4).length;
  const lowEng = rows.filter(r => { const e = getEngagement(r); return e != null && e < 50; }).length;
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
    { label: 'PHQ-9 ≥ 10 (ซึมเศร้าปานกลาง+)', n: highPhq, color: '#EF4444' },
    { label: 'GAD-7 ≥ 10 (วิตกกังวลปานกลาง+)', n: highGad, color: '#F97316' },
    { label: 'Burnout ≥ 4 (สูง)', n: highBurn, color: '#EF4444' },
    { label: 'Engagement < 50 (ต่ำ)', n: lowEng, color: '#F59E0B' },
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

function _barChart(data, total) {
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
