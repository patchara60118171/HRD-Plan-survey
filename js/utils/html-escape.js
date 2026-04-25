/**
 * HTML Escape Utility for Phase 1 Security Fix
 * Prevents XSS by escaping HTML special characters
 */

/**
 * Escape HTML special characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for HTML
 */
function esc(str) {
  if (typeof str !== 'string') {
    str = String(str || '');
  }
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escape HTML attributes
 * @param {string} str - String to escape for attribute value
 * @returns {string} - Escaped string safe for attributes
 */
function escAttr(str) {
  if (typeof str !== 'string') {
    str = String(str || '');
  }
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Safely set innerHTML with escaped content
 * @param {HTMLElement} element - Element to set content
 * @param {string} content - Content to set (will be escaped)
 */
function safeSetHTML(element, content) {
  if (!element) return;
  element.innerHTML = esc(content);
}

/**
 * Create safe button with event listener (replaces inline onclick)
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @param {Object} options - Button options (className, id, etc.)
 * @returns {HTMLButtonElement} - Safe button element
 */
function createSafeButton(text, onClick, options = {}) {
  const button = document.createElement('button');
  button.textContent = text;
  
  // Set attributes safely
  if (options.className) button.className = options.className;
  if (options.id) button.id = options.id;
  if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
  
  // Add click listener safely
  if (typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { esc, escAttr, safeSetHTML, createSafeButton };
}
