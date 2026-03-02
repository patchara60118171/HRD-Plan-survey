const { chromium } = require('playwright');

async function validationTest() {
  console.log('🔍 Validation Debug Test');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 200
  });
  
  const page = await browser.newPage();
  
  // Monitor console
  page.on('console', msg => {
    console.log('📝 CONSOLE:', msg.text());
  });

  try {
    await page.goto('https://nidawellbeing.vercel.app/ch1.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Fill form properly
    console.log('Filling organization...');
    await page.selectOption('#organization', 'กรมอนามัย');
    await page.waitForTimeout(500);
    
    console.log('Filling staff count...');
    await page.fill('#total_staff', '500');
    await page.waitForTimeout(500);
    
    // Check validation manually
    const validationResult = await page.evaluate(() => {
      const orgEl = document.getElementById('organization');
      const staffEl = document.getElementById('total_staff');
      
      console.log('Organization element:', orgEl ? orgEl.value : 'NOT FOUND');
      console.log('Staff element:', staffEl ? staffEl.value : 'NOT FOUND');
      
      if (typeof validateStep1 === 'function') {
        const result = validateStep1();
        console.log('validateStep1 result:', result);
        return result;
      } else {
        console.log('validateStep1 function not found');
        return 'FUNCTION_NOT_FOUND';
      }
    });
    
    console.log('Validation result:', validationResult);
    
    // Try next button
    console.log('Clicking next button...');
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    
    const currentStep = await page.$eval('.form-step.active', el => el.dataset.step);
    console.log('Current step after next:', currentStep);
    
    // Check for error messages
    const orgError = await page.isVisible('#err-org');
    const staffError = await page.isVisible('#err-staff');
    
    console.log('Error messages visible - org:', orgError, 'staff:', staffError);
    
  } catch (error) {
    console.error('💥 Validation test error:', error);
  } finally {
    await browser.close();
  }
}

validationTest().catch(console.error);
