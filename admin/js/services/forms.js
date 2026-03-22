/* ========== ADMIN PORTAL — FORM EDITOR SERVICE ========== */
/* FORM_CONFIG_SCHEMAS, _feConfigCache → defined in form-editor-schema.js */

async function loadFormEditorFields() {
  const formIds = ['ch1', 'wellbeing'];
  for (const formId of formIds) {
    const statusEl = document.getElementById(`fe-${formId === 'wellbeing' ? 'wb' : formId}-status`);
    if (statusEl) statusEl.textContent = 'กำลังโหลด config...';
  }
  try {
    const { data, error } = await sb.from('form_configs').select('form_id,config_json').in('form_id', formIds);
    if (error) throw error;
    (data || []).forEach((row) => { _feConfigCache[row.form_id] = row.config_json || {}; });
  } catch (e) {
    console.warn('form_configs fetch error:', e);
  }
  renderFeFields('ch1');
  renderFeFields('wellbeing');
}

function renderFeFields(formId) {
  const schema = FORM_CONFIG_SCHEMAS[formId];
  if (!schema) return;
  const panelKey = formId === 'wellbeing' ? 'wb' : formId;
  const container = document.getElementById(`fe-${panelKey}-fields`);
  const statusEl = document.getElementById(`fe-${panelKey}-status`);
  if (!container) return;
  const cfg = _feConfigCache[formId] || {};
  const overrideCount = Object.keys(cfg).filter(k => !k.endsWith('__opts')).length;
  if (statusEl) {
    statusEl.innerHTML = overrideCount
      ? `<span style="color:var(--A);font-weight:600">✓ แก้ไขแล้ว ${overrideCount} ช่อง</span> — อัปเดตล่าสุดจาก Supabase`
      : '<span style="color:var(--tx3)">ยังไม่มีการแก้ไข — แสดงค่า Default ทั้งหมด</span>';
  }

  const sectionsHtml = schema.sections.map((sec) => {
    const editedInSec = sec.fields.filter((f) => cfg[f.key]).length;
    const sectionHdr = `<div class="fe-section-hdr">
      ${esc(sec.label)}
      ${editedInSec > 0 ? `<span style="font-size:11px;font-weight:400;background:var(--AL);color:var(--A);padding:2px 10px;border-radius:99px">แก้ไขแล้ว ${editedInSec} ช่อง</span>` : ''}
    </div>`;

    const fieldsHtml = `<div style="display:flex;flex-direction:column;gap:2px;margin-bottom:6px">` +
      sec.fields.map((field) => {
        const currentVal = cfg[field.key] || '';
        const isChanged = !!currentVal;
        const safeKey = field.key.replace(/\./g, '-');
        const fieldId = `fe-field-${formId}-${safeKey}`;
        const inputEl = field.long
          ? `<textarea class="fe-q-input" id="${fieldId}" rows="2" placeholder="${esc(field.default)}">${esc(currentVal)}</textarea>`
          : `<input class="fe-q-input" id="${fieldId}" value="${esc(currentVal)}" placeholder="${esc(field.default)}">`;

        return `<div class="fg" style="margin-bottom:0;padding:10px 12px;border-radius:8px;background:${isChanged ? 'var(--AL)' : 'var(--bg)'};border:1px solid ${isChanged ? 'var(--A)' : 'transparent'}">
          <label style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
            <span style="flex:1;font-size:12px;font-weight:600;color:${isChanged ? 'var(--A)' : 'var(--tx2)'}">${esc(field.label)}</span>
            ${isChanged
              ? `<span style="font-size:10px;background:var(--A);color:#fff;padding:1px 8px;border-radius:99px;font-weight:700;flex-shrink:0">✓ แก้ไขแล้ว</span>
                 <button type="button" class="btn b-gray" style="padding:1px 7px;font-size:10px;flex-shrink:0" onclick="resetFeField('${esc(formId)}','${esc(field.key)}')">↩ รีเซ็ต</button>`
              : `<span style="font-size:10px;color:var(--tx3);flex-shrink:0">default</span>`
            }
          </label>
          ${inputEl}
          ${!isChanged ? `<div style="font-size:10px;color:var(--tx3);margin-top:3px;line-height:1.4">📌 ${esc(field.default)}</div>` : ''}
        </div>`;
      }).join('') + `</div>`;

    return sectionHdr + fieldsHtml;
  }).join('');

  container.innerHTML = sectionsHtml;
}

function toggleFeFieldEdit(formId, fieldKey) {
  const safeKey = fieldKey.replace(/\./g, '-');
  const editbox = document.getElementById(`fe-editbox-${formId}-${safeKey}`);
  const preview = document.getElementById(`fe-preview-${formId}-${safeKey}`);
  const card = document.getElementById(`fe-card-${formId}-${safeKey}`);
  if (!editbox || !preview) return;
  const panelKey = formId === 'wellbeing' ? 'wb' : formId;
  document.getElementById(`fe-${panelKey}-fields`)?.querySelectorAll('.fe-gf-editbox').forEach((box) => {
    if (box !== editbox && box.style.display !== 'none') {
      const otherId = box.id;
      const otherSafeKey = otherId.replace(`fe-editbox-${formId}-`, '');
      const otherPreview = document.getElementById(`fe-preview-${formId}-${otherSafeKey}`);
      const otherCard = document.getElementById(`fe-card-${formId}-${otherSafeKey}`);
      box.style.display = 'none';
      if (otherPreview) otherPreview.style.display = '';
      if (otherCard) otherCard.classList.remove('fe-gf-editing');
    }
  });
  editbox.style.display = '';
  preview.style.display = 'none';
  card.classList.add('fe-gf-editing');
  const input = editbox.querySelector('input, textarea');
  if (input) {
    if (input.dataset.original === undefined) input.dataset.original = input.value;
    input.focus();
    if (input.tagName === 'INPUT') { const len = input.value.length; input.setSelectionRange(len, len); }
  }
}

function cancelFeFieldInline(formId, fieldKey) {
  const safeKey = fieldKey.replace(/\./g, '-');
  const editbox = document.getElementById(`fe-editbox-${formId}-${safeKey}`);
  const preview = document.getElementById(`fe-preview-${formId}-${safeKey}`);
  const card = document.getElementById(`fe-card-${formId}-${safeKey}`);
  if (!editbox || !preview) return;
  const input = editbox.querySelector('input, textarea');
  if (input && input.dataset.original !== undefined) {
    input.value = input.dataset.original;
  }
  editbox.style.display = 'none';
  preview.style.display = '';
  card.classList.remove('fe-gf-editing');
}

function feDeleteOpt(fieldId, idx) {
  const container = document.getElementById(`fe-opts-${fieldId}`);
  if (!container) return;
  const rows = [...container.querySelectorAll('.fe-option-row')];
  if (rows.length <= 1) { showToast('ต้องมีตัวเลือกอย่างน้อย 1 ข้อ', 'warn'); return; }
  rows[idx]?.remove();
  [...container.querySelectorAll('.fe-option-row')].forEach((r, i) => {
    r.querySelector('.fe-opt-prefix').textContent = (i+1) + '.';
    r.id = `fe-opt-row-${fieldId}-${i}`;
    const inp = r.querySelector('.fe-opt-input');
    if (inp) inp.id = `fe-opt-${fieldId}-${i}`;
    const del = r.querySelector('.fe-opt-del');
    if (del) del.setAttribute('onclick', `feDeleteOpt('${fieldId}',${i})`);
  });
}

function feAddOpt(fieldId, fieldKey, formId) {
  const container = document.getElementById(`fe-opts-${fieldId}`);
  if (!container) return;
  const idx = container.querySelectorAll('.fe-option-row').length;
  const row = document.createElement('div');
  row.className = 'fe-option-row';
  row.id = `fe-opt-row-${fieldId}-${idx}`;
  row.innerHTML = `<span class="fe-opt-prefix">${idx+1}.</span>
    <input class="fe-opt-input" id="fe-opt-${fieldId}-${idx}" placeholder="ตัวเลือกที่ ${idx+1}">
    <button class="fe-opt-del" onclick="feDeleteOpt('${fieldId}',${idx})" title="ลบ">✕</button>`;
  container.appendChild(row);
  row.querySelector('.fe-opt-input')?.focus();
}

function feTab(formId, el) {
  ['ch1','wb'].forEach((k) => {
    document.getElementById(`fe-${k}-panel`).style.display = 'none';
    document.getElementById(`fe-tab-${k === 'wb' ? 'wb' : k}`)?.classList.remove('active');
  });
  const panelKey = formId === 'wellbeing' ? 'wb' : formId;
  document.getElementById(`fe-${panelKey}-panel`).style.display = '';
  if (el) el.classList.add('active');
}

async function saveFormConfig(formId) {
  const schema = FORM_CONFIG_SCHEMAS[formId];
  if (!schema) return;
  const cfg = {};
  schema.sections.forEach((sec) => {
    sec.fields.forEach((field) => {
      const inputId = `fe-field-${formId}-${field.key.replace(/\./g, '-')}`;
      const val = (document.getElementById(inputId)?.value || '').trim();
      if (val && val !== field.default) cfg[field.key] = val;
      if (Array.isArray(field.options)) {
        const optsContainer = document.getElementById(`fe-opts-${inputId}`);
        if (optsContainer) {
          const optVals = [...optsContainer.querySelectorAll('.fe-opt-input')].map((inp) => inp.value.trim()).filter(Boolean);
          const defaultOpts = field.options.join('||');
          if (optVals.length && optVals.join('||') !== defaultOpts) {
            cfg[field.key + '__opts'] = optVals.join('||');
          }
        }
      }
    });
  });
  try {
    const { error } = await sb.from('form_configs').upsert(
      { form_id: formId, form_name: schema.label, config_json: cfg, updated_by: state.session?.user?.email || 'admin', updated_at: new Date().toISOString() },
      { onConflict: 'form_id' }
    );
    if (error) throw error;
    _feConfigCache[formId] = cfg;
    const overrideCount = Object.keys(cfg).length;
    showToast(`บันทึก Config ฟอร์ม ${formId.toUpperCase()} สำเร็จ — ${overrideCount} ช่องที่แก้ไข ✅`);
    renderFeFields(formId);
  } catch (e) {
    showToast(`บันทึกไม่สำเร็จ: ${e.message}`, 'error');
  }
}

async function resetFeField(formId, fieldKey) {
  showConfirm(`รีเซ็ต "${fieldKey}" กลับเป็นค่า default?`, async () => {
    const cfg = { ..._feConfigCache[formId] };
    delete cfg[fieldKey];
    try {
      const schema = FORM_CONFIG_SCHEMAS[formId];
      const { error } = await sb.from('form_configs').upsert(
        { form_id: formId, form_name: schema.label, config_json: cfg, updated_by: state.session?.user?.email || 'admin', updated_at: new Date().toISOString() },
        { onConflict: 'form_id' }
      );
      if (error) throw error;
      _feConfigCache[formId] = cfg;
      showToast('รีเซ็ตช่องนั้นแล้ว ✅');
      renderFeFields(formId);
    } catch (e) {
      showToast(`รีเซ็ตไม่สำเร็จ: ${e.message}`, 'error');
    }
  });
}

async function resetAllFe(formId) {
  showConfirm(`รีเซ็ตทุกช่องของฟอร์ม ${formId.toUpperCase()} กลับเป็นค่า default ทั้งหมด?`, async () => {
    try {
      const schema = FORM_CONFIG_SCHEMAS[formId];
      const { error } = await sb.from('form_configs').upsert(
        { form_id: formId, form_name: schema.label, config_json: {}, updated_by: state.session?.user?.email || 'admin', updated_at: new Date().toISOString() },
        { onConflict: 'form_id' }
      );
      if (error) throw error;
      _feConfigCache[formId] = {};
      showToast(`รีเซ็ต Config ฟอร์ม ${formId.toUpperCase()} เรียบร้อยแล้ว`);
      renderFeFields(formId);
    } catch (e) {
      showToast(`รีเซ็ตไม่สำเร็จ: ${e.message}`, 'error');
    }
  });
}
