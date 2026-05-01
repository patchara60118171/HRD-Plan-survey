/**
 * ch1-helpers.js — CH1 calculation helpers, chart helpers, org multi-select, and data constants
 * Split from ch1.js (H6 fix). Depends on: config.js, utils.js, export.js
 * All function names preserved for admin.html global onclick compatibility (rule 9).
 */

function ch1v(row, key) { return row.form_data?.[key] ?? row[key]; }

function ch1FileLink(url) {
  if (!url) return '—';
  return `<a href="${esc(url)}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;white-space:nowrap">📎 ดูไฟล์</a>`;
}

function ch1Rate(row, yr) {
  const stored = ch1v(row, `rate_${yr}`);
  if (stored != null && stored !== '') return fmtNum(parseFloat(stored), 2) + '%';
  const b = parseFloat(ch1v(row, `begin_${yr}`)), e = parseFloat(ch1v(row, `end_${yr}`)), l = parseFloat(ch1v(row, `leave_${yr}`));
  if (!isNaN(b) && !isNaN(e) && !isNaN(l) && (b + e) > 0) return fmtNum((l / ((b + e) / 2)) * 100, 2) + '%';
  return '—';
}

function resetCh1SummaryFilter() {
  const allCb = document.querySelector('#ch1-org-dropdown > label input[type="checkbox"]');
  if (allCb) allCb.checked = true;
  document.querySelectorAll('#ch1-org-list input[type="checkbox"]').forEach(cb => cb.checked = true);
  ch1UpdateOrgLabel();
  renderCh1Summary();
}

// ─── CH1 Org Multi-Select Helpers ─────────────────────────────────────────────

function ch1ToggleOrgDropdown() {
  const dd = document.getElementById('ch1-org-dropdown');
  if (dd) dd.classList.toggle('show');
}
function ch1OrgCheckAll(allCb) {
  document.querySelectorAll('#ch1-org-list input[type="checkbox"]').forEach(cb => cb.checked = allCb.checked);
  ch1UpdateOrgLabel();
  renderCh1Summary();
}
function ch1OrgCheckOne() {
  const boxes = [...document.querySelectorAll('#ch1-org-list input[type="checkbox"]')];
  const allCb = document.querySelector('#ch1-org-dropdown > label input[type="checkbox"]');
  if (allCb) allCb.checked = boxes.length > 0 && boxes.every(cb => cb.checked);
  ch1UpdateOrgLabel();
  renderCh1Summary();
}
function ch1UpdateOrgLabel() {
  const btn = document.getElementById('ch1-org-toggle');
  if (!btn) return;
  const sel = ch1GetSelectedOrgs();
  if (!sel) btn.textContent = 'ทุกองค์กร ▾';
  else if (sel.length === 0) btn.textContent = '(ไม่ได้เลือก) ▾';
  else if (sel.length === 1) btn.textContent = sel[0] + ' ▾';
  else btn.textContent = sel.length + ' องค์กร ▾';
}
function ch1GetSelectedOrgs() {
  const allCb = document.querySelector('#ch1-org-dropdown > label input[type="checkbox"]');
  if (allCb && allCb.checked) return null;
  return [...document.querySelectorAll('#ch1-org-list input[type="checkbox"]:checked')].map(cb => cb.value);
}

function ch1VisibleRows() {
  const sel = ch1GetSelectedOrgs();
  if (!sel) return state.ch1Rows;
  if (!sel.length) return [];
  const orgSet = new Set(sel);
  return state.ch1Rows.filter(row => orgSet.has(getCh1Org(row)));
}

// ─── CH1 Summary Calculation Helpers ──────────────────────────────────────────

function ch1ToNumber(row, fields) {
  const list = Array.isArray(fields) ? fields : [fields];
  for (const field of list) {
    const value = ch1v(row, field);
    if (value === null || value === undefined || value === '') continue;
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return null;
}

function ch1Sum(rows, fields) {
  return rows.reduce((sum, row) => sum + (ch1ToNumber(row, fields) || 0), 0);
}

function ch1Avg(rows, fields) {
  const values = rows.map((row) => ch1ToNumber(row, fields)).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ch1RateNum(row, year) {
  const raw = ch1Rate(row, year);
  if (!raw || raw === '—') return null;
  const num = Number(String(raw).replace('%', ''));
  return Number.isNaN(num) ? null : num;
}

function ch1AvgRate(rows, year) {
  const values = rows.map((row) => ch1RateNum(row, year)).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ch1Pct(num, den) {
  if (!den) return null;
  return (num / den) * 100;
}

function ch1ShortText(value, maxLen = 90) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '—';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

function ch1TextSummary(rows, field) {
  const values = rows
    .map((row) => ch1v(row, field))
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);
  if (!values.length) return { value: 'ยังไม่มีข้อมูล', note: '—' };
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const summary = top.map(([text, count]) => `${ch1ShortText(text, 34)}${count > 1 ? ` (${count})` : ''}`).join(' · ');
  return { value: `${fmtNum(values.length)} รายการ / ${fmtNum(rows.length)} องค์กร`, note: `ตัวอย่าง: ${summary}` };
}

function ch1FileSummary(rows, field) {
  const count = rows.filter((row) => !!ch1v(row, field)).length;
  return { value: `${fmtNum(count)} / ${fmtNum(rows.length)} องค์กร`, note: count ? 'มีไฟล์แนบพร้อมใช้งาน' : 'ยังไม่มีไฟล์แนบ' };
}

function ch1MetricSummary(rows, item) {
  const unit = item.unit || '';
  if (item.type === 'sum') {
    const total = ch1Sum(rows, item.fields || item.field);
    return { value: `${fmtNum(total)}${unit ? ` ${unit}` : ''}`, note: `รวมจาก ${fmtNum(rows.length)} องค์กร` };
  }
  if (item.type === 'avg') {
    const avg = ch1Avg(rows, item.fields || item.field);
    return { value: avg == null ? '—' : `${fmtNum(avg, item.digits ?? 1)}${unit ? ` ${unit}` : ''}`, note: avg == null ? 'ยังไม่มีข้อมูล' : `เฉลี่ยจาก ${fmtNum(rows.length)} องค์กร` };
  }
  if (item.type === 'rate') {
    const avg = ch1AvgRate(rows, item.year);
    return { value: avg == null ? '—' : `${fmtNum(avg, 1)}%`, note: avg == null ? 'ยังไม่มีข้อมูล' : `ค่าเฉลี่ยอัตราออกปี ${item.year}` };
  }
  if (item.type === 'ratio') {
    const value = item.calc ? item.calc(rows) : null;
    return { value: value == null ? '—' : `${fmtNum(value, item.digits ?? 1)}%`, note: value == null ? 'ยังไม่มีข้อมูล' : item.note || 'คำนวณจากข้อมูลทั้งหมด' };
  }
  if (item.type === 'text') return ch1TextSummary(rows, item.field);
  if (item.type === 'file') return ch1FileSummary(rows, item.field);
  return { value: '—', note: '—' };
}

function ch1DecodeHtml(value) {
  const div = document.createElement('div');
  div.innerHTML = String(value ?? '');
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function ch1NumericFromText(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || text === '—') return null;
  const cleaned = text.replace(/,/g, '').replace(/%/g, '').trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function ch1FileFieldFromColumn(col) {
  if (col.key === '_strategy_file') return ['strategy_file_url'];
  if (col.key === '_orgstruct_file') return ['org_structure_file_url'];
  if (col.key === '_hrd_file') return ['hrd_plan_file_url', 'hrd_plan_url'];
  return null;
}

function ch1TopText(values, limit = 3) {
  if (!values.length) return '—';
  const counts = new Map();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, count]) => `${ch1ShortText(text, 38)}${count > 1 ? ` (${count})` : ''}`)
    .join(' · ');
}

function ch1ColumnSummary(rows, col) {
  const fileFields = ch1FileFieldFromColumn(col);
  if (fileFields) {
    const fileValues = rows.map((row) => fileFields.map((f) => ch1v(row, f)).find(Boolean)).filter(Boolean).map((v) => String(v));
    return {
      question: col.label,
      value: `${fmtNum(fileValues.length)} / ${fmtNum(rows.length)} องค์กร`,
      note: fileValues.length ? `ตัวอย่างไฟล์: ${ch1TopText(fileValues.map((v) => v.split('/').pop() || v), 2)}` : 'ยังไม่มีไฟล์แนบ',
    };
  }
  const rawValues = rows.map((row) => ch1DecodeHtml(col.get(row))).filter((v) => v && v !== '—');
  if (!rawValues.length) return { question: col.label, value: 'ยังไม่มีข้อมูล', note: '—' };
  const numericValues = rawValues.map(ch1NumericFromText).filter((v) => Number.isFinite(v));
  const numericEnough = numericValues.length >= Math.max(2, Math.floor(rawValues.length * 0.7));
  if (numericEnough) {
    const total = numericValues.reduce((s, v) => s + v, 0);
    const avg = numericValues.reduce((s, v) => s + v, 0) / numericValues.length;
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const isPct = col.label.includes('(%)') || col.label.includes('อัตรา');
    const suffix = isPct ? '%' : '';
    return {
      question: col.label,
      value: `รวม ${fmtNum(total, 1)}${suffix} · เฉลี่ย ${fmtNum(avg, 1)}${suffix}`,
      note: `ต่ำสุด ${fmtNum(min, 1)}${suffix} · สูงสุด ${fmtNum(max, 1)}${suffix} · กรอก ${fmtNum(rawValues.length)}/${fmtNum(rows.length)} องค์กร`,
    };
  }
  return {
    question: col.label,
    value: `กรอก ${fmtNum(rawValues.length)}/${fmtNum(rows.length)} องค์กร`,
    note: `พบบ่อย: ${ch1TopText(rawValues)}`,
  };
}

function buildCh1QuestionSummaries(rows) {
  const excluded = new Set(['_org', 'submitted_at', '_email']);
  return CH1_COLUMNS.filter((col) => !excluded.has(col.key)).map((col) => ch1ColumnSummary(rows, col));
}

function ch1IsEmptyQuestionSummary(item) {
  const value = String(item?.value || '').trim();
  if (!value || value === 'ยังไม่มีข้อมูล' || value === '—') return true;
  if (/^กรอก\s*0\s*\/\s*\d+\s*องค์กร$/.test(value)) return true;
  if (/^0\s*\/\s*\d+\s*องค์กร$/.test(value)) return true;
  return false;
}

// ─── Chart Helpers ────────────────────────────────────────────────────────────

function renderMiniBars(el, items) {
  if (!el) return;
  const max = Math.max(...items.map((item) => item.value), 1);
  el.innerHTML = items.length
    ? `<div class="summary-mini">${items.map((item) => {
      const pct = max ? Math.max(6, (item.value / max) * 100) : 6;
      return `<div class="summary-mini-row"><div class="summary-mini-label">${esc(item.label)}</div><div class="summary-mini-bar"><span style="width:${pct}%"></span></div><div class="summary-mini-val">${esc(item.display)}</div></div>`;
    }).join('')}</div>`
    : '<div class="summary-empty">ยังไม่มีข้อมูล</div>';
}

let CH1_TREND_UID = 0;
function nextCh1TrendUid(prefix = 'ch1-trend') {
  CH1_TREND_UID += 1;
  return `${prefix}-${CH1_TREND_UID}`;
}

function ch1TrendTooltipShow(target, event) {
  const wrap = target?.closest('.trend-wrap');
  if (!wrap) return;
  const tooltip = wrap.querySelector('.trend-tooltip');
  if (!tooltip) return;
  tooltip.textContent = target.dataset.tip || '';
  const rect = wrap.getBoundingClientRect();
  tooltip.style.left = `${Math.max(10, Math.min(rect.width - 10, event.clientX - rect.left))}px`;
  tooltip.style.top = `${Math.max(10, event.clientY - rect.top)}px`;
  tooltip.classList.add('show');
}

function ch1TrendTooltipHide(target) {
  const wrap = target?.closest('.trend-wrap');
  if (!wrap) return;
  const tooltip = wrap.querySelector('.trend-tooltip');
  if (!tooltip) return;
  tooltip.classList.remove('show');
}

function ch1Clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function renderTrendLine(el, items, opts = {}) {
  if (!el) return;
  if (!items || !items.length) { el.innerHTML = '<div class="summary-empty">ยังไม่มีข้อมูล</div>'; return; }
  const width = 620, height = 234;
  const pad = { top: 28, right: 20, bottom: 42, left: 50 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const values = items.map((item) => Number(item.value) || 0);
  const minV = Math.max(0, Math.floor((Math.min(...values) - 1) * 10) / 10);
  const maxV = Math.ceil((Math.max(...values) + 1) * 10) / 10;
  const range = Math.max(maxV - minV, 1);
  const x = (i) => pad.left + (items.length === 1 ? chartW / 2 : (i / (items.length - 1)) * chartW);
  const y = (v) => ch1Clamp(pad.top + (1 - (v - minV) / range) * chartH, pad.top, pad.top + chartH);
  const points = items.map((item, i) => ({ label: item.label, value: Number(item.value) || 0, x: x(i), y: y(Number(item.value) || 0) }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${pad.left},${pad.top + chartH} ${polyline} ${pad.left + chartW},${pad.top + chartH}`;
  const clipId = nextCh1TrendUid('clip-one');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const yy = pad.top + t * chartH; const v = maxV - t * range;
    return `<g><line x1="${pad.left}" y1="${yy}" x2="${pad.left + chartW}" y2="${yy}" stroke="#E6EDF6" stroke-width="1" /><text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#7A8EA6">${v.toFixed(1)}${opts.unit || ''}</text></g>`;
  }).join('');
  const circleEls = points.map((p) => `<g><circle cx="${p.x}" cy="${p.y}" r="4" fill="#0F4C81" /><circle class="trend-dot-hit" cx="${p.x}" cy="${p.y}" r="10" fill="transparent" data-tip="${esc(`${p.label}: ${p.value.toFixed(2)}${opts.unit || ''}`)}" onmousemove="ch1TrendTooltipShow(this,event)" onmouseenter="ch1TrendTooltipShow(this,event)" onmouseleave="ch1TrendTooltipHide(this)"><title>${p.label}: ${p.value.toFixed(2)}${opts.unit || ''}</title></circle></g>`).join('');
  const valueLabelEls = points.map((p) => `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="10" fill="#35506F">${p.value.toFixed(2)}${opts.unit || ''}</text>`).join('');
  const xLabelEls = points.map((p) => `<text x="${p.x}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="10" fill="#6B7F95">${p.label}</text>`).join('');
  const trend = points.length >= 2 ? (points[points.length - 1].value - points[0].value) : 0;
  const trendText = trend > 0 ? `แนวโน้มเพิ่มขึ้น +${trend.toFixed(2)}${opts.unit || ''}` : trend < 0 ? `แนวโน้มลดลง ${trend.toFixed(2)}${opts.unit || ''}` : 'แนวโน้มคงที่';
  const trendColor = trend > 0 ? '#B42318' : trend < 0 ? '#027A48' : '#6B7280';
  el.innerHTML = `<div class="trend-wrap"><div class="trend-tooltip" aria-hidden="true"></div><svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;overflow:hidden" role="img" aria-label="กราฟแนวโน้ม"><defs><clipPath id="${clipId}"><rect x="${pad.left}" y="${pad.top}" width="${chartW}" height="${chartH}" /></clipPath></defs>${grid}<g clip-path="url(#${clipId})"><polygon points="${area}" fill="rgba(15, 76, 129, 0.08)" /><polyline points="${polyline}" fill="none" stroke="#0F4C81" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />${circleEls}</g>${valueLabelEls}${xLabelEls}<line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /><line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /></svg><div style="font-size:11.5px;color:${trendColor};font-weight:700;margin-top:4px">${trendText}</div></div>`;
}

function renderTrendLines(el, labels, series) {
  if (!el) return;
  const validSeries = (series || []).filter((s) => Array.isArray(s.values) && s.values.length === labels.length);
  if (!labels?.length || !validSeries.length) { el.innerHTML = '<div class="summary-empty">ยังไม่มีข้อมูล</div>'; return; }
  const width = 640, height = 250;
  const pad = { top: 28, right: 22, bottom: 42, left: 54 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const allValues = validSeries.flatMap((s) => s.values.map((v) => Number(v) || 0));
  const minV = Math.max(0, Math.floor((Math.min(...allValues) - 1) * 10) / 10);
  const maxV = Math.ceil((Math.max(...allValues) + 1) * 10) / 10;
  const range = Math.max(maxV - minV, 1);
  const x = (i) => pad.left + (labels.length === 1 ? chartW / 2 : (i / (labels.length - 1)) * chartW);
  const y = (v) => ch1Clamp(pad.top + (1 - ((Number(v) || 0) - minV) / range) * chartH, pad.top, pad.top + chartH);
  const clipId = nextCh1TrendUid('clip-multi');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const yy = pad.top + t * chartH; const val = maxV - t * range;
    return `<g><line x1="${pad.left}" y1="${yy}" x2="${pad.left + chartW}" y2="${yy}" stroke="#E6EDF6" stroke-width="1"/><text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#7A8EA6">${fmtNum(val, 1)}</text></g>`;
  }).join('');
  const lineEls = validSeries.map((s) => {
    const pts = s.values.map((v, i) => ({ x: x(i), y: y(v), v: Number(v) || 0, label: labels[i] }));
    const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const dots = pts.map((p) => `<g><circle cx="${p.x}" cy="${p.y}" r="3.8" fill="${s.color}" /><circle class="trend-dot-hit" cx="${p.x}" cy="${p.y}" r="10" fill="transparent" data-tip="${esc(`${s.name} ${p.label}: ${fmtNum(p.v, 2)}`)}" onmousemove="ch1TrendTooltipShow(this,event)" onmouseenter="ch1TrendTooltipShow(this,event)" onmouseleave="ch1TrendTooltipHide(this)"><title>${s.name} ${p.label}: ${fmtNum(p.v, 2)}</title></circle></g>`).join('');
    return `<g><polyline points="${polyline}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />${dots}</g>`;
  }).join('');
  const xLabels = labels.map((lb, i) => `<text x="${x(i)}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="10" fill="#6B7F95">${lb}</text>`).join('');
  const legend = validSeries.map((s) => `<div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:99px;background:${s.color};display:inline-block"></span><span>${esc(s.name)}</span></div>`).join('');
  el.innerHTML = `<div class="trend-wrap"><div class="trend-tooltip" aria-hidden="true"></div><svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;overflow:hidden" role="img" aria-label="กราฟเส้นแนวโน้มรายปี"><defs><clipPath id="${clipId}"><rect x="${pad.left}" y="${pad.top}" width="${chartW}" height="${chartH}" /></clipPath></defs>${grid}<g clip-path="url(#${clipId})">${lineEls}</g>${xLabels}<line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /><line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /></svg><div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#4D6078;margin-top:4px">${legend}</div></div>`;
}

function renderCh1SummaryChart(el, items, formatter = (item) => fmtNum(item.value)) {
  renderMiniBars(el, items.map((item) => ({ label: item.label, value: item.value, display: formatter(item) })));
}

// ─── CH1_COLUMNS ──────────────────────────────────────────────────────────────

const CH1_COLUMNS = [
  { key: '_org', label: 'องค์กร', get: (row) => getCh1Org(row) },
  { key: 'submitted_at', label: 'วันที่ส่ง', get: (row) => fmtDate(getRowDate(row), true) },
  { key: '_email', label: 'อีเมลผู้กรอก', get: (row) => esc(ch1v(row,'respondent_email') || '—') },
  { key: 'total_staff', label: 'บุคลากรทั้งหมด (คน)', get: (row) => fmtNum(ch1v(row,'total_staff') ?? ch1v(row,'total_personnel')) },
  { key: 'strategic_overview', label: 'ภาพรวมยุทธศาสตร์', get: (row) => esc(ch1v(row,'strategic_overview') || '—') },
  { key: 'org_structure', label: 'โครงสร้างองค์กร', get: (row) => esc(ch1v(row,'org_structure') || '—') },
  { key: '_strategy_file', label: 'ไฟล์ยุทธศาสตร์', get: (row) => ch1FileLink(ch1v(row,'strategy_file_url')) },
  { key: '_orgstruct_file', label: 'ไฟล์โครงสร้างองค์กร', get: (row) => ch1FileLink(ch1v(row,'org_structure_file_url')) },
  { key: 'type_official', label: 'ข้าราชการ (คน)', get: (row) => fmtNum(ch1v(row,'type_official')) },
  { key: 'type_employee', label: 'พนักงานราชการ (คน)', get: (row) => fmtNum(ch1v(row,'type_employee')) },
  { key: 'type_contract', label: 'ลูกจ้าง (คน)', get: (row) => fmtNum(ch1v(row,'type_contract')) },
  { key: 'type_other', label: 'บุคลากรอื่นๆ (คน)', get: (row) => fmtNum(ch1v(row,'type_other')) },
  { key: 'age_u30', label: 'อายุ ≤30 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_u30') ?? ch1v(row,'age_under30')) },
  { key: 'age_31_40', label: 'อายุ 31–40 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_31_40')) },
  { key: 'age_41_50', label: 'อายุ 41–50 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_41_50')) },
  { key: 'age_51_60', label: 'อายุ 51–60 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_51_60')) },
  { key: 'service_u1', label: 'อายุราชการ <1 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_u1')) },
  { key: 'service_1_5', label: 'อายุราชการ 1–5 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_1_5')) },
  { key: 'service_6_10', label: 'อายุราชการ 6–10 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_6_10')) },
  { key: 'service_11_15', label: 'อายุราชการ 11–15 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_11_15')) },
  { key: 'service_16_20', label: 'อายุราชการ 16–20 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_16_20')) },
  { key: 'service_21_25', label: 'อายุราชการ 21–25 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_21_25')) },
  { key: 'service_26_30', label: 'อายุราชการ 26–30 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_26_30')) },
  { key: 'service_over30', label: 'อายุราชการ >30 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_over30')) },
  { key: 'pos_o1', label: 'ทั่วไป O1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o1')) },
  { key: 'pos_o2', label: 'ทั่วไป O2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o2')) },
  { key: 'pos_o3', label: 'ทั่วไป O3 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o3')) },
  { key: 'pos_o4', label: 'ทั่วไป O4 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o4')) },
  { key: 'pos_k1', label: 'วิชาการ K1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k1')) },
  { key: 'pos_k2', label: 'วิชาการ K2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k2')) },
  { key: 'pos_k3', label: 'วิชาการ K3 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k3')) },
  { key: 'pos_k4', label: 'วิชาการ K4 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k4')) },
  { key: 'pos_k5', label: 'วิชาการ K5 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k5')) },
  { key: 'pos_m1', label: 'อำนวยการ M1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_m1')) },
  { key: 'pos_m2', label: 'อำนวยการ M2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_m2')) },
  { key: 'pos_s1', label: 'บริหาร S1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_s1')) },
  { key: 'pos_s2', label: 'บริหาร S2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_s2')) },
  { key: 'begin_2564', label: 'ต้นปี 2564 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2564')) },
  { key: 'end_2564', label: 'ปลายปี 2564 (คน)', get: (row) => fmtNum(ch1v(row,'end_2564')) },
  { key: 'leave_2564', label: 'ลาออก/โอนย้าย 2564', get: (row) => fmtNum(ch1v(row,'leave_2564')) },
  { key: 'rate_2564', label: 'อัตราลาออก 2564 (%)', get: (row) => ch1Rate(row,'2564') },
  { key: 'begin_2565', label: 'ต้นปี 2565 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2565')) },
  { key: 'end_2565', label: 'ปลายปี 2565 (คน)', get: (row) => fmtNum(ch1v(row,'end_2565')) },
  { key: 'leave_2565', label: 'ลาออก/โอนย้าย 2565', get: (row) => fmtNum(ch1v(row,'leave_2565')) },
  { key: 'rate_2565', label: 'อัตราลาออก 2565 (%)', get: (row) => ch1Rate(row,'2565') },
  { key: 'begin_2566', label: 'ต้นปี 2566 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2566')) },
  { key: 'end_2566', label: 'ปลายปี 2566 (คน)', get: (row) => fmtNum(ch1v(row,'end_2566')) },
  { key: 'leave_2566', label: 'ลาออก/โอนย้าย 2566', get: (row) => fmtNum(ch1v(row,'leave_2566')) },
  { key: 'rate_2566', label: 'อัตราลาออก 2566 (%)', get: (row) => ch1Rate(row,'2566') },
  { key: 'begin_2567', label: 'ต้นปี 2567 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2567')) },
  { key: 'end_2567', label: 'ปลายปี 2567 (คน)', get: (row) => fmtNum(ch1v(row,'end_2567')) },
  { key: 'leave_2567', label: 'ลาออก/โอนย้าย 2567', get: (row) => fmtNum(ch1v(row,'leave_2567')) },
  { key: 'rate_2567', label: 'อัตราลาออก 2567 (%)', get: (row) => ch1Rate(row,'2567') },
  { key: 'begin_2568', label: 'ต้นปี 2568 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2568')) },
  { key: 'end_2568', label: 'ปลายปี 2568 (คน)', get: (row) => fmtNum(ch1v(row,'end_2568')) },
  { key: 'leave_2568', label: 'ลาออก/โอนย้าย 2568', get: (row) => fmtNum(ch1v(row,'leave_2568')) },
  { key: 'rate_2568', label: 'อัตราลาออก 2568 (%)', get: (row) => ch1Rate(row,'2568') },
  { key: 'related_policies', label: 'นโยบายที่เกี่ยวข้อง', get: (row) => esc(ch1v(row,'related_policies') || '—') },
  { key: 'context_challenges', label: 'บริบทภายนอก/ความท้าทาย', get: (row) => esc(ch1v(row,'context_challenges') || '—') },
  { key: 'disease_report_type', label: 'ประเภทรายงานโรค', get: (row) => { const v = ch1v(row,'disease_report_type'); return v === 'actual' ? 'ข้อมูลจริง' : v === 'estimated' ? 'ประมาณการ' : v === 'none' ? 'ไม่มีข้อมูล' : v === 'official_only' ? 'เฉพาะข้าราชการ' : esc(v || '—'); } },
  { key: 'disease_diabetes', label: 'เบาหวาน (คน)', get: (row) => fmtNum(ch1v(row,'disease_diabetes')) },
  { key: 'disease_hypertension', label: 'ความดันโลหิตสูง (คน)', get: (row) => fmtNum(ch1v(row,'disease_hypertension')) },
  { key: 'disease_cardiovascular', label: 'โรคหัวใจและหลอดเลือด (คน)', get: (row) => fmtNum(ch1v(row,'disease_cardiovascular')) },
  { key: 'disease_kidney', label: 'โรคไต (คน)', get: (row) => fmtNum(ch1v(row,'disease_kidney')) },
  { key: 'disease_liver', label: 'โรคตับ (คน)', get: (row) => fmtNum(ch1v(row,'disease_liver')) },
  { key: 'disease_cancer', label: 'โรคมะเร็ง (คน)', get: (row) => fmtNum(ch1v(row,'disease_cancer')) },
  { key: 'disease_obesity', label: 'ภาวะอ้วน/น้ำหนักเกิน (คน)', get: (row) => fmtNum(ch1v(row,'disease_obesity')) },
  { key: 'disease_other_count', label: 'โรคอื่นๆ (คน)', get: (row) => fmtNum(ch1v(row,'disease_other_count')) },
  { key: 'disease_other_detail', label: 'โรคอื่นๆ (ระบุ)', get: (row) => esc(ch1v(row,'disease_other_detail') || '—') },
  { key: 'ncd_count', label: 'NCD รวม (คน)', get: (row) => fmtNum(ch1v(row,'ncd_count')) },
  { key: 'ncd_ratio_pct', label: 'NCD ต่อบุคลากร (%)', get: (row) => { const v = ch1v(row,'ncd_ratio_pct'); return v != null ? fmtNum(parseFloat(v),2)+'%' : '—'; } },
  { key: 'sick_leave_report_type', label: 'ประเภทรายงานลาป่วย', get: (row) => { const v = ch1v(row,'sick_leave_report_type'); return v === 'actual' ? 'ข้อมูลจริง' : v === 'estimated' ? 'ประมาณการ' : v === 'none' ? 'ไม่มีข้อมูล' : v === 'official_only' ? 'เฉพาะข้าราชการ' : esc(v || '—'); } },
  { key: 'sick_leave_days', label: 'วันลาป่วยรวม/ปี', get: (row) => fmtNum(ch1v(row,'sick_leave_days')) },
  { key: 'sick_leave_avg', label: 'วันลาป่วยเฉลี่ย/คน/ปี', get: (row) => { const v = ch1v(row,'sick_leave_avg'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'clinic_report_type', label: 'ประเภทรายงานคลินิก', get: (row) => { const v = ch1v(row,'clinic_report_type'); return v === 'actual' ? 'ข้อมูลจริง' : v === 'estimated' ? 'ประมาณการ' : v === 'none' ? 'ไม่มีข้อมูล' : v === 'official_only' ? 'เฉพาะข้าราชการ' : esc(v || '—'); } },
  { key: 'clinic_users_per_year', label: 'ผู้ใช้คลินิก/ปี (คน)', get: (row) => fmtNum(ch1v(row,'clinic_users_per_year')) },
  { key: 'clinic_top_symptoms', label: 'อาการที่พบมากสุด', get: (row) => esc(ch1v(row,'clinic_top_symptoms') || '—') },
  { key: 'clinic_top_medications', label: 'ยาที่ใช้มากสุด', get: (row) => esc(ch1v(row,'clinic_top_medications') || '—') },
  { key: 'mental_health_report_type', label: 'ประเภทรายงานสุขภาพจิต', get: (row) => { const v = ch1v(row,'mental_health_report_type'); return v === 'actual' ? 'ข้อมูลจริง' : v === 'estimated' ? 'ประมาณการ' : v === 'none' ? 'ไม่มีข้อมูล' : v === 'official_only' ? 'เฉพาะข้าราชการ' : esc(v || '—'); } },
  { key: 'mental_stress', label: 'ภาวะเครียดเรื้อรัง', get: (row) => esc(ch1v(row,'mental_stress') || '—') },
  { key: 'mental_anxiety', label: 'ภาวะวิตกกังวล', get: (row) => esc(ch1v(row,'mental_anxiety') || '—') },
  { key: 'mental_sleep', label: 'ปัญหาการนอนหลับ', get: (row) => esc(ch1v(row,'mental_sleep') || '—') },
  { key: 'mental_burnout', label: 'ภาวะหมดไฟ (Burnout)', get: (row) => esc(ch1v(row,'mental_burnout') || '—') },
  { key: 'mental_depression', label: 'ภาวะซึมเศร้า', get: (row) => esc(ch1v(row,'mental_depression') || '—') },
  { key: 'engagement_score_2568', label: 'Engagement 2568', get: (row) => { const v = ch1v(row,'engagement_score_2568'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2567', label: 'Engagement 2567', get: (row) => { const v = ch1v(row,'engagement_score_2567'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2566', label: 'Engagement 2566', get: (row) => { const v = ch1v(row,'engagement_score_2566'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2565', label: 'Engagement 2565', get: (row) => { const v = ch1v(row,'engagement_score_2565'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2564', label: 'Engagement 2564', get: (row) => { const v = ch1v(row,'engagement_score_2564'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_low_areas', label: 'ประเด็น Engagement คะแนนต่ำ', get: (row) => esc(ch1v(row,'engagement_low_areas') || '—') },
  { key: 'other_wellbeing_surveys', label: 'ผลสำรวจสุขภาวะอื่นๆ', get: (row) => esc(ch1v(row,'other_wellbeing_surveys') || '—') },
  { key: 'mentoring_system', label: 'ระบบพี่เลี้ยง (Mentoring)', get: (row) => { const v = ch1v(row,'mentoring_system'); return v === 'full' ? 'มีตามแผน' : v === 'partial' ? 'มีไม่ครบตามแผน' : v === 'none' ? 'ไม่มี' : esc(v || '—'); } },
  { key: 'job_rotation', label: 'ระบบหมุนเวียนงาน (Job Rotation)', get: (row) => { const v = ch1v(row,'job_rotation'); return v === 'full' ? 'มีตามแผน' : v === 'partial' ? 'มีไม่ครบตามแผน' : v === 'none' ? 'ไม่มี' : esc(v || '—'); } },
  { key: 'idp_system', label: 'แผนพัฒนารายบุคคล (IDP)', get: (row) => { const v = ch1v(row,'idp_system'); return v === 'full' ? 'มีตามแผน' : v === 'partial' ? 'มีไม่ครบตามแผน' : v === 'none' ? 'ไม่มี' : esc(v || '—'); } },
  { key: 'career_path_system', label: 'เส้นทางความก้าวหน้า (Career Path)', get: (row) => { const v = ch1v(row,'career_path_system'); return v === 'full' ? 'มีตามแผน' : v === 'partial' ? 'มีไม่ครบตามแผน' : v === 'none' ? 'ไม่มี' : esc(v || '—'); } },
  { key: 'training_hours', label: 'ชั่วโมงอบรมเฉลี่ย/คน/ปี', get: (row) => esc(ch1v(row,'training_hours') || '—') },
  { key: 'digital_systems', label: 'ระบบดิจิทัลที่มี', get: (row) => { const DL = { e_doc: 'ระบบเอกสารอิเล็กทรอนิกส์', e_sign: 'ระบบลงนามอิเล็กทรอนิกส์ (E-signature)', cloud: 'ระบบ Cloud', hr_digital: 'ระบบ HR Digital', health_db: 'ระบบฐานข้อมูลสุขภาพ', none: 'ไม่มีระบบดังกล่าว' }; const v = ch1v(row,'digital_systems'); if (!v) return '—'; const arr = Array.isArray(v) ? v : String(v).split(',').map(x => x.trim()).filter(Boolean); return esc(arr.map(code => DL[code] || code).join(', ')); } },
  { key: 'ergonomics_status', label: 'สถานะ Ergonomics', get: (row) => { const v = ch1v(row,'ergonomics_status'); return v === 'none' ? 'ยังไม่มี' : v === 'planned' ? 'มีแผนแต่ยังไม่ดำเนินการ' : v === 'in_progress' ? 'อยู่ระหว่างดำเนินการ' : v === 'done' ? 'ดำเนินการแล้ว' : esc(v || '—'); } },
  { key: 'ergonomics_detail', label: 'รายละเอียด Ergonomics', get: (row) => esc(ch1v(row,'ergonomics_detail') || '—') },
  { key: 'strategic_priority_rank1', label: 'จุดเน้น อันดับ 1', get: (row) => esc(ch1v(row,'strategic_priority_rank1') || '—') },
  { key: 'strategic_priority_rank2', label: 'จุดเน้น อันดับ 2', get: (row) => esc(ch1v(row,'strategic_priority_rank2') || '—') },
  { key: 'strategic_priority_rank3', label: 'จุดเน้น อันดับ 3', get: (row) => esc(ch1v(row,'strategic_priority_rank3') || '—') },
  { key: 'strategic_priority_other', label: 'จุดเน้น อื่นๆ (ระบุ)', get: (row) => esc(ch1v(row,'strategic_priority_other') || '—') },
  { key: 'intervention_packages_feedback', label: 'ข้อเสนอแนะ Intervention Packages', get: (row) => esc(ch1v(row,'intervention_packages_feedback') || '—') },
  { key: 'hrd_plan_results', label: 'ผลการปฏิบัติตามแผน HRD', get: (row) => esc(ch1v(row,'hrd_plan_results') || '—') },
  { key: '_hrd_file', label: 'ไฟล์ HRD PLAN', get: (row) => ch1FileLink(ch1v(row,'hrd_plan_file_url') || ch1v(row,'hrd_plan_url')) },
];

// ─── CH1_SUMMARY_SECTIONS ─────────────────────────────────────────────────────

const CH1_SUMMARY_SECTIONS = [
  { title: 'โครงสร้างบุคลากร', badge: 'จำนวนและอายุ', items: [
    { label: 'บุคลากรรวม', type: 'sum', fields: ['total_staff', 'total_personnel'], unit: 'คน' },
    { label: 'ข้าราชการ', type: 'sum', field: 'type_official', unit: 'คน' },
    { label: 'พนักงานราชการ', type: 'sum', field: 'type_employee', unit: 'คน' },
    { label: 'ลูกจ้าง', type: 'sum', field: 'type_contract', unit: 'คน' },
    { label: 'บุคลากรอื่น ๆ', type: 'sum', field: 'type_other', unit: 'คน' },
    { label: 'อายุ ≤30 ปี', type: 'sum', fields: ['age_u30', 'age_under30'], unit: 'คน' },
    { label: 'อายุ 31–40 ปี', type: 'sum', field: 'age_31_40', unit: 'คน' },
    { label: 'อายุ 41–50 ปี', type: 'sum', field: 'age_41_50', unit: 'คน' },
    { label: 'อายุ 51–60 ปี', type: 'sum', field: 'age_51_60', unit: 'คน' },
  ] },
  { title: 'อายุราชการและตำแหน่ง', badge: 'เส้นทางอาชีพ', items: [
    { label: 'อายุราชการ <1 ปี', type: 'sum', field: 'service_u1', unit: 'คน' },
    { label: 'อายุราชการ 1–5 ปี', type: 'sum', field: 'service_1_5', unit: 'คน' },
    { label: 'อายุราชการ 6–10 ปี', type: 'sum', field: 'service_6_10', unit: 'คน' },
    { label: 'อายุราชการ 11–15 ปี', type: 'sum', field: 'service_11_15', unit: 'คน' },
    { label: 'อายุราชการ 16–20 ปี', type: 'sum', field: 'service_16_20', unit: 'คน' },
    { label: 'อายุราชการ 21–25 ปี', type: 'sum', field: 'service_21_25', unit: 'คน' },
    { label: 'อายุราชการ 26–30 ปี', type: 'sum', field: 'service_26_30', unit: 'คน' },
    { label: 'อายุราชการ >30 ปี', type: 'sum', field: 'service_over30', unit: 'คน' },
  ] },
  { title: 'การลาออก / โอนย้ายย้อนหลัง', badge: '5 ปี', items: [
    { label: 'อัตราออกปี 2564', type: 'rate', year: '2564' },
    { label: 'อัตราออกปี 2565', type: 'rate', year: '2565' },
    { label: 'อัตราออกปี 2566', type: 'rate', year: '2566' },
    { label: 'อัตราออกปี 2567', type: 'rate', year: '2567' },
    { label: 'อัตราออกปี 2568', type: 'rate', year: '2568' },
    { label: 'ภาพรวมยุทธศาสตร์', type: 'text', field: 'strategic_overview' },
    { label: 'โครงสร้างองค์กร', type: 'text', field: 'org_structure' },
  ] },
  { title: 'สุขภาพกาย / NCD', badge: 'โรคและการใช้บริการ', items: [
    { label: 'โรคเบาหวาน', type: 'sum', field: 'disease_diabetes', unit: 'คน' },
    { label: 'ความดันโลหิตสูง', type: 'sum', field: 'disease_hypertension', unit: 'คน' },
    { label: 'โรคหัวใจและหลอดเลือด', type: 'sum', field: 'disease_cardiovascular', unit: 'คน' },
    { label: 'โรคไต', type: 'sum', field: 'disease_kidney', unit: 'คน' },
    { label: 'โรคตับ', type: 'sum', field: 'disease_liver', unit: 'คน' },
    { label: 'โรคมะเร็ง', type: 'sum', field: 'disease_cancer', unit: 'คน' },
    { label: 'ภาวะอ้วน/น้ำหนักเกิน', type: 'sum', field: 'disease_obesity', unit: 'คน' },
    { label: 'NCD รวม', type: 'sum', field: 'ncd_count', unit: 'คน' },
    { label: 'NCD ต่อบุคลากร', type: 'ratio', digits: 2, calc: (rows) => ch1Pct(ch1Sum(rows, 'ncd_count'), ch1Sum(rows, ['total_staff', 'total_personnel'])), note: 'สัดส่วนรวมจากยอด NCD / บุคลากรรวม' },
    { label: 'วันลาป่วยรวม', type: 'sum', field: 'sick_leave_days', unit: 'วัน' },
    { label: 'วันลาป่วยเฉลี่ย/คน/ปี', type: 'avg', field: 'sick_leave_avg', unit: 'วัน' },
    { label: 'ผู้ใช้คลินิก/ปี', type: 'sum', field: 'clinic_users_per_year', unit: 'คน' },
  ] },
  { title: 'สุขภาพจิต / ความผูกพัน', badge: 'Wellbeing', items: [
    { label: 'ภาวะเครียดเรื้อรัง', type: 'text', field: 'mental_stress' },
    { label: 'ภาวะวิตกกังวล', type: 'text', field: 'mental_anxiety' },
    { label: 'ปัญหาการนอนหลับ', type: 'text', field: 'mental_sleep' },
    { label: 'ภาวะหมดไฟ', type: 'text', field: 'mental_burnout' },
    { label: 'ภาวะซึมเศร้า', type: 'text', field: 'mental_depression' },
    { label: 'Engagement Score', type: 'avg', field: 'engagement_score', unit: 'คะแนน', digits: 1 },
    { label: 'ความพึงพอใจงาน', type: 'text', field: 'job_satisfaction' },
    { label: 'ปัญหาสำคัญสุด', type: 'text', field: 'main_problem' },
  ] },
  { title: 'นโยบาย / บริบท / เอกสารแนบ', badge: 'ข้อความอธิบาย', items: [
    { label: 'นโยบายที่เกี่ยวข้อง', type: 'text', field: 'related_policies' },
    { label: 'บริบทภายนอก / ความท้าทาย', type: 'text', field: 'context_challenges' },
    { label: 'ไฟล์ยุทธศาสตร์', type: 'file', field: 'strategy_file_url' },
    { label: 'ไฟล์โครงสร้างองค์กร', type: 'file', field: 'org_structure_file_url' },
    { label: 'ผลสำรวจสุขภาพจิต', type: 'text', field: 'mental_health_report_type' },
    { label: 'ผลสำรวจ NCD', type: 'text', field: 'disease_report_type' },
    { label: 'ผลการลาป่วย', type: 'text', field: 'sick_leave_report_type' },
    { label: 'ผลการคลินิก', type: 'text', field: 'clinic_report_type' },
  ] },
];

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.org-multi-wrap')) {
    const dd = document.getElementById('ch1-org-dropdown');
    if (dd) dd.classList.remove('show');
  }
});
