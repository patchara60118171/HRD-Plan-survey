// =============================================
// Loading States - แสดงสถานะการโหลดที่ชัดเจน
// =============================================

class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.createOverlay();
    }
    
    createOverlay() {
        // สร้าง overlay element ถ้ายังไม่มี
        if (document.getElementById('global-loading-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'global-loading-overlay';
        overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] hidden items-center justify-center';
        overlay.innerHTML = `
            <div class="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm mx-4">
                <div class="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p id="loading-message" class="font-semibold text-slate-700 mb-2">กำลังโหลด...</p>
                <p id="loading-detail" class="text-sm text-slate-400"></p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    show(message = 'กำลังโหลด...', detail = '') {
        const overlay = document.getElementById('global-loading-overlay');
        const messageEl = document.getElementById('loading-message');
        const detailEl = document.getElementById('loading-detail');
        
        if (messageEl) messageEl.textContent = message;
        if (detailEl) detailEl.textContent = detail;
        
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }
        
        // ป้องกัน scroll
        document.body.style.overflow = 'hidden';
    }
    
    hide() {
        const overlay = document.getElementById('global-loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
        
        // คืนค่า scroll
        document.body.style.overflow = '';
    }
    
    // สำหรับ inline loading (ไม่ block ทั้งหน้า)
    showInline(elementId, message = 'กำลังโหลด...') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const loaderId = `loader-${elementId}`;
        this.activeLoaders.add(loaderId);
        
        element.innerHTML = `
            <div class="flex items-center justify-center py-8" id="${loaderId}">
                <div class="w-8 h-8 border-3 border-slate-200 border-t-primary rounded-full animate-spin mr-3"></div>
                <span class="text-slate-600">${message}</span>
            </div>
        `;
    }
    
    hideInline(elementId) {
        const loaderId = `loader-${elementId}`;
        const loader = document.getElementById(loaderId);
        if (loader) {
            loader.remove();
            this.activeLoaders.delete(loaderId);
        }
    }
    
    // Progress bar
    showProgress(percent, message = '') {
        const overlay = document.getElementById('global-loading-overlay');
        if (!overlay) return;
        
        const content = overlay.querySelector('.bg-white');
        if (!content) return;
        
        content.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-4 relative">
                <svg class="transform -rotate-90" width="64" height="64">
                    <circle cx="32" cy="32" r="28" stroke="#E2E8F0" stroke-width="4" fill="none"/>
                    <circle cx="32" cy="32" r="28" stroke="#0F4C81" stroke-width="4" fill="none"
                        stroke-dasharray="${2 * Math.PI * 28}"
                        stroke-dashoffset="${2 * Math.PI * 28 * (1 - percent / 100)}"
                        class="transition-all duration-300"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm font-bold text-primary">${Math.round(percent)}%</span>
                </div>
            </div>
            <p class="font-semibold text-slate-700 mb-2">${message || 'กำลังดำเนินการ...'}</p>
        `;
        
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    }
}

// สร้าง instance
const loadingManager = new LoadingManager();

// Helper functions
function showLoading(message, detail) {
    loadingManager.show(message, detail);
}

function hideLoading() {
    loadingManager.hide();
}

function showInlineLoading(elementId, message) {
    loadingManager.showInline(elementId, message);
}

function hideInlineLoading(elementId) {
    loadingManager.hideInline(elementId);
}

function showProgress(percent, message) {
    loadingManager.showProgress(percent, message);
}
