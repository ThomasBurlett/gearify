const { chromium } = require('playwright')

async function takeScreenshot() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(process.argv[2] || 'https://localhost:5173', { waitUntil: 'networkidle' })
  await page.screenshot({ path: process.argv[3] || 'screenshot.png', fullPage: true })
  await browser.close()
  console.log('Screenshot saved')
}

takeScreenshot().catch(console.error)
