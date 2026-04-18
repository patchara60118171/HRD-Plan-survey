/* ========== ADMIN PORTAL — FORM WINDOWS PAGE ========== */

// รวม test-org ด้วยในหน้านี้
function getFwCatalog() {
  const catalog = getOrgCatalog();
  const hasTest = catalog.some(o => o.code === 'test-org');
  if (!hasTest) {
    catalog.push({ code: 'test-org', name: 'องค์กรทดสอบระบบ', ministry: '—' });
  }
  return catalog;
}

const FW_DEFAULT_CLOSED_MSG = 'ณ ขณะนี้ฟอร์มปิดรับคำตอบแล้ว';

async function fwFetchWindows() {
  const { data: windows, error } = await sb
    .from('form_windows')
    .select('*')
    .eq('form_code', 'wellbeing')
    .eq('round_code', 'round_2569');
  if (error) return { windows: null, error };
  return { windows: windows || [], error: null };
}

function fwBuildRows(catalog, windows) {
  const winMap = new Map((windows || []).map(w => [w.org_code || '__global__', w]));
  const globalWin = winMap.get('__global__') || winMap.get(null) || null;
  const now = new Date();
  return catalog.map(org => {
    const w = winMap.get(org.code) || globalWin;
    const isOpen = w ? isWindowOpen(w, now) : true;
    const hasOverride = winMap.has(org.code);
    const closedMsg = winMap.has(org.code) ? (winMap.get(org.code).closed_message || '') : '';
    const isTest = org.code === 'test-org';
    const rowStyle = isTest ? 'background:var(--bg2);opacity:.85' : '';
    return `<tr id="fw-row-${org.code}" style="${rowStyle}">
      <td>
        ${esc(org.name)}
        <br><span style="font-size:11px;color:var(--tx3)">${org.code}</span>
        ${isTest ? '<span style="font-size:10px;color:var(--tx3);margin-left:4px">[ทดสอบ]</span>' : ''}
      </td>
      <td>
        <span class="badge ${isOpen ? 'bg' : 'br'}" id="fw-badge-${org.code}">${isOpen ? 'เปิดรับ' : 'ปิดรับ'}</span>
        ${hasOverride ? '<span style="font-size:10px;color:var(--P);margin-left:4px">กำหนดเอง</span>' : '<span style="font-size:10px;color:var(--tx3);margin-left:4px">ค่าเริ่มต้น</span>'}
      </td>
      <td>
        <input type="text" class="si fw-closed-msg" data-org="${org.code}"
          value="${esc(closedMsg)}"
          placeholder="${esc(FW_DEFAULT_CLOSED_MSG)}"
          style="width:100%;font-size:12px"
          onchange="fwSaveClosedMsg('${org.code}')">
      </td>
      <td style="text-align:center">
        <button id="fw-btn-${org.code}" class="btn ${isOpen ? 'b-blue' : 'b-gray'}"
          onclick="fwToggle('${org.code}', ${!isOpen})"
          style="min-width:80px;font-size:12px">
          ${isOpen ? '✅ เปิดรับ' : '🔒 ปิดรับ'}
        </button>
      </td>
    </tr>`;
  }).join('');
}

async function loadWbFormWindowsCard() {
  const container = document.getElementById('fw-wb-body');
  if (!container) return;
  container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:20px">กำลังโหลด...</td></tr>`;
  const catalog = getFwCatalog();
  const { windows, error } = await fwFetchWindows();
  if (error) { container.innerHTML = `<tr><td colspan="6" style="color:var(--D);padding:16px">⚠️ โหลดข้อมูลไม่สำเร็จ: ${esc(error.message)}</td></tr>`; return; }
  container.innerHTML = fwBuildRows(catalog, windows);
}

async function loadFormWindowsPage() {
  const container = document.getElementById('fw-table-body');
  if (!container) return;
  container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:20px">กำลังโหลด...</td></tr>`;
  const catalog = getFwCatalog();
  const { windows, error } = await fwFetchWindows();
  if (error) { container.innerHTML = `<tr><td colspan="6" style="color:var(--D);padding:16px">⚠️ โหลดข้อมูลไม่สำเร็จ: ${esc(error.message)}</td></tr>`; return; }
  container.innerHTML = fwBuildRows(catalog, windows);
}

function isWindowOpen(w, now = new Date()) {
  if (!w.is_active) return false;
  if (w.opens_at && new Date(w.opens_at) > now) return false;
  if (w.closes_at && new Date(w.closes_at) < now) return false;
  return true;
}

async function fwUpsert(orgCode, fields) {
  // Check if record exists first, then insert or update
  const { data: existing } = await sb.from('form_windows')
    .select('id').eq('form_code', 'wellbeing').eq('round_code', 'round_2569').eq('org_code', orgCode).maybeSingle();
  const payload = { form_code: 'wellbeing', round_code: 'round_2569', org_code: orgCode, updated_at: new Date().toISOString(), ...fields };
  if (existing?.id) {
    const { error } = await sb.from('form_windows').update(payload).eq('id', existing.id);
    return error;
  } else {
    const { error } = await sb.from('form_windows').insert(payload);
    return error;
  }
}

async function fwSaveClosedMsg(orgCode) {
  const row = document.getElementById(`fw-row-${orgCode}`);
  if (!row) return;
  const msgEl = row.querySelector('.fw-closed-msg');
  const closed_message = msgEl?.value?.trim() || null;
  const error = await fwUpsert(orgCode, { closed_message });
  if (error) { showToast(`บันทึกข้อความไม่สำเร็จ: ${error.message}`, 'error'); return; }
  showToast(`✅ บันทึกข้อความปิดรับ ${orgCode} แล้ว`, 'success');
}

async function fwToggle(orgCode, isOpen) {
  const error = await fwUpsert(orgCode, { is_active: isOpen });
  if (error) { showToast(`เปลี่ยนสถานะไม่สำเร็จ: ${error.message}`, 'error'); return; }
  // Update badge
  const badge = document.getElementById(`fw-badge-${orgCode}`);
  if (badge) { badge.className = `badge ${isOpen ? 'bg' : 'br'}`; badge.textContent = isOpen ? 'เปิดรับ' : 'ปิดรับ'; }
  // Update button
  const btn = document.getElementById(`fw-btn-${orgCode}`);
  if (btn) {
    btn.className = `btn ${isOpen ? 'b-blue' : 'b-gray'}`;
    btn.textContent = isOpen ? '✅ เปิดรับ' : '🔒 ปิดรับ';
    btn.onclick = () => fwToggle(orgCode, !isOpen);
  }
  showToast(`${isOpen ? '✅ เปิดรับ' : '🔒 ปิดรับ'} ${orgCode} แล้ว`, 'success');
}

async function fwReset(orgCode) {
  const ok = await showConfirm(`รีเซ็ตการตั้งค่า ${orgCode} กลับเป็นค่าเริ่มต้น (ใช้การตั้งค่าทั่วไป)?`);
  if (!ok) return;
  const { error } = await sb.from('form_windows')
    .delete()
    .eq('form_code', 'wellbeing')
    .eq('round_code', 'round_2569')
    .eq('org_code', orgCode);
  if (error) { showToast(`รีเซ็ตไม่สำเร็จ: ${error.message}`, 'error'); return; }
  showToast(`↩ รีเซ็ต ${orgCode} เรียบร้อยแล้ว`, 'success');
  loadFormWindowsPage();
}

async function fwOpenAll() {
  const catalog = getFwCatalog();
  for (const org of catalog) await fwUpsert(org.code, { is_active: true });
  showToast('✅ เปิดรับทุกองค์กรแล้ว', 'success');
  loadFormWindowsPage();
}

async function fwCloseAll() {
  const ok = await showConfirm('ปิดรับแบบสอบถามทุกองค์กร?');
  if (!ok) return;
  const catalog = getFwCatalog();
  for (const org of catalog) await fwUpsert(org.code, { is_active: false });
  showToast('🔒 ปิดรับทุกองค์กรแล้ว', 'success');
  loadFormWindowsPage();
}
