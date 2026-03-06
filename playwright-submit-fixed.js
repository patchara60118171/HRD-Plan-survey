const { chromium } = require('playwright');
const fs = require('fs');

// Organizations to test
const organizations = [
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
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTestData(index) {
    const org = organizations[index % organizations.length];
    const totalStaff = randomInt(500, 5000);
    
    return {
        email: `test${index + 1}_${Date.now()}@health.go.th`,
        organization: org,
        strategic_overview: `แผนยุทธศาสตร์ ${org} ปี ${randomInt(2565, 2568)} มุ่งเน้นการพัฒนาศักยภาพบุคลากร`,
        org_structure: `โครงสร้างองค์กร ${org} แบ่งเป็น ${randomInt(5, 15)} ส่วน/กลุ่ม`,
        total_staff: totalStaff,
        type_official: Math.floor(totalStaff * 0.70),
        type_employee: Math.floor(totalStaff * 0.20),
        type_contract: Math.floor(totalStaff * 0.08),
        type_other: Math.floor(totalStaff * 0.02),
        age_u30: Math.floor(totalStaff * 0.25),
        age_31_40: Math.floor(totalStaff * 0.30),
        age_41_50: Math.floor(totalStaff * 0.25),
        age_51_60: Math.floor(totalStaff * 0.20),
        service_u1: Math.floor(totalStaff * 0.10),
        service_1_5: Math.floor(totalStaff * 0.20),
        service_6_10: Math.floor(totalStaff * 0.25),
        service_11_15: Math.floor(totalStaff * 0.20),
        service_16_20: Math.floor(totalStaff * 0.15),
        service_21_25: Math.floor(totalStaff * 0.07),
        service_26_30: Math.floor(totalStaff * 0.02),
        service_over30: Math.floor(totalStaff * 0.01),
        related_policies: `นโยบายที่เกี่ยวข้องกับการพัฒนาบุคลากรของ ${org}`,
        context_challenges: `ความท้าทายในการบริหารบุคลากร ${randomInt(3, 8)} ประการ`,
        disease_diabetes: randomInt(50, 200),
        disease_hypertension: randomInt(100, 400),
        disease_cardiovascular: randomInt(30, 150),
        disease_kidney: randomInt(10, 50),
        disease_liver: randomInt(20, 80),
        disease_cancer: randomInt(5, 30),
        disease_obesity: randomInt(50, 300),
        clinic_users_per_year: randomInt(1000, 5000),
        clinic_top_symptoms: 'ปวดหัว, ปวดกล้ามเนื้อ, ความดันโลหิตสูง, ไข้หวัด',
        clinic_top_medications: 'พาราเซตามอล, ยาลดความดัน, ยาบำรุงเลือด',
        mental_stress: `พบผู้มีความเครียดสูง ${randomInt(3, 15)}%`,
        mental_anxiety: `พบภาวะวิตกกังวล ${randomInt(2, 10)}%`,
        mental_sleep: `มีปัญหาการนอนหลับ ${randomInt(5, 20)}%`,
        mental_burnout: `อาการหมดไฟ ${randomInt(2, 8)}%`,
        mental_depression: `ภาวะซึมเศร้า ${randomInt(1, 5)}%`,
        engagement_score: `2567: ${randomInt(70, 85)}/100, 2566: ${randomInt(65, 80)}/100`,
        engagement_low_areas: 'การสื่อสารภายในองค์กร, การมองเห็นโอกาสในการพัฒนา',
        other_wellbeing_surveys: 'แบบสำรวจสุขภาพประจำปี, สำรวจความสุขในการทำงาน',
        training_hours: `2567: ${randomInt(30, 50)} ชม./คน/ปี, 2566: ${randomInt(25, 45)} ชม./คน/ปี`,
        intervention_feedback: `ต้องการเพิ่มฐานข้อมูล intervention packages และระบบติดตามผล`,
        hrd_plan_url: `https://drive.google.com/file/d/${randomInt(1000000000, 9999999999)}/view`,
        hrd_plan_results: `ดำเนินการได้ ${randomInt(70, 95)}% ตามแผนที่วางไว้`
    };
}

async function fillStep1(page, data) {
    console.log('  → Step 1: Organization Info');
    await page.waitForSelector('#organization', { timeout: 10000 });
    await page.selectOption('#organization', data.organization);
    await page.fill('#strategic_overview', data.strategic_overview);
    await page.fill('#org_structure', data.org_structure);
    await page.fill('#total_staff', data.total_staff.toString());
    await page.fill('#type_official', data.type_official.toString());
    await page.fill('#type_employee', data.type_employee.toString());
    await page.fill('#type_contract', data.type_contract.toString());
    await page.fill('#type_other', data.type_other.toString());
    await page.fill('#age_u30', data.age_u30.toString());
    await page.fill('#age_31_40', data.age_31_40.toString());
    await page.fill('#age_41_50', data.age_41_50.toString());
    await page.fill('#age_51_60', data.age_51_60.toString());
    await page.fill('#service_u1', data.service_u1.toString());
    await page.fill('#service_1_5', data.service_1_5.toString());
    await page.fill('#service_6_10', data.service_6_10.toString());
    await page.fill('#service_11_15', data.service_11_15.toString());
    await page.fill('#service_16_20', data.service_16_20.toString());
    await page.fill('#service_21_25', data.service_21_25.toString());
    await page.fill('#service_26_30', data.service_26_30.toString());
    await page.fill('#service_over30', data.service_over30.toString());
    console.log('  ✓ Step 1 completed');
}

async function fillStep2(page, data) {
    console.log('  → Step 2: Policy & Context');
    await page.fill('#related_policies', data.related_policies);
    await page.fill('#context_challenges', data.context_challenges);
    console.log('  ✓ Step 2 completed');
}

async function fillStep3(page, data) {
    console.log('  → Step 3: Health Data');
    await page.fill('#disease_diabetes', data.disease_diabetes.toString());
    await page.fill('#disease_hypertension', data.disease_hypertension.toString());
    await page.fill('#disease_cardiovascular', data.disease_cardiovascular.toString());
    await page.fill('#disease_kidney', data.disease_kidney.toString());
    await page.fill('#disease_liver', data.disease_liver.toString());
    await page.fill('#disease_cancer', data.disease_cancer.toString());
    await page.fill('#disease_obesity', data.disease_obesity.toString());
    await page.fill('#clinic_users_per_year', data.clinic_users_per_year.toString());
    await page.fill('#clinic_top_symptoms', data.clinic_top_symptoms);
    await page.fill('#clinic_top_medications', data.clinic_top_medications);
    await page.fill('#mental_stress', data.mental_stress);
    await page.fill('#mental_anxiety', data.mental_anxiety);
    await page.fill('#mental_sleep', data.mental_sleep);
    await page.fill('#mental_burnout', data.mental_burnout);
    await page.fill('#mental_depression', data.mental_depression);
    await page.fill('#engagement_score', data.engagement_score);
    await page.fill('#engagement_low_areas', data.engagement_low_areas);
    await page.fill('#other_wellbeing_surveys', data.other_wellbeing_surveys);
    console.log('  ✓ Step 3 completed');
}

async function fillStep4(page, data) {
    console.log('  → Step 4: Support Systems');
    await page.fill('#training_hours', data.training_hours);
    
    // Select support systems (random)
    const supportSystems = ['mentoring_system', 'job_rotation', 'idp_system', 'career_path_system'];
    for (const system of supportSystems) {
        const radios = await page.$$(`input[name="${system}"]`);
        if (radios.length > 0) {
            await radios[randomInt(0, radios.length - 1)].click();
        }
    }
    
    // Digital systems
    await page.check('input[value="e_doc"]').catch(() => {});
    await page.check('input[value="e_sign"]').catch(() => {});
    await page.check('input[value="cloud"]').catch(() => {});
    
    // Ergonomics
    await page.check('input[value="done"]').catch(() => {});
    await page.fill('#ergonomics_done_detail', 'ดำเนินการประเมินและปรับปรุงสภาพแวดล้อมแล้ว').catch(() => {});
    
    console.log('  ✓ Step 4 completed');
}

async function fillStep5(page, data) {
    console.log('  → Step 5: Ranking & Goals');
    // Select 3 ranking items
    const rankItems = await page.$$('.rank-item');
    for (let i = 0; i < Math.min(3, rankItems.length); i++) {
        await rankItems[i].click();
        await page.waitForTimeout(300);
    }
    console.log(`  ✓ Selected ${Math.min(3, rankItems.length)} priorities`);
    
    await page.fill('#intervention_packages_feedback', data.intervention_feedback);
    await page.fill('#hrd_plan_url', data.hrd_plan_url);
    await page.fill('#hrd_plan_results', data.hrd_plan_results);
    console.log('  ✓ Step 5 completed');
}

async function submitForm(page, data, results, index) {
    console.log('  → Submitting form...');
    
    // Click the submit button (which shows "ส่งข้อมูล ✓" on last step)
    await page.click('button:has-text("ส่งข้อมูล")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check result
    const successVisible = await page.isVisible('#overlay-success').catch(() => false);
    const errorVisible = await page.isVisible('#overlay-error').catch(() => false);
    
    if (successVisible) {
        const successRef = await page.textContent('#success-ref').catch(() => 'N/A');
        results.push({
            test: index + 1,
            organization: data.organization,
            email: data.email,
            status: 'SUCCESS',
            reference: successRef.replace('Ref: ', ''),
            timestamp: new Date().toISOString()
        });
        console.log(`  ✅ SUCCESS! Ref: ${successRef}`);
        return true;
    } else if (errorVisible) {
        const errorMsg = await page.textContent('#error-msg').catch(() => 'Unknown error');
        results.push({
            test: index + 1,
            organization: data.organization,
            email: data.email,
            status: 'ERROR',
            error: errorMsg,
            timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ERROR: ${errorMsg}`);
        await page.screenshot({ path: `form-${index + 1}-error.png` });
        return false;
    } else {
        results.push({
            test: index + 1,
            organization: data.organization,
            email: data.email,
            status: 'UNKNOWN',
            error: 'No overlay detected',
            timestamp: new Date().toISOString()
        });
        console.log('  ❓ Unknown status');
        await page.screenshot({ path: `form-${index + 1}-unknown.png` });
        return false;
    }
}

async function runFormTest() {
    console.log('🚀 Starting 10 Form Submissions...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });
    
    const results = [];
    
    for (let i = 0; i < 10; i++) {
        const data = generateTestData(i);
        console.log(`\n📋 Form ${i + 1}/10: ${data.organization}`);
        
        const page = await context.newPage();
        
        try {
            // Navigate to form
            await page.goto('https://nidawellbeing.vercel.app/ch1', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // Step 0: Email
            await page.fill('#respondent_email', data.email);
            await page.click('button:has-text("ยืนยันอีเมล")');
            console.log('  ✓ Email confirmed');
            await page.waitForTimeout(3000);
            
            // Fill all steps
            await fillStep1(page, data);
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(2000);
            
            await fillStep2(page, data);
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(2000);
            
            await fillStep3(page, data);
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(2000);
            
            await fillStep4(page, data);
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(2000);
            
            await fillStep5(page, data);
            
            // Submit directly (Step 5 is the last step - clicking next triggers submit)
            const success = await submitForm(page, data, results, i);
            
            // Wait before next form
            await page.waitForTimeout(3000);
            
        } catch (error) {
            console.error(`  💥 CRASH: ${error.message}`);
            await page.screenshot({ path: `form-${i + 1}-crash.png` });
            results.push({
                test: i + 1,
                organization: data.organization,
                email: data.email,
                status: 'CRASH',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    // Save results
    fs.writeFileSync('form-submission-results.json', JSON.stringify(results, null, 2));
    
    // Summary
    const success = results.filter(r => r.status === 'SUCCESS').length;
    const error = results.filter(r => r.status === 'ERROR').length;
    const crash = results.filter(r => r.status === 'CRASH').length;
    const unknown = results.filter(r => r.status === 'UNKNOWN').length;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 SUBMISSION RESULTS');
    console.log('='.repeat(50));
    console.log(`Total:    ${results.length}`);
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Error:   ${error}`);
    console.log(`💥 Crash:   ${crash}`);
    console.log(`❓ Unknown: ${unknown}`);
    console.log('='.repeat(50));
    
    if (success > 0) {
        console.log('\n✅ Successful Submissions:');
        results.filter(r => r.status === 'SUCCESS').forEach(r => {
            console.log(`  ${r.test}. ${r.organization} - ${r.reference}`);
        });
    }
    
    console.log(`\n📄 Results saved to form-submission-results.json`);
    
    if (success === 10) {
        console.log('\n🎉🎉🎉 ALL 10 FORMS SUBMITTED SUCCESSFULLY! 🎉🎉🎉');
    }
}

runFormTest().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
