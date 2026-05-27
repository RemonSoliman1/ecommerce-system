const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Attempt to bypass simple bot checks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });

    console.log("Navigating to Holts Samplers...");
    const response = await page.goto('https://www.holts.com/samplers.html', { waitUntil: 'networkidle2' });
    console.log("Status:", response.status());
    
    const samplers = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.product-item-info'));
        return items.slice(0, 5).map(item => {
            const nameEl = item.querySelector('.product-item-link');
            const imgEl = item.querySelector('.product-image-photo');
            const priceEl = item.querySelector('.price');
            return {
                name: nameEl ? nameEl.innerText.trim() : null,
                image: imgEl ? imgEl.src : null,
                price: priceEl ? priceEl.innerText.trim() : null
            };
        });
    });
    
    console.log("Found:", samplers);
    await browser.close();
}

run().catch(console.error);
