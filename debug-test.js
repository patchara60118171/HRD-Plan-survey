const { chromium } = require('playwright');

async function debugTest() {
  console.log('🔍 Debug Test - Check Event Listeners');
  
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
    
    // Check if setupNegativeGuards was called
    const hasListeners = await page.evaluate(() => {
      const el = document.getElementById('total_staff');
      if (!el) return 'Element not found';
      
      return {
        elementExists: !!el,
        value: el.value,
        type: el.type,
        min: el.getAttribute('min'),
        hasInputListener: el.oninput !== null,
        hasChangeListener: el.onchange !== null
      };
    });
    
    console.log('Element debug info:', hasListeners);
    
    // Manually trigger the setup
    await page.evaluate(() => {
      console.log('Manually calling setupNegativeGuards...');
      if (typeof setupNegativeGuards === 'function') {
        setupNegativeGuards();
        console.log('setupNegativeGuards called');
      } else {
        console.log('setupNegativeGuards function not found');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Test leading zeros again
    await page.focus('#total_staff');
    await page.fill('#total_staff', '050');
    await page.waitForTimeout(500);
    
    // Trigger events
    await page.evaluate(() => {
      const el = document.getElementById('total_staff');
      if (el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await page.waitForTimeout(500);
    
    const staffValue = await page.$eval('#total_staff', el => el.value);
    console.log('Staff value after manual setup:', staffValue);
    
    // Test validation
    await page.selectOption('#organization', 'กรมอนามัย');
    await page.fill('#total_staff', '500');
    
    console.log('Testing next button...');
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    
    const currentStep = await page.$eval('.form-step.active', el => el.dataset.step);
    console.log('Current step after next:', currentStep);
    
  } catch (error) {
    console.error('💥 Debug error:', error);
  } finally {
    await browser.close();
  }
}

debugTest().catch(console.error);
