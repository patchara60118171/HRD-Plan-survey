const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    await page.goto('http://localhost:3000/ch1.html');
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
        const oldShowStep = showStep;
        window.showStep = function(stepNum) {
            console.log('called showStep with', stepNum);
            oldShowStep(stepNum);
        }
        const oldUpdateUI = updateUI;
        window.updateUI = function() {
            console.log('called updateUI, currentStep:', currentStep);
            oldUpdateUI();
        }
    });

    await page.fill('#respondent_email', 'test@test.com');
    await page.click('#btn-confirm-email');
    
    await page.waitForTimeout(2000); // wait for setTimeout

    let activeSteps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.form-step')).map(e => ({
            step: e.getAttribute('data-step'),
            active: e.classList.contains('active'),
            display: getComputedStyle(e).display
        }));
    });
    console.log("Steps after 2s:", activeSteps);
    
    let btnNext = await page.evaluate(() => {
        const btn = document.getElementById('btn-next');
        return { exists: !!btn, display: btn ? getComputedStyle(btn).display : 'none' };
    });
    console.log("btn-next:", btnNext);

    await browser.close();
})();
