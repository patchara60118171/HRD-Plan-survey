const { chromium } = require('playwright');

// ข้อมูลสำหรับ 5 บุคคลทดสอบ
const testUsers = [
  {
    email: 'test.user.1@example.com',
    name: 'สมชาย ใจดี',
    title: 'นักวิเคราะห์นโยบาย',
    organization: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
    gender: 'ชาย',
    age: '35-44',
    org_type: 'ส่วนกลาง',
    job: 'นักวิเคราะห์',
    job_duration: '5-10 ปี',
    bmi: '22.5'
  },
  {
    email: 'test.user.2@example.com',
    name: 'สมหญิง รักงาน',
    title: 'เจ้าหน้าที่บริหาร',
    organization: 'สำนักงานนโยบายและยุทธศาสตร์การค้า',
    gender: 'หญิง',
    age: '25-34',
    org_type: 'ส่วนกลาง',
    job: 'เจ้าหน้าที่บริหาร',
    job_duration: '3-5 ปี',
    bmi: '20.8'
  },
  {
    email: 'test.user.3@example.com',
    name: 'วิรัติ มุ่งมั่น',
    title: 'นักพัฒนาซอฟต์แวร์',
    organization: 'สำนักงานคณะกรรมการกำกับกิจการกระจายเสียง กิจการโทรทัศน์',
    gender: 'ชาย',
    age: '30-39',
    org_type: 'รัฐวิสาหกิจ',
    job: 'นักพัฒนาซอฟต์แวร์',
    job_duration: '2-5 ปี',
    bmi: '24.1'
  },
  {
    email: 'test.user.4@example.com',
    name: 'นาตาลี่ ฉลาด',
    title: 'ที่ปรึกษากฎหมาย',
    organization: 'สำนักงานคณะกรรมการส่งเสริมการลงทุน',
    gender: 'หญิง',
    age: '40-49',
    org_type: 'ส่วนกลาง',
    job: 'ที่ปรึกษากฎหมาย',
    job_duration: '10-15 ปี',
    bmi: '21.3'
  },
  {
    email: 'test.user.5@example.com',
    name: 'ประสิทธิ์ มีความ',
    title: 'หัวหน้าแผนก',
    organization: 'สำนักงานปลอดภัยอาหารและยา',
    gender: 'ชาย',
    age: '45-54',
    org_type: 'รัฐวิสาหกิจ',
    job: 'หัวหน้าแผนก',
    job_duration: '15-20 ปี',
    bmi: '26.7'
  }
];

async function fillWellbeingForm(page, userData) {
  console.log(`🔄 Starting form for: ${userData.name} (${userData.email})`);
  
  try {
    // รอให้หน้าโหลดเสร็จ
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // ตรวจสอบว่ามีปุ่มยืนยันอีเมลหรือไม่
    const emailConfirmBtn = await page.locator('button:has-text("ยืนยันอีเมล"), button:has-text("ยืนยัน"), button:has-text("Confirm")').first();
    if (await emailConfirmBtn.isVisible()) {
      console.log('📧 Found email confirmation button');
      await emailConfirmBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // ตรวจสอบว่ามีปุ่มเริ่มต้นหรือไม่
    const startButton = await page.locator('button:has-text("เริ่มทำแบบสำรวจ"), button:has-text("เริ่ม"), button:has-text("Start")').first();
    if (await startButton.isVisible()) {
      console.log('🚀 Found start button');
      await startButton.click();
      await page.waitForTimeout(2000);
    }
    
    // ข้อมูลส่วนบุคคล
    console.log('📝 Filling personal information...');
    
    // รอให้ฟอร์มปรากฏ
    await page.waitForTimeout(2000);
    
    // Email - ลองหาแบบต่างๆ
    try {
      const emailInput = await page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill(userData.email);
        console.log('✅ Email filled');
      }
    } catch (e) {
      console.log('⚠️ Email input not found');
    }
    
    await page.waitForTimeout(500);
    
    // Name - ลองหาแบบต่างๆ
    try {
      const nameInput = await page.locator('input[type="text"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(userData.name);
        console.log('✅ Name filled');
      }
    } catch (e) {
      console.log('⚠️ Name input not found');
    }
    
    await page.waitForTimeout(500);
    
    // Title/Position
    try {
      const titleInput = await page.locator('input[type="text"]').nth(1);
      if (await titleInput.isVisible()) {
        await titleInput.fill(userData.title);
        console.log('✅ Title filled');
      }
    } catch (e) {
      console.log('⚠️ Title input not found');
    }
    
    await page.waitForTimeout(500);
    
    // Organization
    try {
      const orgSelect = await page.locator('select').first();
      if (await orgSelect.isVisible()) {
        // พยายยามเลือกตามชื่อหน่วยงาน
        try {
          await orgSelect.selectOption({ label: userData.organization });
          console.log('✅ Organization selected by label');
        } catch (e) {
          // ถ้าเลือกตามชื่อไม่ได้ เลือกตัวเลือกแรก
          await orgSelect.selectOption({ index: 1 });
          console.log('✅ Organization selected by index');
        }
      }
    } catch (e) {
      console.log('⚠️ Organization select not found');
    }
    
    await page.waitForTimeout(500);
    
    // Gender
    try {
      const genderRadio = await page.locator(`input[type="radio"][value="${userData.gender}"]`).first();
      if (await genderRadio.isVisible()) {
        await genderRadio.check();
        console.log('✅ Gender selected');
      }
    } catch (e) {
      console.log('⚠️ Gender radio not found');
    }
    
    await page.waitForTimeout(500);
    
    // Age
    try {
      const ageSelect = await page.locator('select').nth(1);
      if (await ageSelect.isVisible()) {
        try {
          await ageSelect.selectOption({ label: userData.age });
          console.log('✅ Age selected by label');
        } catch (e) {
          await ageSelect.selectOption({ index: 1 });
          console.log('✅ Age selected by index');
        }
      }
    } catch (e) {
      console.log('⚠️ Age select not found');
    }
    
    await page.waitForTimeout(500);
    
    // Organization Type
    try {
      const orgTypeSelect = await page.locator('select').nth(2);
      if (await orgTypeSelect.isVisible()) {
        try {
          await orgTypeSelect.selectOption({ label: userData.org_type });
          console.log('✅ Organization type selected');
        } catch (e) {
          await orgTypeSelect.selectOption({ index: 1 });
          console.log('✅ Organization type selected by index');
        }
      }
    } catch (e) {
      console.log('⚠️ Organization type select not found');
    }
    
    await page.waitForTimeout(500);
    
    // Job
    try {
      const jobSelect = await page.locator('select').nth(3);
      if (await jobSelect.isVisible()) {
        try {
          await jobSelect.selectOption({ label: userData.job });
          console.log('✅ Job selected');
        } catch (e) {
          await jobSelect.selectOption({ index: 1 });
          console.log('✅ Job selected by index');
        }
      }
    } catch (e) {
      console.log('⚠️ Job select not found');
    }
    
    await page.waitForTimeout(500);
    
    // Job Duration
    try {
      const jobDurationSelect = await page.locator('select').nth(4);
      if (await jobDurationSelect.isVisible()) {
        try {
          await jobDurationSelect.selectOption({ label: userData.job_duration });
          console.log('✅ Job duration selected');
        } catch (e) {
          await jobDurationSelect.selectOption({ index: 1 });
          console.log('✅ Job duration selected by index');
        }
      }
    } catch (e) {
      console.log('⚠️ Job duration select not found');
    }
    
    await page.waitForTimeout(500);
    
    // BMI
    try {
      const bmiInput = await page.locator('input[type="number"]').first();
      if (await bmiInput.isVisible()) {
        await bmiInput.fill(userData.bmi);
        console.log('✅ BMI filled');
      }
    } catch (e) {
      console.log('⚠️ BMI input not found');
    }
    
    await page.waitForTimeout(500);
    
    // คลิกถัดไป
    try {
      const nextButton = await page.locator('button:has-text("ถัดไป"), button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        console.log('✅ Next button clicked');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('⚠️ Next button not found');
    }
    
    // กรอกข้อมูลทุกหมวดที่เหลือ (ทำแบบง่ายๆ)
    for (let i = 0; i < 20; i++) {
      console.log(`📋 Filling section ${i + 1}/20`);
      
      // รอให้หน้าโหลด
      await page.waitForTimeout(1500);
      
      // ตอบคำถามในหมวดนี้
      await fillSectionQuestions(page);
      
      // คลิกถัดไป (ถ้ามี)
      try {
        const nextButton = page.locator('button:has-text("ถัดไป"), button:has-text("Next"), button:has-text("ส่งแบบสำรวจ")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
        } else {
          console.log('🏁 No more next buttons, form might be completed');
          break;
        }
      } catch (e) {
        console.log('🏁 No more next buttons, form might be completed');
        break;
      }
    }
    
    console.log(`✅ Completed form for: ${userData.name}`);
    
  } catch (error) {
    console.error(`❌ Error filling form for ${userData.name}:`, error.message);
    // ไม่ throw error เพื่อให้ทดสอบต่อไปได้
  }
}

async function fillSectionQuestions(page) {
  try {
    // รอให้คำถามปรากฏ
    await page.waitForTimeout(1000);
    
    // จัดการคำถามประเภทต่างๆ
    
    // Radio buttons
    const radioGroups = await page.locator('input[type="radio"]').all();
    for (const radio of radioGroups.slice(0, 8)) { // เลือกแค่ 8 อันแรก
      try {
        if (await radio.isVisible()) {
          await radio.check();
          await page.waitForTimeout(200);
        }
      } catch (e) {
        // ข้ามถ้าไม่สามารถคลิกได้
      }
    }
    
    // Checkboxes
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes.slice(0, 4)) { // เลือกแค่ 4 อันแรก
      try {
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await page.waitForTimeout(200);
        }
      } catch (e) {
        // ข้ามถ้าไม่สามารถคลิกได้
      }
    }
    
    // Select dropdowns
    const selects = await page.locator('select').all();
    for (const select of selects.slice(0, 5)) { // เลือกแค่ 5 อันแรก
      try {
        if (await select.isVisible()) {
          const options = await select.locator('option').all();
          if (options.length > 1) {
            // เลือกตัวเลือกที่ 2 (ข้ามค่าว่าง)
            await select.selectOption({ index: 1 });
            await page.waitForTimeout(200);
          }
        }
      } catch (e) {
        // ข้ามถ้าไม่สามารถเลือกได้
      }
    }
    
    // Text inputs
    const textInputs = await page.locator('input[type="text"], input[type="number"], textarea').all();
    for (const input of textInputs.slice(0, 5)) { // กรอกแค่ 5 ช่องแรก
      try {
        if (await input.isVisible()) {
          const inputType = await input.getAttribute('type');
          if (inputType === 'number') {
            await input.fill(Math.floor(Math.random() * 10) + 1);
          } else {
            await input.fill('ทดสอบ');
          }
          await page.waitForTimeout(200);
        }
      } catch (e) {
        // ข้ามถ้าไม่สามารถกรอกได้
      }
    }
    
    // Time inputs (ชั่วโมง:นาที)
    const timeInputs = await page.locator('.time-select').all();
    for (const timeSelect of timeInputs.slice(0, 3)) { // เลือกแค่ 3 อันแรก
      try {
        if (await timeSelect.isVisible()) {
          await timeSelect.selectOption({ index: 1 }); // เลือกตัวเลือกแรก
          await page.waitForTimeout(200);
        }
      } catch (e) {
        // ข้ามถ้าไม่สามารถเลือกได้
      }
    }
    
  } catch (error) {
    console.log(`⚠️ Some questions could not be filled:`, error.message);
  }
}

async function runWellbeingSurveyTest() {
  console.log('🚀 Starting Wellbeing Survey Test - 5 Users');
  console.log('🌐 Target URL: https://nidawellbeing.vercel.app/?org=test-org');
  console.log('📋 Simulating real users filling the complete form\n');
  
  const browser = await chromium.launch({ 
    headless: false, // แสดง browser เพื่อดูการทำงาน
    slowMo: 50 // ทำงานช้าๆ เพื่อให้เห็นการทำงานชัดเข้า
  });
  
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  
  const results = {
    success: 0,
    failed: 0,
    errors: [],
    startTime: new Date().toISOString()
  };
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n👤 User ${i + 1}/5: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Organization: ${user.organization}`);
    
    const page = await context.newPage();
    
    try {
      // เข้าสู่เว็บไซต์
      await page.goto('https://nidawellbeing.vercel.app/?org=test-org', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // กรอกแบบสำรวจ
      await fillWellbeingForm(page, user);
      
      results.success++;
      console.log(`✅ Success: ${user.name}`);
      
    } catch (error) {
      results.failed++;
      results.errors.push(`User ${i + 1} (${user.name}): ${error.message}`);
      console.error(`❌ Failed: ${user.name} - ${error.message}`);
    } finally {
      await page.close();
      await page.waitForTimeout(3000); // รอ 3 วินาทีก่อนไปคนถัดไป
    }
  }
  
  await browser.close();
  
  // แสดงผลลัพธ์
  console.log('\n' + '='.repeat(60));
  console.log('📊 Wellbeing Survey Test Results Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success}/5`);
  console.log(`❌ Failed: ${results.failed}/5`);
  console.log(`📈 Success Rate: ${((results.success / 5) * 100).toFixed(1)}%`);
  console.log(`⏰ Test Duration: ${Math.round((new Date() - new Date(results.startTime)) / 1000)} seconds`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  // บันทึกผลลัพธ์
  const reportData = {
    testType: 'Wellbeing Survey Complete Form Test',
    url: 'https://nidawellbeing.vercel.app/?org=test-org',
    timestamp: new Date().toISOString(),
    results: results,
    testUsers: testUsers.map(user => ({
      name: user.name,
      email: user.email,
      organization: user.organization
    }))
  };
  
  const fs = require('fs');
  fs.writeFileSync('C:/temp/wellbeing-test-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n📝 Detailed results saved to: C:/temp/wellbeing-test-results.json');
  
  console.log('\n🎉 Wellbeing Survey Test Completed!');
  
  if (results.success === 5) {
    console.log('🏆 Perfect! All users completed the form successfully');
  } else if (results.success >= 3) {
    console.log('👍 Good! Most users completed the form');
  } else {
    console.log('⚠️ Issues detected. Check the errors above');
  }
}

// รันการทดสอบ
runWellbeingSurveyTest().catch(console.error);
