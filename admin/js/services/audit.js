/* ========== ADMIN PORTAL — AUDIT LOG SERVICE ========== */

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
