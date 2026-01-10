import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: true
});

const page = await context.newPage();

// Screenshot home page
console.log('Capturing home page...');
await page.goto('https://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'screenshot-home.png', fullPage: true });

// Screenshot plans page
console.log('Capturing plans page...');
await page.goto('https://localhost:5173/plans', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'screenshot-plans.png', fullPage: true });

// Screenshot inventory page
console.log('Capturing inventory page...');
await page.goto('https://localhost:5173/inventory', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'screenshot-inventory.png', fullPage: true });

await browser.close();
console.log('Screenshots saved!');
