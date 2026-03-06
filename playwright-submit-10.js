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

function randomText(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzกขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateTestData(index) {
    const org = organizations[index % organizations.length];
    const totalStaff = randomInt(500, 5000);
    const ageU30 = Math.floor(totalStaff * 0.25);
    const age31_40 = Math.floor(totalStaff * 0.30);
    const age41_50 = Math.floor(totalStaff * 0.25);
    const age51_60 = totalStaff - ageU30 - age31_40 - age41_50;
    
    const serviceU1 = Math.floor(totalStaff * 0.10);
    const service1_5 = Math.floor(totalStaff * 0.20);
    const service6_10 = Math.floor(totalStaff * 0.25);
    const service11_15 = Math.floor(totalStaff * 0.20);
    const service16_20 = Math.floor(totalStaff * 0.15);
    const service21_25 = Math.floor(totalStaff * 0.07);
    const service26_30 = Math.floor(totalStaff * 0.02);
    const serviceOver30 = totalStaff - serviceU1 - service1_5 - service6_10 - service11_15 - service16_20 - service21_25 - service26_30;
    
    const typeOfficial = Math.floor(totalStaff * 0.70);
    const typeEmployee = Math.floor(totalStaff * 0.20);
    const typeContract = Math.floor(totalStaff * 0.08);
    const typeOther = totalStaff - typeOfficial - typeEmployee - typeContract;
    
    return {
        email: `test${index + 1}_${Date.now()}@health.go.th`,
        organization: org,
        strategic_overview: `แผนยุทธศาสตร์ ${org} ปี ${randomInt(2565, 2568)} มุ่งเน้นการพัฒนาศักยภาพบุคลากรและการให้บริการที่มีคุณภาพ`,
        org_structure: `โครงสร้างองค์กร ${org} แบ่งเป็น ${randomInt(5, 15)} ส่วน/กลุ่ม/งาน`,
        total_staff: totalStaff,
        type_official: typeOfficial,
        type_employee: typeEmployee,
        type_contract: typeContract,
        type_other: typeOther,
        age_u30: ageU30,
        age_31_40: age31_40,
        age_41_50: age41_50,
        age_51_60: age51_60,
        service_u1: serviceU1,
        service_1_5: service1_5,
        service_6_10: service6_10,
        service_11_15: service11_15,
        service_16_20: service16_20,
        service_21_25: service21_25,
        service_26_30: service26_30,
        service_over30: Math.max(0, serviceOver30),
        related_policies: `นโยบายที่เกี่ยวข้อง: ${randomText(20)} สอดคล้องกับแผนพัฒนาบุคลากร`,
        context_challenges: `ความท้าทาย: ${randomText(20)} ต้องการการพัฒนาทักษะใหม่`,
        disease_diabetes: randomInt(50, 200),
        disease_hypertension: randomInt(100, 400),
        disease_cardiovascular: randomInt(30, 150),
        disease_kidney: randomInt(10, 50),
        disease_liver: randomInt(20, 80),
        disease_cancer: randomInt(5, 30),
        disease_obesity: randomInt(50, 300),
        clinic_users_per_year: randomInt(1000, 5000),
        clinic_top_symptoms: 'ปวดหัว, ปวดกล้ามเนื้อ, ความดันโลหิตสูง, ไข้หวัด, ภูมิแพ้',
        clinic_top_medications: 'พาราเซตามอล, ยาลดความดัน, ยาบำรุงเลือด, ยาปฏิชีวนะ',
        mental_stress: `พบผู้มีความเครียดสูง ${randomInt(3, 15)}% ของบุคลากร`,
        mental_anxiety: `พบภาวะวิตกกังวล ${randomInt(2, 10)}%`,
        mental_sleep: `มีปัญหาการนอนหลับ ${randomInt(5, 20)}%`,
        mental_burnout: `อาการหมดไฟ ${randomInt(2, 8)}%`,
        mental_depression: `ภาวะซึมเศร้า ${randomInt(1, 5)}%`,
        engagement_score: `25${randomInt(65, 68)}: ${randomInt(70, 85)}/100`,
        engagement_low_areas: 'การสื่อสารภายในองค์กร, การมองเห็นโอกาสในการพัฒนา',
        other_wellbeing_surveys: 'แบบสำรวจสุขภาพประจำปี สำรวจความสุขในการทำงาน',
        training_hours: `25${randomInt(65, 68)}: ${randomInt(30, 50)} ชม./คน/ปี`,
        intervention_feedback: `ต้องการเพิ่ม${randomText(15)} และพัฒนา${randomText(15)} เพื่อสนับสนุนการทำงาน`,
        hrd_plan_url: `https://drive.google.com/${randomText(10)}-hrd-plan`,
        hrd_plan_results: `ดำเนินการได้ ${randomInt(70, 95)}% ตามแผนที่วางไว้ ปี ${randomInt(2566, 2568)}`
    };
}

async function runFormTest() {
    console.log('🚀 Starting comprehensive Playwright form test...');
    console.log('⏱️  This will take approximately 5-10 minutes...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 80
    });
    
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 }
    });
    
    const results = [];
    
    for (let i = 0; i < 10; i++) {
        const data = generateTestData(i);
        console.log(`\n📝 Form ${i + 1}/10: ${data.organization}`);
        
        const page = await context.newPage();
        
        try {
            // Navigate to form
            await page.goto('https://nidawellbeing.vercel.app/ch1', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // ===== STEP 0: Email =====
            await page.fill('#respondent_email', data.email);
            await page.click('button:has-text("ยืนยันอีเมล")');
            console.log('  ✓ Email submitted');
            await page.waitForTimeout(3000);
            
            // ===== STEP 1: Organization Info =====
            console.log('  → Filling Step 1 (Organization)...');
            
            await page.waitForSelector('#organization', { timeout: 10000 });
            await page.selectOption('#organization', data.organization);
            await page.fill('#strategic_overview', data.strategic_overview);
            await page.fill('#org_structure', data.org_structure);
            await page.fill('#total_staff', data.total_staff.toString());
            
            // Staff types
            await page.fill('#type_official', data.type_official.toString());
            await page.fill('#type_employee', data.type_employee.toString());
            await page.fill('#type_contract', data.type_contract.toString());
            await page.fill('#type_other', data.type_other.toString());
            
            // Age distribution
            await page.fill('#age_u30', data.age_u30.toString());
            await page.fill('#age_31_40', data.age_31_40.toString());
            await page.fill('#age_41_50', data.age_41_50.toString());
            await page.fill('#age_51_60', data.age_51_60.toString());
            
            // Service years
            await page.fill('#service_u1', data.service_u1.toString());
            await page.fill('#service_1_5', data.service_1_5.toString());
            await page.fill('#service_6_10', data.service_6_10.toString());
            await page.fill('#service_11_15', data.service_11_15.toString());
            await page.fill('#service_16_20', data.service_16_20.toString());
            await page.fill('#service_21_25', data.service_21_25.toString());
            await page.fill('#service_26_30', data.service_26_30.toString());
            await page.fill('#service_over30', data.service_over30.toString());
            
            console.log('  ✓ Step 1 completed');
            
            // Next
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // ===== STEP 2: Policy & Context =====
            console.log('  → Filling Step 2 (Policy)...');
            
            await page.fill('#related_policies', data.related_policies);
            await page.fill('#context_challenges', data.context_challenges);
            
            console.log('  ✓ Step 2 completed');
            
            // Next
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // ===== STEP 3: Health Data =====
            console.log('  → Filling Step 3 (Health)...');
            
            // Disease counts
            await page.fill('#disease_diabetes', data.disease_diabetes.toString());
            await page.fill('#disease_hypertension', data.disease_hypertension.toString());
            await page.fill('#disease_cardiovascular', data.disease_cardiovascular.toString());
            await page.fill('#disease_kidney', data.disease_kidney.toString());
            await page.fill('#disease_liver', data.disease_liver.toString());
            await page.fill('#disease_cancer', data.disease_cancer.toString());
            await page.fill('#disease_obesity', data.disease_obesity.toString());
            
            // Clinic data
            await page.fill('#clinic_users_per_year', data.clinic_users_per_year.toString());
            await page.fill('#clinic_top_symptoms', data.clinic_top_symptoms);
            await page.fill('#clinic_top_medications', data.clinic_top_medications);
            
            // Mental health
            await page.fill('#mental_stress', data.mental_stress);
            await page.fill('#mental_anxiety', data.mental_anxiety);
            await page.fill('#mental_sleep', data.mental_sleep);
            await page.fill('#mental_burnout', data.mental_burnout);
            await page.fill('#mental_depression', data.mental_depression);
            
            // Engagement
            await page.fill('#engagement_score', data.engagement_score);
            await page.fill('#engagement_low_areas', data.engagement_low_areas);
            await page.fill('#other_wellbeing_surveys', data.other_wellbeing_surveys);
            
            console.log('  ✓ Step 3 completed');
            
            // Next
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // ===== STEP 4: Support Systems =====
            console.log('  → Filling Step 4 (Support Systems)...');
            
            // Select support systems (random radio buttons)
            const supportSystems = ['mentoring_system', 'job_rotation', 'idp_system', 'career_path_system'];
            for (const system of supportSystems) {
                const options = await page.$$(`input[name="${system}"]`);
                if (options.length > 0) {
                    const randomOption = options[randomInt(0, options.length - 1)];
                    await randomOption.click();
                }
            }
            
            await page.fill('#training_hours', data.training_hours);
            
            // Digital systems - check random boxes
            const digitalOptions = ['e_doc', 'e_sign', 'cloud', 'hr_digital', 'other_digital'];
            const numDigital = randomInt(2, 4);
            for (let d = 0; d < numDigital; d++) {
                const option = digitalOptions[randomInt(0, digitalOptions.length - 1)];
                await page.check(`input[value="${option}"]`).catch(() => {});
            }
            
            // Ergonomics
            await page.check('input[value="done"]').catch(() => {});
            await page.fill('#ergonomics_done_detail', 'ดำเนินการประเมินและปรับปรุงสภาพแวดล้อมการทำงานแล้ว').catch(() => {});
            
            console.log('  ✓ Step 4 completed');
            
            // Next
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // ===== STEP 5: Ranking & Goals =====
            console.log('  → Filling Step 5 (Ranking & Goals)...');
            
            // Select 3 random rank items
            const rankItems = await page.$$('.rank-item');
            const numRanks = Math.min(3, rankItems.length);
            for (let r = 0; r < numRanks; r++) {
                await rankItems[r].click();
                await page.waitForTimeout(300);
            }
            console.log(`  ✓ Selected ${numRanks} priority items`);
            
            await page.fill('#intervention_packages_feedback', data.intervention_feedback);
            await page.fill('#hrd_plan_url', data.hrd_plan_url);
            await page.fill('#hrd_plan_results', data.hrd_plan_results);
            
            console.log('  ✓ Step 5 completed');
            
            // Next to final step
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // ===== STEP 6: Review & Submit =====
            console.log('  → Submitting form...');
            
            await page.click('button:has-text("ส่งข้อมูล")');
            await page.waitForTimeout(5000);
            
            // Check for success
            const successVisible = await page.isVisible('#overlay-success').catch(() => false);
            const errorVisible = await page.isVisible('#overlay-error').catch(() => false);
            
            if (successVisible) {
                const successRef = await page.textContent('#success-ref').catch(() => 'N/A');
                results.push({
                    test: i + 1,
                    organization: data.organization,
                    email: data.email,
                    status: 'SUCCESS',
                    reference: successRef.replace('Ref: ', ''),
                    timestamp: new Date().toISOString()
                });
                console.log(`  ✅ SUCCESS! Reference: ${successRef}`);
            } else if (errorVisible) {
                const errorMsg = await page.textContent('#error-msg').catch(() => 'Unknown error');
                results.push({
                    test: i + 1,
                    organization: data.organization,
                    email: data.email,
                    status: 'ERROR',
                    error: errorMsg,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ERROR: ${errorMsg}`);
                
                // Screenshot on error
                await page.screenshot({ path: `form-${i + 1}-error.png` });
            } else {
                results.push({
                    test: i + 1,
                    organization: data.organization,
                    email: data.email,
                    status: 'UNKNOWN',
                    error: 'No success/error overlay detected',
                    timestamp: new Date().toISOString()
                });
                console.log('  ❓ Unknown status');
                await page.screenshot({ path: `form-${i + 1}-unknown.png` });
            }
            
            // Wait before next form
            await page.waitForTimeout(3000);
            
        } catch (error) {
            console.error(`  💥 FAILED: ${error.message}`);
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
    const resultsPath = 'form-submission-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 SUBMISSION RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Forms:     ${results.length}`);
    console.log(`✅ Success:       ${results.filter(r => r.status === 'SUCCESS').length}`);
    console.log(`❌ Error:          ${results.filter(r => r.status === 'ERROR').length}`);
    console.log(`💥 Crash:          ${results.filter(r => r.status === 'CRASH').length}`);
    console.log(`❓ Unknown:        ${results.filter(r => r.status === 'UNKNOWN').length}`);
    console.log('='.repeat(50));
    
    // Show success references
    const successResults = results.filter(r => r.status === 'SUCCESS');
    if (successResults.length > 0) {
        console.log('\n✅ Successful Submissions:');
        successResults.forEach(r => {
            console.log(`  ${r.test}. ${r.organization} - Ref: ${r.reference}`);
        });
    }
    
    console.log(`\n📄 Results saved to: ${resultsPath}`);
    
    if (successResults.length === 10) {
        console.log('\n🎉🎉🎉 ALL 10 FORMS SUBMITTED SUCCESSFULLY! 🎉🎉🎉');
    }
}

// Run the test
runFormTest().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
