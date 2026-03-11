// ========================================
// Admin Module - Dashboard + Analytics
// ========================================

// ========================================
// Admin Dashboard (from admin-dashboard.js)
// ========================================

class AdminDashboard {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.dataCache = new Map();
        this.charts = new Map();
    }

    // Authentication
    async authenticate(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            
            this.isAuthenticated = true;
            this.currentUser = data.user;
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    // Data Management
    async loadSurveyData() {
        try {
            const { data, error } = await supabase
                .from('hrd_ch1_responses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.dataCache.set('surveyData', data);
            return data;
        } catch (error) {
            console.error('Failed to load survey data:', error);
            return [];
        }
    }

    // User Management
    async loadUsers() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.dataCache.set('users', data);
            return data;
        } catch (error) {
            console.error('Failed to load users:', error);
            return [];
        }
    }

    // Organization Management
    async loadOrganizations() {
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .order('name');

            if (error) throw error;
            
            this.dataCache.set('organizations', data);
            return data;
        } catch (error) {
            console.error('Failed to load organizations:', error);
            return [];
        }
    }

    // Statistics
    async getStatistics() {
        try {
            const surveyData = this.dataCache.get('surveyData') || await this.loadSurveyData();
            
            const stats = {
                totalResponses: surveyData.length,
                todayResponses: surveyData.filter(r => 
                    new Date(r.created_at).toDateString() === new Date().toDateString()
                ).length,
                completionRate: this.calculateCompletionRate(surveyData),
                topOrganizations: this.getTopOrganizations(surveyData)
            };

            return stats;
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return {};
        }
    }

    calculateCompletionRate(data) {
        if (!data.length) return 0;
        
        const completed = data.filter(r => r.submitted_at).length;
        return Math.round((completed / data.length) * 100);
    }

    getTopOrganizations(data) {
        const orgCounts = {};
        
        data.forEach(response => {
            const org = response.organization || 'Unknown';
            orgCounts[org] = (orgCounts[org] || 0) + 1;
        });

        return Object.entries(orgCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }

    // Export Functions
    async exportToCSV(data, filename) {
        try {
            const csv = this.convertToCSV(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Chart Functions
    createChart(canvasId, type, data, options) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: type,
                data: data,
                options: options
            });

            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('Chart creation failed:', error);
            return null;
        }
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    // Refresh Data
    async refreshData() {
        try {
            await Promise.all([
                this.loadSurveyData(),
                this.loadUsers(),
                this.loadOrganizations()
            ]);

            this.updateUI();
        } catch (error) {
            console.error('Data refresh failed:', error);
        }
    }

    updateUI() {
        // Update statistics display
        this.updateStatistics();
        
        // Update charts
        this.updateCharts();
        
        // Update tables
        this.updateTables();
    }

    updateStatistics() {
        const stats = this.getStatistics();
        
        // Update DOM elements
        const totalEl = document.getElementById('stat-total');
        const todayEl = document.getElementById('stat-today');
        const completionEl = document.getElementById('stat-completion');
        
        if (totalEl) totalEl.textContent = stats.totalResponses || 0;
        if (todayEl) todayEl.textContent = stats.todayResponses || 0;
        if (completionEl) completionEl.textContent = `${stats.completionRate || 0}%`;
    }

    updateCharts() {
        // Implementation for updating charts
        console.log('Updating charts...');
    }

    updateTables() {
        // Implementation for updating tables
        console.log('Updating tables...');
    }
}

// ========================================
// Google Analytics (from analytics.js)
// ========================================

class GoogleAnalytics {
    constructor() {
        this.MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
        this.isInitialized = false;
        this.userProperties = {};
        this.currentPage = null;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.loadGtagScript();
        this.setupDefaultConfig();
        this.setupPageTracking();
        this.setupEventTracking();
        
        this.isInitialized = true;
        console.log('[GoogleAnalytics] Initialized with ID:', this.MEASUREMENT_ID);
    }

    loadGtagScript() {
        window.dataLayer = window.dataLayer || [];
        
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };
        
        window.gtag('js', new Date());
        window.gtag('config', this.MEASUREMENT_ID, {
            'send_page_view': false,
            'debug_mode': window.location.hostname === 'localhost'
        });
    }

    setupDefaultConfig() {
        // Set default user properties
        this.setUserProperty('app_version', '3.1.0');
        this.setUserProperty('platform', 'web');
    }

    setupPageTracking() {
        // Track initial page view
        this.trackPageView(window.location.pathname);
        
        // Track page changes for SPA
        let lastPath = window.location.pathname;
        
        const observer = new MutationObserver(() => {
            const currentPath = window.location.pathname;
            if (currentPath !== lastPath) {
                this.trackPageView(currentPath);
                lastPath = currentPath;
            }
        });
        
        observer.observe(document, { subtree: true, childList: true });
    }

    setupEventTracking() {
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.id) {
                this.trackEvent('form_submit', {
                    form_id: form.id,
                    form_name: form.name || 'unnamed'
                });
            }
        });

        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && button.id) {
                this.trackEvent('button_click', {
                    button_id: button.id,
                    button_text: button.textContent?.trim()
                });
            }
        });

        // Track file downloads
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href$=".pdf"], a[href$=".csv"], a[href$=".xlsx"]');
            if (link) {
                this.trackEvent('file_download', {
                    file_url: link.href,
                    file_name: link.download || link.textContent?.trim()
                });
            }
        });
    }

    trackPageView(path) {
        if (!this.isInitialized) return;
        
        this.currentPage = path;
        
        window.gtag('config', this.MEASUREMENT_ID, {
            page_path: path,
            page_location: window.location.href,
            page_title: document.title
        });

        console.log('[GA] Page view:', path);
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized) return;
        
        const eventParams = {
            ...parameters,
            ...this.userProperties
        };

        window.gtag('event', eventName, eventParams);

        console.log('[GA] Event:', eventName, eventParams);
    }

    setUserProperty(property, value) {
        this.userProperties[property] = value;
        
        if (this.isInitialized) {
            window.gtag('config', this.MEASUREMENT_ID, {
                [property]: value
            });
        }
    }

    // Custom Events
    trackFormStart(formName) {
        this.trackEvent('form_start', {
            form_name: formName,
            timestamp: new Date().toISOString()
        });
    }

    trackFormComplete(formName, duration) {
        this.trackEvent('form_complete', {
            form_name: formName,
            completion_time: duration,
            timestamp: new Date().toISOString()
        });
    }

    trackFormError(formName, error) {
        this.trackEvent('form_error', {
            form_name: formName,
            error_message: error,
            timestamp: new Date().toISOString()
        });
    }

    trackLogin(method = 'email') {
        this.trackEvent('login', {
            method: method,
            timestamp: new Date().toISOString()
        });
    }

    trackLogout() {
        this.trackEvent('logout', {
            timestamp: new Date().toISOString()
        });
    }

    trackDataExport(format, recordCount) {
        this.trackEvent('data_export', {
            format: format,
            record_count: recordCount,
            timestamp: new Date().toISOString()
        });
    }

    // E-commerce Events (for future use)
    trackViewItem(itemId, itemName, category) {
        this.trackEvent('view_item', {
            item_id: itemId,
            item_name: itemName,
            item_category: category
        });
    }

    trackSearch(searchTerm) {
        this.trackEvent('search', {
            search_term: searchTerm,
            timestamp: new Date().toISOString()
        });
    }

    // Performance Tracking
    trackPageLoadTime(loadTime) {
        this.trackEvent('page_load_time', {
            value: loadTime,
            custom_parameter_1: 'milliseconds'
        });
    }

    // Debug Mode
    enableDebugMode() {
        window.gtag('config', this.MEASUREMENT_ID, {
            debug_mode: true
        });
        
        console.log('[GA] Debug mode enabled');
    }

    // Consent Management
    updateConsent(consentGranted) {
        window.gtag('consent', 'update', {
            'analytics_storage': consentGranted ? 'granted' : 'denied'
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

// Initialize instances
window.adminDashboard = new AdminDashboard();
window.googleAnalytics = new GoogleAnalytics();
