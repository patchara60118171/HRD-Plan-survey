const { chromium } = require('playwright');

async function robustTest() {
  console.log('🧪 Robust Test - Wait for Full Load');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 300
  });
  
  const page = await browser.newPage();
  
  // Monitor console
  page.on('console', msg => {
    console.log('📝 CONSOLE:', msg.text());
  });

  try {
    await page.goto('https://nidawellbeing.vercel.app/ch1.html', { waitUntil: 'networkidle' });
    
    // Wait for DOM to be fully ready and event listeners attached
    await page.waitForTimeout(3000);
    
    // Test 1: Leading zeros fix - with proper event triggering
    console.log('🔢 Testing leading zeros...');
    
    // Focus the field first
    await page.focus('#total_staff');
    await page.waitForTimeout(200);
    
    // Clear and type
    await page.fill('#total_staff', '');
    await page.waitForTimeout(200);
    await page.type('#total_staff', '050');
    await page.waitForTimeout(500);
    
    // Trigger change event manually
    await page.evaluate(() => {
      const el = document.getElementById('total_staff');
      if (el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await page.waitForTimeout(500);
    
    const staffValue = await page.$eval('#total_staff', el => el.value);
    console.log('Staff value after typing 050:', staffValue);
    
    if (staffValue === '50') {
      console.log('✅ LEADING ZEROS FIXED');
    } else {
      console.log('❌ Leading zeros still broken:', staffValue);
    }
    
    // Test 2: Step navigation
    console.log('🔘 Testing step navigation...');
    await page.selectOption('#organization', 'กรมอนามัย');
    await page.waitForTimeout(500);
    
    await page.fill('#total_staff', '500');
    await page.waitForTimeout(500);
    
    // Check console for validation logs
    console.log('Clicking Next button...');
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(3000);
    
    // Check if moved to step 2
    const step2Visible = await page.isVisible('[data-step="1"]');
    console.log('Step 2 visible:', step2Visible);
    
    if (step2Visible) {
      console.log('✅ STEP NAVIGATION FIXED');
    } else {
      console.log('❌ Step navigation still broken');
      
      // Check current step indicator
      const currentStepClass = await page.$eval('.form-step.active', el => el.dataset.step);
      console.log('Current active step:', currentStepClass);
    }
    
    await page.screenshot({ path: 'robust-test-result.png', fullPage: true });
    
  } catch (error) {
    console.error('💥 Test error:', error);
  } finally {
    await browser.close();
  }
}

robustTest().catch(console.error);
