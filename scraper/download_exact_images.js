const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const urls = {
    'oliva-journey': 'https://cdn.holts.com/media/catalog/product/o/l/oliva_8-cigar_assortment_1.jpg',
    'oliva-festive': 'https://www.jrcigars.com/on/demandware.static/-/Sites-master-catalog/default/dw1b418a00/images/large/samplers/OSMEGAPP.png',
    'oliva-taste': 'https://www.cigarsinternational.com/_ui/responsive/common/images/products/large/1OASST51-SP.jpg',
    'nub-calendar': 'https://mycigars.ru/img/Advent-Calendar-2022.webp',
    'oliva-melanio-2024': 'https://smokeinn.com/cdn/shop/files/Oliva-Serie-V-Melanio-Edicion-Ano-2024-Box.jpg',
    'perdomo-connoisseur': 'https://www.holts.com/pub/media/catalog/product/p/e/perdomo-award-winning-connoisseur-collection-12-cigar-sampler.jpg',
    'plasencia-robusto-collection': 'https://cdn.shopify.com/s/files/1/0268/6630/3055/products/plasencia-robusto-collection-sampler.jpg',
    'camacho-best-90': 'https://www.famous-smoke.com/images/products/C/Camacho-Best-Of-10-Cigar-Sampler-1.jpg',
    'fuente-holiday-robusto': 'https://stogiesworldclasscigars.com/wp-content/uploads/2021/04/Arturo-Fuente-5-Cigar-Sampler-1.jpg',
    'fuente-holiday-toro': 'https://cdn11.bigcommerce.com/s-640a4/images/stencil/1280x1280/products/4397/11676/arturo-fuente-sangre-de-toro-sampler__06209.1656536122.jpg',
    'drew-factory-maduro': 'https://www.mikescigars.com/media/catalog/product/f/s/fsmro.jpg',
    'quorum-classic': 'https://www.jrcigars.com/dw/image/v2/BDBL_PRD/on/demandware.static/-/Sites-master-catalog/default/dw1b4020a5/images/cigars/quccto_bundle.jpg',
    'macanudo-ascot': 'https://www.cigarplace.biz/media/catalog/product/m/a/macanudo-cafe-ascot-tin-10-pack.jpg',
    'ryj-mini': 'https://www.cigarsinternational.com/_ui/responsive/common/images/products/ci-rjmm1-pkg-1.jpg'
};

async function applyWatermark(imageBuffer) {
    const stampPath = path.join(__dirname, 'stamp.png');
    const original = sharp(imageBuffer);
    const meta = await original.metadata();
    
    // Validate image format
    if (meta.width < 100 || meta.height < 100) throw new Error("Image too small");

    const stampSize = Math.floor(meta.width * 0.4); // 40% width
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
    
    for (const [id, url] of Object.entries(urls)) {
        console.log(`Downloading ${id}...`);
        try {
            const res = await axios({
                url, 
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                timeout: 10000
            });
            
            const watermarked = await applyWatermark(res.data);
            const destPath = path.join(destDir, `${id}.png`);
            fs.writeFileSync(destPath, watermarked);
            console.log(`Successfully saved ${id}.png`);
        } catch (e) {
            console.error(`Failed on ${id}: ${e.message}`);
        }
    }
}

run();
