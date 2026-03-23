/* ========== ADMIN PORTAL — USER MANAGEMENT SERVICE ========== */
/* SURVEY_BASE_URL, LOCKED_SUPERADMIN_EMAILS, ORG_HR_EMAIL_DOMAIN → defined in config.js */

function buildLinkUrl(org) {
  const code = org.org_code || org.code || encodeURIComponent(org.name);
  return `${SURVEY_BASE_URL}/index.html?org=${code}`;
}

async function refreshOrgHrCredentialsState() {
  if (typeof fetchOrgHrCredentials !== 'function') return;
  state.orgHrCredentials = await fetchOrgHrCredentials();
}

function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  const myRole = state.myRole || 'superadmin';
  const rows = state.userRows;

  function roleBadge(role) {
    const cls = role === 'superadmin' || role === 'super_admin' ? 'superadmin' : role === 'admin' ? 'admin' : role === 'org_hr' ? 'orghr' : 'viewer';
    const label = role === 'superadmin' || role === 'super_admin' ? '👑 Super Admin' : role === 'admin' ? '🔧 Admin' : role === 'org_hr' ? '🏢 Org HR' : '👁 Viewer';
    return `<span class="u-role-tag ${cls}">${label}</span>`;
  }

  tbody.innerHTML = rows.map((row) => {
    const isLocked = LOCKED_SUPERADMIN_EMAILS.includes(row.email);
    // locked email always displays as superadmin regardless of DB value
    const rowRole = isLocked ? 'superadmin' : (row.role || 'viewer');
    const canManage = !isLocked && (myRole === 'superadmin' || (myRole === 'admin' && rowRole === 'viewer'));
    return `<tr ${isLocked ? 'style="background:#FFFBEB"' : ''}>
      <td>${esc(row.email)}${isLocked ? ' <span style="font-size:10px;color:#92400E;font-weight:600;background:#FEF3CD;padding:1px 5px;border-radius:4px">🔒 Locked</span>' : ''}</td>
      <td>${roleBadge(rowRole)}</td>
      <td>${esc(row.org_name || 'ทุกองค์กร')}</td>
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
    orgFilter.innerHTML = `<option value="">ทุกองค์กร</option>${ORG_NAMES.map((name) => `<option${name===cur?' selected':''}>${esc(name)}</option>`).join('')}`;
  }
}

// ========== USER MODAL FUNCTIONS ==========
function showAddUserModal() {
  const myRole = state.myRole || 'superadmin';
  const isSuper = myRole === 'superadmin' || myRole === 'super_admin';
  _openUserModal({ title: '➕ เพิ่มผู้ใช้ใหม่', isEdit: false, email: '', role: 'viewer', orgName: '', expiresAt: '2026-06-30', isActive: true, isSuper });
}

function showEditUserModal(email) {
  if (LOCKED_SUPERADMIN_EMAILS.includes(email)) { showToast('❌ ไม่สามารถแก้ไข Super Admin ที่ถูก Lock ได้', 'warn'); return; }
  const row = state.userRows.find((r) => r.email === email);
  if (!row) { showToast('ไม่พบข้อมูลผู้ใช้', 'warn'); return; }
  const myRole = state.myRole || 'superadmin';
  const isSuper = myRole === 'superadmin' || myRole === 'super_admin';
  _openUserModal({
    title: `✏️ จัดการผู้ใช้`, isEdit: true,
    email: row.email, role: row.role || 'viewer',
    orgName: row.org_name || '', expiresAt: row.expires_at ? row.expires_at.slice(0,10) : '2026-06-30',
    isActive: row.is_active !== false, isSuper, rowId: row.id,
  });
}

function _openUserModal(opts) {
  const existing = document.getElementById('user-modal-overlay');
  if (existing) existing.remove();

  const roleOptions = opts.isSuper
    ? `<option value="viewer"${opts.role==='viewer'?' selected':''}>👁 Viewer — ดูข้อมูลเท่านั้น</option>
       <option value="org_hr"${opts.role==='org_hr'?' selected':''}>🏢 Org HR — HR ขององค์กร ดูข้อมูลเฉพาะองค์กร</option>
       <option value="admin"${opts.role==='admin'?' selected':''}>🔧 Admin — จัดการข้อมูลและ Viewer</option>
       <option value="super_admin"${opts.role==='super_admin' || opts.role==='superadmin'?' selected':''}>👑 Super Admin — สิทธิ์สูงสุด</option>`
    : `<option value="viewer" selected>👁 Viewer — ดูข้อมูลเท่านั้น</option>`;

  // Password section — ทั้ง add/edit ใช้ manual input ได้ (Edge Function จัดการ)
  const pwdTitle = opts.isEdit ? '🔐 เปลี่ยนรหัสผ่าน' : '🔐 ตั้งรหัสผ่านเริ่มต้น';
  const pwdHint  = opts.isEdit
    ? 'เว้นว่างถ้าไม่ต้องการเปลี่ยน · กรอกเพื่อ Reset รหัสผ่านของผู้ใช้รายนี้'
    : 'ตั้งรหัสผ่านสำหรับ Login ครั้งแรก · หรือกด 🔄 Auto ให้ระบบสร้างให้';
  const pwdPlaceholder = opts.isEdit ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่านเริ่มต้น...';
  const pwdResetHtml = `
    <div style="border-top:1px solid var(--bdr);padding-top:14px">
      <div style="font-size:12.5px;font-weight:700;color:var(--tx);margin-bottom:8px;display:flex;align-items:center;gap:5px">
        ${pwdTitle}
        <span class="info-tip" data-tip="พิมพ์รหัสผ่าน หรือกด Auto สร้างอัตโนมัติ&#10;จากนั้นกด 📋 Copy คัดลอกแจ้งผู้ใช้">i</span>
      </div>
      <div style="display:flex;gap:7px;align-items:center">
        <input type="text" id="um-new-pwd" placeholder="${pwdPlaceholder}"
          class="si" style="flex:1;font-family:monospace;letter-spacing:0.05em;font-size:13px">
        <button class="btn b-gray" style="padding:5px 10px;font-size:11.5px;white-space:nowrap" onclick="genTempPwd()">🔄 Auto</button>
        <button class="btn b-gray" style="padding:5px 10px;font-size:11.5px" onclick="copyPwd()">📋 Copy</button>
      </div>
      <div id="um-pwd-strength" style="font-size:11px;color:var(--tx3);margin-top:5px">${pwdHint}</div>
    </div>`;

  const overlay = document.createElement('div');
  overlay.id = 'user-modal-overlay';
  overlay.className = 'umodal-overlay';
  overlay.innerHTML = `
    <div class="umodal">
      <div class="umodal-head">
        <h3>${opts.title}</h3>
        <button class="btn b-gray" style="padding:5px 10px;min-width:32px" onclick="closeUserModal()">✕</button>
      </div>
      <div class="umodal-body">
        <div class="fg" style="margin:0">
          <label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">อีเมล *</label>
          <input class="si" id="um-email" type="email" placeholder="email@example.com" value="${esc(opts.email)}" ${opts.isEdit ? 'readonly style="background:var(--bg);color:var(--tx2)"' : ''}>
        </div>
        <div class="fg" style="margin:0">
          <label style="font-size:12px;font-weight:600;color:var(--tx2);display:flex;align-items:center;gap:5px;margin-bottom:5px">Role / ระดับสิทธิ์
            <span class="info-tip" data-tip="Viewer: ดูข้อมูลได้อย่างเดียว&#10;Admin: เพิ่ม/จัดการ Viewer ได้&#10;Super Admin: จัดการทุกอย่างรวมถึง Admin">i</span>
          </label>
          <select class="sel" id="um-role" style="width:100%">${roleOptions}</select>
        </div>
        <div class="fg" style="margin:0">
          <label style="font-size:12px;font-weight:600;color:var(--tx2);display:flex;align-items:center;gap:5px;margin-bottom:5px">องค์กรที่เข้าถึงได้
            <span class="info-tip" data-tip="Viewer จะเห็นเฉพาะข้อมูลขององค์กรนี้&#10;ถ้าเลือก 'ทุกองค์กร' จะเห็นข้อมูลทั้งหมด">i</span>
          </label>
          <select class="sel" id="um-org" style="width:100%">
            <option value="">ทุกองค์กร (ไม่จำกัด)</option>
            ${ORG_NAMES.map((n) => `<option value="${esc(n)}"${n===opts.orgName?' selected':''}>${esc(n)}</option>`).join('')}
          </select>
        </div>
        <div class="fg" style="margin:0">
          <label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">วันหมดอายุสิทธิ์</label>
          <input class="si" id="um-expires" type="date" value="${esc(opts.expiresAt)}">
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <label style="font-size:12px;font-weight:600;color:var(--tx2)">สถานะ:</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
            <input type="checkbox" id="um-active" ${opts.isActive ? 'checked' : ''}> เปิดใช้งาน (Active)
          </label>
        </div>
        <div>
          <div style="font-size:12.5px;font-weight:700;color:var(--tx);margin-bottom:8px;display:flex;align-items:center;gap:6px">สิทธิ์เข้าถึงฟอร์ม
            <span class="info-tip" data-tip="กำหนดว่า Viewer นี้มองเห็นฟอร์มใดได้บ้าง&#10;สามารถกำหนดได้อย่างละเอียด">i</span>
          </div>
          <div class="perm-card">
            <label class="perm-row">
              <input type="checkbox" id="um-perm-ch1" checked>
              <div class="perm-info">
                <div class="perm-name">📝 ดูผล Ch1 — ข้อมูลสุขภาวะองค์กร</div>
                <div class="perm-desc">เข้าถึงผลสำรวจแบบฟอร์ม Ch1 (ข้อมูลบุคลากรระดับองค์กร)</div>
              </div>
            </label>
            <label class="perm-row">
              <input type="checkbox" id="um-perm-wb" checked>
              <div class="perm-info">
                <div class="perm-name">💚 ดูผล Wellbeing Survey — สุขภาวะรายบุคคล</div>
                <div class="perm-desc">เข้าถึงผลสำรวจสุขภาวะรายบุคคล (PHQ-9, กิจกรรมทางกาย ฯลฯ)</div>
              </div>
            </label>
            <label class="perm-row">
              <input type="checkbox" id="um-perm-raw">
              <div class="perm-info">
                <div class="perm-name">🗂️ ดู Raw Data — ข้อมูลดิบรายแถว</div>
                <div class="perm-desc">เห็นข้อมูลระดับ row ไม่ผ่านการ Aggregate (ละเอียดสุด)</div>
              </div>
            </label>
            <label class="perm-row">
              <input type="checkbox" id="um-perm-export">
              <div class="perm-info">
                <div class="perm-name">📤 Export Excel — ส่งออกข้อมูล</div>
                <div class="perm-desc">ดาวน์โหลดรายงานเป็นไฟล์ .xlsx</div>
              </div>
            </label>
          </div>
        </div>
        ${pwdResetHtml}
        <div id="um-msg" style="font-size:12.5px;min-height:18px"></div>
      </div>
      <div class="umodal-foot">
        <button class="btn b-gray" onclick="closeUserModal()">ยกเลิก</button>
        <button class="btn b-solid" onclick="saveUserFromModal(${opts.isEdit ? 'true' : 'false'})">💾 ${opts.isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeUserModal(); });
  if (opts.isEdit) overlay.dataset.editEmail = opts.email;
  if (opts.rowId) overlay.dataset.rowId = opts.rowId;
}

function closeUserModal() {
  const el = document.getElementById('user-modal-overlay');
  if (el) el.remove();
}

async function saveUserFromModal(isEdit) {
  const overlay = document.getElementById('user-modal-overlay');
  const email = document.getElementById('um-email')?.value?.trim().toLowerCase();
  const role = document.getElementById('um-role')?.value || 'viewer';
  const orgName = document.getElementById('um-org')?.value || '';
  const expires = document.getElementById('um-expires')?.value || null;
  const isActive = document.getElementById('um-active')?.checked !== false;
  const msg = document.getElementById('um-msg');
  const newPwd = document.getElementById('um-new-pwd')?.value?.trim();

  if (!email || !email.includes('@')) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = '⚠️ กรุณากรอกอีเมลให้ถูกต้อง'; }
    return;
  }
  if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังบันทึก...'; }

  if (!isEdit && !newPwd) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = '⚠️ กรุณาตั้งรหัสผ่านเริ่มต้นก่อนเพิ่มผู้ใช้'; }
    return;
  }

  // Password — ใช้ Edge Function (set-user-password) ที่มี service_role key
  if (!isEdit && newPwd) {
    if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังสร้าง Auth account...'; }
    const fnResult = await callSetUserPasswordFn(email, newPwd, 'create');
    if (!fnResult.success) {
      if (msg) { msg.style.color = 'var(--D)'; msg.textContent = '❌ สร้าง Auth account ไม่สำเร็จ: ' + fnResult.error; }
      return;
    }
    if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'สร้าง Auth account แล้ว · กำลังบันทึก role...'; }
  }

  // Note: expires_at column removed — not in schema; use is_active for access control
  const payload = { email, role, org_name: orgName || null, is_active: isActive };
  if (role === 'org_hr' && newPwd) payload.initial_password = newPwd;
  // For org_hr role, also set org_code from org mapping
  if (role === 'org_hr' && orgName) {
    // org_code resolved from DB-driven ORG_LOOKUP (populated by refreshOrgDerivedState after loadBackend)
    const orgMatch = ORG_LOOKUP.get(orgName) || state.orgProfiles.find(o => o.org_name_th === orgName);
    if (orgMatch) {
      payload.org_code = orgMatch.org_code || orgMatch.code?.toLowerCase();
      payload.display_name = orgName;
    }
  }
  let rows = [];

  try {
    const rowId = overlay?.dataset.rowId || null;
    const editEmail = overlay?.dataset.editEmail || null;
    rows = await saveAdminUserRole(payload, isEdit ? rowId : null, isEdit ? editEmail : null);
  } catch (error) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = '❌ บันทึกไม่สำเร็จ: ' + error.message; }
    return;
  }

  state.userRows = rows || [];
  await refreshOrgHrCredentialsState();
  renderUsers();
  renderOrgHrCredentials();

  // Edit mode + password — update via Edge Function
  if (isEdit && newPwd) {
    if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังเปลี่ยนรหัสผ่าน...'; }
    const fnResult = await callSetUserPasswordFn(email, newPwd, 'update');
    if (fnResult.success && role === 'org_hr') {
      await sb.from('admin_user_roles').update({ initial_password: newPwd }).eq('email', email);
      await refreshOrgHrCredentialsState();
      renderOrgHrCredentials();
    }
    closeUserModal();
    if (fnResult.success) {
      showToast(`✅ แก้ไข ${email} สำเร็จ · 🔑 รหัสผ่านใหม่: ${newPwd} — แจ้งผู้ใช้ได้เลย`, 'success', 12000);
    } else {
      showToast(`✅ แก้ไข role สำเร็จ · ⚠️ เปลี่ยนรหัสผ่านไม่สำเร็จ: ${fnResult.error}`, 'warn', 8000);
    }
  } else {
    closeUserModal();
    if (!isEdit && newPwd) {
      showToast(`✅ เพิ่ม ${email} สำเร็จ · 🔑 รหัสผ่าน: ${newPwd} — แจ้งผู้ใช้ได้เลย`, 'success', 12000);
    } else {
      showToast(`${isEdit ? 'แก้ไข' : 'เพิ่ม'} ${email} สำเร็จ ✅`, 'success');
    }
  }
}

// ── Password utilities ─────────────────────────────────────
function genTempPwd() {
  const yr = new Date().getFullYear() + 543;
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  const code = `WB-${rand}-${yr}`;
  const el = document.getElementById('um-new-pwd');
  if (el) {
    el.value = code;
    el.style.color = 'var(--A)';
    const hint = document.getElementById('um-pwd-strength');
    if (hint) { hint.style.color = 'var(--A)'; hint.textContent = `✅ สร้างรหัส: ${code} — กด 📋 Copy แจ้งผู้ใช้`; }
  }
}

function copyPwd() {
  const el = document.getElementById('um-new-pwd');
  if (el?.value?.trim()) {
    navigator.clipboard.writeText(el.value.trim()).then(() => showToast('📋 คัดลอกรหัสผ่านแล้ว ✅'));
  } else {
    showToast('ยังไม่มีรหัสผ่าน — กรอกเองหรือกด 🔄 Auto ก่อน', 'warn');
  }
}

async function applyPasswordChange(email, pwd, silent = false) {
  if (!pwd || pwd.length < 6) {
    if (!silent) showToast('⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'warn');
    return false;
  }
  const currentEmail = state.session?.user?.email;
  const isSelf = currentEmail?.toLowerCase() === email?.toLowerCase();
  if (isSelf) {
    // เปลี่ยนรหัสผ่านตัวเองโดยตรงผ่าน updateUser (ใช้ได้กับ anon key)
    const { error } = await sb.auth.updateUser({ password: pwd });
    if (error) {
      if (!silent) showToast('❌ เปลี่ยนรหัสผ่านไม่สำเร็จ: ' + error.message, 'error');
      const msgEl = document.getElementById('um-msg');
      if (msgEl) { msgEl.style.color = 'var(--D)'; msgEl.textContent = '❌ ' + error.message; }
      return false;
    }
    const selfRow = state.userRows.find((r) => r.email === email);
    if (selfRow?.role === 'org_hr') {
      await sb.from('admin_user_roles').update({ initial_password: pwd }).eq('email', email);
      await refreshOrgHrCredentialsState();
      renderOrgHrCredentials();
    }
    if (!silent) showToast('🔐 เปลี่ยนรหัสผ่านสำเร็จ ✅', 'success');
    return true;
  } else {
    // เปลี่ยนรหัสผ่านผู้ใช้อื่นผ่าน Edge Function (มี service_role key)
    const msgEl = document.getElementById('um-msg');
    if (msgEl) { msgEl.style.color = 'var(--tx2)'; msgEl.textContent = 'กำลังเปลี่ยนรหัสผ่าน...'; }
    const result = await callEdgeFunction('set-user-password', { email, password: pwd, action: 'update' });
    if (!result.success) {
      if (!silent) showToast('❌ เปลี่ยนรหัสผ่านไม่สำเร็จ: ' + result.error, 'error');
      if (msgEl) { msgEl.style.color = 'var(--D)'; msgEl.textContent = '❌ ' + result.error; }
      return false;
    }
    const row = state.userRows.find((r) => r.email === email);
    if (row?.role === 'org_hr') {
      await sb.from('admin_user_roles').update({ initial_password: pwd }).eq('email', email);
      await refreshOrgHrCredentialsState();
      renderOrgHrCredentials();
    }
    if (!silent) showToast('🔐 เปลี่ยนรหัสผ่านสำเร็จ ✅', 'success');
    return true;
  }
}

async function sendPasswordResetLink(email) {
  const loginUrl = window.location.origin + '/admin-login.html';
  showToast('กำลังส่ง Reset Link...', 'info');
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: loginUrl });
  if (error) {
    showToast('❌ ส่ง Reset Link ไม่สำเร็จ: ' + error.message, 'error');
  } else {
    showToast(`📧 ส่ง Reset Link ไปยัง ${email} แล้ว — ให้ผู้ใช้ตรวจสอบอีเมล`, 'success', 8000);
  }
}

// ── Edge Function: set-user-password ─────────────────────────────────────────
// action: 'create' (new user, email_confirm:true) | 'update' (change password)
async function callSetUserPasswordFn(email, password, action) {
  const token = state.session?.access_token;
  if (!token) { showToast('❌ ไม่พบ session — กรุณา Login ใหม่', 'error'); return { success: false, error: 'No session' }; }
  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/set-user-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password, action }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return { success: false, error: data.error || `HTTP ${resp.status}` };
    return { success: true, ...data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Modal เปลี่ยนรหัสผ่านสำหรับ locked superadmin
function showChangePasswordModal(email) {
  const existing = document.getElementById('user-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'user-modal-overlay';
  overlay.className = 'umodal-overlay';
  overlay.innerHTML = `
    <div class="umodal" style="max-width:430px">
      <div class="umodal-head">
        <h3>🔐 เปลี่ยนรหัสผ่าน</h3>
        <button class="btn b-gray" style="padding:5px 10px;min-width:32px" onclick="closeUserModal()">✕</button>
      </div>
      <div class="umodal-body">
        <div class="fg" style="margin:0">
          <label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">อีเมล</label>
          <input class="si" type="email" value="${esc(email)}" readonly
            style="background:var(--bg);color:var(--tx2);font-weight:600">
        </div>
        <div class="fg" style="margin:0">
          <label style="font-size:12px;font-weight:600;color:var(--tx2);display:flex;align-items:center;gap:5px;margin-bottom:5px">
            รหัสผ่านใหม่ *
            <span class="info-tip" data-tip="พิมพ์รหัสผ่านใหม่ หรือกด Auto&#10;จากนั้น Copy คัดลอกเก็บไว้">i</span>
          </label>
          <div style="display:flex;gap:7px;align-items:center">
            <input type="text" id="um-new-pwd" placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
              class="si" style="flex:1;font-family:monospace;letter-spacing:0.05em;font-size:13px">
            <button class="btn b-gray" style="padding:5px 10px;font-size:11.5px;white-space:nowrap" onclick="genTempPwd()">🔄 Auto</button>
            <button class="btn b-gray" style="padding:5px 10px;font-size:11.5px" onclick="copyPwd()">📋 Copy</button>
          </div>
          <div id="um-pwd-strength" style="font-size:11px;color:var(--tx3);margin-top:5px">
            กรอกรหัสผ่านใหม่ หรือกด Auto ให้ระบบสร้างให้ แล้ว Copy เก็บไว้
          </div>
        </div>
        <div id="um-msg" style="font-size:12.5px;min-height:18px"></div>
      </div>
      <div class="umodal-foot">
        <button class="btn b-gray" onclick="closeUserModal()">ยกเลิก</button>
        <button class="btn b-solid" onclick="handlePwdChangeSubmit('${esc(email)}')">🔐 เปลี่ยนรหัสผ่าน</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeUserModal(); });
}

async function handlePwdChangeSubmit(email) {
  const pwd = document.getElementById('um-new-pwd')?.value?.trim();
  const msg = document.getElementById('um-msg');
  if (!pwd) { if (msg) { msg.style.color = 'var(--D)'; msg.textContent = '⚠️ กรุณาตั้งรหัสผ่านก่อน'; } return; }
  if (pwd.length < 6) { if (msg) { msg.style.color = 'var(--D)'; msg.textContent = '⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; } return; }
  if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังบันทึก...'; }
  const ok = await applyPasswordChange(email, pwd, false);
  if (ok) {
    setTimeout(() => closeUserModal(), 1800);
  } else {
    // Service role not available — show success with manual copy note
    if (msg) {
      msg.innerHTML = `⚠️ ใช้ Service Role Key เพื่อ apply อัตโนมัติ<br>
        รหัสผ่านสำหรับ <b>${esc(email)}</b>: <code style="background:var(--PL);padding:2px 6px;border-radius:4px;color:var(--P);font-weight:700">${esc(pwd)}</code>
        <button class="btn b-gray" style="padding:3px 8px;font-size:11px;margin-left:6px"
          onclick="navigator.clipboard.writeText('${esc(pwd)}').then(()=>showToast('คัดลอกแล้ว ✅'))">📋 Copy</button>`;
      msg.style.color = 'var(--W)';
    }
  }
}

async function resetUserPassword(email) {
  genTempPwd(); // reuse the new genTempPwd function
}

async function deleteViewer(id, email) {
  showConfirm(`ต้องการลบ Viewer: ${email} ออกจากระบบใช่หรือไม่?`, async () => {
    try {
      state.userRows = await deleteAdminUserRole(id);
    } catch (error) {
      showToast('ลบไม่สำเร็จ: ' + error.message, 'error');
      return;
    }
    renderUsers();
    renderOrgHrCredentials();
    showToast(`ลบ ${email} เรียบร้อยแล้ว`, 'success');
  });
}

async function saveViewer() {
  const email = document.getElementById('viewer-email')?.value?.trim();
  const orgName = document.getElementById('viewer-org-select')?.value || '';
  const expires = document.getElementById('viewer-expires')?.value || null;
  const msg = document.getElementById('viewer-form-msg');

  if (!email || !email.includes('@')) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'กรุณากรอกอีเมลให้ถูกต้อง'; }
    return;
  }
  if (!orgName) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'กรุณาเลือกองค์กร'; }
    return;
  }
  if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังบันทึก...'; }

  const editId = document.getElementById('viewer-edit-id')?.value;
  const payload = { email, role: 'viewer', org_name: orgName, is_active: true };
  try {
    if (editId) {
      const existing = state.userRows.find((r) => r.email === editId);
      state.userRows = await saveAdminUserRole(payload, existing?.id || null, null);
    } else {
      state.userRows = await saveAdminUserRole(payload, null, null);
    }
  } catch (error) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'บันทึกไม่สำเร็จ: ' + error.message; }
    return;
  }

  renderUsers();
  renderOrgHrCredentials();
  resetViewerForm();
  const yr = new Date().getFullYear() + 543;
  const code = `WB-${(ORG_LOOKUP.get(orgName)?.code || 'ORG')}-${yr}`;
  const codeEl = document.getElementById('temp-code-display');
  if (codeEl) codeEl.textContent = code;
  if (msg) { msg.style.color = 'var(--G)'; msg.textContent = `✅ บันทึก ${email} สำเร็จ`; }
}

function copyTempCode() {
  const code = document.getElementById('temp-code-display')?.textContent || '';
  navigator.clipboard.writeText(code).then(() => showToast('คัดลอกรหัส: ' + code));
}

/* ========== ORG HR BATCH CREATION ========== */

function generateOrgHrPassword() {
  const yr = new Date().getFullYear() + 543;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WB-${rand}-${yr}`;
}

async function batchCreateOrgHrUsers() {
  const btn = document.getElementById('btn-batch-orghr');
  const msgEl = document.getElementById('orghr-batch-msg');

  // Check which org_hr users already exist
  const existingOrgHr = state.userRows.filter(r => r.role === 'org_hr');
  const existingCodes = existingOrgHr.map(r => r.org_code);
  // Use DB-driven state.orgProfiles as source of orgs (Supabase = SSOT)
  const toCreate = state.orgProfiles.filter(org => org.org_code && !existingCodes.includes(org.org_code));

  if (toCreate.length === 0) {
    showToast('✅ org_hr users ครบทุกองค์กรแล้ว — ไม่ต้องสร้างเพิ่ม', 'info');
    renderOrgHrCredentials();
    return;
  }

  const confirmMsg = `จะสร้าง org_hr user ${toCreate.length} องค์กร:\n\n${toCreate.map(o => `• ${o.org_code}${ORG_HR_EMAIL_DOMAIN} → ${o.org_name_th}`).join('\n')}\n\nดำเนินการต่อหรือไม่?`;

  showConfirm(confirmMsg, async () => {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ กำลังสร้าง...'; }
    if (msgEl) { msgEl.style.display = 'block'; msgEl.textContent = `กำลังสร้าง 0/${toCreate.length}...`; }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < toCreate.length; i++) {
      const org = toCreate[i];
      const email = org.org_code + ORG_HR_EMAIL_DOMAIN;
      const password = generateOrgHrPassword();

      if (msgEl) { msgEl.textContent = `กำลังสร้าง ${i + 1}/${toCreate.length}: ${email}...`; }

      try {
        // Step 1: Create Auth user via Edge Function
        const authResult = await callSetUserPasswordFn(email, password, 'create');
        if (!authResult.success) {
          results.push({ ...org, email, password, status: 'error', error: authResult.error });
          failCount++;
          continue;
        }

        // Step 2: Insert role into admin_user_roles
        let roleSaved = false;
        try {
          await saveAdminUserRole({
            email: email,
            role: 'org_hr',
            org_code: org.org_code,
            org_name: org.org_name_th,
            display_name: org.org_name_th,
            is_active: true,
            initial_password: password,
            created_by: state.session?.user?.email || 'system',
          }, null, null);
          roleSaved = true;
        } catch (roleError) {
          // Auth user created but role insert failed
          results.push({ ...org, email, password, status: 'partial', error: roleError.message });
          failCount++;
        }

        if (roleSaved) {
          results.push({ ...org, email, password, status: 'success' });
          successCount++;
        }
      } catch (err) {
        results.push({ ...org, email, password, status: 'error', error: err.message });
        failCount++;
      }
    }

    // Refresh user list
    state.userRows = await fetchAdminUserRoles();
    await refreshOrgHrCredentialsState();
    renderUsers();
    renderOrgHrCredentials();

    if (btn) { btn.disabled = false; btn.textContent = '🔑 สร้าง org_hr ทั้งหมด'; }

    if (failCount > 0) {
      const failedOrgs = results.filter(r => r.status !== 'success').map(r => `${r.email}: ${r.error}`).join('\n');
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = '#FFFBEB';
        msgEl.style.color = '#92400E';
        msgEl.textContent = `✅ สร้างสำเร็จ ${successCount} / ❌ ไม่สำเร็จ ${failCount} องค์กร`;
      }
      showToast(`สร้างสำเร็จ ${successCount} องค์กร · ไม่สำเร็จ ${failCount} องค์กร`, 'warn', 8000);
    } else {
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = '#F0FFF4';
        msgEl.style.color = '#276749';
        msgEl.textContent = `✅ สร้าง org_hr user สำเร็จทั้ง ${successCount} องค์กร — กด 📋 Copy ทั้งหมด เพื่อคัดลอก credentials`;
      }
      showToast(`✅ สร้าง org_hr สำเร็จทั้ง ${successCount} องค์กร!`, 'success', 5000);
    }
  });
}

async function renderOrgHrCredentials() {
  await refreshOrgHrCredentialsState();

  const tbody = document.getElementById('orghr-cred-tbody');
  if (!tbody) return;

  const orgHrUsers = state.orgHrCredentials || [];

  if (orgHrUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:20px">ยังไม่มีข้อมูล org_hr — กดปุ่ม "🔑 สร้าง org_hr ทั้งหมด" เพื่อเริ่มสร้าง</td></tr>';
    return;
  }

  tbody.innerHTML = orgHrUsers.map((row, i) => {
    const pwd = row.initial_password || '••••••••';
    const hasPwd = !!row.initial_password;
    return `<tr>
      <td>${i + 1}</td>
      <td style="font-weight:600;font-size:12px">${esc(row.display_name || row.org_name || row.org_code || '—')}</td>
      <td><code style="font-size:12px;background:var(--bg);padding:3px 8px;border-radius:4px;color:var(--P);font-weight:600">${esc(row.email)}</code></td>
      <td>
        <span id="orghr-pwd-${i}" style="font-family:monospace;font-size:13px;font-weight:700;color:${hasPwd ? 'var(--A)' : 'var(--tx3)'};letter-spacing:0.05em">${hasPwd ? esc(pwd) : '(ไม่มี)'}</span>
      </td>
      <td><span class="badge ${row.is_active !== false ? 'bg' : 'bx'}">${row.is_active !== false ? 'Active' : 'Inactive'}</span></td>
      <td class="td-act">
        ${hasPwd ? `<button class="btn b-blue" style="font-size:11px;padding:4px 10px" onclick="copyOrgHrRow('${esc(row.email)}','${esc(pwd)}','${esc(row.display_name || row.org_name || '')}')">📋 Copy</button>` : ''}
        <button class="btn b-gray" style="font-size:11px;padding:4px 10px" onclick="showEditUserModal('${esc(row.email)}')">✏️</button>
      </td>
    </tr>`;
  }).join('');
}

function copyOrgHrRow(email, pwd, orgName) {
  const text = `องค์กร: ${orgName}\nEmail: ${email}\nPassword: ${pwd}`;
  navigator.clipboard.writeText(text).then(() =>
    showToast(`📋 คัดลอก credentials ของ ${orgName} แล้ว`, 'success')
  );
}

function copyAllOrgHrCredentials() {
  const orgHrUsers = (state.orgHrCredentials || []).filter(r => r.initial_password);
  if (orgHrUsers.length === 0) {
    showToast('ยังไม่มีข้อมูล org_hr credentials', 'warn');
    return;
  }

  const header = 'ข้อมูลเข้าสู่ระบบ org_hr — Well-being Survey\n' + '='.repeat(50) + '\n\n';
  const body = orgHrUsers.map((row, i) =>
    `${i + 1}. ${row.display_name || row.org_name || row.org_code}\n   Email: ${row.email}\n   Password: ${row.initial_password}`
  ).join('\n\n');

  navigator.clipboard.writeText(header + body).then(() =>
    showToast(`📋 คัดลอก credentials ทั้ง ${orgHrUsers.length} องค์กรแล้ว`, 'success', 5000)
  );
}

function exportOrgHrCredentialsCsv() {
  const orgHrUsers = (state.orgHrCredentials || []).filter(r => r.initial_password);
  if (orgHrUsers.length === 0) {
    showToast('ยังไม่มีข้อมูล org_hr credentials', 'warn');
    return;
  }

  const csv = 'องค์กร,Email,Password,org_code,สถานะ\n' +
    orgHrUsers.map(row =>
      `"${row.display_name || row.org_name || ''}","${row.email}","${row.initial_password}","${row.org_code || ''}","${row.is_active !== false ? 'Active' : 'Inactive'}"`
    ).join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `org_hr_credentials_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 ดาวน์โหลด CSV สำเร็จ', 'success');
}
