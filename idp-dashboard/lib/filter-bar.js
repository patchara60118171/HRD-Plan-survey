/**
 * IDP Dashboard · Filter Bar (vanilla JS, no React)
 * Renders a sticky filter row above the dashboard tabs and invokes a callback
 * whenever selection changes. Lightweight on purpose — kept outside the React
 * dashboards so it stays mounted across tab switches.
 *
 * Exposes: window.IDPFilterBar = { mount(el, opts), getState(), reset() }
 *   opts.onChange(filters)
 *   opts.total / opts.filtered — numbers to show in the count label
 */
(function () {
  'use strict';

  const FIELDS = [
    { key: 'org',     label: '🏛️ องค์กร',  width: 240 },
    { key: 'group',   label: '🎯 กลุ่ม IDP', width: 190 },
    { key: 'gender',  label: '👥 เพศ',       width: 110 },
    { key: 'age',     label: '🎂 อายุ',      width: 130 },
    { key: 'bmi',     label: '⚖️ BMI',      width: 180 },
    { key: 'job',     label: '💼 ตำแหน่ง', width: 180 },
    { key: 'orgType', label: '🏷️ ประเภท',  width: 160 },
  ];

  const state = {
    filters: { org: '', group: '', gender: '', age: '', bmi: '', job: '', orgType: '' },
    opts:    null,
    el:      null,
    counts:  null,
  };

  function _select(name, label, options, width) {
    return `
      <label style="display:flex;flex-direction:column;gap:3px;min-width:${width}px">
        <span style="font-size:10px;color:#94A3B8;letter-spacing:.5px;font-weight:600">${label}</span>
        <select data-filter="${name}" style="
          padding:7px 10px; border-radius:8px; border:1px solid #CBD5E1;
          background:#fff; font-family:inherit; font-size:13px; color:#0F172A;
          cursor:pointer; min-width:${width}px; max-width:${width}px;
        ">${options}</select>
      </label>`;
  }

  function _renderCountLabel() {
    if (!state.counts) return '';
    const { total, filtered } = state.counts;
    const active = Object.values(state.filters).filter(Boolean).length;
    const tag = active > 0
      ? `<span style="background:#2563EB;color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;margin-left:6px">${active} filter</span>`
      : '';
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:12px;color:#475569">
        <span style="font-weight:600">แสดง <b style="color:#0F172A">${filtered.toLocaleString()}</b> จาก <b>${total.toLocaleString()}</b> คน</span>
        ${tag}
        <button data-reset="1" style="
          margin-left:auto; padding:6px 12px; border-radius:8px; border:1px solid #CBD5E1;
          background:#fff; font-family:inherit; font-size:12px; color:#475569; cursor:pointer;
          ${active === 0 ? 'opacity:.4;pointer-events:none' : ''}
        ">↺ ล้างตัวกรอง</button>
      </div>`;
  }

  function _buildOptions() {
    if (!window.IDPData || !window.IDPData.ready) return null;
    return window.IDPData.filterOptions();
  }

  function _optionTags(list, selected, valueKey = null, labelKey = null) {
    const first = `<option value="">ทั้งหมด</option>`;
    return first + list.map(item => {
      const v = valueKey ? item[valueKey] : item;
      const l = labelKey ? item[labelKey] : item;
      const sel = v === selected ? 'selected' : '';
      return `<option value="${String(v).replace(/"/g, '&quot;')}" ${sel}>${l}</option>`;
    }).join('');
  }

  function render() {
    if (!state.el) return;
    const opts = _buildOptions();
    if (!opts) {
      state.el.innerHTML = `<div style="padding:14px 18px;color:#64748B;font-size:13px">⏳ กำลังโหลดตัวเลือกกรอง…</div>`;
      return;
    }

    const byKey = {
      org:     _optionTags(opts.org,     state.filters.org),
      group:   _optionTags(opts.group,   state.filters.group, 'key', 'label'),
      gender:  _optionTags(opts.gender,  state.filters.gender),
      age:     _optionTags(opts.age,     state.filters.age),
      bmi:     _optionTags(opts.bmi,     state.filters.bmi, 'key', 'label'),
      job:     _optionTags(opts.job,     state.filters.job),
      orgType: _optionTags(opts.orgType, state.filters.orgType),
    };

    state.el.innerHTML = `
      <div style="
        display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;
        padding:14px 18px; background:#F8FAFC; border-bottom:1px solid #E2E8F0;
      ">
        ${FIELDS.map(f => _select(f.key, f.label, byKey[f.key], f.width)).join('')}
      </div>
      <div style="padding:0 18px; background:#F8FAFC; border-bottom:1px solid #E2E8F0">
        ${_renderCountLabel()}
      </div>
    `;

    // attach listeners
    state.el.querySelectorAll('select[data-filter]').forEach(sel => {
      sel.addEventListener('change', () => {
        const key = sel.dataset.filter;
        state.filters[key] = sel.value;
        _emit();
      });
    });
    const reset = state.el.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', () => {
      Object.keys(state.filters).forEach(k => { state.filters[k] = ''; });
      _emit();
      render();
    });
  }

  function _emit() {
    if (state.opts && typeof state.opts.onChange === 'function') {
      state.opts.onChange({ ...state.filters });
    }
  }

  function mount(el, opts) {
    state.el = el;
    state.opts = opts || {};
    render();
  }

  function setCounts(total, filtered) {
    state.counts = { total, filtered };
    // update just the count label in place (avoids remount)
    const countEl = state.el?.querySelector('[data-reset]')?.parentElement;
    if (countEl) countEl.outerHTML = _renderCountLabel();
    // Rebind reset listener after outerHTML replacement
    const reset = state.el?.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', () => {
      Object.keys(state.filters).forEach(k => { state.filters[k] = ''; });
      _emit();
      render();
    });
  }

  function refresh() { render(); }

  window.IDPFilterBar = {
    mount,
    setCounts,
    refresh,
    getState: () => ({ ...state.filters }),
    reset: () => {
      Object.keys(state.filters).forEach(k => { state.filters[k] = ''; });
      _emit();
      render();
    },
  };
})();
