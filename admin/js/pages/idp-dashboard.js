/**
 * idp-dashboard.js — แผนพัฒนาบุคลากรรายบุคคล (IDP)
 * 5 tabs: ภาพรวม · สุขภาพกาย · สุขภาพจิต · ความเหงา · แวดล้อม · รายบุคคล
 * Depends on: config.js, utils.js, export.js (all globals)
 */

/* ══ Constants ═══════════════════════════════════════════════════════════════ */

const IDP_DIMS = [
  { key: 'physical', label: 'กาย',      icon: '🏃', color: '#10B981', light: '#D1FAE5' },
  { key: 'mental',   label: 'ใจ',        icon: '🧠', color: '#F59E0B', light: '#FEF3C7' },
  { key: 'social',   label: 'สังคม',    icon: '💙', color: '#8B5CF6', light: '#EDE9FE' },
  { key: 'environ',  label: 'แวดล้อม', icon: '🌿', color: '#0EA5E9', light: '#E0F2FE' },
];

const IDP_GROUPS = {
  A: { label: 'กลุ่ม A', desc: 'เสี่ยงสูง ≥3 มิติ', color: '#DC2626', bg: '#FEF2F2', emoji: '🔴' },
  B: { label: 'กลุ่ม B', desc: 'เสี่ยงสูง 2 มิติ',  color: '#D97706', bg: '#FFFBEB', emoji: '🟠' },
  C: { label: 'กลุ่ม C', desc: 'เสี่ยงสูง 1 มิติ',  color: '#3B82F6', bg: '#EFF6FF', emoji: '🔵' },
  D: { label: 'กลุ่ม D', desc: 'ไม่มีมิติเสี่ยงสูง', color: '#059669', bg: '#F0FDF4', emoji: '🟢' },
};

/* ══ 4-Dimension Scoring ═════════════════════════════════════════════════════ */

function _idpPhysicalRisk(row) {
  const bmi = getBmiAsean(row);
  const bmiRisk = bmi && (bmi.key === 'obese1' || bmi.key === 'obese2');
  const tpax = getTpaxLevel(row);
  const exRisk = tpax != null && tpax.key === 'low';
  const sweetR = getSweetRisk(row);
  const fatR   = getFatRisk(row);
  const saltR  = getSaltRisk(row);
  const dietRisk = [sweetR, fatR, saltR].some(r => r && (r.key === 'high' || r.key === 'very_high'));
  const count = [bmiRisk, exRisk, dietRisk].filter(Boolean).length;
  if (count >= 2) return 'high';
  if (count === 1) return 'medium';
  return 'normal';
}

function _idpMentalRisk(row) {
  const tmhi = getTmhi(row);
  if (tmhi == null) return null;
  if (tmhi < 44) return 'high';
  if (tmhi <= 50) return 'medium';
  return 'normal';
}

function _idpSocialRisk(row) {
  const score = getLonelinessTotal(row, 'orig1978');
  if (score == null) return null;
  if (score > 40) return 'high';
  if (score > 20) return 'medium';
  return 'normal';
}

const _IDP_ENV_FIELDS = ['env_glare','env_noise','env_smell','env_smoke','env_posture','env_awkward'];
function _idpEnvVal(v) {
  const s = String(v ?? '').trim();
  if (!s || s.startsWith('ไม่ใช่') || s === 'false') return 0;
  const hasImpact = s.includes('มีผล') && !s.includes('ไม่มีผล') && !s.includes('ไม่มีผลกระทบ');
  if (hasImpact) return 2;
  if (s.includes('ใช่') || s.includes('มี') || s.includes('true')) return 1;
  return 0;
}
function _idpEnvRisk(row) {
  const affectedCount = _IDP_ENV_FIELDS.filter(f => _idpEnvVal(row[f]) === 2).length;
  if (affectedCount >= 2) return 'high';
  if (affectedCount >= 1) return 'medium';
  return 'normal';
}

function idpGet4Dims(row) {
  return {
    physical: _idpPhysicalRisk(row),
    mental:   _idpMentalRisk(row),
    social:   _idpSocialRisk(row),
    environ:  _idpEnvRisk(row),
  };
}

function idpGetGroup(dims) {
  const highCount = IDP_DIMS.filter(d => dims[d.key] === 'high').length;
  if (highCount >= 3) return 'A';
  if (highCount === 2) return 'B';
  if (highCount === 1) return 'C';
  return 'D';
}

/* ══ Chart Helpers ═══════════════════════════════════════════════════════════ */

function _idpBar(label, count, total, color) {
  const pct = total ? (count / total * 100) : 0;
  return `<div style="margin-bottom:9px">
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
      <span>${esc(label)}</span>
      <span style="font-weight:600;color:${color}">${fmtNum(count)} คน (${fmtNum(pct, 1)}%)</span>
    </div>
    <div style="background:#F3F4F6;border-radius:4px;height:10px">
      <div style="background:${color};width:${pct.toFixed(1)}%;height:10px;border-radius:4px;transition:width .3s"></div>
    </div>
  </div>`;
}

function _idpDonut(entries, total) {
  if (!total) return '<div style="color:var(--tx3);font-size:12px">ไม่มีข้อมูล</div>';
  const r = 42, cx = 50, cy = 50, stroke = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = entries.map(e => {
    const pct = e.count / total;
    const dash = pct * circ;
    const s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e.color}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${(circ-dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
    return s;
  }).join('');
  const legend = entries.map(e => {
    const pct = (e.count / total * 100).toFixed(1);
    return `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:5px">
      <div style="width:12px;height:12px;border-radius:3px;background:${e.color};flex-shrink:0"></div>
      <span style="flex:1">${esc(e.label)}</span>
      <span style="font-weight:600">${fmtNum(e.count)} (${pct}%)</span>
    </div>`;
  }).join('');
  return `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    <svg width="100" height="100" viewBox="0 0 100 100">${slices}</svg>
    <div style="flex:1;min-width:120px">${legend}</div>
  </div>`;
}

function _idpRadar(dimData) {
  // dimData: [{label, icon, pct, color}] — 4 items, pct 0-100
  const size = 220, cx = 110, cy = 110, maxR = 85;
  // 4 axes: top, right, bottom, left
  const angles = [-90, 0, 90, 180].map(a => a * Math.PI / 180);

  const rings = [25, 50, 75, 100].map(pct => {
    const r = maxR * pct / 100;
    const pts = angles.map(a => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#E5E7EB" stroke-width="1"/>`;
  }).join('');

  const axisLines = angles.map(a =>
    `<line x1="${cx}" y1="${cy}" x2="${(cx + maxR * Math.cos(a)).toFixed(1)}" y2="${(cy + maxR * Math.sin(a)).toFixed(1)}" stroke="#D1D5DB" stroke-width="1"/>`
  ).join('');

  const pcts = dimData.map(d => Math.max(0, Math.min(100, d.pct)));
  const dataPts = pcts.map((p, i) => {
    const r = maxR * p / 100;
    return `${(cx + r * Math.cos(angles[i])).toFixed(1)},${(cy + r * Math.sin(angles[i])).toFixed(1)}`;
  }).join(' ');

  const dots = pcts.map((p, i) => {
    const r = maxR * p / 100;
    return `<circle cx="${(cx + r * Math.cos(angles[i])).toFixed(1)}" cy="${(cy + r * Math.sin(angles[i])).toFixed(1)}" r="5" fill="${dimData[i].color}" stroke="#fff" stroke-width="1.5"/>`;
  }).join('');

  const labels = dimData.map((d, i) => {
    const lx = cx + (maxR + 18) * Math.cos(angles[i]);
    const ly = cy + (maxR + 18) * Math.sin(angles[i]);
    const anchor = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
    const dy = i === 0 ? -4 : i === 2 ? 12 : 4;
    return `<text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}" font-size="10" font-family="Sarabun,sans-serif" fill="#374151">${d.icon} ${d.label}</text>
      <text x="${lx.toFixed(1)}" y="${(ly + dy + 13).toFixed(1)}" text-anchor="${anchor}" font-size="9" font-family="Sarabun,sans-serif" fill="${d.color}" font-weight="bold">${d.pct.toFixed(0)}%</text>`;
  }).join('');

  // Center label
  const center = `<text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="9" fill="#9CA3AF" font-family="Sarabun,sans-serif">% เสี่ยงสูง</text>`;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${rings}${axisLines}
    <polygon points="${dataPts}" fill="#3B82F620" stroke="#3B82F6" stroke-width="2"/>
    ${dots}${labels}${center}
  </svg>`;
}

function _idpDimBadge(level) {
  if (level === 'high')   return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;color:#DC2626;background:#FEF2F2;border:1px solid #DC262622">เสี่ยงสูง</span>`;
  if (level === 'medium') return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;color:#D97706;background:#FFFBEB;border:1px solid #D9770622">เฝ้าระวัง</span>`;
  if (level === null)     return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;color:#9CA3AF;background:#F9FAFB;border:1px solid #E5E7EB">—</span>`;
  return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;color:#059669;background:#F0FDF4;border:1px solid #05996922">ปกติ</span>`;
}

/* ══ Tab Switching ═══════════════════════════════════════════════════════════ */

function idpSwitchTab(tabId, btn) {
  document.querySelectorAll('#page-idp .anwb-tab').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.idp-panel').forEach(p => { p.style.display = 'none'; });
  const panel = document.getElementById(`idp-panel-${tabId}`);
  if (panel) panel.style.display = '';
  const rows = (state.surveyRows || []).filter(r => !r.is_draft);
  if (tabId === 'exec')       _idpRenderExec(rows);
  else if (tabId === 'physical')   _idpRenderPhysical(rows);
  else if (tabId === 'mental')     _idpRenderMental(rows);
  else if (tabId === 'social')     _idpRenderSocial(rows);
  else if (tabId === 'environ')    _idpRenderEnviron(rows);
  else if (tabId === 'individual') { _applyIdpFilters(); _renderIdpIndividualTable(); }
}

/* ══ Tab 1: Executive Summary ════════════════════════════════════════════════ */

let _idpProfileData = [];

function _idpRenderExec(rows) {
  const scored = rows.map(row => {
    const dims = idpGet4Dims(row);
    return { row, dims, group: idpGetGroup(dims) };
  });

  const total = scored.length;
  const groupCounts = { A: 0, B: 0, C: 0, D: 0 };
  scored.forEach(s => groupCounts[s.group]++);

  const dimStats = IDP_DIMS.map(d => ({
    ...d,
    high:   scored.filter(s => s.dims[d.key] === 'high').length,
    medium: scored.filter(s => s.dims[d.key] === 'medium').length,
    normal: scored.filter(s => !s.dims[d.key] || s.dims[d.key] === 'normal').length,
  }));

  // KPI cards
  const kpiEl = document.getElementById('idp-exec-kpi');
  if (kpiEl) kpiEl.innerHTML = `<div class="kpi-grid" style="margin-bottom:16px">
    ${Object.entries(groupCounts).map(([g, cnt]) => {
      const cfg = IDP_GROUPS[g];
      return `<div class="kpi"><div class="kpi-icon">${cfg.emoji}</div>
        <div class="kpi-label">${cfg.label}</div>
        <div class="kpi-val" style="color:${cfg.color}">${fmtNum(cnt)}</div>
        <div class="kpi-sub">${cfg.desc}<br>${total ? ((cnt/total)*100).toFixed(1) : 0}%</div>
      </div>`;
    }).join('')}
    <div class="kpi"><div class="kpi-icon">👥</div><div class="kpi-label">บุคลากรทั้งหมด</div><div class="kpi-val">${fmtNum(total)}</div><div class="kpi-sub">ที่ส่งข้อมูลแล้ว</div></div>
  </div>`;

  // Dimension bars + radar
  const radarData = dimStats.map(d => ({
    label: d.label, icon: d.icon, color: d.color,
    pct: total ? (d.high / total * 100) : 0,
  }));

  const dimEl = document.getElementById('idp-exec-dims');
  if (dimEl) dimEl.innerHTML = `<div class="anwb-2col">
    <div class="card">
      <div class="card-head"><h3>📊 ความเสี่ยง 4 มิติ (% ต่อมิติ)</h3></div>
      <div class="card-body">
        ${dimStats.map(d => `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>${d.icon} <strong>${d.label}</strong></span>
            <span style="color:${d.color};font-weight:700">${total ? ((d.high/total)*100).toFixed(1) : 0}% เสี่ยงสูง</span>
          </div>
          <div style="display:flex;height:12px;border-radius:6px;overflow:hidden">
            <div style="width:${total?(d.high/total*100).toFixed(1):0}%;background:${d.color}" title="เสี่ยงสูง ${d.high} คน"></div>
            <div style="width:${total?(d.medium/total*100).toFixed(1):0}%;background:${d.color}66" title="เฝ้าระวัง ${d.medium} คน"></div>
            <div style="flex:1;background:#F3F4F6" title="ปกติ ${d.normal} คน"></div>
          </div>
          <div style="display:flex;gap:12px;font-size:10.5px;color:var(--tx3);margin-top:3px">
            <span style="color:${d.color}">■ เสี่ยงสูง ${d.high} คน</span>
            <span style="color:${d.color}88">■ เฝ้าระวัง ${d.medium} คน</span>
            <span style="color:#9CA3AF">■ ปกติ ${d.normal} คน</span>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>🎯 Radar — % เสี่ยงสูงต่อมิติ</h3></div>
      <div class="card-body" style="display:flex;flex-direction:column;align-items:center;padding:16px">
        ${_idpRadar(radarData)}
        <div style="margin-top:8px">
          ${_idpDonut(
            Object.entries(groupCounts).map(([g, cnt]) => ({ label: `${IDP_GROUPS[g].label} — ${IDP_GROUPS[g].desc}`, count: cnt, color: IDP_GROUPS[g].color })),
            total
          )}
        </div>
      </div>
    </div>
  </div>`;

  // Org comparison table
  const orgMap = new Map();
  scored.forEach(s => {
    const org = s.row.organization || 'ไม่ระบุ';
    if (!orgMap.has(org)) orgMap.set(org, { total: 0, A: 0, B: 0, C: 0, D: 0, dim: { physical: 0, mental: 0, social: 0, environ: 0 } });
    const o = orgMap.get(org);
    o.total++; o[s.group]++;
    IDP_DIMS.forEach(d => { if (s.dims[d.key] === 'high') o.dim[d.key]++; });
  });
  const orgs = [...orgMap.entries()].sort((a, b) => (b[1].A * 4 + b[1].B * 2 + b[1].C) - (a[1].A * 4 + a[1].B * 2 + a[1].C));

  const orgEl = document.getElementById('idp-exec-orgtable');
  if (orgEl) orgEl.innerHTML = !orgs.length ? '' : `<div class="card" style="margin-top:14px;margin-bottom:14px">
    <div class="card-head"><h3>🏛️ เปรียบเทียบองค์กร — 4 กลุ่ม IDP</h3><span style="font-size:11px;color:var(--tx3)">เรียงจากเสี่ยงมากสุด</span></div>
    <div class="tbl-wrap"><table>
      <thead><tr>
        <th>#</th><th>องค์กร</th><th>จำนวน</th>
        <th style="color:#DC2626">กลุ่ม A</th><th style="color:#D97706">กลุ่ม B</th>
        <th style="color:#3B82F6">กลุ่ม C</th><th style="color:#059669">กลุ่ม D</th>
        ${IDP_DIMS.map(d => `<th style="color:${d.color}">${d.icon} ${d.label} สูง</th>`).join('')}
      </tr></thead>
      <tbody>${orgs.map(([org, o], i) => `<tr>
        <td>${i+1}</td><td>${esc(org)}</td><td>${fmtNum(o.total)}</td>
        ${['A','B','C','D'].map(g => `<td><b style="color:${IDP_GROUPS[g].color}">${fmtNum(o[g])}</b> <span style="font-size:10px;color:var(--tx3)">(${o.total?(o[g]/o.total*100).toFixed(0):0}%)</span></td>`).join('')}
        ${IDP_DIMS.map(d => `<td><b style="color:${d.color}">${fmtNum(o.dim[d.key])}</b> <span style="font-size:10px;color:var(--tx3)">(${o.total?(o.dim[d.key]/o.total*100).toFixed(0):0}%)</span></td>`).join('')}
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;

  // Risk Profile (list + detail)
  _idpProfileData = scored;
  _idpRenderProfileList(scored);
}

function _idpRenderProfileList(scored) {
  const sorted = [...scored].sort((a, b) => 'ABCD'.indexOf(a.group) - 'ABCD'.indexOf(b.group));
  const profileEl = document.getElementById('idp-exec-profile');
  if (!profileEl) return;

  const listItems = sorted.slice(0, 60).map(s => {
    const cfg = IDP_GROUPS[s.group];
    const dimBars = IDP_DIMS.map(d => {
      const clr = s.dims[d.key] === 'high' ? d.color : s.dims[d.key] === 'medium' ? d.color + '55' : '#E5E7EB';
      return `<div style="flex:1;height:5px;border-radius:3px;background:${clr}" title="${d.label}: ${s.dims[d.key] || 'ปกติ'}"></div>`;
    }).join('');
    const id = s.row.id;
    return `<div class="idp-profile-item" data-rowid="${id}" onclick="idpSelectProfile('${id}')"
      style="background:#fff;border-radius:8px;padding:10px 12px;cursor:pointer;border:1px solid #E5E7EB;margin-bottom:5px;transition:all .14s">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.row.name || s.row.email || '—')}</div>
          <div style="font-size:10px;color:#9CA3AF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.row.organization || '—')}</div>
        </div>
        <span style="background:${cfg.color};color:#fff;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:800;margin-left:6px;flex-shrink:0">${s.group}</span>
      </div>
      <div style="display:flex;gap:3px">${dimBars}</div>
    </div>`;
  }).join('');

  profileEl.innerHTML = `<div class="card" style="margin-bottom:14px">
    <div class="card-head"><h3>👥 Risk Profile รายบุคคล</h3><span style="font-size:11px;color:var(--tx3)">เรียงจากเสี่ยงสูง · แสดง 60 อันดับแรก · กดชื่อเพื่อดูแผน IDP</span></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:260px 1fr;gap:16px;min-height:300px">
        <div style="max-height:540px;overflow-y:auto;padding-right:4px" id="idp-profile-list-inner">${listItems}</div>
        <div id="idp-profile-detail-wrap">
          <div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:13px;flex-direction:column;gap:8px">
            <div style="font-size:32px">🌿</div>
            <div>เลือกชื่อด้านซ้ายเพื่อดูรายละเอียด IDP</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

const _IDP_DIM_ACTIONS = {
  physical: {
    high:   'ตรวจสุขภาพเชิงลึก · โปรแกรมโภชนาการ · ออกกำลังกาย ≥150 นาที/สัปดาห์',
    medium: 'ติดตามน้ำหนัก BMI · กระตุ้นกิจกรรมทางกาย · ปรับอาหาร',
    normal: 'รักษาพฤติกรรมสุขภาพที่ดีไว้',
  },
  mental: {
    high:   'พบนักจิตวิทยา / EAP ทันที · ประเมินซ้ำรายเดือน · Resilience Training',
    medium: 'Mindfulness 10 นาที/วัน · จัดการความเครียด · ติดตามรายไตรมาส',
    normal: 'กิจกรรม Wellness ทั่วไป',
  },
  social: {
    high:   'Buddy System · Peer Support Group · กิจกรรมสร้างความสัมพันธ์',
    medium: 'Workshop ทักษะสังคม · กิจกรรมทีม',
    normal: 'รักษาเครือข่ายสังคมที่มีอยู่',
  },
  environ: {
    high:   'ประเมินสภาพแวดล้อมทันที · PPE ครบ · ปรับสภาพงาน',
    medium: 'ติดตามอาการ · ปรับปรุงสภาพแวดล้อม',
    normal: 'ดูแลสภาพแวดล้อมต่อเนื่อง',
  },
};

function idpSelectProfile(rowId) {
  const found = _idpProfileData.find(s => s.row.id === rowId);
  if (!found) return;
  const cfg = IDP_GROUPS[found.group];

  // Highlight selected item
  document.querySelectorAll('.idp-profile-item').forEach(el => {
    const isThis = el.dataset.rowid === String(rowId);
    el.style.borderColor = isThis ? cfg.color : '#E5E7EB';
    el.style.background  = isThis ? cfg.bg : '#fff';
  });

  const row = found.row;
  const dimCards = IDP_DIMS.map(d => {
    const lvl = found.dims[d.key] || 'normal';
    const rColor = lvl === 'high' ? '#EF4444' : lvl === 'medium' ? '#F59E0B' : '#10B981';
    const lvlLabel = lvl === 'high' ? 'เสี่ยงสูง' : lvl === 'medium' ? 'เฝ้าระวัง' : lvl === null ? 'ไม่มีข้อมูล' : 'ปกติ';
    return `<div style="padding:12px 14px;border-radius:10px;background:${lvl==='high'?d.light:'#F9FAFB'};border:1px solid ${lvl==='high'?d.color+'44':'#E5E7EB'};border-left:4px solid ${rColor}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:18px">${d.icon}</span>
        <span style="background:${rColor}22;color:${rColor};border:1px solid ${rColor}44;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700">${lvlLabel}</span>
      </div>
      <div style="font-size:12px;font-weight:700;color:#1F2937;margin-bottom:4px">มิติ${d.label}</div>
      <div style="font-size:11px;color:#6B7280;line-height:1.5">💡 ${_IDP_DIM_ACTIONS[d.key][lvl] || _IDP_DIM_ACTIONS[d.key].normal}</div>
    </div>`;
  }).join('');

  const timelineItems = [
    { period: '2 สัปดาห์แรก', color: '#EF4444', action: found.group === 'A' ? 'นัดพบ HR + ผู้เชี่ยวชาญ / EAP ทันที' : found.group === 'B' ? 'นัดพบ HR + ส่ง IDP แผนเบื้องต้น' : found.group === 'C' ? 'รับทราบ IDP + เลือกกิจกรรม' : 'รับข้อมูล Wellness ทั่วไป' },
    { period: 'เดือนที่ 1',    color: '#F59E0B', action: found.group === 'D' ? 'ไม่จำเป็นต้องติดตาม' : 'ประเมินความคืบหน้าครั้งแรก' },
    { period: 'ไตรมาสที่ 1',  color: '#6366F1', action: found.group === 'D' ? 'ไม่จำเป็นต้องติดตาม' : 'ทบทวน IDP + ปรับแผน' },
    { period: '6 เดือน',       color: '#10B981', action: 'ประเมินซ้ำด้วยแบบสำรวจ (ทุกกลุ่ม)' },
  ].map(t => `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px">
    <div style="width:8px;height:8px;border-radius:50%;background:${t.color};flex-shrink:0;margin-top:3px"></div>
    <div><span style="font-size:10px;font-weight:700;color:${t.color}">${t.period}: </span><span style="font-size:11px;color:#374151">${t.action}</span></div>
  </div>`).join('');

  document.getElementById('idp-profile-detail-wrap').innerHTML = `
    <div style="background:#fff;border-radius:12px;border:1px solid var(--bdr);border-top:4px solid ${cfg.color}">
      <div style="padding:16px 18px;border-bottom:1px solid var(--bdr)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
          <div>
            <div style="font-size:17px;font-weight:800;color:#111827">${esc(row.name || '—')}</div>
            <div style="font-size:12px;color:#6B7280">${esc(row.organization || '—')} · ${esc(row.job || '—')}</div>
          </div>
          <div style="text-align:center;margin-left:12px;flex-shrink:0">
            <div style="font-size:32px">${cfg.emoji}</div>
            <div style="font-size:11px;font-weight:800;color:${cfg.color}">${cfg.label}</div>
            <div style="font-size:10px;color:#9CA3AF">${cfg.desc}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${dimCards}</div>
      </div>
      <div style="padding:14px 18px">
        <div style="font-size:12px;font-weight:800;color:#0F172A;margin-bottom:8px">📅 ตารางติดตาม</div>
        <div style="background:#F0FDF4;border-radius:8px;padding:12px 14px;border:1px solid #BBF7D0">${timelineItems}</div>
        <div style="margin-top:10px;text-align:right">
          <button class="btn b-blue" onclick="idpShowDetail('${row.id}')" style="font-size:12px;padding:6px 14px">📋 ดูรายละเอียด IDP เพิ่มเติม</button>
        </div>
      </div>
    </div>`;
}

/* ══ Tab 2: Physical ═════════════════════════════════════════════════════════ */

function _idpRenderPhysical(rows) {
  const n = rows.length;
  const physGroups = { high: 0, medium: 0, normal: 0 };
  rows.forEach(r => { const g = _idpPhysicalRisk(r); physGroups[g]++; });

  // BMI
  const bmiKeys = ['underweight','normal','overweight','obese1','obese2'];
  const bmiCfg = {
    underweight: { label: 'น้ำหนักน้อย (<18.5)',  color: '#60A5FA' },
    normal:      { label: 'ปกติ (18.5–22.9)',       color: '#10B981' },
    overweight:  { label: 'น้ำหนักเกิน (23–24.9)', color: '#F59E0B' },
    obese1:      { label: 'อ้วน ระดับ 1 (25–29.9)', color: '#F97316' },
    obese2:      { label: 'อ้วน ระดับ 2 (≥30)',     color: '#EF4444' },
  };
  const bmiCounts = { underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0 };
  let bmiN = 0;
  rows.forEach(r => {
    const b = getBmiAsean(r);
    if (!b || !bmiCounts.hasOwnProperty(b.key)) return;
    bmiCounts[b.key]++; bmiN++;
  });

  // Exercise
  const exCounts = { good: 0, ok: 0, low: 0 };
  let exN = 0;
  rows.forEach(r => {
    const t = getTpaxLevel(r);
    if (!t) return;
    exCounts[t.key]++; exN++;
  });

  // Diet
  const dietTypes = [
    { key: 'sweet', fn: getSweetRisk, label: 'น้ำตาล' },
    { key: 'fat',   fn: getFatRisk,   label: 'ไขมัน' },
    { key: 'salt',  fn: getSaltRisk,  label: 'โซเดียม' },
  ];
  const dietHigh = dietTypes.map(dt => ({
    ...dt, count: rows.filter(r => { const v = dt.fn(r); return v && (v.key === 'high' || v.key === 'very_high'); }).length,
  }));

  // Substance
  const subHigh = rows.filter(r => { const v = getSubstanceRisk(r); return v && v.key === 'high'; }).length;
  const subMed  = rows.filter(r => { const v = getSubstanceRisk(r); return v && v.key === 'medium'; }).length;

  // Sedentary
  const sedRisk = rows.filter(r => { const s = getSedentaryLevel(r); return s && s.key === 'risk'; }).length;

  const el = document.getElementById('idp-physical-content');
  if (!el) return;
  el.innerHTML = `
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi r"><div class="kpi-icon">⚠️</div><div class="kpi-label">เสี่ยงสูง (กาย)</div><div class="kpi-val" style="color:#DC2626">${fmtNum(physGroups.high)}</div><div class="kpi-sub">${n?(physGroups.high/n*100).toFixed(1):0}%</div></div>
      <div class="kpi w"><div class="kpi-icon">👁️</div><div class="kpi-label">เฝ้าระวัง</div><div class="kpi-val" style="color:#D97706">${fmtNum(physGroups.medium)}</div><div class="kpi-sub">${n?(physGroups.medium/n*100).toFixed(1):0}%</div></div>
      <div class="kpi g"><div class="kpi-icon">✅</div><div class="kpi-label">ปกติ</div><div class="kpi-val" style="color:#059669">${fmtNum(physGroups.normal)}</div><div class="kpi-sub">${n?(physGroups.normal/n*100).toFixed(1):0}%</div></div>
      <div class="kpi"><div class="kpi-icon">🛋️</div><div class="kpi-label">พฤติกรรมเนือยนิ่งเสี่ยง</div><div class="kpi-val" style="color:#EF4444">${fmtNum(sedRisk)}</div><div class="kpi-sub">>10 ชม./วัน</div></div>
    </div>
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>⚖️ BMI (เกณฑ์ ASEAN)</h3></div>
        <div class="card-body">
          ${bmiKeys.map(k => _idpBar(bmiCfg[k].label, bmiCounts[k], bmiN, bmiCfg[k].color)).join('')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(bmiN)} คน</div>
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>🏃 การออกกำลังกาย (TPAX/สัปดาห์)</h3></div>
        <div class="card-body">
          ${_idpBar('ดี (≥300 นาที/สัปดาห์)', exCounts.good, exN, '#10B981')}
          ${_idpBar('เพียงพอ (150–299 นาที)', exCounts.ok, exN, '#F59E0B')}
          ${_idpBar('ไม่เพียงพอ (<150 นาที)', exCounts.low, exN, '#EF4444')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(exN)} คน</div>
        </div>
      </div>
    </div>
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>🍬 ความเสี่ยงโภชนาการ (% เสี่ยงสูง)</h3></div>
        <div class="card-body">
          ${dietHigh.map(dt => _idpBar(`${dt.label} — เสี่ยงสูง/สูงมาก`, dt.count, n, '#EF4444')).join('')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(n)} คน</div>
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>🚬 พฤติกรรมเสี่ยง (ยาสูบ/แอลกอฮอล์/สิ่งเสพติด)</h3></div>
        <div class="card-body">
          ${_idpBar('ความเสี่ยงสูง', subHigh, n, '#EF4444')}
          ${_idpBar('ความเสี่ยงปานกลาง', subMed, n, '#D97706')}
          <div style="margin-top:10px;padding:10px 12px;background:#FEF2F2;border-radius:8px;border:1px solid #FECACA">
            <div style="font-size:11px;font-weight:700;color:#DC2626;margin-bottom:4px">💡 ข้อแนะนำสำหรับผู้มีความเสี่ยงสูง</div>
            <div style="font-size:11px;color:#7F1D1D;line-height:1.5">ส่งต่อ EAP · โปรแกรมเลิกบุหรี่/แอลกอฮอล์ · ให้คำปรึกษาเชิงรุก</div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ══ Tab 3: Mental / TMHI ════════════════════════════════════════════════════ */

function _idpRenderMental(rows) {
  const tmhiRows = rows.filter(r => getTmhi(r) != null);
  const n = tmhiRows.length;
  const avgScore = n ? tmhiRows.reduce((s, r) => s + getTmhi(r), 0) / n : 0;

  const levelCounts = { good: 0, average: 0, poor: 0 };
  tmhiRows.forEach(r => { const m = getTmhiLevelMeta(getTmhi(r)); if (m.key !== 'unknown') levelCounts[m.key]++; });

  // TMHI items 1-15: items 4,5,6 (index 3,4,5) are reverse-coded
  const TMHI_DIMS = [
    { label: 'ความสุขในชีวิต',      items: [1,2,3],     color: '#F59E0B', icon: '😊' },
    { label: 'ความยืดหยุ่นทางใจ',   items: [4,5,6],     color: '#6366F1', icon: '💪', reverse: true },
    { label: 'การจัดการตนเอง',       items: [7,8,9],     color: '#10B981', icon: '🎯' },
    { label: 'การเห็นอกเห็นใจ',      items: [10,11,12],  color: '#EC4899', icon: '🤝' },
    { label: 'ความมั่นคงครอบครัว',    items: [13,14,15],  color: '#14B8A6', icon: '🏠' },
  ];

  const dimAvgs = TMHI_DIMS.map(dim => {
    const validRows = rows.filter(r => dim.items.every(i => r[`tmhi_${i}`] != null));
    if (!validRows.length) return { ...dim, avgPct: 0, count: 0 };
    const sum = validRows.reduce((s, r) => {
      return s + dim.items.reduce((ds, i) => {
        const raw = Number(r[`tmhi_${i}`]);
        const scored = (i >= 4 && i <= 6) ? (4 - raw) : (raw + 1);
        return ds + (isNaN(scored) ? 0 : scored);
      }, 0);
    }, 0);
    const maxPossible = dim.items.length * 4;
    return { ...dim, avgPct: Math.round(sum / validRows.length / maxPossible * 100), count: validRows.length };
  });

  // PHQ-9 and GAD-7 distribution (supplementary)
  const phqHigh = rows.filter(r => { const v = getPhq9(r); return v != null && v >= 10; }).length;
  const phqMed  = rows.filter(r => { const v = getPhq9(r); return v != null && v >= 5 && v < 10; }).length;
  const gadHigh = rows.filter(r => { const v = getGad7(r); return v != null && v >= 10; }).length;
  const burnHigh= rows.filter(r => { const v = getBurnout(r); return v != null && v >= 3.5; }).length;

  const el = document.getElementById('idp-mental-content');
  if (!el) return;
  el.innerHTML = `
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi g"><div class="kpi-icon">😊</div><div class="kpi-label">ดีกว่าคนทั่วไป (≥51)</div><div class="kpi-val" style="color:#059669">${fmtNum(levelCounts.good)}</div><div class="kpi-sub">${n?(levelCounts.good/n*100).toFixed(1):0}%</div></div>
      <div class="kpi w"><div class="kpi-icon">😐</div><div class="kpi-label">เท่ากับคนทั่วไป (44–50)</div><div class="kpi-val" style="color:#D97706">${fmtNum(levelCounts.average)}</div><div class="kpi-sub">${n?(levelCounts.average/n*100).toFixed(1):0}%</div></div>
      <div class="kpi r"><div class="kpi-icon">😔</div><div class="kpi-label">ต่ำกว่าคนทั่วไป (≤43)</div><div class="kpi-val" style="color:#DC2626">${fmtNum(levelCounts.poor)}</div><div class="kpi-sub">${n?(levelCounts.poor/n*100).toFixed(1):0}%</div></div>
      <div class="kpi"><div class="kpi-icon">📊</div><div class="kpi-label">คะแนนเฉลี่ย TMHI-15</div><div class="kpi-val">${avgScore.toFixed(1)}</div><div class="kpi-sub">เต็ม 60 · มีข้อมูล ${fmtNum(n)} คน</div></div>
    </div>
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>📊 ระดับสุขภาพจิต TMHI-15</h3></div>
        <div class="card-body">
          ${_idpBar('ดีกว่าคนทั่วไป (51–60)', levelCounts.good, n, '#10B981')}
          ${_idpBar('เท่ากับคนทั่วไป (44–50)', levelCounts.average, n, '#F59E0B')}
          ${_idpBar('ต่ำกว่าคนทั่วไป (≤43)', levelCounts.poor, n, '#EF4444')}
          <div style="margin-top:10px;padding:10px 12px;background:#FEF3C7;border-radius:8px;border:1px solid #FDE68A;font-size:11px;color:#78350F">
            <b>เกณฑ์กรมสุขภาพจิต 2550:</b> 51–60 = ดีกว่าคนทั่วไป · 44–50 = เท่ากับ · ≤43 = ต่ำกว่า
          </div>
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>🎯 5 มิติย่อย TMHI (% ของคะแนนสูงสุด)</h3></div>
        <div class="card-body">
          ${dimAvgs.map(d => _idpBar(`${d.icon} ${d.label}`, d.avgPct, 100, d.color)).join('')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">ยิ่งสูง = สุขภาพจิตดีกว่า</div>
        </div>
      </div>
    </div>
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>🧠 PHQ-9 / GAD-7 (ซึมเศร้า / วิตกกังวล)</h3></div>
        <div class="card-body">
          ${_idpBar('PHQ-9 ≥10 (ซึมเศร้าปานกลาง-รุนแรง)', phqHigh, rows.length, '#DC2626')}
          ${_idpBar('PHQ-9 5–9 (ซึมเศร้าเล็กน้อย)', phqMed, rows.length, '#F97316')}
          ${_idpBar('GAD-7 ≥10 (วิตกกังวลปานกลาง-รุนแรง)', gadHigh, rows.length, '#8B5CF6')}
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>🔥 Burnout / WLB / Engagement</h3></div>
        <div class="card-body">
          ${_idpBar('Burnout สูงมาก (≥3.5/5)', burnHigh, rows.length, '#EF4444')}
          ${_idpBar('Engagement ต่ำ (<50%)', rows.filter(r => { const v = getEngagement(r); return v != null && v < 50; }).length, rows.length, '#F97316')}
          ${_idpBar('WLB ต่ำ (<3.0)', rows.filter(r => { const v = getWlb(r); return v != null && v < 3.0; }).length, rows.length, '#D97706')}
        </div>
      </div>
    </div>`;
}

/* ══ Tab 4: Social / UCLA ════════════════════════════════════════════════════ */

function _idpRenderSocial(rows) {
  const mode = 'orig1978';
  const scored = rows.map(r => ({ row: r, score: getLonelinessTotal(r, mode) })).filter(r => r.score != null);
  const n = scored.length;
  const avg = n ? scored.reduce((s, r) => s + r.score, 0) / n : 0;

  const levelCounts = { low: 0, medium: 0, high: 0 };
  scored.forEach(r => {
    const lv = getLonelinessLevel3(r.score, mode);
    if (lv) levelCounts[lv.key]++;
  });

  const UCLA_DIMS = [
    { key: 'lonely',   label: 'ความรู้สึกโดดเดี่ยว',       icon: '😔', color: '#EF4444', items: [1,2,3,4,5] },
    { key: 'relation', label: 'ความสัมพันธ์ทางสังคม',      icon: '🤝', color: '#F97316', items: [6,7,8,9,10] },
    { key: 'self',     label: 'ความรู้สึกเกี่ยวกับตนเอง',  icon: '🪞', color: '#8B5CF6', items: [11,12,13,14,15] },
    { key: 'behavior', label: 'พฤติกรรมทางสังคม',           icon: '👥', color: '#0EA5E9', items: [16,17,18,19,20] },
  ];

  const dimPcts = UCLA_DIMS.map(dim => {
    const vals = scored.map(r => {
      const sum = dim.items.reduce((s, i) => {
        const v = r.row[`lonely_${i}`];
        const n = Number(v ?? '');
        return isNaN(n) ? s : s + n;
      }, 0);
      return sum / (dim.items.length * 3) * 100;
    });
    const avg = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
    return { ...dim, avgPct: avg };
  });

  const el = document.getElementById('idp-social-content');
  if (!el) return;
  el.innerHTML = `
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi r"><div class="kpi-icon">😢</div><div class="kpi-label">โดดเดี่ยวมาก (>40)</div><div class="kpi-val" style="color:#DC2626">${fmtNum(levelCounts.high)}</div><div class="kpi-sub">${n?(levelCounts.high/n*100).toFixed(1):0}%</div></div>
      <div class="kpi w"><div class="kpi-icon">😕</div><div class="kpi-label">ปานกลาง (21–40)</div><div class="kpi-val" style="color:#D97706">${fmtNum(levelCounts.medium)}</div><div class="kpi-sub">${n?(levelCounts.medium/n*100).toFixed(1):0}%</div></div>
      <div class="kpi g"><div class="kpi-icon">🙂</div><div class="kpi-label">โดดเดี่ยวน้อย (≤20)</div><div class="kpi-val" style="color:#059669">${fmtNum(levelCounts.low)}</div><div class="kpi-sub">${n?(levelCounts.low/n*100).toFixed(1):0}%</div></div>
      <div class="kpi"><div class="kpi-icon">📊</div><div class="kpi-label">คะแนนเฉลี่ย UCLA</div><div class="kpi-val">${avg.toFixed(1)}</div><div class="kpi-sub">เต็ม 60 · มีข้อมูล ${fmtNum(n)} คน</div></div>
    </div>
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>📊 ระดับความเหงา UCLA-20</h3></div>
        <div class="card-body">
          ${_idpBar('โดดเดี่ยวน้อย (≤20)', levelCounts.low, n, '#10B981')}
          ${_idpBar('โดดเดี่ยวปานกลาง (21–40)', levelCounts.medium, n, '#F59E0B')}
          ${_idpBar('โดดเดี่ยวมาก (>40)', levelCounts.high, n, '#EF4444')}
          <div style="margin-top:10px;padding:10px 12px;background:#EFF6FF;border-radius:8px;border:1px solid #BFDBFE;font-size:11px;color:#1E40AF">
            <b>เกณฑ์ UCLA 1978:</b> 0–20 = น้อย · 21–40 = ปานกลาง · 41–60 = มาก
          </div>
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>🎯 4 มิติย่อย UCLA (% คะแนนเฉลี่ย — ยิ่งสูง = ยิ่งเหงา)</h3></div>
        <div class="card-body">
          ${dimPcts.map(d => _idpBar(`${d.icon} ${d.label}`, d.avgPct, 100, d.color)).join('')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">ยิ่งสูง = ยิ่งเหงา (% ของคะแนนสูงสุดต่อมิติ)</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-head"><h3>💡 แนวทางส่งเสริมสังคม IDP</h3></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${[
            { icon: '🔴', group: 'โดดเดี่ยวมาก', action: 'Buddy System · Peer Support Group · นัดพบนักจิตวิทยา' },
            { icon: '🟠', group: 'ปานกลาง', action: 'Workshop ทักษะสังคม · กิจกรรมทีม · ส่งเสริมความสัมพันธ์' },
            { icon: '🟢', group: 'โดดเดี่ยวน้อย', action: 'รักษาเครือข่ายสังคม · กิจกรรม Wellness ทั่วไป' },
          ].map(r => `<div style="padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--bdr)">
            <div style="font-size:14px;margin-bottom:4px">${r.icon} <b>${r.group}</b></div>
            <div style="font-size:11px;color:var(--tx2);line-height:1.5">${r.action}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ══ Tab 5: Environment ══════════════════════════════════════════════════════ */

function _idpRenderEnviron(rows) {
  const n = rows.length;
  const envGroups = { high: 0, medium: 0, normal: 0 };
  rows.forEach(r => { const g = _idpEnvRisk(r); envGroups[g]++; });

  const ENV_DEFS = [
    { id: 'env_glare',   label: 'ทำงานกลางแดด/แสงจ้า',          icon: '☀️' },
    { id: 'env_noise',   label: 'เครื่องจักร/เสียงดัง/สั่นสะเทือน', icon: '🔊' },
    { id: 'env_smell',   label: 'กลิ่นสารเคมี',                  icon: '🧪' },
    { id: 'env_smoke',   label: 'ควัน/ไอระเหย',                  icon: '💨' },
    { id: 'env_posture', label: 'ท่าทางซ้ำๆ > 1.5 ชม.',          icon: '🪑' },
    { id: 'env_awkward', label: 'ท่าทางฝืนธรรมชาติ',             icon: '🏋️' },
  ];
  const envFactors = ENV_DEFS.map(f => {
    let affected = 0, exposed = 0, total = 0;
    rows.forEach(r => {
      const sc = _idpEnvVal(r[f.id]);
      if (r[f.id] == null) return;
      total++;
      if (sc === 2) affected++;
      else if (sc === 1) exposed++;
    });
    return { ...f, affected, exposed, total };
  });

  // PM2.5
  const pm25Labels = ['ไม่มีเลย','น้อย','ปานกลาง','มาก','รุนแรงมาก'];
  const pm25Colors = ['#059669','#84CC16','#D97706','#EF4444','#991B1B'];
  const pm25Counts = [0,0,0,0,0];
  let pm25N = 0;
  const _pm25v = (v) => {
    const s = String(v ?? '').trim();
    if (s.includes('รุนแรงมาก')) return 4;
    if (s === 'มาก') return 3;
    if (s.includes('ปานกลาง')) return 2;
    if (s === 'น้อย') return 1;
    if (s.includes('ไม่มีเลย')) return 0;
    return null;
  };
  rows.forEach(r => {
    const v = _pm25v(r.pm25_impact);
    if (v == null) return;
    pm25Counts[v]++; pm25N++;
  });

  // Env satisfaction (0–4)
  const envSatRows = rows.filter(r => r.env_satisfaction != null && r.env_satisfaction !== '' && !isNaN(Number(r.env_satisfaction)));
  const avgEnvSat = envSatRows.length ? envSatRows.reduce((s, r) => s + Number(r.env_satisfaction), 0) / envSatRows.length : null;

  const lifeQRows = rows.filter(r => r.life_quality != null && r.life_quality !== '' && !isNaN(Number(r.life_quality)));
  const avgLifeQ = lifeQRows.length ? lifeQRows.reduce((s, r) => s + Number(r.life_quality), 0) / lifeQRows.length : null;

  const el = document.getElementById('idp-environ-content');
  if (!el) return;
  el.innerHTML = `
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi r"><div class="kpi-icon">⚠️</div><div class="kpi-label">เสี่ยงสูง (≥2 ปัจจัยมีผล)</div><div class="kpi-val" style="color:#DC2626">${fmtNum(envGroups.high)}</div><div class="kpi-sub">${n?(envGroups.high/n*100).toFixed(1):0}%</div></div>
      <div class="kpi w"><div class="kpi-icon">👁️</div><div class="kpi-label">เฝ้าระวัง (1 ปัจจัยมีผล)</div><div class="kpi-val" style="color:#D97706">${fmtNum(envGroups.medium)}</div><div class="kpi-sub">${n?(envGroups.medium/n*100).toFixed(1):0}%</div></div>
      <div class="kpi g"><div class="kpi-icon">✅</div><div class="kpi-label">ปลอดภัย (0 ปัจจัย)</div><div class="kpi-val" style="color:#059669">${fmtNum(envGroups.normal)}</div><div class="kpi-sub">${n?(envGroups.normal/n*100).toFixed(1):0}%</div></div>
      <div class="kpi"><div class="kpi-icon">😊</div><div class="kpi-label">ความพึงพอใจแวดล้อม</div><div class="kpi-val">${avgEnvSat != null ? avgEnvSat.toFixed(2) : '—'}</div><div class="kpi-sub">เฉลี่ย 0–4 · คุณภาพชีวิต ${avgLifeQ != null ? avgLifeQ.toFixed(2) : '—'}</div></div>
    </div>
    <div class="anwb-2col">
      <div class="card"><div class="card-head"><h3>🏭 ปัจจัยเสี่ยงในที่ทำงาน (% "มีผลต่อสุขภาพ")</h3></div>
        <div class="card-body">
          ${envFactors.map(f => _idpBar(`${f.icon} ${f.label}`, f.affected, f.total || 1, '#DC2626')).join('')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">นับเฉพาะ "ใช่ — มีผลต่อสุขภาพ"</div>
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>💨 ผลกระทบจาก PM2.5 / มลพิษ</h3></div>
        <div class="card-body">
          ${pm25Labels.map((lab, i) => _idpBar(lab, pm25Counts[i], pm25N || 1, pm25Colors[i])).join('')}
          <div style="font-size:10.5px;color:var(--tx3);margin-top:6px">มีข้อมูล ${fmtNum(pm25N)} คน</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-head"><h3>💡 แนวทาง IDP ด้านสภาพแวดล้อม</h3></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${ENV_DEFS.map(f => `<div style="padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--bdr)">
            <div style="font-size:14px;margin-bottom:4px">${f.icon} <b style="font-size:12px">${f.label}</b></div>
            <div style="font-size:11px;color:var(--tx2);line-height:1.5">${
              f.id === 'env_glare'   ? 'สวมแว่นกันแดด · หมวก · ครีมกันแดด · จัดตารางหลีกเลี่ยงแดดจัด' :
              f.id === 'env_noise'   ? 'สวม Ear Plug · จัดเวลาพักในพื้นที่เงียบ · ตรวจสอบระดับเสียง' :
              f.id === 'env_smell'   ? 'สวมหน้ากาก N95 · ตรวจอุปกรณ์ป้องกัน · แจ้งผู้ดูแลความปลอดภัย' :
              f.id === 'env_smoke'   ? 'สวม PPE · ระบายอากาศ · พักในที่อากาศถ่ายเท' :
              f.id === 'env_posture' ? 'ลุกเดินทุก 30 นาที · ปรับโต๊ะ-เก้าอี้ Ergonomic · ยืดเหยียด' :
              'ฝึก Body Mechanics · ปรับวิธีทำงาน · พบนักกายภาพบำบัด'
            }</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ══ Tab 6: Individual Table ══════════════════════════════════════════════════ */

const idpState = {
  filtered: [],
  page: 1,
  pageSize: 50,
};

function _applyIdpFilters() {
  const rows = (state.surveyRows || []).filter(r => !r.is_draft);
  const search  = (document.getElementById('idp-search')?.value || '').toLowerCase();
  const org     = document.getElementById('idp-org-filter')?.value || '';
  const group   = document.getElementById('idp-group-filter')?.value || '';
  const gender  = document.getElementById('idp-gender-filter')?.value || '';
  const age     = document.getElementById('idp-age-filter')?.value || '';
  const bmiKey  = document.getElementById('idp-bmi-filter')?.value || '';
  const job     = document.getElementById('idp-job-filter')?.value || '';
  const orgType = document.getElementById('idp-orgtype-filter')?.value || '';

  idpState.filtered = rows.filter(row => {
    if (org && row.organization !== org) return false;
    if (gender && row.gender !== gender) return false;
    if (age && ageGroup(row) !== age) return false;
    if (job && row.job !== job) return false;
    if (orgType && row.org_type !== orgType) return false;
    if (bmiKey) {
      const b = getBmiAsean(row);
      if (!b || b.key !== bmiKey) return false;
    }
    if (group) {
      const dims = idpGet4Dims(row);
      if (idpGetGroup(dims) !== group) return false;
    }
    if (search) {
      const hay = [row.organization, row.email, row.name, row.job, row.title, row.org_type].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  idpState.page = 1;
}

function _renderIdpIndividualTable() {
  const tbody = document.getElementById('idp-individual-tbody');
  const meta  = document.getElementById('idp-page-info');
  if (!tbody) return;

  const total    = idpState.filtered.length;
  const pageSize = idpState.pageSize;
  const pages    = Math.max(1, Math.ceil(total / pageSize));
  if (idpState.page < 1) idpState.page = 1;
  if (idpState.page > pages) idpState.page = pages;

  const start = (idpState.page - 1) * pageSize;
  const slice = idpState.filtered.slice(start, start + pageSize);

  tbody.innerHTML = slice.map((row, idx) => {
    const dims  = idpGet4Dims(row);
    const group = idpGetGroup(dims);
    const cfg   = IDP_GROUPS[group];
    const recs  = generateIdpRecommendations(row);
    const topRec = recs.slice(0, 2).map(r => `${r.icon} ${r.action}`).join('<br>');
    return `<tr>
      <td>${start + idx + 1}</td>
      <td>${esc(row.organization || '—')}</td>
      <td>
        <div style="font-weight:600;font-size:12.5px">${esc(row.name || row.email || '—')}</div>
        <div style="font-size:11px;color:var(--tx3)">${esc(row.email || '—')}</div>
      </td>
      <td>${esc(row.gender || '—')}</td>
      <td><span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;color:${cfg.color};background:${cfg.bg};border:1px solid ${cfg.color}22">${cfg.emoji} ${cfg.label}</span></td>
      <td>${_idpDimBadge(dims.physical)}</td>
      <td>${_idpDimBadge(dims.mental)}</td>
      <td>${_idpDimBadge(dims.social)}</td>
      <td>${_idpDimBadge(dims.environ)}</td>
      <td style="min-width:160px;font-size:11.5px">${topRec || '—'}${recs.length > 2 ? `<div style="font-size:10px;color:var(--tx3)">+${recs.length-2} รายการ</div>` : ''}</td>
      <td class="td-act"><button class="btn b-blue" onclick="idpShowDetail('${row.id}')">ดู IDP</button></td>
    </tr>`;
  }).join('');

  if (meta) meta.textContent = `แสดง ${total ? start+1 : 0}–${Math.min(start+pageSize, total)} จาก ${fmtNum(total)} รายการ`;
}

/* ══ Detail Modal ════════════════════════════════════════════════════════════ */

function idpShowDetail(rowId) {
  const rows = state.surveyRows || [];
  const row  = rows.find(r => r.id === rowId);
  if (!row) return;

  const dims  = idpGet4Dims(row);
  const group = idpGetGroup(dims);
  const cfg   = IDP_GROUPS[group];
  const recs  = generateIdpRecommendations(row);

  const phq  = getPhq9(row), gad = getGad7(row), burnout = getBurnout(row);
  const eng  = getEngagement(row), wlb = getWlb(row);
  const bmi  = getBmiAsean(row), sleep = getSleep(row), tmhi = getTmhi(row);
  const ucla = getLonelinessTotal(row, 'orig1978');
  const uclaLevel = getLonelinessLevel3(ucla, 'orig1978');

  const dimDetail = IDP_DIMS.map(d => {
    const lvl = dims[d.key] || 'normal';
    const rColor = lvl === 'high' ? '#EF4444' : lvl === 'medium' ? '#F59E0B' : '#10B981';
    const lvlLabel = lvl === 'high' ? 'เสี่ยงสูง' : lvl === 'medium' ? 'เฝ้าระวัง' : lvl === null ? '—' : 'ปกติ';
    return `<div style="padding:12px 14px;border-radius:10px;background:${lvl==='high'?d.light:'#F9FAFB'};border:1px solid ${lvl==='high'?d.color+'44':'#E5E7EB'};border-left:4px solid ${rColor}">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:16px">${d.icon}</span>
        <span style="background:${rColor}22;color:${rColor};border:1px solid ${rColor}44;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700">${lvlLabel}</span>
      </div>
      <div style="font-size:12px;font-weight:700;color:#1F2937;margin-bottom:3px">มิติ${d.label}</div>
      <div style="font-size:10.5px;color:#6B7280;line-height:1.5">💡 ${_IDP_DIM_ACTIONS[d.key][lvl] || _IDP_DIM_ACTIONS[d.key].normal}</div>
    </div>`;
  }).join('');

  const scoreGrid = [
    { label: 'PHQ-9', val: phq, bad: 10, warn: 5, fmt: v => v },
    { label: 'GAD-7', val: gad, bad: 10, warn: 5, fmt: v => v },
    { label: 'Burnout', val: burnout, bad: 3.5, warn: 2.5, fmt: v => v?.toFixed(1), max: '/5' },
    { label: 'Engagement', val: eng, bad: 50, warn: 65, invert: true, fmt: v => v?.toFixed(0), max: '/100' },
    { label: 'WLB', val: wlb, bad: 3.0, warn: 3.5, invert: true, fmt: v => v?.toFixed(1), max: '/5' },
    { label: 'BMI', val: bmi?.bmi, bad: 25, warn: 23, fmt: v => v?.toFixed(1), sub: bmi?.label },
    { label: 'นอน (ชม.)', val: Number(sleep) || null, bad: 6, warn: 7, invert: true, fmt: v => v?.toFixed(1) },
    { label: 'TMHI-15', val: tmhi, bad: 44, warn: 51, invert: true, fmt: v => v, max: '/60' },
    { label: 'UCLA', val: ucla, bad: 40, warn: 20, fmt: v => v, sub: uclaLevel?.label },
  ].map(m => {
    if (m.val == null) return `<div style="padding:10px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--bdr)">
      <div style="font-size:10px;color:var(--tx3)">${m.label}</div>
      <div style="font-weight:700;font-size:16px;color:#9CA3AF">—</div>
    </div>`;
    const isBad  = m.invert ? m.val < m.bad  : m.val >= m.bad;
    const isWarn = m.invert ? m.val < m.warn : m.val >= m.warn;
    const color  = isBad ? '#DC2626' : isWarn ? '#D97706' : '#059669';
    return `<div style="padding:10px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--bdr)">
      <div style="font-size:10px;color:var(--tx3);margin-bottom:2px">${m.label}</div>
      <div style="font-weight:700;font-size:16px;color:${color}">${m.fmt(m.val)}${m.max||''}</div>
      ${m.sub ? `<div style="font-size:10px;color:var(--tx3)">${esc(m.sub)}</div>` : ''}
    </div>`;
  }).join('');

  const recsHtml = recs.length ? recs.map(r => `
    <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr)">
      <div style="font-size:18px;flex-shrink:0">${r.icon}</div>
      <div><div style="font-weight:600;font-size:12.5px">${esc(r.area)} — ${esc(r.action)}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:2px">${esc(r.detail)}</div>
      </div>
    </div>`).join('') :
    '<div style="padding:16px;color:var(--tx3);text-align:center">ไม่มีข้อเสนอแนะเฉพาะ — สุขภาพโดยรวมอยู่ในเกณฑ์ดี ✓</div>';

  document.getElementById('idp-detail-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div>
        <div style="font-weight:800;font-size:18px">${esc(row.name || '—')}</div>
        <div style="font-size:12px;color:var(--tx2)">${esc(row.organization || '—')} · ${esc(row.job || '—')}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:2px">${esc(row.email || '—')} · ${ageGroup(row)}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:36px">${cfg.emoji}</div>
        <div style="font-size:12px;font-weight:800;color:${cfg.color}">${cfg.label}</div>
        <div style="font-size:10px;color:#9CA3AF">${cfg.desc}</div>
      </div>
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">🎯 สถานะ 4 มิติสุขภาวะ</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:16px">${dimDetail}</div>

    <div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:8px">📊 ตัวชี้วัดสุขภาวะ</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-bottom:16px">${scoreGrid}</div>

    <div style="font-size:12px;font-weight:700;color:var(--tx);margin-bottom:4px;padding-bottom:6px;border-bottom:2px solid var(--bdr)">📝 แผนพัฒนาบุคลากรรายบุคคล (IDP)</div>
    ${recsHtml}`;

  const modal = document.getElementById('idp-detail-modal');
  if (modal) modal.style.display = 'flex';
}

function idpCloseDetail() {
  const modal = document.getElementById('idp-detail-modal');
  if (modal) modal.style.display = 'none';
}

/* ══ Recommendations (original logic, kept for individual table) ═════════════ */

function generateIdpRecommendations(row) {
  const recs = [];
  const phq = getPhq9(row), gad = getGad7(row), burnout = getBurnout(row);
  const eng = getEngagement(row), wlb = getWlb(row), bmi = getBmiAsean(row);
  const sleep = getSleep(row), tmhi = getTmhi(row);

  if (phq != null && phq >= 10) recs.push({ area: 'สุขภาพจิต', action: 'ส่งต่อพบนักจิตวิทยา/จิตแพทย์', detail: `PHQ-9 = ${phq}`, icon: '🧠' });
  else if (phq != null && phq >= 5) recs.push({ area: 'สุขภาพจิต', action: 'ติดตามอาการซึมเศร้ารายเดือน', detail: `PHQ-9 = ${phq}`, icon: '🧠' });
  if (gad != null && gad >= 10) recs.push({ area: 'สุขภาพจิต', action: 'จัดกลุ่มส่งเสริมการผ่อนคลาย', detail: `GAD-7 = ${gad}`, icon: '🧘' });
  else if (gad != null && gad >= 5) recs.push({ area: 'สุขภาพจิต', action: 'สอนเทคนิคจัดการความวิตกกังวล', detail: `GAD-7 = ${gad}`, icon: '🧘' });
  if (tmhi != null && tmhi < 44) recs.push({ area: 'สุขภาพจิต', action: 'เข้าร่วมกิจกรรมส่งเสริมสุขภาพจิต', detail: `TMHI-15 = ${tmhi}`, icon: '💬' });
  if (burnout != null && burnout >= 3.5) recs.push({ area: 'การทำงาน', action: 'ลดภาระงาน / ปรับแผน', detail: `Burnout = ${burnout.toFixed(1)}`, icon: '🔥' });
  else if (burnout != null && burnout >= 2.5) recs.push({ area: 'การทำงาน', action: 'ประเมินภาระงาน', detail: `Burnout = ${burnout.toFixed(1)}`, icon: '🔥' });
  if (eng != null && eng < 50) recs.push({ area: 'การทำงาน', action: 'สัมภาษณ์ความพึงพอใจ / ปรับบทบาท', detail: `Engagement = ${eng.toFixed(0)}`, icon: '💼' });
  if (wlb != null && wlb < 3.0) recs.push({ area: 'Work-Life Balance', action: 'ปรับเวลาทำงาน / กิจกรรมครอบครัว', detail: `WLB = ${wlb.toFixed(1)}`, icon: '⚖️' });
  if (bmi && (bmi.key === 'obese1' || bmi.key === 'obese2')) recs.push({ area: 'สุขภาพกาย', action: 'ส่งเสริมโครงการลดน้ำหนัก', detail: `BMI = ${bmi.bmi.toFixed(1)} (${bmi.label})`, icon: '🏃' });
  const sleepN = Number(sleep);
  if (!isNaN(sleepN) && sleepN > 0 && sleepN < 6) recs.push({ area: 'สุขภาพกาย', action: 'สอน Sleep Hygiene', detail: `นอน ${sleepN} ชม./วัน`, icon: '😴' });
  return recs;
}

/* ══ Init / Wire-up ══════════════════════════════════════════════════════════ */

/**
 * หน้า IDP ของ admin ได้ย้ายไปใช้ดีไซน์ /idp-dashboard/ (React + Recharts + Supabase)
 * แบบฝัง iframe เพื่อยกดีไซน์และฟีเจอร์ครบชุดมาใช้โดยตรง (ดู admin.html #page-idp)
 * ฟังก์ชันเก่าด้านบนยังอยู่เพื่อรองรับ export/ลิงก์ภายในกรณีเรียกจากที่อื่น
 */
function initIdpDashboard() {
  const iframe = document.getElementById('idp-iframe');
  if (!iframe) return;
  const target = '/idp-dashboard/';
  // โหลดครั้งแรกเท่านั้น: set src; ครั้งต่อไปคงสถานะเดิมเพื่อไม่ต้องดึง Supabase ซ้ำ
  // (ผู้ใช้กดปุ่ม "รีเฟรช" เองถ้าต้องการข้อมูลล่าสุด)
  if (!iframe.dataset.loaded) {
    iframe.src = target;
    iframe.dataset.loaded = '1';
  }
  // else: do nothing — iframe retains its cached DOM, data, and scroll state
}

/** บังคับรีโหลด iframe — เรียกจากปุ่มรีเฟรชเท่านั้น */
function reloadIdpDashboard() {
  const iframe = document.getElementById('idp-iframe');
  if (!iframe) return;
  const target = '/idp-dashboard/';
  try { iframe.contentWindow.location.reload(); }
  catch (_) { iframe.src = target + '?t=' + Date.now(); }
}
if (typeof window !== 'undefined') window.reloadIdpDashboard = reloadIdpDashboard;

function _idpExportIndividual() {
  const rows = idpState.filtered;
  if (!rows.length) { showToast('ไม่มีข้อมูล', 'warn'); return; }
  const data = rows.map((row, i) => {
    const dims  = idpGet4Dims(row);
    const group = idpGetGroup(dims);
    const recs  = generateIdpRecommendations(row);
    const bmi = getBmiAsean(row);
    return {
      ลำดับ: i+1, องค์กร: row.organization||'—', ประเภทตำแหน่ง: row.org_type||'—',
      ชื่อ: row.name||'—', อีเมล: row.email||'—',
      เพศ: row.gender||'—', กลุ่มอายุ: ageGroup(row), ตำแหน่ง: row.job||'—',
      BMI_ระดับ: bmi?.label||'—',
      กลุ่ม_IDP: group, มิติกาย: dims.physical||'—', มิติใจ: dims.mental||'—',
      มิติสังคม: dims.social||'—', มิติแวดล้อม: dims.environ||'—',
      PHQ_9: getPhq9(row)??'—', GAD_7: getGad7(row)??'—', Burnout: getBurnout(row)??'—',
      Engagement: getEngagement(row)??'—', WLB: getWlb(row)??'—',
      BMI: getBmiAsean(row)?.bmi??'—', TMHI_15: getTmhi(row)??'—',
      UCLA: getLonelinessTotal(row,'orig1978')??'—',
      จำนวนข้อเสนอแนะ: recs.length,
      ข้อเสนอ_1: recs[0]?.action||'', ข้อเสนอ_2: recs[1]?.action||'', ข้อเสนอ_3: recs[2]?.action||'',
    };
  });
  downloadWorkbook('idp-dashboard.xlsx', 'IDP_Data', data);
  showToast('Export IDP สำเร็จ', 'success');
}
