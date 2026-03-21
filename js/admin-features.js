// ================================================================
// admin-features.js — Sprint 2 Admin Features
// Form Windows · Question Overrides · Audit Logs
// Loaded by admin.html — uses global `sb` (Supabase client)
// ================================================================

const AdminFeatures = (() => {
  'use strict';

  // ── Supabase client helper ──
  function getSb() {
    if (typeof sb !== 'undefined') return sb;
    if (typeof supabaseClient !== 'undefined') return supabaseClient;
    if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined') {
      return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return null;
  }

  // ── Get current admin user ──
  function getAdminEmail() {
    try {
      return document.querySelector('.u-name')?.textContent || 'admin';
    } catch { return 'admin'; }
  }

  // ────────────────────────────────────────────────
  // 1. FORM WINDOWS — ตั้งเวลาเปิด-ปิดแบบฟอร์ม
  // ────────────────────────────────────────────────

  async function loadFormWindows() {
    const client = getSb();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('form_windows')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.error('[AdminFeat] form_windows error:', error); return []; }
      return data || [];
    } catch (e) { console.error('[AdminFeat] loadFormWindows:', e); return []; }
  }

  async function saveFormWindow(windowData) {
    const client = getSb();
    if (!client) return { error: 'No Supabase client' };
    try {
      const payload = {
        form_code: windowData.form_code,
        org_code: windowData.org_code || null,
        is_open: windowData.is_open !== false,
        opens_at: windowData.opens_at || null,
        closes_at: windowData.closes_at || null,
        updated_by: getAdminEmail()
      };
      let result;
      if (windowData.id) {
        result = await client.from('form_windows').update(payload).eq('id', windowData.id).select().single();
      } else {
        payload.created_at = new Date().toISOString();
        result = await client.from('form_windows').insert(payload).select().single();
      }
      if (result.error) return { error: result.error.message };
      // Log audit
      await writeAuditLog(windowData.id ? 'form_window_updated' : 'form_window_created', {
        form_code: payload.form_code,
        org_code: payload.org_code,
        is_open: payload.is_open
      });
      return { data: result.data };
    } catch (e) { return { error: e.message }; }
  }

  async function toggleFormWindow(id, isOpen) {
    const client = getSb();
    if (!client) return false;
    try {
      const { error } = await client
        .from('form_windows')
        .update({ is_open: isOpen, updated_by: getAdminEmail() })
        .eq('id', id);
      if (error) { console.error('[AdminFeat] toggleFormWindow:', error); return false; }
      await writeAuditLog('form_window_toggled', { window_id: id, is_open: isOpen });
      return true;
    } catch { return false; }
  }

  async function deleteFormWindow(id) {
    const client = getSb();
    if (!client) return false;
    try {
      const { error } = await client.from('form_windows').delete().eq('id', id);
      if (error) return false;
      await writeAuditLog('form_window_deleted', { window_id: id });
      return true;
    } catch { return false; }
  }

  function renderFormWindowsUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="page-title">📅 จัดการเวลาเปิด-ปิดแบบฟอร์ม</div>
      <div class="page-sub">กำหนดช่วงเวลาที่แบบฟอร์มจะเปิดให้กรอกข้อมูล</div>
      <div class="card card-mb">
        <div class="card-head">
          <h3>📋 Form Windows ที่มีอยู่</h3>
          <div class="filter-bar">
            <select class="sel" id="fw-filter-form" onchange="AdminFeatures.refreshFormWindows()">
              <option value="">ทุกฟอร์ม</option>
              <option value="ch1">Ch1</option>
              <option value="wellbeing">Wellbeing</option>
            </select>
            <button class="btn b-solid" onclick="AdminFeatures.showFormWindowModal()">+ สร้าง Window ใหม่</button>
          </div>
        </div>
        <div class="tbl-wrap">
          <table>
            <thead><tr>
              <th>ฟอร์ม</th><th>องค์กร</th><th>สถานะ</th><th>เปิด</th><th>ปิด</th><th>อัปเดตโดย</th><th>จัดการ</th>
            </tr></thead>
            <tbody id="fw-tbody"><tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">กำลังโหลด...</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    refreshFormWindows();
  }

  async function refreshFormWindows() {
    const tbody = document.getElementById('fw-tbody');
    if (!tbody) return;
    const windows = await loadFormWindows();
    const filter = document.getElementById('fw-filter-form')?.value;
    const filtered = filter ? windows.filter(w => w.form_code === filter) : windows;

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--tx3);padding:24px">ยังไม่มี Form Window</td></tr>';
      return;
    }

    const now = new Date();
    tbody.innerHTML = filtered.map(w => {
      const isActive = w.is_open && (!w.opens_at || new Date(w.opens_at) <= now) && (!w.closes_at || new Date(w.closes_at) > now);
      const statusBadge = isActive ? '<span class="badge bg">เปิดอยู่</span>'
        : w.is_open ? '<span class="badge bw">รอเปิด</span>'
        : '<span class="badge br">ปิดอยู่</span>';
      const opensAt = w.opens_at ? new Date(w.opens_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—';
      const closesAt = w.closes_at ? new Date(w.closes_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—';
      return `<tr>
        <td><span class="badge bb">${esc(w.form_code)}</span></td>
        <td>${esc(w.org_code || 'ทุกองค์กร')}</td>
        <td>${statusBadge}</td>
        <td>${opensAt}</td>
        <td>${closesAt}</td>
        <td style="font-size:11px;color:var(--tx3)">${esc(w.updated_by || '—')}</td>
        <td class="td-act">
          <button class="btn ${w.is_open ? 'b-red' : 'b-green'}" onclick="AdminFeatures.toggleWindow('${w.id}', ${!w.is_open})">${w.is_open ? '🔒 ปิด' : '🔓 เปิด'}</button>
          <button class="btn b-blue" onclick="AdminFeatures.showFormWindowModal('${w.id}')">✏️</button>
          <button class="btn b-red" onclick="AdminFeatures.deleteWindow('${w.id}')">🗑️</button>
        </td>
      </tr>`;
    }).join('');
  }

  async function toggleWindow(id, isOpen) {
    const ok = await toggleFormWindow(id, isOpen);
    if (ok) refreshFormWindows();
  }

  async function deleteWindowConfirm(id) {
    if (!confirm('ยืนยันลบ Form Window นี้?')) return;
    const ok = await deleteFormWindow(id);
    if (ok) refreshFormWindows();
  }

  function showFormWindowModal(editId) {
    // Simple modal creation using existing admin.html modal classes
    const existing = document.getElementById('fw-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'fw-modal-overlay';
    overlay.className = 'umodal-overlay';
    overlay.innerHTML = `
      <div class="umodal">
        <div class="umodal-head"><h3>${editId ? '✏️ แก้ไข' : '➕ สร้าง'} Form Window</h3><button class="btn b-gray" onclick="document.getElementById('fw-modal-overlay').remove()">✕</button></div>
        <div class="umodal-body">
          <div class="fg"><label>ฟอร์ม</label><select id="fw-form-code"><option value="ch1">Ch1</option><option value="wellbeing">Wellbeing</option></select></div>
          <div class="fg"><label>องค์กร (ว่างไว้ = ทุกองค์กร)</label><input id="fw-org-code" placeholder="เช่น dmh, nesdc"></div>
          <div class="form-row">
            <div class="fg"><label>วันเปิด</label><input type="datetime-local" id="fw-opens-at"></div>
            <div class="fg"><label>วันปิด</label><input type="datetime-local" id="fw-closes-at"></div>
          </div>
          <div class="fg" style="display:flex;align-items:center;gap:8px">
            <label class="tgl"><input type="checkbox" id="fw-is-open" checked><div class="tgl-s"></div></label>
            <label style="font-size:13px">เปิดใช้งาน</label>
          </div>
        </div>
        <div class="umodal-foot">
          <button class="btn b-gray" onclick="document.getElementById('fw-modal-overlay').remove()">ยกเลิก</button>
          <button class="btn b-solid" onclick="AdminFeatures.saveWindowFromModal('${editId || ''}')">💾 บันทึก</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  async function saveWindowFromModal(editId) {
    const data = {
      form_code: document.getElementById('fw-form-code').value,
      org_code: document.getElementById('fw-org-code').value.trim() || null,
      opens_at: document.getElementById('fw-opens-at').value || null,
      closes_at: document.getElementById('fw-closes-at').value || null,
      is_open: document.getElementById('fw-is-open').checked
    };
    if (editId) data.id = editId;
    const result = await saveFormWindow(data);
    if (result.error) {
      alert('Error: ' + result.error);
    } else {
      document.getElementById('fw-modal-overlay')?.remove();
      refreshFormWindows();
    }
  }

  // ────────────────────────────────────────────────
  // 2. AUDIT LOGS — บันทึกเหตุการณ์แอดมิน
  // ────────────────────────────────────────────────

  async function writeAuditLog(action, details = {}) {
    const client = getSb();
    if (!client) {
      console.warn('[Audit] No Supabase client, logging to console:', action, details);
      return false;
    }
    try {
      const { error } = await client.from('admin_audit_logs').insert({
        admin_email: getAdminEmail(),
        action: action,
        details: details,
        created_at: new Date().toISOString()
      });
      if (error) {
        console.warn('[Audit] write failed (table may not exist):', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Audit] write exception:', e.message);
      return false;
    }
  }

  async function loadAuditLogs(limit = 100, offset = 0, filters = {}) {
    const client = getSb();
    if (!client) return [];
    try {
      let query = client
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (filters.action) query = query.eq('action', filters.action);
      if (filters.admin_email) query = query.eq('admin_email', filters.admin_email);
      const { data, error } = await query;
      if (error) { console.error('[Audit] load error:', error); return []; }
      return data || [];
    } catch (e) { console.error('[Audit] load exception:', e); return []; }
  }

  function renderAuditLogsUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="page-title">🔍 Audit Log — บันทึกเหตุการณ์</div>
      <div class="page-sub">ติดตามการกระทำของผู้ดูแลระบบทั้งหมด</div>
      <div class="card card-mb">
        <div class="card-head">
          <h3>📋 รายการเหตุการณ์ล่าสุด</h3>
          <div class="filter-bar">
            <input class="si" id="audit-search" placeholder="🔍 ค้นหา..." oninput="AdminFeatures.filterAuditLogs()">
            <select class="sel" id="audit-action-filter" onchange="AdminFeatures.refreshAuditLogs()">
              <option value="">ทุกประเภท</option>
              <option value="form_window_created">สร้าง Form Window</option>
              <option value="form_window_toggled">เปิด/ปิด Form Window</option>
              <option value="question_override_saved">แก้ไขข้อคำถาม</option>
              <option value="question_override_reset">รีเซ็ข้อคำถาม</option>
              <option value="user_created">สร้างผู้ใช้</option>
              <option value="settings_updated">อัปเดตตั้งค่า</option>
            </select>
            <button class="btn b-gray" onclick="AdminFeatures.refreshAuditLogs()">🔄 โหลดใหม่</button>
          </div>
        </div>
        <div class="tbl-wrap" style="max-height:500px;overflow-y:auto">
          <table>
            <thead><tr><th style="width:140px">เวลา</th><th>ผู้ดำเนินการ</th><th>การกระทำ</th><th>รายละเอียด</th></tr></thead>
            <tbody id="audit-tbody"><tr><td colspan="4" style="text-align:center;color:var(--tx3);padding:24px">กำลังโหลด...</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    refreshAuditLogs();
  }

  async function refreshAuditLogs() {
    const tbody = document.getElementById('audit-tbody');
    if (!tbody) return;
    const actionFilter = document.getElementById('audit-action-filter')?.value;
    const logs = await loadAuditLogs(100, 0, { action: actionFilter || undefined });

    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tx3);padding:24px">ยังไม่มีบันทึก</td></tr>';
      return;
    }

    const actionLabels = {
      form_window_created: '📅 สร้าง Form Window',
      form_window_updated: '📅 แก้ไข Form Window',
      form_window_toggled: '🔄 เปิด/ปิด Form Window',
      form_window_deleted: '🗑️ ลบ Form Window',
      question_override_saved: '✏️ แก้ไขข้อคำถาม',
      question_override_reset: '↩️ รีเซ็ตข้อคำถาม',
      user_created: '👤 สร้างผู้ใช้',
      settings_updated: '⚙️ อัปเดตตั้งค่า',
      login: '🔑 เข้าสู่ระบบ',
      logout: '🚪 ออกจากระบบ'
    };

    tbody.innerHTML = logs.map(log => {
      const time = new Date(log.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
      const label = actionLabels[log.action] || log.action;
      const details = log.details ? JSON.stringify(log.details).slice(0, 100) : '—';
      return `<tr>
        <td style="font-size:11px;color:var(--tx3);white-space:nowrap">${time}</td>
        <td style="font-size:12px">${esc(log.admin_email || '—')}</td>
        <td>${label}</td>
        <td style="font-size:11px;color:var(--tx2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(details)}</td>
      </tr>`;
    }).join('');
  }

  function filterAuditLogs() {
    const search = document.getElementById('audit-search')?.value?.toLowerCase() || '';
    const rows = document.querySelectorAll('#audit-tbody tr');
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
  }

  // ────────────────────────────────────────────────
  // 3. QUESTION OVERRIDES — แก้ไขข้อความคำถาม
  // ────────────────────────────────────────────────

  async function loadQuestionOverrides(formCode) {
    const client = getSb();
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('form_question_overrides')
        .select('*')
        .eq('form_code', formCode)
        .order('question_key');
      if (error) { console.warn('[QOverride] load error:', error.message); return []; }
      return data || [];
    } catch { return []; }
  }

  async function saveQuestionOverride(formCode, questionKey, overrideData) {
    const client = getSb();
    if (!client) return false;
    try {
      const payload = {
        form_code: formCode,
        question_key: questionKey,
        label_th: overrideData.label_th || null,
        help_text: overrideData.help_text || null,
        options_json: overrideData.options_json || null,
        updated_by: getAdminEmail(),
        updated_at: new Date().toISOString()
      };
      const { error } = await client
        .from('form_question_overrides')
        .upsert(payload, { onConflict: 'form_code,question_key' });
      if (error) { console.error('[QOverride] save error:', error); return false; }
      await writeAuditLog('question_override_saved', { form_code: formCode, question_key: questionKey });
      return true;
    } catch { return false; }
  }

  async function resetQuestionOverride(formCode, questionKey) {
    const client = getSb();
    if (!client) return false;
    try {
      const { error } = await client
        .from('form_question_overrides')
        .delete()
        .eq('form_code', formCode)
        .eq('question_key', questionKey);
      if (error) return false;
      await writeAuditLog('question_override_reset', { form_code: formCode, question_key: questionKey });
      return true;
    } catch { return false; }
  }

  // ────────────────────────────────────────────────
  // Utilities
  // ────────────────────────────────────────────────

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  // ────────────────────────────────────────────────
  // PUBLIC API
  // ────────────────────────────────────────────────

  return {
    // Form Windows
    loadFormWindows,
    saveFormWindow,
    toggleFormWindow,
    deleteFormWindow,
    renderFormWindowsUI,
    refreshFormWindows,
    toggleWindow,
    deleteWindow: deleteWindowConfirm,
    showFormWindowModal,
    saveWindowFromModal,

    // Audit Logs
    writeAuditLog,
    loadAuditLogs,
    renderAuditLogsUI,
    refreshAuditLogs,
    filterAuditLogs,

    // Question Overrides
    loadQuestionOverrides,
    saveQuestionOverride,
    resetQuestionOverride
  };
})();

// Make globally accessible
window.AdminFeatures = AdminFeatures;
