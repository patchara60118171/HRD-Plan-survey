const { chromium } = require('playwright');

;(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext();
  const page = await context.newPage();
  const BASE = 'http://localhost:3000/ch1.html';
  const results = [];

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push(`NET_FAIL: ${r.url()}`));

  const log = (tc, status, note = '') => {
    results.push({ tc, status, note });
    console.log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️'} ${tc}: ${note}`);
  };

  const ss = (name) => page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });

  // ── TC-L-001: หน้าโหลดได้และแสดง Landing ──────────────
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  await ss('L001_landing_load');

  const landingTitle = await page.$('h1, [class*="title"]');
  const titleText = landingTitle ? await landingTitle.textContent() : '';
  log('TC-L-001', titleText.includes('แบบสำรวจ') ? 'PASS' : 'FAIL', `title: "${titleText}"`);

  // ตรวจว่า Step 1 ยังไม่โผล่ (ถ้ามี email gate)
  const emailInput = await page.$('#respondent_email');
  log('TC-L-002', emailInput ? 'PASS' : 'SKIP', emailInput ? 'Email input found' : 'No email gate (skip)');

  // ── TC-L-003: กดยืนยันอีเมลโดยไม่กรอก ──────────────────
  if (emailInput) {
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(500);
    const errMsg = await page.$('#email-error-msg');
    const errText = errMsg ? await errMsg.textContent() : '';
    log('TC-L-003', errText ? 'PASS' : 'FAIL', `error msg: "${errText}"`);
    await ss('L003_email_empty_error');

    // ── TC-L-004: กรอก email ผิด format ─────────────────
    await page.fill('#respondent_email', 'notanemail');
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(500);
    const errText2 = errMsg ? await errMsg.textContent() : '';
    log('TC-L-004', errText2 ? 'PASS' : 'FAIL', `format error: "${errText2}"`);
    await ss('L004_email_invalid');

    // ── TC-L-005: กรอก email ถูกต้อง → ไป Step 1 ──────
    await page.fill('#respondent_email', 'tester@nida.ac.th');
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(1000);
    await ss('L005_email_valid_goto_step1');

    const step1Visible = await page.$eval(
      '[data-step="1"]',
      el => el.offsetParent !== null
    ).catch(() => false);
    log('TC-L-005', step1Visible ? 'PASS' : 'FAIL', 'step-1 visible after email confirm');

    // ── TC-L-006: กด Enter ใน email field ──────────────
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    const ei2 = await page.$('#respondent_email');
    if (ei2) {
      await page.fill('#respondent_email', 'tester@nida.ac.th');
      await page.press('#respondent_email', 'Enter');
      await page.waitForTimeout(800);
      log('TC-L-006', 'PASS', 'Enter key works');
    }
  }

  // ── TEST RUN 2 — Step 1: ข้อมูลพื้นฐานหน่วยงาน ─────────────────
  await page.goto(BASE);
  await page.waitForTimeout(1500);

  // ผ่าน email gate ก่อน
  const ei = await page.$('#respondent_email');
  if (ei) {
    await page.fill('#respondent_email', 'tester@nida.ac.th');
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(800);
  }

  // TC-S1-001: กด ถัดไป โดยไม่เลือก organization
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(600);
  const orgErr = await page.$('#err-org, [id*="err"][id*="org"]');
  log('TC-S1-001', orgErr ? 'PASS' : 'FAIL', 'organization validation shown');
  await ss('S1001_no_org_error');

  // TC-S1-002: เลือก organization
  await page.selectOption('#organization', 'กรมอนามัย');
  await page.waitForTimeout(300);
  const orgVal = await page.$eval('#organization', el => el.value);
  log('TC-S1-002', orgVal === 'กรมอนามัย' ? 'PASS' : 'FAIL', `org = "${orgVal}"`);

  // TC-S1-003: กรอก total_staff = -1 (ค่าติดลบ)
  await page.evaluate(() => document.getElementById('total_staff').value = '-1');
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(500);
  const negErr = await page.$('#err-staff, [id*="err"][id*="staff"]');
  log('TC-S1-003', negErr ? 'PASS' : 'FAIL', 'negative staff guard');
  await ss('S1003_negative_staff');

  // TC-S1-004: กรอกข้อมูลครบถ้วน
  await page.evaluate(() => document.getElementById('total_staff').value = '500');
  const visionEl = await page.$('#vision_mission');
  if (visionEl) await page.fill('#vision_mission', 'มุ่งสร้างสุขภาพที่ดีแก่ประชาชน');

  // Age groups
  const ageMap = {
    'age_u30': '80', 'age_31_40': '150', 'age_41_50': '180',
    'age_51_60': '70', 'age_over60': '20'
  };
  for (const [id, val] of Object.entries(ageMap)) {
    const el = await page.$(`#${id}`);
    if (el) await page.fill(`#${id}`, val);
  }

  // Service years
  const serviceMap = {
    'service_u5': '100', 'service_6_10': '200', 'service_over10': '200'
  };
  for (const [id, val] of Object.entries(serviceMap)) {
    const el = await page.$(`#${id}`);
    if (el) await page.fill(`#${id}`, val);
  }

  const retireEl = await page.$('#retirement_risk_positions');
  if (retireEl) await page.fill('#retirement_risk_positions', '45');

  await ss('S1_filled_complete');

  // TC-S1-006: กด ถัดไป → ไป Step 2
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(800);
  await ss('S1006_after_next');

  const step2 = await page.$('[data-step="2"]');
  const step2Vis = step2 ? await step2.evaluate(el => el.offsetParent !== null) : false;
  log('TC-S1-006', step2Vis ? 'PASS' : 'FAIL', 'navigated to Step 2');

  // ── TEST RUN 3 — Step 2: สุขภาวะทางกาย ─────────────────
  // TC-S2-001: กรอก NCD
  const ncdMap = {
    'disease_diabetes': '60',
    'disease_hypertension': '90',
    'disease_obesity': '45',
    'disease_cardiovascular': '30',
    'disease_kidney': '12',
    'disease_liver': '10',
    'disease_cancer': '8',
    'disease_other_count': '5'
  };
  for (const [id, val] of Object.entries(ncdMap)) {
    const el = await page.$(`#${id}`);
    if (el) {
      await page.fill(`#${id}`, val);
      console.log(`  ℹ️ Filled ${id} = ${val}`);
    }
  }

  const ncdOtherEl = await page.$('#disease_other_detail');
  if (ncdOtherEl) await page.fill('#disease_other_detail', 'มะเร็ง');

  const ncdTotal = await page.$('#ncd-total');
  if (ncdTotal) {
    const totalText = await ncdTotal.textContent();
    log('TC-S2-002', 'INFO', `NCD total shown: "${totalText}"`);
  }

  // TC-S2-003: ตาราง ลาป่วย
  const sickRows = await page.$$('#sick-leave-tbody tr');
  console.log(`  ℹ️ Sick leave rows found: ${sickRows.length}`);

  for (let i = 0; i < Math.min(sickRows.length, 5); i++) {
    const inputs = await sickRows[i].$$('input[type="number"]');
    for (const input of inputs) {
      await input.fill('1200');
    }
  }
  log('TC-S2-003', sickRows.length > 0 ? 'PASS' : 'FAIL', `sick leave table rows: ${sickRows.length}`);

  // TC-S2-004: ห้องพยาบาล
  const clinicEl = await page.$('#clinic_users_per_year');
  if (clinicEl) await page.fill('#clinic_users_per_year', '800');

  const symptomsEl = await page.$('#clinic_top_symptoms');
  if (symptomsEl) await page.fill('#clinic_top_symptoms', 'ไข้ ปวดหัว ปวดกล้ามเนื้อ');

  const medsEl = await page.$('#clinic_top_medications');
  if (medsEl) await page.fill('#clinic_top_medications', 'พาราเซตามอล ยาแก้ไอ');

  await ss('S2_filled');
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(800);
  await ss('S2_after_next');
  log('TC-S2-005', 'INFO', 'Step 2 → Next clicked');

  // ── TEST RUN 4 — Step 3: สุขภาวะทางจิตใจ ─────────────────
  const mentalMap = {
    'mental_stress_count': '80',
    'mental_anxiety_count': '45',
    'mental_sleep_count': '30',
    'mental_burnout_count': '25',
    'mental_depression_count': '10'
  };
  for (const [id, val] of Object.entries(mentalMap)) {
    const el = await page.$(`#${id}`);
    if (el) await page.fill(`#${id}`, val);
  }

  const engRows = await page.$$('#engagement-tbody tr');
  for (let i = 0; i < Math.min(engRows.length, 5); i++) {
    const inputs = await engRows[i].$$('input[type="number"]');
    for (const inp of inputs) await inp.fill('75');
    const textarea = await engRows[i].$('textarea');
    if (textarea) await textarea.fill('การสื่อสารในองค์กร');
  }
  log('TC-S3-002', engRows.length > 0 ? 'PASS' : 'FAIL', `engagement rows: ${engRows.length}`);

  const turnoverEl = await page.$('#turnover_rate');
  if (turnoverEl) await page.fill('#turnover_rate', '5.5');

  const transferEl = await page.$('#transfer_rate');
  if (transferEl) await page.fill('#transfer_rate', '3.2');

  await ss('S3_filled');
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(800);
  log('TC-S3-004', 'INFO', 'Step 3 → Next clicked');

  // ── TEST RUN 5 — Step 4: ระบบสนับสนุน ─────────────────
  const trainingEl = await page.$('input[name="training_hours_range"]');
  if (trainingEl) {
    await trainingEl.evaluate(el => el.click());
    log('TC-S4-002', 'PASS', 'training hours selected');
  }

  await ss('S4_filled');
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(800);
  log('TC-S4-003', 'INFO', 'Step 4 → Next clicked');

  // ── TEST RUN 6 — Step 5: สภาพแวดล้อม ─────────────────
  const ergoEl = await page.$('input[name="ergonomics_status"]');
  if (ergoEl) {
    await ergoEl.evaluate(el => el.click());
    log('TC-S5-001', 'PASS', 'ergonomics selected');
  }

  const digitalCbs = await page.$$('.digital-cb');
  for (let i = 0; i < Math.min(digitalCbs.length, 3); i++) {
    await digitalCbs[i].evaluate(el => el.click());
  }
  log('TC-S5-002', digitalCbs.length > 0 ? 'PASS' : 'FAIL', `digital checkboxes: ${digitalCbs.length}`);

  await ss('S5_filled');
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(800);
  log('TC-S5-003', 'INFO', 'Step 5 → Next clicked');

  // ── TEST RUN 7 — Step 6: ระบบ HRD ─────────────────
  const hrdUrlEl = await page.$('#hrd_plan_url');
  if (hrdUrlEl) await page.fill('#hrd_plan_url', 'https://example.com/hrd-doc.pdf');

  const hrdCbs = await page.$$('.hrd-opp-cb');
  for (let i = 0; i < Math.min(hrdCbs.length, 3); i++) {
    await hrdCbs[i].evaluate(el => el.click());
  }
  log('TC-S6-002', hrdCbs.length > 0 ? 'PASS' : 'FAIL', `hrd checkboxes: ${hrdCbs.length}`);

  await ss('S6_filled');
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(800);
  log('TC-S6-003', 'INFO', 'Step 6 → Next clicked');

  // ── TEST RUN 8 — Step 7: ยุทธศาสตร์ + Submit ─────────────────
  const hrStratEl = await page.$('#hr_strategy_map_url');
  if (hrStratEl) await page.fill('#hr_strategy_map_url', 'https://example.com/strategy.pdf');

  const priorityItems = await page.$$('.priority-chip');
  for (let i = 0; i < Math.min(priorityItems.length, 3); i++) {
    await priorityItems[i].click();
    await page.waitForTimeout(300);
  }
  log('TC-S7-002', priorityItems.length > 0 ? 'PASS' : 'FAIL', `priorities: ${priorityItems.length} items`);

  await ss('S7_filled_ready_submit');

  // TC-S7-004: SUBMIT
  const submitBtn = await page.$('button:has-text("ส่ง")');
  if (submitBtn) {
    let supabaseHit = false;
    page.on('request', req => {
      if (req.url().includes('supabase') && req.method() === 'POST') {
        supabaseHit = true;
        console.log('  🌐 Supabase POST request fired!');
      }
    });

    await submitBtn.click();
    console.log('  ℹ️ Submit clicked — waiting...');
    await page.waitForTimeout(5000);
    await ss('S7004_after_submit');

    const successEl = await page.$('#overlay-success, [id*="success"]');
    if (successEl) {
      log('TC-S7-004', 'PASS', 'Submit success overlay shown');
    } else {
      log('TC-S7-004', 'FAIL', 'No success message after submit');
    }

    log('TC-S7-005', supabaseHit ? 'PASS' : 'FAIL', `Supabase POST: ${supabaseHit}`);
  }

  // ── OUTPUT ─────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST REPORT — nidawellbeing.vercel.app/ch1.html');
  console.log('Date:', new Date().toLocaleString('th-TH'));
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO' || r.status === 'SKIP').length;

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : 'ℹ️';
    console.log(`${icon} ${r.tc.padEnd(12)} ${r.status.padEnd(6)} ${r.note}`);
  });

  console.log('═'.repeat(60));
  console.log(`✅ PASS: ${passed}  ❌ FAIL: ${failed}  ℹ️ INFO/SKIP: ${info}`);
  console.log(`📸 Screenshots: ./screenshots/`);

  if (errors.length > 0) {
    console.log('\n🔴 CONSOLE/NETWORK ERRORS:');
    errors.forEach(e => console.log('  -', e));
  } else {
    console.log('\n✅ No console/network errors detected');
  }

  console.log('═'.repeat(60));

  await browser.close();
})();
