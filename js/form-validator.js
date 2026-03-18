/**
 * FormValidator Class
 * Handles validation of form fields and entire steps based on rules
 */
class FormValidator {
  constructor(config = {}) {
    this.config = config;
    this.validationRules = config.validationRules || {};
    this.errors = {};
  }

  /**
   * Validate a single field value against rules
   * @param {string} fieldId - Field identifier
   * @param {*} value - Value to validate
   * @param {Object} field - Field definition object
   * @returns {Object} Validation result {isValid: boolean, errors: array}
   */
  validateField(fieldId, value, field = {}) {
    const result = {
      isValid: true,
      errors: [],
      fieldId: fieldId
    };

    // Required validation
    if (field.required || field.mandatory) {
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
        result.isValid = false;
        result.errors.push('This field is required');
      }
    }

    // If empty and not required, pass
    if (!value || (typeof value === 'string' && !value.trim())) {
      return result;
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
        this.validateTextField(value, field, result);
        break;
      case 'textarea':
        this.validateTextareaField(value, field, result);
        break;
      case 'number':
        this.validateNumberField(value, field, result);
        break;
      case 'email':
        this.validateEmailField(value, field, result);
        break;
      case 'phone':
        this.validatePhoneField(value, field, result);
        break;
      case 'select':
        this.validateSelectField(value, field, result);
        break;
      case 'checkbox':
        this.validateCheckboxField(value, field, result);
        break;
      case 'radio':
        this.validateRadioField(value, field, result);
        break;
      case 'file-upload':
        this.validateFileField(value, field, result);
        break;
      case 'number-group':
        this.validateNumberGroupField(value, field, result);
        break;
      case 'turnover-table':
        this.validateTurnoverTableField(value, field, result);
        break;
      case 'ranking':
        this.validateRankingField(value, field, result);
        break;
    }

    return result;
  }

  /**
   * Validate text field
   * @private
   */
  validateTextField(value, field, result) {
    const rules = this.validationRules.textFields || {};

    if (value.length < (field.minLength || rules.minLength || 0)) {
      result.isValid = false;
      result.errors.push(`Minimum length is ${field.minLength || rules.minLength}`);
    }

    if (field.maxLength && value.length > field.maxLength) {
      result.isValid = false;
      result.errors.push(`Maximum length is ${field.maxLength}`);
    }

    // Pattern validation
    const pattern = field.pattern || rules.pattern;
    if (pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        result.isValid = false;
        result.errors.push('Invalid format');
      }
    }
  }

  /**
   * Validate textarea field
   * @private
   */
  validateTextareaField(value, field, result) {
    const rules = this.validationRules.textareaFields || {};

    if (value.length < (field.minLength || rules.minLength || 0)) {
      result.isValid = false;
      result.errors.push(`Minimum length is ${field.minLength || rules.minLength}`);
    }

    if (field.maxLength && value.length > field.maxLength) {
      result.isValid = false;
      result.errors.push(`Maximum length is ${field.maxLength}`);
    }

    const pattern = field.pattern || rules.pattern;
    if (pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        result.isValid = false;
        result.errors.push('Invalid format');
      }
    }
  }

  /**
   * Validate number field
   * @private
   */
  validateNumberField(value, field, result) {
    const rules = this.validationRules.numberFields || {};
    const numValue = Number(value);

    if (isNaN(numValue)) {
      result.isValid = false;
      result.errors.push('Must be a valid number');
      return;
    }

    const min = field.min !== undefined ? field.min : (rules.min !== undefined ? rules.min : 0);
    const max = field.max !== undefined ? field.max : (rules.max !== undefined ? rules.max : 999999);

    if (numValue < min) {
      result.isValid = false;
      result.errors.push(`Minimum value is ${min}`);
    }

    if (numValue > max) {
      result.isValid = false;
      result.errors.push(`Maximum value is ${max}`);
    }

    // Decimal places validation
    if (field.decimalPlaces !== undefined || rules.decimalPlaces !== undefined) {
      const maxDecimals = field.decimalPlaces !== undefined ? field.decimalPlaces : rules.decimalPlaces;
      const parts = String(value).split('.');
      if (parts[1] && parts[1].length > maxDecimals) {
        result.isValid = false;
        result.errors.push(`Maximum ${maxDecimals} decimal places allowed`);
      }
    }
  }

  /**
   * Validate email field
   * @private
   */
  validateEmailField(value, field, result) {
    const rules = this.validationRules.emailFields || {};
    const pattern = field.pattern || rules.pattern || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
    const regex = new RegExp(pattern);

    if (!regex.test(value)) {
      result.isValid = false;
      result.errors.push('Invalid email address');
    }
  }

  /**
   * Validate phone field
   * @private
   */
  validatePhoneField(value, field, result) {
    const rules = this.validationRules.phoneFields || {};
    const pattern = field.pattern || rules.pattern || '^[0-9\\-\\+\\s]{10,20}$';
    const regex = new RegExp(pattern);

    if (!regex.test(value)) {
      result.isValid = false;
      result.errors.push('Invalid phone number');
    }
  }

  /**
   * Validate select field
   * @private
   */
  validateSelectField(value, field, result) {
    if (!value && field.required) {
      result.isValid = false;
      result.errors.push('Please select an option');
    }
  }

  /**
   * Validate checkbox field
   * @private
   */
  validateCheckboxField(value, field, result) {
    const rules = this.validationRules.checkboxFields || {};
    const selectedCount = Array.isArray(value) ? value.length : 0;

    if (field.minSelections && selectedCount < field.minSelections) {
      result.isValid = false;
      result.errors.push(`Select at least ${field.minSelections} option(s)`);
    }

    if (field.maxSelections && selectedCount > field.maxSelections) {
      result.isValid = false;
      result.errors.push(`Select at most ${field.maxSelections} option(s)`);
    }
  }

  /**
   * Validate radio field
   * @private
   */
  validateRadioField(value, field, result) {
    if (field.required && !value) {
      result.isValid = false;
      result.errors.push('Please select an option');
    }
  }

  /**
   * Validate file upload field
   * @private
   */
  validateFileField(value, field, result) {
    const rules = this.validationRules.fileUpload || {};

    if (!value && field.required) {
      result.isValid = false;
      result.errors.push('Please upload a file');
      return;
    }

    if (value && value instanceof File) {
      // Check file size
      const maxSize = field.maxFileSize || (rules.maxFileSize * 1024 * 1024);
      if (value.size > maxSize) {
        result.isValid = false;
        result.errors.push(`File size exceeds ${rules.maxFileSizeMB || 1}MB limit`);
      }

      // Check MIME type
      const allowedTypes = field.allowedMimeTypes || rules.allowedMimeTypes || ['application/pdf'];
      if (!allowedTypes.includes(value.type)) {
        result.isValid = false;
        result.errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
      }
    }
  }

  /**
   * Validate number group field
   * @private
   */
  validateNumberGroupField(value, field, result) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const numValue = Number(item);
        if (isNaN(numValue)) {
          result.isValid = false;
          result.errors.push('All values must be numbers');
          break;
        }
      }
    }
  }

  /**
   * Validate turnover table field
   * @private
   */
  validateTurnoverTableField(value, field, result) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const numValue = Number(item);
        if (isNaN(numValue) || numValue < 0) {
          result.isValid = false;
          result.errors.push('All values must be non-negative numbers');
          break;
        }
      }
    }
  }

  /**
   * Validate ranking field
   * @private
   */
  validateRankingField(value, field, result) {
    const rules = this.validationRules.rankingFields || {};
    const selectedCount = Array.isArray(value) ? value.length : 0;

    if (field.minSelections && selectedCount < field.minSelections) {
      result.isValid = false;
      result.errors.push(`Select at least ${field.minSelections} item(s)`);
    }

    if (field.maxSelections && selectedCount > field.maxSelections) {
      result.isValid = false;
      result.errors.push(`Select at most ${field.maxSelections} item(s)`);
    }
  }

  /**
   * Validate entire form step
   * @param {Array} fields - Array of field definitions
   * @param {Object} formData - Form data object
   * @returns {Object} Validation result {isValid: boolean, fieldErrors: object}
   */
  validate(fields, formData) {
    const result = {
      isValid: true,
      fieldErrors: {}
    };

    if (!Array.isArray(fields)) {
      return result;
    }

    for (const field of fields) {
      const fieldValue = formData[field.id];
      const fieldValidation = this.validateField(field.id, fieldValue, field);

      if (!fieldValidation.isValid) {
        result.isValid = false;
        result.fieldErrors[field.id] = fieldValidation.errors;
      }
    }

    this.errors = result.fieldErrors;
    return result;
  }

  /**
   * Get validation errors for a field
   * @param {string} fieldId - Field ID
   * @returns {Array} Array of error messages
   */
  getFieldErrors(fieldId) {
    return this.errors[fieldId] || [];
  }

  /**
   * Get all validation errors
   * @returns {Object} Object with field IDs as keys and error arrays as values
   */
  getAllErrors() {
    return this.errors;
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errors = {};
  }

  /**
   * Check if a field is valid
   * @param {string} fieldId - Field ID
   * @returns {boolean}
   */
  isFieldValid(fieldId) {
    return !this.errors[fieldId] || this.errors[fieldId].length === 0;
  }

  /**
   * Check if form is valid
   * @returns {boolean}
   */
  isFormValid() {
    return Object.keys(this.errors).length === 0;
  }
}

// Export for use in modules and browsers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}
