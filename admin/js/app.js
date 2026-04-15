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
    let loadResult = null;
    try {
      loadResult = await loadBackend();
    } catch (loadErr) {
      console.error('loadBackend threw exception:', loadErr);
      loadResult = { error: loadErr.message || 'Unknown error', loaded: false };
    }
    
    if (loadResult && loadResult.error) {
      console.error('Backend loading failed:', loadResult.error);
      const btnRefresh = document.getElementById('btn-refresh-data');
      if (btnRefresh) btnRefresh.style.display = '';
      // Show error but continue with empty state
      showToast('โหลดข้อมูลไม่สำเร็จ: ' + loadResult.error, 'error', 5000);
    }
    
    // Always render chrome first so user sees their info
    try {
      renderChrome();
    } catch (chromeErr) {
      console.error('renderChrome error:', chromeErr);
    }
    
    // Always calculate summary and render all pages, even with empty data
    let summary = [];
    try {
      summary = summarizeOrgs();
    } catch (summaryErr) {
      console.error('summarizeOrgs error:', summaryErr);
      summary = [];
    }
    
    // Render all pages with individual error handling
    const renderFns = [
      { fn: () => renderDashboard(summary), name: 'renderDashboard' },
      { fn: () => renderProgress(summary), name: 'renderProgress' },
      { fn: () => renderOrgs(summary), name: 'renderOrgs' },
      { fn: renderOrgCoordinators, name: 'renderOrgCoordinators' },
      { fn: () => renderCh1(summary), name: 'renderCh1' },
      { fn: renderCh1Summary, name: 'renderCh1Summary' },
      { fn: () => renderWellbeingControl(summary), name: 'renderWellbeingControl' },
      { fn: () => renderWellbeingOrg(summary), name: 'renderWellbeingOrg' },
      { fn: renderWellbeingRaw, name: 'renderWellbeingRaw' },
      { fn: () => _renderAnalyticsCh1(summary), name: '_renderAnalyticsCh1' },
      { fn: populateOrgSelects, name: 'populateOrgSelects' },
    ];
    
    for (const { fn, name } of renderFns) {
      try {
        fn();
      } catch (fnErr) {
        console.error(`${name} error:`, fnErr);
      }
    }
    
    const auditExportBtn = document.querySelector('#page-audit .btn.b-gray');
    if (auditExportBtn) auditExportBtn.onclick = exportAuditLog;
    
  } catch (error) {
    console.error('Init error:', error);
    // Show a more user-friendly error
    const statusEl = document.getElementById('connection-status');
    if (statusEl) { statusEl.textContent = 'โหลดล้มเหลว'; statusEl.style.color = 'var(--D)'; }
    const btnRefresh = document.getElementById('btn-refresh-data');
    if (btnRefresh) btnRefresh.style.display = '';
    showToast('โหลดระบบไม่สำเร็จ: ' + error.message, 'error', 5000);
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
