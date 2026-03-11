// ========================================
// Core Module - App Logic + UI Components
// ========================================

// ========================================
// App Logic (from app.js)
// ========================================

// Test Mode Configuration
const TEST_MODE = true; // Set to false for production
const TEST_ORGANIZATIONS = [
    'กรมอนามัย',
    'กรมควบคุมโรค',
    'กรมการแพทย์',
    'กรมสุขภาพจิต',
    'สำนักงานปลัดกระทรวงแห่งชาติ'
];

// Generate random test data
function generateTestData() {
    const org = TEST_ORGANIZATIONS[Math.floor(Math.random() * TEST_ORGANIZATIONS.length)];
    const email = `test_${Date.now()}@example.com`;
    
    return {
        organization: org,
        respondent_email: email,
        total_staff: Math.floor(Math.random() * 500) + 100,
        age_u30: Math.floor(Math.random() * 50),
        age_31_40: Math.floor(Math.random() * 100),
        age_41_50: Math.floor(Math.random() * 80),
        age_51_60: Math.floor(Math.random() * 60),
        // Add more test data as needed
    };
}

// Main App Class
class WellbeingApp {
    constructor() {
        this.currentUser = null;
        this.currentStep = 0;
        this.formData = {};
        this.isTestMode = TEST_MODE;
        
        this.init();
    }

    async init() {
        try {
            // Initialize authentication state
            await this.checkAuthState();
            
            // Initialize UI
            this.initializeUI();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('[WellbeingApp] Initialized successfully');
        } catch (error) {
            console.error('[WellbeingApp] Failed to initialize:', error);
            this.showError('การเริ่มต้นระบบล้มเหลว กรุณารีเฟรชหน้าเว็บ');
        }
    }

    async checkAuthState() {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            this.currentUser = user;
            this.updateUserUI(user);
        } else {
            this.showLoginScreen();
        }
    }

    initializeUI() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize navigation
        this.setupNavigation();
        
        // Setup form validation
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'survey-form') {
                e.preventDefault();
                this.handleFormSubmit();
            }
        });

        // Navigation buttons
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
    }

    setupNavigation() {
        // Initialize step navigation
        this.updateStepIndicator();
        this.updateNavigationButtons();
    }

    setupFormValidation() {
        // Setup real-time validation
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        if (!isValid) {
            this.showFieldError(field, field.validationMessage);
        }
        return isValid;
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(`err-${field.id}`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        field.classList.add('border-red-500');
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(`err-${field.id}`);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        field.classList.remove('border-red-500');
    }

    async handleFormSubmit() {
        try {
            this.showLoadingOverlay();
            
            // Collect form data
            const formData = this.collectFormData();
            
            // Validate form
            if (!this.validateForm(formData)) {
                this.hideLoadingOverlay();
                return;
            }
            
            // Submit to Supabase
            const result = await this.submitForm(formData);
            
            // Show success
            this.showSuccessOverlay(result);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorOverlay(error.message);
        } finally {
            this.hideLoadingOverlay();
        }
    }

    collectFormData() {
        const form = document.getElementById('survey-form');
        const formData = new FormData(form);
        
        // Convert to object
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add metadata
        data.submitted_at = new Date().toISOString();
        data.user_id = this.currentUser?.id;
        
        return data;
    }

    validateForm(data) {
        // Add custom validation logic
        if (!data.organization) {
            this.showError('กรุณาเลือกหน่วยงาน');
            return false;
        }
        
        if (!data.respondent_email) {
            this.showError('กรุณาระบุอีเมล');
            return false;
        }
        
        return true;
    }

    async submitForm(data) {
        const { data: result, error } = await supabase
            .from('survey_responses')
            .insert([data]);
            
        if (error) throw error;
        
        return result[0];
    }

    nextStep() {
        if (this.currentStep < this.getTotalSteps()) {
            this.currentStep++;
            this.updateStep();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }

    updateStep() {
        // Hide current step
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show new step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        
        // Update UI
        this.updateStepIndicator();
        this.updateNavigationButtons();
        this.scrollToTop();
    }

    updateStepIndicator() {
        const progress = (this.currentStep / this.getTotalSteps()) * 100;
        const progressBar = document.getElementById('progress-bar');
        const stepLabel = document.getElementById('step-label');
        const stepPct = document.getElementById('step-pct');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (stepLabel) stepLabel.textContent = `ส่วนที่ ${this.currentStep} จาก ${this.getTotalSteps()}`;
        if (stepPct) stepPct.textContent = `${Math.round(progress)}%`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        const formNav = document.getElementById('form-nav');
        
        if (formNav) formNav.style.display = 'block';
        
        if (prevBtn) {
            prevBtn.style.visibility = this.currentStep === 0 ? 'hidden' : 'visible';
        }
        
        if (nextBtn) {
            if (this.currentStep === this.getTotalSteps()) {
                nextBtn.textContent = 'ส่งแบบสำรวจ';
                nextBtn.onclick = () => this.handleFormSubmit();
            } else {
                nextBtn.innerHTML = 'ถัดไป <span class="btn-icon">→</span>';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    }

    getTotalSteps() {
        return document.querySelectorAll('.form-step').length - 1;
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateUserUI(user) {
        const userSection = document.getElementById('user-section');
        if (userSection) {
            userSection.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ${user.email.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm text-slate-600">${user.email}</span>
                </div>
            `;
        }
    }

    showLoginScreen() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="max-w-md mx-auto mt-8">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>
                        <form id="login-form">
                            <div class="mb-4">
                                <label class="block text-sm font-medium mb-2">อีเมล</label>
                                <input type="email" name="email" required
                                    class="w-full border rounded-lg px-3 py-2">
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium mb-2">รหัสผ่าน</label>
                                <input type="password" name="password" required
                                    class="w-full border rounded-lg px-3 py-2">
                            </div>
                            <button type="submit"
                                class="w-full bg-primary text-white rounded-lg py-2 font-medium">
                                เข้าสู่ระบบ
                            </button>
                        </form>
                    </div>
                </div>
            `;
            
            // Setup login form
            document.getElementById('login-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }
    }

    async handleLogin(form) {
        const email = form.email.value;
        const password = form.password.value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.currentUser = data.user;
            this.updateUserUI(data.user);
            this.hideLoginScreen();
            
        } catch (error) {
            this.showError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
    }

    hideLoginScreen() {
        // Reload the app to show main interface
        location.reload();
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('overlay-loading');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('overlay-loading');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showSuccessOverlay(result) {
        const overlay = document.getElementById('overlay-success');
        if (overlay) {
            const refElement = document.getElementById('success-ref');
            const modeElement = document.getElementById('success-mode');
            
            if (refElement) refElement.textContent = `รหัสอ้างอิง: ${result.id}`;
            if (modeElement) modeElement.textContent = this.isTestMode ? 'โหมดทดสอบ' : 'โหมดจริง';
            
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
}

// ========================================
// UI Components (from components.js)
// ========================================

// Render Login Screen
function renderLoginScreen() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        เข้าสู่ระบบแบบสำรวจ
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        กรุณาเข้าสู่ระบบเพื่อทำแบบสำรวจ
                    </p>
                </div>
                <form class="mt-8 space-y-6" id="login-form">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="email" class="sr-only">อีเมล</label>
                            <input id="email" name="email" type="email" required
                                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="อีเมล">
                        </div>
                        <div>
                            <label for="password" class="sr-only">รหัสผ่าน</label>
                            <input id="password" name="password" type="password" required
                                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="รหัสผ่าน">
                        </div>
                    </div>

                    <div>
                        <button type="submit"
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            เข้าสู่ระบบ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Render Welcome Screen
function renderWelcomeScreen() {
    return `
        <div class="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    แบบสำรวจสุขภาวะบุคลากร
                </h1>
                <p class="text-xl text-gray-600 mb-8">
                    ยินดีต้อนรับสู่ระบบแบบสำรวจสุขภาวะบุคลากร
                </p>
                <div class="space-y-4">
                    <button onclick="startSurvey()"
                        class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700">
                        เริ่มทำแบบสำรวจ
                    </button>
                    <div>
                        <a href="/admin" class="text-indigo-600 hover:text-indigo-800">
                            เข้าสู่ระบบผู้ดูแล
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Progress Indicator
function renderProgressIndicator(current, total) {
    const progress = (current / total) * 100;
    
    return `
        <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style="width: ${progress}%"></div>
        </div>
        <div class="text-center mt-2 text-sm text-gray-600">
            ขั้นที่ ${current} จาก ${total} (${Math.round(progress)}%)
        </div>
    `;
}

// Google Icon SVG
const GOOGLE_ICON = `
    <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
`;

// ========================================
// EXPORTS
// ========================================

window.CoreModule = {
    WellbeingApp,
    // UI Components
    renderLoginScreen,
    renderWelcomeScreen,
    renderProgressIndicator,
    GOOGLE_ICON
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WellbeingApp();
});
