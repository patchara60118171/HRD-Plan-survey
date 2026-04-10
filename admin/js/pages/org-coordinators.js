async function getOrgCoordinatorRows() {
  const { data, error } = await sb
    .from('organizations')
    .select('id, org_name_th, display_order, sort_order, contact_email, saraban_email, coordinator_name, coordinator_position, coordinator_contact_line, coordinator_email, settings, updated_at, created_at, is_active, is_test')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('org_name_th', { ascending: true });

  if (error) throw error;

  return (data || [])
    .filter((row) => row.is_test !== true)
    .map((row) => {
      const settings = row.settings || {};
      return {
        id: row.id || '',
        displayOrder: row.display_order ?? row.sort_order ?? Number.MAX_SAFE_INTEGER,
        orgName: row.org_name_th || '—',
        coordinatorName: row.coordinator_name || settings.coordinator_name || '—',
        coordinatorPosition: row.coordinator_position || settings.coordinator_position || '—',
        coordinatorContact: row.coordinator_contact_line || settings.coordinator_contact_line || '—',
        coordinatorEmail: row.coordinator_email || settings.coordinator_email || row.contact_email || '',
        sarabanEmail: row.saraban_email || settings.saraban_email || row.contact_email || '',
      };
    });
}

async function renderOrgCoordinators() {
  const tbody = document.querySelector('#org-coordinator-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:24px">กำลังโหลดข้อมูล...</td></tr>';

  let rows = [];
  try {
    rows = await getOrgCoordinatorRows();
  } catch (error) {
    console.warn('renderOrgCoordinators:', error.message);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--D);padding:24px">โหลดข้อมูลผู้ประสานไม่สำเร็จ: ${esc(error.message || 'unknown error')}</td></tr>`;
    return;
  }

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:24px">ยังไม่มีข้อมูลผู้ประสานในระบบ</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((row) => {
    const coordinatorEmail = row.coordinatorEmail
      ? `<a href="mailto:${esc(row.coordinatorEmail)}" style="color:var(--A)">${esc(row.coordinatorEmail)}</a>`
      : '—';
    const sarabanEmail = row.sarabanEmail
      ? `<a href="mailto:${esc(row.sarabanEmail)}" style="color:var(--A)">${esc(row.sarabanEmail)}</a>`
      : '—';

    return `<tr>
      <td>${esc(row.orgName)}</td>
      <td>${esc(row.coordinatorName)}</td>
      <td>${esc(row.coordinatorPosition)}</td>
      <td>${esc(row.coordinatorContact)}</td>
      <td>${coordinatorEmail}</td>
      <td>${sarabanEmail}</td>
    </tr>`;
  }).join('');

  filterOrgCoordinatorTable();
}

function filterOrgCoordinatorTable() {
  const q = (document.getElementById('org-coordinator-search')?.value || '').trim().toLowerCase();
  document.querySelectorAll('#org-coordinator-table tbody tr').forEach((tr) => {
    const visible = !q || tr.textContent.toLowerCase().includes(q);
    tr.style.display = visible ? '' : 'none';
  });
}
