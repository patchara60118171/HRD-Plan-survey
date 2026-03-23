// ================================================================
// form-schema.js — Shared Schema Loader (Phase B)
// Single source of truth: fetches form_questions + overrides from Supabase
// Caches in sessionStorage with 10-minute TTL
// Fallback to js/questions.js + js/hrd-ch1-fields.js if DB unavailable
// ================================================================

const FormSchema = (() => {
  'use strict';

  const CACHE_PREFIX = 'fschema_';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  // ── Supabase client (reuse existing globals if available) ──
  function getSb() {
    if (typeof sb !== 'undefined') return sb;
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return null;
  }

  // ── Cache helpers ──
  function cacheGet(formCode) {
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + formCode);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) {
        sessionStorage.removeItem(CACHE_PREFIX + formCode);
        return null;
      }
      if (data?.questionsMap && !(data.questionsMap instanceof Map)) {
        if (Array.isArray(data.questions)) {
          data.questionsMap = new Map(data.questions.map(q => [q.question_key, q]));
        } else {
          data.questionsMap = new Map();
        }
      }
      return data;
    } catch { return null; }
  }

  function cacheSet(formCode, data) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + formCode, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* quota exceeded — ignore */ }
  }

  function cacheClear(formCode) {
    if (formCode) {
      sessionStorage.removeItem(CACHE_PREFIX + formCode);
    } else {
      ['ch1', 'wellbeing'].forEach(k => sessionStorage.removeItem(CACHE_PREFIX + k));
    }
  }

  // ── Main loader ──
  async function loadFormSchema(formCode) {
    // 1. Check cache
    const cached = cacheGet(formCode);
    if (cached) return cached;

    // 2. Try Supabase
    const client = getSb();
    if (client) {
      try {
        const schema = await fetchFromSupabase(client, formCode);
        if (schema && schema.sections.length > 0) {
          cacheSet(formCode, schema);
          return schema;
        }
      } catch (err) {
        console.warn(`[form-schema] DB fetch failed for ${formCode}, using fallback:`, err.message);
      }
    }

    // 3. Fallback to hardcoded JS
    const fallback = buildFallback(formCode);
    if (fallback) cacheSet(formCode, fallback);
    return fallback;
  }

  // ── Fetch from Supabase ──
  async function fetchFromSupabase(client, formCode) {
    // Fetch sections
    const { data: sections, error: secErr } = await client
      .from('form_sections')
      .select('*')
      .eq('form_code', formCode)
      .order('section_order', { ascending: true });
    if (secErr) throw secErr;

    // Fetch questions
    const { data: questions, error: qErr } = await client
      .from('form_questions')
      .select('*')
      .eq('form_code', formCode)
      .eq('is_active', true)
      .order('question_order', { ascending: true });
    if (qErr) throw qErr;

    // Fetch overrides (if table exists)
    let overrides = [];
    try {
      const { data: ovr } = await client
        .from('form_question_overrides')
        .select('*')
        .eq('form_code', formCode);
      overrides = ovr || [];
    } catch { /* table might not exist yet */ }

    // Merge overrides into questions
    // Handle both label_th (new) and label_text (legacy) column names
    const overrideMap = new Map(overrides.map(o => [o.question_key, o]));
    const mergedQuestions = questions.map(q => {
      const ovr = overrideMap.get(q.question_key);
      if (!ovr) return q;
      const ovrLabel = ovr.label_th || ovr.label_text;
      return {
        ...q,
        label_th: ovrLabel || q.label_th,
        help_text: ovr.help_text ?? q.help_text,
        options_json: ovr.options_json || q.options_json,
        _overridden: true,
      };
    });

    // Group questions by section
    const sectionMap = new Map(sections.map(s => [s.section_key, { ...s, questions: [] }]));
    mergedQuestions.forEach(q => {
      const sec = sectionMap.get(q.section_key);
      if (sec) sec.questions.push(q);
    });

    return {
      formCode,
      sections: Array.from(sectionMap.values()),
      questions: mergedQuestions,
      questionsMap: new Map(mergedQuestions.map(q => [q.question_key, q])),
      fetchedAt: new Date().toISOString(),
      source: 'supabase',
    };
  }

  // ── Fallback builders ──
  function buildFallback(formCode) {
    if (formCode === 'ch1') return buildCh1Fallback();
    if (formCode === 'wellbeing') return buildWellbeingFallback();
    return null;
  }

  function buildCh1Fallback() {
    const fields = PROJECT_SSOT?.ch1?.fallbackFields || ((typeof HRD_CH1_FIELDS !== 'undefined') ? HRD_CH1_FIELDS : {});
    const questions = Object.entries(fields).map(([key, label], idx) => ({
      id: `fallback_ch1_${key}`,
      form_code: 'ch1',
      section_key: 'ch1_main',
      question_key: key,
      question_order: idx + 1,
      label_th: label,
      input_type: 'text',
      is_required: false,
      is_active: true,
    }));
    return {
      formCode: 'ch1',
      sections: [{ section_key: 'ch1_main', title_th: 'ข้อมูล Ch1', questions }],
      questions,
      questionsMap: new Map(questions.map(q => [q.question_key, q])),
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
    };
  }

  function buildWellbeingFallback() {
    // Use questions.js QUESTIONS array if available
    if (typeof QUESTIONS === 'undefined' || !Array.isArray(QUESTIONS)) {
      return { formCode: 'wellbeing', sections: [], questions: [], questionsMap: new Map(), fetchedAt: new Date().toISOString(), source: 'fallback_empty' };
    }
    const questions = [];
    const sections = [];
    let secIdx = 0;
    QUESTIONS.forEach((section) => {
      secIdx++;
      const secKey = section.id || `section_${secIdx}`;
      const secQuestions = [];
      (section.questions || []).forEach((q, qIdx) => {
        const qObj = {
          id: `fallback_wb_${q.id || secKey + '_' + qIdx}`,
          form_code: 'wellbeing',
          section_key: secKey,
          question_key: q.id || `${secKey}_q${qIdx}`,
          question_order: qIdx + 1,
          label_th: q.label || q.text || '',
          help_text: q.help || null,
          input_type: q.type || 'radio',
          options_json: q.options ? JSON.stringify(q.options) : null,
          is_required: q.required !== false,
          is_active: true,
        };
        secQuestions.push(qObj);
        questions.push(qObj);
      });
      sections.push({
        section_key: secKey,
        section_order: secIdx,
        title_th: section.title || section.label || `ส่วนที่ ${secIdx}`,
        description: section.description || null,
        questions: secQuestions,
      });
    });
    return {
      formCode: 'wellbeing',
      sections,
      questions,
      questionsMap: new Map(questions.map(q => [q.question_key, q])),
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
    };
  }

  // ── Utility: get label for a field key ──
  function getFieldLabel(fieldKey, formCode) {
    const cached = cacheGet(formCode);
    if (cached?.questionsMap) {
      const q = cached.questionsMap.get(fieldKey);
      if (q) return q.label_th;
    }
    if (formCode === 'ch1') {
      const fallbackFields = PROJECT_SSOT?.ch1?.fallbackFields || ((typeof HRD_CH1_FIELDS !== 'undefined') ? HRD_CH1_FIELDS : {});
      return fallbackFields[fieldKey] || fieldKey;
    }
    return fieldKey;
  }

  // ── Utility: render a single question into a container ──
  function renderQuestion(q, container, value) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fq-item';
    wrapper.dataset.key = q.question_key;

    const label = document.createElement('label');
    label.className = 'fq-label';
    label.textContent = q.label_th + (q.is_required ? ' *' : '');
    if (q.help_text) {
      const help = document.createElement('span');
      help.className = 'fq-help';
      help.textContent = q.help_text;
      label.appendChild(help);
    }
    wrapper.appendChild(label);

    let input;
    const currentVal = value ?? '';

    switch (q.input_type) {
      case 'text':
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'si';
        input.name = q.question_key;
        input.placeholder = q.placeholder || '';
        input.value = currentVal;
        if (q.is_required) input.required = true;
        wrapper.appendChild(input);
        break;

      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        input.className = 'si';
        input.name = q.question_key;
        input.placeholder = q.placeholder || '';
        input.value = currentVal;
        if (q.unit) {
          const unit = document.createElement('span');
          unit.className = 'fq-unit';
          unit.textContent = q.unit;
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:8px';
          row.appendChild(input);
          row.appendChild(unit);
          wrapper.appendChild(row);
        } else {
          wrapper.appendChild(input);
        }
        if (q.validation_json) {
          const v = typeof q.validation_json === 'string' ? JSON.parse(q.validation_json) : q.validation_json;
          if (v.min !== undefined) input.min = v.min;
          if (v.max !== undefined) input.max = v.max;
          if (v.step !== undefined) input.step = v.step;
        }
        if (q.is_required) input.required = true;
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.className = 'si';
        input.name = q.question_key;
        input.rows = 4;
        input.placeholder = q.placeholder || '';
        input.value = currentVal;
        if (q.is_required) input.required = true;
        wrapper.appendChild(input);
        break;

      case 'radio': {
        const options = parseOptions(q.options_json);
        const group = document.createElement('div');
        group.className = 'fq-options';
        options.forEach(opt => {
          const optLabel = typeof opt === 'string' ? opt : (opt.label || opt.value);
          const optValue = typeof opt === 'string' ? opt : (opt.value || opt.label);
          const lbl = document.createElement('label');
          lbl.className = 'fq-opt';
          const rb = document.createElement('input');
          rb.type = 'radio';
          rb.name = q.question_key;
          rb.value = optValue;
          if (currentVal === optValue) rb.checked = true;
          lbl.appendChild(rb);
          lbl.appendChild(document.createTextNode(' ' + optLabel));
          group.appendChild(lbl);
        });
        wrapper.appendChild(group);
        break;
      }

      case 'checkbox': {
        const options = parseOptions(q.options_json);
        const group = document.createElement('div');
        group.className = 'fq-options';
        const selectedValues = Array.isArray(currentVal) ? currentVal : (currentVal ? [currentVal] : []);
        options.forEach(opt => {
          const optLabel = typeof opt === 'string' ? opt : (opt.label || opt.value);
          const optValue = typeof opt === 'string' ? opt : (opt.value || opt.label);
          const lbl = document.createElement('label');
          lbl.className = 'fq-opt';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.name = q.question_key;
          cb.value = optValue;
          if (selectedValues.includes(optValue)) cb.checked = true;
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + optLabel));
          group.appendChild(lbl);
        });
        wrapper.appendChild(group);
        break;
      }

      case 'file':
        input = document.createElement('input');
        input.type = 'file';
        input.name = q.question_key;
        input.className = 'si';
        wrapper.appendChild(input);
        break;

      case 'heading':
        label.className = 'fq-heading';
        break;

      case 'divider':
        wrapper.innerHTML = '<hr style="border:none;border-top:1px solid var(--bdr,#ddd);margin:12px 0">';
        break;

      default:
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'si';
        input.name = q.question_key;
        input.value = currentVal;
        wrapper.appendChild(input);
    }

    container.appendChild(wrapper);
    return wrapper;
  }

  function parseOptions(optJson) {
    if (!optJson) return [];
    if (Array.isArray(optJson)) return optJson;
    if (typeof optJson === 'string') {
      try { return JSON.parse(optJson); } catch { return []; }
    }
    return [];
  }

  // ── Check form window status ──
  async function checkFormWindow(formCode, orgCode) {
    const client = getSb();
    if (!client) return { open: true, reason: 'no_client' };
    try {
      const { data, error } = await client
        .from('form_windows')
        .select('*')
        .eq('form_code', formCode)
        .eq('org_code', orgCode)
        .maybeSingle();
      if (error || !data) return { open: true, reason: 'no_window_record' };
      const now = new Date();
      const isOpen = data.is_open ?? data.is_active ?? true;
      if (!isOpen) return { open: false, reason: 'closed_by_admin' };
      if (data.opens_at && new Date(data.opens_at) > now) return { open: false, reason: 'not_yet_open', opensAt: data.opens_at };
      if (data.closes_at && new Date(data.closes_at) < now) return { open: false, reason: 'expired', closedAt: data.closes_at };
      return { open: true, window: data };
    } catch {
      return { open: true, reason: 'error_fallback' };
    }
  }

  // ── Public API ──
  return {
    loadFormSchema,
    getFieldLabel,
    renderQuestion,
    checkFormWindow,
    clearCache: cacheClear,
  };
})();

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormSchema;
}
