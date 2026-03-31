/**
 * org-credentials.js — Page: Org HR Credentials
 * ดูและคัดลอก credentials ของแต่ละองค์กรสำหรับ org-portal
 * Depends on: config.js (state, sb), utils.js (esc, showToast), api.js (fetchOrgHrCredentials)
 */

// ─── Sort helper ─────────────────────────────────────────────────────────────

const ORG_DESIRED_ORDER = [
  'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
  'สำนักงานนโยบายและยุทธศาสตร์การค้า',
  'กรมวิทยาศาสตร์บริการ',
  'กรมสนับสนุนบริการสุขภาพ',
  'กรมอุตุนิยมวิทยา',
  'กรมส่งเสริมวัฒนธรรม',
  'กรมคุมประพฤติ',
  'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
  'กรมสุขภาพจิต',
  'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
  'สำนักงานการวิจัยแห่งชาติ',
  'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ',
  'สำนักงานคณะกรรมการพัฒนาระบบราชการ',
  'กรมชลประทาน',
  'กรมกิจการเด็กและเยาวชน',
];

function sortOrganizations(orgList) {
  return [...orgList].sort((a, b) => {
    const aName = a.display_name || a.org_name || a.org_code || '';
    const bName = b.display_name || b.org_name || b.org_code || '';
    const aIdx = ORG_DESIRED_ORDER.indexOf(aName);
    const bIdx = ORG_DESIRED_ORDER.indexOf(bName);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return aName.localeCompare(bName, 'th');
  });
}

// ─── Load & Render ────────────────────────────────────────────────────────────

async function loadOrgCredentialsPage() {
  const tbody = document.getElementById('orghr-cred-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:24px">กำลังโหลด...</td></tr>';

  state.orgHrCredentials = await fetchOrgHrCredentials();
  renderOrgHrCredentials();
}

async function renderOrgHrCredentials() {
  if (typeof fetchOrgHrCredentials === 'function' && !state.orgHrCredentials) {
    state.orgHrCredentials = await fetchOrgHrCredentials();
  }

  const tbody = document.getElementById('orghr-cred-tbody');
  if (!tbody) return;

  const orgHrUsers = state.orgHrCredentials || [];

  if (orgHrUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:20px">ยังไม่มีข้อมูล org_hr credentials</td></tr>';
    return;
  }

  const sorted = sortOrganizations(orgHrUsers);

  tbody.innerHTML = sorted.map((row, i) => {
    const pwd = row.initial_password || '••••••••';
    const hasPwd = !!row.initial_password;
    const orgLabel = esc(row.display_name || row.org_name || row.org_code || '—');
    return `<tr>
      <td>${i + 1}</td>
      <td style="font-weight:600;font-size:12px">${orgLabel}</td>
      <td><code style="font-size:12px;background:var(--bg);padding:3px 8px;border-radius:4px;color:var(--P);font-weight:600">${esc(row.email)}</code></td>
      <td>
        <span style="font-family:monospace;font-size:13px;font-weight:700;color:${hasPwd ? 'var(--A)' : 'var(--tx3)'};letter-spacing:0.05em">${hasPwd ? esc(pwd) : '(ไม่มี)'}</span>
      </td>
      <td><span class="badge ${row.is_active !== false ? 'bg' : 'bx'}">${row.is_active !== false ? 'Active' : 'Inactive'}</span></td>
      <td class="td-act">
        ${hasPwd ? `<button class="btn b-blue" style="font-size:11px;padding:4px 10px" onclick="copyOrgHrRow('${esc(row.email)}','${esc(pwd)}','${orgLabel}')">📋 Copy</button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function filterCredentialsTable() {
  const q = (document.getElementById('cred-search')?.value || '').toLowerCase();
  document.querySelectorAll('#orghr-cred-tbody tr').forEach((tr) => {
    tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ─── Copy helpers ─────────────────────────────────────────────────────────────

function copyOrgHrRow(email, pwd, orgName) {
  const text = `องค์กร: ${orgName}\nEmail: ${email}\nPassword: ${pwd}`;
  navigator.clipboard.writeText(text).then(() =>
    showToast(`📋 คัดลอก credentials ของ ${orgName} แล้ว`, 'success')
  );
}

function copyAllOrgHrCredentials() {
  const orgHrUsers = (state.orgHrCredentials || []).filter((r) => r.initial_password);
  if (orgHrUsers.length === 0) {
    showToast('ยังไม่มีข้อมูล org_hr credentials', 'warn');
    return;
  }

  const sorted = sortOrganizations(orgHrUsers);
  const header = 'ข้อมูลเข้าสู่ระบบ org_hr — Well-being Survey\n' + '='.repeat(50) + '\n\n';
  const body = sorted
    .map((row, i) =>
      `${i + 1}. ${row.display_name || row.org_name || row.org_code}\n   Email: ${row.email}\n   Password: ${row.initial_password}`
    )
    .join('\n\n');

  navigator.clipboard.writeText(header + body).then(() =>
    showToast(`📋 คัดลอก credentials ทั้ง ${sorted.length} องค์กรแล้ว`, 'success', 5000)
  );
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportOrgHrCredentialsCsv() {
  const orgHrUsers = (state.orgHrCredentials || []).filter((r) => r.initial_password);
  if (orgHrUsers.length === 0) {
    showToast('ยังไม่มีข้อมูล org_hr credentials', 'warn');
    return;
  }

  const sorted = sortOrganizations(orgHrUsers);
  const csv =
    'องค์กร,Email,Password,org_code,สถานะ\n' +
    sorted
      .map(
        (row) =>
          `"${row.display_name || row.org_name || ''}","${row.email}","${row.initial_password}","${row.org_code || ''}","${row.is_active !== false ? 'Active' : 'Inactive'}"`
      )
      .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `org_hr_credentials_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 ดาวน์โหลด CSV สำเร็จ', 'success');
}
