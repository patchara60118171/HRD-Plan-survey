// ========================================
// Admin Module - Dashboard + Analytics
// ========================================

// ========================================
// Admin Dashboard (from admin-dashboard.js)
// ========================================

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.surveyData = [];
        this.ch1Data = [];
        this.orgsData = [];
        this.surveyForms = [];
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        // Logout button
        const logoutBtn = document.querySelector('button[onclick*="doLogout"]');
        if (logoutBtn) {
            logoutBtn.removeAttribute('onclick');
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation
        document.querySelectorAll('.ni').forEach(navItem => {
            navItem.addEventListener('click', () => {
                const section = navItem.dataset.section;
                const page = navItem.dataset.pg;
                if (page) this.navigateToPage(page);
            });
        });

        // Refresh button
        const refreshBtn = document.querySelector('button[onclick*="refreshPg"]');
        if (refreshBtn) {
            refreshBtn.removeAttribute('onclick');
            refreshBtn.addEventListener('click', () => this.refreshCurrentPage());
        }
    }

    async checkAuthState() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLogin();
        }
    }

    async handleLogin(form) {
        const email = form.email.value;
        const password = form.password.value;
        const errorElement = document.getElementById('l-err');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.showDashboard();

        } catch (error) {
            console.error('Login failed:', error);
            if (errorElement) {
                errorElement.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            }
        }
    }

    async handleLogout() {
        try {
            await supabase.auth.signOut();
            this.showLogin();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    showLogin() {
        const loginScreen = document.getElementById('lo');
        const appScreen = document.getElementById('app');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (appScreen) appScreen.style.display = 'none';
    }

    showDashboard() {
        const loginScreen = document.getElementById('lo');
        const appScreen = document.getElementById('app');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (appScreen) appScreen.style.display = 'block';

        // Update user info
        this.updateUserInfo();
        
        // Load dashboard data
        this.loadDashboardData();
    }

    updateUserInfo() {
        const avatar = document.getElementById('sbav');
        const name = document.getElementById('sbnm');
        
        if (avatar && this.currentUser) {
            const email = this.currentUser.email || 'A';
            avatar.textContent = email.charAt(0).toUpperCase();
        }
        
        if (name) {
            name.textContent = this.currentUser?.user_metadata?.name || 'Admin';
        }
    }

    async loadInitialData() {
        if (!this.currentUser) return;

        try {
            this.showLoading(true);
            
            // Load data in parallel
            const [surveyData, ch1Data, orgsData, surveyForms] = await Promise.all([
                this.loadSurveyData(),
                this.loadCH1Data(),
                this.loadOrganizationsData(),
                this.loadSurveyForms()
            ]);

            this.surveyData = surveyData || [];
            this.ch1Data = ch1Data || [];
            this.orgsData = orgsData || [];
            this.surveyForms = surveyForms || [];

            // Update dashboard stats
            this.updateDashboardStats();

        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showToast('โหลดข้อมูลล้มเหลว', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadSurveyData() {
        const { data, error } = await supabase
            .from('survey_responses')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async loadCH1Data() {
        const { data, error } = await supabase
            .from('hrd_ch1_responses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async loadOrganizationsData() {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('org_name_th', { ascending: true });

        if (error) throw error;
        return data;
    }

    async loadSurveyForms() {
        const { data, error } = await supabase
            .from('survey_forms')
            .select('*')
            .order('form_name', { ascending: true });

        if (error) throw error;
        return data;
    }

    updateDashboardStats() {
        // Update organization count
        const orgCount = document.getElementById('ds-o');
        if (orgCount) orgCount.textContent = this.orgsData.length.toLocaleString();

        // Update total responses
        const totalCount = document.getElementById('ds-t');
        if (totalCount) totalCount.textContent = (this.surveyData.length + this.ch1Data.length).toLocaleString();

        // Update wellbeing responses
        const wellbeingCount = document.getElementById('ds-w');
        if (wellbeingCount) wellbeingCount.textContent = this.surveyData.length.toLocaleString();

        // Update CH1 responses
        const ch1Count = document.getElementById('ds-c');
        if (ch1Count) ch1Count.textContent = this.ch1Data.length.toLocaleString();

        // Update today's responses
        const todayCount = document.getElementById('ds-td');
        if (todayCount) {
            const today = new Date().toISOString().split('T')[0];
            const todayResponses = [
                ...this.surveyData.filter(r => r.submitted_at?.startsWith(today)),
                ...this.ch1Data.filter(r => r.created_at?.startsWith(today))
            ].length;
            todayCount.textContent = todayResponses.toLocaleString();
        }

        // Update month's responses
        const monthCount = document.getElementById('ds-mo');
        if (monthCount) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const monthResponses = [
                ...this.surveyData.filter(r => r.submitted_at?.startsWith(currentMonth)),
                ...this.ch1Data.filter(r => r.created_at?.startsWith(currentMonth))
            ].length;
            monthCount.textContent = monthResponses.toLocaleString();
        }

        // Update status
        const orgStatus = document.getElementById('ds-os');
        if (orgStatus) orgStatus.textContent = 'ข้อมูลล่าสุด';
    }

    navigateToPage(page) {
        // Hide all pages
        document.querySelectorAll('.pg').forEach(pg => {
            pg.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`pg-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        this.updateNavigation(page);
        this.updateTopBar(page);

        // Load page-specific data
        this.loadPageData(page);
    }

    updateNavigation(page) {
        // Update active navigation item
        document.querySelectorAll('.ni').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.pg === page) {
                item.classList.add('active');
            }
        });
    }

    updateTopBar(page) {
        const title = document.getElementById('tbt');
        const subtitle = document.getElementById('tbsub');

        const pageTitles = {
            dashboard: { title: 'แดชบอร์ด', subtitle: 'ภาพรวมระบบ' },
            organizations: { title: 'จัดการองค์กร', subtitle: 'ข้อมูลหน่วยงาน' },
            urls: { title: 'URL Manager', subtitle: 'จัดการลิงก์' },
            'resp-wellbeing': { title: 'Wellbeing Survey', subtitle: 'ข้อมูลการตอบกลับ' },
            'resp-ch1': { title: 'HRD บทที่ 1', subtitle: 'ข้อมูลการตอบกลับ' },
            analytics: { title: 'สถิติ & Analytics', subtitle: 'วิเคราะห์ข้อมูล' },
            users: { title: 'จัดการผู้ใช้', subtitle: 'บัญชีผู้ใช้งาน' },
            settings: { title: 'ตั้งค่า', subtitle: 'การตั้งค่าระบบ' }
        };

        const pageInfo = pageTitles[page] || { title: page, subtitle: '' };
        
        if (title) title.textContent = pageInfo.title;
        if (subtitle) subtitle.textContent = pageInfo.subtitle;
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'resp-wellbeing':
                await this.loadWellbeingResponses();
                break;
            case 'resp-ch1':
                await this.loadCH1Responses();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
            // Add other pages as needed
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading(true);

            // Load charts
            await this.loadDashboardCharts();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showToast('โหลดข้อมูลแดชบอร์ดล้มเหลว', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadDashboardCharts() {
        // 30-day responses chart
        await this.load30DayChart();

        // Form distribution pie chart
        await this.loadFormDistributionChart();

        // Top organizations chart
        await this.loadTopOrganizationsChart();
    }

    async load30DayChart() {
        const ctx = document.getElementById('ch-tr');
        if (!ctx) return;

        // Generate last 30 days data
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }

        const wellbeingData = last30Days.map(date => 
            this.surveyData.filter(r => r.submitted_at?.startsWith(date)).length
        );

        const ch1Data = last30Days.map(date => 
            this.ch1Data.filter(r => r.created_at?.startsWith(date)).length
        );

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last30Days.map(d => d.slice(5)),
                datasets: [
                    {
                        label: 'Wellbeing',
                        data: wellbeingData,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'HRD CH1',
                        data: ch1Data,
                        borderColor: '#d97706',
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    async loadFormDistributionChart() {
        const ctx = document.getElementById('ch-pi');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Wellbeing Survey', 'HRD บทที่ 1'],
                datasets: [{
                    data: [this.surveyData.length, this.ch1Data.length],
                    backgroundColor: ['#16a34a', '#d97706'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async loadTopOrganizationsChart() {
        const ctx = document.getElementById('ch-ob');
        if (!ctx) return;

        // Count responses by organization
        const orgCounts = {};
        
        [...this.surveyData, ...this.ch1Data].forEach(response => {
            const org = response.organization || response.org_code || 'Unknown';
            orgCounts[org] = (orgCounts[org] || 0) + 1;
        });

        // Sort and get top 10
        const topOrgs = Object.entries(orgCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topOrgs.map(([org]) => org),
                datasets: [{
                    label: 'การตอบกลับ',
                    data: topOrgs.map(([, count]) => count),
                    backgroundColor: '#2563eb',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    async loadWellbeingResponses() {
        // Implementation for loading wellbeing responses
        console.log('Loading wellbeing responses...');
    }

    async loadCH1Responses() {
        // Implementation for loading CH1 responses
        console.log('Loading CH1 responses...');
    }

    async loadAnalytics() {
        // Implementation for loading analytics
        console.log('Loading analytics...');
    }

    refreshCurrentPage() {
        const activePage = document.querySelector('.pg.active');
        if (activePage) {
            const pageId = activePage.id.replace('pg-', '');
            this.loadPageData(pageId);
        }
    }

    showLoading(show) {
        this.isLoading = show;
        const loadingOverlay = document.getElementById('lov');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('tc');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `tst ${type}`;
        toast.innerHTML = `
            ${message}
            <button class="tcl" onclick="this.parentElement.remove()">×</button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
}

// ========================================
// Google Analytics Integration (from analytics.js)
// ========================================

class GoogleAnalytics {
    constructor() {
        this.isInitialized = false;
        this.measurementId = window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;

        try {
            // Load gtag script
            this.loadGtagScript();
            
            // Initialize GA
            this.initializeGA();
            
            this.isInitialized = true;
            console.log('[GoogleAnalytics] Initialized');
            
        } catch (error) {
            console.error('[GoogleAnalytics] Failed to initialize:', error);
        }
    }

    loadGtagScript() {
        // Create gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        
        document.head.appendChild(script);
    }

    initializeGA() {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // gtag function
        window.gtag = function() {
            dataLayer.push(arguments);
        };

        // Default configuration
        gtag('js', new Date());
        gtag('config', this.measurementId, {
            // Custom configuration
            anonymize_ip: true,
            cookie_flags: 'SameSite=Lax;Secure'
        });

        // Track page view
        this.trackPageView();
    }

    trackPageView(pageTitle, pageLocation) {
        if (!this.isInitialized) return;

        gtag('event', 'page_view', {
            page_title: pageTitle || document.title,
            page_location: pageLocation || window.location.href
        });
    }

    trackEvent(eventName, eventParameters) {
        if (!this.isInitialized) return;

        gtag('event', eventName, eventParameters);
    }

    trackFormSubmission(formName, formData = {}) {
        this.trackEvent('form_submit', {
            form_name: formName,
            form_data: JSON.stringify(formData)
        });
    }

    trackUserLogin(userId, method = 'email') {
        this.trackEvent('login', {
            method: method,
            user_id: userId
        });
    }

    trackUserLogout() {
        this.trackEvent('logout');
    }

    trackDownload(fileName, fileType) {
        this.trackEvent('download', {
            file_name: fileName,
            file_type: fileType
        });
    }

    trackError(error, context = {}) {
        this.trackEvent('error', {
            error_message: error.message || error,
            error_stack: error.stack,
            context: JSON.stringify(context)
        });
    }

    trackPerformance(metricName, value, unit = 'ms') {
        this.trackEvent('performance_metric', {
            metric_name: metricName,
            value: value,
            unit: unit
        });
    }

    // Custom event for survey interactions
    trackSurveyStep(stepNumber, stepName) {
        this.trackEvent('survey_step', {
            step_number: stepNumber,
            step_name: stepName
        });
    }

    trackSurveyCompletion(surveyType, completionTime) {
        this.trackEvent('survey_complete', {
            survey_type: surveyType,
            completion_time: completionTime
        });
    }

    trackFileUpload(fileName, fileSize, fileType) {
        this.trackEvent('file_upload', {
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType
        });
    }
}

// ========================================
// EXPORTS
// ========================================

window.AdminModule = {
    AdminDashboard,
    GoogleAnalytics
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
    window.googleAnalytics = new GoogleAnalytics();
});
