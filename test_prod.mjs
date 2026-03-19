import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('pageerror', exception => {
    console.log(`Uncaught exception: "${exception}"`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Console Error: "${msg.text()}"`);
    }
  });

  console.log('Navigating to live app...');
  await page.goto('https://earthana-ers.onrender.com', { waitUntil: 'networkidle' });
  
  // Wait a bit to ensure client-side code runs
  await page.waitForTimeout(3000);

  await browser.close();
})();
