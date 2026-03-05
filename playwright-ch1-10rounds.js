/**
 * CH1 Form Automation - 10 Rounds with Different Organizations
 * Fills all fields, uploads PDFs, and submits the form
 */

const { chromium } = require('playwright');
const path = require('path');

// Configuration
const FORM_URL = 'https://nidawellbeing.vercel.app/ch1';
const PDF_DIR = path.join(__dirname, 'test-pdfs');

// 10 Different organizations for each round
const ORGANIZATIONS = [
  'กรมอนามัย',
  'กรมควบคุมโรค',
  'กรมการแพทย์',
  'กรมสุขภาพจิต',
  'กรมวิทยาศาสตร์การแพทย์',
  'สำนักงานคณะกรรมการอาหารและยา',
  'กรมสนับสนุนบริการสุขภาพ',
  'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
  'สถาบันการแพทย์ฉุกเฉินแห่งชาติ',
  'สำนักงานหลักประกันสุขภาพแห่งชาติ'
];

// Random data generators
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate random Thai names
const FIRST_NAMES = ['สมชาย', 'สมหญิง', 'ประเสริฐ', 'มานี', 'วิชัย', 'ประภา', 'สุรชัย', 'นภา', 'กรกฎ', 'พรทิพย์'];
const LAST_NAMES = ['รักไทย', 'สง่างาม', 'ประดิษฐ์', 'วัฒนา', 'แสงสว่าง', 'ใจดี', 'มีชัย', 'สวยงาม', 'เก่งกาจ', 'อ่อนโยน'];
const generateName = () => `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`;

// Generate random text
const generateText = (minWords = 5, maxWords = 20) => {
  const words = ['การ', 'พัฒนา', 'สุขภาวะ', 'ข้าราชการ', 'องค์กร', 'หน่วยงาน', 'สุขภาพ', 'การทำงาน', 'ประสิทธิภาพ', 'ยุทธศาสตร์', 'แผนงาน', 'โครงการ', 'ดำเนินการ', 'สำเร็จ', 'ผลลัพธ์', 'เป้าหมาย', 'การบริหาร', 'ทรัพยากร', 'บุคลากร', 'พัฒนา', 'สร้างสรรค์', 'นวัตกรรม', 'การเปลี่ยนแปลง', 'ยั่งยืน', 'มั่นคง'];
  const count = randomInt(minWords, maxWords);
  return Array.from({ length: count }, () => randomChoice(words)).join('');
};

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to fill form for one organization
async function fillFormForOrganization(browser, orgName, roundNum) {
  console.log(`\n🔄 Round ${roundNum}/10: ${orgName}`);
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to form
    console.log('  📍 Loading form...');
    await page.goto(FORM_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);
    
    // Fill email and start
    const email = `test${roundNum}_${Date.now()}@example.com`;
    console.log(`  ✉️  Using email: ${email}`);
    await page.fill('#respondent_email', email);
    await page.click('button[onclick="confirmEmailAndStart()"]');
    await delay(2000);
    
    // ==========================================
    // STEP 1: ข้อมูลเบื้องต้นของส่วนราชการ
    // ==========================================
    console.log('  📝 Step 1: Basic Organization Info');
    
    // Select organization
    await page.selectOption('#organization', orgName);
    
    // Fill strategic overview
    await page.fill('#strategic_overview', `ภาพรวมยุทธศาสตร์${orgName}: ${generateText(10, 30)}`);
    
    // Upload strategy PDF
    const strategyPdfPath = path.join(PDF_DIR, 'test-strategy.pdf');
    const fileInput1 = await page.locator('#file-strategy');
    await fileInput1.setInputFiles(strategyPdfPath);
    await delay(2000);
    console.log('  📄 Uploaded strategy PDF');
    
    // Fill org structure
    await page.fill('#org_structure', `โครงสร้าง${orgName}: ${generateText(8, 25)}`);
    
    // Upload org structure PDF
    const orgPdfPath = path.join(PDF_DIR, 'test-org-structure.pdf');
    const fileInput2 = await page.locator('#file-org');
    await fileInput2.setInputFiles(orgPdfPath);
    await delay(2000);
    console.log('  📄 Uploaded org structure PDF');
    
    // Fill total staff
    const totalStaff = randomInt(100, 1000);
    await page.fill('#total_staff', totalStaff.toString());
    
    // Fill staff types
    const typeOfficial = Math.floor(totalStaff * 0.6);
    const typeEmployee = Math.floor(totalStaff * 0.2);
    const typeContract = Math.floor(totalStaff * 0.15);
    const typeOther = totalStaff - typeOfficial - typeEmployee - typeContract;
    
    await page.fill('#type_official', typeOfficial.toString());
    await page.fill('#type_employee', typeEmployee.toString());
    await page.fill('#type_contract', typeContract.toString());
    await page.fill('#type_other', typeOther.toString());
    
    // Fill age distribution (should match officials count)
    const ageU30 = Math.floor(typeOfficial * 0.2);
    const age31_40 = Math.floor(typeOfficial * 0.3);
    const age41_50 = Math.floor(typeOfficial * 0.3);
    const age51_60 = typeOfficial - ageU30 - age31_40 - age41_50;
    
    await page.fill('#age_u30', ageU30.toString());
    await page.fill('#age_31_40', age31_40.toString());
    await page.fill('#age_41_50', age41_50.toString());
    await page.fill('#age_51_60', age51_60.toString());
    
    // Fill service years
    const serviceU1 = Math.floor(totalStaff * 0.1);
    const service1_5 = Math.floor(totalStaff * 0.2);
    const service6_10 = Math.floor(totalStaff * 0.2);
    const service11_15 = Math.floor(totalStaff * 0.15);
    const service16_20 = Math.floor(totalStaff * 0.15);
    const service21_25 = Math.floor(totalStaff * 0.1);
    const service26_30 = Math.floor(totalStaff * 0.05);
    const serviceOver30 = totalStaff - serviceU1 - service1_5 - service6_10 - service11_15 - service16_20 - service21_25 - service26_30;
    
    await page.fill('#service_u1', serviceU1.toString());
    await page.fill('#service_1_5', service1_5.toString());
    await page.fill('#service_6_10', service6_10.toString());
    await page.fill('#service_11_15', service11_15.toString());
    await page.fill('#service_16_20', service16_20.toString());
    await page.fill('#service_21_25', service21_25.toString());
    await page.fill('#service_26_30', service26_30.toString());
    await page.fill('#service_over30', serviceOver30.toString());
    
    // Fill position distribution
    const posO1 = Math.floor(totalStaff * 0.15);
    const posO2 = Math.floor(totalStaff * 0.2);
    const posO3 = Math.floor(totalStaff * 0.1);
    const posO4 = Math.floor(totalStaff * 0.05);
    const posK1 = Math.floor(totalStaff * 0.15);
    const posK2 = Math.floor(totalStaff * 0.12);
    const posK3 = Math.floor(totalStaff * 0.08);
    const posK4 = Math.floor(totalStaff * 0.05);
    const posK5 = Math.floor(totalStaff * 0.03);
    const posM1 = Math.floor(totalStaff * 0.04);
    const posM2 = Math.floor(totalStaff * 0.02);
    const posS1 = Math.floor(totalStaff * 0.03);
    const posS2 = Math.floor(totalStaff * 0.02);
    
    await page.fill('#pos_o1', posO1.toString());
    await page.fill('#pos_o2', posO2.toString());
    await page.fill('#pos_o3', posO3.toString());
    await page.fill('#pos_o4', posO4.toString());
    await page.fill('#pos_k1', posK1.toString());
    await page.fill('#pos_k2', posK2.toString());
    await page.fill('#pos_k3', posK3.toString());
    await page.fill('#pos_k4', posK4.toString());
    await page.fill('#pos_k5', posK5.toString());
    await page.fill('#pos_m1', posM1.toString());
    await page.fill('#pos_m2', posM2.toString());
    await page.fill('#pos_s1', posS1.toString());
    await page.fill('#pos_s2', posS2.toString());
    
    // Fill turnover data for years 2564-2568
    for (let year = 2564; year <= 2568; year++) {
      const beginStaff = totalStaff + randomInt(-50, 50);
      const endStaff = beginStaff + randomInt(-30, 30);
      const leaveStaff = randomInt(5, 20);
      
      await page.fill(`#begin_${year}`, beginStaff.toString());
      await page.fill(`#end_${year}`, endStaff.toString());
      await page.fill(`#leave_${year}`, leaveStaff.toString());
    }
    
    // Click next
    await page.click('#btn-next');
    await delay(1500);
    
    // ==========================================
    // STEP 2: นโยบายและบริบทภายนอกองค์กร
    // ==========================================
    console.log('  📝 Step 2: Policies and Context');
    
    await page.fill('#related_policies', `นโยบาย${orgName}: ${generateText(15, 40)}`);
    await page.fill('#context_challenges', `บริบทและความท้าทายของ${orgName}: ${generateText(15, 40)}`);
    
    await page.click('#btn-next');
    await delay(1500);
    
    // ==========================================
    // STEP 3: ข้อมูลสุขภาวะของข้าราชการ
    // ==========================================
    console.log('  📝 Step 3: Employee Wellbeing Data');
    
    // Disease data
    await page.fill('#disease_diabetes', randomInt(10, 50).toString());
    await page.fill('#disease_hypertension', randomInt(20, 80).toString());
    await page.fill('#disease_cardiovascular', randomInt(5, 30).toString());
    await page.fill('#disease_kidney', randomInt(3, 20).toString());
    await page.fill('#disease_liver', randomInt(5, 25).toString());
    await page.fill('#disease_cancer', randomInt(2, 15).toString());
    await page.fill('#disease_obesity', randomInt(30, 100).toString());
    await page.fill('#disease_other_count', randomInt(5, 30).toString());
    await page.fill('#disease_other_detail', 'โรคภูมิแพ้, โรคกระดูกสันหลัง, โรคข้อเข่าเสื่อม');
    
    // Sick leave data
    await page.fill('#sick_leave_days', randomInt(500, 2000).toString());
    await page.fill('#sick_leave_avg', (randomInt(3, 8) + Math.random()).toFixed(2));
    
    // Clinic data
    await page.fill('#clinic_users_per_year', randomInt(200, 800).toString());
    await page.fill('#clinic_top_symptoms', 'ปวดหัว, ปวดกล้ามเนื้อ, คอบ่าไหล่, ความดันโลหิตสูง');
    await page.fill('#clinic_top_medications', 'พาราเซตามอล, ยาลดความดัน, ยาคลายกล้ามเนื้อ');
    
    // Mental health data
    await page.fill('#mental_stress', `พบภาวะเครียดเรื้อรัง ${randomInt(20, 80)} คน (${randomInt(5, 15)}%)`);
    await page.fill('#mental_anxiety', `พบภาวะวิตกกังวล ${randomInt(15, 60)} คน (${randomInt(4, 12)}%)`);
    await page.fill('#mental_sleep', `พบปัญหาการนอนหลับ ${randomInt(30, 100)} คน (${randomInt(8, 20)}%)`);
    await page.fill('#mental_burnout', `พบภาวะหมดไฟ ${randomInt(25, 90)} คน (${randomInt(7, 18)}%)`);
    await page.fill('#mental_depression', `พบภาวะซึมเศร้า ${randomInt(10, 40)} คน (${randomInt(3, 10)}%)`);
    
    // Engagement data
    await page.fill('#engagement_score', `2568: ${randomInt(70, 85)}/100, 2567: ${randomInt(68, 82)}/100, 2566: ${randomInt(65, 80)}/100`);
    await page.fill('#engagement_low_areas', 'การสื่อสารภายในองค์กร, โอกาสในการพัฒนาอาชีพ, สมดุลชีวิตการทำงาน');
    
    // Other surveys
    await page.fill('#other_wellbeing_surveys', `สำรวจสุขภาวะเพิ่มเติม: ${generateText(10, 25)}`);
    
    await page.click('#btn-next');
    await delay(1500);
    
    // ==========================================
    // STEP 4: ระบบการบริหารและสภาพแวดล้อม
    // ==========================================
    console.log('  📝 Step 4: Management Systems and Environment');
    
    // Wait for support systems to be rendered
    await delay(1000);
    
    // Fill training hours
    await page.fill('#training_hours', `2568: ${randomInt(30, 50)} ชม., 2567: ${randomInt(28, 48)} ชม., 2566: ${randomInt(25, 45)} ชม.`);
    
    // Select digital systems (checkboxes)
    const digitalValues = ['e_doc', 'e_sign', 'cloud', 'hr_digital', 'health_db'];
    const numDigital = randomInt(2, 5);
    const selectedDigital = digitalValues.slice(0, numDigital);
    for (const value of selectedDigital) {
      await page.check(`input[name="digital_systems"][value="${value}"]`);
    }
    
    // Select ergonomics status
    const ergonomicsOptions = ['none', 'planned', 'in_progress', 'done'];
    const selectedErgo = randomChoice(ergonomicsOptions);
    await page.check(`input[name="ergonomics_status"][value="${selectedErgo}"]`);
    
    if (selectedErgo === 'planned') {
      await page.fill('#ergonomics_planned_detail', `แผนยศาสตร์${orgName}: ${generateText(5, 15)}`);
    } else if (selectedErgo === 'in_progress') {
      await page.fill('#ergonomics_in_progress_detail', `ดำเนินการยศาสตร์: ${generateText(5, 15)}`);
    } else if (selectedErgo === 'done') {
      await page.fill('#ergonomics_done_detail', `ผลลัพธ์ยศาสตร์: ${generateText(5, 15)}`);
    }
    
    await page.click('#btn-next');
    await delay(1500);
    
    // ==========================================
    // STEP 5: ทิศทาง เป้าหมาย และข้อเสนอแนะ
    // ==========================================
    console.log('  📝 Step 5: Strategic Priorities');
    
    // Select 2-3 strategic priorities
    const priorities = ['service_efficiency', 'digital_capability', 'new_leaders', 'reduce_sick_leave', 'reduce_turnover'];
    const numPriorities = randomInt(2, 3);
    for (let i = 0; i < numPriorities; i++) {
      await page.click(`.rank-item[data-value="${priorities[i]}"]`);
      await delay(300);
    }
    
    // Fill intervention feedback
    await page.fill('#intervention_packages_feedback', `ข้อเสนอแนะ Intervention Packages สำหรับ${orgName}: ${generateText(15, 35)}`);
    
    // Fill HRD plan URL and results
    await page.fill('#hrd_plan_url', `https://drive.google.com/file/d/${randomInt(100000, 999999)}/view`);
    await page.fill('#hrd_plan_results', `ผลการปฏิบัติงานตามแผน HRD ${orgName}: ${generateText(10, 30)}`);
    
    // Upload HRD plan PDF
    const hrdPdfPath = path.join(PDF_DIR, 'test-hrd-plan.pdf');
    const fileInput3 = await page.locator('#file-hrd');
    await fileInput3.setInputFiles(hrdPdfPath);
    await delay(2000);
    console.log('  📄 Uploaded HRD plan PDF');
    
    // Submit form
    console.log('  📤 Submitting form...');
    await page.click('#btn-next');
    
    // Wait for success overlay
    await page.waitForSelector('#overlay-success:not(.hidden)', { timeout: 60000 });
    console.log(`  ✅ Form submitted successfully for ${orgName}!`);
    
    await delay(2000);
    
  } catch (error) {
    console.error(`  ❌ Error for ${orgName}:`, error.message);
    // Take screenshot on error
    await page.screenshot({ path: `error-round-${roundNum}.png`, fullPage: true });
    throw error;
  } finally {
    await context.close();
  }
}

// Main execution
async function main() {
  console.log('========================================');
  console.log('🚀 CH1 Form Automation - 10 Rounds');
  console.log('========================================');
  console.log(`📁 PDF Directory: ${PDF_DIR}`);
  console.log(`🔗 Form URL: ${FORM_URL}`);
  console.log('');
  
  const browser = await chromium.launch({ headless: false }); // Set to true for headless
  
  try {
    for (let i = 0; i < ORGANIZATIONS.length; i++) {
      const org = ORGANIZATIONS[i];
      const roundNum = i + 1;
      
      try {
        await fillFormForOrganization(browser, org, roundNum);
      } catch (error) {
        console.error(`  ⚠️  Round ${roundNum} failed, continuing...`);
      }
      
      // Delay between rounds
      if (i < ORGANIZATIONS.length - 1) {
        console.log('  ⏳ Waiting 5 seconds before next round...');
        await delay(5000);
      }
    }
    
    console.log('\n========================================');
    console.log('✅ All 10 rounds completed!');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
main().catch(console.error);
