/**
 * links.js — Page: Survey Links + Analytics
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, ORG_LOOKUP, SURVEY_BASE_URL), utils.js (esc, fmtDate, fmtNum, showToast)
 *             export.js (downloadWorkbook)
 *
 * Functions:
 *   buildLinkUrl(org)
 *   renderLinks(summary)
 *   filterLinksTable()
 *   toggleLink(id, orgName, active)  → TODO: move from admin.html
 *   renderAnalytics(summary)
 *   renderWbAnalytics()              → TODO: move full impl from admin.html ~line 2210 (~380 lines)
 *   exportCompareReport()            → TODO: move from admin.html ~line 3361
 *   exportCurrentPage()              → TODO: move from admin.html ~line 3149
 */

 const WELLBEING_LINK_MAP = [
  { code: 'nesdc', label: 'NESDC', organization: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ' },
  { code: 'tpso', label: 'TPSO', organization: 'สำนักงานนโยบายและยุทธศาสตร์การค้า' },
  { code: 'dss', label: 'DSS', organization: 'กรมวิทยาศาสตร์บริการ' },
  { code: 'dhss', label: 'DHSS', organization: 'กรมสนับสนุนบริการสุขภาพ' },
  { code: 'tmd', label: 'TMD', organization: 'กรมอุตุนิยมวิทยา' },
  { code: 'dcp', label: 'DCP', organization: 'กรมส่งเสริมวัฒนธรรม' },
  { code: 'dop', label: 'DOP', organization: 'กรมคุมประพฤติ' },
  { code: 'mots', label: 'MOTS', organization: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา' },
  { code: 'dmh', label: 'DMH', organization: 'กรมสุขภาพจิต' },
  { code: 'onep', label: 'ONEP', organization: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม' },
  { code: 'nrct', label: 'NRCT', organization: 'สำนักงานการวิจัยแห่งชาติ' },
  { code: 'acfs', label: 'ACFS', organization: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ' },
  { code: 'opdc', label: 'OPDC', organization: 'สำนักงานคณะกรรมการพัฒนาระบบราชการ' },
  { code: 'rid', label: 'RID', organization: 'กรมชลประทาน' },
  { code: 'dcy', label: 'DCY', organization: 'กรมกิจการเด็กและเยาวชน' },
 ];

// ─── Build Link URL ──────────────────────────────────────────────────────────

function buildLinkUrl(org) {
  const code = String(org.org_code || org.code || '').toLowerCase();
  return `${SURVEY_BASE_URL}/?org=${code}`;
}

 function getWellbeingLinkSeed() {
  return WELLBEING_LINK_MAP.map((item) => {
    const orgProfile = state.orgProfiles.find((org) => {
      const orgName = org.org_name_th || org.organization_name || org.display_name || '';
      const orgCode = String(org.org_code || '').toLowerCase();
      return orgName === item.organization || orgCode === item.code;
    });
    return {
      id: orgProfile?.id || item.code,
      org_id: orgProfile?.id || null,
      org_code: item.code,
      org_name_th: item.organization,
      organization: item.organization,
      full_url: buildLinkUrl({ org_code: item.code }),
      is_active: true,
      created_at: null,
      short_label: item.label,
    };
  });
 }

// ─── Render Links Table ──────────────────────────────────────────────────────

function renderLinks(summary) {
  const page = document.getElementById('page-links');
  const tbody = document.getElementById('links-tbody') || page.querySelector('tbody');
  const seedMap = new Map(getWellbeingLinkSeed().map((row) => [row.org_code, row]));
  const dbRows = state.linkRows
    .map((row) => {
      const orgProfile = state.orgProfiles.find((org) => org.id === row.org_id);
      const orgName = orgProfile?.org_name_th || row.org_name_th || row.organization || '';
      const orgCode = String(row.org_code || orgProfile?.org_code || '').toLowerCase();
      return {
        ...row,
        org_name_th: orgName,
        organization: orgName,
        org_code: orgCode,
        full_url: row.full_url || row.form_url || row.url || (orgCode ? buildLinkUrl({ org_code: orgCode }) : ''),
      };
    })
    .filter((row) => seedMap.has(row.org_code));
  const merged = new Map(getWellbeingLinkSeed().map((row) => [row.org_code, row]));
  dbRows.forEach((row) => merged.set(row.org_code, { ...merged.get(row.org_code), ...row }));
  const links = WELLBEING_LINK_MAP.map((item) => merged.get(item.code)).filter(Boolean);

  function getFormType(url) {
    if (!url) return '—';
    return '<span style="font-size:11px;background:var(--AL);color:var(--A);padding:2px 8px;border-radius:99px;font-weight:600">💚 Wellbeing Survey</span>';
  }

  tbody.innerHTML = links.map((row) => {
    const organization = row.org_name_th || row.organization || '—';
    const summaryRow = summary.find((item) => item.name === organization);
    const url = row.full_url || buildLinkUrl({ org_code: row.org_code });
    const active = row.is_active !== false;
    const formType = getFormType(url);
    const respondents = fmtNum(summaryRow?.wellbeingSubmitted || 0);
    return `<tr data-org="${esc(organization)}" data-status="${active ? 'เปิดอยู่' : 'ปิด'}">
      <td>${esc(organization)}</td>
      <td>${formType}</td>
      <td><code style="font-size:10.5px;background:var(--bg);padding:3px 6px;border-radius:4px;color:var(--P)">${esc(url)}</code></td>
      <td>${respondents}</td>
      <td><span class="badge ${active ? 'bg' : 'bx'}">${active ? 'เปิดอยู่' : 'ปิด'}</span></td>
      <td>${fmtDate(row.created_at)}</td>
      <td class="td-act">
        <button class="btn b-gray" onclick="showQRModal('${esc(url)}')">QR</button>
        <button class="btn b-blue" onclick="navigator.clipboard.writeText('${esc(url)}').then(()=>showToast('คัดลอกแล้ว ✅'))">Copy</button>
        <button class="btn ${active ? 'b-red' : 'b-green'}" onclick="toggleLink('${esc(row.id || '')}','${esc(organization)}',${!active})">${active ? 'ปิด' : 'เปิด'}</button>
      </td>
    </tr>`;
  }).join('');

  const createOrgSelect = document.getElementById('create-link-org');
  if (createOrgSelect) {
    createOrgSelect.innerHTML = `<option value="">— เลือก —</option>${WELLBEING_LINK_MAP.map((item) => `<option>${esc(item.organization)}</option>`).join('')}`;
  }
  const orgFilter = document.getElementById('links-org-filter');
  if (orgFilter) {
    const cur = orgFilter.value;
    orgFilter.innerHTML = `<option value="">ทุกองค์กร</option>${WELLBEING_LINK_MAP.map((item) => item.organization).map((n) => `<option${n === cur ? ' selected' : ''}>${esc(n)}</option>`).join('')}`;
  }
}

// ─── Filter Links ─────────────────────────────────────────────────────────────

function filterLinksTable() {
  const q = (document.getElementById('links-search')?.value || '').toLowerCase();
  const org = (document.getElementById('links-org-filter')?.value || '').toLowerCase();
  const status = (document.getElementById('links-status-filter')?.value || '').toLowerCase();
  document.querySelectorAll('#links-tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const trOrg = (tr.dataset.org || '').toLowerCase();
    const trStatus = (tr.dataset.status || '').toLowerCase();
    const visible = (!q || text.includes(q)) && (!org || trOrg.includes(org)) && (!status || trStatus.includes(status));
    tr.style.display = visible ? '' : 'none';
  });
}

// ─── Analytics – CH1 KPIs ─────────────────────────────────────────────────────

function renderAnalytics(summary) {
  const ch1Page = document.getElementById('page-an-ch1');
  const totalCh1Staff = state.ch1Rows.reduce((sum, row) =>
    sum + Number(row.total_personnel || row.total_staff || row.form_data?.total_personnel || 0), 0);
  const ch1Kpis = ch1Page.querySelectorAll('.kpi .kpi-val');
  if (ch1Kpis.length >= 4) {
    ch1Kpis[0].textContent = fmtNum(totalCh1Staff);
    ch1Kpis[1].textContent = fmtNum(state.ch1Rows.length
      ? state.ch1Rows.reduce((sum, row) => sum + (parseFloat(row.ncd_ratio_pct ?? row.form_data?.ncd_ratio_pct) || 0), 0) / state.ch1Rows.length : 0, 1) + '%';
    ch1Kpis[2].textContent = fmtNum(state.ch1Rows.length
      ? state.ch1Rows.reduce((sum, row) => sum + (parseFloat(row.mental_burnout ?? row.form_data?.mental_burnout) || 0), 0) / state.ch1Rows.length : 0, 1) + '%';
    ch1Kpis[3].textContent = fmtNum(state.ch1Rows.length
      ? state.ch1Rows.reduce((sum, row) => sum + (parseFloat(row.engagement_score ?? row.form_data?.engagement_score) || 0), 0) / state.ch1Rows.length : 0, 1);
  }

  const submitted = state.surveyRows.filter((row) => !row.is_draft);
  const activeOrgs = summary.filter((org) => org.wellbeingSubmitted > 0).length;
  const subEl = document.getElementById('an-wb-sub');
  if (subEl) subEl.textContent = `ผลการสำรวจรายบุคคล ${fmtNum(submitted.length)} คน จาก ${fmtNum(activeOrgs)} องค์กร`;

  const orgFilterEl = document.getElementById('an-org-filter');
  if (orgFilterEl) {
    orgFilterEl.innerHTML = `<option value="">ทุกองค์กร</option>${ORG_NAMES.map((n) => `<option>${esc(n)}</option>`).join('')}`;
  }
}

// ─── Analytics – Wellbeing Heatmap & Org Ranking ──────────────────────────────

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

// ─── Toggle Link Active/Inactive ─────────────────────────────────────────────

async function toggleLink(id, orgName, newActive) {
  if (!id) {
    const summary = summarizeOrgs();
    renderLinks(summary);
    return;
  }
  const { error } = await sb.from('org_form_links').update({ is_active: newActive }).eq('id', id);
  if (error) { showToast('อัปเดตไม่สำเร็จ: ' + error.message, 'error'); return; }
  const row = state.linkRows.find((r) => r.id === id);
  if (row) row.is_active = newActive;
  renderLinks(summarizeOrgs());
}

// ─── Create New Link ─────────────────────────────────────────────────────────

async function createNewLink() {
  const orgName = document.getElementById('create-link-org')?.value;
  const expires = document.getElementById('create-link-expires')?.value || null;
  const msg = document.getElementById('create-link-msg');
  if (!orgName) { if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'กรุณาเลือกองค์กร'; } return; }
  const orgProfile = state.orgProfiles.find((o) => o.org_name_th === orgName) || ORG_LOOKUP.get(orgName);
  const mapped = WELLBEING_LINK_MAP.find((item) => item.organization === orgName);
  const orgCode = mapped?.code || String(orgProfile?.org_code || orgProfile?.code || '').toLowerCase();
  if (!orgCode) { if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'ไม่พบ org_code ขององค์กรนี้ในชุดลิงก์ Well-being'; } return; }
  const orgId = orgProfile?.id || null;
  const url = `${SURVEY_BASE_URL}/?org=${orgCode}`;
  if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังสร้างลิงก์...'; }

  // Look up form_id from survey_forms (required FK)
  const formKey = 'wellbeing';
  const { data: formRows } = await sb.from('survey_forms').select('id').eq('form_key', formKey).limit(1);
  const formId = formRows?.[0]?.id || null;

  const { error } = await sb.from('org_form_links').insert({ org_id: orgId, form_id: formId, full_url: url, is_active: true });
  if (error) { if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'ไม่สำเร็จ: ' + error.message; } return; }
  const { data } = await sb.from('org_form_links').select('*');
  state.linkRows = data || [];
  renderLinks(summarizeOrgs());
  if (msg) { msg.style.color = 'var(--G)'; msg.textContent = `✅ สร้างลิงก์ Well-being สำหรับ ${orgName} เรียบร้อย`; }
}

// ─── QR Code Modal ───────────────────────────────────────────────────────────

function showQRModal(path) {
  const url = path.startsWith('http') ? path : window.location.origin + '/' + path;
  const existing = document.getElementById('qr-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'qr-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  overlay.innerHTML = `<div style="background:#fff;border-radius:16px;padding:28px;text-align:center;min-width:260px;box-shadow:0 20px 40px rgba(0,0,0,.2)">
    <div style="font-weight:700;font-size:15px;margin-bottom:12px">QR Code</div>
    <div id="qr-canvas" style="margin:0 auto 12px;display:flex;justify-content:center;align-items:center"></div>
    <div style="font-size:11px;color:#64748b;word-break:break-all;max-width:220px;margin:0 auto 14px">${esc(url)}</div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn b-blue" onclick="navigator.clipboard.writeText('${esc(url)}').then(()=>showToast('คัดลอกแล้ว ✅'))">📋 Copy URL</button>
      <button class="btn b-gray" onclick="document.getElementById('qr-modal-overlay').remove()">✕ ปิด</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  try {
    new QRCode(document.getElementById('qr-canvas'), { text: url, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M });
  } catch (e) {
    document.getElementById('qr-canvas').textContent = 'QRCode library ไม่พร้อมใช้งาน';
  }
}

// ─── Export Functions ─────────────────────────────────────────────────────────

function exportCompareReport() {
  const summary = summarizeOrgs();
  downloadWorkbook('compare_report.xlsx', 'Compare', summary.map((org) => ({
    organization: org.name, ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted, wellbeing_draft: org.draft,
    high_phq9: org.flagged, ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb, latest_ch1: org.latestCh1,
  })));
}

function exportCurrentPage() {
  const pageId = visiblePageId();
  if (pageId === 'page-ch1-summary') {
    exportCh1SummaryReport();
    return;
  }
  if (pageId === 'page-form-wb') {
    exportRawTable();
    return;
  }
  if (pageId === 'page-users') {
    downloadWorkbook('admin_users.xlsx', 'Users', state.userRows);
    return;
  }
  if (pageId === 'page-links') {
    downloadWorkbook('org_form_links.xlsx', 'Links', state.linkRows.length ? state.linkRows : getOrgCatalog().map((org) => ({ organization: org.name, url: buildLinkUrl(org) })));
    return;
  }
  const summary = summarizeOrgs();
  downloadWorkbook('admin_org_summary.xlsx', 'Summary', summary.map((org) => ({
    organization: org.name,
    ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted,
    wellbeing_draft: org.draft,
    high_phq9_count: org.flagged,
    ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb,
    latest_ch1: org.latestCh1,
  })));
}
