/**
 * wellbeing.js — Page: Well-being Survey Data + Analytics
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES), utils.js (esc, fmtDate, fmtNum, getPhq9, getBurnout, getRowDate)
 *             export.js (downloadWorkbook)
 *
 * Functions:
 *   renderWellbeingControl(summary)
 *   renderWellbeingOrg(summary)
 *   renderWellbeingRaw()         → TODO: move full impl from admin.html ~line 1936
 *   renderRawTable()             → TODO: move full impl from admin.html ~line 2009
 *   exportRawTable()             → TODO: move full impl from admin.html ~line 2056
 *   filterRawData()              (inline filter helper)
 *   openWbRaw(orgName)
 *   showWbRowPDF(idx)            → TODO: move full impl from admin.html ~line 5036
 *   exportWbFiltered(orgFilter)  → TODO: move from export.js integration
 */

// ─── Wellbeing Control Panel ─────────────────────────────────────────────────

function renderWellbeingControl(summary) {
  const ctrl = document.getElementById('wb-ctrl');
  const submitted = state.surveyRows.filter((row) => !row.is_draft);
  const drafts = state.surveyRows.filter((row) => row.is_draft);
  const values = ctrl.querySelectorAll('.st-val');
  values[0].textContent = fmtNum(submitted.length);
  const phqHighCount = submitted.filter((r) => (getPhq9(r) || 0) >= 10).length;
  values[1].textContent = fmtNum(phqHighCount) + ' คน (' + (submitted.length ? fmtNum((phqHighCount / submitted.length) * 100, 1) : '0') + '%)';
  values[2].textContent = fmtNum(submitted.length ? submitted.reduce((s, r) => s + (getBurnout(r) || 0), 0) / submitted.length : 0, 1);

  const summaryLines = ctrl.querySelectorAll('.set-row b');
  summaryLines[0].textContent = `${fmtNum(submitted.length)} คน`;
  summaryLines[1].textContent = `${fmtNum(drafts.length)} คน`;
  summaryLines[2].textContent = `${fmtNum(summary.filter((org) => org.wellbeingSubmitted === 0).length)} องค์กร`;
  summaryLines[3].textContent = fmtDate(submitted[0] ? getRowDate(submitted[0]) : null, true);
  const avgPhq = submitted.length
    ? submitted.reduce((sum, row) => sum + (getPhq9(row) || 0), 0) / submitted.length
    : 0;
  summaryLines[4].textContent = `PHQ-9 เฉลี่ย ${fmtNum(avgPhq, 1)}`;

  const actions = ctrl.querySelectorAll('.fc-actions .btn');
  if (actions[1]) {
    actions[1].textContent = '🔗 เปิดฟอร์ม';
    actions[1].onclick = () => { window.open('index.html', '_blank'); };
  }
  if (actions[2]) {
    actions[2].textContent = '🗂️ Raw Data ครบทุกข้อ';
    actions[2].onclick = () => { window.location.href = 'admin-wb-rawdata.html'; };
  }
}

// ─── Wellbeing By Org ─────────────────────────────────────────────────────────

function renderWellbeingOrg(summary) {
  const section = document.getElementById('wb-org');
  section.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>👥 สถิติรายองค์กร</h3>
        <div class="filter-bar">
          <select class="sel" id="wb-org-filter"><option value="">ทุกสถานะ</option><option value="active">มีข้อมูล</option><option value="empty">ยังไม่มีข้อมูล</option></select>
          <button class="btn b-gray" id="wb-org-export">📤 Export</button>
        </div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>องค์กร</th><th>ตอบแล้ว</th><th>Draft</th><th>% สัดส่วนผู้ตอบ</th><th>PHQ-9 สูง</th><th>อัปเดตล่าสุด</th><th>จัดการ</th></tr></thead>
          <tbody id="wb-org-tbody"></tbody>
        </table>
      </div>
    </div>`;

  const totalSubmitted = Math.max(state.surveyRows.filter((row) => !row.is_draft).length, 1);
  const renderBody = () => {
    const filter = document.getElementById('wb-org-filter').value;
    const rows = summary.filter((org) => {
      if (filter === 'active') return org.wellbeingSubmitted > 0;
      if (filter === 'empty') return org.wellbeingSubmitted === 0;
      return true;
    });
    document.getElementById('wb-org-tbody').innerHTML = rows.map((org) => `<tr>
      <td>${esc(org.name)}</td>
      <td>${fmtNum(org.wellbeingSubmitted)}</td>
      <td>${fmtNum(org.draft)}</td>
      <td><span class="badge ${org.wellbeingSubmitted > 0 ? 'bg' : 'br'}">${fmtNum((org.wellbeingSubmitted / totalSubmitted) * 100, 1)}%</span></td>
      <td>${org.flagged ? `<span style="color:#991B1B;font-weight:700">⚠️ ${fmtNum(org.flagged)}</span>` : '—'}</td>
      <td>${fmtDate(org.latestWb)}</td>
      <td class="td-act"><button class="btn b-blue" onclick="openWbRaw('${esc(org.name)}')">ดูรายคน</button></td>
    </tr>`).join('');
  };

  document.getElementById('wb-org-filter').onchange = renderBody;
  document.getElementById('wb-org-export').onclick = () => downloadWorkbook('wellbeing_org_stats.xlsx', 'Wellbeing_By_Org', summary.map((org) => ({
    organization: org.name,
    submitted: org.wellbeingSubmitted,
    draft: org.draft,
    response_share_pct: Number(((org.wellbeingSubmitted / totalSubmitted) * 100).toFixed(1)),
    high_phq9_count: org.flagged,
    latest_submitted_at: org.latestWb,
  })));
  renderBody();
}

function openWbRaw(orgName) {
  if (typeof go === 'function') go('wellbeing-raw');
  setTimeout(() => {
    const orgFilter = document.getElementById('raw-org-filter');
    if (orgFilter) { orgFilter.value = orgName; filterRawData(); }
  }, 100);
}

// ─── Wellbeing Raw / Table (stubs — TODO: move from admin.html) ───────────────

// TODO: Move renderWellbeingRaw()  from admin.html line ~1936 (~75 lines)
// TODO: Move renderRawTable()      from admin.html line ~2009 (~50 lines)
// TODO: Move exportRawTable()      from admin.html line ~2056 (~30 lines)
// TODO: Move filterRawData()       from admin.html
// TODO: Move showWbRowPDF(idx)     from admin.html line ~5036 (~65 lines)
// TODO: Move exportWbFiltered(orgFilter) from admin.html line ~3350
