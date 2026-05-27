const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');

puppeteer.use(StealthPlugin());

const queries = {
    'oliva-journey': 'Oliva 8-Cigar Assortment box',
    'oliva-festive': 'Oliva 12-Cigar Sampler box',
    'oliva-taste': 'Taste of Oliva Sampler',
    'nub-calendar': 'Nub Advent Calendar Sampler',
    'oliva-melanio-2024': 'Oliva Serie V Melanio Edicion Limitada 2024 box',
    'perdomo-connoisseur': 'Perdomo Connoisseur Collection 12 cigars',
    'plasencia-robusto-collection': 'Plasencia Robusto Collection Sampler box',
    'camacho-best-90': 'Camacho Best of the Best sampler',
    'fuente-holiday-robusto': 'Arturo Fuente 5 Robusto Sampler',
    'fuente-holiday-toro': 'Arturo Fuente 5 Toro Sampler',
    'drew-factory-maduro': 'Factory Smokes Maduro bundle',
    'quorum-classic': 'Quorum Classic Bundle',
    'macanudo-ascot': 'Macanudo Cafe Ascot Cigarillos tin',
    'ryj-mini': 'Romeo y Julieta Mini cigarillo tin'
};

async function applyWatermark(imageBuffer) {
    const stampPath = path.join(__dirname, 'stamp.png');
    const original = sharp(imageBuffer);
    const meta = await original.metadata();
    
    if (meta.width < 100) throw new Error("Image too small");

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
    const destDir = path.join(__dirname, '..', 'public', 'images', 'products');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    for (const [id, q] of Object.entries(queries)) {
        console.log(`\nSearching Yahoo for: ${q} (ID: ${id})`);
        try {
            await page.goto(`https://images.search.yahoo.com/search/images?p=${encodeURIComponent(q + ' cigar')}`, { waitUntil: 'networkidle2' });
            
            // Wait for images to appear
            await page.waitForSelector('li.ld a img', { timeout: 10000 });
            
            const imgUrl = await page.evaluate(() => {
                const items = document.querySelectorAll('li.ld a img');
                for (let i = 0; i < items.length; i++) {
                    const src = items[i].getAttribute('data-src') || items[i].getAttribute('src');
                    if (src && src.startsWith('http')) return src;
                }
                return null;
            });

            if (imgUrl) {
                console.log(`Found image: ${imgUrl}`);
                // Download using axios
                const imgRes = await axios({ url: imgUrl, responseType: 'arraybuffer' });
                const watermarked = await applyWatermark(imgRes.data);
                
                fs.writeFileSync(path.join(destDir, `${id}.png`), watermarked);
                console.log(`Success! Saved ${id}.png`);
            } else {
                console.log(`No image found on page for ${id}`);
            }
        } catch (e) {
            console.error(`Error for ${id}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();
    console.log("\nFinished all.");
}

run();
