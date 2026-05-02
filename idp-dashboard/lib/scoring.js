/**
 * IDP Dashboard · Scoring helpers (pure functions)
 *
 * Mirrors the logic in admin/js/services/utils.js so this page can stand alone
 * without the rest of the admin portal. Single source of truth for risk bands
 * lives in docs/WELLBEING_SCORING_REFERENCE.md.
 *
 * Exposes: window.IDPScoring
 */
(function () {
  'use strict';

  // ── BMI (ASEAN) ─────────────────────────────────────────────────────────────
  function calcBmi(row) {
    if (row.bmi != null && !isNaN(Number(row.bmi))) return Number(row.bmi);
    const h = parseFloat(row.height);
    const w = parseFloat(row.weight);
    if (!h || !w || h <= 0) return null;
    const hm = h > 3 ? h / 100 : h;
    return w / (hm * hm);
  }

  function bmiLevel(row) {
    const bmi = calcBmi(row);
    if (bmi == null) return null;
    if (bmi < 18.5) return { bmi, key: 'underweight', label: 'น้ำหนักน้อย',  color: '#3B82F6' };
    if (bmi < 23)   return { bmi, key: 'normal',      label: 'สมส่วน',       color: '#059669' };
    if (bmi < 25)   return { bmi, key: 'overweight',  label: 'น้ำหนักเกิน',  color: '#F59E0B' };
    if (bmi < 30)   return { bmi, key: 'obese1',      label: 'อ้วนระดับ 1',  color: '#EF4444' };
    return                 { bmi, key: 'obese2',      label: 'อ้วนระดับ 2',  color: '#991B1B' };
  }

  // ── Nutrition ───────────────────────────────────────────────────────────────
  function _nutri(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (s.includes('ทุกวัน') || s.includes('เกือบทุกวัน')) return 3;
    if (s.includes('3-4') || s.includes('3–4')) return 2;
    if (s.includes('แทบไม่') || s.includes('ไม่ทำ')) return 1;
    const n = Number(v);
    if (!isNaN(n) && n >= 1 && n <= 3) return n;
    return null;
  }
  const _nutriRev = (v) => { const s = _nutri(v); return s == null ? null : 4 - s; };
  function sweetScore(row) {
    const vals = [_nutriRev(row.sweet_1), _nutri(row.sweet_2), _nutri(row.sweet_3), _nutri(row.sweet_4), _nutri(row.sweet_5)].filter(v => v != null);
    return vals.length === 5 ? vals.reduce((a, b) => a + b, 0) : null;
  }
  function fatScore(row) {
    const vals = ['fat_1','fat_2','fat_3','fat_4','fat_5'].map(k => _nutri(row[k])).filter(v => v != null);
    return vals.length === 5 ? vals.reduce((a, b) => a + b, 0) : null;
  }
  function saltScore(row) {
    const vals = [_nutriRev(row.salt_1), _nutriRev(row.salt_2), _nutri(row.salt_3), _nutri(row.salt_4), _nutri(row.salt_5)].filter(v => v != null);
    return vals.length === 5 ? vals.reduce((a, b) => a + b, 0) : null;
  }
  // score >= 10 → เสี่ยงสูง/สูงมาก
  const isDietHigh = (s) => s != null && s >= 10;

  // ── TPAX / Sedentary ────────────────────────────────────────────────────────
  function _mins(v) {
    if (v == null) return 0;
    const s = String(v).trim();
    if (s.includes(':')) {
      const [h, m] = s.split(':').map(Number);
      return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    }
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }
  function tpaxMinutes(row) {
    const wd = parseFloat(row.act_work_days)    || 0;
    const cd = parseFloat(row.act_commute_days) || 0;
    const rd = parseFloat(row.act_rec_days)     || 0;
    if (wd + cd + rd === 0) return null;
    return wd * _mins(row.act_work_dur) + cd * _mins(row.act_commute_dur) + rd * _mins(row.act_rec_dur);
  }
  function tpaxLevel(row) {
    const m = tpaxMinutes(row);
    if (m == null) return null;
    if (m < 150) return { mins: m, key: 'low' };
    if (m < 300) return { mins: m, key: 'ok' };
    return               { mins: m, key: 'good' };
  }
  function sedentaryHours(row) {
    const s = _mins(row.sedentary_dur);
    const e = _mins(row.screen_entertain);
    const w = _mins(row.screen_work);
    if (s + e + w === 0) return null;
    return (s + e + w) / 60;
  }

  // ── TMHI-15 ─────────────────────────────────────────────────────────────────
  const TMHI_REV = new Set(['tmhi_4','tmhi_5','tmhi_6']);
  function tmhiScore(row) {
    let total = 0, answered = 0;
    for (let i = 1; i <= 15; i++) {
      const key = `tmhi_${i}`;
      const raw = row[key];
      if (raw == null || raw === '') continue;
      const v = Number(raw);
      if (!Number.isFinite(v) || v < 0 || v > 3) continue;
      answered++;
      total += TMHI_REV.has(key) ? (4 - v) : (v + 1);
    }
    if (answered === 15) return total;
    if (row.tmhi_score != null && row.tmhi_score !== '') return Number(row.tmhi_score);
    return null;
  }
  function tmhiLevel(score) {
    if (score == null) return null;
    if (score >= 51) return { key: 'good',    label: 'ดีกว่าคนทั่วไป' };
    if (score >= 44) return { key: 'average', label: 'เท่ากับคนทั่วไป' };
    return               { key: 'poor',    label: 'ต่ำกว่าคนทั่วไป' };
  }

  // ── UCLA Loneliness (20 items, 0-60) ────────────────────────────────────────
  function _lonely(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (s === 'บ่อยครั้ง' || s === '3') return 3;
    if (s === 'บางครั้ง'  || s === '2') return 2;
    if (s === 'แทบไม่เคย' || s === '1') return 1;
    if (s === 'ไม่เคย'    || s === '0') return 0;
    const n = Number(v);
    return isNaN(n) ? null : Math.min(Math.max(n, 0), 3);
  }
  function uclaTotal(row) {
    const vals = Array.from({ length: 20 }, (_, i) => _lonely(row[`lonely_${i + 1}`]));
    if (vals.some(v => v == null)) return null;
    return vals.reduce((a, b) => a + b, 0);
  }
  function uclaLevel(score) {
    if (score == null) return null;
    if (score <= 20) return { key: 'low',    label: 'เหงาน้อย' };
    if (score <= 40) return { key: 'medium', label: 'เหงาปานกลาง' };
    return                 { key: 'high',   label: 'เหงามาก' };
  }

  // ── Environment (6 factors, score 0-12) ─────────────────────────────────────
  const ENV_FIELDS = ['env_glare', 'env_noise', 'env_smell', 'env_smoke', 'env_posture', 'env_awkward'];
  function _envVal(v) {
    const s = String(v ?? '').trim();
    if (!s || s.startsWith('ไม่ใช่') || s === 'false') return 0;
    const hasImpact = s.includes('มีผล') && !s.includes('ไม่มีผล') && !s.includes('ไม่มีผลกระทบ');
    if (hasImpact) return 2;
    if (s.includes('ใช่') || s.includes('มี') || s.includes('true')) return 1;
    return 0;
  }
  function envRiskTotal(row) {
    return ENV_FIELDS.reduce((sum, f) => sum + _envVal(row[f]), 0);
  }
  function envAffectedCount(row) {
    return ENV_FIELDS.filter(f => _envVal(row[f]) === 2).length;
  }

  // ── Substance risk (ยาสูบ/แอลกอฮอล์/สารเสพติด) ─────────────────────────────
  function _sub(v) {
    if (v == null) return 0;
    const s = String(v).trim();
    if (s.includes('ทุกวัน') || s.includes('เป็นประจำ')) return 3;
    if (s.includes('2') && s.includes('3')) return 2;
    if (s.includes('บางโอกาส') || s.includes('นาน')) return 1;
    if (s.includes('ไม่เคย')) return 0;
    const n = Number(s);
    return isNaN(n) ? 0 : Math.min(n, 3);
  }
  function substanceRisk(row) {
    const q01 = _sub(row.q2001), q02 = _sub(row.q2002), q03 = _sub(row.q2003);
    const q04 = _sub(row.q2004), q05 = _sub(row.q2005_drug ?? row.q2005);
    if (q04 >= 1 || q05 >= 1)             return 'high';
    if ([q01, q02, q03].some(v => v === 3)) return 'high';
    const cnt  = [q01, q02, q03].filter(v => v >= 1).length;
    const freq = [q01, q02, q03].some(v => v >= 2);
    if (cnt >= 2 || freq) return 'medium';
    if (cnt === 1)        return 'low';
    return 'none';
  }

  // ── 4-dimension risk classifier (unified) ───────────────────────────────────
  // Returns 'high' | 'medium' | 'normal' | null (null = no data)
  function physicalRisk(row) {
    const bmi = bmiLevel(row);
    const bmiR = bmi && (bmi.key === 'obese1' || bmi.key === 'obese2');
    const t = tpaxLevel(row);
    const exR = t && t.key === 'low';
    const dietR = [sweetScore, fatScore, saltScore].some(fn => isDietHigh(fn(row)));
    const n = [bmiR, exR, dietR].filter(Boolean).length;
    if (n >= 2) return 'high';
    if (n >= 1) return 'medium';
    return 'normal';
  }
  function mentalRisk(row) {
    const t = tmhiScore(row);
    if (t == null) return null;
    if (t < 44) return 'high';
    if (t <= 50) return 'medium';
    return 'normal';
  }
  function socialRisk(row) {
    const u = uclaTotal(row);
    if (u == null) return null;
    if (u > 40) return 'high';
    if (u > 20) return 'medium';
    return 'normal';
  }
  function environRisk(row) {
    const a = envAffectedCount(row);
    if (a >= 2) return 'high';
    if (a >= 1) return 'medium';
    return 'normal';
  }

  // ── Waist / WHtR ────────────────────────────────────────────────────────────
  // waist is stored in **inches** (form unit = "นิ้ว") → convert × 2.54 to get cm
  function waistCm(row) {
    const w = parseFloat(row.waist);
    if (!w || w <= 0) return null;
    return w * 2.54;
  }
  // WHtR = waist(cm) / height(cm);  risk threshold ≥ 0.5 (gender-neutral)
  // Fallback: absolute cm cutoffs  ♂ > 90 cm  ♀ > 80 cm  (AHA Asia-Pacific)
  function waistRisk(row) {
    const wCm = waistCm(row);
    if (wCm == null) return null;
    const hCm = parseFloat(row.height);
    if (hCm && hCm > 0) {
      return (wCm / hCm) >= 0.5;
    }
    // fallback to absolute cutoff
    const gender = (row.gender || '').trim();
    return gender === 'ชาย' ? wCm > 90 : wCm > 80;
  }

  // ── Age group ───────────────────────────────────────────────────────────────
  function ageGroup(age) {
    const n = Number(age);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n <= 30) return '≤30 ปี';
    if (n <= 40) return '31–40 ปี';
    if (n <= 50) return '41–50 ปี';
    return '51+ ปี';
  }

  // ── Public API ──────────────────────────────────────────────────────────────
  window.IDPScoring = {
    calcBmi, bmiLevel,
    sweetScore, fatScore, saltScore, isDietHigh,
    tpaxMinutes, tpaxLevel, sedentaryHours,
    tmhiScore, tmhiLevel,
    uclaTotal, uclaLevel,
    envRiskTotal, envAffectedCount, ENV_FIELDS,
    substanceRisk,
    physicalRisk, mentalRisk, socialRisk, environRisk,
    waistCm, waistRisk,
    ageGroup,
  };
})();
