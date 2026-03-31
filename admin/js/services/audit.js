/* ========== ADMIN PORTAL — AUDIT LOG SERVICE ========== */

async function loadAuditPage() {
  const body = document.querySelector('#page-audit .card-body');
  if (!body) return;
  body.innerHTML = '<div style="color:var(--tx3);padding:12px">กำลังโหลด...</div>';
  try {
    const { data, error } = await sb
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    if (!data || !data.length) {
      body.innerHTML = '<div style="color:var(--tx3);padding:16px;text-align:center">ยังไม่มีข้อมูล Audit Log</div>';
      return;
    }
    const iconMap = { login:'🔐', export:'📤', user_manage:'👤', form_control:'📝', delete:'🗑️', update:'✏️', create:'➕', view:'👁️' };
    body.innerHTML = data.map(row => {
      const action = String(row.action || '').toLowerCase();
      const icon = Object.entries(iconMap).find(([k]) => action.includes(k))?.[1] || '📋';
      const detail = row.details ? (typeof row.details === 'object' ? Object.entries(row.details).map(([k,v]) => `${k}: ${v}`).join(' · ') : String(row.details)) : '';
      const actor = row.actor_email || row.admin_email || 'ระบบ';
      return `<div class="audit-item">
        <div class="ai-time">${fmtDate(row.created_at, true)}</div>
        <div class="ai-icon">${icon}</div>
        <div>
          <div class="ai-desc">${esc(row.action || '')}${detail ? ` — ${esc(detail)}` : ''}</div>
          <div class="ai-user">${esc(actor)}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    body.innerHTML = `<div class="info" style="color:var(--D)">⚠️ โหลด Audit Log ไม่สำเร็จ: ${esc(e.message)}</div>`;
  }
}

function exportAuditLog() {
  const rows = [...document.querySelectorAll('#page-audit .audit-item')].map((item) => ({
    time: item.querySelector('.ai-time')?.textContent || '',
    description: item.querySelector('.ai-desc')?.textContent || '',
    user: item.querySelector('.ai-user')?.textContent || '',
  }));
  if (!rows.length) { showToast('ไม่มีข้อมูล Audit Log'); return; }
  downloadWorkbook('audit_log.xlsx', 'AuditLog', rows);
  showToast('Export Audit Log สำเร็จ ✅');
}

function filterAuditLog() {
  const q = (document.getElementById('audit-search')?.value || '').toLowerCase();
  const type = (document.getElementById('audit-type')?.value || '').toLowerCase();
  document.querySelectorAll('#page-audit .audit-item').forEach((item) => {
    const text = item.textContent.toLowerCase();
    const matchQ = !q || text.includes(q);
    const matchType = !type || text.includes(type);
    item.style.display = (matchQ && matchType) ? '' : 'none';
  });
}
