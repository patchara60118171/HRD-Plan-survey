/* ========== ADMIN PORTAL — FORM WINDOWS PAGE ========== */

async function loadFormWindowsPage() {
  const container = document.getElementById('fw-table-body');
  if (!container) return;
  container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:20px">กำลังโหลด...</td></tr>`;

  const catalog = getOrgCatalog();

  // Load existing windows from Supabase
  const { data: windows, error } = await sb
    .from('form_windows')
    .select('*')
    .eq('form_code', 'wellbeing')
    .eq('round_code', 'round_2569');

  if (error) {
    container.innerHTML = `<tr><td colspan="6" style="color:var(--D);padding:16px">⚠️ โหลดข้อมูลไม่สำเร็จ: ${esc(error.message)}</td></tr>`;
    return;
  }

  // Build map: org_code → window record (null = use global)
  const winMap = new Map((windows || []).map(w => [w.org_code || '__global__', w]));
  const globalWin = winMap.get('__global__') || winMap.get(null) || null;

  const now = new Date();

  const rows = catalog.map(org => {
    const w = winMap.get(org.code) || globalWin;
    const isOpen = w ? isWindowOpen(w, now) : true;
    const hasOverride = winMap.has(org.code);
    return { org, w, isOpen, hasOverride };
  });

  container.innerHTML = rows.map(({ org, w, isOpen, hasOverride }) => {
    const statusCls = isOpen ? 'bg' : 'br';
    const statusTxt = isOpen ? 'เปิดรับ' : 'ปิดรับ';
    const opensVal = w?.opens_at ? toLocalDatetimeInput(w.opens_at) : '';
    const closesVal = w?.closes_at ? toLocalDatetimeInput(w.closes_at) : '';
    const overrideBadge = hasOverride ? '<span style="font-size:10px;color:var(--P);margin-left:4px">กำหนดเอง</span>' : '<span style="font-size:10px;color:var(--tx3);margin-left:4px">ค่าเริ่มต้น</span>';
    return `<tr id="fw-row-${org.code}">
      <td>${esc(org.name)}<br><span style="font-size:11px;color:var(--tx3)">${org.code}</span></td>
      <td><span class="badge ${statusCls}">${statusTxt}</span>${overrideBadge}</td>
      <td><input type="datetime-local" class="si fw-opens" data-org="${org.code}" value="${opensVal}" style="width:175px;font-size:12px"></td>
      <td><input type="datetime-local" class="si fw-closes" data-org="${org.code}" value="${closesVal}" style="width:175px;font-size:12px"></td>
      <td>
        <label class="tgl" style="margin:0" title="เปิด/ปิดทันที">
          <input type="checkbox" class="fw-toggle" data-org="${org.code}" ${isOpen ? 'checked' : ''} onchange="fwToggle('${org.code}',this.checked)">
          <div class="tgl-s"></div>
        </label>
      </td>
      <td class="td-act">
        <button class="btn b-blue" onclick="fwSave('${org.code}')">💾 บันทึก</button>
        ${hasOverride ? `<button class="btn b-gray" onclick="fwReset('${org.code}')">↩ รีเซ็ต</button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

function isWindowOpen(w, now = new Date()) {
  if (!w.is_active) return false;
  if (w.opens_at && new Date(w.opens_at) > now) return false;
  if (w.closes_at && new Date(w.closes_at) < now) return false;
  return true;
}

function toLocalDatetimeInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function fwSave(orgCode) {
  const row = document.getElementById(`fw-row-${orgCode}`);
  if (!row) return;
  const opensEl = row.querySelector('.fw-opens');
  const closesEl = row.querySelector('.fw-closes');
  const toggleEl = row.querySelector('.fw-toggle');

  const opens_at = opensEl?.value ? new Date(opensEl.value).toISOString() : null;
  const closes_at = closesEl?.value ? new Date(closesEl.value).toISOString() : null;
  const is_active = toggleEl?.checked ?? true;

  const { error } = await sb.from('form_windows').upsert({
    form_code: 'wellbeing',
    round_code: 'round_2569',
    org_code: orgCode,
    opens_at,
    closes_at,
    is_active,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'form_code,round_code,org_code' });

  if (error) { showToast(`บันทึกไม่สำเร็จ: ${error.message}`, 'error'); return; }
  showToast(`✅ บันทึกการตั้งค่า ${orgCode} เรียบร้อยแล้ว`, 'success');
  loadFormWindowsPage();
}

async function fwToggle(orgCode, isOpen) {
  const { error } = await sb.from('form_windows').upsert({
    form_code: 'wellbeing',
    round_code: 'round_2569',
    org_code: orgCode,
    is_active: isOpen,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'form_code,round_code,org_code' });

  if (error) { showToast(`เปลี่ยนสถานะไม่สำเร็จ: ${error.message}`, 'error'); return; }
  const badge = document.querySelector(`#fw-row-${orgCode} .badge`);
  if (badge) {
    badge.className = `badge ${isOpen ? 'bg' : 'br'}`;
    badge.textContent = isOpen ? 'เปิดรับ' : 'ปิดรับ';
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
  const catalog = getOrgCatalog();
  const upserts = catalog.map(org => ({
    form_code: 'wellbeing',
    round_code: 'round_2569',
    org_code: org.code,
    is_active: true,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await sb.from('form_windows').upsert(upserts, { onConflict: 'form_code,round_code,org_code' });
  if (error) { showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error'); return; }
  showToast('✅ เปิดรับทุกองค์กรแล้ว', 'success');
  loadFormWindowsPage();
}

async function fwCloseAll() {
  const ok = await showConfirm('ปิดรับแบบสอบถามทุกองค์กร?');
  if (!ok) return;
  const catalog = getOrgCatalog();
  const upserts = catalog.map(org => ({
    form_code: 'wellbeing',
    round_code: 'round_2569',
    org_code: org.code,
    is_active: false,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await sb.from('form_windows').upsert(upserts, { onConflict: 'form_code,round_code,org_code' });
  if (error) { showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error'); return; }
  showToast('🔒 ปิดรับทุกองค์กรแล้ว', 'success');
  loadFormWindowsPage();
}
