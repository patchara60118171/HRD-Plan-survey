const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    await page.goto('https://nidawellbeing.vercel.app/ch1.html');
    await page.waitForTimeout(2000);
    
    console.log("Checking Landing Step:");
    let step0 = await page.evaluate(() => {
        const el = document.getElementById('step-0');
        return { display: getComputedStyle(el).display, class: el.className };
    });
    console.log("Step 0:", step0);

    console.log("Filling email and clicking...");
    await page.fill('#respondent_email', 'test@test.com');
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(2000);
    
    let allSteps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.form-step')).map(e => ({
            step: e.getAttribute('data-step'),
            active: e.classList.contains('active'),
            display: getComputedStyle(e).display
        }));
    });
    console.log("All steps state:", allSteps);
    
    let btnNext = await page.evaluate(() => {
        const btn = document.getElementById('btn-next');
        return { exists: !!btn, display: btn ? getComputedStyle(btn).display : 'none' };
    });
    console.log("btn-next state:", btnNext);

    await browser.close();
})();
