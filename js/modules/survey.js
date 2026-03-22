// ========================================
// Survey Module - CH1 Form + Questions
// ========================================

// ========================================
// CH1 Form Logic (from ch1-form.js)
// ========================================

class CH1FormHandler {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 5;
        this.formData = {};
        this.orgCode = this.getOrgCodeFromURL();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeForm();
        this.loadDraftIfExists();
        
        console.log('[CH1Form] Initialized with org code:', this.orgCode);
    }

    getOrgCodeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('org') || urlParams.get('code');
    }

    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());

        // Form validation
        const form = document.getElementById('survey-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Save/Load draft buttons
        const saveBtn = document.querySelector('button[onclick="saveDraft()"]');
        const loadBtn = document.querySelector('button[onclick="loadDraft()"]');
        
        if (saveBtn) {
            saveBtn.removeAttribute('onclick');
            saveBtn.addEventListener('click', () => this.saveDraft());
        }
        
        if (loadBtn) {
            loadBtn.removeAttribute('onclick');
            loadBtn.addEventListener('click', () => this.loadDraft());
        }

        // Email confirmation
        const emailInput = document.getElementById('respondent_email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail());
        }

        // File upload handlers (will be set up by PDFUploadHandler)
        this.setupFileUploadHandlers();
    }

    setupFileUploadHandlers() {
        // These will be handled by PDFUploadHandler
        console.log('[CH1Form] File upload handlers ready');
    }

    initializeForm() {
        // Set organization if provided
        if (this.orgCode) {
            const orgSelect = document.getElementById('organization');
            if (orgSelect) {
                orgSelect.value = this.orgCode;
                orgSelect.disabled = true;
                this.showOrganizationBadge(this.orgCode);
            }
        }

        // Initialize step indicators
        this.updateStepIndicators();
        
        // Show first step
        this.showStep(0);
    }

    showOrganizationBadge(orgName) {
        const badgeContainer = document.getElementById('org-badge-container');
        const badgeName = document.getElementById('org-badge-name');
        
        if (badgeContainer && badgeName) {
            badgeName.textContent = orgName;
            badgeContainer.classList.remove('hidden');
        }
    }

    updateStepIndicators() {
        const dotsContainer = document.getElementById('step-dots-row');
        if (!dotsContainer) return;

        let dotsHTML = '';
        for (let i = 1; i <= this.totalSteps; i++) {
            const isActive = i === this.currentStep;
            dotsHTML += `
                <div class="step-dot ${isActive ? 'active' : ''}" 
                     onclick="window.surveyModule.goToStep(${i - 1})">
                    ${i}
                </div>
            `;
        }
        dotsContainer.innerHTML = dotsHTML;
    }

    showStep(stepIndex) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.getElementById(`step-${stepIndex}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update progress
        this.updateProgress(stepIndex);
        
        // Update navigation
        this.updateNavigationButtons(stepIndex);
        
        // Update step indicators
        this.updateStepIndicators();
    }

    updateProgress(stepIndex) {
        const progress = ((stepIndex + 1) / this.totalSteps) * 100;
        
        const progressBar = document.getElementById('progress-bar');
        const stepLabel = document.getElementById('step-label');
        const stepPct = document.getElementById('step-pct');
        const formProgress = document.getElementById('form-progress');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (stepLabel) stepLabel.textContent = `ส่วนที่ ${stepIndex + 1} จาก ${this.totalSteps}`;
        if (stepPct) stepPct.textContent = `${Math.round(progress)}%`;
        if (formProgress) formProgress.style.display = 'block';
    }

    updateNavigationButtons(stepIndex) {
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        const formNav = document.getElementById('form-nav');
        
        if (formNav) formNav.style.display = 'flex';
        
        if (prevBtn) {
            prevBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
        }
        
        if (nextBtn) {
            if (stepIndex === this.totalSteps - 1) {
                nextBtn.innerHTML = 'ส่งแบบสำรวจ';
                nextBtn.onclick = () => this.handleSubmit();
            } else {
                nextBtn.innerHTML = 'ถัดไป <span class="btn-icon">→</span>';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    previousStep() {
        this.saveCurrentStepData();
        this.currentStep--;
        this.showStep(this.currentStep);
    }

    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.totalSteps) {
            this.saveCurrentStepData();
            this.currentStep = stepIndex;
            this.showStep(this.currentStep);
        }
    }

    validateCurrentStep() {
        const step = this.currentStep;
        let isValid = true;

        switch (step) {
            case 0: // Landing step
                const email = document.getElementById('respondent_email');
                if (!email || !email.value || !this.validateEmailFormat(email.value)) {
                    this.showError('กรุณาระบุอีเมลที่ถูกต้อง');
                    isValid = false;
                }
                break;
                
            case 1: // Basic info
                const org = document.getElementById('organization');
                const totalStaff = document.getElementById('total_staff');
                
                if (!org || !org.value) {
                    this.showError('กรุณาเลือกหน่วยงาน');
                    isValid = false;
                }
                
                if (!totalStaff || !totalStaff.value || totalStaff.value < 1) {
                    this.showError('กรุณาระบุจำนวนบุคลากรรวม');
                    isValid = false;
                }
                
                // Validate staff distribution
                if (!this.validateStaffDistribution()) {
                    isValid = false;
                }
                break;
                
            // Add validation for other steps as needed
        }

        return isValid;
    }

    validateEmailFormat(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateStaffDistribution() {
        const totalStaff = parseInt(document.getElementById('total_staff').value) || 0;
        let typeTotal = 0;
        let ageTotal = 0;
        let serviceTotal = 0;

        // Check type distribution
        ['type_official', 'type_employee', 'type_contract', 'type_other'].forEach(id => {
            const input = document.getElementById(id);
            if (input) typeTotal += parseInt(input.value) || 0;
        });

        // Check age distribution
        ['age_u30', 'age_31_40', 'age_41_50', 'age_51_60'].forEach(id => {
            const input = document.getElementById(id);
            if (input) ageTotal += parseInt(input.value) || 0;
        });

        // Check service years distribution
        ['service_u1', 'service_1_5', 'service_6_10', 'service_11_15', 
         'service_16_20', 'service_21_25', 'service_26_30', 'service_over30'].forEach(id => {
            const input = document.getElementById(id);
            if (input) serviceTotal += parseInt(input.value) || 0;
        });

        // Show warnings if totals exceed total staff
        const typeWarn = document.getElementById('type-sum-warn');
        const ageWarn = document.getElementById('age-sum-warn');
        const serviceWarn = document.getElementById('service-sum-warn');

        if (typeWarn) typeWarn.style.display = typeTotal > totalStaff ? 'block' : 'none';
        if (ageWarn) ageWarn.style.display = ageTotal > totalStaff ? 'block' : 'none';
        if (serviceWarn) serviceWarn.style.display = serviceTotal > totalStaff ? 'block' : 'none';

        return true; // Allow proceeding even with warnings
    }

    saveCurrentStepData() {
        // Collect all form data from current step
        const formData = new FormData(document.getElementById('survey-form'));
        
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }
    }

    async handleSubmit() {
        if (!this.validateCurrentStep()) {
            return;
        }

        this.saveCurrentStepData();
        
        try {
            this.showLoadingOverlay();
            
            // Add metadata
            const submissionData = {
                ...this.formData,
                submitted_at: new Date().toISOString(),
                org_code: this.orgCode,
                form_version: '3.0'
            };

            // Submit to Supabase
            const { data, error } = await supabase
                .from('hrd_ch1_responses')
                .insert([submissionData]);

            if (error) throw error;

            // Show success
            this.showSuccessOverlay(data[0]);
            
            // Clear draft
            this.clearDraft();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showErrorOverlay(error.message);
        } finally {
            this.hideLoadingOverlay();
        }
    }

    validateEmail() {
        const emailInput = document.getElementById('respondent_email');
        const errorMsg = document.getElementById('email-error-msg');
        
        if (!emailInput || !emailInput.value) {
            if (errorMsg) errorMsg.textContent = 'กรุณาระบุอีเมล';
            return false;
        }
        
        if (!this.validateEmailFormat(emailInput.value)) {
            if (errorMsg) errorMsg.textContent = 'รูปแบบอีเมลไม่ถูกต้อง';
            return false;
        }
        
        if (errorMsg) errorMsg.textContent = '';
        return true;
    }

    async saveDraft() {
        this.saveCurrentStepData();
        
        try {
            localStorage.setItem('ch1_draft', JSON.stringify({
                formData: this.formData,
                currentStep: this.currentStep,
                timestamp: new Date().toISOString()
            }));
            
            this.showToast('บันทึกร่างสำเร็จ', 'success');
        } catch (error) {
            console.error('Save draft error:', error);
            this.showToast('บันทึกร่างล้มเหลว', 'error');
        }
    }

    async loadDraft() {
        try {
            const draft = localStorage.getItem('ch1_draft');
            if (!draft) {
                this.showToast('ไม่พบข้อมูลร่าง', 'info');
                return;
            }

            const draftData = JSON.parse(draft);
            this.formData = draftData.formData || {};
            this.currentStep = draftData.currentStep || 0;

            // Restore form fields
            Object.keys(this.formData).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        // Handle checkboxes/radios
                        const elements = document.querySelectorAll(`[name="${key}"]`);
                        elements.forEach(el => {
                            if (el.type === 'checkbox') {
                                el.checked = this.formData[key].includes(el.value);
                            } else if (el.type === 'radio') {
                                el.checked = el.value === this.formData[key];
                            }
                        });
                    } else {
                        input.value = this.formData[key];
                    }
                }
            });

            // Show the saved step
            this.showStep(this.currentStep);
            
            this.showToast('โหลดร่างสำเร็จ', 'success');
            
        } catch (error) {
            console.error('Load draft error:', error);
            this.showToast('โหลดร่างล้มเหลว', 'error');
        }
    }

    clearDraft() {
        try {
            localStorage.removeItem('ch1_draft');
        } catch (error) {
            console.error('Clear draft error:', error);
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('overlay-loading');
        if (overlay) overlay.classList.remove('hidden');
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('overlay-loading');
        if (overlay) overlay.classList.add('hidden');
    }

    showSuccessOverlay(data) {
        const overlay = document.getElementById('overlay-success');
        if (overlay) {
            const refElement = document.getElementById('success-ref');
            const modeElement = document.getElementById('success-mode');
            
            if (refElement) refElement.textContent = `รหัสอ้างอิง: ${data.id}`;
            if (modeElement) modeElement.textContent = 'โหมดจริง';
            
            overlay.classList.remove('hidden');
        }
    }

    showErrorOverlay(message) {
        const overlay = document.getElementById('overlay-error');
        if (overlay) {
            const errorElement = document.getElementById('error-msg');
            if (errorElement) errorElement.textContent = message;
            overlay.classList.remove('hidden');
        }
    }

    showError(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
            }, 3000);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
            }, 3000);
        }
    }
}

// ========================================
// SSOT-backed compatibility data
// ========================================

const SECTIONS_ORDER = ['ch1'];

const SURVEY_DATA = {
    ch1: {
        title: 'แบบสำรวจ Ch1',
        description: 'Legacy survey module now reads CH1 metadata from PROJECT_SSOT/FormSchema compatibility layer',
        questions: Object.entries(PROJECT_SSOT?.ch1?.fallbackFields || {}).map(([id, label]) => ({
            id,
            type: 'text',
            label,
            required: false
        }))
    }
};

const SUPPORT_SYSTEMS = (PROJECT_SSOT?.ch1?.supportSystems || []).reduce((acc, item) => {
    acc[item.id] = Object.fromEntries((PROJECT_SSOT?.ch1?.supportOptions || []).map((opt) => [opt.v, opt.l]));
    return acc;
}, {});

const SUPPORT_OPTIONS = (PROJECT_SSOT?.ch1?.supportOptions || []).map((opt) => opt.v);

const STRATEGIC_TOPICS = (PROJECT_SSOT?.ch1?.strategicTopics || []).map((item) => item.id);

// ========================================
// EXPORTS
// ========================================

window.SurveyModule = {
    CH1FormHandler,
    // Data
    SECTIONS_ORDER,
    SURVEY_DATA,
    SUPPORT_SYSTEMS,
    SUPPORT_OPTIONS,
    STRATEGIC_TOPICS
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.surveyModule = new CH1FormHandler();
});
