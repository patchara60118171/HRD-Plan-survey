/* ========== ADMIN PORTAL — WELLBEING ANALYTICS PAGE ========== */

function renderAnalytics(summary) {
  const allRows = state.surveyRows || [];
  const rows = allRows.filter(r => !r.is_draft);
  console.log('[Analytics] surveyRows total:', allRows.length, '| non-draft:', rows.length);

  const emptyEl = document.getElementById('anwb-empty');
  const contentEl = document.getElementById('anwb-content');

  // Always hide loading/empty first
  if (emptyEl) emptyEl.style.display = 'none';

  if (!rows.length) {
    const msg = allRows.length ? '⚠️ ข้อมูลทั้งหมดเป็น Draft ยังไม่มีการ Submit จริง' : '⚠️ ยังไม่มีข้อมูล Wellbeing Survey';
    if (emptyEl) { emptyEl.style.display = ''; emptyEl.textContent = msg; }
    if (contentEl) contentEl.style.display = 'none';
    return;
  }
  if (contentEl) contentEl.style.display = '';

  _anwbRenderKPICards(rows);
  _anwbRenderDistributions(rows);
  _anwbRenderHeatmap(rows, summary);
  _anwbRenderDemographics(rows);
  _anwbRenderRiskSignals(rows);
}

/* ── KPI summary bar ───────────────────────────────────────────── */
function _anwbRenderKPICards(rows) {
  const n = rows.length;
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !Number.isNaN(getTmhi(r)));
  const avgTmhi = _avg(tmhiRows, r => getTmhi(r));
  const tmhiMeta = getTmhiLevelMeta(avgTmhi);
  const tmhiLowCount = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'poor').length;
  const avgPhq = _avg(rows, r => getPhq9(r));
  const avgGad = _avg(rows, r => getGad7(r));
  const avgBurn = _avg(rows, r => getBurnout(r));
  const avgEng = _avg(rows, r => getEngagement(r));
  const highRisk = rows.filter(r => (getPhq9(r) || 0) >= 10 || (getGad7(r) || 0) >= 10).length;

  _setHtml('anwb-kpi', `
    <div class="anwb-kpi-grid">
      ${_kpiCard('👥 ผู้ตอบทั้งหมด', fmtNum(n) + ' คน', '', '#0F4C81')}
      ${_kpiCard('🫶 TMHI-15 เฉลี่ย', fmtNum(avgTmhi, 1), tmhiMeta.shortLabel, tmhiMeta.color)}
      ${_kpiCard('🟠 TMHI ต่ำกว่าคนทั่วไป', fmtNum(tmhiLowCount) + ' คน', fmtNum(tmhiRows.length ? (tmhiLowCount / tmhiRows.length) * 100 : 0, 1) + '% ของผู้มีคะแนน TMHI', tmhiLowCount > 0 ? '#DC2626' : '#059669')}
      ${_kpiCard('🧠 PHQ-9 เฉลี่ย', fmtNum(avgPhq, 1), _phqLabel(avgPhq), avgPhq >= 10 ? '#DC2626' : avgPhq >= 5 ? '#D97706' : '#059669')}
      ${_kpiCard('😰 GAD-7 เฉลี่ย', fmtNum(avgGad, 1), _gadLabel(avgGad), avgGad >= 10 ? '#DC2626' : avgGad >= 5 ? '#D97706' : '#059669')}
      ${_kpiCard('🔥 Burnout เฉลี่ย', fmtNum(avgBurn, 2), avgBurn >= 4 ? 'สูง' : avgBurn >= 3 ? 'ปานกลาง' : 'ต่ำ', avgBurn >= 4 ? '#DC2626' : avgBurn >= 3 ? '#D97706' : '#059669')}
      ${_kpiCard('💪 Engagement เฉลี่ย', fmtNum(avgEng, 1), avgEng >= 70 ? 'ดี' : avgEng >= 50 ? 'ปานกลาง' : 'ต่ำ', avgEng >= 70 ? '#059669' : avgEng >= 50 ? '#D97706' : '#DC2626')}
      ${_kpiCard('⚠️ กลุ่มเสี่ยงสูง', fmtNum(highRisk) + ' คน', fmtNum(n ? (highRisk/n*100) : 0, 1) + '% ของทั้งหมด', highRisk / n > 0.2 ? '#DC2626' : '#D97706')}
    </div>`);
}

/* ── Distribution charts: PHQ9, GAD7, Burnout, Engagement ─────── */
function _anwbRenderDistributions(rows) {
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !Number.isNaN(getTmhi(r)));
  const tmhiBands = [
    { label: 'ต่ำกว่าคนทั่วไป (< 43)', min: 0, max: 42.999, color: '#DC2626' },
    { label: 'เท่ากับคนทั่วไป (44–50)', min: 44, max: 50, color: '#D97706' },
    { label: 'ดีกว่าคนทั่วไป (51–60)', min: 51, max: 60, color: '#059669' },
  ];
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
  const tmhiData = _bandCount(tmhiRows, r => getTmhi(r), tmhiBands);
  const burnData = _bandCount(rows, r => getBurnout(r), burnBands);
  const engData = _bandCount(rows, r => getEngagement(r), engBands);

  const tmhiInsights = _tmhiInsights(tmhiRows);

  _setHtml('anwb-dist', `
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>🫶 TMHI-15 การแปลผลตามเฉลย</h3></div><div class="card-body">${_barChart(tmhiData, tmhiRows.length)}<div style="margin-top:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;font-size:12px;line-height:1.7"><div style="font-weight:700;color:#0F4C81;margin-bottom:6px">เกณฑ์ที่ใช้จากไฟล์เฉลย</div><div>51–60 คะแนน = สุขภาพจิตดีกว่าคนทั่วไป</div><div>44–50 คะแนน = สุขภาพจิตเท่ากับคนทั่วไป</div><div>ต่ำกว่า 43 คะแนน = สุขภาพจิตต่ำกว่าคนทั่วไป</div><div style="margin-top:8px;color:#475569">${esc(tmhiInsights)}</div></div></div></div>
      <div class="card"><div class="card-head"><h3> PHQ-9 ภาวะซึมเศร้า</h3></div><div class="card-body">${_barChart(phqData, rows.length)}</div></div>
      <div class="card"><div class="card-head"><h3>😰 GAD-7 ความวิตกกังวล</h3></div><div class="card-body">${_barChart(gadData, rows.length)}</div></div>
      <div class="card"><div class="card-head"><h3>🔥 Burnout Score</h3></div><div class="card-body">${_barChart(burnData, rows.length)}</div></div>
      <div class="card"><div class="card-head"><h3>💪 Engagement Score</h3></div><div class="card-body">${_barChart(engData, rows.length)}</div></div>
    </div>`);
}

/* ── Heatmap องค์กร × 5 ตัวชี้วัด ─────────────────────────────── */
function _anwbRenderHeatmap(rows, summary) {
  const orgs = getOrgCatalog().filter(o => o.code !== 'test-org');
  const metrics = [
    { key: 'tmhi', label: 'TMHI-15', fn: r => getTmhi(r), max: 60, reverse: false },
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
      <div class="card-head"><h3>🌡️ Heatmap สุขภาวะรายองค์กร</h3><span style="font-size:11px;color:var(--tx3)">TMHI ใช้เกณฑ์เฉลย · 🔴 = ต้องระวัง · 🟢 = ดี</span></div>
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
  const tmhiRows = rows.filter(r => getTmhi(r) != null && !Number.isNaN(getTmhi(r)));
  const lowTmhi = tmhiRows.filter(r => getTmhiLevelMeta(getTmhi(r)).key === 'poor').length;
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
    { label: 'TMHI ต่ำกว่าคนทั่วไป', n: lowTmhi, color: '#DC2626' },
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
