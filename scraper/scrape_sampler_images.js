const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const samplers = [
    { id: 'oliva-journey', query: 'Journey to Oliva Sampler' },
    { id: 'oliva-festive', query: 'Oliva Festive Edition Sampler' },
    { id: 'oliva-taste', query: 'Taste of Oliva Sampler' },
    { id: 'nub-calendar', query: 'Nub Advent Calendar Sampler' },
    { id: 'oliva-melanio-2024', query: 'Oliva Serie V Melanio Edicion Limitada 2024' },
    { id: 'perdomo-connoisseur', query: 'Perdomo Connoisseur Collection' },
    { id: 'plasencia-robusto-collection', query: 'Plasencia Robusto Collection Sampler' },
    { id: 'camacho-best-90', query: 'Camacho Best of the Best 90+ Rated Sampler' },
    { id: 'fuente-holiday-robusto', query: 'Arturo Fuente 5 Robusto Sampler' },
    { id: 'fuente-holiday-toro', query: 'Arturo Fuente 5 Toro Sampler' },
    { id: 'drew-factory-maduro', query: 'Factory Smokes Maduro by Drew Estate' },
    { id: 'quorum-classic', query: 'Quorum Classic Bundle' },
    { id: 'macanudo-ascot', query: 'Macanudo Cafe Ascot Cigarillos' },
    { id: 'ryj-mini', query: 'Romeo y Julieta Mini cigarillo' }
];

async function applyWatermark(imageBuffer) {
    const stampPath = path.join(__dirname, 'stamp.png');
    const original = sharp(imageBuffer);
    const meta = await original.metadata();
    
    // Scale watermark to 40% of image width
    const stampSize = Math.floor(meta.width * 0.4);
    const stampBuffer = await sharp(stampPath).resize({ width: stampSize }).toBuffer();
    const stampMeta = await sharp(stampBuffer).metadata();
    
    const left = Math.floor((meta.width - stampSize) / 2);
    const top = Math.floor((meta.height - stampMeta.height) / 2);
    
    return await original.composite([{
        input: stampBuffer,
        top: top,
        left: left,
        blend: 'over'
    }]).png().toBuffer();
}

async function scrapeHoltsImage(query) {
    try {
        const res = await axios.get(`https://www.holts.com/catalogsearch/result/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const $ = cheerio.load(res.data);
        const img = $('.product-image-photo').first().attr('src');
        if (img) return img;
    } catch (e) {
        console.error("Holts search failed for", query, e.message);
    }
    
    // Fallback: Cigar International
    try {
        const res2 = await axios.get(`https://www.cigarsinternational.com/shop/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const $2 = cheerio.load(res2.data);
        const img2 = $2('.product-image img').first().attr('src');
        if (img2) return img2.startsWith('http') ? img2 : 'https://www.cigarsinternational.com' + img2;
    } catch (e) {}

    return null;
}

async function run() {
    const destDir = path.join(__dirname, '..', 'public', 'images', 'products');
    
    for (const item of samplers) {
        console.log(`Searching for ${item.query}...`);
        const imgUrl = await scrapeHoltsImage(item.query);
        
        if (imgUrl) {
            console.log(`Found: ${imgUrl}`);
            try {
                const response = await axios({
                    url: imgUrl, responseType: 'arraybuffer',
                    headers: { 'User-Agent': "Mozilla/5.0" }
                });
                
                const watermarked = await applyWatermark(response.data);
                
                const filename = `${item.id}.png`;
                const destPath = path.join(destDir, filename);
                fs.writeFileSync(destPath, watermarked);
                console.log(`Saved watermarked image to ${filename}`);
            } catch (err) {
                console.error(`Failed to process image for ${item.query}:`, err.message);
            }
        } else {
            console.log(`NOT FOUND: ${item.query}`);
        }
    }
}

run();
