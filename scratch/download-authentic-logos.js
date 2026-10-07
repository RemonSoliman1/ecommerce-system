const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// A reliable mapping of requested brands to authentic CDN / Wikimedia URLs
const LOGO_SOURCES = {
    '20acre': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/20-acre-farm.png',
        'https://www.famous-smoke.com/files/brandlogos/20-acre-farm.gif'
    ],
    'acid': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/acid.png',
        'https://upload.wikimedia.org/wikipedia/en/9/91/Acid_Cigars_logo.png'
    ],
    'alec-bradley': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/alec-bradley.png'
    ],
    'arturo-fuente': [
        'https://upload.wikimedia.org/wikipedia/commons/6/6a/Arturo_Fuente_logo.svg',
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/arturo-fuente.png'
    ],
    'ashton': [
        'https://upload.wikimedia.org/wikipedia/commons/c/cc/Ashton_Cigars_logo.svg',
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/ashton.png'
    ],
    'audew': [
        'https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/e/AmazonStores/ATVPDKIKX0DER/8126b856-11f4-411a-82ee-06b29f7902ba.jpg'
    ],
    'avo': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/avo.png'
    ],
    'blackened': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/blackened.png'
    ],
    'camacho': [
        'https://upload.wikimedia.org/wikipedia/commons/c/ca/Camacho_Cigars_logo.svg',
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/camacho.png'
    ],
    'cao': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/cao.png'
    ],
    'chateau-diadem': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/chateau-diadem.png'
    ],
    'cohiba': [
        'https://upload.wikimedia.org/wikipedia/en/3/33/Cohiba_logo.svg'
    ],
    'davidoff': [
        'https://upload.wikimedia.org/wikipedia/commons/0/06/Davidoff_logo.svg'
    ],
    'deadwood': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/deadwood.png'
    ],
    'drew-estate': [
        'https://upload.wikimedia.org/wikipedia/commons/1/14/Drew_Estate_Logo.svg',
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/drew-estate.png'
    ],
    'e-p-carrillo': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/ep-carrillo.png'
    ],
    'oliva': [
        'https://www.cigarpage.com/media/wysiwyg/brand-logos/oliva.png'
    ]
};

// Map alternate slugs to the primary ones so they are duplicated if successful
const ALIASES = {
    '20-acre-farm': '20acre',
    'fuente': 'arturo-fuente',
    'liga-privada': 'drew-estate', // fallback drew estate logo for liga
    'liga': 'drew-estate'
};

function downloadUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            },
            timeout: 10000
        }, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode)) {
                let loc = res.headers.location;
                if (loc.startsWith('/')) loc = new URL(url).origin + loc;
                res.destroy();
                return resolve(downloadUrl(loc));
            }
            if (res.statusCode !== 200) {
                res.destroy();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            
            // Validate content type is image
            const contentType = res.headers['content-type'] || '';
            if (contentType.includes('text/html') || contentType.includes('text/plain')) {
                res.destroy();
                return reject(new Error(`Invalid content type: ${contentType}`));
            }

            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ buffer: Buffer.concat(chunks), type: contentType }));
            res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function main() {
    console.log('Starting authentic logo downloads...');
    const results = { success: [], failed: [] };

    for (const [slug, urls] of Object.entries(LOGO_SOURCES)) {
        let success = false;
        
        for (const url of urls) {
            console.log(`[${slug}] Trying ${url}`);
            try {
                const { buffer, type } = await downloadUrl(url);
                if (buffer.length < 500) throw new Error('File too small, likely error page');
                
                // Determine extension
                let ext = '.png';
                if (url.endsWith('.svg') || type.includes('svg')) ext = '.svg';
                else if (url.endsWith('.jpg') || url.endsWith('.jpeg') || type.includes('jpeg')) ext = '.jpg';
                else if (url.endsWith('.gif') || type.includes('gif')) ext = '.gif';
                else if (url.endsWith('.webp') || type.includes('webp')) ext = '.webp';

                const filepath = path.join(OUT_DIR, `${slug}${ext}`);
                fs.writeFileSync(filepath, buffer);
                console.log(`  ✓ Saved ${slug}${ext}`);
                success = true;
                
                // Copy for aliases
                for (const [alias, target] of Object.entries(ALIASES)) {
                    if (target === slug) {
                        fs.copyFileSync(filepath, path.join(OUT_DIR, `${alias}${ext}`));
                        console.log(`  ✓ Copied alias ${alias}${ext}`);
                    }
                }
                break; // Stop trying URLs for this slug
            } catch (err) {
                console.log(`  ✗ Failed: ${err.message}`);
            }
        }
        
        if (success) {
            results.success.push(slug);
        } else {
            results.failed.push(slug);
        }
    }
    
    console.log('\n========================================');
    console.log('SUMMARY: Authentic Logo Downloads');
    console.log('========================================');
    console.log(`✓ SUCCESSFULLY DOWNLOADED (${results.success.length}):`);
    console.log(results.success.join(', '));
    console.log(`\n✗ FAILED / MISSING ASSETS (${results.failed.length}):`);
    console.log(results.failed.join(', '));
    console.log('========================================');
    console.log('NOTE: Please supply the missing assets manually by uploading them to public/images/brands/');
}

main().catch(console.error);
