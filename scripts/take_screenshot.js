const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1080 });
  await page.goto('http://localhost:3000/en/shop', { waitUntil: 'networkidle' });
  
  // Give it a second to load products
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'C:\\Users\\Remon\\.gemini\\antigravity\\brain\\68968be3-3af3-49bd-87fb-fe3785847ae7\\shop_screenshot.png' });
  
  await browser.close();
  console.log('Screenshot saved!');
})();
