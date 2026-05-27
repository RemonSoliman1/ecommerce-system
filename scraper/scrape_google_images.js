const puppeteer = require('puppeteer');
const fs = require('fs');

const queries = {
    'oliva-journey': 'Oliva 8-Cigar Assortment box famous smoke',
    'oliva-festive': 'Oliva 12-Cigar Sampler box famous smoke',
    'oliva-taste': 'Taste of Oliva Sampler famous smoke',
    'nub-calendar': 'Nub Advent Calendar Sampler famous smoke',
    'oliva-melanio-2024': 'Oliva Serie V Melanio Edicion Limitada 2024 famous smoke',
    'perdomo-connoisseur': 'Perdomo Connoisseur Collection 12 cigars famous smoke',
    'plasencia-robusto-collection': 'Plasencia Robusto Collection Sampler famous smoke',
    'camacho-best-90': 'Camacho Best of the Best sampler famous smoke',
    'fuente-holiday-robusto': 'Arturo Fuente 5 Robusto Sampler famous smoke',
    'fuente-holiday-toro': 'Arturo Fuente 5 Toro Sampler famous smoke',
    'drew-factory-maduro': 'Factory Smokes Maduro bundle famous smoke',
    'quorum-classic': 'Quorum Classic Bundle famous smoke',
    'macanudo-ascot': 'Macanudo Cafe Ascot Cigarillos tin famous smoke',
    'ryj-mini': 'Romeo y Julieta Mini cigarillo tin famous smoke'
};

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const results = {};

    for (const [id, query] of Object.entries(queries)) {
        console.log(`Searching: ${query}`);
        try {
            await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
            
            // Wait for images to load
            await page.waitForSelector('img');
            
            const src = await page.evaluate(() => {
                // Find the first image that looks like a real result (not a logo)
                const imgs = Array.from(document.querySelectorAll('img[src^="https://encrypted-tbn0.gstatic.com/images"]'));
                return imgs.length > 0 ? imgs[0].src : null;
            });
            
            if (src) {
                console.log(`FOUND ${id}: ${src.substring(0, 50)}...`);
                results[id] = src;
            } else {
                console.log(`NOT FOUND: ${id}`);
            }
        } catch (e) {
            console.error(`Error searching ${id}:`, e.message);
        }
    }
    
    fs.writeFileSync('sampler_google_urls.json', JSON.stringify(results, null, 2));
    await browser.close();
}

run();
