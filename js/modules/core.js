// ========================================
// Core Module - App Logic + Components
// ========================================

// ========================================
// App Logic (from app.js)
// ========================================

// TEST MODE - Random Data Generation
const TEST_MODE = {
    enabled: false,
    totalRecords: 200,
    currentRecord: 0,
    orgDistribution: {},
    
    // All 16 organizations
    organizations: [
        { code: 'probation', name: 'กรมคุมประพฤติ' },
        { code: 'dss', name: 'กรมวิทยาศาสตร์บริการ' },
        { code: 'dcp', name: 'กรมส่งเสริมวัฒนธรรม' },
        { code: 'dmh', name: 'กรมสุขภาพจิต' },
        { code: 'tmd', name: 'กรมอุตุนิยมวิทยา' },
        { code: 'doh', name: 'กองฝึกอบรม กรมทางหลวง' },
        { code: 'nrct', name: 'สำนักงานการวิจัยแห่งชาติ' },
        { code: 'opdc', name: 'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)' },
        { code: 'onep', name: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม' },
        { code: 'tpso', name: 'สำนักงานนโยบายและยุทธศาสตร์การค้า' },
        { code: 'mots', name: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา' },
        { code: 'acfs', name: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ' },
        { code: 'nesdc', name: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ' },
        { code: 'dcy', name: 'กรมเด็กและเยาวชน' },
        { code: 'doh_main', name: 'กรมอนามัย' },
        { code: 'rid', name: 'กรมชลประทาน' }
    ]
};

// Main App Class
class WellbeingApp {
    constructor() {
        this.userInfo = null;
        this.currentView = 'login';
        this.currentSectionIndex = 0;
        this.currentSubsectionIndex = 0;
        this.responses = {};
        this.isTestMode = false;
    }

    init() {
        console.log('🚀 Well-being Survey App Initializing...');
        this.setupEventListeners();
        this.checkAuthState();
        this.render();
    }

    setupEventListeners() {
        // Setup global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
    }

    checkAuthState() {
        // Check if user is logged in
        const savedUser = localStorage.getItem('wellbeing_user');
        if (savedUser) {
            try {
                this.userInfo = JSON.parse(savedUser);
                this.currentView = 'welcome';
            } catch (e) {
                console.error('Failed to parse saved user:', e);
                localStorage.removeItem('wellbeing_user');
            }
        }
    }

    render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        switch (this.currentView) {
            case 'login':
                mainContent.innerHTML = renderLoginScreen();
                break;
            case 'welcome':
                mainContent.innerHTML = renderWelcome();
                break;
            case 'survey':
                this.renderSurvey();
                break;
            case 'results':
                mainContent.innerHTML = renderResults();
                break;
        }

        this.updateNavigation();
    }

    updateNavigation() {
        const navButtons = document.getElementById('nav-buttons');
        if (!navButtons) return;

        if (this.currentView === 'survey') {
            navButtons.style.display = 'flex';
            navButtons.innerHTML = `
                <button class="btn btn-secondary" onclick="app.prevSection()">
                    <span class="btn-icon">←</span> ย้อนกลับ
                </button>
                <button class="btn btn-primary" onclick="app.nextSection()">
                    ถัดไป <span class="btn-icon">→</span>
                </button>
            `;
        } else {
            navButtons.style.display = 'none';
        }
    }

    renderSurvey() {
        // Implementation for rendering survey sections
        console.log('Rendering survey section:', this.currentSectionIndex);
    }

    nextSection() {
        if (this.currentSectionIndex < SECTIONS_ORDER.length - 1) {
            this.currentSectionIndex++;
            this.render();
        }
    }

    prevSection() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.render();
        }
    }

    handleEscape() {
        // Handle ESC key
        console.log('ESC pressed');
    }

    // Google Login (placeholder)
    googleLogin() {
        console.log('Google login initiated');
        // Implementation would go here
    }

    // Set Email
    setEmail() {
        const emailInput = document.getElementById('user-email-input');
        if (emailInput && emailInput.value) {
            this.userInfo = {
                email: emailInput.value,
                name: emailInput.value.split('@')[0]
            };
            localStorage.setItem('wellbeing_user', JSON.stringify(this.userInfo));
            this.currentView = 'welcome';
            this.render();
        }
    }

    // Start Survey
    startSurvey() {
        if (!this.userInfo) {
            showToast('กรุณากรอกอีเมลก่อนเริ่มทำแบบสำรวจ', 'error');
            return;
        }

        this.currentView = 'survey';
        this.currentSectionIndex = 0;
        this.currentSubsectionIndex = 0;
        this.render();
    }

    // Start New
    startNew() {
        if (confirm('ต้องการเริ่มใหม่หรือไม่? ข้อมูลเดิมจะถูกลบ')) {
            this.responses = {};
            this.currentSectionIndex = 0;
            this.currentSubsectionIndex = 0;
            this.render();
            showToast('เริ่มใหม่แล้ว', 'success');
        }
    }

    // Save Draft to Cloud
    async saveDraftToCloud() {
        // Implementation for saving draft
        console.log('Saving draft to cloud...');
    }

    // Load Draft from Cloud
    async loadDraftFromCloud() {
        // Implementation for loading draft
        console.log('Loading draft from cloud...');
    }
}

// ========================================
// UI Components (from components.js)
// ========================================

// Render Login Screen (ChatGPT Style)
function renderLoginScreen() {
    // Google "G" Logo SVG (inline to avoid loading issues)
    const googleIconSvg = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>`;

    return `
        <div class="login-screen fade-in">
            <div class="login-card">
                <div class="login-logo">🌿</div>
                <h2 class="login-title">ยินดีต้อนรับ</h2>
                <p class="login-subtitle">ลงชื่อเข้าใช้เพื่อทำแบบสำรวจ</p>
                
                <button class="google-login-btn" onclick="app.googleLogin()">
                    ${googleIconSvg}
                    ดำเนินการต่อด้วย Google
                </button>
                
                <div class="login-footer">
                    โดยการดำเนินการต่อท่านยอมรับ <a href="#">ข้อกำหนด</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
                </div>
            </div>
        </div>
    `;
}

// Render Welcome Screen
function renderWelcome() {
    // Check if user has entered email
    const hasEmail = app.userInfo && app.userInfo.email;

    // Email input form (only show if no email yet)
    const emailForm = !hasEmail
        ? `
            <div class="email-input-container">
                <input type="email" 
                       id="user-email-input" 
                       class="input-field" 
                       placeholder="กรุณากรอกอีเมลของท่าน..." 
                       style="width: 300px; margin-bottom: 1rem;">
                <button class="btn btn-primary" onclick="app.setEmail()" style="width: 300px;">
                    ยืนยันอีเมล <span>→</span>
                </button>
            </div>
        `
        : `
            <div class="user-welcome">
                <h3>ยินดีต้อนรับ, ${app.userInfo.name}!</h3>
                <p>อีเมล: ${app.userInfo.email}</p>
                <button class="btn btn-primary" onclick="app.startSurvey()">
                    เริ่มทำแบบสำรวจ <span>→</span>
                </button>
            </div>
        `;

    return `
        <div class="welcome-screen fade-in">
            <div class="welcome-card">
                <div class="welcome-header">
                    <div class="welcome-icon">🌿</div>
                    <h1 class="welcome-title">แบบสำรวจสุขภาวะบุคลากร</h1>
                    <p class="welcome-subtitle">4 มิติ: กาย ใจ สังคม และสิ่งแวดล้อม</p>
                </div>
                
                <div class="welcome-content">
                    <div class="welcome-info">
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <span class="info-text">ใช้เวลาประมาณ 15-20 นาที</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🔒</span>
                            <span class="info-text">ข้อมูลของท่านจะถูกเก็บเป็นความลับ</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📊</span>
                            <span class="info-text">ผลลัพธ์จะช่วยปรับปรุงสุขภาวะที่ทำงาน</span>
                        </div>
                    </div>
                    
                    ${emailForm}
                </div>
                
                ${hasEmail ? `
                    <div class="welcome-actions">
                        <button class="btn btn-secondary" onclick="app.startNew()">
                            เริ่มใหม่
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render Results Screen
function renderResults() {
    return `
        <div class="results-screen fade-in">
            <div class="results-card">
                <div class="results-header">
                    <div class="results-icon">🎉</div>
                    <h1 class="results-title">สำเร็จ!</h1>
                    <p class="results-subtitle">ขอบคุณที่ทำแบบสำรวจสุขภาวะบุคลากร</p>
                </div>
                
                <div class="results-content">
                    <div class="results-summary">
                        <h3>สรุปผลการประเมิน</h3>
                        <div class="summary-item">
                            <span class="summary-label">สุขภาพกาย:</span>
                            <span class="summary-value">ดีมาก</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">สุขภาพใจ:</span>
                            <span class="summary-value">ปานกลาง</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">สุขภาพสังคม:</span>
                            <span class="summary-value">ดี</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">สุขภาพสิ่งแวดล้อม:</span>
                            <span class="summary-value">ดีมาก</span>
                        </div>
                    </div>
                    
                    <div class="results-actions">
                        <button class="btn btn-primary" onclick="app.startNew()">
                            ทำแบบสำรวมใหม่
                        </button>
                        <button class="btn btn-secondary" onclick="window.print()">
                            พิมพ์ผลลัพธ์
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Global Functions
// ========================================

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ========================================
// Initialize App
// ========================================

// Global app instance
const app = new WellbeingApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
