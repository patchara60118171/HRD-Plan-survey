// =============================================
// js/ch1-form.js — HRD Chapter 1 Form v2.1
// 7-step form logic, validation, auto-save
// =============================================

const ch1Sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TARGET_TABLE = 'hrd_ch1_responses';
const TOTAL_STEPS = 8; // steps 0–7 (0=landing, 1–7=form steps)
let currentStep = 0;
let lastPayload = null;
let prioritySelected = []; // [{id, label}]
let dragSrcIdx = null;
let respondentEmail = ''; // ← NEW: email from landing page

// =============================================
// STATIC DATA
// =============================================
const SUPPORT_SYSTEMS = [
    { id: 'mentoring_system', label: '4.1 ระบบพี่เลี้ยง (Mentoring)' },
    { id: 'job_rotation', label: '4.2 ระบบหมุนเวียนงาน (Job Rotation)' },
    { id: 'idp_system', label: '4.3 การจัดทำแผนพัฒนารายบุคคล (IDP)' },
    { id: 'career_path_system', label: '4.5 เส้นทางความก้าวหน้า (Career Path)' },
];
const SUPPORT_OPTIONS = [
    { v: 'full', l: 'ครบทุกตำแหน่ง' },
    { v: 'partial', l: 'มีบางตำแหน่ง' },
    { v: 'none', l: 'ไม่มี' },
];
const TRAINING_OPTIONS = [
    { v: 'over40', l: 'มากกว่า 40 ชั่วโมง' },
    { v: '30_40', l: '30–40 ชั่วโมง' },
    { v: '20_29', l: '20–29 ชั่วโมง' },
    { v: '10_19', l: '10–19 ชั่วโมง' },
    { v: 'under10', l: 'ต่ำกว่า 10 ชั่วโมง' },
    { v: 'no_data', l: 'ไม่มีข้อมูล' },
];
const ERGONOMICS_OPTIONS = [
    { v: 'none', l: 'ยังไม่มี' },
    { v: 'planned', l: 'มีแผนแต่ยังไม่ดำเนินการ' },
    { v: 'in_progress', l: 'อยู่ระหว่างดำเนินการ' },
    { v: 'done', l: 'ดำเนินการแล้ว' },
];
const DIGITAL_SYSTEMS = [
    { v: 'e_doc', l: 'ระบบเอกสารอิเล็กทรอนิกส์' },
    { v: 'e_sign', l: 'ระบบลงนามอิเล็กทรอนิกส์ (E-Signature)' },
    { v: 'cloud', l: 'ระบบ Cloud' },
    { v: 'hr_digital', l: 'ระบบ HR Digital' },
    { v: 'health_db', l: 'ระบบฐานข้อมูลสุขภาพ' },
    { v: 'none', l: 'ไม่มีระบบดังกล่าว' },
    { v: 'other', l: 'อื่นๆ' },
];
const HRD_OPPORTUNITIES = [
    { v: 'strategic_align', l: 'การเพิ่มความสอดคล้องเชิงยุทธศาสตร์ของ HRD' },
    { v: 'tna', l: 'การวิเคราะห์ความต้องการพัฒนา (TNA)' },
    { v: 'eval', l: 'การติดตามและประเมินผลหลังการพัฒนา' },
    { v: 'wellbeing', l: 'การบูรณาการสุขภาวะเข้ากับแผน HRD' },
    { v: 'career', l: 'การพัฒนาเส้นทางความก้าวหน้าในสายอาชีพ' },
    { v: 'leader', l: 'การพัฒนาศักยภาพผู้นำระดับต้นและกลาง' },
    { v: 'digital', l: 'การเพิ่มประสิทธิภาพด้วยดิจิทัล/E-learning' },
    { v: 'other', l: 'อื่นๆ' },
];
const STRATEGY_TOPICS = [
    { id: 'A', label: 'การเพิ่มประสิทธิภาพการให้บริการประชาชน' },
    { id: 'B', label: 'การพัฒนาศักยภาพด้านดิจิทัล' },
    { id: 'C', label: 'การพัฒนาผู้นำรุ่นใหม่' },
    { id: 'D', label: 'การลดอัตราการลาป่วย' },
    { id: 'E', label: 'การลดอัตราการลาออก' },
    { id: 'F', label: 'อื่นๆ' },
];
const CURRENT_YEAR = 2568;

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Build step-dot labels (replaces document.write approach)
    const STEP_NAMES = ['ข้อมูลพื้นฐาน', 'สุขภาวะกาย', 'สุขภาวะจิต', 'ระบบสนับสนุน', 'สภาพแวดล้อม', 'ระบบ HRD', 'ยุทธศาสตร์'];
    const dotsRow = document.getElementById('step-dots-row');
    if (dotsRow) {
        dotsRow.innerHTML = STEP_NAMES.map((n, i) =>
            `<span class="step-dot text-xs text-slate-400 text-center" style="width:${100 / 7}%;${i === 0 ? 'display:none;' : ''}" id="dot-${i}">${i + 1}</span>`
        ).join('');
    }
    buildSickLeaveTable();
    buildEngagementTable();
    buildSupportSystems();
    buildTrainingOptions();
    buildErgonomicsOptions();
    buildDigitalSystems();
    buildHrdOpportunities();
    buildPriorityChips();
    setupAgeWatcher();
    setupNcdWatcher();
    updateUI();

    // Setup input guards AFTER all elements are built
    setTimeout(() => {
        setupNegativeGuards();
        console.log('setupNegativeGuards called after timeout');
    }, 100);

    // Setup email input Enter key handler
    const emailInput = document.getElementById('respondent_email');
    if (emailInput) {
        emailInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') confirmEmailAndStart();
        });
    }

    // Hide all steps except step-0 (landing page)
    document.querySelectorAll('.form-step').forEach(el => {
        if (el.id !== 'step-0') el.classList.remove('active');
    });

    startAutoSave();
});

// =============================================
// DYNAMIC UI BUILDERS
// =============================================
function buildSickLeaveTable() {
    const tbody = document.getElementById('sick-leave-tbody');
    let rows = '';
    for (let i = 0; i < 5; i++) {
        const yr = CURRENT_YEAR - i;
        rows += `<tr class="border-b border-slate-100">
      <td class="py-2 pr-3 text-slate-600 font-medium">${yr}</td>
      <td class="py-2 pr-3"><input type="number" id="sick_days_${yr}" min="0" placeholder="0" class="sick-input w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></td>
      <td class="py-2 pr-3"><input type="number" id="sick_avg_${yr}" min="0" step="0.1" placeholder="0.0" class="sick-input w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></td>
      <td class="py-2 text-center"><input type="checkbox" id="sick_na_${yr}" class="sick-na w-4 h-4 accent-primary" onchange="toggleSickRow(${yr}, this.checked)"/></td>
    </tr>`;
    }
    tbody.innerHTML = rows;
}

function toggleSickRow(yr, disabled) {
    ['sick_days_', 'sick_avg_'].forEach(prefix => {
        const el = document.getElementById(prefix + yr);
        el.disabled = disabled;
        el.classList.toggle('opacity-40', disabled);
    });
}

function buildEngagementTable() {
    const tbody = document.getElementById('engagement-tbody');
    let rows = '';
    for (let i = 0; i < 5; i++) {
        const yr = CURRENT_YEAR - i;
        rows += `<tr class="border-b border-slate-100">
      <td class="py-2 pr-3 text-slate-600 font-medium">${yr}</td>
      <td class="py-2 pr-3"><input type="number" id="eng_score_${yr}" min="0" max="100" placeholder="0–100" class="eng-input w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></td>
      <td class="py-2 pr-3"><input type="text" id="eng_low_${yr}" placeholder="เช่น ค่าตอบแทน ความก้าวหน้า" class="eng-input w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></td>
      <td class="py-2 text-center"><input type="checkbox" id="eng_na_${yr}" class="w-4 h-4 accent-primary" onchange="toggleEngRow(${yr}, this.checked)"/></td>
    </tr>`;
    }
    tbody.innerHTML = rows;
}

function toggleEngRow(yr, disabled) {
    ['eng_score_', 'eng_low_'].forEach(prefix => {
        const el = document.getElementById(prefix + yr);
        el.disabled = disabled;
        el.classList.toggle('opacity-40', disabled);
    });
}

function buildSupportSystems() {
    const container = document.getElementById('support-systems');
    container.innerHTML = SUPPORT_SYSTEMS.map(sys => `
    <div>
      <h3 class="text-sm font-bold text-slate-700 mb-2">${sys.label}</h3>
      <div class="flex flex-wrap gap-2" id="grp-${sys.id}">
        ${SUPPORT_OPTIONS.map(opt => `
          <label class="radio-card flex-1 min-w-[120px]">
            <input type="radio" name="${sys.id}" value="${opt.v}" class="hidden"/>
            <div class="radio-inner border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center cursor-pointer hover:border-primary transition">${opt.l}</div>
          </label>`).join('')}
      </div>
      <p class="text-red-500 text-xs mt-1 hidden" id="err-${sys.id}">กรุณาเลือก</p>
    </div>
  `).join('');
    // Radio visual
    document.querySelectorAll('.radio-card input').forEach(inp => {
        inp.addEventListener('change', () => {
            document.querySelectorAll(`input[name="${inp.name}"]`).forEach(r => {
                r.closest('.radio-card').querySelector('.radio-inner').classList.remove('border-primary', 'bg-primary-light', 'text-primary', 'font-semibold');
            });
            inp.closest('.radio-card').querySelector('.radio-inner').classList.add('border-primary', 'bg-primary-light', 'text-primary', 'font-semibold');
        });
    });
}

function buildTrainingOptions() {
    const grp = document.getElementById('training-hours-group');
    grp.innerHTML = TRAINING_OPTIONS.map(opt => `
    <label class="radio-card">
      <input type="radio" name="training_hours_range" value="${opt.v}" class="hidden"/>
      <div class="radio-inner border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center cursor-pointer hover:border-primary transition">${opt.l}</div>
    </label>`).join('');
    grp.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', () => {
            grp.querySelectorAll('.radio-inner').forEach(d => d.classList.remove('border-primary', 'bg-primary-light', 'text-primary', 'font-semibold'));
            inp.closest('.radio-card').querySelector('.radio-inner').classList.add('border-primary', 'bg-primary-light', 'text-primary', 'font-semibold');
            document.getElementById('err-training').classList.add('hidden');
        });
    });
}

function buildErgonomicsOptions() {
    const grp = document.getElementById('ergonomics-group');
    grp.innerHTML = ERGONOMICS_OPTIONS.map(opt => `
    <label class="radio-card flex">
      <input type="radio" name="ergonomics_status" value="${opt.v}" class="hidden" onchange="handleErgoChange('${opt.v}')"/>
      <div class="radio-inner flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm cursor-pointer hover:border-primary transition">${opt.l}</div>
    </label>`).join('');
    grp.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', () => {
            grp.querySelectorAll('.radio-inner').forEach(d => d.classList.remove('border-primary', 'bg-primary-light', 'text-primary', 'font-semibold'));
            inp.closest('.radio-card').querySelector('.radio-inner').classList.add('border-primary', 'bg-primary-light', 'text-primary', 'font-semibold');
        });
    });
}

function handleErgoChange(val) {
    const wrap = document.getElementById('ergonomics-detail-wrap');
    wrap.classList.toggle('hidden', val === 'none');
    document.getElementById('err-ergonomics').classList.add('hidden');
}

function buildDigitalSystems() {
    const grp = document.getElementById('digital-systems-group');
    grp.innerHTML = DIGITAL_SYSTEMS.map(opt => `
    <label class="cb-card flex items-center gap-3 p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-accent transition cb-inner">
      <input type="checkbox" value="${opt.v}" class="digital-cb w-4 h-4 accent-accent" onchange="handleDigitalChange()"/>
      <span class="text-sm">${opt.l}</span>
    </label>`).join('');
}

function handleDigitalChange() {
    const hasOther = [...document.querySelectorAll('.digital-cb')].some(c => c.value === 'other' && c.checked);
    document.getElementById('digital-other-wrap').classList.toggle('hidden', !hasOther);
    document.querySelectorAll('.digital-cb').forEach(cb => {
        cb.closest('.cb-card').classList.toggle('border-accent', cb.checked);
        cb.closest('.cb-card').classList.toggle('bg-accent-light', cb.checked);
    });
}

function buildHrdOpportunities() {
    const grp = document.getElementById('hrd-opportunities-group');
    grp.innerHTML = HRD_OPPORTUNITIES.map(opt => `
    <label class="cb-card flex items-center gap-3 p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-accent transition cb-inner">
      <input type="checkbox" value="${opt.v}" class="hrd-opp-cb w-4 h-4 accent-accent" onchange="handleHrdOppChange()"/>
      <span class="text-sm">${opt.l}</span>
    </label>`).join('');
}

function handleHrdOppChange() {
    const hasOther = [...document.querySelectorAll('.hrd-opp-cb')].some(c => c.value === 'other' && c.checked);
    document.getElementById('hrd-opp-other-wrap').classList.toggle('hidden', !hasOther);
    document.querySelectorAll('.hrd-opp-cb').forEach(cb => {
        cb.closest('.cb-card').classList.toggle('border-accent', cb.checked);
        cb.closest('.cb-card').classList.toggle('bg-accent-light', cb.checked);
    });
}

function buildPriorityChips() {
    const grp = document.getElementById('priority-chips');
    grp.innerHTML = STRATEGY_TOPICS.map(t => `
    <button type="button" class="priority-chip relative border-2 border-slate-300 rounded-full px-4 py-2 text-sm font-medium hover:border-primary transition" data-id="${t.id}" data-label="${t.label}" onclick="togglePriority('${t.id}','${t.label}')">
      <span class="rank-badge absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full items-center justify-center font-bold"></span>
      ${t.label}
    </button>`).join('');
}

function togglePriority(id, label) {
    const chip = document.querySelector(`.priority-chip[data-id="${id}"]`);
    const idx = prioritySelected.findIndex(p => p.id === id);
    if (idx >= 0) {
        prioritySelected.splice(idx, 1);
        chip.classList.remove('selected');
    } else {
        if (prioritySelected.length >= 3) { showToast('เลือกได้ไม่เกิน 3 ประเด็น'); return; }
        prioritySelected.push({ id, label });
        chip.classList.add('selected');
    }
    document.getElementById('strategic-other-wrap').classList.toggle('hidden', !prioritySelected.some(p => p.id === 'F'));
    updatePriorityRanks();
    document.getElementById('err-priority').classList.add('hidden');
}

function updatePriorityRanks() {
    // Update rank badges on chips
    document.querySelectorAll('.priority-chip').forEach(chip => {
        const i = prioritySelected.findIndex(p => p.id === chip.dataset.id);
        const badge = chip.querySelector('.rank-badge');
        if (i >= 0) { badge.textContent = i + 1; badge.style.display = 'inline-flex'; }
        else { badge.style.display = 'none'; }
    });

    const section = document.getElementById('priority-rank-section');
    const list = document.getElementById('priority-rank-list');
    if (prioritySelected.length === 0) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');
    list.innerHTML = prioritySelected.map((p, i) => `
    <div class="flex items-center gap-3 bg-slate-50 rounded-xl p-3 cursor-grab" draggable="true"
      ondragstart="dragStart(${i})" ondragover="dragOver(event,${i})" ondrop="dropItem(${i})" ondragend="dragEnd()">
      <span class="w-7 h-7 bg-primary text-white text-sm rounded-full flex items-center justify-center font-bold flex-shrink-0">${i + 1}</span>
      <span class="text-sm font-medium text-slate-700">${p.label}</span>
      <span class="ml-auto text-slate-400 text-xs">☰ ลาก</span>
    </div>`).join('');
}

function dragStart(i) { dragSrcIdx = i; }
function dragOver(e, i) { e.preventDefault(); }
function dropItem(i) {
    if (dragSrcIdx === i) return;
    const moved = prioritySelected.splice(dragSrcIdx, 1)[0];
    prioritySelected.splice(i, 0, moved);
    updatePriorityRanks();
}
function dragEnd() { dragSrcIdx = null; }

// =============================================
// AGE & NCD WATCHERS
// =============================================
function setupAgeWatcher() {
    const ageIds = ['age_u30', 'age_31_40', 'age_41_50', 'age_51_60', 'age_over60'];
    const allIds = [...ageIds, 'total_staff'];
    allIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', checkAgeSum);
            el.addEventListener('change', checkAgeSum);
        }
    });
}
function checkAgeSum() {
    const total = parseInt(document.getElementById('total_staff').value) || 0;
    const ageFields = ['age_u30', 'age_31_40', 'age_41_50', 'age_51_60', 'age_over60'];
    const sum = ageFields.reduce((s, id) => s + (parseInt(document.getElementById(id).value) || 0), 0);
    document.getElementById('age-total').textContent = sum;
    document.getElementById('age-sum-warn').classList.toggle('hidden', total === 0 || sum <= total);
}

function setupNcdWatcher() {
    document.querySelectorAll('.ncd-field').forEach(el => el.addEventListener('input', updateNcdTotal));
}
function updateNcdTotal() {
    const ncdIds = ['disease_diabetes', 'disease_hypertension', 'disease_cardiovascular', 'disease_kidney', 'disease_liver', 'disease_cancer', 'disease_obesity', 'disease_other_count'];
    const sum = ncdIds.reduce((s, id) => s + Math.max(0, parseInt(document.getElementById(id)?.value) || 0), 0);
    document.getElementById('ncd-total').textContent = sum;
}

// Clamp all number inputs and strip leading zeros
function setupNegativeGuards() {
    // Target all number inputs, not just min="0"
    document.querySelectorAll('input[type="number"]').forEach(el => {
        el.addEventListener('change', () => {
            const min = parseFloat(el.getAttribute('min')) || 0;
            if (parseFloat(el.value) < min) el.value = min;
            // Strip leading zeros
            if (el.value !== '' && el.value !== '0') {
                el.value = parseInt(el.value, 10) || 0;
            }
        });
        // Also strip leading zeros on input
        el.addEventListener('input', () => {
            if (el.value.length > 1 && el.value.startsWith('0')) {
                el.value = el.value.replace(/^0+/, '');
                if (el.value === '') el.value = '0';
            }
        });
    });
}

// =============================================
// EMAIL GATE — Landing Page
// =============================================
function confirmEmailAndStart() {
    const input = document.getElementById('respondent_email');
    const errEl = document.getElementById('email-error-msg');
    const btn = document.getElementById('btn-confirm-email');
    const email = input.value.trim().toLowerCase();

    // Clear error
    errEl.textContent = '';

    // ── Validate ───────────────────────────────────
    if (!email) {
        errEl.textContent = 'กรุณากรอกอีเมลของท่าน';
        input.focus();
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        errEl.textContent = 'รูปแบบอีเมลไม่ถูกต้อง เช่น name@mail.com';
        input.focus();
        return;
    }

    // ── Valid ───────────────────────────────────
    respondentEmail = email;
    btn.disabled = true;
    btn.textContent = 'กำลังดำเนินการ...';

    // ① บันทึกร่าง (silent — ไม่ block flow หลัก ถ้า fail ก็ข้ามไป)
    try {
        const draft = JSON.parse(localStorage.getItem('ch1_draft') || '{}');
        draft.respondent_email = email;
        localStorage.setItem('ch1_draft', JSON.stringify(draft));
    } catch (e) {
        // localStorage ไม่พร้อม — ข้ามไปเงียบๆ ไม่แสดง error ไม่หยุด flow
        console.warn('localStorage unavailable (private mode?):', e.message);
    }

    // ② ไป Step 1 เสมอ (ไม่ว่า localStorage จะ fail หรือไม่)
    setTimeout(() => {
        // Force hide step-0
        const step0 = document.getElementById('step-0');
        if (step0) {
            step0.classList.remove('active');
            step0.style.display = 'none';
        }

        showStep(1); // Show Step 1
        btn.disabled = false;
        btn.textContent = 'ยืนยันอีเมล →';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 350);
}

// Helper: Show specific step
function showStep(stepNum) {
    currentStep = stepNum; // Use stepNum directly to match data-step attribute
    document.querySelectorAll('.form-step').forEach((el) => {
        el.classList.toggle('active', parseInt(el.dataset.step) === currentStep);
    });
    if (currentStep === TOTAL_STEPS) buildSummary(); // Step 7 (index 6) is last
    updateUI();
}

// =============================================
// NAVIGATION
// =============================================
function nextStep() {
    console.log('nextStep called, currentStep:', currentStep);

    if (!validateStep(currentStep)) {
        console.log('Validation failed, staying on step', currentStep);
        return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
        currentStep++;
        console.log('Moving to step:', currentStep);
        if (currentStep === TOTAL_STEPS - 1) buildSummary(); // step 7 = summary
        updateUI();
    } else {
        handleSubmit(); // only on step 7
    }
}
function prevStep() {
    if (currentStep > 1) { currentStep--; updateUI(); }
}

function updateUI() {
    // FIX 3: Explicitly manage step-0 visibility first
    const step0 = document.getElementById('step-0');
    if (step0) {
        step0.style.display = currentStep === 0 ? 'block' : 'none';
        step0.classList.toggle('active', currentStep === 0);
    }

    // Toggle active + explicit display on all form-step panels (FIX 4)
    document.querySelectorAll('.form-step').forEach(el => {
        if (el === step0) return; // already handled above
        const isActive = parseInt(el.dataset.step) === currentStep;
        el.classList.toggle('active', isActive);
        el.style.display = isActive ? 'block' : 'none';
    });

    // Show/hide nav bar and progress bar based on landing state
    const isLanding = currentStep === 0;
    const navBar = document.getElementById('form-nav');
    const progressWrap = document.getElementById('form-progress');
    if (navBar) navBar.style.display = isLanding ? 'none' : 'flex';
    if (progressWrap) progressWrap.style.display = isLanding ? 'none' : 'block';
    if (isLanding) return; // skip rest for landing

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    const btnNext = document.getElementById('btn-next');
    if (!btnNext) return;
    const isLastStep = currentStep === TOTAL_STEPS - 1;
    if (isLastStep) {
        btnNext.textContent = 'ยืนยันและส่งข้อมูล ✅';
        btnNext.className = 'px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition flex items-center gap-2 shadow-sm';
    } else {
        btnNext.innerHTML = 'ถัดไป →';
        btnNext.className = 'px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition flex items-center gap-2 shadow-sm';
    }
    // Progress: steps 1–7 only (exclude landing)
    const formStep = currentStep; // 1–7
    const pct = Math.round((formStep / (TOTAL_STEPS - 1)) * 100);
    const progressBar = document.getElementById('progress-bar');
    const stepLabel = document.getElementById('step-label');
    const stepPct = document.getElementById('step-pct');
    if (progressBar) progressBar.style.width = pct + '%';
    if (stepLabel) stepLabel.textContent = `ส่วนที่ ${formStep} จาก ${TOTAL_STEPS - 1}`;
    if (stepPct) stepPct.textContent = pct + '%';
    document.querySelectorAll('[id^="dot-"]').forEach((el, i) => {
        el.className = `step-dot text-xs text-center ${i < formStep ? 'text-accent font-bold' : i === formStep ? 'text-primary font-bold' : 'text-slate-400'}`;
        el.style.width = `${100 / (TOTAL_STEPS - 1)}%`;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// VALIDATION
// =============================================
function validateStep(step) {
    // step 0 = email landing (validated by confirmEmailAndStart, skip here)
    // step 1 = org info,  step 2 = physical, step 3 = mental/movement
    // step 4 = support,   step 5 = environment, step 6 = HRD, step 7 = strategy
    switch (step) {
        case 0: return true;              // email landing — already validated
        case 1: return validateStep1();   // organization required fields
        case 2: return true;              // physical — optional
        case 3: return validateStep3();   // turnover range check
        case 4: return validateStep4();   // support systems + training required
        case 5: return validateStep5();   // ergonomics required
        case 6: return true;              // HRD docs — optional
        case 7: return validateStep7();   // strategic priority required
        default: return true;
    }
}
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }

function validateStep1() {
    console.log('validateStep1 called');
    let ok = true;

    const orgEl = document.getElementById('organization');
    const orgValue = orgEl ? orgEl.value : '';
    console.log('organization value:', orgValue);

    if (!orgValue || orgValue === '') {
        console.log('FAIL: organization empty');
        show('err-org');
        ok = false;
    } else {
        hide('err-org');
    }

    const staffEl = document.getElementById('total_staff');
    const staffValue = staffEl ? parseInt(staffEl.value) : 0;
    console.log('total_staff value:', staffValue);

    if (!staffValue || staffValue < 1) {
        console.log('FAIL: total_staff invalid');
        show('err-staff');
        ok = false;
    } else {
        hide('err-staff');
    }

    console.log('validateStep1 result:', ok);
    return ok;
}
function validateStep2() {
    // Step 2 (สุขภาวะทางกาย) - optional fields, always pass
    return true;
}
function validateStep3() {
    let ok = true;
    const t = parseFloat(document.getElementById('turnover_rate').value);
    if (document.getElementById('turnover_rate').value !== '' && (t < 0 || t > 100)) { show('err-turnover'); ok = false; } else hide('err-turnover');
    const r = parseFloat(document.getElementById('transfer_rate').value);
    if (document.getElementById('transfer_rate').value !== '' && (r < 0 || r > 100)) { show('err-transfer'); ok = false; } else hide('err-transfer');
    return ok;
}
function validateStep4() {
    let ok = true;
    SUPPORT_SYSTEMS.forEach(sys => {
        const checked = document.querySelector(`input[name="${sys.id}"]:checked`);
        if (!checked) { show(`err-${sys.id}`); ok = false; } else hide(`err-${sys.id}`);
    });
    if (!document.querySelector('input[name="training_hours_range"]:checked')) { show('err-training'); ok = false; } else hide('err-training');
    return ok;
}
function validateStep5() {
    if (!document.querySelector('input[name="ergonomics_status"]:checked')) { show('err-ergonomics'); return false; }
    hide('err-ergonomics');
    return true;
}
function validateStep6() {
    // Step 6 (ระบบ HRD) - optional fields (URLs), always pass
    return true;
}
function validateStep7() {
    if (prioritySelected.length === 0) { show('err-priority'); return false; }
    if (prioritySelected.length > 3) { show('err-priority'); return false; }
    hide('err-priority');
    return true;
}

// =============================================
// COLLECT ALL DATA
// =============================================
function collectAllData() {
    // Step 1
    const organization = document.getElementById('organization').value;
    const vision_mission = document.getElementById('vision_mission').value.trim();
    const strategic_plan_summary = document.getElementById('strategic_plan_summary').value.trim();
    const total_staff = parseInt(document.getElementById('total_staff').value) || null;
    const org_chart_url = document.getElementById('org_chart_url').value.trim() || null;
    const age_u30 = parseInt(document.getElementById('age_u30').value) || 0;
    const age_31_40 = parseInt(document.getElementById('age_31_40').value) || 0;
    const age_41_50 = parseInt(document.getElementById('age_41_50').value) || 0;
    const age_51_60 = parseInt(document.getElementById('age_51_60').value) || 0;
    const age_over60 = parseInt(document.getElementById('age_over60').value) || 0;
    const service_u5 = parseInt(document.getElementById('service_u5').value) || 0;
    const service_6_10 = parseInt(document.getElementById('service_6_10').value) || 0;
    const service_over10 = parseInt(document.getElementById('service_over10').value) || 0;
    const retirement_risk_positions = document.getElementById('retirement_risk_positions').value.trim() || null;

    // Step 2 — NCD
    const disease_diabetes = parseInt(document.getElementById('disease_diabetes').value) || 0;
    const disease_hypertension = parseInt(document.getElementById('disease_hypertension').value) || 0;
    const disease_cardiovascular = parseInt(document.getElementById('disease_cardiovascular').value) || 0;
    const disease_kidney = parseInt(document.getElementById('disease_kidney').value) || 0;
    const disease_liver = parseInt(document.getElementById('disease_liver').value) || 0;
    const disease_cancer = parseInt(document.getElementById('disease_cancer').value) || 0;
    const disease_obesity = parseInt(document.getElementById('disease_obesity').value) || 0;
    const disease_other_detail = document.getElementById('disease_other_detail').value.trim() || null;
    const ncd_count = disease_diabetes + disease_hypertension + disease_cardiovascular + disease_kidney + disease_liver + disease_cancer + disease_obesity + (parseInt(document.getElementById('disease_other_count').value) || 0);

    // Step 2 — Sick Leave
    const sick_leave_data = [];
    for (let i = 0; i < 5; i++) {
        const yr = CURRENT_YEAR - i;
        const na = document.getElementById(`sick_na_${yr}`)?.checked;
        if (!na) {
            sick_leave_data.push({
                year: yr,
                total_days: parseInt(document.getElementById(`sick_days_${yr}`)?.value) || 0,
                avg_per_person: parseFloat(document.getElementById(`sick_avg_${yr}`)?.value) || 0,
            });
        }
    }

    // Step 2 — Clinic
    const clinic_users_per_year = parseInt(document.getElementById('clinic_users_per_year').value) || null;
    const clinic_top_symptoms = document.getElementById('clinic_top_symptoms').value.trim() || null;
    const clinic_top_medications = document.getElementById('clinic_top_medications').value.trim() || null;

    // Step 3 — Mental
    const mental_stress_count = parseInt(document.getElementById('mental_stress_count').value) || 0;
    const mental_anxiety_count = parseInt(document.getElementById('mental_anxiety_count').value) || 0;
    const mental_sleep_count = parseInt(document.getElementById('mental_sleep_count').value) || 0;
    const mental_burnout_count = parseInt(document.getElementById('mental_burnout_count').value) || 0;
    const mental_depression_count = parseInt(document.getElementById('mental_depression_count').value) || 0;
    const mental_other = document.getElementById('mental_other').value.trim() || null;

    // Step 3 — Engagement
    const engagement_data = [];
    for (let i = 0; i < 5; i++) {
        const yr = CURRENT_YEAR - i;
        const na = document.getElementById(`eng_na_${yr}`)?.checked;
        if (!na) {
            const score = parseFloat(document.getElementById(`eng_score_${yr}`)?.value);
            const low = document.getElementById(`eng_low_${yr}`)?.value.trim();
            if (!isNaN(score) || low) {
                engagement_data.push({ year: yr, score: isNaN(score) ? null : score, low_areas: low ? low.split(/[,،]/).map(s => s.trim()) : [] });
            }
        }
    }
    const engagement_trend = document.getElementById('engagement_trend').value.trim() || null;

    // Step 3 — Movement
    const turnover_rate = document.getElementById('turnover_rate').value !== '' ? parseFloat(document.getElementById('turnover_rate').value) : null;
    const transfer_rate = document.getElementById('transfer_rate').value !== '' ? parseFloat(document.getElementById('transfer_rate').value) : null;

    // Step 4 — Support Systems
    const mentoring_system = document.querySelector('input[name="mentoring_system"]:checked')?.value || null;
    const job_rotation = document.querySelector('input[name="job_rotation"]:checked')?.value || null;
    const idp_system = document.querySelector('input[name="idp_system"]:checked')?.value || null;
    const career_path_system = document.querySelector('input[name="career_path_system"]:checked')?.value || null;
    const training_hours_range = document.querySelector('input[name="training_hours_range"]:checked')?.value || null;

    // Step 5 — Environment
    const ergonomics_status = document.querySelector('input[name="ergonomics_status"]:checked')?.value || null;
    const ergonomics_detail = document.getElementById('ergonomics_detail').value.trim() || null;
    const digital_systems = [...document.querySelectorAll('.digital-cb:checked')].map(c => c.value).filter(v => v !== 'other');
    const digital_other = document.getElementById('digital_other').value.trim() || null;

    // Step 6 — HRD
    const hrd_plan_url = document.getElementById('hrd_plan_url').value.trim() || null;
    const hrd_budget_url = document.getElementById('hrd_budget_url').value.trim() || null;
    const core_competency_url = document.getElementById('core_competency_url').value.trim() || null;
    const functional_competency_url = document.getElementById('functional_competency_url').value.trim() || null;
    const hrd_opportunities = [...document.querySelectorAll('.hrd-opp-cb:checked')].map(c => c.value).filter(v => v !== 'other');
    const hrd_opportunities_other = document.getElementById('hrd_opportunities_other').value.trim() || null;

    // Step 7
    const hr_strategy_map_url = document.getElementById('hr_strategy_map_url').value.trim() || null;
    const strategic_priorities = prioritySelected.map((p, i) => ({ rank: i + 1, topic: p.id, label: p.label }));
    const strategic_priorities_other = document.getElementById('strategic_priorities_other')?.value.trim() || null;

    return {
        respondent_email: respondentEmail || null,
        organization, vision_mission, strategic_plan_summary, total_staff, org_chart_url,
        age_u30, age_31_40, age_41_50, age_51_60, age_over60,
        age_30_39: age_31_40, age_40_49: age_41_50, age_50_plus: age_51_60 + age_over60, // backward compat
        service_u5, service_6_10, service_over10, retirement_risk_positions,
        disease_diabetes, disease_hypertension, disease_cardiovascular, disease_kidney,
        disease_liver, disease_cancer, disease_obesity, disease_other_detail,
        ncd_count, ncd_ratio_pct: (total_staff && ncd_count) ? +((ncd_count / total_staff) * 100).toFixed(2) : null,
        sick_leave_data: sick_leave_data.length ? sick_leave_data : null,
        clinic_users_per_year, clinic_top_symptoms, clinic_top_medications,
        mental_stress_count, mental_anxiety_count, mental_sleep_count,
        mental_burnout_count, mental_depression_count, mental_other,
        engagement_data: engagement_data.length ? engagement_data : null, engagement_trend,
        turnover_rate, transfer_rate,
        mentoring_system, job_rotation, idp_system, career_path_system, training_hours_range,
        ergonomics_status, ergonomics_detail,
        digital_systems: digital_systems.length ? digital_systems : null, digital_other,
        hrd_plan_url, hrd_budget_url, core_competency_url, functional_competency_url,
        hrd_opportunities: hrd_opportunities.length ? hrd_opportunities : null, hrd_opportunities_other,
        hr_strategy_map_url,
        strategic_priorities: strategic_priorities.length ? strategic_priorities : null,
        strategic_priorities_other,
        health_issues: [], linked_plans: [], hrd_plan_status: null, severity_score: null,
        form_version: 'ch1-v2',
    };
}

// =============================================
// SUMMARY CARD (Step 7)
// =============================================
function buildSummary() {
    const d = collectAllData();
    const ncdTotal = d.ncd_count || 0;
    const strategyText = (d.strategic_priorities || []).map(p => `${p.rank}. ${p.label}`).join(' | ') || '—';
    const trainingLabel = TRAINING_OPTIONS.find(o => o.v === d.training_hours_range)?.l || '—';
    document.getElementById('summary-content').innerHTML = `
    <div class="flex justify-between py-1 border-b border-blue-600"><span>หน่วยงาน</span><span class="font-semibold text-white">${d.organization}</span></div>
    <div class="flex justify-between py-1 border-b border-blue-600"><span>บุคลากรรวม</span><span class="font-semibold text-white">${(d.total_staff || 0).toLocaleString()} คน</span></div>
    <div class="flex justify-between py-1 border-b border-blue-600"><span>NCD รวมทุกประเภท</span><span class="font-semibold text-white">${ncdTotal} คน</span></div>
    <div class="flex justify-between py-1 border-b border-blue-600"><span>ชั่วโมงอบรม</span><span class="font-semibold text-white">${trainingLabel}</span></div>
    <div class="py-1"><span>ยุทธศาสตร์สำคัญ</span><div class="text-white font-semibold mt-1 text-xs leading-5">${strategyText}</div></div>
  `;
}

// =============================================
// SUBMIT
// =============================================
async function handleSubmit() {
    const data = collectAllData();
    lastPayload = data;
    await submitWithRetry(data);
}

async function submitWithRetry(data, attempt = 1) {
    showOverlay('loading');
    try {
        const record = { ...data, raw_payload: data };
        console.log('[ch1] Submitting (attempt', attempt, '):', record);
        const { error } = await ch1Sb.from(TARGET_TABLE).insert([record]);
        if (error) throw error;
        hideOverlay('loading');
        const refId = crypto.randomUUID().slice(0, 8).toUpperCase();
        document.getElementById('success-ref').textContent = `หมายเลขอ้างอิง: ${refId} | ขอบคุณที่ส่งข้อมูล ทีมงาน NIDA จะติดต่อกลับ`;
        showOverlay('success');
        localStorage.removeItem('ch1_draft');
        console.log('[ch1] Submit success, ref:', refId);
    } catch (err) {
        console.error('[ch1] Submit error:', err);
        hideOverlay('loading');
        if (attempt < 3) {
            showToast(`ลองใหม่... (ครั้งที่ ${attempt + 1})`);
            await new Promise(r => setTimeout(r, 2000));
            return submitWithRetry(data, attempt + 1);
        }
        document.getElementById('error-msg').textContent = `ไม่สามารถส่งข้อมูลได้: ${err.message || 'Unknown error'}`;
        showOverlay('error');
    }
}

function retrySubmit() { hideOverlay('error'); if (lastPayload) submitWithRetry(lastPayload); }

function showOverlay(name) { document.getElementById(`overlay-${name}`)?.classList.remove('hidden'); }
function hideOverlay(name) { document.getElementById(`overlay-${name}`)?.classList.add('hidden'); }

// =============================================
// AUTO-SAVE / DRAFT
// =============================================
function saveDraft() {
    try {
        const data = collectAllData();
        localStorage.setItem('ch1_draft', JSON.stringify({ data, step: currentStep, priorities: prioritySelected, ts: Date.now() }));
        showToast('💾 บันทึกร่างเรียบร้อยแล้ว');
    } catch (e) {
        // silent fail — ไม่รบกวน user ด้วย toast เมื่อ manual save fail
        console.warn('Draft save failed (non-critical):', e.message);
    }
}

function loadDraft() {
    const raw = localStorage.getItem('ch1_draft');
    if (!raw) { showToast('ไม่พบข้อมูลร่าง'); return; }
    if (!confirm('โหลดร่างที่บันทึกไว้? ข้อมูลปัจจุบันจะถูกแทนที่')) return;
    try {
        const { data, step, priorities } = JSON.parse(raw);
        restoreDraft(data, priorities || []);
        currentStep = step || 0;
        updateUI();
        showToast('📂 โหลดร่างสำเร็จ');
    } catch (e) { showToast('ข้อมูลร่างเสียหาย'); }
}

function restoreDraft(d, priorities) {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
    setVal('organization', d.organization);
    setVal('vision_mission', d.vision_mission);
    setVal('strategic_plan_summary', d.strategic_plan_summary);
    setVal('total_staff', d.total_staff);
    setVal('org_chart_url', d.org_chart_url);
    ['age_u30', 'age_31_40', 'age_41_50', 'age_51_60', 'age_over60', 'service_u5', 'service_6_10', 'service_over10'].forEach(id => setVal(id, d[id]));
    setVal('retirement_risk_positions', d.retirement_risk_positions);
    ['disease_diabetes', 'disease_hypertension', 'disease_cardiovascular', 'disease_kidney', 'disease_liver', 'disease_cancer', 'disease_obesity'].forEach(id => setVal(id, d[id]));
    setVal('disease_other_detail', d.disease_other_detail);
    setVal('clinic_users_per_year', d.clinic_users_per_year);
    setVal('clinic_top_symptoms', d.clinic_top_symptoms);
    setVal('clinic_top_medications', d.clinic_top_medications);
    ['mental_stress_count', 'mental_anxiety_count', 'mental_sleep_count', 'mental_burnout_count', 'mental_depression_count'].forEach(id => setVal(id, d[id]));
    setVal('mental_other', d.mental_other);
    setVal('engagement_trend', d.engagement_trend);
    setVal('turnover_rate', d.turnover_rate);
    setVal('transfer_rate', d.transfer_rate);
    ['hrd_plan_url', 'hrd_budget_url', 'core_competency_url', 'functional_competency_url', 'hr_strategy_map_url'].forEach(id => setVal(id, d[id]));
    // Radio restore
    const setRadio = (name, val) => { const r = document.querySelector(`input[name="${name}"][value="${val}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event('change')); } };
    if (d.ergonomics_status) setRadio('ergonomics_status', d.ergonomics_status);
    if (d.training_hours_range) setRadio('training_hours_range', d.training_hours_range);
    SUPPORT_SYSTEMS.forEach(s => { if (d[s.id]) setRadio(s.id, d[s.id]); });
    // Priority
    prioritySelected = priorities;
    updatePriorityRanks();
    document.querySelectorAll('.priority-chip').forEach(chip => {
        chip.classList.toggle('selected', priorities.some(p => p.id === chip.dataset.id));
    });
}

function startAutoSave() {
    setInterval(() => {
        if (currentStep === 0) return; // ไม่ auto-save ตอน landing
        try {
            let data;
            try {
                data = collectAllData();
            } catch (collectErr) {
                console.warn('autoSave collectAllData error:', collectErr);
                data = collectSafeData();
            }

            let jsonStr;
            try {
                jsonStr = JSON.stringify({ data, step: currentStep, priorities: prioritySelected, ts: Date.now() });
            } catch (jsonErr) {
                console.warn('autoSave JSON.stringify error:', jsonErr);
                return; // silent — ไม่แสดง toast
            }

            try {
                localStorage.setItem('ch1_draft', jsonStr);
                console.log('[ch1] Draft auto-saved, size:', jsonStr.length, 'bytes');
            } catch (storageErr) {
                console.warn('autoSave localStorage error (storage full?):', storageErr);
                // silent — ไม่แสดง toast เพราะจะรบกวนขณะกรอกสองถาม
            }
        } catch (e) {
            console.warn('autoSave unexpected error:', e);
            // silent — ไม่แสดง toast
        }
    }, 30000);
}

// Fallback: save only fields that are safe to read
function collectSafeData() {
    const safeGet = (id) => {
        try {
            const el = document.getElementById(id);
            return el ? el.value : null;
        } catch { return null; }
    };

    return {
        organization: safeGet('organization'),
        total_staff: safeGet('total_staff'),
        vision_mission: safeGet('vision_mission'),
        _savedAt: new Date().toISOString(),
        _isFallback: true
    };
}

// =============================================
// TOAST
// =============================================
let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1'; t.style.transform = 'translateY(0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; }, 3000);
}
