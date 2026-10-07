const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        // Go to cigarpage.com
        await page.goto('https://www.cigarpage.com/media/wysiwyg/brand-logos/camacho.png', { waitUntil: 'domcontentloaded' });
        
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'scratch/camacho_puppeteer.png' });
        
        const size = fs.statSync('scratch/camacho_puppeteer.png').size;
        console.log('Screenshot size:', size);
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
