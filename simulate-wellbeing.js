const { chromium } = require('playwright');

const testUsers = [
  { email: 'test.user.1@example.com', name: 'สมชาย ใจดี', age: 35, title: 'นาย', gender: 'ชาย', height: 175, weight: 70, waist: 32, job_duration: 10 },
  { email: 'test.user.2@example.com', name: 'สมหญิง รักงาน', age: 28, title: 'นางสาว', gender: 'หญิง', height: 160, weight: 52, waist: 26, job_duration: 5 },
  { email: 'test.user.3@example.com', name: 'วิรัติ มุ่งมั่น', age: 42, title: 'นาย', gender: 'ชาย', height: 170, weight: 80, waist: 36, job_duration: 15 },
  { email: 'test.user.4@example.com', name: 'นาตาลี่ ฉลาด', age: 31, title: 'นาง', gender: 'หญิง', height: 165, weight: 58, waist: 28, job_duration: 8 },
  { email: 'test.user.5@example.com', name: 'ประสิทธิ์ มีความ', age: 50, title: 'นาย', gender: 'ชาย', height: 168, weight: 75, waist: 34, job_duration: 25 }
];

async function simulateSurvey() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  console.log('🚀 Starting Individual Wellbeing Survey Simulation for 5 users...');
  
  const results = [];

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    const page = await context.newPage();
    console.log(`\n👤 User ${i + 1}/5: ${user.name} (${user.email})`);

    try {
      await page.goto('https://nidawellbeing.vercel.app/?org=test-org', { waitUntil: 'networkidle' });
      
      // Step 1: Enter Email
      await page.fill('#user-email-input', user.email);
      await page.click('button:has-text("ยืนยันอีเมล")');
      await page.waitForTimeout(1000);

      // Step 2: Start Survey
      await page.click('button:has-text("เริ่มทำแบบสำรวจ")');
      await page.waitForTimeout(1000);

      // Loop through sections
      let hasNext = true;
      let sectionCount = 0;
      
      while (hasNext) {
        sectionCount++;
        console.log(`  📋 Filling Section ${sectionCount}...`);
        
        // Fill all visible questions in current section
        await fillVisibleQuestions(page, user);
        
        // Check for "Next" button or "Confirm" button
        const nextBtn = page.locator('#btn-next');
        const confirmBtn = page.locator('button:has-text("ยืนยันและส่งข้อมูล")');
        
        if (await confirmBtn.isVisible()) {
          console.log('  📤 Submitting survey...');
          await confirmBtn.click();
          await page.waitForTimeout(3000); // Wait for submission
          hasNext = false;
        } else if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
        } else {
          console.warn('  ⚠️ No Next or Confirm button found!');
          hasNext = false;
        }
      }

      console.log(`  ✅ Success: ${user.name}`);
      results.push({ user: user.name, status: 'Success' });

    } catch (error) {
      console.error(`  ❌ Failed: ${user.name} - ${error.message}`);
      results.push({ user: user.name, status: 'Failed', error: error.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n📊 Summary Report:');
  console.table(results);
}

async function fillVisibleQuestions(page, user) {
  // 1. Radio Buttons (including scale)
  const radioCards = await page.locator('.question-card:visible').all();
  for (const card of radioCards) {
    const questionText = await card.locator('.question-text').innerText();
    
    // Fill specific fields if they match user data
    if (questionText.includes('คำนำหน้า')) {
      await card.locator(`input[type="radio"][value="${user.title}"]`).check().catch(() => {});
    } else if (questionText.includes('เพศ')) {
      await card.locator(`input[type="radio"][value="${user.gender}"]`).check().catch(() => {});
    } else if (questionText.includes('ประเภทหน่วยงาน')) {
        const radios = await card.locator('input[type="radio"]').all();
        if (radios.length > 0) await radios[Math.floor(Math.random() * radios.length)].check();
    } else if (questionText.includes('ระดับตำแหน่งงานปัจจุบัน')) {
        const radios = await card.locator('input[type="radio"]').all();
        if (radios.length > 0) await radios[Math.floor(Math.random() * radios.length)].check();
    } else {
        // General radio or scale
        const radios = await card.locator('input[type="radio"]').all();
        if (radios.length > 0) {
          // Pick a random one, but for scale 0-3 or 0-4, avoid "0" if we want a "healthy/positive" mock
          const index = Math.floor(Math.random() * radios.length);
          await radios[index].check().catch(() => {});
        }
    }

    // 2. Checkboxes
    const checkboxes = await card.locator('input[type="checkbox"]').all();
    if (checkboxes.length > 0) {
      // Check at least one
      await checkboxes[0].check().catch(() => {});
    }

    // 3. Number inputs
    const numberInput = card.locator('input[type="number"]');
    if (await numberInput.isVisible()) {
      if (questionText.includes('อายุ') && !questionText.includes('ราชการ')) {
        await numberInput.fill(user.age.toString());
      } else if (questionText.includes('ส่วนสูง')) {
        await numberInput.fill(user.height.toString());
      } else if (questionText.includes('น้ำหนัก')) {
        await numberInput.fill(user.weight.toString());
      } else if (questionText.includes('เส้นรอบเอว')) {
        await numberInput.fill(user.waist.toString());
      } else if (questionText.includes('อายุราชการ')) {
        await numberInput.fill(user.job_duration.toString());
      } else {
        await numberInput.fill('5'); // Default
      }
    }

    // 4. Text inputs
    const textInput = card.locator('input[type="text"]:not([type="number"])');
    if (await textInput.isVisible()) {
      if (questionText.includes('ชื่อ-สกุล')) {
        await textInput.fill(user.name);
      } else {
        await textInput.fill('ทดสอบ');
      }
    }

    // 5. Time inputs (selects)
    const hourSelect = card.locator('select[id$="_hour"]');
    const minuteSelect = card.locator('select[id$="_minute"]');
    if (await hourSelect.isVisible()) {
      await hourSelect.selectOption({ index: 1 });
    }
    if (await minuteSelect.isVisible()) {
      await minuteSelect.selectOption({ index: 1 });
    }
  }
}

simulateSurvey().catch(console.error);
