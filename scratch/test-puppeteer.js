const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://www.google.com/search?tbm=isch&q=cohiba+cigar+logo+transparent+png', { waitUntil: 'domcontentloaded' });
        
        // Wait a bit
        await new Promise(r => setTimeout(r, 2000));
        
        // Extract the first image data URI
        const dataUri = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const dataImgs = imgs.filter(img => img.src && img.src.startsWith('data:image'));
            return dataImgs.length > 0 ? dataImgs[0].src : null;
        });
        
        console.log(dataUri ? 'Success: ' + dataUri.substring(0, 50) + '...' : 'Failed to find data URI');
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
