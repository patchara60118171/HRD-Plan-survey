// =============================================
// Playwright CH1 Complete Form Test
// กรอกฟอร์ม 10 รอบ พร้อมอัพโหลด PDF
// =============================================

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test data for 10 different organizations
const testOrganizations = [
    { name: 'กรมพัฒนาทรัพยากรมนุษย์', email: 'test1@health.go.th', staff: 150 },
    { name: 'สำนักงานคณะกรรมการพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', email: 'test2@health.go.th', staff: 250 },
    { name: 'กรมควบคุมโรค', email: 'test3@health.go.th', staff: 180 },
    { name: 'กรมอนามัย', email: 'test4@health.go.th', staff: 220 },
    { name: 'สำนักงานปลัดกระทรวงสาธารณสุข', email: 'test5@health.go.th', staff: 300 },
    { name: 'กรมการแพทย์', email: 'test6@health.go.th', staff: 200 },
    { name: 'กรมสนับสนุนบริการสุขภาพ', email: 'test7@health.go.th', staff: 190 },
    { name: 'สำนักงานหลักประกันสุขภาพแห่งชาติ', email: 'test8@health.go.th', staff: 280 },
    { name: 'กรมวิทยาศาสตร์การแพทย์', email: 'test9@health.go.th', staff: 160 },
    { name: 'สถาบันวิจัยระบบสาธารณสุข', email: 'test10@health.go.th', staff: 170 }
];

// Generate test PDFs first
function generateTestPDFs() {
    const pdfDir = path.join(__dirname, 'test-pdfs');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 50 800 Td (Test Document) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
0000000189 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
285
%%EOF`;

    const files = ['test-strategy.pdf', 'test-org.pdf', 'test-hrd.pdf'];
    files.forEach(file => {
        fs.writeFileSync(path.join(pdfDir, file), pdfContent);
    });

    console.log('✓ Test PDF files generated');
    return {
        strategy: path.join(pdfDir, 'test-strategy.pdf'),
        org: path.join(pdfDir, 'test-org.pdf'),
        hrd: path.join(pdfDir, 'test-hrd.pdf')
    };
}

async function fillForm(page, orgData, pdfPaths, round) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 Round ${round}/10: ${orgData.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
        // Go to form
        await page.goto('https://nidawellbeing.vercel.app/ch1', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Step 0: Enter email
        console.log('📧 Step 0: Entering email...');
        await page.fill('#respondent_email', orgData.email);
        await page.click('button:has-text("เริ่มกรอกแบบสอบถาม")');
        await page.waitForTimeout(2000);

        // Step 1: Basic Information
        console.log('📝 Step 1: Basic Information...');
        await page.fill('#organization', orgData.name);
        await page.fill('#strategic_overview', 'ยุทธศาสตร์การพัฒนาบุคลากรเพื่อความเป็นเลิศในการให้บริการสาธารณสุข มุ่งเน้นการพัฒนาทักษะและสมรรถนะของบุคลากร');
        await page.fill('#org_structure', 'โครงสร้างองค์กรแบ่งออกเป็น 5 กอง 15 ส่วน มีการบริหารจัดการแบบบูรณาการ');
        
        // Upload Strategy PDF
        const strategyInput = await page.$('#file-strategy');
        await strategyInput.setInputFiles(pdfPaths.strategy);
        await page.waitForTimeout(1500);
        
        await page.fill('#total_staff', orgData.staff.toString());
        
        // Age distribution
        await page.fill('#age_u30', '30');
        await page.fill('#age_31_40', '50');
        await page.fill('#age_41_50', '40');
        await page.fill('#age_51_60', '30');
        
        // Service years
        await page.fill('#service_u1', '10');
        await page.fill('#service_1_5', '20');
        await page.fill('#service_6_10', '25');
        await page.fill('#service_11_15', '30');
        await page.fill('#service_16_20', '25');
        await page.fill('#service_21_25', '20');
        await page.fill('#service_26_30', '15');
        await page.fill('#service_over30', '5');
        
        // Position types
        await page.fill('#pos_o1', '5');
        await page.fill('#pos_o2', '10');
        await page.fill('#pos_o3', '15');
        await page.fill('#pos_o4', '20');
        await page.fill('#pos_k1', '25');
        await page.fill('#pos_k2', '20');
        await page.fill('#pos_k3', '15');
        
        // Staff types
        await page.fill('#type_official', '80');
        await page.fill('#type_employee', '40');
        await page.fill('#type_contract', '20');
        await page.fill('#type_other', '10');
        
        // Upload Org Structure PDF
        const orgInput = await page.$('#file-org');
        if (orgInput) {
            await orgInput.setInputFiles(pdfPaths.org);
            await page.waitForTimeout(1500);
        }
        
        console.log('✓ Step 1 completed');
        await page.click('button:has-text("ถัดไป")');
        await page.waitForTimeout(2000);

        // Step 2: Policies
        console.log('📝 Step 2: Policies...');
        await page.fill('#related_policies', 'นโยบายการพัฒนาบุคลากรตามหลักธรรมาภิบาล มุ่งเน้นการสร้างความเป็นเลิศในการบริการ');
        await page.fill('#context_challenges', 'บริบทความท้าทายด้านการพัฒนาทรัพยากรบุคคลในยุคดิจิทัล');
        
        console.log('✓ Step 2 completed');
        await page.click('button:has-text("ถัดไป")');
        await page.waitForTimeout(2000);

        // Step 3: Health & Wellbeing
        console.log('📝 Step 3: Health & Wellbeing...');
        await page.fill('#disease_diabetes', '10');
        await page.fill('#disease_hypertension', '15');
        await page.fill('#disease_cardiovascular', '5');
        await page.fill('#disease_kidney', '2');
        await page.fill('#disease_liver', '3');
        await page.fill('#disease_cancer', '1');
        await page.fill('#disease_obesity', '20');
        
        await page.fill('#sick_leave_days', '500');
        await page.fill('#clinic_users_per_year', '300');
        await page.fill('#clinic_top_symptoms', 'ปวดหัว, ปวดหลัง, เครียด');
        
        await page.fill('#mental_stress', 'มีการประเมินความเครียด พบระดับปานกลาง');
        await page.fill('#mental_anxiety', 'มีการติดตามเรื่องความวิตกกังวล');
        
        console.log('✓ Step 3 completed');
        await page.click('button:has-text("ถัดไป")');
        await page.waitForTimeout(2000);

        // Step 4: Systems & Environment
        console.log('📝 Step 4: Systems & Environment...');
        
        // Support systems - เลือก radio buttons
        await page.check('input[name="mentoring_system"][value="full"]');
        await page.check('input[name="job_rotation"][value="partial"]');
        await page.check('input[name="idp_system"][value="full"]');
        await page.check('input[name="career_path_system"][value="partial"]');
        
        // Digital systems - เลือก checkboxes
        await page.check('input[type="checkbox"][value="hr_online"]');
        await page.check('input[type="checkbox"][value="learning_platform"]');
        await page.check('input[type="checkbox"][value="performance_system"]');
        
        await page.fill('#training_hours', '40');
        
        console.log('✓ Step 4 completed');
        await page.click('button:has-text("ถัดไป")');
        await page.waitForTimeout(2000);

        // Step 5: Goals & Recommendations
        console.log('📝 Step 5: Goals & Recommendations...');
        
        // Select priorities from dropdowns
        await page.selectOption('#rank_priority_1', 'service_efficiency');
        await page.selectOption('#rank_priority_2', 'digital_capability');
        await page.selectOption('#rank_priority_3', 'new_leaders');
        
        // Upload HRD Plan PDF
        const hrdInput = await page.$('#file-hrd');
        if (hrdInput) {
            await hrdInput.setInputFiles(pdfPaths.hrd);
            await page.waitForTimeout(1500);
        }
        
        await page.fill('#intervention_packages_feedback', 'ข้อเสนอแนะเพิ่มเติมเกี่ยวกับการพัฒนาบุคลากรและระบบสนับสนุน');
        
        console.log('✓ Step 5 completed');

        // Submit form
        console.log('📤 Submitting form...');
        await page.click('button:has-text("ส่งข้อมูล")');
        
        // Wait for success popup
        await page.waitForSelector('#overlay-success', { timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Get success reference
        const refText = await page.textContent('#success-ref');
        console.log(`✅ Success! ${refText}`);
        
        // Close success popup
        await page.click('button:has-text("ปิด")');
        await page.waitForTimeout(1000);

    } catch (error) {
        console.error(`❌ Error in round ${round}:`, error.message);
        // Take screenshot on error
        await page.screenshot({ path: `error-round-${round}.png` });
        throw error;
    }
}

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Playwright CH1 Complete Form Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📅 Date: ${new Date().toLocaleString('th-TH')}`);
    console.log(`🔢 Total Rounds: ${testOrganizations.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Generate PDFs
    console.log('📄 Generating test PDF files...');
    const pdfPaths = generateTestPDFs();
    console.log('✓ PDF files ready\n');

    // Launch browser
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100 
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    let successCount = 0;
    let errorCount = 0;

    // Process each organization
    for (let i = 0; i < testOrganizations.length; i++) {
        try {
            await fillForm(page, testOrganizations[i], pdfPaths, i + 1);
            successCount++;
            
            // Wait between submissions
            if (i < testOrganizations.length - 1) {
                console.log('\n⏳ Waiting 3 seconds before next round...');
                await page.waitForTimeout(3000);
            }
        } catch (error) {
            errorCount++;
            console.error(`\n❌ Round ${i + 1} failed:`, error.message);
            // Continue to next round
        }
    }

    await browser.close();

    // Final summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Success: ${successCount}/${testOrganizations.length}`);
    console.log(`❌ Errors: ${errorCount}/${testOrganizations.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (successCount === testOrganizations.length) {
        console.log('🎉 All tests passed successfully!');
    } else {
        console.log('⚠️  Some tests failed. Check error screenshots.');
    }
}

main().catch(console.error);
