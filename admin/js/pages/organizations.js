/**
 * organizations.js — Page: Organizations Management
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, ORG_LOOKUP, sb), utils.js (esc, fmtDate, fmtNum, showToast, showConfirm)
 *
 * Functions:
 *   renderOrgs(summary)
 *   filterOrgTable()
 *   showOrgDetail(orgName)      → TODO: move full impl from admin.html ~line 1483
 *   saveOrgProfile(event)       → TODO: move full impl from admin.html ~line 1534
 *   saveSimpleOrg()             → TODO: move full impl from admin.html ~line 3260
 */

// ─── Render Orgs Table ────────────────────────────────────────────────────────

function renderOrgs(summary) {
  const table = document.querySelector('#org-table tbody');
  if (!table) return;
  if (summary.length === 0) {
    table.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--tx3);padding:24px">ยังไม่มีข้อมูลองค์กร</td></tr>';
    return;
  }
  table.innerHTML = summary.map((org) => {
    const ch1Status = org.ch1Count > 0 ? 'ส่งแล้ว' : 'ยังไม่เริ่ม';
    const ch1Cls = org.ch1Count > 0 ? 'bg' : 'br';
    const profile = state.orgProfiles.find((p) => p.org_name_th === org.name);
    const orgId = profile?.id || null;
    const showDash = profile?.show_in_dashboard !== false;
    return `<tr>
      <td>${esc(org.name)}</td>
      <td>${esc(org.ministry || '—')}</td>
      <td><span class="badge ${ch1Cls}">${ch1Status}</span></td>
      <td>${fmtNum(org.wellbeingSubmitted)}</td>
      <td>${fmtDate(org.latestCh1 || org.latestWb)}</td>
      <td style="text-align:center">
        <label class="tgl" title="แสดงใน Dashboard">
          <input type="checkbox" ${showDash ? 'checked' : ''} ${orgId ? `onchange="toggleOrgDash('${orgId}',${showDash})"` : 'disabled'}>
          <div class="tgl-s"></div>
        </label>
      </td>
      <td class="td-act">
        <button class="btn b-blue" onclick="showOrgDetail('${esc(org.name)}')">✏️ จัดการ</button>
        ${orgId ? `<button class="btn b-red" onclick="deleteOrg('${orgId}','${esc(org.name)}')">🗑️</button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

async function toggleOrgDash(id, currentValue) {
  try {
    state.orgProfiles = await toggleOrgVisibility(id, currentValue);
    refreshOrgDerivedState();
    renderOrgs(summarizeOrgs());
    showToast(currentValue ? 'ซ่อนจาก Dashboard แล้ว' : 'แสดงใน Dashboard แล้ว ✅', 'success');
  } catch (error) {
    showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
  }
}

async function deleteOrg(id, name) {
  const confirmed = await showConfirm(`ลบองค์กร "${name}" ออกจากระบบ?\n\nข้อมูลการส่งแบบสอบถามจะยังคงอยู่ในฐานข้อมูล แต่จะไม่แสดงในระบบอีกต่อไป`);
  if (!confirmed) return;
  try {
    state.orgProfiles = await deleteOrganization(id);
    refreshOrgDerivedState();
    renderOrgs(summarizeOrgs());
    showToast(`ลบ "${name}" เรียบร้อย`, 'success');
  } catch (error) {
    showToast('ลบไม่สำเร็จ: ' + error.message, 'error');
  }
}

// ─── Filter Orgs ──────────────────────────────────────────────────────────────

function filterOrgTable() {
  const q = (document.getElementById('org-search')?.value || '').toLowerCase();
  const ministry = (document.getElementById('org-ministry-filter')?.value || '').toLowerCase();
  document.querySelectorAll('#org-table tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const visible = (!q || text.includes(q)) && (!ministry || text.includes(ministry));
    tr.style.display = visible ? '' : 'none';
  });
}

// ─── showOrgDetail ────────────────────────────────────────────────────────────

function showOrgDetail(orgName) {
  state.orgSelectedName = orgName || '';
  const org = ORG_LOOKUP.get(orgName) || null;
  const summary = summarizeOrgs().find((item) => item.name === orgName) || null;
  const box = document.getElementById('org-detail-box');
  if (!box) return;

  const setValue = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.value = value || '';
  };
  setValue('org-name', org?.name || '');
  setValue('org-ministry', org?.ministry || '');
  setValue('org-salutation', org?.letter || '');
  setValue('org-saraban-email', org?.email || '');
  setValue('org-coordinator-name', org?.contact || '');
  setValue('org-coordinator-position', org?.contactRole || '');
  setValue('org-coordinator-contact', org?.contactPhone || '');
  setValue('org-coordinator-email', org?.contactEmail || '');

  if (!org) {
    box.innerHTML = '<div class="info blue">เพิ่มข้อมูลหน่วยงานใหม่ แล้วกดบันทึกเพื่อสร้างในฐานข้อมูล Supabase</div>';
    return;
  }

  box.innerHTML = `
    <div style="padding:12px;border:1px solid var(--bdr);border-radius:10px;background:#fff">
      <div style="font-size:12px;color:var(--tx3);margin-bottom:4px">หน่วยงาน</div>
      <div style="font-size:15px;font-weight:700;color:var(--P)">${esc(org.name)}</div>
      <div style="font-size:11.5px;color:var(--tx2);margin-top:4px">${esc(org.ministry)} · ${esc(org.code)}</div>
    </div>
    <div style="padding:12px;border:1px solid var(--bdr);border-radius:10px;background:#fff">
      <div style="font-size:12px;color:var(--tx3);margin-bottom:6px">หนังสือเรียน</div>
      <div style="font-weight:600">${esc(org.letter)}</div>
      <div style="font-size:12px;color:var(--tx2);margin-top:6px">อีเมลองค์กร: <a href="mailto:${esc(org.email)}" style="color:var(--A)">${esc(org.email)}</a></div>
    </div>
    <div style="padding:12px;border:1px solid var(--bdr);border-radius:10px;background:#fff">
      <div style="font-size:12px;color:var(--tx3);margin-bottom:6px">ผู้ประสานงานหลัก</div>
      <div style="font-weight:600">${esc(org.contact)}</div>
      <div style="font-size:12px;color:var(--tx2);margin-top:4px">${esc(org.contactRole)}</div>
      <div style="font-size:12px;color:var(--tx2);margin-top:6px">ติดต่อ/Line: ${esc(org.contactPhone)}</div>
      <div style="font-size:12px;color:var(--tx2);margin-top:4px"><a href="mailto:${esc(org.contactEmail)}" style="color:var(--A)">${esc(org.contactEmail)}</a></div>
    </div>
    <div style="padding:12px;border:1px solid var(--bdr);border-radius:10px;background:#fff">
      <div style="font-size:12px;color:var(--tx3);margin-bottom:6px">สถานะข้อมูลล่าสุด</div>
      <div style="font-size:12.5px">Wellbeing submit: <b>${fmtNum(summary?.wellbeingSubmitted || 0)}</b> คน</div>
      <div style="font-size:12.5px;margin-top:4px">Ch1: <b>${summary?.ch1Count > 0 ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</b></div>
      <div style="font-size:12.5px;margin-top:4px">ล่าสุด: <b>${fmtDate(summary?.latestWb || summary?.latestCh1)}</b></div>
    </div>`;
}

// ─── saveOrgProfile ───────────────────────────────────────────────────────────

async function saveOrgProfile(event) {
  event.preventDefault();
  const get = (id) => document.getElementById(id)?.value?.trim() || '';
  const organizationName = get('org-name');
  const payload = {
    org_name_th: organizationName,
    org_type: 'government',
    contact_email: get('org-coordinator-email'),
    is_active: true,
    settings: {
      ministry: get('org-ministry') || null,
      salutation: get('org-salutation'),
      saraban_email: get('org-saraban-email'),
      coordinator_name: get('org-coordinator-name'),
      coordinator_position: get('org-coordinator-position'),
      coordinator_contact_line: get('org-coordinator-contact'),
      coordinator_email: get('org-coordinator-email'),
    },
  };

  const msg = document.getElementById('org-form-msg');
  if (!organizationName || !payload.settings.salutation || !payload.settings.saraban_email || !payload.settings.coordinator_name || !payload.settings.coordinator_position || !payload.settings.coordinator_contact_line || !payload.settings.coordinator_email) {
    msg.textContent = 'กรุณากรอกข้อมูลให้ครบทุกช่องที่มี *';
    msg.style.color = 'var(--D)';
    return;
  }

  msg.textContent = 'กำลังบันทึกข้อมูล...';
  msg.style.color = 'var(--tx2)';

  const existing = state.orgProfiles.find((row) => row.org_name_th === organizationName);
  if (!existing?.id) {
    payload.org_code = organizationName.replace(/[^A-Za-zก-๙0-9]/g, '').slice(0, 12).toUpperCase() || `ORG${Date.now().toString().slice(-4)}`;
  }

  let rows = [];
  try {
    rows = await saveOrganization(payload, existing?.id || null);
  } catch (error) {
    msg.textContent = 'บันทึกไม่สำเร็จ: ' + error.message;
    msg.style.color = 'var(--D)';
    return;
  }

  state.orgProfiles = rows || [];
  refreshOrgDerivedState();
  const summary = summarizeOrgs();
  renderOrgs(summary);
  const orgModal = document.getElementById('org-modal');
  if (orgModal) orgModal.style.display = 'none';
  showToast('บันทึกข้อมูลองค์กรเรียบร้อย ✅', 'success');
}

// ─── saveSimpleOrg ────────────────────────────────────────────────────────────

async function saveSimpleOrg() {
  const name = document.getElementById('simple-org-name')?.value?.trim();
  const ministry = document.getElementById('simple-org-ministry')?.value?.trim();
  const email = document.getElementById('simple-org-email')?.value?.trim();
  const msg = document.getElementById('simple-org-msg');
  if (!name) { if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'กรุณากรอกชื่อองค์กร'; } return; }
  if (msg) { msg.style.color = 'var(--tx2)'; msg.textContent = 'กำลังบันทึก...'; }
  const payload = { org_name_th: name, org_type: 'government', is_active: true, contact_email: email || null, settings: { ministry: ministry || null } };
  const existing = state.orgProfiles.find((r) => r.org_name_th === name);
  if (!existing?.id) {
    payload.org_code = name.replace(/[^A-Za-zก-๙0-9]/g, '').slice(0, 12).toUpperCase() || `ORG${Date.now().toString().slice(-4)}`;
  }
  try {
    state.orgProfiles = await saveOrganization(payload, existing?.id || null);
  } catch (error) {
    if (msg) { msg.style.color = 'var(--D)'; msg.textContent = 'บันทึกไม่สำเร็จ: ' + error.message; }
    return;
  }
  refreshOrgDerivedState();
  renderOrgs(summarizeOrgs());
  if (msg) { msg.style.color = 'var(--G)'; msg.textContent = `✅ บันทึก "${name}" เรียบร้อย`; }
}
