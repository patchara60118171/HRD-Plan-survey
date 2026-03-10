// ========================================
// Input Sanitization Module
// ========================================

const Sanitizer = {
    /**
     * Sanitize text input to prevent XSS
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    /**
     * Sanitize HTML content (allow limited tags)
     */
    sanitizeHTML(html) {
        if (typeof html !== 'string') return '';
        
        // Allow only safe tags
        const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'];
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate numeric input
     */
    validateNumber(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    /**
     * Sanitize organization name
     */
    sanitizeOrgName(name) {
        if (typeof name !== 'string') return '';
        
        // Allow Thai characters, numbers, spaces, and common punctuation
        return name.replace(/[<>\"'\/\\]/g, '').trim();
    },

    /**
     * Sanitize textarea content (preserve line breaks)
     */
    sanitizeTextarea(content) {
        if (typeof content !== 'string') return '';
        
        return this.sanitizeText(content)
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sanitizer;
}
