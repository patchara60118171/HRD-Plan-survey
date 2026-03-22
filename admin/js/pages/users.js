/**
 * users.js — Page: User Management
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, ORG_LOOKUP, sb), utils.js (esc, fmtDate, fmtNum, showToast, showConfirm)
 *             services/users.js (saveUserFromModal, showChangePasswordModal, deleteViewer, etc.)
 *
 * Functions:
 *   renderUsers()
 *   filterUsersTable()
 *   renderOrgHrCredentials()
 *   exportOrgHrCredentialsCsv()
 *   showAddUserModal()          → delegates to services/users.js
 *   showEditUserModal(email)    → delegates to services/users.js
 */

// ─── Constants (referenced by users page) ─────────────────────────────────────
// Note: SURVEY_BASE_URL and LOCKED_SUPERADMIN_EMAILS defined in admin.html inline
// They will be moved here in final cleanup after Sprint 3C is complete.

// ─── Render Users Table ───────────────────────────────────────────────────────

function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  const myRole = state.myRole || 'superadmin';
  const rows = state.userRows;

  function roleBadge(role) {
    const cls = role === 'superadmin' || role === 'super_admin'
      ? 'superadmin' : role === 'admin' ? 'admin' : role === 'org_hr' ? 'orghr' : 'viewer';
    const label = role === 'superadmin' || role === 'super_admin'
      ? '👑 Super Admin' : role === 'admin' ? '🔧 Admin' : role === 'org_hr' ? '🏢 Org HR' : '👁 Viewer';
    return `<span class="u-role-tag ${cls}">${label}</span>`;
  }

  function getAccessibleOrgLabel(row, rowRole) {
    if (rowRole === 'org_hr') return row.org_code || row.org_name || '—';
    return row.org_name || 'ทุกองค์กร';
  }

  tbody.innerHTML = rows.map((row) => {
    const isLocked = LOCKED_SUPERADMIN_EMAILS.includes(row.email);
    const rowRole = isLocked ? 'superadmin' : (row.role || 'viewer');
    const canManage = !isLocked && (myRole === 'superadmin' || (myRole === 'admin' && rowRole === 'viewer'));
    return `<tr ${isLocked ? 'style="background:#FFFBEB"' : ''}>
      <td>${esc(row.email)}${isLocked ? ' <span style="font-size:10px;color:#92400E;font-weight:600;background:#FEF3CD;padding:1px 5px;border-radius:4px">🔒 Locked</span>' : ''}</td>
      <td>${roleBadge(rowRole)}</td>
      <td>${esc(getAccessibleOrgLabel(row, rowRole))}</td>
      <td>${fmtDate(row.last_login_at)}</td>
      <td><span class="badge ${row.is_active === false ? 'bx' : 'bg'}">${row.is_active === false ? 'Inactive' : 'Active'}</span></td>
      <td>${fmtDate(row.expires_at)}</td>
      <td class="td-act">
        ${isLocked
          ? `<button class="btn b-gray" style="font-size:12px" onclick="showChangePasswordModal('${esc(row.email)}')">🔐 รหัสผ่าน</button>`
          : canManage
            ? `<button class="btn b-gray" onclick="showEditUserModal('${esc(row.email)}')">✏️ จัดการ</button>
               <button class="btn b-red" onclick="deleteViewer('${esc(row.id)}','${esc(row.email)}')">🗑️ ลบ</button>`
            : `<span style="font-size:11px;color:var(--tx3)">—</span>`}
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูลผู้ใช้</td></tr>';

  const orgFilter = document.getElementById('users-org-filter');
  if (orgFilter) {
    const cur = orgFilter.value;
    orgFilter.innerHTML = `<option value="">ทุกองค์กร</option>${ORG_NAMES.map((name) =>
      `<option${name === cur ? ' selected' : ''}>${esc(name)}</option>`).join('')}`;
  }

  // Credentials ของ org_hr ให้เห็นเฉพาะ admin/superadmin เท่านั้น
  const credCard = document.getElementById('orghr-cred-card');
  if (credCard) {
    const canViewCred = myRole === 'admin' || myRole === 'superadmin';
    credCard.style.display = canViewCred ? '' : 'none';
  }
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function filterUsersTable() {
  const q = (document.getElementById('users-search')?.value || '').toLowerCase();
  const org = (document.getElementById('users-org-filter')?.value || '').toLowerCase();
  const role = (document.getElementById('users-role-filter')?.value || '').toLowerCase();
  document.querySelectorAll('#users-tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const visible = (!q || text.includes(q)) && (!org || text.includes(org)) && (!role || text.includes(role));
    tr.style.display = visible ? '' : 'none';
  });
}

// ─── Org HR Credentials Table ─────────────────────────────────────────────────

async function renderOrgHrCredentials() {
  const myRole = state.myRole || 'viewer';
  if (myRole !== 'admin' && myRole !== 'superadmin') return;

  if (typeof fetchOrgHrCredentials === 'function') {
    state.orgHrCredentials = await fetchOrgHrCredentials();
  }

  const tbody = document.getElementById('orghr-cred-tbody');
  if (!tbody) return;
  const orgHrUsers = (state.orgHrCredentials || []);
  tbody.innerHTML = orgHrUsers.map((row, i) => {
    const pwd = row.initial_password || '(ไม่มี)';
    return `<tr>
      <td>${i + 1}</td>
      <td>${esc(row.display_name || row.org_name || row.org_code || '—')}</td>
      <td><code style="font-size:11px">${esc(row.email)}</code></td>
      <td><span style="font-family:monospace;font-size:12px;background:var(--bg2);padding:2px 8px;border-radius:4px">${esc(pwd)}</span></td>
      <td><span class="badge ${row.is_active !== false ? 'bg' : 'bx'}">${row.is_active !== false ? 'Active' : 'Inactive'}</span></td>
      <td class="td-act">${row.initial_password ? `<button class="btn b-gray" style="font-size:11px;padding:3px 8px" onclick="navigator.clipboard.writeText('องค์กร: ${esc(row.display_name || row.org_name || row.org_code || '')}\nEmail: ${esc(row.email)}\nPassword: ${esc(row.initial_password)}').then(()=>showToast('คัดลอกแล้ว ✅'))">📋 Copy</button>` : '—'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล org_hr</td></tr>';
}

function exportOrgHrCredentialsCsv() {
  const myRole = state.myRole || 'viewer';
  if (myRole !== 'admin' && myRole !== 'superadmin') {
    showToast('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้', 'warn');
    return;
  }

  const orgHrUsers = (state.orgHrCredentials || []);
  if (!orgHrUsers.length) { showToast('ไม่มีข้อมูล Org HR', 'warn'); return; }
  const rows = orgHrUsers.map((r) => ({
    org_code: r.org_code || '',
    display_name: r.display_name || '',
    email: r.email,
    initial_password: r.initial_password || '',
    is_active: r.is_active !== false ? 'Active' : 'Inactive',
  }));
  downloadWorkbook('org_hr_credentials.xlsx', 'OrgHR_Credentials', rows);
  showToast('Export Credentials สำเร็จ ✅');
}

// ─── Modal Delegates (heavy impl in services/users.js) ───────────────────────

// showAddUserModal()         → defined in services/users.js
// showEditUserModal(email)   → defined in services/users.js
// showChangePasswordModal(email) → defined in services/users.js
// saveUserFromModal(isEdit)  → defined in services/users.js
// saveViewer()               → defined in services/users.js
// deleteViewer(id, email)    → defined in services/users.js
