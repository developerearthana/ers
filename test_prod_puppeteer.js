const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        let errors = [];
        
        page.on('pageerror', err => {
            console.log('PAGE ERROR:', err.toString());
            errors.push(err.toString());
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('CONSOLE ERROR:', msg.text());
                errors.push(msg.text());
            }
        });
        
        console.log('Navigating to https://earthana-ers.onrender.com ...');
        await page.goto('https://earthana-ers.onrender.com', { waitUntil: 'networkidle2' });
        
        await new Promise(r => setTimeout(r, 4000));
        console.log('Done waiting. Errors encountered:', errors.length);
        
        await browser.close();
    } catch (e) {
        console.error('Script Error:', e);
    }
})();
