const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/ch1.html');
    await page.waitForTimeout(1000);
    
    await page.fill('#respondent_email', 'test@test.com');
    await page.click('#btn-confirm-email');
    await page.waitForTimeout(2000);

    const isVisible = await page.evaluate(() => {
        const el = document.getElementById('total_staff');
        if (!el) return 'Not Found';
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            width: rect.width,
            height: rect.height,
            offsetWidth: el.offsetWidth,
            offsetHeight: el.offsetHeight,
            rectX: rect.x,
            rectY: rect.y
        };
    });
    console.log("total_staff visibility:", isVisible);
    
    await browser.close();
})();
