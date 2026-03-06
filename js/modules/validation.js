// ========================================
// Validation Module
// ========================================

const Validation = {
    // Validation rules by field type
    rules: {
        number: (value, question) => {
            if (question.required && (value === '' || value === null || value === undefined)) {
                return { valid: false, message: 'กรุณากรอกข้อมูล' };
            }
            if (value === '' || value === null || value === undefined) {
                return { valid: true };
            }

            const num = parseFloat(value);
            if (isNaN(num)) {
                return { valid: false, message: 'กรุณากรอกตัวเลขที่ถูกต้อง' };
            }
            if (question.min !== undefined && num < question.min) {
                return { valid: false, message: `ค่าต้องมากกว่าหรือเท่ากับ ${question.min}` };
            }
            if (question.max !== undefined && num > question.max) {
                return { valid: false, message: `ค่าต้องน้อยกว่าหรือเท่ากับ ${question.max}` };
            }
            return { valid: true };
        },

        text: (value, question) => {
            if (question.required && (!value || value.trim() === '')) {
                return { valid: false, message: 'กรุณากรอกข้อมูล' };
            }
            if (question.minLength && value && value.length < question.minLength) {
                return { valid: false, message: `ต้องมีอย่างน้อย ${question.minLength} ตัวอักษร` };
            }
            if (question.maxLength && value && value.length > question.maxLength) {
                return { valid: false, message: `ต้องไม่เกิน ${question.maxLength} ตัวอักษร` };
            }
            return { valid: true };
        },

        radio: (value, question) => {
            if (question.required && (!value || value === '')) {
                return { valid: false, message: 'กรุณาเลือกตัวเลือก' };
            }
            return { valid: true };
        },

        checkbox: (value, question) => {
            const arr = Array.isArray(value) ? value : [];
            if (question.required && arr.length === 0) {
                return { valid: false, message: 'กรุณาเลือกอย่างน้อย 1 ตัวเลือก' };
            }
            if (question.maxSelect && arr.length > question.maxSelect) {
                return { valid: false, message: `เลือกได้ไม่เกิน ${question.maxSelect} ตัวเลือก` };
            }
            return { valid: true };
        },

        scale: (value, question) => {
            if (question.required && (value === '' || value === null || value === undefined)) {
                return { valid: false, message: 'กรุณาเลือกระดับ' };
            }
            return { valid: true };
        },

        time: (value, question) => {
            if (question.required && (!value || value === ':')) {
                return { valid: false, message: 'กรุณาระบุเวลา' };
            }
            return { valid: true };
        }
    },

    // Validate a single field
    validateField(value, question) {
        const validator = this.rules[question.type] || this.rules.text;
        return validator(value, question);
    },

    // Validate all questions in a subsection
    validateSubsection(questions, responses) {
        const errors = [];
        questions.forEach(q => {
            const result = this.validateField(responses[q.id], q);
            if (!result.valid) {
                errors.push({
                    id: q.id,
                    text: q.text,
                    message: result.message
                });
            }
        });
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Validate entire survey
    validateSurvey(surveyData, responses) {
        const allErrors = [];
        Object.keys(surveyData).forEach(sectionKey => {
            const section = surveyData[sectionKey];
            section.subsections.forEach(sub => {
                const result = this.validateSubsection(sub.questions, responses);
                if (!result.valid) {
                    allErrors.push(...result.errors);
                }
            });
        });
        return {
            valid: allErrors.length === 0,
            errors: allErrors
        };
    },

    // Show validation error on UI
    showError(questionId, message) {
        const card = document.getElementById(`card_${questionId}`);
        if (!card) return;

        // Remove existing error
        this.clearError(questionId);

        // Add error styling
        card.classList.add('validation-error');

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-message';
        errorDiv.id = `error_${questionId}`;
        errorDiv.innerHTML = `<span class="error-icon">⚠️</span> ${message}`;
        card.appendChild(errorDiv);
    },

    // Clear validation error
    clearError(questionId) {
        const card = document.getElementById(`card_${questionId}`);
        if (card) {
            card.classList.remove('validation-error');
        }
        const existingError = document.getElementById(`error_${questionId}`);
        if (existingError) {
            existingError.remove();
        }
    },

    // Clear all errors
    clearAllErrors() {
        document.querySelectorAll('.validation-error').forEach(el => {
            el.classList.remove('validation-error');
        });
        document.querySelectorAll('.validation-message').forEach(el => {
            el.remove();
        });
    }
};
