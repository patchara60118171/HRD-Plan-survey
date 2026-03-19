// ========================================
// Utils Module - Utility Functions + Error Tracker
// ========================================

// ========================================
// Error Tracker (from error-tracker.js)
// ========================================

class ErrorTracker {
    constructor() {
        this.isInitialized = false;
        this.userContext = null;
        this.breadcrumbs = [];
        this.MAX_BREADCRUMBS = 100;
        
        // DSN for Sentry (must be changed to actual project)
        this.SENTRY_DSN = window.SENTRY_DSN || null;
        
        // Environment
        this.environment = window.location.hostname === 'localhost' ? 'development' : 
                           window.location.hostname.includes('vercel.app') ? 'production' : 'staging';
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupGlobalErrorHandlers();
            this.setupNetworkTracking();
            this.setupConsoleTracking();
            this.setupPerformanceTracking();
            this.setupPromiseRejectionHandler();
            
            this.isInitialized = true;
            console.log('[ErrorTracker] Initialized successfully');
            
            this.captureMessage('ErrorTracker initialized', 'info');
        } catch (error) {
            console.error('[ErrorTracker] Failed to initialize:', error);
        }
    }

    setupGlobalErrorHandlers() {
        // Error Handler
        window.addEventListener('error', (event) => {
            this.captureException(event.error || new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                type: 'javascript_error'
            });
            
            // Show error to user if production
            if (this.environment === 'production') {
                this.showUserErrorNotification(event);
            }
        });

        // Unhandled Promise Rejection
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
            this.captureException(error, {
                type: 'unhandled_promise_rejection',
                reason: event.reason
            });
        });
    }

    setupNetworkTracking() {
        // Override fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [url, options = {}] = args;
            const startTime = performance.now();
            
            this.addBreadcrumb({
                category: 'fetch',
                message: `Fetching: ${url}`,
                data: { method: options.method || 'GET', url }
            });
            
            try {
                const response = await originalFetch.apply(window, args);
                const duration = performance.now() - startTime;
                
                this.addBreadcrumb({
                    category: 'fetch',
                    message: `Response: ${url}`,
                    data: { 
                        status: response.status, 
                        duration: Math.round(duration),
                        url 
                    }
                });
                
                return response;
            } catch (error) {
                const duration = performance.now() - startTime;
                
                this.captureException(error, {
                    type: 'network_error',
                    url,
                    method: options.method || 'GET',
                    duration: Math.round(duration)
                });
                
                throw error;
            }
        };
    }

    setupConsoleTracking() {
        // Track console errors
        const originalError = console.error;
        console.error = (...args) => {
            this.addBreadcrumb({
                category: 'console',
                message: 'console.error',
                data: { args: args.slice(0, 3) } // Limit to avoid large data
            });
            
            originalError.apply(console, args);
        };

        // Track console warnings
        const originalWarn = console.warn;
        console.warn = (...args) => {
            this.addBreadcrumb({
                category: 'console',
                message: 'console.warn',
                data: { args: args.slice(0, 3) }
            });
            
            originalWarn.apply(console, args);
        };
    }

    setupPerformanceTracking() {
        // Track page load
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.captureMessage('Page Performance', 'info', {
                            loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                            firstPaint: this.getFirstPaint()
                        });
                    }
                }, 0);
            });
        }
    }

    setupPromiseRejectionHandler() {
        // Already handled in setupGlobalErrorHandlers
    }

    captureException(error, context = {}) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...context
        };

        // Add breadcrumbs
        if (this.breadcrumbs.length > 0) {
            errorInfo.breadcrumbs = this.breadcrumbs.slice(-20); // Last 20 breadcrumbs
        }

        // Add user context
        if (this.userContext) {
            errorInfo.user = this.userContext;
        }

        // Log to console
        console.error('[ErrorTracker] Exception captured:', errorInfo);

        // Send to Sentry if available
        if (this.SENTRY_DSN && window.Sentry) {
            try {
                window.Sentry.captureException(error, {
                    extra: context,
                    tags: {
                        environment: this.environment
                    }
                });
            } catch (e) {
                console.error('[ErrorTracker] Failed to send to Sentry:', e);
            }
        }

        // Store locally for debugging
        this.storeErrorLocally(errorInfo);
    }

    captureMessage(message, level = 'info', context = {}) {
        const messageInfo = {
            message,
            level,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            ...context
        };

        console.log(`[ErrorTracker] ${level.toUpperCase()}:`, messageInfo);

        // Send to Sentry if available
        if (this.SENTRY_DSN && window.Sentry) {
            try {
                window.Sentry.captureMessage(message, level, {
                    extra: context,
                    tags: {
                        environment: this.environment
                    }
                });
            } catch (e) {
                console.error('[ErrorTracker] Failed to send message to Sentry:', e);
            }
        }
    }

    addBreadcrumb(breadcrumb) {
        this.breadcrumbs.push({
            ...breadcrumb,
            timestamp: new Date().toISOString()
        });

        // Limit breadcrumbs
        if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
            this.breadcrumbs = this.breadcrumbs.slice(-this.MAX_BREADCRUMBS);
        }
    }

    setUserContext(user) {
        this.userContext = {
            id: user.id || user.email,
            email: user.email,
            name: user.name,
            organization: user.organization
        };

        // Update Sentry context if available
        if (this.SENTRY_DSN && window.Sentry) {
            window.Sentry.setUser({
                id: this.userContext.id,
                email: this.userContext.email,
                username: this.userContext.name
            });
        }
    }

    clearUserContext() {
        this.userContext = null;
        
        if (this.SENTRY_DSN && window.Sentry) {
            window.Sentry.setUser(null);
        }
    }

    showUserErrorNotification(event) {
        // Create user-friendly error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <h4>เกิดข้อผิดพลาด</h4>
                <p>ขออภัยดาวเกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง</p>
                <button onclick="this.parentElement.parentElement.remove()">ปิด</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 8px;
            padding: 16px;
            max-width: 400px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    storeErrorLocally(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
            errors.push(errorInfo);
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('error_logs', JSON.stringify(errors));
        } catch (e) {
            console.error('[ErrorTracker] Failed to store error locally:', e);
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? Math.round(firstPaint.startTime) : null;
    }

    // Performance monitoring
    trackPerformance(metricName, value, unit = 'ms') {
        this.captureMessage('Performance Metric', 'info', {
            metric: metricName,
            value: value,
            unit: unit
        });
    }

    // User interaction tracking
    trackUserInteraction(action, element, details = {}) {
        this.addBreadcrumb({
            category: 'user',
            message: action,
            data: {
                element: element.tagName || element.id || 'unknown',
                ...details
            }
        });
    }
}

// ========================================
// Utility Functions (from utils.js)
// ========================================

// Toggle Profile Dropdown Menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const container = document.querySelector('.user-profile-container');
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && container && !container.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Calculate BMI
function calculateBMI(height, weight) {
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Get BMI Category
function getBMICategory(bmi) {
    if (!bmi) return null;
    const bmiNum = parseFloat(bmi);
    // WHO International Standard
    if (bmiNum < 18.5) return { category: 'น้ำหนักน้อย', class: 'underweight', emoji: '🔵' };
    if (bmiNum < 25) return { category: 'น้ำหนักปกติ', class: 'normal', emoji: '🟢' };
    if (bmiNum < 30) return { category: 'น้ำหนักเกิน', class: 'overweight', emoji: '🟡' };
    return { category: 'อ้วน', class: 'obese', emoji: '🔴' };
}

// Calculate TMHI-15 Score
function calculateTMHIScore(responses) {
    let score = 0;
    // TMHI-15 items: tmhi_1 to tmhi_15
    // Scoring: Not at all=1, A little=2, Much=3, Very much=4
    // Negative items (reverse score): 4, 5, 6 (1=4, 2=3, 3=2, 4=1)

    // Check if TMHI section is done
    if (!responses['tmhi_1']) return 0;

    const reverseItems = ['tmhi_4', 'tmhi_5', 'tmhi_6'];

    for (let i = 1; i <= 15; i++) {
        const key = `tmhi_${i}`;
        const val = parseInt(responses[key]) || 0;
        if (val === 0) continue; // Skip if not answered

        if (reverseItems.includes(key)) {
            score += (5 - val); // Reverse: 1->4, 2->3, 3->2, 4->1
        } else {
            score += val;
        }
    }
    return score;
}

// Get Mental Health Level (TMHI-15)
function getTMHILevel(score) {
    // Criteria:
    // <= 43: Poor (ต่ำกว่าคนทั่วไป)
    // 44 - 50: Average (เท่ากับคนทั่วไป)
    // 51 - 60: Good (สูงกว่าคนทั่วไป)

    if (score === 0) return { level: 'ยังทำไม่ครบ', class: 'none', emoji: '⚪' };
    if (score <= 43) return { level: 'ต่ำกว่าเกณฑ์เฉลี่ย (ควรดูแลใจ)', class: 'poor', emoji: '🌧️' };
    if (score <= 50) return { level: 'เกณฑ์ปกติ (ใจแข็งแรงดี)', class: 'average', emoji: '⛅' };
    return { level: 'สูงกว่าเกณฑ์เฉลี่ย (ใจฟูมาก)', class: 'good', emoji: '☀️' };
}

// Format time
function formatTime(hours, minutes) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m}`;
}

// Calculate sleep duration
function calculateSleepDuration(bedtime, wakeTime) {
    if (!bedtime || !wakeTime) return null;
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);

    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60;
    }

    return ((wakeMinutes - bedMinutes) / 60).toFixed(1);
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date
function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('th-TH');
    } else if (format === 'long') {
        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    return d.toLocaleDateString('th-TH');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generate random ID
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Deep clone object
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
}

// ========================================
// EXPORTS
// ========================================

window.UtilsModule = {
    ErrorTracker,
    // Utility functions
    toggleProfileMenu,
    calculateBMI,
    getBMICategory,
    calculateTMHIScore,
    getTMHILevel,
    formatTime,
    calculateSleepDuration,
    isValidEmail,
    formatNumber,
    formatDate,
    debounce,
    throttle,
    generateId,
    deepClone,
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage
};

// Initialize error tracker
window.errorTracker = new ErrorTracker();
