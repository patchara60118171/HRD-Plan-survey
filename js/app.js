// ========================================
// Main Application - Survey Controller
// ========================================

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1089240671162-befa46lipnu4q9a4bokkjbr40qke6tcu.apps.googleusercontent.com';

// Google Apps Script URL (User must fill this)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby30NantvJX36X9ZHIw5DOSi-tMqGAXGoVUh9mWaZCEV5egrWckHgMS6Btw3k37FUtL/exec'; // ใส่ URL ที่ได้จากขั้นตอน Deploy ที่นี่

// App State
const app = {
    currentView: 'welcome', // welcome, survey, results, history
    currentSectionIndex: 0,
    currentSubsectionIndex: 0,
    responses: {},
    userInfo: null,
    accessToken: null,

    // Initialize app
    init() {
        // Load saved responses
        this.responses = loadResponses();

        // Check for saved section
        const savedSection = localStorage.getItem('wellbeing_survey_section');
        if (savedSection) {
            const { sectionIndex, subsectionIndex } = JSON.parse(savedSection);
            this.currentSectionIndex = sectionIndex;
            this.currentSubsectionIndex = subsectionIndex;
        }

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 500);

        // Render initial view
        if (Object.keys(this.responses).length > 0 && this.currentSectionIndex > 0) {
            this.currentView = 'survey';
            this.renderSurvey();
        } else {
            this.renderWelcome();
        }

        // Setup navigation buttons
        document.getElementById('btn-prev').addEventListener('click', () => this.prevSection());
        document.getElementById('btn-next').addEventListener('click', () => this.nextSection());

        // Render user section
        this.renderUserSection();

        // Initialize cloud save debounce
        this.debouncedSaveCloud = debounce(() => this.saveDraftToCloud(), 2000);

        // Init Google Sign-In
        this.initGoogleSignIn();
    },

    // Initialize Google Sign-In
    initGoogleSignIn() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => this.handleGoogleCallback(response)
            });
            // Also render button if user section is waiting
            if (!this.userInfo && document.getElementById('g_id_signin_button')) {
                this.renderGoogleButton();
            }
        }
    },

    // Render Google Button (Official)
    renderGoogleButton() {
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            // Retry if library not ready
            setTimeout(() => this.renderGoogleButton(), 500);
            return;
        }

        // Header button
        const headerBtn = document.getElementById('g_id_signin_button');
        if (headerBtn) {
            // Check if already rendered to avoid duplicates/errors? GSI handles it usually.
            google.accounts.id.renderButton(
                headerBtn,
                { theme: "outline", size: "large", type: "standard", shape: "pill", text: "signin_with" }
            );
        }

        // Welcome screen button
        // Always try to render if container exists, even if logic thinks userInfo might be there (safety)
        const welcomeBtn = document.getElementById('welcome-login-btn');
        if (welcomeBtn) {
            if (!this.userInfo) {
                google.accounts.id.renderButton(
                    welcomeBtn,
                    { theme: "filled_blue", size: "large", shape: "pill", text: "signin_with", width: "250" }
                );
            }
        }
    },

    // Google Login
    googleLogin() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.prompt();
        } else {
            showToast('Google Sign-In ยังไม่พร้อม กรุณารอสักครู่', 'error');
        }
    },

    // Handle Google callback
    handleGoogleCallback(response) {
        if (response.credential) {
            // Decode JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            this.userInfo = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            };
            this.accessToken = response.credential;
            this.renderUserSection();
            this.renderUserSection();
            showToast(`ยินดีต้อนรับ ${this.userInfo.name}!`, 'success');

            // Load draft from cloud if exists
            this.loadDraftFromCloud();
        }
    },

    // Logout
    logout() {
        this.userInfo = null;
        this.accessToken = null;
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        this.renderUserSection();
        this.renderWelcome(); // Redirect to home
        showToast('ออกจากระบบแล้ว', 'info');
    },

    // Render user section in header
    renderUserSection() {
        const container = document.getElementById('user-section');
        if (this.userInfo) {
            container.innerHTML = renderUserProfile(this.userInfo);
        } else {
            container.innerHTML = renderLoginButton();
            // Try to render official button
            setTimeout(() => {
                this.renderGoogleButton();
            }, 100); // Small delay to ensure DOM is ready
        }
    },

    // View History List
    async viewHistory() {
        if (!this.userInfo || !GOOGLE_SCRIPT_URL) {
            showToast('ระบบประวัติยังไม่พร้อมใช้งาน', 'error');
            return;
        }

        this.currentView = 'history';
        // Show loading state
        document.getElementById('main-content').innerHTML = `
            <div class="text-center" style="padding: 3rem;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p>กำลังโหลดข้อมูลประวัติ...</p>
            </div>
        `;
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';

        const history = await getUserHistory(this.userInfo.email, GOOGLE_SCRIPT_URL);
        this.renderHistoryList(history);
    },

    // Render History List
    renderHistoryList(history) {
        let html = `
            <div class="history-container fade-in">
                <button class="btn btn-secondary" onclick="app.renderWelcome()" style="margin-bottom: 1rem;">
                    ← กลับหน้าหลัก
                </button>
                <h2 style="margin-bottom: 1.5rem;">ประวัติการส่งแบบสอบถาม</h2>
        `;

        if (history.length === 0 && Object.keys(loadResponses()).length === 0) {
            html += `
                <div class="card text-center" style="padding: 2rem;">
                    <p>ยังไม่พบประวัติการทำแบบสอบถาม</p>
                </div>
            `;
        } else {
            console.log('Rendering history list...');
            html += `<div class="history-list">`;

            // 1. Show Local Draft if exists
            const localDraft = loadResponses();
            const lastUpdated = localStorage.getItem('wellbeing_survey_timestamp');

            if (Object.keys(localDraft).length > 0) {
                const date = lastUpdated ? new Date(lastUpdated).toLocaleString('th-TH') : 'วันนี้';
                // Estimate completion
                const totalQuestions = Object.keys(localDraft).length; // rough estimate

                html += `
                    <div class="card history-item draft" onclick="app.editResponses()" style="cursor: pointer; margin-bottom: 1rem; border-left: 4px solid #F59E0B; background: #FFFBEB;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                    📝 แบบร่าง (ยังไม่ส่ง)
                                    <span style="font-size: 0.75rem; background: #F59E0B; color: white; padding: 2px 6px; border-radius: 4px;">กำลังทำ</span>
                                </h3>
                                <p style="color: var(--text-secondary); margin: 0.25rem 0 0;">แก้ไขล่าสุด: ${date}</p>
                                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">ตอบไปแล้วประมาณ ${totalQuestions} ข้อ</p>
                            </div>
                            <span class="btn-icon">✏️ แก้ไขต่อ</span>
                        </div>
                    </div>
                `;
            }

            // 2. Show History Items
            history.forEach((item, index) => {
                const date = new Date(item.timestamp).toLocaleString('th-TH');
                // Calculate basic score summary if available
                let scoreInfo = '';
                if (item.phq_total) scoreInfo = `คะแนนซึมเศร้า: ${item.phq_total}`;

                html += `
                    <div class="card history-item" onclick="app.viewHistoryDetail(${index})" style="cursor: pointer; margin-bottom: 1rem; transition: transform 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="font-size: 1.1rem; margin: 0;">ครั้งที่ ${history.length - index}</h3>
                                <p style="color: var(--text-secondary); margin: 0.25rem 0 0;">${date}</p>
                            </div>
                            <span class="btn-icon">→</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;

            // Store history for detail view
            this.currentHistory = history;
        }

        html += `</div>`;
        document.getElementById('main-content').innerHTML = html;
    },

    // View History Detail (Read-Only Survey)
    viewHistoryDetail(index) {
        if (!this.currentHistory || !this.currentHistory[index]) return;

        const data = this.currentHistory[index];
        this.responses = data; // Load data into responses
        this.currentView = 'results';

        // Use result view but maybe add a back to history button
        document.getElementById('main-content').innerHTML = renderResults(this.responses, this.userInfo);

        // Add "Back to History" button at the top
        const backBtn = document.createElement('div');
        backBtn.innerHTML = `
            <button class="btn btn-secondary" onclick="app.viewHistory()" style="margin-bottom: 1.5rem;">
                ← กลับไปหน้ารายการประวัติ
            </button>
        `;
        document.getElementById('main-content').prepend(backBtn);

        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Render Welcome Screen
    renderWelcome() {
        this.currentView = 'welcome';
        document.getElementById('main-content').innerHTML = renderWelcome();
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';

        // Render login button on welcome screen if needed
        setTimeout(() => this.renderGoogleButton(), 100);
    },

    // Start Survey
    startSurvey() {
        if (!this.userInfo) {
            showToast('กรุณาเข้าสู่ระบบก่อนเริ่มทำแบบสำรวจ', 'error');
            this.googleLogin();
            return;
        }

        this.currentView = 'survey';
        this.currentSectionIndex = 0;
        this.currentSubsectionIndex = 0;
        this.renderSurvey();
    },

    // Render Survey Section
    renderSurvey() {
        const sectionKey = SECTIONS_ORDER[this.currentSectionIndex];
        const section = SURVEY_DATA[sectionKey];
        const subsection = section.subsections[this.currentSubsectionIndex];

        let html = renderSectionHeader(section);

        if (subsection.title) {
            html += renderSubsectionTitle(subsection.title);
        }

        if (subsection.hint) {
            html += `<p style="color: var(--text-secondary); margin-bottom: 1rem;">${subsection.hint}</p>`;
        }

        // Render questions
        let questionNum = 1;
        subsection.questions.forEach(q => {
            html += renderQuestion(q, this.responses[q.id], questionNum++);
        });

        // Add BMI result if on BMI section
        if (sectionKey === 'physical' && subsection.title.includes('น้ำหนัก')) {
            html += `<div id="bmi-result">${renderBMIResult(this.responses.height, this.responses.weight)}</div>`;
        }

        document.getElementById('main-content').innerHTML = html;
        document.getElementById('nav-buttons').style.display = 'flex';
        document.getElementById('progress-container').style.display = 'flex';

        // Update progress
        this.updateProgress();

        // Update navigation buttons
        this.updateNavButtons();

        // Save current position
        localStorage.setItem('wellbeing_survey_section', JSON.stringify({
            sectionIndex: this.currentSectionIndex,
            subsectionIndex: this.currentSubsectionIndex
        }));

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Render Results
    async renderResults() {
        this.currentView = 'results';

        // Auto-save to central server if configured
        if (GOOGLE_SCRIPT_URL) {
            showToast('กำลังบันทึกข้อมูล...', 'info');
            const success = await submitResponseToGAS(this.responses, GOOGLE_SCRIPT_URL);
            if (success) {
                showToast('ส่งข้อมูลเรียบร้อยแล้ว', 'success');
            } else {
                showToast('ไม่สามารถส่งข้อมูลได้', 'error');
            }
        }

        document.getElementById('main-content').innerHTML = renderResults(this.responses, this.userInfo);
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Handle input change
    handleChange(id, value) {
        this.responses[id] = value;
        saveResponses(this.responses);
        if (this.userInfo) this.debouncedSaveCloud(); // Auto-save to cloud

        // Update BMI if height or weight changed
        if (id === 'height' || id === 'weight') {
            const bmiContainer = document.getElementById('bmi-result');
            if (bmiContainer) {
                bmiContainer.innerHTML = renderBMIResult(this.responses.height, this.responses.weight);
            }
        }

        showToast('บันทึกแล้ว', 'success');
    },

    // Handle checkbox change
    handleCheckbox(id, value, checked, maxSelect) {
        if (!this.responses[id]) {
            this.responses[id] = [];
        }

        const arr = Array.isArray(this.responses[id]) ? this.responses[id] : [];

        if (checked) {
            if (arr.length >= maxSelect) {
                // Uncheck the checkbox
                document.querySelector(`input[value="${value}"]`).checked = false;
                showToast(`เลือกได้ไม่เกิน ${maxSelect} ข้อ`, 'error');
                return;
            }
            if (!arr.includes(value)) {
                arr.push(value);
            }
        } else {
            const idx = arr.indexOf(value);
            if (idx > -1) {
                arr.splice(idx, 1);
            }
        }

        this.responses[id] = arr;
        saveResponses(this.responses);
        if (this.userInfo) this.debouncedSaveCloud(); // Auto-save to cloud
        showToast('บันทึกแล้ว', 'success');
    },

    // Update progress bar
    updateProgress() {
        let totalSubsections = 0;
        let currentPosition = 0;

        SECTIONS_ORDER.forEach((key, sIndex) => {
            const section = SURVEY_DATA[key];
            section.subsections.forEach((sub, subIndex) => {
                totalSubsections++;
                if (sIndex < this.currentSectionIndex ||
                    (sIndex === this.currentSectionIndex && subIndex < this.currentSubsectionIndex)) {
                    currentPosition++;
                }
            });
        });

        // Include current subsection
        currentPosition++;

        const percentage = Math.round((currentPosition / totalSubsections) * 100);
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${percentage}%`;
    },

    // Update navigation buttons
    updateNavButtons() {
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');

        // Disable prev if at start
        prevBtn.disabled = (this.currentSectionIndex === 0 && this.currentSubsectionIndex === 0);

        // Check if at last subsection of last section
        const lastSectionKey = SECTIONS_ORDER[SECTIONS_ORDER.length - 1];
        const lastSection = SURVEY_DATA[lastSectionKey];
        const isLast = (this.currentSectionIndex === SECTIONS_ORDER.length - 1 &&
            this.currentSubsectionIndex === lastSection.subsections.length - 1);

        if (isLast) {
            nextBtn.innerHTML = 'ดูผลสรุป <span class="btn-icon">✓</span>';
        } else {
            nextBtn.innerHTML = 'ถัดไป <span class="btn-icon">→</span>';
        }
    },

    // Next section
    nextSection() {
        const sectionKey = SECTIONS_ORDER[this.currentSectionIndex];
        const section = SURVEY_DATA[sectionKey];

        // Check if there are more subsections
        if (this.currentSubsectionIndex < section.subsections.length - 1) {
            this.currentSubsectionIndex++;
            this.renderSurvey();
        } else if (this.currentSectionIndex < SECTIONS_ORDER.length - 1) {
            // Move to next section
            this.currentSectionIndex++;
            this.currentSubsectionIndex = 0;
            this.renderSurvey();
        } else {
            // Survey complete
            this.renderResults();
        }
    },

    // Previous section
    prevSection() {
        if (this.currentSubsectionIndex > 0) {
            this.currentSubsectionIndex--;
            this.renderSurvey();
        } else if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            const prevSectionKey = SECTIONS_ORDER[this.currentSectionIndex];
            const prevSection = SURVEY_DATA[prevSectionKey];
            this.currentSubsectionIndex = prevSection.subsections.length - 1;
            this.renderSurvey();
        }
    },

    // Handle time input change
    handleTimeChange(questionId) {
        const hour = document.getElementById(`${questionId}_hour`).value;
        const minute = document.getElementById(`${questionId}_minute`).value;

        if (hour && minute) {
            const timeValue = `${hour}:${minute}`;
            this.responses[questionId] = timeValue;
            saveResponses(this.responses);

            // Update hidden input used for other logic if any
            const hiddenInput = document.getElementById(questionId);
            if (hiddenInput) hiddenInput.value = timeValue;

            showToast('บันทึกเวลาแล้ว', 'success');
        }
    },

    // Edit responses (go back to survey)
    editResponses() {
        this.currentView = 'survey';
        this.currentSectionIndex = 0;
        this.currentSubsectionIndex = 0;
        this.renderSurvey();
    },

    // Start new survey
    startNew() {
        if (confirm('ต้องการเริ่มใหม่หรือไม่? ข้อมูลเดิมจะถูกลบ')) {
            clearResponses();
            this.responses = {};
            // Also clear cloud draft? Maybe not automatically, but let's assume new start overrides.
            // Actually better to keep cloud draft until explicitly overwritten or separate action?
            // For now, local start new just clears local. Cloud overwrite happens on next specific save.

            this.currentSectionIndex = 0;
            this.currentSubsectionIndex = 0;
            this.renderWelcome();
            showToast('เริ่มใหม่แล้ว', 'success');
        }
    },

    // Save Draft to Cloud
    async saveDraftToCloud() {
        if (!this.userInfo || !GOOGLE_SCRIPT_URL) return;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveDraft',
                    email: this.userInfo.email,
                    data: this.responses
                })
            });
            console.log('Draft saved to cloud');
        } catch (e) {
            console.error('Failed to save draft', e);
        }
    },

    // Load Draft from Cloud
    async loadDraftFromCloud() {
        if (!this.userInfo || !GOOGLE_SCRIPT_URL) return;

        try {
            const url = `${GOOGLE_SCRIPT_URL}?action=getDraft&email=${encodeURIComponent(this.userInfo.email)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && Object.keys(data).length > 0) {
                // Determine if cloud draft is newer or has more data than local?
                // Simple logic: If local is empty, use cloud. If both exist, prompt user?
                // For seamless experience: Merge changes? 
                // Let's go with: If local is empty or user just logged in and we want to sync state.

                const localData = loadResponses();
                if (Object.keys(localData).length === 0) {
                    this.responses = data;
                    saveResponses(this.responses);
                    showToast('โหลดข้อมูลเดิมจาก Cloud แล้ว', 'success');
                    if (this.currentView === 'welcome') {
                        // Optional: Auto start if data loaded?
                        // Let user decide to click start.
                    }
                } else {
                    // Conflict resolution: complex. 
                    // Simple approach: Toast "Found cloud draft"
                    console.log('Found cloud draft, but local data exists.');
                }
            }
        } catch (e) {
            console.error('Failed to load draft', e);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
