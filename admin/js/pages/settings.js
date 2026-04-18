/**
 * settings.js — Page: Settings + Audit Log + Form Editor
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, sb), utils.js (esc, showToast, showConfirm), export.js (downloadWorkbook)
 *
 * Functions:
 *   loadSettingsUI()
 *   saveSettings()
 *   resetSettings()
 *   showQRModal(path)
 *   sendLinkEmail(type)
 *   exportAuditLog()
 *   filterAuditLog()
 *   saveDeadlines()
 *   loadFormEditorFields()    → TODO: move full impl from admin.html ~line 4594
 *   renderFeFields(formId)    → TODO: move full impl from admin.html ~line 4611
 *   saveFormConfig(formId)    → TODO: move full impl from admin.html ~line 4751
 */

// ─── Settings Defaults ───────────────────────────────────────────────────────

const SETTINGS_DEFAULTS = {
  autosave: true,
  sheetsSync: true,
  formVersion: 'v3.0 (ล่าสุด)',
  sessionTimeout: '30 นาที',
  auditLog: true,
  forcePassword: false,
};

// ─── Settings UI ─────────────────────────────────────────────────────────────

function loadSettingsUI() {
  try {
    const saved = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    const cfg = Object.assign({}, SETTINGS_DEFAULTS, saved);
    const el = (id) => document.getElementById(id);
    if (el('setting-autosave')) el('setting-autosave').checked = cfg.autosave;
    if (el('setting-sheets-sync')) el('setting-sheets-sync').checked = cfg.sheetsSync;
    if (el('setting-form-version')) el('setting-form-version').value = cfg.formVersion;
    if (el('setting-session-timeout')) el('setting-session-timeout').value = cfg.sessionTimeout;
    if (el('setting-audit-log')) el('setting-audit-log').checked = cfg.auditLog;
    if (el('setting-force-password')) el('setting-force-password').checked = cfg.forcePassword;
  } catch(e) {}
}

function saveSettings() {
  const el = (id) => document.getElementById(id);
  const cfg = {
    autosave: el('setting-autosave')?.checked ?? SETTINGS_DEFAULTS.autosave,
    sheetsSync: el('setting-sheets-sync')?.checked ?? SETTINGS_DEFAULTS.sheetsSync,
    formVersion: el('setting-form-version')?.value || SETTINGS_DEFAULTS.formVersion,
    sessionTimeout: el('setting-session-timeout')?.value || SETTINGS_DEFAULTS.sessionTimeout,
    auditLog: el('setting-audit-log')?.checked ?? SETTINGS_DEFAULTS.auditLog,
    forcePassword: el('setting-force-password')?.checked ?? SETTINGS_DEFAULTS.forcePassword,
  };
  localStorage.setItem('admin_settings', JSON.stringify(cfg));
  showToast('บันทึกการตั้งค่าเรียบร้อยแล้ว ✅');
}

function resetSettings() {
  showConfirm('รีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้น?', () => {
    localStorage.removeItem('admin_settings');
    loadSettingsUI();
    showToast('รีเซ็ตการตั้งค่าแล้ว');
  });
}

// ─── QR Modal ────────────────────────────────────────────────────────────────

function showQRModal(path) {
  const url = path.startsWith('http') ? path : window.location.origin + '/' + path;
  const existing = document.getElementById('qr-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'qr-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  overlay.innerHTML = `<div style="background:#fff;border-radius:16px;padding:28px;text-align:center;min-width:260px;box-shadow:0 20px 40px rgba(0,0,0,.2)">
    <div style="font-weight:700;font-size:15px;margin-bottom:12px">QR Code</div>
    <div id="qr-canvas" style="margin:0 auto 12px;display:flex;justify-content:center;align-items:center"></div>
    <div style="font-size:11px;color:#64748b;word-break:break-all;max-width:220px;margin:0 auto 14px">${esc(url)}</div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn b-blue" onclick="navigator.clipboard.writeText('${esc(url)}').then(()=>showToast('คัดลอกแล้ว ✅'))">📋 Copy URL</button>
      <button class="btn b-gray" onclick="document.getElementById('qr-modal-overlay').remove()">✕ ปิด</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  try {
    new QRCode(document.getElementById('qr-canvas'), { text: url, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M });
  } catch (e) {
    document.getElementById('qr-canvas').textContent = 'QRCode library ไม่พร้อมใช้งาน';
  }
}

// ─── Link Email ───────────────────────────────────────────────────────────────

function sendLinkEmail(type) {
  const orgSel = document.getElementById('ch1-link-org');
  const orgName = orgSel?.value || '';
  const code = document.getElementById('ch1-link-code')?.textContent || '';
  const url = window.location.origin + '/' + code;
  const org = ORG_LOOKUP.get(orgName);
  if (!orgName) { showToast('กรุณาเลือกองค์กรก่อน','warn'); return; }
  showToast(`📧 จำลองส่งอีเมลลิงก์ ${type.toUpperCase()} ไปยัง ${org?.email || 'ไม่มีอีเมล'} (ต้องต่อ Email Service จริง)`, 'info', 5000);
}

// ─── Deadlines ────────────────────────────────────────────────────────────────

function saveDeadlines() {
  const deadlineEl = document.getElementById('deadline-date');
  const deadline = deadlineEl?.value || '';
  if (!deadline) { showToast('กรุณาระบุวันปิดรับ', 'warn'); return; }
  localStorage.setItem('survey_deadline', deadline);
  showToast('บันทึกวันปิดรับเรียบร้อย ✅');
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

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
    const visible = (!q || text.includes(q)) && (!type || text.includes(type));
    item.style.display = visible ? '' : 'none';
  });
}

// Compare page helpers moved to admin/js/pages/compare.js

// ─── Form Editor (stubs — full impl TODO: move from admin.html ~4594–4826) ───

// TODO: Move loadFormEditorFields() from admin.html line ~4594 (230+ lines)
// TODO: Move renderFeFields(formId)   from admin.html line ~4611
// TODO: Move saveFormConfig(formId)   from admin.html line ~4751
// These functions depend on: sb, state, esc, showToast, _feConfigCache
