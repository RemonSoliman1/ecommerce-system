const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const BRANDS_TO_SCRAPE = [
    { id: 'rocky-patel', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/rocky-patel' },
    { id: 'ashton', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/ashton' },
    { id: 'cao', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/cao_cigar' },
    { id: 'punch', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/punch' },
    { id: 'gurkha-cigars', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/gurkha' },
    { id: 'san-cristobal', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/san-cristobal' },
    { id: 'avo', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/avo' },
    { id: 'padilla', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/padilla' },
    { id: 'h-upmann', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/h-upmann' },
    { id: 'alec-bradley', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/alec-bradley' },
    { id: 'camacho', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/camacho' },
    { id: 'oliva', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/oliva' },
    { id: 'my-father', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/my-father' },
    { id: 'la-aroma-de-cuba', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/la-aroma-de-cuba' },
    { id: 'arturo-fuente', url: 'https://www.holts.com/cigars/all-cigar-brands/brand/arturo-fuente' }
];

async function downloadAndWatermark(url, brandId, basename) {
    try {
        const destDir = path.join(__dirname, '..', 'public', 'images', 'brands', brandId);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        
        const filename = `${basename}.jpg`;
        const destPath = path.join(destDir, filename);

        // Fetch image
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        const image = await Jimp.read(res.data);
        const stamp = await Jimp.read(path.join(__dirname, 'stamp.png'));
        
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        
        if (w > 200 && h > 200) {
            // Resize stamp to 40% of the image width
            stamp.resize(Math.floor(w * 0.4), Jimp.AUTO);
            
            // Place slightly off center (e.g. upper right or dead center)
            const x = (w / 2) - (stamp.bitmap.width / 2);
            const y = (h / 2) - (stamp.bitmap.height / 2);
            
            image.composite(stamp, x, y, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 0.85,
                opacityDest: 1.0
            });
        }
        
        await image.writeAsync(destPath);
        return `/images/brands/${brandId}/${filename}`;
    } catch (e) {
        console.error("Image error:", e.message);
        return `/images/brands/${brandId}.png`; // fallback
    }
}

async function scrapeBrandProducts(brand) {
    console.log(`\n\n--- Scraping Category: ${brand.id} ---`);
    let catHtml;
    try {
        const res = await axios.get(brand.url);
        catHtml = res.data;
    } catch (e) {
        console.error(`Failed to load category URL for ${brand.id}`);
        return [];
    }
    const $ = cheerio.load(catHtml);

    const productLinks = [];
    $('a').each((i, el) => {
        const link = $(el).attr('href');
        // Ensure link is an html product page, and isn't a top level category link or special clearing
        if (link && link.includes('/cigars/all-cigar-brands/') && link.endsWith('.html') && !link.includes('/brand/') && !link.includes('staff-picks') && !link.includes('clearance') && !link.match(/(holt-s|bella-cuba|villiger|blenders)/)) {
            if (!productLinks.includes(link)) {
                productLinks.push(link);
            }
        }
    });

    console.log(`Found ${productLinks.length} product lines. Scraping sizes...`);
    const allProducts = [];

    for (let link of productLinks) {
        try {
            console.log(` -> Fetching: ${link}`);
            const { data: prodHtml } = await axios.get(link);
            const $$ = cheerio.load(prodHtml);

            // Product Name & Desc
            const name = $$('h1').first().text().trim() || $$('.page-title span').text().trim();
            const desc = $$('meta[property="og:description"]').attr('content') || $$('.value[itemprop="description"]').text().trim();
            const imageUrl = $$('meta[property="og:image"]').attr('content') || $$('meta[name="og:image"]').attr('content') || $$('.product.media img').attr('src');
            
            // Default model values
            let strength = $$('.attribute-wrapper.strength .value').text().trim() || "Medium";

            if (!name) continue;

            const safeBasename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let localImagePath = `/images/brands/${brand.id}.png`;
            
            if (imageUrl) {
                localImagePath = await downloadAndWatermark(imageUrl, brand.id, safeBasename);
            }

            // Extract vitolas
            const modelsMap = {};
            $$('table.products-list-table tr').each((i, el) => {
                const trText = $$(el).text().replace(/\s+/g, ' ').trim();
                // e.g. "Best Seller - 4.5 x 55 Box of 25 $228.00 $204.95"
                // OR "Single - $9.12"
                
                // Extremely heuristic extraction from plain text:
                // Let's grab the first TD as the core size. Usually it's in a th/td structure
                const firstCol = $$(el).find('td').first().text().replace(/\s+/g, ' ').trim() || $$(el).find('th').first().text().replace(/\s+/g, ' ').trim();
                
                if (firstCol.includes('Cart')) return; // header row or button
                
                const pack = $$(el).find('.packaging').text().trim() || firstCol;
                let priceRaw = $$(el).find('.price').first().text().trim();
                if (!priceRaw) return;

                const price = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
                if (price) {
                     modelsMap[pack] = { name: pack, size: "Ask", price: price };
                }
            });

            const modelsArray = Object.values(modelsMap);
            if (modelsArray.length === 0) {
                 // fallback if table missed
                 modelsArray.push({ name: "Single", size: "Unknown", price: 15.00 });
            }

            const prodObj = {
                id: safeBasename,
                brandId: brand.id,
                name: name,
                type: 'cigar',
                description: desc,
                strength: strength,
                image: localImagePath,
                models: modelsArray
            };

            allProducts.push(prodObj);
        } catch (e) {
            console.error(`Failed to scrape ${link}:`, e.message);
        }
    }

    return allProducts;
}

async function run() {
    const finalData = [];
    for (const b of BRANDS_TO_SCRAPE) {
        const products = await scrapeBrandProducts(b);
        finalData.push(...products);
    }

    fs.writeFileSync('holts_data.json', JSON.stringify(finalData, null, 2));
    console.log(`\n\n✅ DONE! Scaled scraping complete. Saved ${finalData.length} items to holts_data.json`);
    console.log(`Run 'node upload.js holts_data.json' to finalize!`);
}

run();
