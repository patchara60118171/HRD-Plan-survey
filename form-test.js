// ========================================
// Form Test Script for Debugging
// ========================================

// Test form functionality
window.testForm = function() {
    console.log('Testing form functionality...');
    
    // Test form elements
    const form = document.getElementById('survey-form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Test required fields
    const requiredFields = form.querySelectorAll('[required]');
    console.log(`Found ${requiredFields.length} required fields`);
    
    // Test validation
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        console.log('Submit button found');
    }
    
    // Test data collection
    const formData = new FormData(form);
    console.log('Form data keys:', Array.from(formData.keys()));
    
    console.log('Form test completed');
};

// Auto-run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Form test script loaded');
    
    // Add test button to page
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Form';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3B82F6;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
    `;
    testBtn.onclick = testForm;
    document.body.appendChild(testBtn);
});
