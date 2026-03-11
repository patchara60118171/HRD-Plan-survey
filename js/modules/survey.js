// ========================================
// Survey Module - CH1 Form + Questions
// ========================================

// ========================================
// Survey Questions Data (from questions.js)
// ========================================

const SECTIONS_ORDER = [
    // 1. Physical (กาย)
    'personal',
    'consumption',
    'nutrition',
    'activity',
    // 2. Mental (ใจ)
    'mental',
    // 3. Social (สังคม)
    'loneliness',
    // 4. Environment (แวดล้อม)
    'safety',
    'environment'
];

const SURVEY_DATA = {
    // ----------------------------------------
    // Part 1: Personal Info & Body (Physical)
    // ----------------------------------------
    personal: {
        title: 'ส่วนที่ 1 ข้อมูลส่วนบุคคล และการตรวจวัดร่างกาย',
        type: 'physical',
        description: 'ข้อมูลทั่วไปและสุขภาพเบื้องต้น',
        subsections: [
            {
                title: 'ข้อมูลส่วนบุคคล',
                questions: [
                    {
                        id: 'title',
                        text: 'คำนำหน้า',
                        type: 'radio',
                        options: ['นาย', 'นาง', 'นางสาว', 'อื่นๆ'],
                        required: true
                    },
                    { id: 'name', text: 'ชื่อ-สกุล', type: 'text', placeholder: 'ระบุชื่อและนามสกุล', required: true },
                    {
                        id: 'gender',
                        text: 'เพศ',
                        type: 'radio',
                        options: ['ชาย', 'หญิง', 'LGBTQ+'],
                        required: true
                    },
                    { id: 'age', text: 'อายุ (ปี)', type: 'number', required: true },
                    {
                        id: 'org_type',
                        text: 'ประเภทหน่วยงาน',
                        type: 'radio',
                        options: ['นโยบาย', 'ปฏิบัติการ', 'สนับสนุน'],
                        required: true
                    },
                    {
                        id: 'job',
                        text: 'ตำแหน่งงานปัจจุบัน',
                        type: 'radio',
                        options: [
                            'ปฏิบัติการ',
                            'ปฏิบัติงาน',
                            'ชำนาญการ',
                            'ชำนาญงาน',
                            'ชำนาญการพิเศษ',
                            'หัวหน้า',
                            'ผู้บริหารระดับกลาง',
                            { label: 'อื่นๆ', value: 'other', hasInput: true }
                        ],
                        required: true
                    },
                    { id: 'job_duration', text: 'ระยะเวลาที่ทำงานในตำแหน่งปัจจุบัน (ปี)', type: 'number', required: true },
                    {
                        id: 'activity_org',
                        text: 'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพของพนักงานในองค์กรหรือไม่',
                        type: 'radio',
                        options: ['เคย', 'ไม่เคย'],
                        required: true
                    },
                    {
                        id: 'activity_thaihealth',
                        text: 'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพจาก สสส. หรือไม่',
                        type: 'radio',
                        options: ['เคย', 'ไม่เคย'],
                        required: true
                    },
                    {
                        id: 'diseases',
                        text: 'ท่านมีปัญหาสุขภาพเหล่านี้หรือไม่',
                        type: 'checkbox',
                        options: ['เบาหวาน', 'ความดันโลหิตสูง', 'โรคหัวใจและหลอดเลือด', 'โรคไต', 'โรคตับ', 'มะเร็ง', 'ไม่มี'],
                        required: true
                    }
                ]
            },
            {
                title: 'ข้อมูลร่างกายเบื้องต้น',
                questions: [
                    { id: 'height', text: 'ส่วนสูง (เซนติเมตร)', type: 'number', required: true },
                    { id: 'weight', text: 'น้ำหนัก (กิโลกรัม)', type: 'number', required: true },
                    { id: 'waist', text: 'เส้นรอบเอว (เซนติเมตร)', type: 'number', required: true }
                ]
            }
        ]
    },
    
    // Add other sections (consumption, nutrition, etc.) here...
    // For brevity, I'm showing just the structure
};

// ========================================
// CH1 Form Logic (from ch1-form.js)
// ========================================

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
// ORGANIZATION MAPPING
// =============================================
const ORG_MAP = {
    'nesdc': 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
    'dss': 'กรมวิทยาศาสตร์บริการ',
    'tmd': 'กรมอุตุนิยมวิทยา',
    'probation': 'กรมคุมประพฤติ',
    'dmh': 'กรมสุขภาพจิต',
    'onep': 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    'nrct': 'สำนักงานการวิจัยแห่งชาติ',
    'opdc': 'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',
    'rid': 'กรมชลประทาน',
    'doh': 'กองฝึกอบรม กรมทางหลวง',
    'mots': 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
    'tpso': 'สำนักงานนโยบายและยุทธศาสตร์การค้า',
    'dcp': 'กรมส่งเสริมวัฒนธรรม',
    'acfs': 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ'
};

// =============================================
// FORM FUNCTIONS
// =============================================

function parseUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const orgCode = params.get('org');
    
    if (!orgCode || !ORG_MAP[orgCode]) {
        if (orgCode) console.warn(`Unknown organization code: ${orgCode}`);
        return;
    }
    
    const orgName = ORG_MAP[orgCode];
    
    // Show badges on landing page
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
    
    // Auto-select organization in dropdown
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
            orgSelect.add(newOption);
        }
        orgSelect.value = orgName;
    }
}

function confirmEmailAndStart() {
    const emailInput = document.getElementById('respondent_email');
    const email = emailInput.value.trim();
    
    if (!email) {
        showToast('กรุณากรอกอีเมลก่อนเริ่มทำแบบสำรวจ', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
        return;
    }
    
    respondentEmail = email;
    showStep(1);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show current step
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    // Update progress
    updateProgress(step);
    
    // Update navigation
    updateNavigation(step);
    
    currentStep = step;
}

function updateProgress(step) {
    const progressContainer = document.getElementById('form-progress');
    const progressFill = document.getElementById('progress-bar');
    const stepLabel = document.getElementById('step-label');
    const stepPct = document.getElementById('step-pct');
    
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
    
    const progress = (step / TOTAL_STEPS) * 100;
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (stepLabel) {
        stepLabel.textContent = `ส่วนที่ ${step} จาก ${TOTAL_STEPS}`;
    }
    
    if (stepPct) {
        stepPct.textContent = `${Math.round(progress)}%`;
    }
}

function updateNavigation(step) {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const formNav = document.getElementById('form-nav');
    
    if (formNav) {
        formNav.style.display = 'flex';
    }
    
    if (prevBtn) {
        if (step === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }
    }
    
    if (nextBtn) {
        if (step === TOTAL_STEPS) {
            nextBtn.textContent = 'ส่งข้อมูล';
            nextBtn.onclick = submitForm;
        } else {
            nextBtn.textContent = 'ถัดไป';
            nextBtn.onclick = nextStep;
        }
    }
}

function nextStep() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        showStep(currentStep + 1);
    }
}

function prevStep() {
    showStep(currentStep - 1);
}

function validateCurrentStep() {
    // Add validation logic here
    return true;
}

function saveCurrentStepData() {
    // Add save logic here
    console.log('Saving step data...');
}

async function submitForm() {
    try {
        const formData = collectAllData();
        
        // Add metadata
        formData.respondent_email = respondentEmail;
        formData.submitted_at = new Date().toISOString();
        formData.is_test = IS_TEST_MODE;
        formData.test_run_id = TEST_RUN_ID;
        
        const { data, error } = await ch1Sb
            .from(TARGET_TABLE)
            .insert([formData]);
        
        if (error) throw error;
        
        showSuccessOverlay();
    } catch (error) {
        console.error('Submit error:', error);
        showErrorOverlay(error.message);
    }
}

function collectAllData() {
    // Collect all form data
    const formData = {};
    
    // Collect from all form steps
    document.querySelectorAll('.form-step').forEach(step => {
        const stepInputs = step.querySelectorAll('input, select, textarea');
        stepInputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!formData[input.name]) {
                    formData[input.name] = [];
                }
                if (input.checked) {
                    formData[input.name].push(input.value);
                }
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.id] = input.value;
            }
        });
    });
    
    return formData;
}

function showSuccessOverlay() {
    const overlay = document.getElementById('overlay-success');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function showErrorOverlay(message) {
    const overlay = document.getElementById('overlay-error');
    const errorMsg = document.getElementById('error-msg');
    
    if (overlay && errorMsg) {
        errorMsg.textContent = message;
        overlay.classList.remove('hidden');
    }
}

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    parseUrlParameters();
    
    // Setup event listeners
    const emailInput = document.getElementById('respondent_email');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmEmailAndStart();
            }
        });
    }
    
    // Show initial step
    showStep(0);
});

// =============================================
// EXPORTS
// =============================================

window.SurveyModule = {
    SECTIONS_ORDER,
    SURVEY_DATA,
    showStep,
    nextStep,
    prevStep,
    submitForm
};
