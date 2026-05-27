const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

puppeteer.use(StealthPlugin());

const urls = {
    'oliva-journey': 'https://www.jrcigars.com/dw/image/v2/BDBL_PRD/on/demandware.static/-/Sites-master-catalog/default/dw2c2538cb/images/large/samplers/OLOS-1.jpg',
    'oliva-festive': 'https://www.jrcigars.com/on/demandware.static/-/Sites-master-catalog/default/dw1b418a00/images/large/samplers/OSMEGAPP.png',
    'oliva-taste': 'https://www.cigarsinternational.com/_ui/responsive/common/images/products/large/1OASST51-SP.jpg',
    'nub-calendar': 'https://s.yimg.com/fz/api/res/1.2/6f0LhOXYF1P_wJ5h_b7OaQ--~C/YXBwaWQ9c3JjaGRkO2ZpPWZpdDtoPTEzMDtxPTgwO3c9MTc3/https://s.yimg.com/zb/imgv1/095cf26d-92d9-3f0e-b7d1-e6e1cdfa2a5a/t_500x300', // backup yahoo image
    'oliva-melanio-2024': 'https://smokeinn.com/cdn/shop/files/Oliva-Serie-V-Melanio-Edicion-Ano-2024-Box.jpg',
    'perdomo-connoisseur': 'https://www.jrcigars.com/dw/image/v2/BDBL_PRD/on/demandware.static/-/Sites-master-catalog/default/dw9555c45b/images/large/samplers/PCCESM.jpg',
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
    
    if (meta.width < 100) return imageBuffer;

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
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'] 
    });
    
    for (const [id, url] of Object.entries(urls)) {
        console.log(`Downloading ${id}...`);
        const page = await browser.newPage();
        try {
            await page.setViewport({width: 1200, height: 800});
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Navigate directly to the image URL
            const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            if (response && response.status() === 200) {
                // Get buffer directly from the Puppeteer Response object!
                const buffer = await response.buffer();
                const watermarked = await applyWatermark(buffer);
                fs.writeFileSync(path.join(destDir, `${id}.png`), watermarked);
                console.log(`Successfully saved ${id}.png`);
            } else {
                console.log(`Failed with status ${response ? response.status() : 'unknown'}`);
            }
        } catch (e) {
            console.error(`Error on ${id}: ${e.message}`);
        }
        await page.close();
        await new Promise(r => setTimeout(r, 2000)); // Delay to prevent rapid firing
    }
    
    await browser.close();
}

run();
