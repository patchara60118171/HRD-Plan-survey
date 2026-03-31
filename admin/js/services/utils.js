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
