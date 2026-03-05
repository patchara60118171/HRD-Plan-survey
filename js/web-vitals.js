// =============================================
// Web Vitals Monitoring - Core Web Vitals v3
// ติดตามประสิทธิภาพการทำงานของเว็บไซต์
// =============================================

class WebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      // Core Web Vitals Thresholds (Google's recommendations)
      LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
      FID: { good: 100, poor: 300 },         // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
      FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
      TTFB: { good: 800, poor: 1800 },      // Time to First Byte
      INP: { good: 200, poor: 500 }         // Interaction to Next Paint (new)
    };
    
    this.onMetricCallbacks = [];
    this.isInitialized = false;
    
    this.init();
  }

  // ============================================
  // Initialization
  // ============================================
  init() {
    if (this.isInitialized) return;
    
    // ตรวจสอบว่า browser รองรับ Performance API หรือไม่
    if (!('performance' in window)) {
      console.warn('[WebVitals] Performance API not supported');
      return;
    }

    this.setupObservers();
    this.setupPerformanceEntries();
    
    this.isInitialized = true;
    console.log('[WebVitals] Monitoring initialized');
  }

  // ============================================
  // Core Web Vitals Observers
  // ============================================
  setupObservers() {
    // CLS - Cumulative Layout Shift
    this.observeCLS();
    
    // LCP - Largest Contentful Paint
    this.observeLCP();
    
    // FID - First Input Delay
    this.observeFID();
    
    // FCP - First Contentful Paint
    this.observeFCP();
    
    // TTFB - Time to First Byte
    this.observeTTFB();
    
    // INP - Interaction to Next Paint (v3)
    this.observeINP();
  }

  // ============================================
  // CLS Observer
  // ============================================
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      let clsValue = 0;
      let sessionEntries = [];
      let sessionValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // ไม่นับ layout shifts ที่เกิดจากการโต้ตอบของผู้ใช้
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // ถ้าเกิน 1 วินาทีหรือมี 5 วินาที gap ให้เริ่ม session ใหม่
            if (sessionValue &&
                entry.startTime - lastSessionEntry.startTime > 1000 &&
                entry.startTime - firstSessionEntry.startTime > 5000) {
              sessionValue = 0;
              sessionEntries = [];
            }
            
            sessionValue += entry.value;
            sessionEntries.push(entry);
            
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
            }
          }
        }
        
        this.reportMetric('CLS', clsValue, sessionEntries);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Report final CLS on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.reportMetric('CLS', clsValue, sessionEntries);
        }
      });
      
    } catch (e) {
      console.warn('[WebVitals] CLS observation failed:', e);
    }
  }

  // ============================================
  // LCP Observer
  // ============================================
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      let lcpValue = 0;
      let lcpEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        lcpValue = lastEntry.startTime;
        lcpEntries.push(lastEntry);
        
        this.reportMetric('LCP', lcpValue, lastEntry);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Report final LCP on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.reportMetric('LCP', lcpValue, lcpEntries[lcpEntries.length - 1]);
        }
      });
      
    } catch (e) {
      console.warn('[WebVitals] LCP observation failed:', e);
    }
  }

  // ============================================
  // FID Observer
  // ============================================
  observeFID() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // FID = processingStart - startTime
          const fid = entry.processingStart - entry.startTime;
          
          this.reportMetric('FID', fid, entry);
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      
    } catch (e) {
      console.warn('[WebVitals] FID observation failed:', e);
    }
  }

  // ============================================
  // FCP Observer
  // ============================================
  observeFCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.reportMetric('FCP', entry.startTime, entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      
    } catch (e) {
      console.warn('[WebVitals] FCP observation failed:', e);
    }
  }

  // ============================================
  // TTFB Observer
  // ============================================
  observeTTFB() {
    // TTFB ใช้ Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        
        if (navEntry) {
          const ttfb = navEntry.responseStart - navEntry.startTime;
          this.reportMetric('TTFB', ttfb, navEntry);
        }
      }, 0);
    });
  }

  // ============================================
  // INP Observer (Interaction to Next Paint)
  // ============================================
  observeINP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      let inpValue = 0;
      let interactions = [];
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId > 0) {
            const duration = entry.processingEnd - entry.startTime;
            
            interactions.push({
              id: entry.interactionId,
              duration: duration,
              entry: entry
            });
            
            // INP คือ interaction ที่ช้าที่สุด (98th percentile)
            interactions.sort((a, b) => b.duration - a.duration);
            const percentileIndex = Math.floor(interactions.length * 0.02);
            inpValue = interactions[percentileIndex]?.duration || interactions[0]?.duration || 0;
            
            this.reportMetric('INP', inpValue, entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['event'] });
      
    } catch (e) {
      console.warn('[WebVitals] INP observation failed:', e);
    }
  }

  // ============================================
  // Additional Performance Entries
  // ============================================
  setupPerformanceEntries() {
    // Resource Loading
    this.observeResources();
    
    // Long Tasks
    this.observeLongTasks();
    
    // Memory Usage
    this.observeMemory();
  }

  observeResources() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // ตรวจสอบ slow resources (> 1 วินาที)
          if (entry.duration > 1000) {
            this.reportMetric('SlowResource', entry.duration, {
              name: entry.name,
              initiatorType: entry.initiatorType,
              duration: entry.duration
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
    } catch (e) {
      console.warn('[WebVitals] Resource observation failed:', e);
    }
  }

  observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Long task คือ > 50ms
          this.reportMetric('LongTask', entry.duration, {
            startTime: entry.startTime,
            duration: entry.duration
          });
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      
    } catch (e) {
      console.warn('[WebVitals] LongTask observation failed:', e);
    }
  }

  observeMemory() {
    // ตรวจสอบ memory ทุก 30 วินาที
    if (performance && performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.totalJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;
        
        this.reportMetric('Memory', usedMB, {
          usedMB: Math.round(usedMB),
          totalMB: Math.round(totalMB),
          limitMB: Math.round(limitMB),
          percentage: Math.round((usedMB / limitMB) * 100)
        });
      }, 30000);
    }
  }

  // ============================================
  // Metric Reporting
  // ============================================
  reportMetric(name, value, entry) {
    const threshold = this.thresholds[name];
    let rating = 'good';
    
    if (threshold) {
      if (value > threshold.poor) {
        rating = 'poor';
      } else if (value > threshold.good) {
        rating = 'needs-improvement';
      }
    }
    
    const metric = {
      name: name,
      value: value,
      rating: rating,
      entry: entry,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.metrics[name] = metric;
    
    // เรียก callbacks
    this.onMetricCallbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (e) {
        console.error('[WebVitals] Callback error:', e);
      }
    });
    
    // ส่งไปยัง Analytics
    this.sendToAnalytics(metric);
    
    console.log(`[WebVitals] ${name}: ${value} (${rating})`);
    
    // แสดง Toast ถ้าเป็น Poor (เฉพาะ development)
    if (rating === 'poor' && window.location.hostname === 'localhost') {
      console.warn(`[WebVitals] Poor ${name}: ${value}`);
    }
  }

  // ============================================
  // Analytics Integration
  // ============================================
  sendToAnalytics(metric) {
    // ส่งไป Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating
      });
    }
    
    // ส่งไป Error Tracker
    if (typeof errorTracker !== 'undefined') {
      errorTracker.addBreadcrumb({
        category: 'performance',
        message: `${metric.name}: ${Math.round(metric.value)} (${metric.rating})`,
        level: metric.rating === 'poor' ? 'warning' : 'info'
      });
    }
    
    // เก็บใน localStorage สำหรับ Debug
    this.saveToLocalStorage(metric);
  }

  saveToLocalStorage(metric) {
    try {
      const metrics = JSON.parse(localStorage.getItem('web_vitals_metrics') || '[]');
      metrics.push(metric);
      
      // เก็บแค่ 100 รายการล่าสุด
      if (metrics.length > 100) {
        metrics.shift();
      }
      
      localStorage.setItem('web_vitals_metrics', JSON.stringify(metrics));
    } catch (e) {
      // Ignore
    }
  }

  // ============================================
  // Public API
  // ============================================
  onMetric(callback) {
    this.onMetricCallbacks.push(callback);
    
    // ส่ง metrics ที่มีอยู่แล้ว
    Object.values(this.metrics).forEach(metric => {
      callback(metric);
    });
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getMetric(name) {
    return this.metrics[name];
  }

  getAllMetrics() {
    return JSON.parse(localStorage.getItem('web_vitals_metrics') || '[]');
  }

  clearStoredMetrics() {
    localStorage.removeItem('web_vitals_metrics');
  }

  // ============================================
  // Performance Dashboard
  // ============================================
  generateReport() {
    const metrics = this.getMetrics();
    const report = {
      summary: {
        overall: 'unknown',
        poor: 0,
        'needs-improvement': 0,
        good: 0
      },
      details: metrics
    };
    
    // คำนวณ overall score
    Object.values(metrics).forEach(metric => {
      report.summary[metric.rating]++;
    });
    
    const total = Object.keys(metrics).length;
    if (report.summary.poor > 0) {
      report.summary.overall = 'needs-improvement';
    } else if (report.summary['needs-improvement'] > total * 0.3) {
      report.summary.overall = 'needs-improvement';
    } else if (total > 0) {
      report.summary.overall = 'good';
    }
    
    return report;
  }

  // ============================================
  // Utility Methods
  // ============================================
  getThresholds() {
    return { ...this.thresholds };
  }

  setThreshold(metric, thresholds) {
    if (this.thresholds[metric]) {
      this.thresholds[metric] = { ...this.thresholds[metric], ...thresholds };
    }
  }
}

// สร้าง instance สำหรับใช้งานทั่วไป
const webVitalsMonitor = new WebVitalsMonitor();

// Helper functions
function onWebVitalsMetric(callback) {
  return webVitalsMonitor.onMetric(callback);
}

function getWebVitalsMetrics() {
  return webVitalsMonitor.getMetrics();
}

function getWebVitalsReport() {
  return webVitalsMonitor.generateReport();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebVitalsMonitor, webVitalsMonitor };
}
