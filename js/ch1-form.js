// ========================================
// js/ch1-form.js — HRD Chapter 1 Form Logic
// ========================================

// --- Supabase is already loaded from supabase-config.js ---
const ch1Supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TARGET_TABLE = 'hrd_ch1_responses';

const ORGANIZATIONS = [
    "กรมกิจการเด็กและเยาวชน",
    "กรมคุมประพฤติ",
    "กรมชลประทาน",
    "กรมทางหลวง",
    "กรมวิทยาศาสตร์บริการ",
    "กรมส่งเสริมวัฒนธรรม",
    "กรมสุขภาพจิต",
    "กรมอุตุนิยมวิทยา",
    "สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ",
    "สำนักงานคณะกรรมการพัฒนาระบบราชการ",
    "สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม",
    "สำนักงานนโยบายและยุทธศาสตร์การค้า",
    "สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา",
    "สำนักงานการวิจัยแห่งชาติ",
    "สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ"
];

const SEVERITY_LABELS = ['', 'น้อยมาก', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];

// --- State ---
let currentStep = 0;
const TOTAL_STEPS = 5;
let lastFormData = null;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    populateOrgDropdown();
    setupPills();
    setupCheckboxList();
    setupRadioGroup();
    setupSlider();
    setupMedToggle();
    updateUI();
});

// --- Org Dropdown ---
function populateOrgDropdown() {
    const sel = document.getElementById('org-select');
    ORGANIZATIONS.forEach(org => {
        const opt = document.createElement('option');
        opt.value = org;
        opt.textContent = org;
        sel.appendChild(opt);
    });
}

// --- Pills (Health Issues) ---
function setupPills() {
    document.querySelectorAll('#health-pills .pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const cb = pill.querySelector('input');
            cb.checked = !cb.checked;
            pill.classList.toggle('selected', cb.checked);
            hideError('err-health');
        });
    });
}

// --- Checkbox List (Plans) ---
function setupCheckboxList() {
    document.querySelectorAll('#plans-list .checkbox-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return; // let native work
            const cb = item.querySelector('input');
            cb.checked = !cb.checked;
            item.classList.toggle('checked', cb.checked);
            hideError('err-plans');
        });
        item.querySelector('input').addEventListener('change', function () {
            item.classList.toggle('checked', this.checked);
            hideError('err-plans');
        });
    });
}

// --- Radio Group (HRD Status) ---
function setupRadioGroup() {
    document.querySelectorAll('#hrd-status-group .radio-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.type === 'radio') {
                // native click
            } else {
                const rb = item.querySelector('input');
                rb.checked = true;
            }
            // Update visual
            document.querySelectorAll('#hrd-status-group .radio-item').forEach(ri => {
                ri.classList.toggle('checked', ri.querySelector('input').checked);
            });
            hideError('err-hrd');
        });
    });
}

// --- Severity Slider ---
function setupSlider() {
    const slider = document.getElementById('severity-slider');
    const display = document.getElementById('severity-display');
    slider.addEventListener('input', () => {
        const v = parseInt(slider.value);
        display.textContent = `${SEVERITY_LABELS[v]} (${v}/5)`;
    });
}

// --- Med Expense Toggle ---
function setupMedToggle() {
    const toggle = document.getElementById('med-toggle');
    const label = document.getElementById('med-toggle-label');
    const fields = document.getElementById('med-fields');
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            label.textContent = 'มีข้อมูล';
            fields.classList.add('show');
        } else {
            label.textContent = 'ไม่มีข้อมูล';
            fields.classList.remove('show');
        }
    });
}

// --- Navigation ---
function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep === TOTAL_STEPS - 2) {
        // Going to summary step
        buildSummary();
    }

    if (currentStep < TOTAL_STEPS - 1) {
        currentStep++;
        updateUI();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
}

function updateUI() {
    // Steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.step) === currentStep);
    });

    // Progress dots
    document.querySelectorAll('.progress-step').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove('active', 'done');
        if (s === currentStep) el.classList.add('active');
        else if (s < currentStep) el.classList.add('done');
    });

    // Buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';

    if (currentStep === TOTAL_STEPS - 1) {
        // Summary step — show submit button
        btnNext.className = 'btn btn-submit';
        btnNext.innerHTML = 'ส่งแบบสอบถาม ✅';
        btnNext.onclick = submitHandler;
    } else {
        btnNext.className = 'btn btn-next';
        btnNext.innerHTML = 'ถัดไป →';
        btnNext.onclick = nextStep;
    }

    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Validation ---
function validateStep(step) {
    switch (step) {
        case 0: return validateOrg();
        case 1: return validateStaff();
        case 2: return validateHealth();
        case 3: return validatePlans();
        default: return true;
    }
}

function validateOrg() {
    const val = document.getElementById('org-select').value;
    if (!val) { showError('err-org'); return false; }
    hideError('err-org');
    return true;
}

function validateStaff() {
    const total = parseInt(document.getElementById('total-staff').value);
    if (!total || total < 1) { showError('err-staff'); return false; }
    hideError('err-staff');

    const ncd = parseInt(document.getElementById('ncd-count').value) || 0;
    if (ncd > total) { showError('err-ncd'); return false; }
    hideError('err-ncd');

    return true;
}

function validateHealth() {
    const selected = document.querySelectorAll('#health-pills .pill.selected');
    if (selected.length === 0) { showError('err-health'); return false; }
    hideError('err-health');
    return true;
}

function validatePlans() {
    const checked = document.querySelectorAll('#plans-list .checkbox-item input:checked');
    if (checked.length === 0) { showError('err-plans'); return false; }
    hideError('err-plans');

    const hrdStatus = document.querySelector('input[name="hrd-status"]:checked');
    if (!hrdStatus) { showError('err-hrd'); return false; }
    hideError('err-hrd');

    return true;
}

function showError(id) { document.getElementById(id).style.display = 'block'; }
function hideError(id) { document.getElementById(id).style.display = 'none'; }

// --- Collect Form Data ---
function collectFormData() {
    const totalStaff = parseInt(document.getElementById('total-staff').value) || 0;
    const ncdCount = parseInt(document.getElementById('ncd-count').value) || 0;
    const medToggle = document.getElementById('med-toggle').checked;

    const healthIssues = [];
    document.querySelectorAll('#health-pills .pill.selected').forEach(p => {
        healthIssues.push(p.dataset.value);
    });

    const linkedPlans = [];
    document.querySelectorAll('#plans-list .checkbox-item input:checked').forEach(cb => {
        linkedPlans.push(cb.closest('.checkbox-item').dataset.value);
    });

    const severity = parseInt(document.getElementById('severity-slider').value);
    const hrdStatus = document.querySelector('input[name="hrd-status"]:checked')?.value || '';

    return {
        organization: document.getElementById('org-select').value,
        totalStaff,
        ageU30: parseInt(document.getElementById('age-u30').value) || null,
        age3039: parseInt(document.getElementById('age-30-39').value) || null,
        age4049: parseInt(document.getElementById('age-40-49').value) || null,
        age50plus: parseInt(document.getElementById('age-50-plus').value) || null,
        ncdCount: ncdCount || null,
        medExpenseAvail: medToggle ? 'yes' : 'no',
        med2563: medToggle ? (parseInt(document.getElementById('med-2563').value) || null) : null,
        med2564: medToggle ? (parseInt(document.getElementById('med-2564').value) || null) : null,
        med2565: medToggle ? (parseInt(document.getElementById('med-2565').value) || null) : null,
        med2566: medToggle ? (parseInt(document.getElementById('med-2566').value) || null) : null,
        med2567: medToggle ? (parseInt(document.getElementById('med-2567').value) || null) : null,
        healthIssues,
        healthOther: document.getElementById('health-other').value.trim() || null,
        severity,
        linkedPlans,
        hrdStatus
    };
}

// --- Build Summary ---
function buildSummary() {
    const d = collectFormData();
    const ncdPct = d.ncdCount && d.totalStaff ? ((d.ncdCount / d.totalStaff) * 100).toFixed(2) : '-';
    const hrdLabels = { yes: '✅ มีแล้ว', inprogress: '🔄 กำลังจัดทำ', no: '❌ ยังไม่มี' };

    let html = '';

    // Section 1: Organization
    html += `
    <div class="summary-section">
        <h4>🏢 หน่วยงาน</h4>
        <div class="summary-row"><span class="label">หน่วยงาน</span><span class="value">${d.organization}</span></div>
    </div>`;

    // Section 2: Staff
    html += `
    <div class="summary-section">
        <h4>👥 ข้อมูลบุคลากร</h4>
        <div class="summary-row"><span class="label">บุคลากรทั้งหมด</span><span class="value">${d.totalStaff.toLocaleString()} คน</span></div>
        ${d.ageU30 !== null ? `<div class="summary-row"><span class="label">อายุต่ำกว่า 30</span><span class="value">${d.ageU30} คน</span></div>` : ''}
        ${d.age3039 !== null ? `<div class="summary-row"><span class="label">อายุ 30-39</span><span class="value">${d.age3039} คน</span></div>` : ''}
        ${d.age4049 !== null ? `<div class="summary-row"><span class="label">อายุ 40-49</span><span class="value">${d.age4049} คน</span></div>` : ''}
        ${d.age50plus !== null ? `<div class="summary-row"><span class="label">อายุ 50+</span><span class="value">${d.age50plus} คน</span></div>` : ''}
        ${d.ncdCount !== null ? `<div class="summary-row"><span class="label">ผู้ป่วย NCD</span><span class="value">${d.ncdCount} คน (${ncdPct}%)</span></div>` : ''}
        <div class="summary-row"><span class="label">ข้อมูลค่ารักษา</span><span class="value">${d.medExpenseAvail === 'yes' ? '✅ มี' : '❌ ไม่มี'}</span></div>
    </div>`;

    // Section 3: Health
    html += `
    <div class="summary-section">
        <h4>🩺 ปัญหาสุขภาพ</h4>
        <div class="summary-tags">${d.healthIssues.map(i => `<span class="summary-tag">${i}</span>`).join('')}</div>
        ${d.healthOther ? `<div class="summary-row" style="margin-top:0.5rem"><span class="label">อื่นๆ</span><span class="value">${d.healthOther}</span></div>` : ''}
        <div class="summary-row"><span class="label">ระดับความรุนแรง</span><span class="value">${SEVERITY_LABELS[d.severity]} (${d.severity}/5)</span></div>
    </div>`;

    // Section 4: Plans
    html += `
    <div class="summary-section">
        <h4>📋 แผนระดับชาติ</h4>
        <div class="summary-tags">${d.linkedPlans.map(p => `<span class="summary-tag">${p}</span>`).join('')}</div>
        <div class="summary-row" style="margin-top:0.5rem"><span class="label">สถานะ HRD</span><span class="value">${hrdLabels[d.hrdStatus] || '-'}</span></div>
    </div>`;

    document.getElementById('summary-content').innerHTML = html;
}

// --- Submit ---
async function submitHandler() {
    const formData = collectFormData();
    lastFormData = formData;
    await submitWithRetry(formData);
}

async function submitWithRetry(formData, attempt = 1) {
    showState('loading');
    try {
        const record = {
            organization: formData.organization,
            total_staff: formData.totalStaff,
            age_u30: formData.ageU30,
            age_30_39: formData.age3039,
            age_40_49: formData.age4049,
            age_50_plus: formData.age50plus,
            ncd_count: formData.ncdCount,
            ncd_ratio_pct: formData.ncdCount && formData.totalStaff
                ? +((formData.ncdCount / formData.totalStaff) * 100).toFixed(2)
                : null,
            med_expense_available: formData.medExpenseAvail,
            med_expense_2563: formData.med2563,
            med_expense_2564: formData.med2564,
            med_expense_2565: formData.med2565,
            med_expense_2566: formData.med2566,
            med_expense_2567: formData.med2567,
            health_issues: formData.healthIssues,
            health_issues_other: formData.healthOther,
            severity_score: formData.severity,
            severity_label: SEVERITY_LABELS[formData.severity],
            linked_plans: formData.linkedPlans,
            hrd_plan_status: formData.hrdStatus,
            raw_payload: formData,
            form_version: 'ch1-v1'
        };

        const { data, error } = await ch1Supabase
            .from(TARGET_TABLE)
            .insert([record])
            .select();

        if (error) throw error;

        hideState('loading');
        const refId = data[0].id.substring(0, 8);
        document.getElementById('success-msg').textContent =
            `ขอบคุณที่ส่งแบบสอบถาม — Ref: ${refId}`;
        showState('success');

    } catch (err) {
        hideState('loading');
        if (attempt < 3) {
            await new Promise(r => setTimeout(r, 2000));
            return submitWithRetry(formData, attempt + 1);
        }
        document.getElementById('error-msg').textContent =
            `ไม่สามารถส่งข้อมูลได้: ${err.message || 'Unknown error'}`;
        showState('error');
        console.error('Submit error:', err);
    }
}

function retrySubmit() {
    hideState('error');
    if (lastFormData) submitWithRetry(lastFormData);
}

// --- State Management ---
function showState(name) {
    document.getElementById(`state-${name}`).classList.add('show');
}
function hideState(name) {
    document.getElementById(`state-${name}`).classList.remove('show');
}
