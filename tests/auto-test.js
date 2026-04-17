const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:62018';
const RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  testedButtons: []
};

function log(name, status, detail = '') {
  RESULTS.total++;
  const time = new Date().toLocaleTimeString();
  if (status === 'PASS') {
    RESULTS.passed++;
    console.log(`✅ [${time}] ${name}`);
  } else {
    RESULTS.failed++;
    RESULTS.errors.push({ name, detail, time });
    console.log(`❌ [${time}] ${name}: ${detail}`);
  }
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log('🚀 เริ่มทดสอบระบบอัตโนมัติ...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`🌐 Console: ${msg.text()}`);
  });

  try {
    // === ทดสอบหน้า Wellbeing Survey ===
    console.log('\n📄 Wellbeing Survey (/?org=test-org)');
    await page.goto('https://nidawellbeing.vercel.app/?org=test-org', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    log('โหลดหน้าแรก', title.includes('Well-being') || title.includes('สำรวจ') ? 'PASS' : 'FAIL', title);
    
    // รอให้หน้าโหลดสมบูรณ์
    await page.waitForTimeout(3000);
    
    // หาปุ่มทั้งหมดในหน้า
    const buttons = await page.locator('button, a.btn, [role="button"], .btn').all();
    console.log(`   พบปุ่ม: ${buttons.length}`);
    
    // ทดสอบกดปุ่มทั้งหมด
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      try {
        const text = await btn.textContent().catch(() => '');
        const visible = await btn.isVisible().catch(() => false);
        
        if (visible && text.trim()) {
          const btnText = text.trim().slice(0, 30);
          console.log(`   🔘 กดปุ่ม: "${btnText}"`);
          
          // บันทึกปุ่มที่ทดสอบ
          RESULTS.testedButtons.push({ 
            page: 'wellbeing', 
            text: btnText,
            index: i
          });
          
          // กดปุ่ม
          await btn.click();
          await page.waitForTimeout(1000);
          
          // ตรวจสอบว่ามีการเปลี่ยนหน้าหรือไม่
          const currentUrl = page.url();
          const hasChanged = currentUrl !== 'https://nidawellbeing.vercel.app/?org=test-org';
          
          log(`กดปุ่ม "${btnText}"`, 'PASS', hasChanged ? 'เปลี่ยนหน้า' : 'อยู่หน้าเดิม');
          
          // ถ้าเปลี่ยนหน้า ให้กลับมาหน้าแรก
          if (hasChanged) {
            await page.goto('https://nidawellbeing.vercel.app/?org=test-org', { 
              waitUntil: 'networkidle',
              timeout: 15000 
            });
            await page.waitForTimeout(1000);
          }
        }
      } catch (e) {
        const btnText = await btn.textContent().catch(() => 'ปุ่มไม่มีข้อความ');
        log(`กดปุ่ม "${btnText.trim().slice(0, 30)}"`, 'FAIL', e.message);
      }
    }
    
    // === ทดสอบปุ่มในแบบสำรวจ (ถ้ามี) ===
    console.log('\n📝 ทดสอบปุ่มในแบบสำรวจ');
    
    // หาปุ่มเริ่ม
    const startBtn = await page.locator('button:has-text("เริ่ม"), button:has-text("เริ่มทำแบบสำรวจ"), button:has-text("Start")').first();
    const startVisible = await startBtn.isVisible().catch(() => false);
    
    if (startVisible) {
      log('พบปุ่มเริ่มแบบสำรวจ', 'PASS');
      
      // กดปุ่มเริ่ม
      await startBtn.click();
      await page.waitForTimeout(2000);
      log('กดปุ่มเริ่ม', 'PASS');
      
      // หาปุ่มในแบบสำรวจ
      const surveyButtons = await page.locator('button, .btn, [role="button"]').all();
      console.log(`   พบปุ่มในแบบสำรวจ: ${surveyButtons.length}`);
      
      // ทดสอบกดปุ่มในแบบสำรวจ (จำกัด 10 ปุ่ม)
      for (let i = 0; i < Math.min(surveyButtons.length, 10); i++) {
        const btn = surveyButtons[i];
        try {
          const text = await btn.textContent().catch(() => '');
          const visible = await btn.isVisible().catch(() => false);
          
          if (visible && text.trim()) {
            const btnText = text.trim().slice(0, 30);
            console.log(`   � กดปุ่ม: "${btnText}"`);
            
            RESULTS.testedButtons.push({ 
              page: 'survey', 
              text: btnText,
              index: i
            });
            
            await btn.click();
            await page.waitForTimeout(800);
            
            log(`กดปุ่ม "${btnText}"`, 'PASS');
          }
        } catch (e) {
          const btnText = await btn.textContent().catch(() => 'ปุ่มไม่มีข้อความ');
          log(`กดปุ่ม "${btnText.trim().slice(0, 30)}"`, 'FAIL', e.message);
        }
      }
    } else {
      log('พบปุ่มเริ่มแบบสำรวจ', 'FAIL');
    }
    
    // === สรุปผล ===
    console.log('\n' + '='.repeat(50));
    console.log('📊 สรุปผลการทดสอบ');
    console.log('='.repeat(50));
    console.log(`✅ ผ่าน: ${RESULTS.passed}/${RESULTS.total}`);
    console.log(`❌ ไม่ผ่าน: ${RESULTS.failed}/${RESULTS.total}`);
    console.log(`🔘 ปุ่มที่ตรวจสอบ: ${RESULTS.testedButtons.length}`);
    
    const rate = ((RESULTS.passed / RESULTS.total) * 100).toFixed(1);
    console.log(`\n🎯 คะแนน: ${rate}%`);
    
    if (RESULTS.failed === 0) {
      console.log('\n🎉 ระบบสมบูรณ์! พร้อมใช้งาน');
    } else if (RESULTS.failed <= 2) {
      console.log('\n⚠️ มีจุดเล็กน้อยต้องตรวจสอบ');
    } else {
      console.log('\n🚨 มีปัญหาที่ต้องแก้ไข');
      console.log('\nรายการที่พบปัญหา:');
      RESULTS.errors.forEach((e, i) => console.log(`  ${i+1}. ${e.name}: ${e.detail}`));
    }
    
    // บันทึกผล
    fs.writeFileSync('C:/temp/test-results.json', JSON.stringify(RESULTS, null, 2));
    console.log('\n📝 บันทึกผล: C:/temp/test-results.json');

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 เสร็จสิ้น');
  }
}

runTests();
