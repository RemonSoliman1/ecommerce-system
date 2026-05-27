const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const query = 'Journey to Oliva Sampler cigar';
    
    await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, { waitUntil: 'networkidle2' });
    
    const src = await page.evaluate(() => {
        const img = document.querySelector('img.tile--img__img');
        return img ? img.src : null;
    });
    
    console.log("Image source:", src);
    await browser.close();
}

run();
