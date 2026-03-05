const { chromium } = require('playwright');
const fs = require('fs');

// Test data for 10 different organizations
const testData = [
    {
        email: 'test1@health.go.th',
        organization: 'กรมอนามัย',
        strategic_overview: 'มุ่งเน้นการพัฒนาระบบสาธารณสุขให้ครอบคลุมทั่วถึง',
        org_structure: 'โครงสร้างแบ่งตามภูมิภาค มีสำนักงานสาธารณสุขจังหวัด 77 แห่ง',
        total_staff: 5000,
        type_official: 3500,
        type_employee: 1200,
        type_contract: 250,
        type_other: 50,
        age_u30: 800,
        age_31_40: 1500,
        age_41_50: 1800,
        age_51_60: 900,
        service_u1: 300,
        service_1_5: 800,
        service_6_10: 1200,
        service_11_15: 1000,
        service_16_20: 900,
        service_21_25: 500,
        service_26_30: 200,
        service_over30: 100,
        intervention_feedback: 'ควรมีฐานข้อมูลที่อัปเดตประจำปีและระบบติดตามผลลัพธ์',
        hrd_plan_url: 'https://drive.google.com/example-hrd-plan',
        hrd_results: 'ปี 2567 ดำเนินการได้ 85% ตามแผนที่วางไว้'
    },
    {
        email: 'test2@disease.go.th',
        organization: 'กรมควบคุมโรค',
        strategic_overview: 'เสริมสร้างความสามารถในการควบคุมโรคติดต่อและโรคไม่ติดต่อ',
        org_structure: 'ศูนย์ควบคุมโรค 13 แห่ง สำนักงานสาธารณสุขจังหวัด',
        total_staff: 3500,
        type_official: 2800,
        type_employee: 500,
        type_contract: 150,
        type_other: 50,
        age_u30: 600,
        age_31_40: 1200,
        age_41_50: 1100,
        age_51_60: 600,
        service_u1: 250,
        service_1_5: 600,
        service_6_10: 800,
        service_11_15: 700,
        service_16_20: 600,
        service_21_25: 350,
        service_26_30: 150,
        service_over30: 50,
        intervention_feedback: 'ต้องการข้อมูลที่เป็นรูปธรรมและสามารถนำไปใช้ได้จริง',
        hrd_plan_url: 'https://drive.google.com/disease-control-hrd',
        hrd_results: 'บรรลุเป้าหมาย 90% สามารถลดอัตราการติดเชื้อได้'
    },
    {
        email: 'test3@medical.go.th',
        organization: 'กรมการแพทย์',
        strategic_overview: 'ยกระดับคุณภาพการแพทย์และบริการสุขภาพประชาชน',
        org_structure: 'โรงพยาบาลรัฐบาล 88 แห่ง ศูนย์การแพทย์ชุมชน',
        total_staff: 15000,
        type_official: 12000,
        type_employee: 2500,
        type_contract: 400,
        type_other: 100,
        age_u30: 2500,
        age_31_40: 4500,
        age_41_50: 5000,
        age_51_60: 3000,
        service_u1: 800,
        service_1_5: 2000,
        service_6_10: 3000,
        service_11_15: 3500,
        service_16_20: 3000,
        service_21_25: 2000,
        service_26_30: 600,
        service_over30: 100,
        intervention_feedback: 'ต้องการเครื่องมือที่ช่วยในการวิเคราะห์และวางแผน',
        hrd_plan_url: 'https://drive.google.com/medical-department-hrd',
        hrd_results: 'พัฒนาบุคลากรแพทย์ได้ 2000 คนต่อปี'
    },
    {
        email: 'test4@mental.go.th',
        organization: 'กรมสุขภาพจิต',
        strategic_overview: 'ส่งเสริมสุขภาพจิตและภูมิคุ้มกันผู้มีปัญหาสุขภาพจิต',
        org_structure: 'สถาบันสุขภาพจิตเด็กและวัยรุ่น ศูนย์สุขภาพจิตทั่วประเทศ',
        total_staff: 2500,
        type_official: 2000,
        type_employee: 400,
        type_contract: 80,
        type_other: 20,
        age_u30: 500,
        age_31_40: 800,
        age_41_50: 700,
        age_51_60: 500,
        service_u1: 200,
        service_1_5: 500,
        service_6_10: 600,
        service_11_15: 500,
        service_16_20: 400,
        service_21_25: 200,
        service_26_30: 80,
        service_over30: 20,
        intervention_feedback: 'ต้องการเทคนิคการให้คำปรึกษาและบำบัด',
        hrd_plan_url: 'https://drive.google.com/mental-health-hrd',
        hrd_results: 'จัดตั้งศูนย์ให้บริการเพิ่ม 10 แห่ง'
    },
    {
        email: 'test5@science.go.th',
        organization: 'กรมวิทยาศาสตร์การแพทย์',
        strategic_overview: 'พัฒนาวิทยาศาสตร์การแพทย์เพื่อการวินิจฉัยและรักษา',
        org_structure: 'ศูนย์วิจัยทางการแพทย์ ห้องปฏิบัติการทางวิทยาศาสตร์',
        total_staff: 1800,
        type_official: 1500,
        type_employee: 250,
        type_contract: 40,
        type_other: 10,
        age_u30: 400,
        age_31_40: 600,
        age_41_50: 500,
        age_51_60: 300,
        service_u1: 150,
        service_1_5: 400,
        service_6_10: 500,
        service_11_15: 400,
        service_16_20: 250,
        service_21_25: 80,
        service_26_30: 20,
        service_over30: 0,
        intervention_feedback: 'ต้องการอุปกรณ์และเทคโนโลยีที่ทันสมัย',
        hrd_plan_url: 'https://drive.google.com/medical-science-hrd',
        hrd_results: 'วิจัยผ่านการรับรอง 50 โครงการ'
    },
    {
        email: 'test6@fda.go.th',
        organization: 'สำนักงานคณะกรรมการอาหารและยา',
        strategic_overview: 'คุ้มครองความปลอดภัยของอาหารและยาในประเทศ',
        org_structure: 'สำนักงานใหญ่ 5 สำนัก ศูนย์ตรวจสอบทั่วประเทศ',
        total_staff: 1200,
        type_official: 1000,
        type_employee: 180,
        type_contract: 15,
        type_other: 5,
        age_u30: 300,
        age_31_40: 400,
        age_41_50: 350,
        age_51_60: 150,
        service_u1: 100,
        service_1_5: 300,
        service_6_10: 350,
        service_11_15: 250,
        service_16_20: 150,
        service_21_25: 40,
        service_26_30: 10,
        service_over30: 0,
        intervention_feedback: 'ต้องการระบบติดตามผลิตภัณฑ์ที่มีประสิทธิภาพ',
        hrd_plan_url: 'https://drive.google.com/fda-hrd-plan',
        hrd_results: 'ตรวจสอบผลิตภัณฑ์ได้ครอบคลุม 95%'
    },
    {
        email: 'test7@support.go.th',
        organization: 'กรมสนับสนุนบริการสุขภาพ',
        strategic_overview: 'ส่งเสริมและสนับสนุนระบบบริการสุขภาพอย่างยั่งยืน',
        org_structure: 'สำนักงานสนับสนุนทุกระดับ ศูนย์บริการสุขภาพชุมชน',
        total_staff: 800,
        type_official: 600,
        type_employee: 180,
        type_contract: 15,
        type_other: 5,
        age_u30: 200,
        age_31_40: 250,
        age_41_50: 200,
        age_51_60: 150,
        service_u1: 80,
        service_1_5: 200,
        service_6_10: 200,
        service_11_15: 150,
        service_16_20: 120,
        service_21_25: 40,
        service_26_30: 10,
        service_over30: 0,
        intervention_feedback: 'ต้องการข้อมูลที่สามารถนำไปวางแผนงบประมาณได้',
        hrd_plan_url: 'https://drive.google.com/health-support-hrd',
        hrd_results: 'พัฒนาศูนย์บริการเพิ่ม 20 แห่ง'
    },
    {
        email: 'test8@thaimed.go.th',
        organization: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
        strategic_overview: 'อนุรักษ์และพัฒนาการแพทย์แผนไทยให้เป็นที่ยอมรับ',
        org_structure: 'สถาบันการแพทย์แผนไทย ศูนย์การแพทย์แผนไทยทั่วประเทศ',
        total_staff: 600,
        type_official: 500,
        type_employee: 80,
        type_contract: 15,
        type_other: 5,
        age_u30: 150,
        age_31_40: 200,
        age_41_50: 150,
        age_51_60: 100,
        service_u1: 60,
        service_1_5: 150,
        service_6_10: 150,
        service_11_15: 100,
        service_16_20: 80,
        service_21_25: 40,
        service_26_30: 20,
        service_over30: 0,
        intervention_feedback: 'ต้องการฐานข้อมูลสมุนไพรและการวิจัยทางการแพทย์แผนไทย',
        hrd_plan_url: 'https://drive.google.com/thai-medicine-hrd',
        hrd_results: 'จดทะเบียนยาสมุนไพรเพิ่ม 100 รายการ'
    },
    {
        email: 'test9@nerc.go.th',
        organization: 'สถาบันการแพทย์ฉุกเฉินแห่งชาติ',
        strategic_overview: 'พัฒนาระบบการแพทย์ฉุกเฉินให้มีประสิทธิภาพและครอบคลุม',
        org_structure: 'ศูนย์ ER ทั่วประเทศ หน่วยแพทย์ฉุกเฉิน',
        total_staff: 3000,
        type_official: 2500,
        type_employee: 400,
        type_contract: 80,
        type_other: 20,
        age_u30: 800,
        age_31_40: 1000,
        age_41_50: 800,
        age_51_60: 400,
        service_u1: 300,
        service_1_5: 700,
        service_6_10: 800,
        service_11_15: 600,
        service_16_20: 400,
        service_21_25: 150,
        service_26_30: 40,
        service_over30: 10,
        intervention_feedback: 'ต้องการโปรโตคอลการจัดการผู้ป่วยฉุกเฉิน',
        hrd_plan_url: 'https://drive.google.com/emergency-institute-hrd',
        hrd_results: 'ลดเวลารอการรักษาได้ 30%'
    },
    {
        email: 'test10@nhso.go.th',
        organization: 'สำนักงานหลักประกันสุขภาพแห่งชาติ',
        strategic_overview: 'ขยายความคุ้มครองสุขภาพให้ครอบคลุมทุกกลุ่มประชาชน',
        org_structure: 'สำนักงานใหญ่ 13 สำนัก สาขาหลักประกันสุขภาพจังหวัด',
        total_staff: 4500,
        type_official: 4000,
        type_employee: 400,
        type_contract: 80,
        type_other: 20,
        age_u30: 1000,
        age_31_40: 1500,
        age_41_50: 1200,
        age_51_60: 800,
        service_u1: 400,
        service_1_5: 1000,
        service_6_10: 1200,
        service_11_15: 1000,
        service_16_20: 600,
        service_21_25: 200,
        service_26_30: 80,
        service_over30: 20,
        intervention_feedback: 'ต้องการระบบวิเคราะห์ข้อมูลขนาดใหญ่และ dashboard',
        hrd_plan_url: 'https://drive.google.com/nhso-hrd-plan',
        hrd_results: 'ครอบคลุมประชาชน 99.8% แล้ว'
    }
];

async function runFormTest() {
    console.log('🚀 Starting Playwright form test...');
    
    const browser = await chromium.launch({ 
        headless: false, // Show browser for debugging
        slowMo: 50 // Slow down for better visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const results = [];
    
    for (let i = 0; i < testData.length; i++) {
        const data = testData[i];
        console.log(`\n📝 Test ${i + 1}/10: ${data.organization}`);
        
        const page = await context.newPage();
        
        try {
            // Navigate to form
            await page.goto('https://nidawellbeing.vercel.app/ch1', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // Step 0: Landing page - enter email
            await page.fill('#respondent_email', data.email);
            await page.click('button:has-text("ยืนยันอีเมล")');
            await page.waitForTimeout(3000);
            
            // Step 1: Organization info
            await page.waitForSelector('#organization', { timeout: 10000 });
            await page.selectOption('#organization', data.organization);
            await page.fill('#strategic_overview', data.strategic_overview);
            await page.fill('#org_structure', data.org_structure);
            await page.fill('#total_staff', data.total_staff.toString());
            
            // Staff type distribution
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
            
            // Click next
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // Step 2: Health data - fill visible fields
            try {
                await page.fill('#clinic_top_symptoms', 'ปวดหัว, ปวดกล้ามเนื้อ, ความดันสูง', { timeout: 5000 });
                await page.fill('#clinic_top_medications', 'พาราเซตามอล, ยาลดความดัน', { timeout: 5000 });
                await page.fill('#mental_stress', 'พบผู้มีความเครียดสูง 5%', { timeout: 5000 });
                await page.fill('#mental_anxiety', 'พบภาวะวิตกกังวล 3%', { timeout: 5000 });
                await page.fill('#mental_sleep', 'มีปัญหาการนอนหลับ 8%', { timeout: 5000 });
                await page.fill('#mental_burnout', 'อาการหมดไฟ 2%', { timeout: 5000 });
                await page.fill('#mental_depression', 'ภาวะซึมเศร้า 1%', { timeout: 5000 });
                await page.fill('#engagement_score', '2567: 75/100, 2566: 72/100', { timeout: 5000 });
                await page.fill('#engagement_low_areas', 'การสื่อสารและการมองโอกาส', { timeout: 5000 });
                await page.fill('#other_wellbeing_surveys', 'ทำแบบสำรวจความสุขภาพประจำปี', { timeout: 5000 });
            } catch (e) {
                console.log('⚠️ Some health fields not found, continuing...');
            }
            
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // Step 3: Support systems
            try {
                await page.fill('#training_hours', '2568: 40 ชม., 2567: 35 ชม.', { timeout: 5000 });
                
                // Digital systems
                await page.check('input[value="e_doc"]').catch(() => {});
                await page.check('input[value="e_sign"]').catch(() => {});
                await page.check('input[value="cloud"]').catch(() => {});
                await page.check('input[value="hr_digital"]').catch(() => {});
                
                // Ergonomics
                await page.check('input[value="done"]').catch(() => {});
                await page.fill('#ergonomics_done_detail', 'ดำเนินการแล้วทุกแผนก มีรายงานผล').catch(() => {});
            } catch (e) {
                console.log('⚠️ Some support system fields not found, continuing...');
            }
            
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // Step 4: Direction and goals
            try {
                // Select ranking items
                const rankItems = await page.$$('.rank-item');
                for (let j = 0; j < Math.min(3, rankItems.length); j++) {
                    await rankItems[j].click();
                    await page.waitForTimeout(500);
                }
                
                await page.fill('#intervention_packages_feedback', data.intervention_feedback, { timeout: 5000 });
                await page.fill('#hrd_plan_url', data.hrd_plan_url, { timeout: 5000 });
                await page.fill('#hrd_plan_results', data.hrd_results, { timeout: 5000 });
            } catch (e) {
                console.log('⚠️ Some ranking fields not found, continuing...');
            }
            
            await page.click('button:has-text("ถัดไป")');
            await page.waitForTimeout(3000);
            
            // Step 5: Submit
            await page.click('button:has-text("ส่งข้อมูล")');
            await page.waitForTimeout(5000);
            
            // Check result
            const successVisible = await page.isVisible('#overlay-success', { timeout: 1000 });
            const errorVisible = await page.isVisible('#overlay-error', { timeout: 1000 });
            
            if (successVisible) {
                const successRef = await page.textContent('#success-ref');
                results.push({
                    test: i + 1,
                    organization: data.organization,
                    email: data.email,
                    status: 'SUCCESS',
                    reference: successRef,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ Test ${i + 1} completed successfully - Ref: ${successRef}`);
            } else if (errorVisible) {
                const errorMsg = await page.textContent('#error-msg');
                results.push({
                    test: i + 1,
                    organization: data.organization,
                    email: data.email,
                    status: 'ERROR',
                    error: errorMsg,
                    timestamp: new Date().toISOString()
                });
                console.log(`⚠️ Test ${i + 1} completed with error: ${errorMsg}`);
            } else {
                // Check if we're still on the form (validation error)
                const stillOnForm = await page.isVisible('#organization');
                if (stillOnForm) {
                    results.push({
                        test: i + 1,
                        organization: data.organization,
                        email: data.email,
                        status: 'VALIDATION_ERROR',
                        error: 'Form validation failed - still on form page',
                        timestamp: new Date().toISOString()
                    });
                    console.log(`❌ Test ${i + 1} failed - validation error`);
                } else {
                    results.push({
                        test: i + 1,
                        organization: data.organization,
                        email: data.email,
                        status: 'UNKNOWN',
                        error: 'Unknown state after submit',
                        timestamp: new Date().toISOString()
                    });
                    console.log(`❓ Test ${i + 1} completed with unknown status`);
                }
            }
            
            // Wait before next test
            await page.waitForTimeout(3000);
            
        } catch (error) {
            console.error(`❌ Test ${i + 1} failed:`, error.message);
            
            // Take screenshot on failure
            const screenshotPath = `test-${i + 1}-failure.png`;
            await page.screenshot({ path: screenshotPath });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            
            results.push({
                test: i + 1,
                organization: data.organization,
                email: data.email,
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    // Save results
    const resultsPath = 'test-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`Total: ${results.length}`);
    console.log(`Success: ${results.filter(r => r.status === 'SUCCESS').length}`);
    console.log(`Error: ${results.filter(r => r.status === 'ERROR').length}`);
    console.log(`Validation Error: ${results.filter(r => r.status === 'VALIDATION_ERROR').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'FAILED').length}`);
    console.log(`Unknown: ${results.filter(r => r.status === 'UNKNOWN').length}`);
    console.log(`\n📄 Results saved to: ${resultsPath}`);
}

// Run the test
runFormTest().catch(console.error);
