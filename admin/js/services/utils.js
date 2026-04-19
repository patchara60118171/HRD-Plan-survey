/* ========== ADMIN PORTAL — UTILITY FUNCTIONS ========== */

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}

function fmtDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear() + 543; // แปลง ค.ศ. → พ.ศ.
  if (withTime) {
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return `${dd}/${mm}/${yyyy}`;
}

// แปลง ISO date string (YYYY-MM-DD) → วว/ดด/ปปปป พ.ศ. สำหรับแสดงผล input
function isoToBuddhistDisplay(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${parseInt(y) + 543}`;
}
// แปลง Buddhist display (วว/ดด/ปปปป) → ISO (YYYY-MM-DD) สำหรับ input value
function buddhistDisplayToISO(buddhistStr) {
  if (!buddhistStr) return '';
  const parts = buddhistStr.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  return `${parseInt(y) - 543}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

function fmtNum(value, digits = 0) {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('th-TH', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function getRowDate(row) {
  return row.submitted_at || row.created_at || row.timestamp || row.updated_at || null;
}

function getCh1Org(row) {
  const fd = row.form_data || {};
  const nameFromRow = row.organization || row.org_name || row.org_name_th || row.agency_name
    || fd.agency_name || fd.organization || fd.org_name || fd.org_name_th || '';
  if (nameFromRow) return nameFromRow;
  // fallback: resolve via org_code → canonical name
  const code = String(row.org_code || fd.org_code || '').toLowerCase();
  if (code && typeof ADMIN_CANONICAL_ORGS !== 'undefined') {
    const found = ADMIN_CANONICAL_ORGS.find(o => o.code === code);
    if (found) return found.name;
  }
  return '—';
}

function normalizeSurveyRow(row, index) {
  const raw = row.raw_responses || {};
  return {
    _index: index + 1,
    ...raw,
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    organization: row.organization || raw.organization || raw.agency_name || '—',
    gender: row.gender || raw.gender || '—',
    age: row.age ?? raw.age ?? null,
    org_type: row.org_type || raw.org_type || raw.position_type || '—',
    job: row.job || raw.job || raw.level || '—',
    job_duration: row.job_duration || raw.job_duration || raw.service_years || '—',
    bmi: row.bmi ?? raw.bmi ?? null,
    bmi_category: row.bmi_category || raw.bmi_category || '—',
    is_draft: Boolean(row.is_draft),
    submitted_at: row.submitted_at || row.timestamp || raw.submitted_at || null,
    tmhi_score: row.tmhi_score ?? raw.tmhi_score ?? null,
  };
}

function ageGroup(row) {
  const age = Number(row.age);
  if (Number.isNaN(age)) return '—';
  if (age <= 30) return '≤30 ปี';
  if (age <= 40) return '31–40 ปี';
  if (age <= 50) return '41–50 ปี';
  return '51+ ปี';
}

function sumFields(row, keys) {
  let total = 0;
  let found = 0;
  keys.forEach((key) => {
    if (row[key] != null && row[key] !== '') {
      total += Number(row[key]);
      found += 1;
    }
  });
  return found ? total : null;
}

function getPhq9(row) {
  return row.phq9_score != null ? Number(row.phq9_score) : sumFields(row, ['q3001','q3002','q3003','q3004','q3005','q3006','q3007','q3008','q3009','phq_1','phq_2','phq_3','phq_4','phq_5','phq_6','phq_7','phq_8','phq_9']);
}

function getGad7(row) {
  return row.gad7_score != null ? Number(row.gad7_score) : sumFields(row, ['q4001','q4002','q4003','q4004','q4005','q4006','q4007','gad_1','gad_2','gad_3','gad_4','gad_5','gad_6','gad_7']);
}

function getBurnout(row) {
  if (row.burnout_score != null) return Number(row.burnout_score);
  if (row.burnout != null) return Number(row.burnout);
  return null;
}

function getEngagement(row) {
  if (row.engagement_score != null) return Number(row.engagement_score);
  if (row.engagement != null) return Number(row.engagement);
  return null;
}

function getWlb(row) {
  if (row.wlb_score != null) return Number(row.wlb_score);
  if (row.work_life_balance != null) return Number(row.work_life_balance);
  if (row.life_quality != null) return Number(row.life_quality);
  return null;
}

function getTmhi(row) {
  if (row.tmhi_score != null && row.tmhi_score !== '') return Number(row.tmhi_score);
  return sumFields(row, ['tmhi_1','tmhi_2','tmhi_3','tmhi_4','tmhi_5','tmhi_6','tmhi_7','tmhi_8','tmhi_9','tmhi_10','tmhi_11','tmhi_12','tmhi_13','tmhi_14','tmhi_15']);
}

function getTmhiLevelMeta(score) {
  if (score == null || Number.isNaN(Number(score)) || Number(score) <= 0) {
    return { key: 'unknown', label: 'ไม่มีข้อมูล', color: '#9CA3AF', shortLabel: 'ไม่มีข้อมูล' };
  }
  const value = Number(score);
  if (value >= 51) {
    return { key: 'good', label: 'สุขภาพจิตดีกว่าคนทั่วไป', color: '#059669', shortLabel: 'ดีกว่าคนทั่วไป' };
  }
  if (value >= 44) {
    return { key: 'average', label: 'สุขภาพจิตเท่ากับคนทั่วไป', color: '#D97706', shortLabel: 'เท่ากับคนทั่วไป' };
  }
  return { key: 'poor', label: 'สุขภาพจิตต่ำกว่าคนทั่วไป', color: '#DC2626', shortLabel: 'ต่ำกว่าคนทั่วไป' };
}

function getSleep(row) {
  return row.sleep_hours ?? row.sleep ?? row.sleep_avg ?? '—';
}

function getExercise(row) {
  return row.act_rec ?? row.exercise_days ?? row.exercise_frequency ?? '—';
}

function getChronic(row) {
  const value = row.diseases ?? row.chronic_disease ?? row.ncd ?? row.condition_list;
  if (value == null || value === '') return 'ไม่มี';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'ไม่มี';
  if (value === true || value === 'true' || value === 1 || value === '1') return 'มี';
  if (value === false || value === 'false' || value === 0 || value === '0') return 'ไม่มี';
  return String(value);
}

function getJobSat(row) {
  return row.job_satisfaction ?? row.work_satisfaction ?? row.work_satis ?? '—';
}

function getMainProblem(row) {
  return row.main_problem ?? row.top_problem ?? row.major_issue ?? row.key_issue ?? '—';
}

/* ===== EXTENDED WELLBEING DASHBOARD SCORING FUNCTIONS ===== */

/* ── NCD / โรคประจำตัว ────────────────────────────────────── */
function getDiseaseList(row) {
  const v = row.diseases ?? row.chronic_disease ?? row.ncd ?? row.condition_list;
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v.filter(d => d && d !== 'ไม่มี');
  if (typeof v === 'string') {
    if (v === 'ไม่มี' || v === 'none' || v === 'false') return [];
    return v.split(',').map(s => s.trim()).filter(s => s && s !== 'ไม่มี');
  }
  return [];
}
function getDiseaseCount(row) { return getDiseaseList(row).length; }
function getNcdRiskLevel(row) {
  const n = getDiseaseCount(row);
  if (n === 0) return { key: 'none',   label: 'กลุ่มปกติ',                 color: '#059669' };
  if (n === 1) return { key: 'medium', label: 'เสี่ยงปานกลาง (1 โรค)',    color: '#D97706' };
  return               { key: 'high',  label: 'เสี่ยงสูง (≥ 2 โรค)',      color: '#DC2626' };
}

/* ── BMI — มาตรฐานอาเซียน (กรมอนามัย) ───────────────────── */
function calcBmi(row) {
  if (row.bmi != null && !isNaN(Number(row.bmi))) return Number(row.bmi);
  const h = parseFloat(row.height);
  const w = parseFloat(row.weight);
  if (!h || !w || h <= 0) return null;
  const hm = h > 3 ? h / 100 : h;
  return w / (hm * hm);
}
function getBmiAsean(row) {
  // เกณฑ์ตาม docs/WELLBEING_SCORING_REFERENCE.md §2 (กรมอนามัย มาตรฐานเอเชีย)
  //   < 18.5      → น้ำหนักน้อย
  //   18.5–22.9   → สมส่วน
  //   23.0–24.9   → น้ำหนักเกิน
  //   25.0–29.9   → อ้วนระดับ 1
  //   ≥ 30        → อ้วนระดับ 2
  const bmi = calcBmi(row);
  if (bmi == null) return null;
  if (bmi < 18.5) return { bmi, key: 'underweight', label: 'น้ำหนักน้อย',  color: '#3B82F6' };
  if (bmi < 23)   return { bmi, key: 'normal',      label: 'สมส่วน',       color: '#059669' };
  if (bmi < 25)   return { bmi, key: 'overweight',  label: 'น้ำหนักเกิน',  color: '#F59E0B' };
  if (bmi < 30)   return { bmi, key: 'obese1',      label: 'อ้วนระดับ 1',  color: '#EF4444' };
  return                   { bmi, key: 'obese2',    label: 'อ้วนระดับ 2',  color: '#991B1B' };
}

/* ── WHtR (รอบเอว / ส่วนสูง) ──────────────────────────────── */
function calcWHtR(row) {
  const waistIn = parseFloat(row.waist);
  const heightCm = parseFloat(row.height);
  if (!waistIn || !heightCm || heightCm <= 0) return null;
  const waistCm = waistIn * 2.54;
  return waistCm / heightCm;
}
function getWHtRLevel(row) {
  const r = calcWHtR(row);
  if (r == null) return null;
  if (r < 0.5) return { ratio: r, key: 'normal', label: 'ปกติ (< 0.5)',      color: '#059669' };
  return              { ratio: r, key: 'risk',   label: 'เริ่มเสี่ยง (≥ 0.5)', color: '#EF4444' };
}

/* ── พฤติกรรมบริโภค — helpers ────────────────────────────── */
function _nutritionScore(val) {
  if (val == null) return null;
  const s = String(val).trim();
  if (s.includes('ทุกวัน') || s.includes('เกือบทุกวัน')) return 3;
  if (s.includes('3-4') || s.includes('3–4')) return 2;
  if (s.includes('แทบไม่') || s.includes('ไม่ทำ')) return 1;
  const n = Number(val);
  if (!isNaN(n) && n >= 1 && n <= 3) return n;
  return null;
}
function _nutritionScoreReverse(val) {
  const s = _nutritionScore(val);
  return s == null ? null : 4 - s;
}
function getSweetScore(row) {
  const vals = [
    _nutritionScoreReverse(row.sweet_1),
    _nutritionScore(row.sweet_2),
    _nutritionScore(row.sweet_3),
    _nutritionScore(row.sweet_4),
    _nutritionScore(row.sweet_5),
  ].filter(v => v != null);
  return vals.length === 5 ? vals.reduce((a, b) => a + b, 0) : null;
}
function getFatScore(row) {
  const vals = ['fat_1','fat_2','fat_3','fat_4','fat_5'].map(k => _nutritionScore(row[k])).filter(v => v != null);
  return vals.length === 5 ? vals.reduce((a, b) => a + b, 0) : null;
}
function getSaltScore(row) {
  const vals = [
    _nutritionScoreReverse(row.salt_1),
    _nutritionScoreReverse(row.salt_2),
    _nutritionScore(row.salt_3),
    _nutritionScore(row.salt_4),
    _nutritionScore(row.salt_5),
  ].filter(v => v != null);
  return vals.length === 5 ? vals.reduce((a, b) => a + b, 0) : null;
}
function _nutritionRiskLevel(score, type) {
  if (score == null) return null;
  const bands = {
    sweet: [
      { max: 5,  key: 'low',       label: 'เสี่ยงต่ำมาก',    color: '#059669' },
      { max: 9,  key: 'medium',    label: 'เสี่ยงปานกลาง',   color: '#D97706' },
      { max: 13, key: 'high',      label: 'เสี่ยงสูง',        color: '#EF4444' },
      { max: 15, key: 'very_high', label: 'เสี่ยงสูงมาก',    color: '#991B1B' },
    ],
    fat: [
      { max: 5,  key: 'low',       label: 'เสี่ยงน้อย',      color: '#059669' },
      { max: 9,  key: 'medium',    label: 'เสี่ยงปานกลาง',   color: '#D97706' },
      { max: 13, key: 'high',      label: 'เสี่ยงสูง',        color: '#EF4444' },
      { max: 15, key: 'very_high', label: 'เสี่ยงสูงมาก',    color: '#991B1B' },
    ],
    salt: [
      { max: 5,  key: 'low',       label: 'โซเดียมน้อย',     color: '#059669' },
      { max: 9,  key: 'medium',    label: 'โซเดียมปานกลาง',  color: '#D97706' },
      { max: 13, key: 'high',      label: 'โซเดียมสูง',       color: '#EF4444' },
      { max: 15, key: 'very_high', label: 'โซเดียมสูงมาก',   color: '#991B1B' },
    ],
  };
  return (bands[type] || bands.sweet).find(b => score <= b.max) || null;
}
function getSweetRisk(row) { return _nutritionRiskLevel(getSweetScore(row), 'sweet'); }
function getFatRisk(row)   { return _nutritionRiskLevel(getFatScore(row),   'fat');   }
function getSaltRisk(row)  { return _nutritionRiskLevel(getSaltScore(row),  'salt');  }

/* ── กิจกรรมทางกาย TPAX ──────────────────────────────────── */
function _parseTimeMins(val) {
  if (val == null) return 0;
  const s = String(val).trim();
  if (s.includes(':')) {
    const [h, m] = s.split(':').map(Number);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  }
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}
function getTpaxMinutes(row) {
  const wd = parseFloat(row.act_work_days)    || 0;
  const wm = _parseTimeMins(row.act_work_dur);
  const cd = parseFloat(row.act_commute_days) || 0;
  const cm = _parseTimeMins(row.act_commute_dur);
  const rd = parseFloat(row.act_rec_days)     || 0;
  const rm = _parseTimeMins(row.act_rec_dur);
  if (wd + cd + rd === 0) return null;
  return wd * wm + cd * cm + rd * rm;
}
function getTpaxLevel(row) {
  const mins = getTpaxMinutes(row);
  if (mins == null) return null;
  if (mins < 150) return { mins, key: 'low',  label: 'ไม่เพียงพอ (< 150 นาที/สัปดาห์)',  color: '#DC2626' };
  if (mins < 300) return { mins, key: 'ok',   label: 'เพียงพอ (150–299 นาที/สัปดาห์)',  color: '#D97706' };
  return                  { mins, key: 'good', label: 'ดี (≥ 300 นาที/สัปดาห์)',          color: '#059669' };
}

/* ── พฤติกรรมเนือยนิ่ง ─────────────────────────────────────── */
function getSedentaryHours(row) {
  const s = _parseTimeMins(row.sedentary_dur);
  const e = _parseTimeMins(row.screen_entertain);
  const w = _parseTimeMins(row.screen_work);
  if (s + e + w === 0) return null;
  return (s + e + w) / 60;
}
function getSedentaryLevel(row) {
  const h = getSedentaryHours(row);
  if (h == null) return null;
  if (h < 8)  return { hours: h, key: 'safe',  label: 'ปลอดภัย (< 8 ชม./วัน)',    color: '#059669' };
  if (h <= 10) return { hours: h, key: 'watch', label: 'เฝ้าระวัง (8–10 ชม./วัน)', color: '#D97706' };
  return              { hours: h, key: 'risk',  label: 'เสี่ยง (> 10 ชม./วัน)',    color: '#DC2626' };
}

/* ── ยาสูบ / แอลกอฮอล์ / สิ่งเสพติด — Flag รายบุคคล ──────── */
function _substanceVal(val) {
  if (val == null) return 0;
  const s = String(val).trim();
  if (s.includes('ทุกวัน') || s.includes('เป็นประจำ')) return 3;
  if (s.includes('2') && s.includes('3')) return 2;
  if (s.includes('บางโอกาส') || s.includes('นาน')) return 1;
  if (s.includes('ไม่เคย')) return 0;
  const n = Number(s);
  return isNaN(n) ? 0 : Math.min(n, 3);
}
function getSubstanceRisk(row) {
  const q01 = _substanceVal(row.q2001);
  const q02 = _substanceVal(row.q2002);
  const q03 = _substanceVal(row.q2003);
  const q04 = _substanceVal(row.q2004);
  const q05 = _substanceVal(row.q2005_drug ?? row.q2005);
  if (q04 >= 1 || q05 >= 1)             return { key: 'high',   label: 'ความเสี่ยงสูง',        color: '#DC2626' };
  if ([q01,q02,q03].some(v => v === 3)) return { key: 'high',   label: 'ความเสี่ยงสูง',        color: '#DC2626' };
  const cnt  = [q01,q02,q03].filter(v => v >= 1).length;
  const freq = [q01,q02,q03].some(v => v >= 2);
  if (cnt >= 2 || freq)                 return { key: 'medium', label: 'ความเสี่ยงปานกลาง',   color: '#D97706' };
  if (cnt === 1)                        return { key: 'low',    label: 'ความเสี่ยงต่ำ',         color: '#F59E0B' };
  return                                        { key: 'none',  label: 'ไม่มีความเสี่ยง',       color: '#059669' };
}

/* ── UCLA Loneliness Scale ──────────────────────────────────── */
function _lonelyVal(val) {
  if (val == null) return null;
  const s = String(val).trim();
  if (s === 'บ่อยครั้ง' || s === '3') return 3;
  if (s === 'บางครั้ง'  || s === '2') return 2;
  if (s === 'แทบไม่เคย' || s === '1') return 1;
  if (s === 'ไม่เคย'    || s === '0') return 0;
  const n = Number(val);
  return isNaN(n) ? null : Math.min(Math.max(n, 0), 3);
}
function getLonelinessTotal(row) {
  const vals = Array.from({length: 20}, (_, i) => _lonelyVal(row[`lonely_${i+1}`])).filter(v => v != null);
  return vals.length === 20 ? vals.reduce((a, b) => a + b, 0) : null;
}
function getLonelinessSubScores(row) {
  const sub = (keys) => {
    const vals = keys.map(k => _lonelyVal(row[k])).filter(v => v != null);
    return vals.length === keys.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  return {
    isolation:       sub(['lonely_1','lonely_2','lonely_3','lonely_4','lonely_5']),
    social_relation: sub(['lonely_6','lonely_7','lonely_8','lonely_9','lonely_10']),
    self_disconnect: sub(['lonely_11','lonely_12','lonely_13','lonely_14','lonely_15']),
    social_behavior: sub(['lonely_16','lonely_17','lonely_18','lonely_19','lonely_20']),
  };
}
function getLonelinessLevel3(score) {
  if (score == null) return null;
  if (score <= 20) return { key: 'low',    label: 'โดดเดี่ยวน้อย',     color: '#059669' };
  if (score <= 40) return { key: 'medium', label: 'โดดเดี่ยวปานกลาง',  color: '#D97706' };
  return                   { key: 'high',  label: 'โดดเดี่ยวมาก',       color: '#DC2626' };
}
function getLonelinessLevel4(score) {
  if (score == null) return null;
  if (score <= 15) return { key: 'very_low',  label: 'โดดเดี่ยวน้อยมาก',       color: '#059669' };
  if (score <= 30) return { key: 'low_mid',   label: 'โดดเดี่ยวน้อย–ปานกลาง', color: '#84CC16' };
  if (score <= 45) return { key: 'mid_high',  label: 'โดดเดี่ยวปานกลาง–มาก',  color: '#D97706' };
  return                   { key: 'very_high',label: 'โดดเดี่ยวมากที่สุด',      color: '#DC2626' };
}

/* ── อุบัติเหตุ & ความปลอดภัย ────────────────────────────── */
function _safetyVal(val) {
  if (val == null) return null;
  const s = String(val).trim();
  if (s === 'ใช้ทุกครั้ง') return 0;
  if (s === 'ใช้บางครั้ง') return 1;
  if (s === 'ไม่เคยใช้')   return 2;
  return null;
}
function getSafetyCompliance(row) {
  const vals = [
    _safetyVal(row.helmet_driver),
    _safetyVal(row.helmet_passenger),
    _safetyVal(row.seatbelt_driver),
    _safetyVal(row.seatbelt_passenger),
  ].filter(v => v != null);
  if (!vals.length) return null;
  return (vals.filter(v => v === 0).length / vals.length) * 100;
}
function hasDrunkDriving(row) {
  const v = row.drunk_drive;
  if (v == null) return false;
  const s = String(v).trim();
  return s !== 'ไม่เคย' && !s.includes('ไม่เคยขี่') && !s.includes('ไม่เคยขับ');
}
function hadAccident(row) {
  const v = row.accident_hist;
  if (v == null) return false;
  if (Array.isArray(v)) return v.some(x => x && x !== 'ไม่เคย');
  const s = String(v).trim();
  return s !== 'ไม่เคย' && s !== '' && s !== 'false';
}

function showError(message) {
  document.getElementById('tbc').textContent = message;
}

/* ======= TOAST NOTIFICATION (แทน alert) ======= */
function showToast(message, type = 'success', duration = 3500) {
  const existing = document.getElementById('admin-toast');
  if (existing) existing.remove();
  const colors = { success:'#00A86B', error:'#DC2626', info:'#0F4C81', warn:'#92681A' };
  const icons  = { success:'✅', error:'❌', info:'ℹ️', warn:'⚠️' };
  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;
    background:${colors[type]||colors.info};color:#fff;
    padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;
    box-shadow:0 4px 20px rgba(0,0,0,.25);max-width:360px;line-height:1.5;
    display:flex;gap:10px;align-items:flex-start;
    animation:toastIn .25s ease`;
  const styleEl = document.getElementById('toast-style');
  if (!styleEl) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(s);
  }
  toast.innerHTML = `<span style="font-size:16px;flex-shrink:0">${icons[type]||icons.info}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

/* ======= CUSTOM CONFIRM MODAL (แทน confirm) ======= */
function showConfirm(message, onConfirm, onCancel) {
  const existing = document.getElementById('confirm-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'confirm-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:99998';
  overlay.innerHTML = `<div style="background:#fff;border-radius:14px;padding:28px 28px 20px;max-width:420px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,.2)">
    <div style="font-size:15px;font-weight:600;color:#0F4C81;margin-bottom:8px">ยืนยันการดำเนินการ</div>
    <div style="font-size:13px;color:#374151;white-space:pre-wrap;line-height:1.6;margin-bottom:20px">${message}</div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button id="confirm-cancel-btn" class="btn b-gray" style="padding:8px 20px">ยกเลิก</button>
      <button id="confirm-ok-btn" class="btn b-blue" style="padding:8px 20px">✅ ยืนยัน</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  document.getElementById('confirm-ok-btn').onclick = () => { overlay.remove(); if (onConfirm) onConfirm(); };
  document.getElementById('confirm-cancel-btn').onclick = () => { overlay.remove(); if (onCancel) onCancel(); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); if (onCancel) onCancel(); } });
}

function visiblePageId() {
  return document.querySelector('.page.active')?.id || 'page-dashboard';
}

function downloadWorkbook(fileName, sheetName, rows) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

function downloadTextFile(fileName, text, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + String(text ?? '')], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}


// ─── Survey link builder (moved from admin.html inline script) ─────────────
function buildLinkUrl(org) {
  const code = String(org.org_code || org.code || '').toLowerCase();
  return `${SURVEY_BASE_URL}/?org=${code}`;
}
