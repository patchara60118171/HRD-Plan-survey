// ========================================
// Admin App Entry Point
// Handles: init, refreshData, DOMContentLoaded bootstrap
// Moved from admin.html inline script
// ========================================

let _initSession = null;

async function refreshData() {
  const statusEl = document.getElementById('connection-status');
  const btnRefresh = document.getElementById('btn-refresh-data');
  if (btnRefresh) { btnRefresh.disabled = true; btnRefresh.style.opacity = '0.6'; }
  if (statusEl) { statusEl.textContent = 'กำลังโหลด...'; statusEl.style.color = 'var(--tx2)'; }

  try {
    // Phase 1: CORE (fast) — refresh dashboard KPIs immediately
    let coreResult = null;
    try { coreResult = await loadBackendCore(); }
    catch (err) { coreResult = { error: err?.message || 'Unknown error', loaded: false }; }

    if (coreResult && coreResult.error) {
      if (statusEl) { statusEl.textContent = 'โหลดไม่สำเร็จ'; statusEl.style.color = 'var(--D)'; }
      showToast('โหลดข้อมูลหลักไม่สำเร็จ: ' + coreResult.error, 'error', 5000);
      return;
    }

    let summary = [];
    try { summary = summarizeOrgs(); }
    catch (e) { console.error('summarizeOrgs (refresh core) error:', e); summary = []; }
    _renderCorePages(summary);

    // Phase 2: EXTRAS (heavier) — update remaining pages in background
    loadBackendExtras()
      .then((extrasResult) => {
        if (extrasResult && extrasResult.error) {
          console.warn('refreshData extras partial:', extrasResult.error);
        }
        let summary2 = [];
        try { summary2 = summarizeOrgs(); }
        catch (e) { console.error('summarizeOrgs (refresh extras) error:', e); summary2 = summary; }
        _safeRender(() => renderDashboard(summary2), 'renderDashboard (refresh)');
        _renderExtraPages(summary2);
      })
      .catch((err) => {
        console.error('refreshData extras threw:', err);
      });
  } finally {
    if (btnRefresh) { btnRefresh.disabled = false; btnRefresh.style.opacity = ''; }
  }
}

// Safe wrapper: run a render function, catching errors so one failure won't block others
function _safeRender(fn, name) {
  try { fn(); }
  catch (err) { console.error(`${name} error:`, err); }
}

// Render pages that need only CORE data (KPIs, basic counts, org list)
function _renderCorePages(summary) {
  _safeRender(() => renderDashboard(summary), 'renderDashboard');
  _safeRender(() => renderOrgs(summary), 'renderOrgs');
  _safeRender(populateOrgSelects, 'populateOrgSelects');
}

// Render pages that need EXTRAS (ch1 form_data, links, credentials)
function _renderExtraPages(summary) {
  _safeRender(() => renderProgress(summary), 'renderProgress');
  _safeRender(() => renderCh1(summary), 'renderCh1');
  _safeRender(renderCh1Summary, 'renderCh1Summary');
  _safeRender(() => renderWellbeingControl(summary), 'renderWellbeingControl');
  _safeRender(() => renderWellbeingOrg(summary), 'renderWellbeingOrg');
  _safeRender(renderWellbeingRaw, 'renderWellbeingRaw');
  _safeRender(() => _renderAnalyticsCh1(summary), '_renderAnalyticsCh1');
}

async function init() {
  try {
    const session = await requireSession();
    if (!session) return;
    _initSession = session;

    // Phase 1: CORE — quick queries → render dashboard FAST
    // NOTE: renderChrome() must run AFTER loadBackendCore() so that state.userRows
    // is populated and state.myRole resolves correctly (non-locked emails depend
    // on the admin_user_roles DB table). Running renderChrome before core would
    // default every session to 'viewer' and hide role-gated UI.
    let coreResult = null;
    try {
      coreResult = await loadBackendCore();
    } catch (err) {
      console.error('loadBackendCore threw:', err);
      coreResult = { error: err.message || 'Unknown error', loaded: false };
    }

    if (coreResult && coreResult.error) {
      const btnRefresh = document.getElementById('btn-refresh-data');
      if (btnRefresh) btnRefresh.style.display = '';
      showToast('โหลดข้อมูลหลักไม่สำเร็จ: ' + coreResult.error, 'error', 5000);
    }

    // Render chrome now that userRows is available → role-gated UI resolves correctly
    _safeRender(renderChrome, 'renderChrome');

    // Compute summary (may be partial) and render core pages NOW
    let summary = [];
    try { summary = summarizeOrgs(); }
    catch (e) { console.error('summarizeOrgs (core) error:', e); summary = []; }
    _renderCorePages(summary);

    // Wire up audit export button (one-time)
    const auditExportBtn = document.querySelector('#page-audit .btn.b-gray');
    if (auditExportBtn) auditExportBtn.onclick = exportAuditLog;

    // Phase 2: EXTRAS — heavier queries in background, then re-render pages that need them
    loadBackendExtras()
      .then((extrasResult) => {
        if (extrasResult && extrasResult.error) {
          console.warn('loadBackendExtras partial:', extrasResult.error);
          showToast('โหลดข้อมูลเพิ่มเติมไม่ครบ: ' + extrasResult.error, 'warn', 4000);
        }
        let summary2 = [];
        try { summary2 = summarizeOrgs(); }
        catch (e) { console.error('summarizeOrgs (extras) error:', e); summary2 = summary; }
        // Re-render dashboard because ch1Count/completion is now accurate with form_data
        _safeRender(() => renderDashboard(summary2), 'renderDashboard (refresh)');
        _renderExtraPages(summary2);
      })
      .catch((err) => {
        console.error('loadBackendExtras threw:', err);
        const statusEl = document.getElementById('connection-status');
        if (statusEl) { statusEl.textContent = 'เชื่อมต่อบางส่วน'; statusEl.style.color = 'var(--W, #C08F2A)'; }
      });

  } catch (error) {
    console.error('Init error:', error);
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
