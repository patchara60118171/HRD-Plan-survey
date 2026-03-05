// =============================================
// Progress Persistence - บันทึกและกู้คืนความคืบหน้า
// =============================================

class ProgressPersistence {
  constructor() {
    this.STORAGE_KEY = 'ch1_progress';
    this.EMAIL_KEY = 'ch1_respondent_email';
    this.STEP_KEY = 'ch1_current_step';
    this.TIMESTAMP_KEY = 'ch1_progress_timestamp';
  }

  // บันทึกความคืบหน้าปัจจุบัน
  saveProgress(currentStep, formData = {}) {
    try {
      const progress = {
        currentStep: currentStep,
        formData: formData,
        timestamp: new Date().toISOString(),
        lastSaved: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
      localStorage.setItem(this.STEP_KEY, currentStep.toString());
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());

      console.log('[ProgressPersistence] Saved progress at step:', currentStep);
      return true;
    } catch (error) {
      console.error('[ProgressPersistence] Failed to save progress:', error);
      return false;
    }
  }

  // โหลดความคืบหน้าล่าสุด
  loadProgress() {
    try {
      const progressData = localStorage.getItem(this.STORAGE_KEY);
      if (!progressData) {
        return null;
      }

      const progress = JSON.parse(progressData);
      const savedStep = localStorage.getItem(this.STEP_KEY);
      
      // ตรวจสอบว่าข้อมูลยัง valid หรือไม่ (ไม่เกิน 7 วัน)
      const timestamp = parseInt(localStorage.getItem(this.TIMESTAMP_KEY) || '0');
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (now - timestamp > sevenDays) {
        console.log('[ProgressPersistence] Progress expired, clearing...');
        this.clearProgress();
        return null;
      }

      return {
        currentStep: savedStep ? parseInt(savedStep) : progress.currentStep,
        formData: progress.formData || {},
        timestamp: progress.timestamp,
        lastSaved: progress.lastSaved
      };
    } catch (error) {
      console.error('[ProgressPersistence] Failed to load progress:', error);
      return null;
    }
  }

  // บันทึกอีเมลผู้ตอบ
  saveEmail(email) {
    try {
      localStorage.setItem(this.EMAIL_KEY, email);
      return true;
    } catch (error) {
      console.error('[ProgressPersistence] Failed to save email:', error);
      return false;
    }
  }

  // โหลดอีเมลผู้ตอบ
  loadEmail() {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  // ล้างข้อมูลความคืบหน้า
  clearProgress() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STEP_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
      console.log('[ProgressPersistence] Progress cleared');
      return true;
    } catch (error) {
      console.error('[ProgressPersistence] Failed to clear progress:', error);
      return false;
    }
  }

  // ล้างข้อมูลทั้งหมดรวมถึงอีเมล
  clearAll() {
    this.clearProgress();
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem('ch1_form_data');
    localStorage.removeItem('ch1_auto_save');
    console.log('[ProgressPersistence] All data cleared');
  }

  // ตรวจสอบว่ามีข้อมูลที่ต้องกู้คืนหรือไม่
  hasProgress() {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  // ตรวจสอบว่ามีอีเมลที่บันทึกไว้หรือไม่
  hasEmail() {
    return !!localStorage.getItem(this.EMAIL_KEY);
  }

  // แสดงข้อมูลสรุปความคืบหน้า
  getProgressSummary() {
    const progress = this.loadProgress();
    if (!progress) {
      return null;
    }

    const savedDate = new Date(progress.timestamp);
    const now = new Date();
    const diffMs = now - savedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo;
    if (diffMins < 1) {
      timeAgo = 'เมื่อสักครู่';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} นาทีที่แล้ว`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} ชั่วโมงที่แล้ว`;
    } else {
      timeAgo = `${diffDays} วันที่แล้ว`;
    }

    return {
      currentStep: progress.currentStep,
      totalSteps: 6, // 0-5 (landing + 5 form steps)
      progressPercentage: Math.round((progress.currentStep / 5) * 100),
      lastSaved: timeAgo,
      timestamp: progress.timestamp,
      hasFormData: Object.keys(progress.formData).length > 0
    };
  }

  // ตั้งค่า Auto-save (เรียกทุก 30 วินาที)
  setupAutoSave(getCurrentStep, getFormData) {
    // บันทึกทุก 30 วินาที
    setInterval(() => {
      const step = getCurrentStep();
      const data = getFormData();
      if (step > 0) { // ไม่บันทึกถ้ายังอยู่หน้า landing
        this.saveProgress(step, data);
      }
    }, 30000);

    // บันทึกเมื่อเปลี่ยนหน้า
    window.addEventListener('beforeunload', () => {
      const step = getCurrentStep();
      const data = getFormData();
      if (step > 0) {
        this.saveProgress(step, data);
      }
    });

    console.log('[ProgressPersistence] Auto-save enabled');
  }

  // แสดง Dialog ให้ผู้ใช้เลือกกู้คืนข้อมูล
  showResumeDialog(onResume, onStartNew) {
    const summary = this.getProgressSummary();
    if (!summary) return false;

    // สร้าง Dialog
    const dialog = document.createElement('div');
    dialog.id = 'resume-dialog';
    dialog.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4';
    dialog.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">พบข้อมูลที่ยังตอบไม่เสร็จ</h3>
          <p class="text-slate-600">คุณมีแบบสอบถามที่บันทึกไว้เมื่อ ${summary.lastSaved}</p>
        </div>

        <div class="bg-slate-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-slate-600">ความคืบหน้า</span>
            <span class="text-sm font-semibold text-primary">${summary.progressPercentage}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div class="bg-primary h-2 rounded-full transition-all duration-500" style="width: ${summary.progressPercentage}%"></div>
          </div>
          <p class="text-xs text-slate-500">ส่วนที่ ${summary.currentStep} จาก ${summary.totalSteps - 1}</p>
        </div>

        <div class="space-y-3">
          <button id="resume-btn" class="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            กู้คืนและดำเนินการต่อ
          </button>
          <button id="start-new-btn" class="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            เริ่มใหม่
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Event Listeners
    dialog.querySelector('#resume-btn').addEventListener('click', () => {
      dialog.remove();
      if (onResume) onResume(summary);
    });

    dialog.querySelector('#start-new-btn').addEventListener('click', () => {
      dialog.remove();
      this.clearProgress();
      if (onStartNew) onStartNew();
    });

    return true;
  }
}

// สร้าง instance สำหรับใช้งานทั่วไป
const progressPersistence = new ProgressPersistence();

// Helper functions สำหรับใช้งานง่าย
function saveProgress(step, data) {
  return progressPersistence.saveProgress(step, data);
}

function loadProgress() {
  return progressPersistence.loadProgress();
}

function hasProgress() {
  return progressPersistence.hasProgress();
}

function clearProgress() {
  return progressPersistence.clearProgress();
}

function showResumeDialog(onResume, onStartNew) {
  return progressPersistence.showResumeDialog(onResume, onStartNew);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProgressPersistence, progressPersistence };
}
