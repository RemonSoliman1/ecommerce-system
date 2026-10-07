const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        await page.goto('https://www.cigarpage.com/media/wysiwyg/brand-logos/camacho.png', { waitUntil: 'networkidle0' });
        
        const base64 = await page.evaluate(() => {
            const img = document.querySelector('img');
            if (!img) return null;
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL('image/png').split(',')[1];
        });
        
        if (base64) {
            fs.writeFileSync('scratch/camacho_downloaded.png', Buffer.from(base64, 'base64'));
            console.log('Downloaded! Size:', fs.statSync('scratch/camacho_downloaded.png').size);
        } else {
            console.log('No image found.');
        }
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
