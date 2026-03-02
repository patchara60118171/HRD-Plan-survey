const { chromium } = require('playwright');

async function navigationTest() {
  console.log('🧭 Navigation Debug Test');
  
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
    
    // Fill form
    await page.selectOption('#organization', 'กรมอนามัย');
    await page.fill('#total_staff', '500');
    await page.waitForTimeout(500);
    
    // Test nextStep function directly
    const navigationResult = await page.evaluate(() => {
      console.log('Testing nextStep function...');
      
      if (typeof nextStep === 'function') {
        console.log('nextStep function found, calling it...');
        nextStep();
        console.log('nextStep called');
      } else {
        console.log('nextStep function not found');
      }
      
      // Check currentStep variable
      console.log('currentStep variable:', typeof currentStep !== 'undefined' ? currentStep : 'UNDEFINED');
      
      // Check active step
      const activeStep = document.querySelector('.form-step.active');
      console.log('Active step element:', activeStep ? activeStep.dataset.step : 'NONE');
      
      return {
        currentStep: typeof currentStep !== 'undefined' ? currentStep : 'UNDEFINED',
        activeStep: activeStep ? activeStep.dataset.step : 'NONE'
      };
    });
    
    console.log('Navigation result:', navigationResult);
    
    await page.waitForTimeout(2000);
    
    // Check again after delay
    const finalState = await page.evaluate(() => {
      const activeStep = document.querySelector('.form-step.active');
      return {
        currentStep: typeof currentStep !== 'undefined' ? currentStep : 'UNDEFINED',
        activeStep: activeStep ? activeStep.dataset.step : 'NONE'
      };
    });
    
    console.log('Final state:', finalState);
    
  } catch (error) {
    console.error('💥 Navigation test error:', error);
  } finally {
    await browser.close();
  }
}

navigationTest().catch(console.error);
