/**
 * ch1.js — Entry point: renderCh1() + wiring
 * H6 refactor: split into ch1-helpers.js, ch1-table.js, ch1-export.js
 * This file is loaded LAST and only contains the main renderCh1() entry.
 * Depends on: ch1-helpers.js, ch1-table.js, ch1-export.js (loaded before this)
 */

// ─── renderCh1 ────────────────────────────────────────────────────────────────

function renderCh1(summary) {
  const responded = summary.filter((org) => org.ch1Count > 0);
  const orgCount = ORG_NAMES.length;
  const ctrl = document.getElementById('c1-ctrl');
  if (ctrl) {
    const stats = ctrl.querySelectorAll('.st-val');
    if (stats[0]) stats[0].textContent = fmtNum(responded.length);
    if (stats[1]) stats[1].textContent = fmtNum(orgCount - responded.length);
    if (stats[2]) stats[2].textContent = '5';
    const badge = ctrl.querySelector('.fc-head .badge');
    if (badge) badge.textContent = responded.length ? 'เชื่อมต่อแล้ว' : 'ยังไม่มีข้อมูล';

    const linkSelect = ctrl.querySelector('select');
    if (linkSelect) {
      linkSelect.innerHTML = `<option value="">-- เลือกองค์กร --</option>${getOrgCatalog().map((org) => `<option value="${esc(org.name)}">${esc(org.name)}</option>`).join('')}`;
      linkSelect.onchange = () => {
        const selected = ORG_LOOKUP.get(linkSelect.value);
        const code = selected?.code || 'ORG';
        const codeBox = ctrl.querySelector('.code-box code');
        if (codeBox) codeBox.textContent = `ch1.html?org=${code}`;
      };
    }
  }

  const ch1DataTbody = document.getElementById('c1-data-tbody') || document.querySelector('#c1-data tbody');
  if (ch1DataTbody) ch1DataTbody.innerHTML = state.ch1Rows.map((row, index) => `<tr>
    <td>${esc(getCh1Org(row))}</td>
    <td>${fmtNum(row.total_staff || row.total_personnel || row.form_data?.total_personnel)}</td>
    <td>${esc(row.form_completion || '5/5 ส่วน')}</td>
    <td>${fmtDate(getRowDate(row))}</td>
    <td class="td-act"><button class="btn b-blue" onclick="showCh1PDF(${index})">📄 PDF</button><button class="btn b-gray" onclick="exportCh1RowDocs(${index})">📝 Docs</button></td>
  </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล Ch1</td></tr>';

  renderCh1RawSheet();
  renderCh1Pdf();
}
