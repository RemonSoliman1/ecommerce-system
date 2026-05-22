const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Jimp = require('jimp');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.famous-smoke.com';

const BOUTIQUE_BRANDS = [
    { id: 'zino', name: 'Zino', url: 'https://www.famous-smoke.com/brand/zino-cigars' },
    { id: 'el-septimo', name: 'El Septimo', url: 'https://www.famous-smoke.com/brand/el-septimo-cigars' },
    { id: 'chateau-diadem', name: 'Chateau Diadem', url: 'https://www.famous-smoke.com/brand/chateau-diadem-cigars' }
];

async function downloadAndWatermark(url, brandId, basename) {
    if (!url || !url.startsWith('http')) return `/images/brands/${brandId}.png`;
    try {
        const destDir = path.join(__dirname, '..', 'public', 'images', 'brands', brandId);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        
        const filename = `${basename}.jpg`;
        const destPath = path.join(destDir, filename);

        const response = await axios({
            url,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
        });
        const image = await Jimp.read(response.data);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        
        const text = "CIGAR LOUNGE";
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        
        // Watermark tiles
        image.print(font, 20, h - 40, text);
        image.print(font, w - 180, h - 40, text);
        
        await image.writeAsync(destPath);
        return `/images/brands/${brandId}/${filename}`;
    } catch (e) {
        console.error("Image watermark error:", e.message);
        return `/images/brands/${brandId}.png`;
    }
}

async function scrapeBrandFamous(browser, brand) {
    console.log(`\n\n--- Scraping Category: ${brand.id} ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(brand.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`Waiting 15 seconds to bypass Cloudflare... (Please check "I am human" if prompted on screen!)`);
        await new Promise(r => setTimeout(r, 15000));

        // Evaluate extraction on main category page
        const extracted = await page.evaluate(() => {
            const data = [];
            // Target elements matching Famous-Smoke grid items representing lines/boxes
            const items = Array.from(document.querySelectorAll('.cat-prod-list, .grid-item, .product-item, .brand-card, [data-qa="productCard"]'));
            
            for (let el of items) {
                const nameEl = el.querySelector('.product-name, .title, a, h3');
                if (!nameEl) continue;
                let name = nameEl.innerText.trim();
                if (!name) continue;

                const imgEl = el.querySelector('img');
                let imageUrl = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : null;
                
                const priceEl = el.querySelector('.price, .offer-price, .price-box');
                let priceRaw = priceEl ? priceEl.innerText.trim() : '0.00';
                let price = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

                const descEl = el.querySelector('.product-desc, .vitola, span');
                let sizeStr = descEl ? descEl.innerText.trim() : 'Ask Local Shop';
                
                let link = el.querySelector('a') ? el.querySelector('a').href : null;
                
                data.push({ name, imageUrl, price, sizeStr, link });
            }
            return data;
        });

        console.log(`Finished scraping ${extracted.length} raw products. Watermarking...`);
        
        for (let item of extracted) {
            const safeBasename = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let localImagePath = null;
            if (item.imageUrl) {
                 localImagePath = await downloadAndWatermark(item.imageUrl, brand.id, safeBasename);
            }
            
            const prodObj = {
                id: safeBasename,
                brand_id: brand.id,
                name: item.name,
                series: item.name,
                type: 'cigar',
                description: `A fine cigar from ${brand.name}.`,
                strength: 'Medium',
                image: localImagePath || `/images/brands/${brand.id}.png`,
                models: [
                    { name: 'Box/Bundle', size: item.sizeStr, price: item.price }
                ]
            };
            
            await supabase.from('products').upsert(prodObj);
            console.log(`Uploaded ${item.name}`);
        }
        
    } catch(e) {
        console.error(`Failed to scrape ${brand.url}:`, e);
    } finally {
        await page.close();
    }
}

async function runFamous() {
    console.log("Launching Headful Browser so you can manually pass Cloudflare if it appears!");
    const browser = await puppeteer.launch({ 
        headless: false, // User can click!
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'] 
    });

    for (const b of BOUTIQUE_BRANDS) {
        await scrapeBrandFamous(browser, b);
    }

    await browser.close();
    console.log("✅ Done scraping Famous Smoke boutiques!");
}

runFamous();
