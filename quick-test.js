const { chromium } = require('playwright');

async function quickTest() {
  console.log('🧪 Quick Test - Bug Fixes Verification');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  // Monitor console
  page.on('console', msg => {
    console.log('📝 CONSOLE:', msg.text());
  });

  try {
    await page.goto('https://nidawellbeing.vercel.app/ch1.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test 1: Leading zeros fix
    console.log('🔢 Testing leading zeros...');
    await page.fill('#total_staff', '050');
    await page.waitForTimeout(1000);
    
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
    
    // Click next button
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    
    // Check if moved to step 2
    const step2Visible = await page.isVisible('[data-step="1"]');
    if (step2Visible) {
      console.log('✅ STEP NAVIGATION FIXED');
    } else {
      console.log('❌ Step navigation still broken');
    }
    
    await page.screenshot({ path: 'quick-test-result.png', fullPage: true });
    
  } catch (error) {
    console.error('💥 Test error:', error);
  } finally {
    await browser.close();
  }
}

quickTest().catch(console.error);
