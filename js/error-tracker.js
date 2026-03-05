// =============================================
// Error Tracking & Monitoring - Sentry Integration
// ติดตามข้อผิดพลาดและประสิทธิภาพของระบบ
// =============================================

class ErrorTracker {
  constructor() {
    this.isInitialized = false;
    this.userContext = null;
    this.breadcrumbs = [];
    this.MAX_BREADCRUMBS = 100;
    
    // DSN สำหรับ Sentry (ต้องแก้ไขเป็นของโปรเจคจริง)
    this.SENTRY_DSN = window.SENTRY_DSN || null;
    
    // Environment
    this.environment = window.location.hostname === 'localhost' ? 'development' : 
                       window.location.hostname.includes('vercel.app') ? 'production' : 'staging';
    
    this.init();
  }

  // ============================================
  // Initialization
  // ============================================
  init() {
    if (this.isInitialized) return;
    
    try {
      // ตั้งค่า Global Error Handlers
      this.setupGlobalErrorHandlers();
      
      // ตั้งค่า Network Error Tracking
      this.setupNetworkTracking();
      
      // ตั้งค่า Console Tracking
      this.setupConsoleTracking();
      
      // ตั้งค่า Performance Tracking
      this.setupPerformanceTracking();
      
      // ตั้งค่า Unhandled Promise Rejection
      this.setupPromiseRejectionHandler();
      
      this.isInitialized = true;
      console.log('[ErrorTracker] Initialized successfully');
      
      this.captureMessage('ErrorTracker initialized', 'info');
    } catch (error) {
      console.error('[ErrorTracker] Failed to initialize:', error);
    }
  }

  // ============================================
  // Global Error Handlers
  // ============================================
  setupGlobalErrorHandlers() {
    // Error Handler
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error'
      });
      
      // แสดง Error ให้ผู้ใช้ถ้าเป็น Production
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

  // ============================================
  // Network Error Tracking
  // ============================================
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
        
        // บันทึกถ้า Error
        if (!response.ok) {
          this.captureMessage(`HTTP ${response.status}: ${response.statusText}`, 'warning', {
            url,
            status: response.status,
            statusText: response.statusText,
            duration
          });
        }
        
        // บันทึกถ้าช้า (> 5 วินาที)
        if (duration > 5000) {
          this.captureMessage('Slow network request detected', 'warning', {
            url,
            duration: Math.round(duration),
            threshold: 5000
          });
        }
        
        return response;
      } catch (error) {
        this.captureException(error, {
          type: 'network_error',
          url,
          method: options.method || 'GET'
        });
        throw error;
      }
    };

    // Override XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      let requestUrl;
      let startTime;
      
      xhr.open = function(method, url, ...args) {
        requestUrl = url;
        return originalOpen.apply(this, [method, url, ...args]);
      };
      
      xhr.send = function(...args) {
        startTime = performance.now();
        
        xhr.addEventListener('loadend', function() {
          const duration = performance.now() - startTime;
          
          if (!this.status || this.status >= 400) {
            errorTracker.captureMessage(`XHR Error: ${this.status}`, 'error', {
              url: requestUrl,
              status: this.status,
              statusText: this.statusText,
              duration: Math.round(duration)
            });
          }
        });
        
        return originalSend.apply(this, args);
      };
      
      return xhr;
    };
  }

  // ============================================
  // Console Tracking
  // ============================================
  setupConsoleTracking() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      // ไม่บันทึกถ้าเป็น Error ที่ตัวเองสร้าง (ป้องกัน loop)
      const isOwnError = args.some(arg => 
        typeof arg === 'string' && arg.includes('[ErrorTracker]')
      );
      
      if (!isOwnError) {
        this.captureMessage(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '), 'error');
      }
      
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const isOwnWarning = args.some(arg => 
        typeof arg === 'string' && arg.includes('[ErrorTracker]')
      );
      
      if (!isOwnWarning) {
        this.captureMessage(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '), 'warning');
      }
      
      originalWarn.apply(console, args);
    };
  }

  // ============================================
  // Performance Tracking
  // ============================================
  setupPerformanceTracking() {
    // Track Long Tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Long task > 50ms
              this.captureMessage('Long task detected', 'warning', {
                duration: Math.round(entry.duration),
                entryType: entry.entryType,
                startTime: entry.startTime
              });
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Browser might not support longtask
      }
    }

    // Track Memory (ถ้าใช้ Chrome)
    if (performance && performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        const usedHeapSize = memory.usedJSHeapSize / 1048576; // MB
        const totalHeapSize = memory.totalJSHeapSize / 1048576; // MB
        
        if (usedHeapSize > 100) { // Alert if > 100MB
          this.captureMessage('High memory usage detected', 'warning', {
            usedHeapSize: Math.round(usedHeapSize),
            totalHeapSize: Math.round(totalHeapSize),
            usedPercentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
          });
        }
      }, 60000); // Check every minute
    }
  }

  // ============================================
  // Promise Rejection Handler
  // ============================================
  setupPromiseRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
    });

    window.addEventListener('rejectionhandled', (event) => {
      this.addBreadcrumb({
        category: 'promise',
        message: 'Promise rejection handled',
        level: 'info'
      });
    });
  }

  // ============================================
  // Error Capture Methods
  // ============================================
  captureException(error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...context
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        ...this.userContext
      },
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      environment: this.environment,
      release: '3.1.0'
    };

    // ส่งไปยัง Sentry ถ้ามี DSN
    if (this.SENTRY_DSN) {
      this.sendToSentry(errorData);
    }

    // เก็บไว้ใน LocalStorage สำหรับ Debug
    this.saveToLocalStorage(errorData);

    console.error('[ErrorTracker]', errorData);
    
    return errorData;
  }

  captureMessage(message, level = 'info', extra = {}) {
    const eventData = {
      timestamp: new Date().toISOString(),
      message,
      level,
      extra,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...this.userContext
      },
      breadcrumbs: this.breadcrumbs.slice(-5),
      environment: this.environment,
      release: '3.1.0'
    };

    if (this.SENTRY_DSN && (level === 'error' || level === 'fatal')) {
      this.sendToSentry(eventData);
    }

    this.saveToLocalStorage(eventData);

    if (level === 'error' || level === 'fatal') {
      console.error('[ErrorTracker]', message, extra);
    }

    return eventData;
  }

  // ============================================
  // Context & Breadcrumbs
  // ============================================
  setUserContext(user) {
    this.userContext = {
      email: user.email,
      id: user.id,
      organization: user.organization
    };
  }

  addBreadcrumb(breadcrumb) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date().toISOString()
    });

    // เก็บแค่ MAX_BREADCRUMBS รายการ
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.MAX_BREADCRUMBS);
    }
  }

  // ============================================
  // Sentry Integration
  // ============================================
  async sendToSentry(eventData) {
    try {
      const response = await fetch(this.SENTRY_DSN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        console.warn('[ErrorTracker] Failed to send to Sentry:', response.statusText);
      }
    } catch (error) {
      console.warn('[ErrorTracker] Sentry connection failed:', error);
    }
  }

  // ============================================
  // Local Storage
  // ============================================
  saveToLocalStorage(data) {
    try {
      const errors = JSON.parse(localStorage.getItem('error_tracker_logs') || '[]');
      errors.push(data);
      
      // เก็บแค่ 50 รายการล่าสุด
      if (errors.length > 50) {
        errors.shift();
      }
      
      localStorage.setItem('error_tracker_logs', JSON.stringify(errors));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('error_tracker_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  clearStoredErrors() {
    localStorage.removeItem('error_tracker_logs');
  }

  // ============================================
  // User Notification
  // ============================================
  showUserErrorNotification(event) {
    // สร้าง Toast แจ้งเตือนผู้ใช้แบบไม่รบกวน
    if (typeof showToast === 'function') {
      showToast('พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
    }
  }

  // ============================================
  // Utility Methods
  // ============================================
  setTag(key, value) {
    this.addBreadcrumb({
      category: 'tag',
      message: `Set tag: ${key}=${value}`,
      data: { key, value }
    });
  }

  setExtra(key, value) {
    this.addBreadcrumb({
      category: 'extra',
      message: `Set extra: ${key}`,
      data: { key, value }
    });
  }
}

// สร้าง instance สำหรับใช้งานทั่วไป
const errorTracker = new ErrorTracker();

// Helper functions
function captureException(error, context) {
  return errorTracker.captureException(error, context);
}

function captureMessage(message, level, extra) {
  return errorTracker.captureMessage(message, level, extra);
}

function setUserContext(user) {
  return errorTracker.setUserContext(user);
}

function addBreadcrumb(breadcrumb) {
  return errorTracker.addBreadcrumb(breadcrumb);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorTracker, errorTracker };
}
