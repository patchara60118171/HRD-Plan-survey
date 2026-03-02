const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/ch1.html');
    await page.waitForTimeout(1000);
    
    console.log("On Landing:");
    let activeSteps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.form-step.active')).map(e => e.id || e.getAttribute('data-step'));
    });
    console.log("Active steps:", activeSteps);
    
    console.log("Filling email and clicking...");
    await page.fill('#respondent_email', 'test@test.com');
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(1000);
    
    console.log("After click:");
    activeSteps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.form-step')).map(e => ({
            step: e.getAttribute('data-step'),
            active: e.classList.contains('active'),
            display: getComputedStyle(e).display
        }));
    });
    console.log("All steps state:", activeSteps);
    
    let btnNext = await page.evaluate(() => {
        const btn = document.getElementById('btn-next');
        return { exists: !!btn, display: btn ? getComputedStyle(btn).display : 'none' };
    });
    console.log("btn-next state:", btnNext);
    
    let formNav = await page.evaluate(() => {
        const nav = document.getElementById('form-nav');
        return { exists: !!nav, display: nav ? getComputedStyle(nav).display : 'none' };
    });
    console.log("form-nav state:", formNav);

    await browser.close();
})();
