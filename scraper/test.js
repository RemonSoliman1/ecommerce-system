const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  console.log('Navigating...');
  await page.goto('https://www.famous-smoke.com/arturo-fuente-cigars', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000)); // 3 seconds
  
  await page.screenshot({ path: 'famous.png' });
  console.log('Saved screenshot.');
  
  const products = await page.evaluate(() => {
     let items = Array.from(document.querySelectorAll('.item.product, .product-item, .product-item-info, .klevuProduct'));
     if(items.length === 0) items = Array.from(document.querySelectorAll('li')); // fallback
     return items.slice(0,5).map(el => el.innerText.trim());
  });
  console.log("Found products:", products.length ? products : "None");
  await browser.close();
})();
