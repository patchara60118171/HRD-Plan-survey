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
const urlParams = new URLSearchParams(window.location.search);
const IS_TEST_MODE = urlParams.get('test') === '1';
const TEST_RUN_ID = IS_TEST_MODE
    ? (urlParams.get('test_run_id') || `browser-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    : null;

// =============================================
// STATIC DATA
// =============================================
const SUPPORT_SYSTEMS = PROJECT_SSOT?.ch1?.supportSystems || [];

const SUPPORT_OPTIONS = PROJECT_SSOT?.ch1?.supportOptions || [];

const STRATEGIC_TOPICS = PROJECT_SSOT?.ch1?.strategicTopics || [];

// =============================================
// ORGANIZATION MAPPING
// =============================================
const ORG_MAP = PROJECT_SSOT?.organizations?.orgCodeNameMap || {};

function parseUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const orgCode = params.get('org');
    
    if (!orgCode || !ORG_MAP[orgCode]) {
        if (orgCode) console.warn(`Unknown organization code: ${orgCode}`);
        return;
    }
    
    const orgName = ORG_MAP[orgCode];
    
    // 1. Always show badges on landing page
    const badgeContainer = document.getElementById('org-badge-container');
    const badgeName = document.getElementById('org-badge-name');
    const welcomeAlert = document.getElementById('org-welcome-alert');
    const welcomeName = document.getElementById('org-welcome-name');
    
    if (badgeContainer && badgeName) {
        badgeName.textContent = orgName;
        badgeContainer.classList.remove('hidden');
    }
    if (welcomeAlert && welcomeName) {
        welcomeName.textContent = orgName;
        welcomeAlert.classList.remove('hidden');
    }
    
    // 2. Auto-select the organization in the dropdown (Step 1)
    const orgSelect = document.getElementById('organization');
    if (orgSelect) {
        let optionExists = false;
        for (let i = 0; i < orgSelect.options.length; i++) {
            if (orgSelect.options[i].value === orgName || orgSelect.options[i].text === orgName) {
                optionExists = true;
                break;
            }
        }
        if (!optionExists) {
            const newOption = document.createElement('option');
            newOption.value = orgName;
            newOption.text = orgName;
            orgSelect.appendChild(newOption);
        }
        orgSelect.value = orgName;
        orgSelect.disabled = true;
    }
    
    console.log(`Organization auto-selected: ${orgName} (${orgCode})`);
    
    // 3. Toast after a short delay
    setTimeout(() => {
        if (typeof showToast === 'function') {
            showToast(`ยินดีต้อนรับบุคลากรจาก ${orgName}`, 'success');
        }
    }, 500);
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    // ── Sprint 1 (1e): Preload CH1 schema from DB (primary), fallback to hardcoded ──
    if (typeof FormSchema !== 'undefined') {
        try {
            const schema = await FormSchema.loadFormSchema('ch1');
            if (schema && schema.source === 'supabase') {
                console.log('[ch1-form] Schema loaded from DB:', schema.questions.length, 'questions');
            } else {
                console.log('[ch1-form] Using fallback schema (source:', schema?.source, ')');
            }
        } catch (e) {
            console.warn('[ch1-form] Schema preload failed, using hardcoded fallback:', e.message);
        }
    }

    // Build step-dot labels
    const STEP_NAMES = PROJECT_SSOT?.ch1?.stepNames || ['เริ่มต้น', 'ข้อมูลพื้นฐาน', 'นโยบาย/บริบท', 'สุขภาวะ', 'ระบบ/สภาพแวดล้อม', 'ทิศทาง/เป้าหมาย'];
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

    // Parse URL parameter to auto-select organization
    parseUrlParameters();
    renderTestModeBanner();
});

function renderTestModeBanner() {
    const banner = document.getElementById('test-mode-banner');
    const badge = document.getElementById('test-mode-badge');
    const testRunId = document.getElementById('test-run-id');

    if (!IS_TEST_MODE) return;

    if (banner) banner.classList.remove('hidden');
    if (badge) badge.classList.remove('hidden');
    if (testRunId) testRunId.textContent = TEST_RUN_ID;
}

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

// Validate numeric input bounds
function validateNumericInput(value, fieldName, max = 999999) {
    const num = parseInt(value);
    if (isNaN(num)) return { valid: false, error: `${fieldName} ต้องเป็นตัวเลขเท่านั้น` };
    if (num < 0) return { valid: false, error: `${fieldName} ต้องเป็นตัวเลขบวก` };
    if (num > max) return { valid: false, error: `${fieldName} ต้องไม่เกิน ${max}` };
    return { valid: true };
}

// Safe integer converter with max limit
function toSafeInt(value, max = 999999, fieldName = 'ฟิลด์') {
    const num = parseInt(value) || 0;
    if (num > max) {
        console.warn(`⚠️ ${fieldName} scaled down from ${num} to ${max}`);
        return max;
    }
    return num < 0 ? 0 : num;
}

// Generate detailed error message
function getDetailedErrorMessage(err) {
    const errorStr = err.message || '';

    if (errorStr.includes('numeric field overflow')) {
        return `❌ ข้อผิดพลาด: ตัวเลขเกินค่าสูงสุด\n\n` +
            `📝 รายละเอียด:\n` +
            `• ฟิลด์ที่รับค่าตัวเลขมีการจำกัดค่าสูงสุด\n` +
            `• ตัวเลขที่ป้อนเกินจำนวนที่ระบบยอมรับ\n\n` +
            `💡 วิธีแก้ไข:\n` +
            `• โปรดตรวจสอบค่าตัวเลขทั้งหมด (ต้องไม่เกิน 999,999)\n` +
            `• ตัวอย่างฟิลด์ที่มักเกิดข้อผิดพลาด:\n` +
            `  - จำนวนบุคลากร\n` +
            `  - จำนวนในแต่ละกลุ่มอายุ\n` +
            `  - จำนวนโรค\n` +
            `• ลองป้อนค่าใหม่ให้ตรงกับความเป็นจริง\n` +
            `• กดปุ่ม "สอบถามใหม่" เพื่อลองอีกครั้ง`;
    }

    if (errorStr.includes('duplicate')) {
        return `❌ ข้อผิดพลาด: ข้อมูลซ้ำ\n\n` +
            `📝 รายละเอียด:\n` +
            `• อีเมลนี้ได้ส่งแบบสอบถามแล้วในช่วง 1 ชั่วโมงที่ผ่านมา\n\n` +
            `💡 วิธีแก้ไข:\n` +
            `• โปรดรอ 1 ชั่วโมงแล้วลองใหม่\n` +
            `• หรือใช้อีเมลอื่นเพื่อส่งแบบสอบถาม\n` +
            `• หากต้องการแก้ไขข้อมูล โปรดติดต่อผู้ดูแลระบบ`;
    }

    if (errorStr.includes('email')) {
        return `❌ ข้อผิดพลาด: ปัญหากับอีเมล\n\n` +
            `📝 รายละเอียด:\n` +
            `• อีเมลที่ป้อนไม่ถูกต้องหรือน่าสงสัย\n\n` +
            `💡 วิธีแก้ไข:\n` +
            `• ตรวจสอบการสะกดอีเมล\n` +
            `• อีเมลต้องอยู่ในรูป: example@domain.com\n` +
            `• อีเมลจากบริการชั่วคราวไม่ยอมรับ\n` +
            `• ใช้อีเมลองค์กรหรืออีเมลที่ใช้จริง`;
    }

    if (errorStr.includes('constraint')) {
        return `❌ ข้อผิดพลาด: ข้อมูลไม่ถูกต้อง\n\n` +
            `📝 รายละเอียด:\n` +
            `• ข้อมูลที่ป้อนขัดแย้งกับกฎของระบบ\n\n` +
            `💡 วิธีแก้ไข:\n` +
            `• ตรวจสอบว่าข้อมูลทั้งหมดเหมาะสม\n` +
            `• หากผลรวมของส่วนต่างๆ ควรตรงกับจำนวนทั้งหมด\n` +
            `• โปรดติดต่อผู้ดูแลระบบหากยังมีปัญหา`;
    }

    return `❌ ข้อผิดพลาด: ${errorStr}\n\n💡 หากปัญหายังไม่แก้ได้: โปรดติดต่อผู้ดูแลระบบ`;
}

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
    // Check at least one priority selected (using ranking system)
    const rank1 = document.getElementById('rank_priority_1')?.value;
    const rank2 = document.getElementById('rank_priority_2')?.value;
    const rank3 = document.getElementById('rank_priority_3')?.value;

    if (!rank1 && !rank2 && !rank3) {
        document.getElementById('err-priority').classList.remove('hidden');
        return false;
    }

    document.getElementById('err-priority').classList.add('hidden');
    return true;
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
    const total_staff = toSafeInt(document.getElementById('total_staff')?.value, 999999, 'จำนวนบุคลากรทั้งหมด') || null;

    // Age distribution (4 groups)
    const age_u30 = toSafeInt(document.getElementById('age_u30')?.value, 99999, 'อายุต่ำกว่า 30');
    const age_31_40 = toSafeInt(document.getElementById('age_31_40')?.value, 99999, 'อายุ 31-40');
    const age_41_50 = toSafeInt(document.getElementById('age_41_50')?.value, 99999, 'อายุ 41-50');
    const age_51_60 = toSafeInt(document.getElementById('age_51_60')?.value, 99999, 'อายุ 51-60');

    // Service years (8 ranges)
    const service_u1 = toSafeInt(document.getElementById('service_u1')?.value, 99999, 'อายุราชการน้อยกว่า 1 ปี');
    const service_1_5 = toSafeInt(document.getElementById('service_1_5')?.value, 99999, 'อายุราชการ 1-5 ปี');
    const service_6_10 = toSafeInt(document.getElementById('service_6_10')?.value, 99999, 'อายุราชการ 6-10 ปี');
    const service_11_15 = toSafeInt(document.getElementById('service_11_15')?.value, 99999, 'อายุราชการ 11-15 ปี');
    const service_16_20 = toSafeInt(document.getElementById('service_16_20')?.value, 99999, 'อายุราชการ 16-20 ปี');
    const service_21_25 = toSafeInt(document.getElementById('service_21_25')?.value, 99999, 'อายุราชการ 21-25 ปี');
    const service_26_30 = toSafeInt(document.getElementById('service_26_30')?.value, 99999, 'อายุราชการ 26-30 ปี');
    const service_over30 = toSafeInt(document.getElementById('service_over30')?.value, 99999, 'อายุราชการมากกว่า 30 ปี');

    // Position types (13 levels)
    const pos_o1 = toSafeInt(document.getElementById('pos_o1')?.value, 99999, 'ตำแหน่ง O1');
    const pos_o2 = toSafeInt(document.getElementById('pos_o2')?.value, 99999, 'ตำแหน่ง O2');
    const pos_o3 = toSafeInt(document.getElementById('pos_o3')?.value, 99999, 'ตำแหน่ง O3');
    const pos_o4 = toSafeInt(document.getElementById('pos_o4')?.value, 99999, 'ตำแหน่ง O4');
    const pos_k1 = toSafeInt(document.getElementById('pos_k1')?.value, 99999, 'ตำแหน่ง K1');
    const pos_k2 = toSafeInt(document.getElementById('pos_k2')?.value, 99999, 'ตำแหน่ง K2');
    const pos_k3 = toSafeInt(document.getElementById('pos_k3')?.value, 99999, 'ตำแหน่ง K3');
    const pos_k4 = toSafeInt(document.getElementById('pos_k4')?.value, 99999, 'ตำแหน่ง K4');
    const pos_k5 = toSafeInt(document.getElementById('pos_k5')?.value, 99999, 'ตำแหน่ง K5');
    const pos_m1 = toSafeInt(document.getElementById('pos_m1')?.value, 99999, 'ตำแหน่ง M1');
    const pos_m2 = toSafeInt(document.getElementById('pos_m2')?.value, 99999, 'ตำแหน่ง M2');
    const pos_s1 = toSafeInt(document.getElementById('pos_s1')?.value, 99999, 'ตำแหน่ง S1');
    const pos_s2 = toSafeInt(document.getElementById('pos_s2')?.value, 99999, 'ตำแหน่ง S2');

    // Staff type distribution (4 types)
    const type_official = toSafeInt(document.getElementById('type_official')?.value, 99999, 'บุคลากรประจำ');
    const type_employee = toSafeInt(document.getElementById('type_employee')?.value, 99999, 'พนักงาน');
    const type_contract = toSafeInt(document.getElementById('type_contract')?.value, 99999, 'พนักงานสัญญา');
    const type_other = toSafeInt(document.getElementById('type_other')?.value, 99999, 'อื่นๆ');

    // Turnover and transfer (legacy fields - for backward compatibility)
    const turnover_count = toSafeInt(document.getElementById('turnover_count')?.value, 99999, 'จำนวนลาออก') || null;
    const turnover_rate = parseFloat(document.getElementById('turnover_rate')?.value) || null;
    const transfer_count = toSafeInt(document.getElementById('transfer_count')?.value, 99999, 'จำนวนย้าย') || null;
    const transfer_rate = parseFloat(document.getElementById('transfer_rate')?.value) || null;

    // Section 4: การลาออกและโอนย้าย (ย้อนหลัง 5 ปี) - ข้อมูลตามปี
    const begin_2564 = toSafeInt(document.getElementById('begin_2564')?.value, 99999, 'จำนวนต้นปี 2564');
    const begin_2565 = toSafeInt(document.getElementById('begin_2565')?.value, 99999, 'จำนวนต้นปี 2565');
    const begin_2566 = toSafeInt(document.getElementById('begin_2566')?.value, 99999, 'จำนวนต้นปี 2566');
    const begin_2567 = toSafeInt(document.getElementById('begin_2567')?.value, 99999, 'จำนวนต้นปี 2567');
    const begin_2568 = toSafeInt(document.getElementById('begin_2568')?.value, 99999, 'จำนวนต้นปี 2568');

    const end_2564 = toSafeInt(document.getElementById('end_2564')?.value, 99999, 'จำนวนปลายปี 2564');
    const end_2565 = toSafeInt(document.getElementById('end_2565')?.value, 99999, 'จำนวนปลายปี 2565');
    const end_2566 = toSafeInt(document.getElementById('end_2566')?.value, 99999, 'จำนวนปลายปี 2566');
    const end_2567 = toSafeInt(document.getElementById('end_2567')?.value, 99999, 'จำนวนปลายปี 2567');
    const end_2568 = toSafeInt(document.getElementById('end_2568')?.value, 99999, 'จำนวนปลายปี 2568');

    const leave_2564 = toSafeInt(document.getElementById('leave_2564')?.value, 99999, 'จำนวนลาออก 2564');
    const leave_2565 = toSafeInt(document.getElementById('leave_2565')?.value, 99999, 'จำนวนลาออก 2565');
    const leave_2566 = toSafeInt(document.getElementById('leave_2566')?.value, 99999, 'จำนวนลาออก 2566');
    const leave_2567 = toSafeInt(document.getElementById('leave_2567')?.value, 99999, 'จำนวนลาออก 2567');
    const leave_2568 = toSafeInt(document.getElementById('leave_2568')?.value, 99999, 'จำนวนลาออก 2568');

    // Calculate percentage rates for each year
    function calcRate(begin, end, leave) {
        const denominator = (begin + end) / 2;
        if (denominator > 0) {
            return +((leave / denominator) * 100).toFixed(2);
        }
        return null;
    }

    const rate_2564 = calcRate(begin_2564, end_2564, leave_2564);
    const rate_2565 = calcRate(begin_2565, end_2565, leave_2565);
    const rate_2566 = calcRate(begin_2566, end_2566, leave_2566);
    const rate_2567 = calcRate(begin_2567, end_2567, leave_2567);
    const rate_2568 = calcRate(begin_2568, end_2568, leave_2568);

    // Step 2: นโยบายและบริบทภายนอก
    const related_policies = document.getElementById('related_policies')?.value.trim() || null;
    const context_challenges = document.getElementById('context_challenges')?.value.trim() || null;

    // Step 3: ข้อมูลสุขภาวะ
    const disease_diabetes = toSafeInt(document.getElementById('disease_diabetes')?.value, 99999, 'โรคเบาหวาน');
    const disease_hypertension = toSafeInt(document.getElementById('disease_hypertension')?.value, 99999, 'โรคความดันโลหิตสูง');
    const disease_cardiovascular = toSafeInt(document.getElementById('disease_cardiovascular')?.value, 99999, 'โรคหัวใจและหลอดเลือด');
    const disease_kidney = toSafeInt(document.getElementById('disease_kidney')?.value, 99999, 'โรคไต');
    const disease_liver = toSafeInt(document.getElementById('disease_liver')?.value, 99999, 'โรคตับ');
    const disease_cancer = toSafeInt(document.getElementById('disease_cancer')?.value, 99999, 'โรคมะเร็ง');
    const disease_obesity = toSafeInt(document.getElementById('disease_obesity')?.value, 99999, 'โรคอ้วน');
    const disease_other_count = toSafeInt(document.getElementById('disease_other_count')?.value, 99999, 'โรคอื่นๆ');
    const disease_other_detail = document.getElementById('disease_other_detail')?.value.trim() || null;

    // Calculate NCD total
    const ncd_count = disease_diabetes + disease_hypertension + disease_cardiovascular +
        disease_kidney + disease_liver + disease_cancer + disease_obesity + disease_other_count;

    // Sick leave (new fields)
    const sick_leave_days = toSafeInt(document.getElementById('sick_leave_days')?.value, 99999, 'วันลาป่วยรวม') || null;
    const sick_leave_avg = parseFloat(document.getElementById('sick_leave_avg')?.value) || null;

    // Clinic
    const clinic_report_type = document.querySelector('input[name="clinic_report_type"]:checked')?.value || null;
    const clinic_users_per_year = toSafeInt(document.getElementById('clinic_users_per_year')?.value, 99999, 'ผู้ใช้คลินิกต่อปี') || null;
    const clinic_top_symptoms = document.getElementById('clinic_top_symptoms')?.value.trim() || null;
    const clinic_top_medications = document.getElementById('clinic_top_medications')?.value.trim() || null;

    // Mental health (text fields)
    const mental_stress = document.getElementById('mental_stress')?.value.trim() || null;
    const mental_anxiety = document.getElementById('mental_anxiety')?.value.trim() || null;
    const mental_sleep = document.getElementById('mental_sleep')?.value.trim() || null;
    const mental_burnout = document.getElementById('mental_burnout')?.value.trim() || null;
    const mental_depression = document.getElementById('mental_depression')?.value.trim() || null;

    // Disease report type
    const disease_report_type = document.querySelector('input[name="disease_report_type"]:checked')?.value || null;

    // Sick leave report type
    const sick_leave_report_type = document.querySelector('input[name="sick_leave_report_type"]:checked')?.value || null;

    // Mental health report type
    const mental_health_report_type = document.querySelector('input[name="mental_health_report_type"]:checked')?.value || null;

    // Engagement scores by year
    const engagement_score_2568 = parseFloat(document.getElementById('engagement_score_2568')?.value) || null;
    const engagement_score_2567 = parseFloat(document.getElementById('engagement_score_2567')?.value) || null;
    const engagement_score_2566 = parseFloat(document.getElementById('engagement_score_2566')?.value) || null;
    const engagement_score_2565 = parseFloat(document.getElementById('engagement_score_2565')?.value) || null;
    const engagement_score_2564 = parseFloat(document.getElementById('engagement_score_2564')?.value) || null;
    const engagement_low_areas = document.getElementById('engagement_low_areas')?.value.trim() || null;

    // Other wellbeing surveys
    const other_wellbeing_surveys = document.getElementById('other_wellbeing_surveys')?.value.trim() || null;

    // Step 4: ระบบการบริหารและสภาพแวดล้อม
    const mentoring_system = document.querySelector('input[name="mentoring_system"]:checked')?.value || null;
    const job_rotation = document.querySelector('input[name="job_rotation"]:checked')?.value || null;
    const idp_system = document.querySelector('input[name="idp_system"]:checked')?.value || null;
    const career_path_system = document.querySelector('input[name="career_path_system"]:checked')?.value || null;

    // Training hours — แยกรายปี ข้อ 14 (2564-2568)
    const training_hours = document.getElementById('training_hours')?.value?.trim() || null;
    const training_hours_2568 = parseFloat(document.getElementById('training_hours_2568')?.value) || null;
    const training_hours_2567 = parseFloat(document.getElementById('training_hours_2567')?.value) || null;
    const training_hours_2566 = parseFloat(document.getElementById('training_hours_2566')?.value) || null;
    const training_hours_2565 = parseFloat(document.getElementById('training_hours_2565')?.value) || null;
    const training_hours_2564 = parseFloat(document.getElementById('training_hours_2564')?.value) || null;

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

    // Step 5: ทิศทาง เป้าหมาย และข้อเสนอแนะ
    // Ranking system - collect from hidden inputs
    const strategic_priority_rank1 = document.getElementById('rank_priority_1')?.value || null;
    const strategic_priority_rank2 = document.getElementById('rank_priority_2')?.value || null;
    const strategic_priority_rank3 = document.getElementById('rank_priority_3')?.value || null;
    const strategic_priority_other = document.getElementById('strategic_priority_other')?.value.trim() || null;

    // Intervention feedback
    const intervention_packages_feedback = document.getElementById('intervention_packages_feedback')?.value.trim() || null;

    // HRD plan
    const hrd_plan_url = document.getElementById('hrd_plan_url')?.value.trim() || null;
    const hrd_plan_results = document.getElementById('hrd_plan_results')?.value.trim() || null;

    // File attachments (Section 1)
    const strategy_file_path = document.getElementById('strategy_file_path')?.value || null;
    const strategy_file_url = document.getElementById('strategy_file_url')?.value || null;
    const strategy_file_name = document.getElementById('strategy_file_name')?.value || null;
    const org_structure_file_path = document.getElementById('org_structure_file_path')?.value || null;
    const org_structure_file_url = document.getElementById('org_structure_file_url')?.value || null;
    const org_structure_file_name = document.getElementById('org_structure_file_name')?.value || null;

    // File attachments (Section 5 - HRD Plan)
    const hrd_plan_file_path = document.getElementById('hrd_plan_file_path')?.value || null;
    const hrd_plan_file_url = document.getElementById('hrd_plan_file_url')?.value || null;
    const hrd_plan_file_name = document.getElementById('hrd_plan_file_name')?.value || null;

    return {
        // Metadata
        respondent_email: respondentEmail || null,
        form_version: 'ch1-v4.0',
        submitted_at: new Date().toISOString(),
        is_test: IS_TEST_MODE,
        submission_mode: IS_TEST_MODE ? 'test' : 'live',
        test_run_id: TEST_RUN_ID,

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
        type_official, type_employee, type_contract, type_other,
        turnover_count, turnover_rate,
        transfer_count, transfer_rate,

        // Section 4: ข้อมูลรายปี (ย้อนหลัง 5 ปี)
        begin_2564, begin_2565, begin_2566, begin_2567, begin_2568,
        end_2564, end_2565, end_2566, end_2567, end_2568,
        leave_2564, leave_2565, leave_2566, leave_2567, leave_2568,
        rate_2564, rate_2565, rate_2566, rate_2567, rate_2568,

        // Step 2: นโยบายและบริบท
        related_policies,
        context_challenges,

        // Step 3: สุขภาวะ
        disease_diabetes, disease_hypertension, disease_cardiovascular,
        disease_kidney, disease_liver, disease_cancer, disease_obesity,
        disease_other_count, disease_other_detail,
        disease_report_type,
        ncd_count,
        ncd_ratio_pct: (total_staff && ncd_count) ? +((ncd_count / total_staff) * 100).toFixed(2) : null,
        sick_leave_days, sick_leave_avg,
        sick_leave_report_type,
        clinic_report_type, clinic_users_per_year, clinic_top_symptoms, clinic_top_medications,
        mental_stress, mental_anxiety, mental_sleep, mental_burnout, mental_depression,
        mental_health_report_type,
        engagement_score_2568, engagement_score_2567, engagement_score_2566, engagement_score_2565, engagement_score_2564,
        engagement_low_areas,
        other_wellbeing_surveys,

        // Step 4: ระบบและสภาพแวดล้อม
        mentoring_system, job_rotation, idp_system, career_path_system,
        training_hours,
        training_hours_2568, training_hours_2567, training_hours_2566, training_hours_2565, training_hours_2564,
        digital_systems: digitalSystems.length ? digitalSystems : null,
        ergonomics_status, ergonomics_detail,

        // Step 5: ทิศทางและเป้าหมาย
        strategic_priority_rank1,
        strategic_priority_rank2,
        strategic_priority_rank3,
        strategic_priority_other,
        intervention_packages_feedback,
        hrd_plan_url, hrd_plan_results,

        // File attachments (Section 1)
        strategy_file_path,
        strategy_file_url,
        strategy_file_name,
        org_structure_file_path,
        org_structure_file_url,
        org_structure_file_name,

        // File attachments (Section 5 - HRD Plan)
        hrd_plan_file_path,
        hrd_plan_file_url,
        hrd_plan_file_name,
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
        const { error } = await ch1Sb.from(TARGET_TABLE).insert([payload]);

        if (error) throw error;

        // Success
        document.getElementById('overlay-loading').classList.add('hidden');
        document.getElementById('overlay-success').classList.remove('hidden');
        // Generate a short reference from timestamp (anon role has no SELECT policy)
        const refId = Date.now().toString(36).toUpperCase();
        document.getElementById('success-ref').textContent = `Ref: ${refId}`;
        document.getElementById('success-mode').textContent = IS_TEST_MODE
            ? `Test mode | Run ID: ${TEST_RUN_ID}`
            : '';

        // Mark files as saved to prevent cleanup
        window.formSubmitted = true;
        if (window.uploadedFiles) {
            window.uploadedFiles.clear();
        }

        // Clear draft
        localStorage.removeItem('wellbeing_ch1_draft_v3');

    } catch (err) {
        console.error('Submit error:', err);
        document.getElementById('overlay-loading').classList.add('hidden');
        document.getElementById('overlay-error').classList.remove('hidden');

        // Generate detailed error message
        const detailedError = getDetailedErrorMessage(err);
        const errorMsgEl = document.getElementById('error-msg');

        // Use white-space: pre-wrap for better formatting
        errorMsgEl.style.whiteSpace = 'pre-wrap';
        errorMsgEl.style.textAlign = 'left';
        errorMsgEl.textContent = detailedError;
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
    // Bug fix: restore respondentEmail variable (not just DOM) to prevent null on submit
    if (data.respondent_email) {
        respondentEmail = data.respondent_email;
    }

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
    ['mentoring_system', 'job_rotation', 'idp_system', 'career_path_system', 'ergonomics_status', 'clinic_report_type', 'disease_report_type', 'sick_leave_report_type', 'mental_health_report_type'].forEach(name => {
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

    // Restore file attachments preview
    if (data.strategy_file_path && data.strategy_file_url) {
        document.getElementById('strategy_file_path').value = data.strategy_file_path;
        document.getElementById('strategy_file_url').value = data.strategy_file_url;
        document.getElementById('strategy_file_name').value = data.strategy_file_name || '';
        if (window.showFilePreview) {
            window.showFilePreview('strategy', {
                path: data.strategy_file_path,
                publicUrl: data.strategy_file_url,
                fileName: data.strategy_file_name || 'ไฟล์ PDF',
                fileSize: 0
            });
        }
    }

    if (data.org_structure_file_path && data.org_structure_file_url) {
        document.getElementById('org_structure_file_path').value = data.org_structure_file_path;
        document.getElementById('org_structure_file_url').value = data.org_structure_file_url;
        document.getElementById('org_structure_file_name').value = data.org_structure_file_name || '';
        if (window.showFilePreview) {
            window.showFilePreview('org', {
                path: data.org_structure_file_path,
                publicUrl: data.org_structure_file_url,
                fileName: data.org_structure_file_name || 'ไฟล์ PDF',
                fileSize: 0
            });
        }
    }

    // Restore HRD file attachment preview
    if (data.hrd_plan_file_path && data.hrd_plan_file_url) {
        document.getElementById('hrd_plan_file_path').value = data.hrd_plan_file_path;
        document.getElementById('hrd_plan_file_url').value = data.hrd_plan_file_url;
        document.getElementById('hrd_plan_file_name').value = data.hrd_plan_file_name || '';
        if (window.showFilePreview) {
            window.showFilePreview('hrd', {
                path: data.hrd_plan_file_path,
                publicUrl: data.hrd_plan_file_url,
                fileName: data.hrd_plan_file_name || 'ไฟล์ PDF',
                fileSize: 0
            });
        }
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
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.className = `fixed bottom-6 right-6 px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all duration-300 ${type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
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
        input.addEventListener('change', function () {
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

// Export for pdf-upload.js
window.ch1Sb = ch1Sb;
