const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to wait
const delay = ms => new Promise(res => setTimeout(res, ms));

async function findImage(query, browser) {
    try {
        console.log(`  Searching DuckDuckGo for: ${query}`);
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
        
        const page = await browser.newPage();
        
        // Block unnecessary resources to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await delay(3000); 

        // Extract image source from DuckDuckGo tile--img
        const imageUrl = await page.evaluate(() => {
            const img = document.querySelector('.tile--img__img');
            return img ? img.src : null;
        });

        await page.close();

        if (imageUrl && imageUrl.startsWith('//')) {
            return 'https:' + imageUrl;
        }

        return imageUrl;
    } catch (e) {
        console.log("    Search Error:", e.message);
        return null;
    }
}

async function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to download: ${res.statusCode}`));
            }
            const file = fs.createWriteStream(destPath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', reject);
    });
}

async function main() {
    const brands = [
        { id: 'montecristo', query: 'Montecristo cigars logo png transparent background' },
        { id: 'ashton', query: 'Ashton cigars logo png transparent background' },
        { id: 'ryj', query: 'Romeo y Julieta cigars logo png transparent background' }
    ];

    const browser = await puppeteer.launch({ 
        executablePath: process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : '/usr/bin/google-chrome',
        headless: "new" 
    });

    for (const brand of brands) {
        console.log(`Processing ${brand.id}...`);
        const url = await findImage(brand.query, browser);
        if (url) {
            console.log(`  Found URL: ${url}`);
            const destPath = path.join(__dirname, '..', 'public', 'images', 'brands', `${brand.id}.png`);
            await downloadImage(url, destPath);
            console.log(`  Saved to ${destPath}`);
        } else {
            console.log(`  No image found for ${brand.id}`);
        }
    }

    await browser.close();
}

main();
