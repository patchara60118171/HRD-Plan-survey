// ========================================
// Admin App Entry Point
// Handles: init, refreshData, DOMContentLoaded bootstrap
// Moved from admin.html inline script
// ========================================

let _initSession = null;

async function refreshData() {
  const statusEl = document.getElementById('connection-status');
  const btnRefresh = document.getElementById('btn-refresh-data');
  if (statusEl) { statusEl.textContent = 'กำลังโหลด...'; statusEl.style.color = 'var(--tx2)'; }
  if (btnRefresh) btnRefresh.style.display = 'none';
  
  const loadResult = await loadBackend();
  if (loadResult && loadResult.error) {
    if (statusEl) { statusEl.textContent = 'โหลดไม่สำเร็จ'; statusEl.style.color = 'var(--D)'; }
    if (btnRefresh) btnRefresh.style.display = '';
    showError('โหลดข้อมูลไม่สำเร็จ: ' + loadResult.error);
    return;
  }
  
  const summary = summarizeOrgs();
  renderDashboard(summary);
  renderProgress(summary);
  renderOrgs(summary);
  renderOrgCoordinators();
  renderCh1(summary);
  renderCh1Summary();
  renderWellbeingControl(summary);
  renderWellbeingOrg(summary);
  renderWellbeingRaw();
  _renderAnalyticsCh1(summary);
  populateOrgSelects();
}

async function init() {
  // Show refresh button automatically after 10s if still loading
  const _refreshFallbackTimer = setTimeout(() => {
    const btnRefresh = document.getElementById('btn-refresh-data');
    const statusEl = document.getElementById('connection-status');
    if (btnRefresh && statusEl && statusEl.textContent.includes('เชื่อมต่อ')) {
      statusEl.textContent = 'เชื่อมต่อนานเกินไป';
      statusEl.style.color = 'var(--D)';
    }
  }, 10000);
  try {
    const session = await requireSession();
    if (!session) return;
    _initSession = session;
    clearTimeout(_refreshFallbackTimer);
    
    // Try to load backend data, but don't let failures crash the entire app
    const loadResult = await loadBackend();
    if (loadResult && loadResult.error) {
      console.error('Backend loading failed:', loadResult.error);
      const btnRefresh = document.getElementById('btn-refresh-data');
      if (btnRefresh) btnRefresh.style.display = '';
      // Show error but continue with empty state
      showError('โหลดข้อมูลไม่สำเร็จ: ' + loadResult.error + ' - แสดงข้อมูลว่าง');
    }
    
    renderChrome(); // ← after loadBackend so state.userRows is populated for role check
    const summary = summarizeOrgs();
    
    // Render all pages - they should handle empty data gracefully
    renderDashboard(summary);
    renderProgress(summary);
    renderOrgs(summary);
    renderOrgCoordinators();
    renderCh1(summary);
    renderCh1Summary();
    renderWellbeingControl(summary);
    renderWellbeingOrg(summary);
    renderWellbeingRaw();
    _renderAnalyticsCh1(summary);
    populateOrgSelects();
    const auditExportBtn = document.querySelector('#page-audit .btn.b-gray');
    if (auditExportBtn) auditExportBtn.onclick = exportAuditLog;
    
  } catch (error) {
    console.error('Init error:', error);
    // Show a more user-friendly error
    const statusEl = document.getElementById('connection-status');
    if (statusEl) { statusEl.textContent = 'โหลดล้มเหลว'; statusEl.style.color = 'var(--D)'; }
    const btnRefresh = document.getElementById('btn-refresh-data');
    if (btnRefresh) btnRefresh.style.display = '';
    showError('โหลดระบบไม่สำเร็จ: ' + error.message + ' - กรุณารีเฟรชหน้าเว็บ');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  // init Buddhist Era labels on date inputs
  ['deadline-ch1','deadline-wb','viewer-expires'].forEach(id => {
    const el = document.getElementById(id);
    const labelEl = document.getElementById(id + '-be');
    if (el && labelEl) labelEl.textContent = isoToBuddhistDisplay(el.value);
  });
});
