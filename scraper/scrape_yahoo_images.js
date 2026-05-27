const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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
    
    // Validate image format
    if (meta.width < 100 || meta.height < 100) throw new Error("Image too small");

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

async function run() {
    const destDir = path.join(__dirname, '..', 'public', 'images', 'products');
    
    for (const [id, q] of Object.entries(queries)) {
        try {
            console.log("Searching Yahoo for: " + q);
            const res = await axios.get(`https://images.search.yahoo.com/search/images?p=${encodeURIComponent(q + ' cigar')}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            const $ = cheerio.load(res.data);
            
            // Yahoo images are usually inside li elements with data attributes
            const items = $('li.ld a img');
            let imgUrl = null;
            
            for (let i = 0; i < items.length; i++) {
                const src = $(items[i]).attr('data-src') || $(items[i]).attr('src');
                if (src && src.startsWith('http')) {
                    imgUrl = src;
                    break;
                }
            }

            if (imgUrl) {
                console.log(`Found image for ${id}: ${imgUrl.substring(0, 50)}...`);
                // Download image
                const imgRes = await axios({ url: imgUrl, responseType: 'arraybuffer' });
                const watermarked = await applyWatermark(imgRes.data);
                
                const destPath = path.join(destDir, `${id}.png`);
                fs.writeFileSync(destPath, watermarked);
                console.log(`Saved watermarked image to ${id}.png\n`);
            } else {
                console.log(`NO IMAGE FOUND for ${id}\n`);
            }
            
            await new Promise(r => setTimeout(r, 1000)); // anti-bot delay
        } catch (e) {
            console.error(`Error for ${id}: ${e.message}\n`);
        }
    }
    console.log("Done!");
}

run();
