/**
 * fetch-brand-logos.js
 * Downloads real brand logos from various sources.
 * Saves processed PNGs to public/images/brands/
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Map of brand slug -> list of candidate logo URLs to try (in order)
const BRAND_LOGOS = {
    'camacho': [
        'https://www.neptunecigar.com/graphics/brands/camacho.png',
        'https://www.cigarbid.com/skin/frontend/enterprise/default/images/brands/camacho.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Camacho_Cigars_logo.svg/320px-Camacho_Cigars_logo.svg.png',
        'https://www.famous-smoke.com/files/brandlogos/camacho.gif',
    ],
    'cohiba': [
        'https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Cohiba_logo.svg/320px-Cohiba_logo.svg.png',
        'https://www.neptunecigar.com/graphics/brands/cohiba.png',
        'https://www.famous-smoke.com/files/brandlogos/cohiba.gif',
    ],
    'davidoff': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Davidoff_logo.svg/320px-Davidoff_logo.svg.png',
        'https://www.neptunecigar.com/graphics/brands/davidoff.png',
    ],
    'montecristo': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Montecristo_cigar_logo.svg/320px-Montecristo_cigar_logo.svg.png',
        'https://www.neptunecigar.com/graphics/brands/montecristo.png',
        'https://www.famous-smoke.com/files/brandlogos/montecristo.gif',
    ],
    'romeo-y-julieta': [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Romeo_y_Julieta_cigar_logo.svg/320px-Romeo_y_Julieta_cigar_logo.svg.png',
        'https://www.neptunecigar.com/graphics/brands/romeo-y-julieta.png',
    ],
    'padron': [
        'https://www.neptunecigar.com/graphics/brands/padron.png',
        'https://www.famous-smoke.com/files/brandlogos/padron.gif',
        'https://media.cigaraficionado.com/sites/default/files/styles/brand_logo/public/padron.png',
    ],
    'oliva': [
        'https://www.neptunecigar.com/graphics/brands/oliva.png',
        'https://www.famous-smoke.com/files/brandlogos/oliva.gif',
    ],
    'rocky-patel': [
        'https://www.neptunecigar.com/graphics/brands/rocky-patel.png',
        'https://www.famous-smoke.com/files/brandlogos/rocky-patel.gif',
    ],
    'ashton': [
        'https://www.neptunecigar.com/graphics/brands/ashton.png',
        'https://www.famous-smoke.com/files/brandlogos/ashton.gif',
    ],
    'cao': [
        'https://www.neptunecigar.com/graphics/brands/cao.png',
        'https://www.famous-smoke.com/files/brandlogos/cao.gif',
    ],
    'alec-bradley': [
        'https://www.neptunecigar.com/graphics/brands/alec-bradley.png',
        'https://www.famous-smoke.com/files/brandlogos/alec-bradley.gif',
    ],
    'arturo-fuente': [
        'https://www.neptunecigar.com/graphics/brands/arturo-fuente.png',
        'https://www.famous-smoke.com/files/brandlogos/arturo-fuente.gif',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Arturo_Fuente_logo.svg/320px-Arturo_Fuente_logo.svg.png',
    ],
    'acid': [
        'https://www.neptunecigar.com/graphics/brands/acid.png',
        'https://www.famous-smoke.com/files/brandlogos/acid-cigars.gif',
    ],
    'avo': [
        'https://www.neptunecigar.com/graphics/brands/avo.png',
        'https://www.famous-smoke.com/files/brandlogos/avo.gif',
    ],
    'blackened': [
        'https://www.neptunecigar.com/graphics/brands/blackened.png',
        'https://www.famous-smoke.com/files/brandlogos/blackened.gif',
    ],
    'my-father': [
        'https://www.neptunecigar.com/graphics/brands/my-father.png',
        'https://www.famous-smoke.com/files/brandlogos/my-father.gif',
    ],
    'punch': [
        'https://www.neptunecigar.com/graphics/brands/punch.png',
        'https://www.famous-smoke.com/files/brandlogos/punch.gif',
    ],
    'h-upmann': [
        'https://www.neptunecigar.com/graphics/brands/h-upmann.png',
        'https://www.famous-smoke.com/files/brandlogos/h-upmann.gif',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/H_Upmann_Logo.svg/320px-H_Upmann_Logo.svg.png',
    ],
    'gurkha-cigars': [
        'https://www.neptunecigar.com/graphics/brands/gurkha.png',
        'https://www.famous-smoke.com/files/brandlogos/gurkha.gif',
    ],
    'liga-privada': [
        'https://www.neptunecigar.com/graphics/brands/liga-privada.png',
        'https://www.famous-smoke.com/files/brandlogos/liga-privada.gif',
    ],
    'e-p-carrillo': [
        'https://www.neptunecigar.com/graphics/brands/ep-carrillo.png',
        'https://www.famous-smoke.com/files/brandlogos/ep-carrillo.gif',
    ],
    'el-septimo': [
        'https://www.neptunecigar.com/graphics/brands/el-septimo.png',
        'https://www.famous-smoke.com/files/brandlogos/el-septimo.gif',
    ],
    'san-cristobal': [
        'https://www.neptunecigar.com/graphics/brands/san-cristobal.png',
        'https://www.famous-smoke.com/files/brandlogos/san-cristobal.gif',
    ],
    'padilla': [
        'https://www.neptunecigar.com/graphics/brands/padilla.png',
        'https://www.famous-smoke.com/files/brandlogos/padilla.gif',
    ],
    'zino': [
        'https://www.neptunecigar.com/graphics/brands/zino.png',
        'https://www.famous-smoke.com/files/brandlogos/zino.gif',
    ],
    'chateau-diadem': [
        'https://www.neptunecigar.com/graphics/brands/chateau-diadem.png',
        'https://www.famous-smoke.com/files/brandlogos/chateau-diadem.gif',
    ],
    'deadwood': [
        'https://www.neptunecigar.com/graphics/brands/deadwood.png',
        'https://www.famous-smoke.com/files/brandlogos/deadwood.gif',
    ],
    'herrera-esteli': [
        'https://www.neptunecigar.com/graphics/brands/herrera-esteli.png',
        'https://www.famous-smoke.com/files/brandlogos/herrera-esteli.gif',
    ],
    'kentucky-fire-cured': [
        'https://www.neptunecigar.com/graphics/brands/kentucky-fire-cured.png',
        'https://www.famous-smoke.com/files/brandlogos/kentucky-fire-cured.gif',
    ],
    'la-aroma-de-cuba': [
        'https://www.neptunecigar.com/graphics/brands/la-aroma-de-cuba.png',
        'https://www.famous-smoke.com/files/brandlogos/la-aroma-de-cuba.gif',
    ],
    'java': [
        'https://www.neptunecigar.com/graphics/brands/java.png',
        'https://www.famous-smoke.com/files/brandlogos/java.gif',
    ],
    'pappy-van-winkle': [
        'https://www.neptunecigar.com/graphics/brands/pappy-van-winkle.png',
        'https://www.famous-smoke.com/files/brandlogos/pappy-van-winkle.gif',
    ],
    '20-acre-farm': [
        'https://www.neptunecigar.com/graphics/brands/20-acre-farm.png',
        'https://www.famous-smoke.com/files/brandlogos/20-acre-farm.gif',
    ],
    'xikar': [
        'https://www.neptunecigar.com/graphics/brands/xikar.png',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/XIKAR_logo.svg/320px-XIKAR_logo.svg.png',
    ],
    'fuente': [
        'https://www.neptunecigar.com/graphics/brands/arturo-fuente.png',
        'https://www.famous-smoke.com/files/brandlogos/arturo-fuente.gif',
    ],
};

// Name-based slug overrides for data.js brand IDs that differ
const SLUG_MAPPING = {
    'fuente': 'fuente',       // Arturo Fuente in data.js
    'ryj': 'romeo-y-julieta', // Romeo y Julieta maps to ryj.png
    'herrera': 'herrera-esteli',
    'kfc': 'kentucky-fire-cured',
    'nica': 'nica-rustica',
    'liga': 'liga-privada',
    'la-aroma-de-cuba': 'la-aroma-de-cuba',
    'my-father': 'my-father',
    '20acre': '20-acre-farm',
};

// Fetch binary data from URL with redirect handling
function fetchBinary(url, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) return reject(new Error('Too many redirects'));
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            },
            timeout: 10000,
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (redirectUrl.startsWith('/')) {
                    const parsed = new URL(url);
                    redirectUrl = parsed.origin + redirectUrl;
                }
                res.destroy();
                return resolve(fetchBinary(redirectUrl, redirectCount + 1));
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

// Process the downloaded logo with sharp
async function processLogo(inputBuf, outputPath) {
    const meta = await sharp(inputBuf).metadata();
    
    // Create a white circle background plate, place logo centered with padding
    const SIZE = 300;
    const PADDING = 30;
    const INNER = SIZE - PADDING * 2;

    // Resize logo maintaining aspect ratio to fit within INNER x INNER
    const resized = await sharp(inputBuf)
        .resize(INNER, INNER, { fit: 'inside', withoutEnlargement: false })
        .toBuffer();

    const resizedMeta = await sharp(resized).metadata();

    // Composite onto a white circle background
    const base = await sharp({
        create: {
            width: SIZE,
            height: SIZE,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    })
    .composite([{
        input: resized,
        gravity: 'centre'
    }])
    .png({ compressionLevel: 8 })
    .toBuffer();

    fs.writeFileSync(outputPath, base);
    return { width: SIZE, height: SIZE };
}

async function downloadBrand(slug, filenames, urls) {
    for (const filename of filenames) {
        const outPath = path.join(OUT_DIR, filename);
        
        for (const url of urls) {
            try {
                console.log(`  Trying: ${url.substring(0, 80)}...`);
                const buf = await fetchBinary(url);
                if (buf.length < 500) {
                    console.log(`  ✗ Too small (${buf.length} bytes), trying next`);
                    continue;
                }
                
                // Validate it's actually an image
                try {
                    await processLogo(buf, outPath);
                    console.log(`  ✓ Saved ${filename} (${buf.length} bytes)`);
                    return true;
                } catch (sharpErr) {
                    console.log(`  ✗ Invalid image: ${sharpErr.message}`);
                }
            } catch (err) {
                console.log(`  ✗ Failed: ${err.message}`);
            }
        }
    }
    console.log(`  ⚠ No logo found for ${slug}, keeping existing`);
    return false;
}

async function main() {
    console.log('Starting brand logo download...\n');
    
    const results = { success: [], failed: [] };
    
    for (const [brandSlug, urls] of Object.entries(BRAND_LOGOS)) {
        console.log(`Processing: ${brandSlug}`);
        
        // Figure out which filename(s) to write
        const filenames = [];
        
        // Direct match
        filenames.push(`${brandSlug}.png`);
        
        // Also write to any slug-mapped filenames
        for (const [fileSlug, mappedSlug] of Object.entries(SLUG_MAPPING)) {
            if (mappedSlug === brandSlug) {
                filenames.push(`${fileSlug}.png`);
            }
        }
        
        const ok = await downloadBrand(brandSlug, filenames, urls);
        if (ok) results.success.push(brandSlug);
        else results.failed.push(brandSlug);
        
        // Small delay to be polite
        await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('\n=== Summary ===');
    console.log(`✓ Success (${results.success.length}):`, results.success.join(', '));
    console.log(`✗ Failed (${results.failed.length}):`, results.failed.join(', '));
}

main().catch(console.error);
