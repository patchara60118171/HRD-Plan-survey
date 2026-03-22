/**
 * organizations.js — Page: Organizations Management
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, ORG_META, sb), utils.js (esc, fmtDate, fmtNum, showToast, showConfirm)
 *
 * Functions:
 *   renderOrgs(summary)
 *   filterOrgTable()
 *   showOrgDetail(orgName)      → TODO: move full impl from admin.html ~line 1483
 *   saveOrgProfile(event)       → TODO: move full impl from admin.html ~line 1534
 *   saveSimpleOrg()             → TODO: move full impl from admin.html ~line 3260
 */

// ─── Render Orgs Table ────────────────────────────────────────────────────────

function renderOrgs(summary) {
  const table = document.querySelector('#org-table tbody');
  if (!table) return;
  if (summary.length === 0) {
    table.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">ยังไม่มีข้อมูลองค์กร</td></tr>';
    return;
  }
  table.innerHTML = summary.map((org) => {
    const ch1Status = org.ch1Count > 0 ? 'ส่งแล้ว' : 'ยังไม่เริ่ม';
    const ch1Cls = org.ch1Count > 0 ? 'bg' : 'br';
    return `<tr>
      <td>${esc(org.name)}</td>
      <td>${esc(org.ministry || '—')}</td>
      <td><span class="badge ${ch1Cls}">${ch1Status}</span></td>
      <td>${fmtNum(org.wellbeingSubmitted)}</td>
      <td>${fmtDate(org.latestCh1 || org.latestWb)}</td>
      <td class="td-act">
        <button class="btn b-blue" onclick="showOrgDetail('${esc(org.name)}')">✏️ จัดการ</button>
      </td>
    </tr>`;
  }).join('');
}

// ─── Filter Orgs ──────────────────────────────────────────────────────────────

function filterOrgTable() {
  const q = (document.getElementById('org-search')?.value || '').toLowerCase();
  const ministry = (document.getElementById('org-ministry-filter')?.value || '').toLowerCase();
  document.querySelectorAll('#org-table tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const visible = (!q || text.includes(q)) && (!ministry || text.includes(ministry));
    tr.style.display = visible ? '' : 'none';
  });
}

// ─── Stubs (full impl TODO: move from admin.html) ────────────────────────────

// TODO: Move showOrgDetail(orgName)  from admin.html line ~1483 (~50 lines)
//       Renders org detail side panel / modal with org profile form
// TODO: Move saveOrgProfile(event)   from admin.html line ~1534 (~70 lines)
//       Saves org profile (ministry, contact, website) to DB via sb.from('organizations').upsert()
// TODO: Move saveSimpleOrg()         from admin.html line ~3260 (~25 lines)
//       Quick-add new organization with just org_code + org_name_th
