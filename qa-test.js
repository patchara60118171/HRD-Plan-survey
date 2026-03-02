const { chromium } = require('playwright');
const fs = require('fs');

async function runQA() {
  console.log('🧪 Starting QA Automation Test for Well-being Survey');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 300,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  const testResults = [];

  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 CONSOLE ERROR:', msg.text());
      testResults.push({ type: 'console_error', message: msg.text() });
    }
  });

  // Monitor network failures
  page.on('requestfailed', req => {
    console.log('🔴 NETWORK FAIL:', req.url(), req.failure().errorText);
    testResults.push({ type: 'network_error', url: req.url(), error: req.failure().errorText });
  });

  try {
    // SETUP
    console.log('📋 SETUP: Loading page...');
    await page.goto('https://nidawellbeing.vercel.app/ch1.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step0_load.png', fullPage: true });
    
    // TC-F-001: Page loads
    await page.waitForSelector('#organization', { timeout: 10000 });
    console.log('✅ TC-F-001: Page loaded successfully');
    testResults.push({ test: 'TC-F-001', status: 'PASS', message: 'Page loaded' });

    // STEP 1 - Organization Info
    console.log('📝 STEP 1: Filling organization info...');
    
    // Fill organization
    await page.selectOption('#organization', 'กรมอนามัย');
    await page.waitForTimeout(500);
    
    // Fill total staff
    await page.fill('#total_staff', '500');
    await page.waitForTimeout(500);
    
    // Test Bug 3: Leading zeros
    await page.fill('#total_staff', '050');
    await page.waitForTimeout(1000);
    const staffValue = await page.$eval('#total_staff', el => el.value);
    if (staffValue === '50') {
      console.log('✅ TC-F-001-B: Leading zeros stripped correctly');
      testResults.push({ test: 'TC-F-001-B', status: 'PASS', message: 'Leading zeros stripped' });
    } else {
      console.log('❌ TC-F-001-B: Leading zeros NOT stripped:', staffValue);
      testResults.push({ test: 'TC-F-001-B', status: 'FAIL', message: `Leading zeros not stripped: ${staffValue}` });
    }
    
    // Fill age fields
    const ageFields = ['age_u30', 'age_31_40', 'age_41_50', 'age_51_60', 'age_over60'];
    const ageValues = ['100', '150', '150', '80', '20'];
    
    for (let i = 0; i < ageFields.length; i++) {
      const el = await page.$(`#${ageFields[i]}`);
      if (el) {
        await page.fill(`#${ageFields[i]}`, ageValues[i]);
        await page.waitForTimeout(200);
      }
    }
    
    // Fill service years
    const serviceFields = ['service_u5', 'service_6_10', 'service_over10'];
    const serviceValues = ['150', '200', '150'];
    
    for (let i = 0; i < serviceFields.length; i++) {
      const el = await page.$(`#${serviceFields[i]}`);
      if (el) {
        await page.fill(`#${serviceFields[i]}`, serviceValues[i]);
        await page.waitForTimeout(200);
      }
    }
    
    // Fill retirement risk
    const retireEl = await page.$('#retirement_risk_positions');
    if (retireEl) {
      await retireEl.fill('นักวิชาการสาธารณสุขชำนาญการพิเศษ 5 อัตรา');
    }
    
    await page.screenshot({ path: 'step1_filled.png', fullPage: true });
    
    // TC-F-002: Test Next Button (Bug 1 Fix)
    console.log('🔘 Testing Next button...');
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step1_after_next.png', fullPage: true });
    
    // Check if moved to step 2
    const step2Visible = await page.isVisible('[data-step="1"]');
    if (step2Visible) {
      console.log('✅ TC-F-002: Next button works - moved to Step 2');
      testResults.push({ test: 'TC-F-002', status: 'PASS', message: 'Next button works' });
    } else {
      console.log('❌ TC-F-002: Next button failed - still on Step 1');
      testResults.push({ test: 'TC-F-002', status: 'FAIL', message: 'Next button failed' });
    }

    // STEP 2 - Health Data
    console.log('📝 STEP 2: Filling health data...');
    await page.waitForTimeout(1000);
    
    // Fill NCD fields
    const ncdFields = {
      'disease_diabetes': '80',
      'disease_hypertension': '120',
      'disease_cardiovascular': '10',
      'disease_kidney': '20',
      'disease_liver': '15',
      'disease_cancer': '5',
      'disease_obesity': '60'
    };
    
    for (const [id, val] of Object.entries(ncdFields)) {
      const el = await page.$(`#${id}`);
      if (el) {
        await page.fill(`#${id}`, val);
        await page.waitForTimeout(200);
        console.log(`ℹ️ Filled ${id} = ${val}`);
      } else {
        console.log(`⚠️ Field not found: ${id}`);
      }
    }
    
    // Fill sick leave data
    for (let i = 0; i < 5; i++) {
      const yr = 2568 - i;
      const daysEl = await page.$(`#sick_days_${yr}`);
      const avgEl = await page.$(`#sick_avg_${yr}`);
      
      if (daysEl) await daysEl.fill((1200 + i * 50).toString());
      if (avgEl) await avgEl.fill((2.5 + i * 0.1).toString());
    }
    
    // Fill clinic data
    const clinicUsers = await page.$('#clinic_users_per_year');
    if (clinicUsers) await clinicUsers.fill('1500');
    
    const clinicSymptoms = await page.$('#clinic_top_symptoms');
    if (clinicSymptoms) await clinicSymptoms.fill('ปวดหัว ปวดกล้ามเนื้อ ความดันสูง');
    
    await page.screenshot({ path: 'step2_filled.png', fullPage: true });
    
    // Navigate to Step 3
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step2_after_next.png', fullPage: true });

    // STEP 3 - Mental Health & Movement
    console.log('📝 STEP 3: Filling mental health data...');
    
    // Fill mental health counts
    const mentalFields = {
      'mental_stress_count': '25',
      'mental_anxiety_count': '20',
      'mental_sleep_count': '15',
      'mental_burnout_count': '10',
      'mental_depression_count': '5'
    };
    
    for (const [id, val] of Object.entries(mentalFields)) {
      const el = await page.$(`#${id}`);
      if (el) {
        await page.fill(`#${id}`, val);
        await page.waitForTimeout(200);
      }
    }
    
    // Fill engagement data
    for (let i = 0; i < 5; i++) {
      const yr = 2568 - i;
      const scoreEl = await page.$(`#eng_score_${yr}`);
      const lowEl = await page.$(`#eng_low_${yr}`);
      
      if (scoreEl) await scoreEl.fill((75 + i * 2).toString());
      if (lowEl) await lowEl.fill('ค่าตอบแทน, ความก้าวหน้า');
    }
    
    // Fill movement rates
    const turnoverEl = await page.$('#turnover_rate');
    if (turnoverEl) await turnoverEl.fill('5.5');
    
    const transferEl = await page.$('#transfer_rate');
    if (transferEl) await transferEl.fill('3.2');
    
    await page.screenshot({ path: 'step3_filled.png', fullPage: true });
    
    // Navigate to Step 4
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step3_after_next.png', fullPage: true });

    // STEP 4 - Support Systems
    console.log('📝 STEP 4: Selecting support systems...');
    
    // Select radio buttons for support systems
    const supportSystems = ['mentoring_system', 'job_rotation', 'idp_system', 'career_path_system'];
    for (const system of supportSystems) {
      const radio = await page.$(`input[name="${system}"][value="partial"]`);
      if (radio) {
        await radio.click();
        await page.waitForTimeout(300);
        console.log(`ℹ️ Selected ${system} = partial`);
      }
    }
    
    // Select training hours
    const trainingRadio = await page.$('input[name="training_hours_range"][value="20_29"]');
    if (trainingRadio) {
      await trainingRadio.click();
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: 'step4_filled.png', fullPage: true });
    
    // Navigate to Step 5
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step4_after_next.png', fullPage: true });

    // STEP 5 - Environment
    console.log('📝 STEP 5: Selecting environment options...');
    
    // Select ergonomics status
    const ergonomicsRadio = await page.$('input[name="ergonomics_status"][value="planned"]');
    if (ergonomicsRadio) {
      await ergonomicsRadio.click();
      await page.waitForTimeout(500);
    }
    
    // Fill ergonomics detail if visible
    const ergoDetail = await page.$('#ergonomics_detail');
    if (ergoDetail && await ergoDetail.isVisible()) {
      await ergoDetail.fill('ปรับเก้าอี้ตามหลักการยศาสตร์ในสำนักงาน 3 ชั้น');
    }
    
    // Select digital systems
    const digitalSystems = ['e_doc', 'cloud', 'hr_digital'];
    for (const system of digitalSystems) {
      const checkbox = await page.$(`input[value="${system}"]`);
      if (checkbox) {
        await checkbox.click();
        await page.waitForTimeout(200);
      }
    }
    
    await page.screenshot({ path: 'step5_filled.png', fullPage: true });
    
    // Navigate to Step 6
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step5_after_next.png', fullPage: true });

    // STEP 6 - HRD Systems
    console.log('📝 STEP 6: Filling HRD data...');
    
    // Fill HRD URLs
    const hrdUrls = {
      'hrd_plan_url': 'https://example.com/hrd-plan',
      'hrd_budget_url': 'https://example.com/hrd-budget',
      'core_competency_url': 'https://example.com/core-competency',
      'functional_competency_url': 'https://example.com/functional-competency'
    };
    
    for (const [id, url] of Object.entries(hrdUrls)) {
      const el = await page.$(`#${id}`);
      if (el) {
        await el.fill(url);
        await page.waitForTimeout(200);
      }
    }
    
    // Select HRD opportunities
    const hrdOpps = ['strategic_align', 'tna', 'eval', 'wellbeing'];
    for (const opp of hrdOpps) {
      const checkbox = await page.$(`input[value="${opp}"]`);
      if (checkbox) {
        await checkbox.click();
        await page.waitForTimeout(200);
      }
    }
    
    await page.screenshot({ path: 'step6_filled.png', fullPage: true });
    
    // Navigate to Step 7
    await page.click('button:has-text("ถัดไป")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step6_after_next.png', fullPage: true });

    // STEP 7 - Strategic Priorities
    console.log('📝 STEP 7: Selecting strategic priorities...');
    
    // Select 3 strategic priorities
    const priorityButtons = await page.$$('.priority-chip');
    if (priorityButtons.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await priorityButtons[i].click();
        await page.waitForTimeout(500);
      }
    }
    
    // Fill HR strategy map URL
    const strategyUrl = await page.$('#hr_strategy_map_url');
    if (strategyUrl) {
      await strategyUrl.fill('https://example.com/hr-strategy-map');
    }
    
    await page.screenshot({ path: 'step7_filled.png', fullPage: true });
    
    // Wait for summary to build
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step7_summary.png', fullPage: true });

    // Test Draft Auto-Save (Bug 2 Fix)
    console.log('💾 Testing draft auto-save...');
    await page.waitForTimeout(30000); // Wait 30 seconds for auto-save
    
    // Check for toast message
    const toast = await page.$('#toast');
    if (toast) {
      const toastText = await toast.textContent();
      if (toastText.includes('บันทึกร่างอัตโนมัติ')) {
        console.log('✅ TC-F-003: Draft auto-save working');
        testResults.push({ test: 'TC-F-003', status: 'PASS', message: 'Draft auto-save working' });
      } else {
        console.log('⚠️ TC-F-003: Toast message but not auto-save:', toastText);
        testResults.push({ test: 'TC-F-003', status: 'PARTIAL', message: `Toast: ${toastText}` });
      }
    } else {
      console.log('❌ TC-F-003: No draft auto-save toast found');
      testResults.push({ test: 'TC-F-003', status: 'FAIL', message: 'No auto-save toast' });
    }

    // SUBMIT TEST
    console.log('🚀 Testing form submission...');
    
    // Click submit button
    const submitBtn = await page.$('button:has-text("ยืนยันและส่งข้อมูล")');
    if (submitBtn) {
      await submitBtn.click();
      console.log('ℹ️ Submit clicked');
      
      // Wait for response
      await page.waitForTimeout(10000);
      await page.screenshot({ path: 'after_submit.png', fullPage: true });
      
      // Check for success modal
      const successOverlay = await page.$('#overlay-success');
      if (successOverlay && await successOverlay.isVisible()) {
        const refText = await page.$eval('#success-ref', el => el.textContent);
        console.log('✅ TC-F-013: SUBMISSION SUCCESS:', refText);
        testResults.push({ test: 'TC-F-013', status: 'PASS', message: 'Submission successful', reference: refText });
      } else {
        // Check for error
        const errorOverlay = await page.$('#overlay-error');
        if (errorOverlay && await errorOverlay.isVisible()) {
          const errorText = await page.$eval('#error-msg', el => el.textContent);
          console.log('❌ TC-F-013: SUBMISSION ERROR:', errorText);
          testResults.push({ test: 'TC-F-013', status: 'FAIL', message: 'Submission error', error: errorText });
        } else {
          console.log('⚠️ TC-F-013: Unknown submission state');
          testResults.push({ test: 'TC-F-013', status: 'UNKNOWN', message: 'Unknown submission state' });
        }
      }
    } else {
      console.log('❌ Submit button not found');
      testResults.push({ test: 'TC-F-013', status: 'FAIL', message: 'Submit button not found' });
    }

  } catch (error) {
    console.error('💥 TEST ERROR:', error);
    testResults.push({ type: 'test_error', error: error.message });
  } finally {
    await browser.close();
  }

  // Generate Test Report
  console.log('\n📊 TEST REPORT');
  console.log('='.repeat(50));
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const partial = testResults.filter(r => r.status === 'PARTIAL').length;
  
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⚠️ PARTIAL: ${partial}`);
  console.log(`📊 TOTAL: ${testResults.length}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test || result.type}: ${result.message}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    if (result.reference) console.log(`   Reference: ${result.reference}`);
  });
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, partial, total: testResults.length },
    results: testResults
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Detailed report saved to test-report.json');
}

// Run the test
runQA().catch(console.error);
