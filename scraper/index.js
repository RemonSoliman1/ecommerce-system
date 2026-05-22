const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

puppeteer.use(StealthPlugin());

const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    type: 'string',
    description: 'Target category/brand URL (e.g. famous smoke URL)'
  })
  .option('brand', {
    alias: 'b',
    type: 'string',
    description: 'Brand ID to tag the products with (e.g., "arturo-fuente")'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    default: 'output.json',
    description: 'Output JSON file name'
  })
  .demandOption(['url', 'brand'], 'Please provide both url and brand arguments to work with this scraper')
  .argv;

// Ensure public/images/cigars exists
const IMAGES_DIR = path.join(__dirname, '../public/images/cigars');
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function downloadImage(url, filename) {
    if (!url || !url.startsWith('http')) return null;
    const filepath = path.join(IMAGES_DIR, filename);
    try {
        const response = await axios({
            url,
            responseType: 'stream',
            timeout: 10000 // 10s timeout
        });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(`/images/cigars/${filename}`));
            writer.on('error', reject);
        });
    } catch (e) {
        console.error(`Failed to download image ${url}:`, e.message);
        return null; // return soft fallback
    }
}

function generateId(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function scrapeURL() {
    console.log(`Launching headless browser... Targeting: ${argv.url}`);
    const browser = await puppeteer.launch({ 
        headless: false, // Run VISIBLE to bypass captchas!
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Set a normal looking viewport and user agent to bypass WAFs
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let products = [];
    
    try {
        await page.goto(argv.url, { waitUntil: 'load', timeout: 60000 });
        console.log(`Page fully loaded. Waiting 15s to bypass any 'Are you human?' Cloudflare checks manually, or let dynamic JS run...`);
        await new Promise(r => setTimeout(r, 15000));
        
        // This is a powerful, generic evaluate script. 
        // We look for common product container classes used by aggregator sites (Famous Smoke, Thompson, CI, JRCigars)
        const extractedData = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.item.product, .product-item, .klevuProduct, .cat-prod-list, .grid-item'));
            const data = [];
            
            for (let el of items) {
                // Generic fallbacks for name
                const nameEl = el.querySelector('.product-item-link, .product-name, .title, .klevuProductTitle');
                if (!nameEl) continue;
                const name = nameEl.innerText.trim();
                
                // Try grabbing image src
                const imgEl = el.querySelector('.product-image-photo, .img-responsive, img');
                let imageUrl = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : null;
                
                // Generic fallback for price
                const priceEl = el.querySelector('.price, .price-box, .offer-price');
                let priceRaw = priceEl ? priceEl.innerText.trim() : '0.00';
                // Extract just the numbers
                let priceStr = priceRaw.replace(/[^0-9.]/g, '');
                let price = parseFloat(priceStr) || 0.0;
                
                // Vitola / size info (Often embedded in subtitle or attr)
                const descEl = el.querySelector('.product-desc, .subtitle, .vitola');
                let sizeStr = descEl ? descEl.innerText.trim() : 'Unknown Size';
                
                // Strength is sometimes available as an icon or text class 
                const strengthEl = el.querySelector('.strength, .cigar-strength, [class*="strength-"]');
                let strength = strengthEl ? strengthEl.innerText.trim() : 'Medium'; // default fallback
                
                // Link
                let link = nameEl.tagName === 'A' ? nameEl.href : (el.querySelector('a') ? el.querySelector('a').href : null);
                
                if (name) {
                    data.push({ name, imageUrl, priceRaw, price, sizeStr, strength, link });
                }
            }
            return data;
        });
        
        console.log(`Extracted ${extractedData.length} raw product elements from the DOM.`);
        
        if (extractedData.length === 0) {
            console.log('No elements found! Saving debug.png and debug.html to see what the browser saw...');
            await page.screenshot({ path: 'debug.png', fullPage: true });
            const pageHtml = await page.content();
            fs.writeFileSync('debug.html', pageHtml);
            console.log('Check debug.png to see if a captcha or 404 page was hit, or if selectors need updating.');
        }
        
        for (let item of extractedData) {
            const id = generateId(`${argv.brand}-${item.name}`);
            console.log(`Processing: ${item.name} ($${item.price})`);
            
            // Generate local image filename
            let localImagePath = null;
            if (item.imageUrl) {
                // Ensure absolute URL
                let fullImageUrl = item.imageUrl;
                if (!fullImageUrl.startsWith('http')) {
                    const u = new URL(argv.url);
                    fullImageUrl = u.origin + (fullImageUrl.startsWith('/') ? '' : '/') + fullImageUrl;
                }
                const ext = fullImageUrl.split('.').pop().split('?')[0] || 'jpg';
                const filename = `${id}.${ext}`;
                localImagePath = await downloadImage(fullImageUrl, filename);
            }
            
            // Map it to the exact schema expected by Supabase / products.json
            products.push({
                id: id,
                brandId: argv.brand,
                name: item.name,
                type: 'cigar',  // default, can be parsed from description
                description: `A fine cigar by ${argv.brand}.`, 
                strength: item.strength || 'Medium',
                image: localImagePath || item.imageUrl, // Fallback to raw URL if download failed
                models: [
                    {
                        name: 'Single', // Or box, bundle depending on parsing
                        size: item.sizeStr || 'Unknown',
                        price: item.price
                    }
                ]
            });
        }
    } catch (e) {
        console.error('An error occurred during scraping:', e);
    } finally {
        await browser.close();
    }
    
    // Save to JSON
    fs.writeFileSync(argv.output, JSON.stringify(products, null, 2));
    console.log(`Scraping complete. Saved ${products.length} items to ${argv.output}.`);
    console.log(`You can now upload these using: node upload.js ${argv.output}`);
}

scrapeURL();
