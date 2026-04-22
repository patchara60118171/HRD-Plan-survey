/**
 * IDP Dashboard · Data source
 *
 * Fetches non-draft rows from Supabase `survey_responses`, classifies them
 * into the shape each dashboard expects, and applies filters.
 *
 * Exposes: window.IDPData = { init, fetchAll, applyFilters, buildEmployees }
 */
(function () {
  'use strict';

  const S = window.IDPScoring;
  if (!S) {
    console.error('[IDPData] window.IDPScoring missing — load lib/scoring.js first');
    return;
  }

  let _client = null;
  let _rows   = [];   // raw survey_responses rows cache
  let _ready  = false;

  function init(SUPABASE_URL, SUPABASE_ANON_KEY) {
    if (!window.supabase) {
      throw new Error('supabase-js UMD not loaded');
    }
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _client;
  }

  async function fetchAll() {
    if (!_client) throw new Error('call init(url, key) first');
    const all = [];
    let from = 0;
    const step = 1000;
    // paginate defensively (Supabase default cap = 1000)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await _client
        .from('survey_responses')
        .select('*')
        .eq('is_draft', false)
        .range(from, from + step - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < step) break;
      from += step;
    }
    _rows = all;
    _ready = true;
    return all;
  }

  // Unified per-row classification shared across all dashboards
  function classify(row, idx) {
    const dims = {
      physical: S.physicalRisk(row),
      mental:   S.mentalRisk(row),
      social:   S.socialRisk(row),
      environ:  S.environRisk(row),
    };
    // highCount = number of dims classified as 'high' (treats null/missing as not high)
    const highCount = Object.values(dims).filter(d => d === 'high').length;
    const overallGroup =
      highCount >= 3 ? 'A' :
      highCount === 2 ? 'B' :
      highCount === 1 ? 'C' : 'D';

    const bmi = S.bmiLevel(row);
    const tmhi = S.tmhiScore(row);
    const ucla = S.uclaTotal(row);

    return {
      _raw: row,
      id:   row.id || String(idx + 1),
      name: row.name || row.email || '—',
      email: row.email || '',
      org:  row.organization || 'ไม่ระบุ',
      orgCode: row.org_code || '',
      orgType: row.org_type || '',
      job:  row.job || '',
      gender: row.gender || '',
      age:  row.age != null ? Number(row.age) : null,
      ageGroup: S.ageGroup(row.age),
      bmi: bmi ? bmi.bmi : null,
      bmiKey: bmi ? bmi.key : null,
      bmiLabel: bmi ? bmi.label : '—',
      tmhiScore: tmhi,
      uclaScore: ucla,
      dims,                // { physical, mental, social, environ } → 'high'|'medium'|'normal'|null
      // legacy-compat shape for exec.jsx (uses scores[] of 0|1|2)
      scores: [
        _risk2code(dims.physical),
        _risk2code(dims.mental),
        _risk2code(dims.social),
        _risk2code(dims.environ),
      ],
      highCount,
      overallGroup,
      dept: row.org_type || row.organization || '—', // used by deptData in exec
    };
  }

  // Convert risk → 0 (high) | 1 (medium) | 2 (normal)  [exec.jsx expects this shape]
  function _risk2code(r) {
    if (r === 'high')   return 0;
    if (r === 'medium') return 1;
    return 2;
  }

  // Build per-dashboard employee arrays (currently identical — shape is union).
  // Future: customize per dashboard if needed.
  function buildEmployees(rows) {
    const arr = (rows || _rows).map((r, i) => classify(r, i));
    return {
      exec:     arr,
      physical: arr,
      tmhi:     arr,
      ucla:     arr,
      env:      arr,
    };
  }

  // ── Filter application ──────────────────────────────────────────────────────
  // filters shape: { org, group, gender, age, bmi, job, orgType }
  function applyFilters(filters) {
    const f = filters || {};
    const filtered = _rows.filter(r => {
      if (f.org && (r.organization || 'ไม่ระบุ') !== f.org) return false;
      if (f.orgType && (r.org_type || '') !== f.orgType) return false;
      if (f.gender && (r.gender || '') !== f.gender) return false;
      if (f.job && (r.job || '') !== f.job) return false;
      if (f.age && S.ageGroup(r.age) !== f.age) return false;
      if (f.bmi) {
        const b = S.bmiLevel(r);
        if (!b || b.key !== f.bmi) return false;
      }
      if (f.group) {
        // group A/B/C/D based on highCount
        const dims = {
          physical: S.physicalRisk(r),
          mental:   S.mentalRisk(r),
          social:   S.socialRisk(r),
          environ:  S.environRisk(r),
        };
        const n = Object.values(dims).filter(d => d === 'high').length;
        const g = n >= 3 ? 'A' : n === 2 ? 'B' : n === 1 ? 'C' : 'D';
        if (g !== f.group) return false;
      }
      return true;
    });
    return buildEmployees(filtered);
  }

  // ── Filter option builders ──────────────────────────────────────────────────
  function filterOptions() {
    const orgs = new Set(), jobs = new Set(), types = new Set(), genders = new Set();
    _rows.forEach(r => {
      if (r.organization) orgs.add(r.organization);
      if (r.job) jobs.add(r.job);
      if (r.org_type) types.add(r.org_type);
      if (r.gender) genders.add(r.gender);
    });
    return {
      org: [...orgs].sort(),
      job: [...jobs].sort(),
      orgType: [...types].sort(),
      gender: [...genders].sort(),
      age: ['≤30 ปี', '31–40 ปี', '41–50 ปี', '51+ ปี'],
      bmi: [
        { key: 'underweight', label: 'น้ำหนักน้อย (<18.5)' },
        { key: 'normal',      label: 'สมส่วน (18.5–22.9)' },
        { key: 'overweight',  label: 'น้ำหนักเกิน (23–24.9)' },
        { key: 'obese1',      label: 'อ้วนระดับ 1 (25–29.9)' },
        { key: 'obese2',      label: 'อ้วนระดับ 2 (≥30)' },
      ],
      group: [
        { key: 'A', label: 'กลุ่ม A (เสี่ยงสูง ≥3 มิติ)' },
        { key: 'B', label: 'กลุ่ม B (2 มิติ)' },
        { key: 'C', label: 'กลุ่ม C (1 มิติ)' },
        { key: 'D', label: 'กลุ่ม D (ไม่มีมิติเสี่ยง)' },
      ],
    };
  }

  window.IDPData = {
    init, fetchAll, buildEmployees, applyFilters, filterOptions,
    get rows() { return _rows; },
    get ready() { return _ready; },
  };
})();
