// =============================================
// js/ch1-form.js — Well-being Survey Chapter 1 Form v3.0
// 5-step form logic, validation, auto-save (NEW STRUCTURE)
// =============================================

const ch1Sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TARGET_TABLE = 'hrd_ch1_responses';
const TOTAL_STEPS = 6; // steps 0–5 (0=landing, 1-5=form steps)
let currentStep = 0;
let lastPayload = null;
let respondentEmail = '';

// =============================================
// STATIC DATA
// =============================================
const SUPPORT_SYSTEMS = [
    { id: 'mentoring_system', label: 'ระบบพี่เลี้ยง (Mentoring)' },
    { id: 'job_rotation', label: 'ระบบหมุนเวียนงาน (Job Rotation)' },
    { id: 'idp_system', label: 'การจัดทำแผนพัฒนารายบุคคล (IDP)' },
    { id: 'career_path_system', label: 'เส้นทางความก้าวหน้า (Career Path)' },
];

const SUPPORT_OPTIONS = [
    { v: 'full', l: 'มีตามแผน' },
    { v: 'partial', l: 'มีไม่ครบตามแผน' },
    { v: 'none', l: 'ไม่มี' },
];

const STRATEGIC_TOPICS = [
    { id: 'service_efficiency', label: 'การเพิ่มประสิทธิภาพการให้บริการประชาชน' },
    { id: 'digital_capability', label: 'การพัฒนาศักยภาพด้านดิจิทัล' },
    { id: 'new_leaders', label: 'การพัฒนาผู้นำรุ่นใหม่' },
    { id: 'reduce_sick_leave', label: 'การลดอัตราการลาป่วย' },
    { id: 'reduce_turnover', label: 'การลดอัตราการลาออก' },
    { id: 'other', label: 'อื่น ๆ' },
];

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Build step-dot labels
    const STEP_NAMES = ['เริ่มต้น', 'ข้อมูลพื้นฐาน', 'นโยบาย/บริบท', 'สุขภาวะ', 'ระบบ/สภาพแวดล้อม', 'ทิศทาง/เป้าหมาย'];
    const dotsRow = document.getElementById('step-dots-row');
    if (dotsRow) {
        dotsRow.innerHTML = STEP_NAMES.map((n, i) =>
            `<span class="step-dot text-xs text-slate-400 text-center" style="width:${100 / 6}%;${i === 0 ? 'display:none;' : ''}" id="dot-${i}">${i}</span>`
        ).join('');
    }
    
    buildSupportSystems();
    updateUI();
    setupNegativeGuards();
    setupAgeWatcher();
    startAutoSave();
});

// =============================================
// BUILDERS
// =============================================
function buildSupportSystems() {
    const container = document.getElementById('support-systems');
    if (!container) return;
    
    container.innerHTML = SUPPORT_SYSTEMS.map(sys => `
        <div class="bg-white rounded-lg p-3 border border-slate-200">
            <p class="text-sm font-medium text-slate-700 mb-2">${sys.label}</p>
            <div class="flex flex-wrap gap-2">
                ${SUPPORT_OPTIONS.map(opt => `
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="${sys.id}" value="${opt.v}" class="w-4 h-4 text-primary border-slate-300 focus:ring-primary">
                        <span class="text-xs text-slate-600">${opt.l}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// =============================================
// NAVIGATION
// =============================================
function confirmEmailAndStart() {
    const emailInput = document.getElementById('respondent_email');
    const emailError = document.getElementById('email-error-msg');
    const email = emailInput.value.trim();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailError.textContent = 'กรุณากรอกอีเมลให้ถูกต้อง';
        return;
    }
    
    respondentEmail = email;
    emailError.textContent = '';
    
    // Show form
    document.getElementById('form-progress').style.display = 'block';
    document.getElementById('form-nav').style.display = 'flex';
    
    currentStep = 1;
    updateUI();
    showToast('เริ่มกรอกแบบสอบถาม');
}

function nextStep() {
    if (!validateStep(currentStep)) return;
    
    if (currentStep < TOTAL_STEPS - 1) {
        currentStep++;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        submitForm();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateUI() {
    // Update step visibility
    document.querySelectorAll('.form-step').forEach((step, idx) => {
        step.classList.toggle('active', idx === currentStep);
    });
    
    // Update progress
    const pct = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);
    document.getElementById('step-pct').textContent = pct + '%';
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('step-label').textContent = 
        currentStep === 0 ? 'เริ่มต้น' : `ส่วนที่ ${currentStep} จาก ${TOTAL_STEPS - 1}`;
    
    // Update dots
    document.querySelectorAll('.step-dot').forEach((dot, idx) => {
        dot.classList.toggle('text-primary', idx === currentStep);
        dot.classList.toggle('font-bold', idx === currentStep);
        dot.classList.toggle('text-slate-400', idx !== currentStep);
    });
    
    // Update navigation buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    if (btnPrev) {
        btnPrev.classList.toggle('invisible', currentStep <= 1);
    }
    
    if (btnNext) {
        btnNext.textContent = currentStep === TOTAL_STEPS - 1 ? 'ส่งข้อมูล ✓' : 'ถัดไป →';
    }
}

// =============================================
// VALIDATION
// =============================================
function validateStep(step) {
    switch (step) {
        case 1: return validateStep1();
        case 2: return true; // Optional
        case 3: return true; // Optional
        case 4: return true; // Optional
        case 5: return validateStep5();
        default: return true;
    }
}

function validateStep1() {
    const org = document.getElementById('organization');
    const staff = document.getElementById('total_staff');
    let valid = true;
    
    // Organization required
    if (!org || !org.value) {
        showError('err-org', true);
        valid = false;
    } else {
        showError('err-org', false);
    }
    
    // Total staff required
    if (!staff || !staff.value || parseInt(staff.value) < 1) {
        showError('err-staff', true);
        valid = false;
    } else {
        showError('err-staff', false);
    }
    
    if (!valid) {
        showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    }
    
    return valid;
}

function validateStep5() {
    // Check at least one priority selected
    const priorities = document.querySelectorAll('input[name="strategic_priority"]:checked');
    const otherChecked = document.querySelector('input[name="strategic_priority"][value="other"]')?.checked;
    const otherText = document.getElementById('strategic_priority_other')?.value.trim();
    
    let valid = true;
    
    if (priorities.length === 0) {
        showError('err-priority', true);
        valid = false;
    } else if (priorities.length > 3) {
        showToast('กรุณาเลือกไม่เกิน 3 ประเด็น', 'error');
        valid = false;
    } else {
        showError('err-priority', false);
    }
    
    // If "other" selected, must have text
    if (otherChecked && !otherText) {
        showToast('กรุณาระบุประเด็นอื่น ๆ', 'error');
        valid = false;
    }
    
    return valid;
}

function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

// =============================================
// DATA COLLECTION
// =============================================
function collectAllData() {
    // Step 1: ข้อมูลเบื้องต้นของส่วนราชการ
    const organization = document.getElementById('organization')?.value || null;
    const strategic_overview = document.getElementById('strategic_overview')?.value.trim() || null;
    const org_structure = document.getElementById('org_structure')?.value.trim() || null;
    const total_staff = parseInt(document.getElementById('total_staff')?.value) || null;
    
    // Age distribution (4 groups)
    const age_u30 = parseInt(document.getElementById('age_u30')?.value) || 0;
    const age_31_40 = parseInt(document.getElementById('age_31_40')?.value) || 0;
    const age_41_50 = parseInt(document.getElementById('age_41_50')?.value) || 0;
    const age_51_60 = parseInt(document.getElementById('age_51_60')?.value) || 0;
    
    // Service years (8 ranges)
    const service_u1 = parseInt(document.getElementById('service_u1')?.value) || 0;
    const service_1_5 = parseInt(document.getElementById('service_1_5')?.value) || 0;
    const service_6_10 = parseInt(document.getElementById('service_6_10')?.value) || 0;
    const service_11_15 = parseInt(document.getElementById('service_11_15')?.value) || 0;
    const service_16_20 = parseInt(document.getElementById('service_16_20')?.value) || 0;
    const service_21_25 = parseInt(document.getElementById('service_21_25')?.value) || 0;
    const service_26_30 = parseInt(document.getElementById('service_26_30')?.value) || 0;
    const service_over30 = parseInt(document.getElementById('service_over30')?.value) || 0;
    
    // Position types (13 levels)
    const pos_o1 = parseInt(document.getElementById('pos_o1')?.value) || 0;
    const pos_o2 = parseInt(document.getElementById('pos_o2')?.value) || 0;
    const pos_o3 = parseInt(document.getElementById('pos_o3')?.value) || 0;
    const pos_o4 = parseInt(document.getElementById('pos_o4')?.value) || 0;
    const pos_k1 = parseInt(document.getElementById('pos_k1')?.value) || 0;
    const pos_k2 = parseInt(document.getElementById('pos_k2')?.value) || 0;
    const pos_k3 = parseInt(document.getElementById('pos_k3')?.value) || 0;
    const pos_k4 = parseInt(document.getElementById('pos_k4')?.value) || 0;
    const pos_k5 = parseInt(document.getElementById('pos_k5')?.value) || 0;
    const pos_m1 = parseInt(document.getElementById('pos_m1')?.value) || 0;
    const pos_m2 = parseInt(document.getElementById('pos_m2')?.value) || 0;
    const pos_s1 = parseInt(document.getElementById('pos_s1')?.value) || 0;
    const pos_s2 = parseInt(document.getElementById('pos_s2')?.value) || 0;
    
    // Staff types
    const type_official = parseInt(document.getElementById('type_official')?.value) || 0;
    const type_employee = parseInt(document.getElementById('type_employee')?.value) || 0;
    const type_contract = parseInt(document.getElementById('type_contract')?.value) || 0;
    const type_other = parseInt(document.getElementById('type_other')?.value) || 0;
    const type_other_name = document.getElementById('type_other_name')?.value.trim() || null;
    
    // Turnover and transfer
    const turnover_count = parseInt(document.getElementById('turnover_count')?.value) || null;
    const turnover_rate = parseFloat(document.getElementById('turnover_rate')?.value) || null;
    const transfer_count = parseInt(document.getElementById('transfer_count')?.value) || null;
    const transfer_rate = parseFloat(document.getElementById('transfer_rate')?.value) || null;

    // Step 2: นโยบายและบริบทภายนอก
    const related_policies = document.getElementById('related_policies')?.value.trim() || null;
    const context_challenges = document.getElementById('context_challenges')?.value.trim() || null;

    // Step 3: ข้อมูลสุขภาวะ
    const disease_diabetes = parseInt(document.getElementById('disease_diabetes')?.value) || 0;
    const disease_hypertension = parseInt(document.getElementById('disease_hypertension')?.value) || 0;
    const disease_cardiovascular = parseInt(document.getElementById('disease_cardiovascular')?.value) || 0;
    const disease_kidney = parseInt(document.getElementById('disease_kidney')?.value) || 0;
    const disease_liver = parseInt(document.getElementById('disease_liver')?.value) || 0;
    const disease_cancer = parseInt(document.getElementById('disease_cancer')?.value) || 0;
    const disease_obesity = parseInt(document.getElementById('disease_obesity')?.value) || 0;
    const disease_other_count = parseInt(document.getElementById('disease_other_count')?.value) || 0;
    const disease_other_detail = document.getElementById('disease_other_detail')?.value.trim() || null;
    
    // Calculate NCD total
    const ncd_count = disease_diabetes + disease_hypertension + disease_cardiovascular + 
                     disease_kidney + disease_liver + disease_cancer + disease_obesity + disease_other_count;

    // Sick leave (new fields)
    const sick_leave_days = parseInt(document.getElementById('sick_leave_days')?.value) || null;
    const sick_leave_avg = parseFloat(document.getElementById('sick_leave_avg')?.value) || null;

    // Clinic
    const clinic_users_per_year = parseInt(document.getElementById('clinic_users_per_year')?.value) || null;
    const clinic_top_symptoms = document.getElementById('clinic_top_symptoms')?.value.trim() || null;
    const clinic_top_medications = document.getElementById('clinic_top_medications')?.value.trim() || null;

    // Mental health (text fields)
    const mental_stress = document.getElementById('mental_stress')?.value.trim() || null;
    const mental_anxiety = document.getElementById('mental_anxiety')?.value.trim() || null;
    const mental_sleep = document.getElementById('mental_sleep')?.value.trim() || null;
    const mental_burnout = document.getElementById('mental_burnout')?.value.trim() || null;
    const mental_depression = document.getElementById('mental_depression')?.value.trim() || null;

    // Engagement
    const engagement_score = document.getElementById('engagement_score')?.value.trim() || null;
    const engagement_low_areas = document.getElementById('engagement_low_areas')?.value.trim() || null;

    // Other wellbeing surveys
    const other_wellbeing_surveys = document.getElementById('other_wellbeing_surveys')?.value.trim() || null;

    // Step 4: ระบบการบริหารและสภาพแวดล้อม
    const mentoring_system = document.querySelector('input[name="mentoring_system"]:checked')?.value || null;
    const job_rotation = document.querySelector('input[name="job_rotation"]:checked')?.value || null;
    const idp_system = document.querySelector('input[name="idp_system"]:checked')?.value || null;
    const career_path_system = document.querySelector('input[name="career_path_system"]:checked')?.value || null;
    
    // Training hours (now text field)
    const training_hours = document.getElementById('training_hours')?.value.trim() || null;
    
    // Digital systems
    const digitalSystems = [...document.querySelectorAll('input[name="digital_systems"]:checked')].map(cb => cb.value);
    
    // Ergonomics
    const ergonomics_status = document.querySelector('input[name="ergonomics_status"]:checked')?.value || null;
    let ergonomics_detail = null;
    if (ergonomics_status === 'planned') {
        ergonomics_detail = document.getElementById('ergonomics_planned_detail')?.value.trim() || null;
    } else if (ergonomics_status === 'in_progress') {
        ergonomics_detail = document.getElementById('ergonomics_in_progress_detail')?.value.trim() || null;
    } else if (ergonomics_status === 'done') {
        ergonomics_detail = document.getElementById('ergonomics_done_detail')?.value.trim() || null;
    }
    
    // Wellbeing analysis
    const wellbeing_analysis = document.getElementById('wellbeing_analysis')?.value.trim() || null;

    // Step 5: ทิศทาง เป้าหมาย และข้อเสนอแนะ
    const selectedPriorities = [...document.querySelectorAll('input[name="strategic_priority"]:checked')].map(cb => cb.value);
    const strategic_priority_other = document.getElementById('strategic_priority_other')?.value.trim() || null;
    const intervention_suggestions = document.getElementById('intervention_suggestions')?.value.trim() || null;
    const hrd_plan_url = document.getElementById('hrd_plan_url')?.value.trim() || null;
    const hrd_plan_results = document.getElementById('hrd_plan_results')?.value.trim() || null;

    return {
        // Metadata
        respondent_email: respondentEmail || null,
        form_version: 'ch1-v3.0',
        submitted_at: new Date().toISOString(),
        
        // Step 1: ข้อมูลเบื้องต้น
        organization,
        strategic_overview,
        org_structure,
        total_staff,
        age_u30, age_31_40, age_41_50, age_51_60,
        service_u1, service_1_5, service_6_10, service_11_15,
        service_16_20, service_21_25, service_26_30, service_over30,
        pos_o1, pos_o2, pos_o3, pos_o4,
        pos_k1, pos_k2, pos_k3, pos_k4, pos_k5,
        pos_m1, pos_m2, pos_s1, pos_s2,
        type_official, type_employee, type_contract, type_other, type_other_name,
        turnover_count, turnover_rate,
        transfer_count, transfer_rate,
        
        // Step 2: นโยบายและบริบท
        related_policies,
        context_challenges,
        
        // Step 3: สุขภาวะ
        disease_diabetes, disease_hypertension, disease_cardiovascular,
        disease_kidney, disease_liver, disease_cancer, disease_obesity,
        disease_other_count, disease_other_detail,
        ncd_count,
        ncd_ratio_pct: (total_staff && ncd_count) ? +((ncd_count / total_staff) * 100).toFixed(2) : null,
        sick_leave_days, sick_leave_avg,
        clinic_users_per_year, clinic_top_symptoms, clinic_top_medications,
        mental_stress, mental_anxiety, mental_sleep, mental_burnout, mental_depression,
        engagement_score, engagement_low_areas,
        other_wellbeing_surveys,
        
        // Step 4: ระบบและสภาพแวดล้อม
        mentoring_system, job_rotation, idp_system, career_path_system,
        training_hours,
        digital_systems: digitalSystems.length ? digitalSystems : null,
        ergonomics_status, ergonomics_detail,
        wellbeing_analysis,
        
        // Step 5: ทิศทางและเป้าหมาย
        strategic_priorities: selectedPriorities.length ? selectedPriorities : null,
        strategic_priority_other,
        intervention_suggestions,
        hrd_plan_url, hrd_plan_results,
    };
}

// =============================================
// SUBMISSION
// =============================================
async function submitForm() {
    const payload = collectAllData();
    lastPayload = payload;
    
    // Show loading
    document.getElementById('overlay-loading').classList.remove('hidden');
    
    try {
        const { data, error } = await ch1Sb.from(TARGET_TABLE).insert([payload]).select();
        
        if (error) throw error;
        
        // Success
        document.getElementById('overlay-loading').classList.add('hidden');
        document.getElementById('overlay-success').classList.remove('hidden');
        document.getElementById('success-ref').textContent = `Ref: ${data[0]?.id || 'N/A'}`;
        
        // Clear draft
        localStorage.removeItem('wellbeing_ch1_draft_v3');
        
    } catch (err) {
        console.error('Submit error:', err);
        document.getElementById('overlay-loading').classList.add('hidden');
        document.getElementById('overlay-error').classList.remove('hidden');
        document.getElementById('error-msg').textContent = err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล';
    }
}

function retrySubmit() {
    document.getElementById('overlay-error').classList.add('hidden');
    submitForm();
}

function hideOverlay(type) {
    document.getElementById(`overlay-${type}`).classList.add('hidden');
}

// =============================================
// AUTO-SAVE
// =============================================
function saveDraft() {
    const data = collectAllData();
    data._savedAt = new Date().toISOString();
    localStorage.setItem('wellbeing_ch1_draft_v3', JSON.stringify(data));
    showToast('บันทึกร่างเรียบร้อย');
}

function loadDraft() {
    const raw = localStorage.getItem('wellbeing_ch1_draft_v3');
    if (!raw) {
        showToast('ไม่พบร่างที่บันทึกไว้', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(raw);
        restoreFormData(data);
        showToast('โหลดร่างเรียบร้อย');
    } catch (e) {
        console.error('Load draft error:', e);
        showToast('ไม่สามารถโหลดร่างได้', 'error');
    }
}

function restoreFormData(data) {
    // Restore all fields
    Object.keys(data).forEach(key => {
        if (key.startsWith('_')) return;
        
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = !!data[key];
            } else if (el.type === 'radio') {
                // Handle radio buttons
                const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                el.value = data[key] || '';
            }
        }
    });
    
    // Restore radio buttons by name
    ['mentoring_system', 'job_rotation', 'idp_system', 'career_path_system', 'ergonomics_status'].forEach(name => {
        if (data[name]) {
            const radio = document.querySelector(`input[name="${name}"][value="${data[name]}"]`);
            if (radio) radio.checked = true;
        }
    });
    
    // Restore checkboxes
    if (data.digital_systems && Array.isArray(data.digital_systems)) {
        data.digital_systems.forEach(val => {
            const cb = document.querySelector(`input[name="digital_systems"][value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }
    
    if (data.strategic_priorities && Array.isArray(data.strategic_priorities)) {
        data.strategic_priorities.forEach(val => {
            const cb = document.querySelector(`input[name="strategic_priority"][value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }
}

function startAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        if (currentStep > 0 && respondentEmail) {
            const data = collectAllData();
            data._savedAt = new Date().toISOString();
            localStorage.setItem('wellbeing_ch1_draft_v3', JSON.stringify(data));
            console.log('Auto-saved at', new Date().toLocaleTimeString());
        }
    }, 30000);
}

// =============================================
// UTILITIES
// =============================================
function calculateTurnoverRate() {
    const turnoverCount = parseInt(document.getElementById('turnover_count')?.value) || 0;
    const totalStaff = parseInt(document.getElementById('total_staff')?.value) || 0;
    const turnoverRateInput = document.getElementById('turnover_rate');
    
    if (totalStaff > 0 && turnoverRateInput) {
        const rate = ((turnoverCount / totalStaff) * 100).toFixed(2);
        turnoverRateInput.value = rate;
    } else if (turnoverRateInput) {
        turnoverRateInput.value = '';
    }
}

function calculateTransferRate() {
    const transferCount = parseInt(document.getElementById('transfer_count')?.value) || 0;
    const totalStaff = parseInt(document.getElementById('total_staff')?.value) || 0;
    const transferRateInput = document.getElementById('transfer_rate');
    
    if (totalStaff > 0 && transferRateInput) {
        const rate = ((transferCount / totalStaff) * 100).toFixed(2);
        transferRateInput.value = rate;
    } else if (transferRateInput) {
        transferRateInput.value = '';
    }
}

function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = msg;
    toast.className = `fixed bottom-6 right-6 px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all duration-300 ${
        type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
    }`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, 3000);
}

function setupNegativeGuards() {
    // Prevent negative numbers in all number inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value < 0) this.value = 0;
        });
    });
}

function setupAgeWatcher() {
    const totalStaffInput = document.getElementById('total_staff');
    
    // Age distribution validation
    const ageInputs = ['age_u30', 'age_31_40', 'age_41_50', 'age_51_60'];
    const ageTotalSpan = document.getElementById('age-total');
    const ageSumWarn = document.getElementById('age-sum-warn');
    
    // Type distribution validation
    const typeInputs = ['type_official', 'type_employee', 'type_contract', 'type_other'];
    const typeTotalSpan = document.getElementById('type-total');
    const typeSumWarn = document.getElementById('type-sum-warn');
    
    // Service years validation
    const serviceInputs = ['service_u1', 'service_1_5', 'service_6_10', 'service_11_15', 'service_16_20', 'service_21_25', 'service_26_30', 'service_over30'];
    const serviceTotalSpan = document.getElementById('service-total');
    const serviceSumWarn = document.getElementById('service-sum-warn');
    
    // Position validation
    const positionInputs = ['pos_o1', 'pos_o2', 'pos_o3', 'pos_o4', 'pos_k1', 'pos_k2', 'pos_k3', 'pos_k4', 'pos_k5', 'pos_m1', 'pos_m2', 'pos_s1', 'pos_s2'];
    const positionTotalSpan = document.getElementById('position-total');
    const positionSumWarn = document.getElementById('position-sum-warn');
    
    function updateTotals() {
        const totalStaff = parseInt(totalStaffInput?.value) || 0;
        
        // Update age total
        const ageTotal = ageInputs.reduce((sum, id) => sum + (parseInt(document.getElementById(id)?.value) || 0), 0);
        if (ageTotalSpan) ageTotalSpan.textContent = ageTotal;
        if (ageSumWarn && totalStaff > 0) {
            if (ageTotal > totalStaff) {
                ageSumWarn.classList.remove('hidden');
                ageSumWarn.textContent = `⚠️ ผลรวมช่วงอายุ (${ageTotal} คน) เกินจำนวนบุคลากรรวม (${totalStaff} คน)`;
            } else {
                ageSumWarn.classList.add('hidden');
            }
        }
        
        // Update type total
        const typeTotal = typeInputs.reduce((sum, id) => sum + (parseInt(document.getElementById(id)?.value) || 0), 0);
        if (typeTotalSpan) typeTotalSpan.textContent = typeTotal;
        if (typeSumWarn && totalStaff > 0) {
            if (typeTotal > totalStaff) {
                typeSumWarn.classList.remove('hidden');
                typeSumWarn.textContent = `⚠️ ผลรวมประเภทอัตรากำลัง (${typeTotal} คน) เกินจำนวนบุคลากรรวม (${totalStaff} คน)`;
            } else {
                typeSumWarn.classList.add('hidden');
            }
        }
        
        // Update service total
        const serviceTotal = serviceInputs.reduce((sum, id) => sum + (parseInt(document.getElementById(id)?.value) || 0), 0);
        if (serviceTotalSpan) serviceTotalSpan.textContent = serviceTotal;
        if (serviceSumWarn && totalStaff > 0) {
            if (serviceTotal > totalStaff) {
                serviceSumWarn.classList.remove('hidden');
                serviceSumWarn.textContent = `⚠️ ผลรวมอายุราชการ (${serviceTotal} คน) เกินจำนวนบุคลากรรวม (${totalStaff} คน)`;
            } else {
                serviceSumWarn.classList.add('hidden');
            }
        }
        
        // Update position total
        const positionTotal = positionInputs.reduce((sum, id) => sum + (parseInt(document.getElementById(id)?.value) || 0), 0);
        if (positionTotalSpan) positionTotalSpan.textContent = positionTotal;
        if (positionSumWarn && totalStaff > 0) {
            if (positionTotal > totalStaff) {
                positionSumWarn.classList.remove('hidden');
                positionSumWarn.textContent = `⚠️ ผลรวมประเภทและระดับตำแหน่ง (${positionTotal} คน) เกินจำนวนบุคลากรรวม (${totalStaff} คน)`;
            } else {
                positionSumWarn.classList.add('hidden');
            }
        }
    }
    
    // Add event listeners for all inputs
    [...ageInputs, ...typeInputs, ...serviceInputs, ...positionInputs, 'total_staff'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateTotals);
            input.addEventListener('change', updateTotals);
            // Also calculate turnover rate when total staff changes
            if (id === 'total_staff') {
                input.addEventListener('input', calculateTurnoverRate);
                input.addEventListener('change', calculateTurnoverRate);
                input.addEventListener('input', calculateTransferRate);
                input.addEventListener('change', calculateTransferRate);
            }
        }
    });
    
    // Initial update
    updateTotals();
}

// =============================================
// GLOBAL EXPORTS (for HTML onclick handlers)
// =============================================
window.confirmEmailAndStart = confirmEmailAndStart;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.retrySubmit = retrySubmit;
window.hideOverlay = hideOverlay;
window.calculateTurnoverRate = calculateTurnoverRate;
window.calculateTransferRate = calculateTransferRate;
