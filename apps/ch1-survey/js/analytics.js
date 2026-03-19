// =============================================
// Google Analytics 4 Integration
// ติดตามการใช้งานและพฤติกรรมผู้ใช้
// =============================================

class GoogleAnalytics {
  constructor() {
    this.MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'; // ต้องแก้ไข
    this.isInitialized = false;
    this.userProperties = {};
    this.currentPage = null;
    
    this.init();
  }

  // ============================================
  // Initialization
  // ============================================
  init() {
    if (this.isInitialized) return;
    
    // โหลด gtag script
    this.loadGtagScript();
    
    // ตั้งค่า Default Config
    this.setupDefaultConfig();
    
    // ติดตาม Page View อัตโนมัติ
    this.setupPageTracking();
    
    // ติดตาม Events สำคัญ
    this.setupEventTracking();
    
    this.isInitialized = true;
    console.log('[GoogleAnalytics] Initialized with ID:', this.MEASUREMENT_ID);
  }

  loadGtagScript() {
    // สร้าง dataLayer ถ้ายังไม่มี
    window.dataLayer = window.dataLayer || [];
    
    // สร้าง gtag function
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // ตั้งค่าเริ่มต้น
    window.gtag('js', new Date());
    window.gtag('config', this.MEASUREMENT_ID, {
      'send_page_view': false, // จัดการเองเพื่อควบคุมได้มากขึ้น
      'anonymize_ip': true, // GDPR Compliance
      'allow_google_signals': false, // Privacy focused
      'allow_ad_personalization_signals': false,
      'custom_map': {
        'dimension1': 'organization',
        'dimension2': 'user_type',
        'dimension3': 'survey_step',
        'dimension4': 'error_type'
      }
    });
    
    // โหลด script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  setupDefaultConfig() {
    // ตั้งค่า User Properties เริ่มต้น
    this.setUserProperties({
      app_version: '3.1.0',
      platform: 'web',
      language: navigator.language,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  // ============================================
  // Page Tracking
  // ============================================
  setupPageTracking() {
    // Track initial page
    this.trackPageView();
    
    // Track SPA navigation (ถ้ามี)
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
    
    // Track hash changes
    window.addEventListener('hashchange', () => {
      this.trackPageView();
    });
  }

  trackPageView(pagePath, pageTitle) {
    const path = pagePath || window.location.pathname;
    const title = pageTitle || document.title;
    
    // ไม่ส่งถ้าหน้าเดิม
    if (this.currentPage === path) return;
    this.currentPage = path;
    
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
      send_to: this.MEASUREMENT_ID
    });
    
    console.log('[GoogleAnalytics] Page view:', path);
  }

  // ============================================
  // Event Tracking
  // ============================================
  setupEventTracking() {
    // Track Form Interactions
    this.trackFormEvents();
    
    // Track Button Clicks
    this.trackButtonClicks();
    
    // Track Survey Progress
    this.trackSurveyProgress();
    
    // Track Errors
    this.trackErrors();
  }

  trackFormEvents() {
    // Form Start
    document.addEventListener('form:start', (e) => {
      this.trackEvent('survey', 'form_start', {
        form_name: e.detail?.formName || 'wellbeing_survey',
        organization: e.detail?.organization
      });
    });

    // Form Submit
    document.addEventListener('form:submit', (e) => {
      this.trackEvent('survey', 'form_submit', {
        form_name: e.detail?.formName || 'wellbeing_survey',
        completion_time: e.detail?.completionTime,
        total_steps: e.detail?.totalSteps,
        organization: e.detail?.organization
      });
    });

    // Form Abandon
    document.addEventListener('form:abandon', (e) => {
      this.trackEvent('survey', 'form_abandon', {
        form_name: e.detail?.formName || 'wellbeing_survey',
        last_step: e.detail?.lastStep,
        time_spent: e.detail?.timeSpent,
        organization: e.detail?.organization
      });
    });
  }

  trackButtonClicks() {
    // Track all button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, .btn, [role="button"]');
      if (!button) return;
      
      const buttonText = button.textContent?.trim() || button.value || 'unknown';
      const buttonId = button.id || button.name || 'unnamed';
      const section = button.closest('[data-section]')?.dataset.section || 'unknown';
      
      // ไม่ track sensitive buttons (เช่น password fields)
      if (button.type === 'password' || button.closest('.sensitive')) return;
      
      this.trackEvent('engagement', 'button_click', {
        button_id: buttonId,
        button_text: buttonText.substring(0, 100), // Limit length
        section: section,
        page_path: window.location.pathname
      });
    });
  }

  trackSurveyProgress() {
    // Track step changes
    let lastStep = 0;
    let stepStartTime = Date.now();
    
    document.addEventListener('survey:step_change', (e) => {
      const newStep = e.detail?.step || 0;
      const timeOnStep = Date.now() - stepStartTime;
      
      if (newStep > lastStep) {
        // Moving forward - track step completion
        this.trackEvent('survey_progress', 'step_complete', {
          step_number: lastStep,
          time_spent_ms: timeOnStep,
          organization: e.detail?.organization
        });
      }
      
      lastStep = newStep;
      stepStartTime = Date.now();
      
      // Update custom dimension
      this.setUserProperties({
        current_step: newStep
      });
    });

    // Track survey completion
    document.addEventListener('survey:complete', (e) => {
      const totalTime = e.detail?.totalTime || 0;
      
      this.trackEvent('survey_progress', 'survey_complete', {
        total_time_ms: totalTime,
        organization: e.detail?.organization,
        value: 1 // For conversion tracking
      });
      
      // Mark as conversion
      this.trackConversion('survey_completion', {
        value: 1,
        currency: 'THB'
      });
    });
  }

  trackErrors() {
    // Track JavaScript errors
    window.addEventListener('error', (e) => {
      this.trackEvent('error', 'javascript_error', {
        error_message: e.message?.substring(0, 150),
        error_file: e.filename,
        error_line: e.lineno,
        page_path: window.location.pathname
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent('error', 'unhandled_promise', {
        error_message: String(e.reason)?.substring(0, 150),
        page_path: window.location.pathname
      });
    });
  }

  // ============================================
  // E-commerce / Conversion Tracking
  // ============================================
  trackConversion(conversionName, params = {}) {
    window.gtag('event', conversionName, {
      ...params,
      send_to: this.MEASUREMENT_ID
    });
  }

  // ============================================
  // Custom Events
  // ============================================
  trackEvent(category, action, params = {}) {
    const eventName = params.event_name || `${category}_${action}`;
    
    window.gtag('event', eventName, {
      event_category: category,
      event_action: action,
      ...params,
      send_to: this.MEASUREMENT_ID
    });
    
    console.log('[GoogleAnalytics] Event:', eventName, params);
  }

  trackTiming(category, variable, time, label) {
    window.gtag('event', 'timing_complete', {
      name: variable,
      value: Math.round(time),
      event_category: category,
      event_label: label
    });
  }

  // ============================================
  // User Properties
  // ============================================
  setUserProperties(properties) {
    this.userProperties = { ...this.userProperties, ...properties };
    
    window.gtag('set', 'user_properties', this.userProperties);
  }

  identifyUser(userId, userProperties = {}) {
    // ใช้ hashed email เป็น user_id (privacy safe)
    if (userId) {
      window.gtag('config', this.MEASUREMENT_ID, {
        user_id: this.hashString(userId)
      });
    }
    
    if (Object.keys(userProperties).length > 0) {
      this.setUserProperties(userProperties);
    }
  }

  // ============================================
  // Survey Specific Events
  // ============================================
  trackSurveyStart(organization) {
    this.trackEvent('survey', 'survey_start', {
      organization: organization,
      timestamp: new Date().toISOString()
    });
    
    this.setUserProperties({
      organization: organization,
      survey_started: true
    });
  }

  trackSurveyStep(stepNumber, stepName, timeSpent) {
    this.trackEvent('survey', 'step_view', {
      step_number: stepNumber,
      step_name: stepName,
      time_spent_seconds: Math.round(timeSpent / 1000)
    });
  }

  trackFieldInteraction(fieldName, fieldType, action) {
    this.trackEvent('engagement', 'field_interaction', {
      field_name: fieldName,
      field_type: fieldType,
      interaction_type: action
    });
  }

  trackAutoSave(success) {
    this.trackEvent('system', 'auto_save', {
      success: success
    });
  }

  trackOfflineMode(offline) {
    this.trackEvent('system', 'offline_mode', {
      offline: offline,
      timestamp: new Date().toISOString()
    });
  }

  // ============================================
  // Utility Methods
  // ============================================
  hashString(str) {
    // Simple hash function (ไม่ใช่ cryptographic hash)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Disable tracking (for privacy)
  disableTracking() {
    window[`ga-disable-${this.MEASUREMENT_ID}`] = true;
    console.log('[GoogleAnalytics] Tracking disabled');
  }

  // Enable tracking
  enableTracking() {
    window[`ga-disable-${this.MEASUREMENT_ID}`] = false;
    console.log('[GoogleAnalytics] Tracking enabled');
  }

  // Get consent status
  setConsent(granted) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }
}

// สร้าง instance สำหรับใช้งานทั่วไป
const ga = new GoogleAnalytics();

// Helper functions
function gtag() {
  window.dataLayer.push(arguments);
}

function trackEvent(category, action, params) {
  return ga.trackEvent(category, action, params);
}

function trackPageView(pagePath, pageTitle) {
  return ga.trackPageView(pagePath, pageTitle);
}

function trackConversion(conversionName, params) {
  return ga.trackConversion(conversionName, params);
}

function identifyUser(userId, userProperties) {
  return ga.identifyUser(userId, userProperties);
}

function trackSurveyStart(organization) {
  return ga.trackSurveyStart(organization);
}

function trackSurveyStep(stepNumber, stepName, timeSpent) {
  return ga.trackSurveyStep(stepNumber, stepName, timeSpent);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoogleAnalytics, ga };
}
