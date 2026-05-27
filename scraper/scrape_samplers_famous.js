const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

puppeteer.use(StealthPlugin());

const queries = {
    'oliva-journey': 'Oliva',
    'oliva-festive': 'Oliva Sampler',
    'oliva-taste': 'Oliva',
    'nub-calendar': 'Nub',
    'oliva-melanio-2024': 'Oliva Serie V Melanio',
    'perdomo-connoisseur': 'Perdomo Connoisseur Collection',
    'plasencia-robusto-collection': 'Plasencia Robusto',
    'camacho-best-90': 'Camacho',
    'fuente-holiday-robusto': 'Arturo Fuente',
    'fuente-holiday-toro': 'Arturo Fuente',
    'drew-factory-maduro': 'Factory Smokes',
    'quorum-classic': 'Quorum',
    'macanudo-ascot': 'Macanudo',
    'ryj-mini': 'Romeo y Julieta'
};

async function applyWatermark(imageBuffer) {
    const stampPath = path.join(__dirname, 'stamp.png');
    const original = sharp(imageBuffer);
    const meta = await original.metadata();
    
    if (meta.width < 100) return imageBuffer; // Too small to watermark

    const stampSize = Math.floor(meta.width * 0.4);
    const stampBuffer = await sharp(stampPath).resize({ width: stampSize }).toBuffer();
    const stampMeta = await sharp(stampBuffer).metadata();
    
    const left = Math.floor((meta.width - stampSize) / 2);
    const top = Math.floor((meta.height - stampMeta.height) / 2);
    
    return await original.composite([{
        input: stampBuffer, top, left, blend: 'over'
    }]).png().toBuffer();
}

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const destDir = path.join(__dirname, '..', 'public', 'images', 'products');
    
    for (const [id, q] of Object.entries(queries)) {
        console.log(`Scraping Famous Smoke for: ${q} (ID: ${id})`);
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        
        try {
            await page.goto(`https://www.famous-smoke.com/search?q=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 8000)); // Wait for Cloudflare/React to load
            
            const imgUrl = await page.evaluate(() => {
                const img = document.querySelector('[data-qa="productCard"] img, .product-image img');
                return img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
            });
            
            if (imgUrl && imgUrl.startsWith('http')) {
                console.log(`Found image: ${imgUrl}`);
                const response = await axios({
                    url: imgUrl, responseType: 'arraybuffer',
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                
                const watermarked = await applyWatermark(response.data);
                fs.writeFileSync(path.join(destDir, `${id}.png`), watermarked);
                console.log(`Success! Saved ${id}.png`);
            } else {
                console.log(`No image found on page for ${id}`);
            }
        } catch (e) {
            console.error(`Error for ${id}:`, e.message);
        }
        await page.close();
    }
    await browser.close();
}

run();
