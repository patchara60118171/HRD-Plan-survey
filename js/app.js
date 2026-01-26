// ========================================
// Main Application - Survey Controller
// ========================================

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1089240671162-befa46lipnu4q9a4bokkjbr40qke6tcu.apps.googleusercontent.com';

// Google Apps Script URL (User must fill this)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby30NantvJX36X9ZHIw5DOSi-tMqGAXGoVUh9mWaZCEV5egrWckHgMS6Btw3k37FUtL/exec';

// Supabase Configuration
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';
let supabaseClient = null;

// Initialize Supabase (called after page load)
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
    }
}

// Save to Supabase
async function saveToSupabase(email, responses, isDraft = false) {
    if (!supabaseClient || !email) return false;

    try {
        // Calculate BMI if height and weight exist
        const height = parseFloat(responses.height);
        const weight = parseFloat(responses.weight);
        let bmi = null, bmiCategory = '';
        if (height && weight) {
            bmi = parseFloat(calculateBMI(height, weight));
            const bmiInfo = getBMICategory(bmi);
            bmiCategory = bmiInfo ? bmiInfo.category : '';
        }

        // Calculate TMHI score
        const tmhiScore = calculateTMHIScore(responses);
        const tmhiInfo = getTMHILevel(tmhiScore);

        const dataToSave = {
            email: email,
            name: responses.name || null,
            title: responses.title || null,
            gender: responses.gender || null,
            age: responses.age ? parseInt(responses.age) : null,
            org_type: responses.org_type || null, // Added new field
            height: height || null,
            weight: weight || null,
            waist: responses.waist ? parseFloat(responses.waist) : null,
            bmi: bmi,
            bmi_category: bmiCategory,
            tmhi_score: tmhiScore || null,
            tmhi_level: tmhiInfo ? tmhiInfo.level : null,
            raw_responses: responses,
            is_draft: isDraft,
            submitted_at: isDraft ? null : new Date().toISOString()
        };

        // Upsert: update if exists, insert if not
        const { data, error } = await supabaseClient
            .from('survey_responses')
            .upsert(dataToSave, {
                onConflict: 'email',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('Supabase save error:', error);
            return false;
        }

        console.log('Saved to Supabase:', isDraft ? 'draft' : 'submitted');
        return true;
    } catch (e) {
        console.error('Supabase save exception:', e);
        return false;
    }
}

// Load from Supabase by email
async function loadFromSupabase(email) {
    if (!supabaseClient || !email) return null;

    try {
        const { data, error } = await supabaseClient
            .from('survey_responses')
            .select('*')
            .eq('email', email)
            .eq('is_draft', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Supabase load error:', error);
            return null;
        }

        if (data && data.raw_responses) {
            console.log('Loaded draft from Supabase');
            return data.raw_responses;
        }

        return null;
    } catch (e) {
        console.error('Supabase load exception:', e);
        return null;
    }
}

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
        // Initialize Supabase
        initSupabase();

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

        // Check for Google OAuth redirect (token in URL hash)
        this.handleGoogleRedirectCallback();

        // Init Google Sign-In
        this.initGoogleSignIn();

        // Show Welcome page first (with login button if not logged in)
        // If user has in-progress responses, continue survey
        if (Object.keys(this.responses).length > 0 && this.currentSectionIndex > 0 && this.userInfo) {
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
    },

    // Initialize Google Sign-In
    initGoogleSignIn() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => this.handleGoogleCallback(response),
                ux_mode: 'popup', // Force popup mode to avoid auto-redirect mismatch issues
                auto_select: false
            });
            // Also render button if user section is waiting
            if (!this.userInfo && document.getElementById('g_id_signin_button')) {
                this.renderGoogleButton();
            }
        }
    },

    // Handle Google OAuth Redirect Callback (for Safari/iOS Manual Flow)
    handleGoogleRedirectCallback() {
        // Check if URL hash contains token from OAuth redirect
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');

        if (idToken) {
            try {
                // Decode JWT token
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                this.userInfo = {
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture
                };
                this.accessToken = accessToken || idToken;

                // Clear hash from URL cleanly
                const cleanUrl = window.location.pathname + window.location.search;
                history.replaceState(null, '', cleanUrl);

                this.renderUserSection();
                showToast(`ยินดีต้อนรับ ${this.userInfo.name}!`, 'success');

                // Load draft from Supabase if exists
                if (this.loadDraftFromSupabase) {
                    this.loadDraftFromSupabase();
                }

                // Re-render Welcome if needed
                if (this.currentView === 'welcome') {
                    this.renderWelcome();
                }
            } catch (e) {
                console.error('Error parsing OAuth token:', e);
                showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
            }
        }
    },

    // Render Google Button (Official) with Fallback
    renderGoogleButton() {
        // 1. Retry logic if google is not defined yet
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            // Retry for 5 seconds total (10 * 500ms)
            if (!this.retryCount) this.retryCount = 0;
            if (this.retryCount < 10) {
                this.retryCount++;
                setTimeout(() => this.renderGoogleButton(), 500);
            }
            return;
        }

        // 2. Render Header Button
        const headerBtn = document.getElementById('g_id_signin_button');
        if (headerBtn) {
            google.accounts.id.renderButton(
                headerBtn,
                { theme: "outline", size: "large", type: "standard", shape: "pill", text: "signin_with" }
            );
        }
    },

    // Helper: Use Manual Google OAuth Redirect Flow (Best for iOS/Safari)
    useGoogleRedirectFlow() {
        // Must match EXACTLY what is in Google Cloud Console
        // We ensure no trailing slash (unless root) and no index.html
        let redirectUri = window.location.origin;
        if (redirectUri.endsWith('/')) {
            redirectUri = redirectUri.slice(0, -1);
        }

        // If we are on production, force the known good URI
        if (window.location.hostname === 'nidawellbeing.vercel.app') {
            redirectUri = 'https://nidawellbeing.vercel.app';
        }

        const scope = 'openid email profile';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token id_token` +
            `&scope=${encodeURIComponent(scope)}` +
            `&nonce=${Math.random().toString(36).substring(2)}`;

        console.log('Redirecting to Google Auth:', authUrl);
        window.location.href = authUrl;
    },

    // Google Login - Trigger strategy based on device
    googleLogin() {
        if (typeof google === 'undefined' || !google.accounts) {
            showToast('Google Sign-In ยังไม่พร้อม กรุณารอสักครู่', 'error');
            return;
        }

        // iOS/Safari detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Use Manual Redirect Flow for iOS or Safari to avoid Popup blocking and Mismatch issues
        if (isIOS || isSafari) {
            this.showGoogleSignInModal(true); // Show modal but trigger redirect on click
            return;
        }

        // Try prompt for others
        try {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    this.showGoogleSignInModal(false);
                }
            });
        } catch (e) {
            console.error('Google prompt failed:', e);
            this.showGoogleSignInModal(false);
        }
    },

    // Show Google Sign-In Modal for Safari/iOS
    showGoogleSignInModal(isManualRedirect = false) {
        // Create modal with Google Sign-In button
        const modal = document.createElement('div');
        modal.id = 'google-signin-modal';
        modal.innerHTML = `
            <div class="signin-modal-overlay">
                <div class="signin-modal-content">
                    <button class="signin-modal-close" onclick="document.getElementById('google-signin-modal').remove()">✕</button>
                    <h3 style="margin-bottom: 1rem; color: #1E293B;">เข้าสู่ระบบด้วย Google</h3>
                    <p style="color: #64748B; margin-bottom: 1.5rem; font-size: 0.9rem;">กรุณากดปุ่มด้านล่างเพื่อเข้าสู่ระบบ</p>
                    <div id="google-signin-btn-modal" style="display: flex; justify-content: center;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const btnContainer = document.getElementById('google-signin-btn-modal');

        if (isManualRedirect) {
            // Manual Button for iOS/Safari Redirect Flow
            const googleIconSvg = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>`;

            const manualBtn = document.createElement('button');
            manualBtn.className = 'google-login-btn-welcome';
            manualBtn.style.width = '280px';
            manualBtn.style.justifyContent = 'center';
            manualBtn.innerHTML = `${googleIconSvg} เข้าสู่ระบบด้วย Google`;
            manualBtn.onclick = () => this.useGoogleRedirectFlow();
            btnContainer.appendChild(manualBtn);
        } else {
            // Standard renderButton for other browsers fallback
            google.accounts.id.renderButton(
                btnContainer,
                {
                    theme: 'outline',
                    size: 'large',
                    type: 'standard',
                    shape: 'pill',
                    text: 'signin_with',
                    width: 280
                }
            );
        }
    },

    // Render Login Screen
    renderLoginScreen() {
        this.currentView = 'login';
        document.getElementById('main-content').innerHTML = renderLoginScreen();
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';

        // Hide Header User Section while on login screen? No, keep it.
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

            // Close modal if open
            const modal = document.getElementById('google-signin-modal');
            if (modal) modal.remove();

            this.renderUserSection();
            showToast(`ยินดีต้อนรับ ${this.userInfo.name}!`, 'success');

            // Load draft from Supabase if exists
            this.loadDraftFromSupabase();

            // Re-render Welcome to update buttons
            if (this.currentView === 'welcome') {
                this.renderWelcome();
            }
        }
    },

    // Logout
    logout() {
        this.userInfo = null;
        this.accessToken = null;
        this.responses = {}; // Clear responses in memory

        // Clear LocalStorage
        localStorage.removeItem('wellbeing_survey_responses');
        localStorage.removeItem('wellbeing_survey_section');
        localStorage.removeItem('wellbeing_survey_timestamp');

        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }

        // Close profile dropdown if open
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) dropdown.classList.remove('show');

        this.renderUserSection();
        this.renderWelcome(); // Redirect to home
        showToast('ออกจากระบบแล้ว', 'info');
    },

    // Load draft from Supabase
    async loadDraftFromSupabase() {
        if (!this.userInfo || !this.userInfo.email) return;

        const cloudDraft = await loadFromSupabase(this.userInfo.email);
        if (cloudDraft && Object.keys(cloudDraft).length > 0) {
            // Check if cloud draft is newer than local
            const localDraft = loadResponses();
            if (Object.keys(cloudDraft).length >= Object.keys(localDraft).length) {
                this.responses = cloudDraft;
                saveResponses(cloudDraft);
                showToast('โหลดข้อมูลจาก Cloud สำเร็จ!', 'success');
            }
        }
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

        // Add BMI result if on body measurement section
        if (sectionKey === 'personal' && subsection.title.includes('ร่างกาย')) {
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

    // Render Review Screen
    renderReview() {
        this.currentView = 'review';
        document.getElementById('main-content').innerHTML = renderReviewScreen(this.responses);
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Submit Survey (Final Save)
    async submitSurvey() {
        showToast('กำลังบันทึกข้อมูล...', 'info');

        // Calculate and add BMI to responses before saving
        const height = parseFloat(this.responses.height);
        const weight = parseFloat(this.responses.weight);
        if (height && weight) {
            const bmi = calculateBMI(height, weight);
            const bmiInfo = getBMICategory(bmi);
            this.responses.bmi = bmi;
            this.responses.bmi_category = bmiInfo ? bmiInfo.category : '';
        }

        // Calculate and add TMHI score to responses
        const tmhiScore = calculateTMHIScore(this.responses);
        if (tmhiScore > 0) {
            const tmhiInfo = getTMHILevel(tmhiScore);
            this.responses.tmhi_score = tmhiScore;
            this.responses.tmhi_level = tmhiInfo ? tmhiInfo.level : '';
        }

        // 1. Save to Supabase (Primary)
        if (this.userInfo && this.userInfo.email) {
            const supabaseSuccess = await saveToSupabase(this.userInfo.email, this.responses, false);
            if (supabaseSuccess) {
                showToast('บันทึกข้อมูลสำเร็จ!', 'success');
            }
        }

        // 2. Also save to Google Apps Script (Backup)
        if (GOOGLE_SCRIPT_URL) {
            const success = await submitResponseToGAS(this.responses, GOOGLE_SCRIPT_URL);
            if (!success) {
                console.log('GAS backup save failed, but Supabase succeeded');
            }
        }

        // 3. Show Results
        this.renderResults();
    },

    // Render Results (Read Only)
    renderResults() {
        this.currentView = 'results';

        // No auto-save here anymore, moved to submitSurvey

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
            nextBtn.innerHTML = 'ตรวจสอบคำตอบ <span class="btn-icon">✓</span>';
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
            // Survey complete -> Go to Review
            this.renderReview();
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
