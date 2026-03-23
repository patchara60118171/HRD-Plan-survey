// ========================================
// TEST MODE - Random Data Generation
// ========================================

// Test Mode Configuration
const TEST_MODE = {
    enabled: false,
    totalRecords: 200,
    currentRecord: 0,
    orgDistribution: {}, // Will be populated with random counts per org
    
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

// Generate random test data for a single record
function generateRandomTestData(orgCode, recordNumber) {
    const org = TEST_MODE.organizations.find(o => o.code === orgCode) || TEST_MODE.organizations[0];
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    // Generate random responses for all survey questions
    const responses = {
        // User info
        email: `test.${orgCode}.${timestamp}.${random}@wellbeing.test`,
        name: `ทดสอบ ${org.name} ${recordNumber}`,
        title: ['เจ้าหน้าที่', 'นักวิชาการ', 'เจ้าหน้าที่บริหาร', 'ผู้ช่วย'][Math.floor(Math.random() * 4)],
        gender: ['male', 'female'][Math.floor(Math.random() * 2)],
        age: Math.floor(Math.random() * 35) + 20, // 20-55 years
        organization: org.name,
        org_type: ['หน่วยงานหลัก', 'หน่วยงานสนับสนุน'][Math.floor(Math.random() * 2)],
        
        // Body measurements
        height: (Math.random() * 40 + 150).toFixed(1), // 150-190 cm
        weight: (Math.random() * 40 + 45).toFixed(1), // 45-85 kg
        waist: Math.floor(Math.random() * 40 + 60), // 60-100 cm
        
        // PHQ-9 (Depression) - 9 questions, scale 0-3
        phq1: Math.floor(Math.random() * 4),
        phq2: Math.floor(Math.random() * 4),
        phq3: Math.floor(Math.random() * 4),
        phq4: Math.floor(Math.random() * 4),
        phq5: Math.floor(Math.random() * 4),
        phq6: Math.floor(Math.random() * 4),
        phq7: Math.floor(Math.random() * 4),
        phq8: Math.floor(Math.random() * 4),
        phq9: Math.floor(Math.random() * 4),
        
        // GAD-7 (Anxiety) - 7 questions, scale 0-3
        gad1: Math.floor(Math.random() * 4),
        gad2: Math.floor(Math.random() * 4),
        gad3: Math.floor(Math.random() * 4),
        gad4: Math.floor(Math.random() * 4),
        gad5: Math.floor(Math.random() * 4),
        gad6: Math.floor(Math.random() * 4),
        gad7: Math.floor(Math.random() * 4),
        
        // Sleep quality (0-3)
        sleep1: Math.floor(Math.random() * 4),
        sleep2: Math.floor(Math.random() * 4),
        sleep3: Math.floor(Math.random() * 4),
        
        // Work stress (0-3)
        work1: Math.floor(Math.random() * 4),
        work2: Math.floor(Math.random() * 4),
        work3: Math.floor(Math.random() * 4),
        work4: Math.floor(Math.random() * 4),
        work5: Math.floor(Math.random() * 4),
        
        // Life satisfaction (1-5)
        life1: Math.floor(Math.random() * 5) + 1,
        life2: Math.floor(Math.random() * 5) + 1,
        life3: Math.floor(Math.random() * 5) + 1,
        life4: Math.floor(Math.random() * 5) + 1,
        life5: Math.floor(Math.random() * 5) + 1,
        
        // Health behaviors
        exercise: Math.floor(Math.random() * 5), // 0-4 times per week
        smoking: ['never', 'former', 'current'][Math.floor(Math.random() * 3)],
        alcohol: ['never', 'occasional', 'regular'][Math.floor(Math.random() * 3)],
        
        // Chronic diseases (checkboxes)
        chronic: (Math.random() > 0.7) ? ['diabetes', 'hypertension', 'dyslipidemia'].slice(0, Math.floor(Math.random() * 3) + 1) : [],
        
        // Additional comments
        comments: Math.random() > 0.5 ? 'ทดสอบข้อมูลระบบ wellbeing survey' : ''
    };
    
    return responses;
}

// Calculate random distribution of 200 records across 16 orgs
function calculateOrgDistribution() {
    const totalOrgs = TEST_MODE.organizations.length;
    let remaining = TEST_MODE.totalRecords;
    const distribution = {};
    
    // Give each org at least 3 records
    TEST_MODE.organizations.forEach(org => {
        distribution[org.code] = 3;
        remaining -= 3;
    });
    
    // Distribute remaining randomly
    while (remaining > 0) {
        const randomOrg = TEST_MODE.organizations[Math.floor(Math.random() * totalOrgs)];
        distribution[randomOrg.code]++;
        remaining--;
    }
    
    return distribution;
}

// Run test mode - generate and submit 200 records
async function runTestMode() {
    if (!supabaseClient) {
        console.error('❌ Supabase not initialized');
        showToast('กรุณารอให้ระบบโหลดเสร็จก่อน', 'error');
        return;
    }
    
    TEST_MODE.enabled = true;
    TEST_MODE.orgDistribution = calculateOrgDistribution();
    
    console.log('🚀 Starting Test Mode - Generating 200 records');
    console.log('📊 Organization distribution:', TEST_MODE.orgDistribution);
    
    let successCount = 0;
    let failCount = 0;
    
    // Process each organization
    for (const org of TEST_MODE.organizations) {
        const count = TEST_MODE.orgDistribution[org.code];
        console.log(`\n🏢 Processing ${org.name} (${org.code}): ${count} records`);
        
        for (let i = 0; i < count; i++) {
            TEST_MODE.currentRecord++;
            
            // Generate random data
            const responses = generateRandomTestData(org.code, i + 1);
            
            // Calculate derived values
            const height = parseFloat(responses.height);
            const weight = parseFloat(responses.weight);
            let bmi = null, bmiCategory = '';
            if (height && weight) {
                bmi = parseFloat(calculateBMI(height, weight));
                const bmiInfo = getBMICategory(bmi);
                bmiCategory = bmiInfo ? bmiInfo.category : '';
            }
            
            const tmhiScore = calculateTMHIScore(responses);
            const tmhiInfo = getTMHILevel(tmhiScore);
            
            // Prepare data for Supabase
            const dataToSave = {
                email: responses.email,
                name: responses.name,
                title: responses.title,
                gender: responses.gender,
                age: responses.age,
                organization: responses.organization,
                org_type: responses.org_type,
                height: height || null,
                weight: weight || null,
                waist: responses.waist || null,
                bmi: bmi,
                bmi_category: bmiCategory,
                tmhi_score: tmhiScore || null,
                tmhi_level: tmhiInfo ? tmhiInfo.level : null,
                raw_responses: responses,
                is_draft: false,
                submitted_at: new Date().toISOString()
            };
            
            try {
                // Save to Supabase
                const { data, error } = await supabaseClient
                    .from('survey_responses')
                    .upsert(dataToSave, {
                        onConflict: 'email',
                        ignoreDuplicates: false
                    });
                
                if (error) {
                    console.error(`❌ Record ${TEST_MODE.currentRecord} failed:`, error.message);
                    failCount++;
                } else {
                    console.log(`✅ Record ${TEST_MODE.currentRecord}: ${responses.email}`);
                    successCount++;
                }
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (e) {
                console.error(`❌ Record ${TEST_MODE.currentRecord} exception:`, e.message);
                failCount++;
            }
            
            // Show progress every 20 records
            if (TEST_MODE.currentRecord % 20 === 0) {
                showToast(`กำลังบันทึก... ${TEST_MODE.currentRecord}/${TEST_MODE.totalRecords}`, 'info');
            }
        }
    }
    
    // Final summary
    console.log('\n🎉 Test Mode Complete!');
    console.log(`✅ Success: ${successCount} records`);
    console.log(`❌ Failed: ${failCount} records`);
    
    showToast(`บันทึกสำเร็จ ${successCount} รายการ`, 'success');
    
    TEST_MODE.enabled = false;
    TEST_MODE.currentRecord = 0;
    
    return { success: successCount, failed: failCount };
}

// Add test mode trigger to window for console access
window.enableTestMode = function() {
    console.log('🧪 Test Mode Enabled');
    console.log('ใช้คำสั่ง: runTestMode() เพื่อเริ่มสร้าง 200 records');
    return 'Test Mode Ready - Call runTestMode() to start';
};

window.runTestMode = runTestMode;
window.generateRandomTestData = generateRandomTestData;
window.TEST_MODE = TEST_MODE;

// ========================================
// Main Application - Survey Controller
// ========================================

// Google Apps Script URL (User must fill this)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby30NantvJX36X9ZHIw5DOSi-tMqGAXGoVUh9mWaZCEV5egrWckHgMS6Btw3k37FUtL/exec';

// Supabase Configuration (loaded from supabase-config.js)
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
            organization: responses.organization || null, // Organization from URL Parameter
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
    organization: null, // To store organization from URL parameter
    
    // Organization Mapping — synced with Supabase organizations table (SSOT) 2026-03-23
    // canonical codes: dhss(4), tmd(5), dcp(6), dop(7); legacy aliases kept for backward-compat
    orgMap: {
        'nesdc':     'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',       // 1
        'tpso':      'สำนักงานนโยบายและยุทธศาสตร์การค้า',                  // 2
        'dss':       'กรมวิทยาศาสตร์บริการ',                               // 3
        'dhss':      'กรมสนับสนุนบริการสุขภาพ',                            // 4 canonical
        'hssd':      'กรมสนับสนุนบริการสุขภาพ',                            // 4 legacy alias
        'tmd':       'กรมอุตุนิยมวิทยา',                                   // 5
        'dcp':       'กรมส่งเสริมวัฒนธรรม',                               // 6
        'dop':       'กรมคุมประพฤติ',                                       // 7 canonical
        'probation': 'กรมคุมประพฤติ',                                       // 7 legacy alias
        'mots':      'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',           // 8
        'dmh':       'กรมสุขภาพจิต',                                       // 9
        'onep':      'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', // 10
        'nrct':      'สำนักงานการวิจัยแห่งชาติ',                           // 11
        'acfs':      'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ',        // 12
        'opdc':      'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',        // 13 canonical
        'ocsc':      'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',        // 13 legacy alias
        'rid':       'กรมชลประทาน',                                         // 14
        'dcy':       'กรมกิจการเด็กและเยาวชน',                              // 15
        'test-org':  'หน่วยงานทดสอบระบบ',                                   // test
        'doh':       'กองฝึกอบรม กรมทางหลวง',                              // extra
    },

    // Initialize app
    async init() {
        // Parse URL Parameters for organization
        this.parseUrlParameters();

        // Initialize Supabase
        initSupabase();

        // Fetch form config overrides (silent — falls back to defaults on error)
        try {
            const cfgUrl = 'https://fgdommhiqhzvsedfzyrr.supabase.co/rest/v1/form_configs?form_id=eq.wellbeing&select=config_json&limit=1';
            const cfgKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';
            const cfgResp = await fetch(cfgUrl, { headers: { apikey: cfgKey, Authorization: 'Bearer ' + cfgKey } });
            const cfgData = await cfgResp.json();
            if (cfgData && cfgData[0] && cfgData[0].config_json && Object.keys(cfgData[0].config_json).length > 0) {
                applyWellbeingFormConfig(cfgData[0].config_json);
            }
        } catch (e) { /* silent — show default text */ }

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

            // Show welcome toast for organization after loading screen is hidden
            if (this.organization) {
                setTimeout(() => {
                    showToast(`ยินดีต้อนรับบุคลากรจาก ${this.organization}`, 'success');
                }, 500);
            }
        }, 500);

        // Show Welcome page first
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

    // Parse URL Parameters
    parseUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const orgCode = urlParams.get('org');
        const testMode = urlParams.get('testmode');
        
        // Check for test mode trigger
        if (testMode === 'true' || testMode === '1') {
            console.log('🧪 Test Mode detected in URL');
            this.showTestModeUI = true;
        }
        
        if (orgCode && this.orgMap[orgCode]) {
            this.organization = this.orgMap[orgCode];
            // Initialize or update responses with the mapped organization name
            if (!this.responses) this.responses = {};
            this.responses.organization = this.organization;
            console.log(`Organization detected: ${this.organization} (${orgCode})`);
            
            // Cleanup URL to make it look clean (optional, prevents copy-pasting wrong org)
            // history.replaceState(null, '', window.location.pathname);
        } else if (orgCode && !this.orgMap[orgCode]) {
            console.warn(`Unknown organization code: ${orgCode}`);
            showToast('รหัสองค์กรไม่ถูกต้อง', 'error');
        }
    },

    // Set user email
    setEmail() {
        const emailInput = document.getElementById('user-email-input');
        const email = emailInput.value.trim();

        if (!email) {
            showToast('กรุณากรอกอีเมล', 'error');
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('กรุณากรอกอีเมลให้ถูกต้อง', 'error');
            return;
        }

        this.userInfo = { email: email };
        this.renderUserSection();
        this.renderWelcome();
        showToast(`ยินดีต้อนรับ!`);

        // Load draft from Supabase if exists
        this.loadDraftFromSupabase();
    },

    // Logout
    logout() {
        this.userInfo = null;
        this.responses = {}; // Clear responses in memory

        // Clear LocalStorage
        localStorage.removeItem('wellbeing_survey_responses');
        localStorage.removeItem('wellbeing_survey_section');
        localStorage.removeItem('wellbeing_survey_timestamp');

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
            container.innerHTML = '';
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
        
        // Show test mode UI if triggered
        if (this.showTestModeUI) {
            this.renderTestModeUI();
            return;
        }
        
        document.getElementById('main-content').innerHTML = renderWelcome();
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
    },

    // Render Test Mode UI
    renderTestModeUI() {
        const orgList = TEST_MODE.organizations.map(org => 
            `<li>${org.name}: <span id="count-${org.code}">0</span> records</li>`
        ).join('');
        
        const html = `
            <div class="test-mode-container" style="padding: 2rem; max-width: 800px; margin: 0 auto;">
                <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                    <h1 style="margin: 0 0 1rem 0; font-size: 2rem;">🧪 Test Mode</h1>
                    <p style="margin: 0; font-size: 1.1rem;">ระบบทดสอบสำหรับสร้างข้อมูลสุ่ม 200 records</p>
                </div>
                
                <div class="card" style="padding: 2rem; margin-bottom: 2rem;">
                    <h2 style="margin-top: 0;">📊 การกระจายข้อมูล</h2>
                    <p>จำนวนรวม: <strong>200 records</strong> แบบสุ่มใน 16 หน่วยงาน</p>
                    <ul style="columns: 2; margin: 1rem 0;">
                        ${orgList}
                    </ul>
                </div>
                
                <div class="card" style="padding: 2rem; margin-bottom: 2rem;">
                    <h2 style="margin-top: 0;">⚙️ ตั้งค่า</h2>
                    <label style="display: block; margin-bottom: 1rem;">
                        จำนวน records:
                        <input type="number" id="test-record-count" value="200" min="1" max="500" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </label>
                    <p style="color: #666; font-size: 0.9rem;">* แต่ละ org จะได้รับขั้นต่ำ 3 records เสมอ</p>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="app.startTestMode()" class="btn btn-primary" style="flex: 1; padding: 1rem; font-size: 1.2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; cursor: pointer;">
                        🚀 เริ่มสร้างข้อมูล 200 Records
                    </button>
                    <button onclick="app.renderWelcome()" class="btn btn-secondary" style="padding: 1rem; font-size: 1rem; border-radius: 8px; cursor: pointer;">
                        ← กลับ
                    </button>
                </div>
                
                <div id="test-progress" style="margin-top: 2rem; display: none;">
                    <div class="card" style="padding: 2rem;">
                        <h3>⏳ กำลังดำเนินการ...</h3>
                        <div style="background: #f0f0f0; border-radius: 8px; height: 24px; margin: 1rem 0; overflow: hidden;">
                            <div id="test-progress-bar" style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                        <p id="test-progress-text">0 / 200 records (0%)</p>
                        <div id="test-results" style="margin-top: 1rem; font-family: monospace; font-size: 0.9rem; max-height: 300px; overflow-y: auto; background: #f8f8f8; padding: 1rem; border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = html;
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
    },

    // Start test mode with custom count
    async startTestMode() {
        const countInput = document.getElementById('test-record-count');
        const count = parseInt(countInput?.value) || 200;
        
        // Update TEST_MODE config
        TEST_MODE.totalRecords = count;
        
        // Show progress UI
        document.getElementById('test-progress').style.display = 'block';
        const progressBar = document.getElementById('test-progress-bar');
        const progressText = document.getElementById('test-progress-text');
        const resultsDiv = document.getElementById('test-results');
        
        // Run the test mode
        let successCount = 0;
        let failCount = 0;
        
        TEST_MODE.enabled = true;
        TEST_MODE.orgDistribution = calculateOrgDistribution();
        TEST_MODE.currentRecord = 0;
        
        console.log('🚀 Starting Test Mode');
        console.log('📊 Organization distribution:', TEST_MODE.orgDistribution);
        
        resultsDiv.innerHTML = '<p>🚀 เริ่มสร้างข้อมูล...</p>';
        
        for (const org of TEST_MODE.organizations) {
            const orgCount = TEST_MODE.orgDistribution[org.code];
            resultsDiv.innerHTML += `<p>🏢 ${org.name}: ${orgCount} records</p>`;
            
            for (let i = 0; i < orgCount; i++) {
                TEST_MODE.currentRecord++;
                
                // Generate random data
                const responses = generateRandomTestData(org.code, i + 1);
                
                // Calculate derived values
                const height = parseFloat(responses.height);
                const weight = parseFloat(responses.weight);
                let bmi = null, bmiCategory = '';
                if (height && weight) {
                    bmi = parseFloat(calculateBMI(height, weight));
                    const bmiInfo = getBMICategory(bmi);
                    bmiCategory = bmiInfo ? bmiInfo.category : '';
                }
                
                const tmhiScore = calculateTMHIScore(responses);
                const tmhiInfo = getTMHILevel(tmhiScore);
                
                // Prepare data for Supabase
                const dataToSave = {
                    email: responses.email,
                    name: responses.name,
                    title: responses.title,
                    gender: responses.gender,
                    age: responses.age,
                    organization: responses.organization,
                    org_type: responses.org_type,
                    height: height || null,
                    weight: weight || null,
                    waist: responses.waist || null,
                    bmi: bmi,
                    bmi_category: bmiCategory,
                    tmhi_score: tmhiScore || null,
                    tmhi_level: tmhiInfo ? tmhiInfo.level : null,
                    raw_responses: responses,
                    is_draft: false,
                    submitted_at: new Date().toISOString()
                };
                
                try {
                    // Save to Supabase
                    const { data, error } = await supabaseClient
                        .from('survey_responses')
                        .upsert(dataToSave, {
                            onConflict: 'email',
                            ignoreDuplicates: false
                        });
                    
                    if (error) {
                        console.error(`❌ ${org.code} #${i+1}:`, error.message);
                        resultsDiv.innerHTML += `<p style="color: red;">❌ ${org.code} #${i+1}: ${error.message.substring(0, 50)}</p>`;
                        failCount++;
                    } else {
                        console.log(`✅ ${org.code} #${i+1}: ${responses.email}`);
                        successCount++;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (e) {
                    console.error(`❌ ${org.code} #${i+1}:`, e.message);
                    resultsDiv.innerHTML += `<p style="color: red;">❌ ${org.code} #${i+1}: ${e.message.substring(0, 50)}</p>`;
                    failCount++;
                }
                
                // Update progress
                const progress = (TEST_MODE.currentRecord / TEST_MODE.totalRecords) * 100;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${TEST_MODE.currentRecord} / ${TEST_MODE.totalRecords} records (${Math.round(progress)}%)`;
            }
            
            // Update org count display
            const orgCountEl = document.getElementById(`count-${org.code}`);
            if (orgCountEl) orgCountEl.textContent = orgCount;
        }
        
        // Final summary
        progressBar.style.width = '100%';
        progressText.textContent = `เสร็จสิ้น! ${successCount} สำเร็จ, ${failCount} ล้มเหลว`;
        
        resultsDiv.innerHTML += `<div style="margin-top: 1rem; padding: 1rem; background: ${failCount === 0 ? '#d4edda' : '#fff3cd'}; border-radius: 4px;">`;
        resultsDiv.innerHTML += `<h3>${failCount === 0 ? '🎉 สำเร็จทั้งหมด!' : '⚠️ มีบางรายการล้มเหลว'}</h3>`;
        resultsDiv.innerHTML += `<p>✅ สำเร็จ: ${successCount} records</p>`;
        resultsDiv.innerHTML += `<p>❌ ล้มเหลว: ${failCount} records</p>`;
        resultsDiv.innerHTML += `<p style="margin-top: 1rem;"><strong>📧 ตัวอย่าง emails:</strong></p>`;
        
        // Show sample emails
        const sampleOrgs = TEST_MODE.organizations.slice(0, 3);
        sampleOrgs.forEach(org => {
            const sampleEmail = `test.${org.code}.${Date.now()}.1@wellbeing.test`;
            resultsDiv.innerHTML += `<p style="font-size: 0.85rem; margin: 0.25rem 0;">${org.code}: ${sampleEmail}</p>`;
        });
        
        resultsDiv.innerHTML += `<p style="margin-top: 1rem; color: #666;">ตรวจสอบข้อมูลใน Admin Panel</p>`;
        resultsDiv.innerHTML += `</div>`;
        
        showToast(`บันทึกเสร็จสิ้น! ${successCount} รายการ`, failCount === 0 ? 'success' : 'warning');
        
        TEST_MODE.enabled = false;
        TEST_MODE.currentRecord = 0;
    },

    // Start Survey
    startSurvey() {
        if (!this.userInfo) {
            showToast('กรุณากรอกอีเมลก่อนเริ่มทำแบบสำรวจ', 'error');
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
        // Calculate starting question number
        let questionNum = 1;
        for (let i = 0; i < this.currentSubsectionIndex; i++) {
            if (section.subsections[i].questions) {
                questionNum += section.subsections[i].questions.length;
            }
        }

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
