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

// ─── Build Link URL ──────────────────────────────────────────────────────────

function buildLinkUrl(org) {
  const code = org.org_code || org.code || encodeURIComponent(org.name);
  return `${SURVEY_BASE_URL}/index.html?org=${code}`;
}

// ─── Render Links Table ──────────────────────────────────────────────────────

function renderLinks(summary) {
  const page = document.getElementById('page-links');
  const tbody = document.getElementById('links-tbody') || page.querySelector('tbody');
  const links = state.linkRows.length
    ? state.linkRows
    : getOrgCatalog().map((org) => ({ org_id: org.id, full_url: buildLinkUrl(org), is_active: true }));

  function getFormType(url) {
    if (!url) return '—';
    if (url.includes('ch1.html')) return '<span style="font-size:11px;background:var(--PL);color:var(--P);padding:2px 8px;border-radius:99px;font-weight:600">📝 Ch1</span>';
    return '<span style="font-size:11px;background:var(--AL);color:var(--A);padding:2px 8px;border-radius:99px;font-weight:600">💚 Wellbeing</span>';
  }

  tbody.innerHTML = links.map((row) => {
    const orgProfile = state.orgProfiles.find((o) => o.id === row.org_id);
    const organization = orgProfile?.org_name_th || row.org_name_th || row.organization || '—';
    const summaryRow = summary.find((item) => item.name === organization);
    const url = row.full_url || row.form_url || row.url || buildLinkUrl(orgProfile || { name: organization });
    const active = row.is_active !== false;
    const formType = getFormType(url);
    const respondents = url.includes('ch1.html')
      ? fmtNum(summaryRow?.ch1Count || 0)
      : fmtNum(summaryRow?.wellbeingSubmitted || 0);
    return `<tr data-org="${esc(organization)}" data-form="${url.includes('ch1.html') ? 'Ch1' : 'Wellbeing'}" data-status="${active ? 'เปิดอยู่' : 'ปิด'}">
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
    createOrgSelect.innerHTML = `<option value="">— เลือก —</option>${ORG_NAMES.map((name) => `<option>${esc(name)}</option>`).join('')}`;
  }
  const orgFilter = document.getElementById('links-org-filter');
  if (orgFilter) {
    const cur = orgFilter.value;
    orgFilter.innerHTML = `<option value="">ทุกองค์กร</option>${ORG_NAMES.map((n) => `<option${n === cur ? ' selected' : ''}>${esc(n)}</option>`).join('')}`;
  }
}

// ─── Filter Links ─────────────────────────────────────────────────────────────

function filterLinksTable() {
  const q = (document.getElementById('links-search')?.value || '').toLowerCase();
  const org = (document.getElementById('links-org-filter')?.value || '').toLowerCase();
  const form = (document.getElementById('links-form-filter')?.value || '').toLowerCase();
  document.querySelectorAll('#links-tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const trOrg = (tr.dataset.org || '').toLowerCase();
    const trForm = (tr.dataset.form || '').toLowerCase();
    const visible = (!q || text.includes(q)) && (!org || trOrg.includes(org)) && (!form || trForm.includes(form));
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

// ─── Analytics – Wellbeing (stub — TODO: move from admin.html ~2210–2590) ─────

// TODO: Move renderWbAnalytics()    from admin.html line ~2210 (~380 lines)
// TODO: Move buildCh1QuestionSummaries(rows) from admin.html ~2590
// TODO: Move renderMiniBars(el, items)       from admin.html ~2605
// TODO: Move renderTrendLine(...)            from admin.html ~2646
// TODO: Move renderTrendLines(...)           from admin.html ~2722
// TODO: Move renderCh1SummaryChart(...)      from admin.html ~2878
// TODO: Move exportCompareReport()           from admin.html ~3361
// TODO: Move exportCurrentPage()             from admin.html ~3149
// TODO: Move toggleLink(id, org, active)     from admin.html
