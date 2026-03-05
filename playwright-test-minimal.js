const { chromium } = require('playwright');
const fs = require('fs');

// Test data for 10 different organizations
const testData = [
    {
        email: 'test1@health.go.th',
        organization: 'กรมอนามัย'
    },
    {
        email: 'test2@disease.go.th',
        organization: 'กรมควบคุมโรค'
    },
    {
        email: 'test3@medical.go.th',
        organization: 'กรมการแพทย์'
    },
    {
        email: 'test4@mental.go.th',
        organization: 'กรมสุขภาพจิต'
    },
    {
        email: 'test5@science.go.th',
        organization: 'กรมวิทยาศาสตร์การแพทย์'
    },
    {
        email: 'test6@fda.go.th',
        organization: 'สำนักงานคณะกรรมการอาหารและยา'
    },
    {
        email: 'test7@support.go.th',
        organization: 'กรมสนับสนุนบริการสุขภาพ'
    },
    {
        email: 'test8@thaimed.go.th',
        organization: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก'
    },
    {
        email: 'test9@nerc.go.th',
        organization: 'สถาบันการแพทย์ฉุกเฉินแห่งชาติ'
    },
    {
        email: 'test10@nhso.go.th',
        organization: 'สำนักงานหลักประกันสุขภาพแห่งชาติ'
    }
];

async function runFormTest() {
    console.log('🚀 Starting Playwright form test...');
    
    const browser = await chromium.launch({ 
        headless: false, // Show browser for debugging
        slowMo: 100 // Slow down for better visibility
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
            await page.waitForTimeout(2000);
            
            // Step 1: Fill minimal required fields
            await page.waitForSelector('#organization');
            await page.selectOption('#organization', data.organization);
            await page.fill('#strategic_overview', 'ทดสอบระบบฟอร์มใหม่');
            await page.fill('#org_structure', 'โครงสร้างองค์กร');
            await page.fill('#total_staff', '100');
            
            // Fill some basic fields
            await page.fill('#type_official', '50');
            await page.fill('#age_u30', '20');
            await page.fill('#service_u1', '10');
            
            // Click next through all steps
            for (let step = 1; step <= 4; step++) {
                try {
                    await page.click('button:has-text("ถัดไป")');
                    await page.waitForTimeout(2000);
                } catch (e) {
                    console.log(`⚠️ Could not click next on step ${step}, continuing...`);
                }
            }
            
            // Try to submit
            try {
                await page.click('button:has-text("ส่งข้อมูล")');
                await page.waitForTimeout(3000);
                
                // Check if success overlay appears
                const overlayVisible = await page.isVisible('#overlay-success');
                
                if (overlayVisible) {
                    const successRef = await page.textContent('#success-ref');
                    results.push({
                        test: i + 1,
                        organization: data.organization,
                        email: data.email,
                        status: 'SUCCESS',
                        reference: successRef,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`✅ Test ${i + 1} completed successfully`);
                } else {
                    // Check if there's an error
                    const errorVisible = await page.isVisible('#overlay-error');
                    if (errorVisible) {
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
                        results.push({
                            test: i + 1,
                            organization: data.organization,
                            email: data.email,
                            status: 'UNKNOWN',
                            error: 'No success or error overlay detected',
                            timestamp: new Date().toISOString()
                        });
                        console.log(`❓ Test ${i + 1} completed with unknown status`);
                    }
                }
            } catch (e) {
                results.push({
                    test: i + 1,
                    organization: data.organization,
                    email: data.email,
                    status: 'SUBMIT_FAILED',
                    error: e.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ Test ${i + 1} submit failed: ${e.message}`);
            }
            
            // Wait before next test
            await page.waitForTimeout(2000);
            
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
    console.log(`Failed: ${results.filter(r => r.status === 'FAILED').length}`);
    console.log(`Unknown: ${results.filter(r => r.status === 'UNKNOWN').length}`);
    console.log(`\n📄 Results saved to: ${resultsPath}`);
}

// Run the test
runFormTest().catch(console.error);
