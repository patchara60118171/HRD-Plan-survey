// =============================================
// Rate Limiter - ป้องกัน Spam
// =============================================

class RateLimiter {
    constructor() {
        this.attempts = new Map(); // email -> { count, firstAttempt, lastAttempt }
        this.blockedEmails = new Set();
        
        // Config
        this.MAX_ATTEMPTS = 5; // จำนวนครั้งสูงสุด
        this.TIME_WINDOW = 60 * 60 * 1000; // 1 ชั่วโมง
        this.BLOCK_DURATION = 24 * 60 * 60 * 1000; // บล็อก 24 ชั่วโมง
        
        // โหลดข้อมูลจาก localStorage
        this.loadFromStorage();
        
        // ล้างข้อมูลเก่าทุก 5 นาที
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    // ตรวจสอบว่าสามารถส่งได้หรือไม่
    canSubmit(email) {
        if (!email) return { allowed: false, reason: 'กรุณากรอกอีเมล' };
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // ตรวจสอบว่าถูกบล็อกหรือไม่
        if (this.blockedEmails.has(normalizedEmail)) {
            return { 
                allowed: false, 
                reason: 'อีเมลนี้ถูกบล็อกชั่วคราว กรุณาลองใหม่ในภายหลัง' 
            };
        }
        
        const now = Date.now();
        const record = this.attempts.get(normalizedEmail);
        
        if (!record) {
            return { allowed: true };
        }
        
        // ตรวจสอบว่าอยู่ในช่วงเวลาที่กำหนดหรือไม่
        const timeSinceFirst = now - record.firstAttempt;
        
        if (timeSinceFirst > this.TIME_WINDOW) {
            // เกินช่วงเวลา - รีเซ็ต
            this.attempts.delete(normalizedEmail);
            return { allowed: true };
        }
        
        // ตรวจสอบจำนวนครั้ง
        if (record.count >= this.MAX_ATTEMPTS) {
            // เกินจำนวนครั้ง - บล็อก
            this.blockEmail(normalizedEmail);
            return { 
                allowed: false, 
                reason: `ส่งข้อมูลบ่อยเกินไป กรุณารอ ${Math.ceil((this.TIME_WINDOW - timeSinceFirst) / 60000)} นาที` 
            };
        }
        
        return { allowed: true };
    }
    
    // บันทึกการส่ง
    recordAttempt(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const now = Date.now();
        
        const record = this.attempts.get(normalizedEmail);
        
        if (!record) {
            this.attempts.set(normalizedEmail, {
                count: 1,
                firstAttempt: now,
                lastAttempt: now
            });
        } else {
            record.count++;
            record.lastAttempt = now;
        }
        
        this.saveToStorage();
    }
    
    // บล็อกอีเมล
    blockEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        this.blockedEmails.add(normalizedEmail);
        
        // บันทึกเวลาที่บล็อก
        const blockData = JSON.parse(localStorage.getItem('ch1_blocked') || '{}');
        blockData[normalizedEmail] = Date.now();
        localStorage.setItem('ch1_blocked', JSON.stringify(blockData));
        
        console.warn('[RateLimiter] Blocked email:', normalizedEmail);
    }
    
    // ล้างข้อมูลเก่า
    cleanup() {
        const now = Date.now();
        
        // ล้าง attempts เก่า
        for (const [email, record] of this.attempts.entries()) {
            if (now - record.lastAttempt > this.TIME_WINDOW) {
                this.attempts.delete(email);
            }
        }
        
        // ล้าง blocked emails เก่า
        const blockData = JSON.parse(localStorage.getItem('ch1_blocked') || '{}');
        let hasChanges = false;
        
        for (const [email, blockedAt] of Object.entries(blockData)) {
            if (now - blockedAt > this.BLOCK_DURATION) {
                this.blockedEmails.delete(email);
                delete blockData[email];
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            localStorage.setItem('ch1_blocked', JSON.stringify(blockData));
        }
        
        this.saveToStorage();
    }
    
    // บันทึกลง localStorage
    saveToStorage() {
        try {
            const data = {
                attempts: Array.from(this.attempts.entries()),
                timestamp: Date.now()
            };
            localStorage.setItem('ch1_rate_limit', JSON.stringify(data));
        } catch (e) {
            console.warn('[RateLimiter] Failed to save:', e.message);
        }
    }
    
    // โหลดจาก localStorage
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('ch1_rate_limit') || '{}');
            if (data.attempts) {
                this.attempts = new Map(data.attempts);
            }
            
            // โหลด blocked emails
            const blockData = JSON.parse(localStorage.getItem('ch1_blocked') || '{}');
            const now = Date.now();
            
            for (const [email, blockedAt] of Object.entries(blockData)) {
                if (now - blockedAt < this.BLOCK_DURATION) {
                    this.blockedEmails.add(email);
                }
            }
        } catch (e) {
            console.warn('[RateLimiter] Failed to load:', e.message);
        }
    }
    
    // รีเซ็ตสำหรับ testing
    reset(email) {
        if (email) {
            const normalizedEmail = email.toLowerCase().trim();
            this.attempts.delete(normalizedEmail);
            this.blockedEmails.delete(normalizedEmail);
        } else {
            this.attempts.clear();
            this.blockedEmails.clear();
            localStorage.removeItem('ch1_rate_limit');
            localStorage.removeItem('ch1_blocked');
        }
    }
}

// สร้าง instance
const rateLimiter = new RateLimiter();
