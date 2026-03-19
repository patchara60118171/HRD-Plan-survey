// ========================================
// Centralized Error Handler
// ========================================

const ErrorHandler = {
    // Error types with Thai messages
    messages: {
        NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบอินเทอร์เน็ต',
        AUTH_ERROR: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง',
        SAVE_ERROR: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        LOAD_ERROR: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        VALIDATION_ERROR: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        UNKNOWN_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        OFFLINE_ERROR: 'คุณกำลังออฟไลน์ ข้อมูลจะถูกบันทึกเมื่อเชื่อมต่ออินเทอร์เน็ต',
        TIMEOUT_ERROR: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง'
    },

    // Queue for retry
    retryQueue: [],

    // Log error for debugging
    logError(error, context = '') {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ${context}:`, error);

        // Could send to error tracking service here
        // this.sendToErrorTracking(error, context);
    },

    // Show user-friendly error message
    show(message, type = 'error', duration = 5000) {
        // Use existing showToast if available, otherwise create custom
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            this.showCustomToast(message, type, duration);
        }
    },

    // Custom toast implementation
    showCustomToast(message, type, duration) {
        const toast = document.getElementById('toast') || this.createToastElement();
        toast.className = `toast show ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getIcon(type)}</span>
            <span class="toast-message">${message}</span>
            ${type === 'error' ? '<button class="toast-close" onclick="ErrorHandler.hideToast()">✕</button>' : ''}
        `;

        if (duration > 0) {
            setTimeout(() => this.hideToast(), duration);
        }
    },

    createToastElement() {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
        return toast;
    },

    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.remove('show');
        }
    },

    getIcon(type) {
        const icons = {
            error: '❌',
            warning: '⚠️',
            success: '✅',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    // Handle API errors
    handleApiError(error, context = 'API') {
        this.logError(error, context);

        // Check if offline
        if (!navigator.onLine) {
            this.show(this.messages.OFFLINE_ERROR, 'warning');
            return 'offline';
        }

        // Determine error type
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            this.show(this.messages.NETWORK_ERROR, 'error');
            return 'network';
        }

        if (error.message?.includes('timeout')) {
            this.show(this.messages.TIMEOUT_ERROR, 'error');
            return 'timeout';
        }

        // Generic error
        this.show(this.messages.UNKNOWN_ERROR, 'error');
        return 'unknown';
    },

    // Handle validation errors
    handleValidationErrors(errors) {
        if (errors.length === 0) return;

        // Show first error as toast
        const firstError = errors[0];
        this.show(`${firstError.text}: ${firstError.message}`, 'warning');

        // Highlight all error fields
        errors.forEach(err => {
            if (typeof Validation !== 'undefined') {
                Validation.showError(err.id, err.message);
            }
        });

        // Scroll to first error
        const firstErrorCard = document.getElementById(`card_${firstError.id}`);
        if (firstErrorCard) {
            firstErrorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    // Retry mechanism
    async withRetry(fn, maxRetries = 3, delay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                this.logError(error, `Attempt ${attempt}/${maxRetries}`);

                if (attempt < maxRetries) {
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }

        throw lastError;
    },

    // Add to offline queue for later sync
    addToSyncQueue(action, data) {
        this.retryQueue.push({
            action,
            data,
            timestamp: Date.now()
        });

        // Store in localStorage
        try {
            localStorage.setItem('sync_queue', JSON.stringify(this.retryQueue));
        } catch (e) {
            console.warn('Could not save sync queue to localStorage');
        }
    },

    // Process offline queue when back online
    async processSyncQueue() {
        if (this.retryQueue.length === 0) return;

        const queue = [...this.retryQueue];
        this.retryQueue = [];

        for (const item of queue) {
            try {
                // Process based on action type
                if (item.action === 'save' && typeof saveToSupabase === 'function') {
                    await saveToSupabase(item.data.email, item.data.responses, item.data.isDraft);
                }
            } catch (e) {
                // Re-add to queue if failed
                this.retryQueue.push(item);
            }
        }

        // Save remaining items
        localStorage.setItem('sync_queue', JSON.stringify(this.retryQueue));

        if (this.retryQueue.length === 0) {
            this.show('ซิงค์ข้อมูลสำเร็จ!', 'success');
        }
    },

    // Initialize - load queue from localStorage and setup online listener
    init() {
        // Load existing queue
        try {
            const saved = localStorage.getItem('sync_queue');
            if (saved) {
                this.retryQueue = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load sync queue');
        }

        // Listen for online event
        window.addEventListener('online', () => {
            this.show('เชื่อมต่ออินเทอร์เน็ตแล้ว กำลังซิงค์ข้อมูล...', 'info');
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.show(this.messages.OFFLINE_ERROR, 'warning', 0);
        });
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
} else {
    ErrorHandler.init();
}
