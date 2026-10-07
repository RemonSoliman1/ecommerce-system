/**
 * puppeteer-brand-logos.js
 * Uses Puppeteer to fetch actual logo images from official brand sites and directories.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');

// Direct PNG/WEBP URLs from Cigar Page / Cigars.com which serve real logos
const BRAND_LOGOS = [
    // Slug in public/images/brands, URL
    ['camacho', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/camacho.png'],
    ['cohiba', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/cohiba.png'],
    ['davidoff', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/davidoff.png'],
    ['montecristo', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/montecristo.png'],
    ['ryj', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/romeo-y-julieta.png'],
    ['padron', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/padron.png'],
    ['oliva', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/oliva.png'],
    ['rocky-patel', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/rocky-patel.png'],
    ['ashton', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/ashton.png'],
    ['cao', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/cao.png'],
    ['alec-bradley', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/alec-bradley.png'],
    ['fuente', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/arturo-fuente.png'],
    ['acid', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/acid.png'],
    ['avo', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/avo.png'],
    ['blackened', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/blackened.png'],
    ['my-father', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/my-father.png'],
    ['punch', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/punch.png'],
    ['h-upmann', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/h-upmann.png'],
    ['gurkha-cigars', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/gurkha.png'],
    ['liga', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/liga-privada.png'],
    ['e-p-carrillo', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/ep-carrillo.png'],
    ['el-septimo', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/el-septimo.png'],
    ['san-cristobal', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/san-cristobal.png'],
    ['padilla', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/padilla.png'],
    ['zino', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/zino.png'],
    ['deadwood', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/deadwood.png'],
    ['herrera', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/herrera-esteli.png'],
    ['kfc', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/kentucky-fire-cured.png'],
    ['la-aroma-de-cuba', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/la-aroma-de-cuba.png'],
    ['java', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/java.png'],
    ['pappy', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/pappy-van-winkle.png'],
    ['20acre', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/20-acre-farm.png'],
    ['xikar', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/xikar.png'],
    ['liga', 'https://www.cigarpage.com/media/wysiwyg/brand-logos/liga-privada.png'],
];

// Alternative URLs from brand websites
const BRAND_ALTERNATIVE = {
    'camacho': 'https://www.camachocigars.com/images/logo.png',
    'davidoff': 'https://www.davidoff.com/on/demandware.static/-/Library-Sites-DavidoffSharedLibrary/default/dw2e3d6fe4/images/common/logo.svg',
    'cohiba': 'https://upload.wikimedia.org/wikipedia/en/3/33/Cohiba_logo.svg',
    'montecristo': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Montecristo_cigar_logo.svg',
};

async function downloadWithPuppeteer(browser, slug, searchQuery) {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        
        // Try Google image search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' cigar brand logo transparent')}&tbm=isch&tbs=ic:trans`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Click first image
        const firstImg = await page.$('div[data-ri="0"] img, .rg_i');
        if (!firstImg) return null;
        
        const src = await page.evaluate(img => img.src, firstImg);
        return src;
    } catch (e) {
        console.log(`  Puppeteer error for ${slug}: ${e.message}`);
        return null;
    } finally {
        await page.close();
    }
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
                'Accept': 'image/png,image/webp,image/*,*/*',
                'Referer': 'https://www.google.com/'
            },
            timeout: 15000
        }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                let loc = res.headers.location;
                if (loc.startsWith('/')) loc = new URL(url).origin + loc;
                res.destroy();
                return resolve(fetchUrl(loc));
            }
            if (res.statusCode !== 200) {
                res.destroy();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function saveProcessedLogo(buf, outputPath) {
    const SIZE = 300;
    const PADDING = 30;
    const INNER = SIZE - PADDING * 2;

    const resized = await sharp(buf)
        .resize(INNER, INNER, { fit: 'inside', withoutEnlargement: false })
        .toBuffer();

    const base = await sharp({
        create: { width: SIZE, height: SIZE, channels: 4, background: { r: 245, g: 240, b: 232, alpha: 1 } }
    })
    .composite([{ input: resized, gravity: 'centre' }])
    .png({ compressionLevel: 8 })
    .toBuffer();

    fs.writeFileSync(outputPath, base);
}

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched\n');

    const results = { success: [], failed: [] };

    for (const [slug, url] of BRAND_LOGOS) {
        const outPath = path.join(OUT_DIR, `${slug}.png`);
        console.log(`Processing: ${slug} -> ${url.substring(0, 60)}...`);

        try {
            const buf = await fetchUrl(url);
            if (buf.length < 500) throw new Error(`Too small: ${buf.length} bytes`);
            
            await saveProcessedLogo(buf, outPath);
            console.log(`  ✓ Saved (${buf.length} bytes)`);
            results.success.push(slug);
        } catch (err) {
            console.log(`  ✗ Failed: ${err.message}`);
            
            // Try with Puppeteer
            const brandName = slug.replace(/-/g, ' ');
            const imgSrc = await downloadWithPuppeteer(browser, slug, brandName);
            if (imgSrc && imgSrc.startsWith('http')) {
                try {
                    const buf = await fetchUrl(imgSrc);
                    await saveProcessedLogo(buf, outPath);
                    console.log(`  ✓ Saved via Puppeteer`);
                    results.success.push(slug);
                } catch (e2) {
                    console.log(`  ✗ Puppeteer also failed: ${e2.message}`);
                    results.failed.push(slug);
                }
            } else {
                results.failed.push(slug);
            }
        }

        await new Promise(r => setTimeout(r, 500));
    }

    await browser.close();

    console.log('\n=== Summary ===');
    console.log(`✓ Success (${results.success.length}):`, results.success.join(', '));
    console.log(`✗ Failed (${results.failed.length}):`, results.failed.join(', '));
}

main().catch(console.error);
