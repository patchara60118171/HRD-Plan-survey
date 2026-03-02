const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('http://localhost:3000/ch1.html');
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
        const oldBtn = document.getElementById('btn-confirm-email');
        oldBtn.addEventListener('click', () => {
            console.log('Button clicked! Current email:', document.getElementById('respondent_email').value);
        });
    });

    await page.fill('#respondent_email', 'test@test.com');
    await page.click('#btn-confirm-email');
    
    await page.waitForTimeout(2000);

    let activeSteps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.form-step')).map(e => ({
            step: e.getAttribute('data-step'),
            active: e.classList.contains('active'),
            display: getComputedStyle(e).display
        }));
    });
    console.log("Steps after 2s:", activeSteps);
    
    await browser.close();
})();
