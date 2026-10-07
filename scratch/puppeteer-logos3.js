const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const https = require('https');
const http = require('http');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');

const BRANDS = [
    { slugs: ['camacho'], url: 'https://www.camachocigars.com/' },
    { slugs: ['cohiba'], url: 'https://www.cohiba.com/' },
    { slugs: ['davidoff'], url: 'https://www.davidoff.com/en-gb/' },
    { slugs: ['montecristo'], url: 'https://www.montecristocigar.com/' },
    { slugs: ['ryj'], url: 'https://www.romeoyjulietacigars.com/' },
    { slugs: ['padron'], url: 'https://www.padron.com/' },
    { slugs: ['oliva'], url: 'https://www.olivacigar.com/' },
    { slugs: ['rocky-patel'], url: 'https://www.rockypatel.com/' },
    { slugs: ['ashton'], url: 'https://www.ashtoncigars.com/' },
    { slugs: ['cao'], url: 'https://www.caocigars.com/' },
    { slugs: ['alec-bradley'], url: 'https://www.alecbradley.com/' },
    { slugs: ['fuente'], url: 'https://www.arturofuente.com/' },
    { slugs: ['acid'], url: 'https://acidsmoking.com/' },
    { slugs: ['avo'], url: 'https://www.avocigars.com/' },
    { slugs: ['blackened'], url: 'https://www.blackenedcigar.com/' },
    { slugs: ['my-father'], url: 'https://myfathercigars.com/' },
    { slugs: ['h-upmann'], url: 'https://www.h-upmann.com/' },
    { slugs: ['gurkha-cigars'], url: 'https://www.gurkhacigars.com/' },
    { slugs: ['liga', 'liga-privada'], url: 'https://www.drewestate.com/brands/liga-privada/' },
    { slugs: ['el-septimo'], url: 'https://www.elseptimo.com/' },
    { slugs: ['xikar'], url: 'https://www.xikar.com/' },
    { slugs: ['punch'], url: 'https://www.punchcigars.com/' },
    { slugs: ['20acre'], url: 'https://www.20acrefarmscigar.com/' },
    { slugs: ['kfc'], url: 'https://www.drewestate.com/brands/kentucky-fire-cured/' },
    { slugs: ['java'], url: 'https://www.drewestate.com/brands/java-cigars/' },
    { slugs: ['herrera'], url: 'https://www.drewestate.com/brands/herrera-esteli/' },
    { slugs: ['deadwood'], url: 'https://www.drewestate.com/brands/deadwood/' },
    { slugs: ['la-aroma-de-cuba'], url: 'https://www.myfather.com/la-aroma-de-cuba/' },
    { slugs: ['pappy'], url: 'https://www.pappyvancigars.com/' },
    { slugs: ['nica'], url: 'https://www.drewestate.com/brands/nica-rustica/' },
    { slugs: ['e-p-carrillo'], url: 'https://www.epcarrillocigars.com/' },
    { slugs: ['san-cristobal'], url: 'https://www.joseladreams.com/san-cristobal/' },
    { slugs: ['padilla'], url: 'https://padillacigars.com/' },
    { slugs: ['zino'], url: 'https://www.davidoff.com/en-gb/cigar/zino/' },
];

function fetchBuf(url, referer) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
                'Accept': 'image/webp,image/png,image/*,*/*',
                'Referer': referer || url,
            },
            timeout: 15000,
        }, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                let loc = res.headers.location;
                if (!loc) return reject(new Error('Redirect no location'));
                if (loc.startsWith('/')) loc = parsed.origin + loc;
                res.destroy();
                return resolve(fetchBuf(loc, referer));
            }
            if (res.statusCode !== 200) { res.destroy(); return reject(new Error(`HTTP ${res.statusCode}`)); }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function processLogo(buf, outputPaths) {
    const SIZE = 300;
    const INNER = 240;
    const resized = await sharp(buf)
        .resize(INNER, INNER, { fit: 'inside', withoutEnlargement: false })
        .toBuffer();

    const base = await sharp({
        create: { width: SIZE, height: SIZE, channels: 4, background: { r: 245, g: 240, b: 232, alpha: 1 } }
    })
    .composite([{ input: resized, gravity: 'centre' }])
    .png({ compressionLevel: 8 })
    .toBuffer();

    for (const p of outputPaths) {
        const outPath = path.join(OUT_DIR, `${p}.png`);
        fs.writeFileSync(outPath, base);
        console.log(`  ✓ Saved ${p}.png`);
    }
}

async function scrapeLogoUrl(page, siteUrl) {
    try {
        const response = await page.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await page.waitForTimeout(3000);

        // Find logo img URLs from the DOM — look at all images in first 500px of page
        const logoUrl = await page.evaluate(() => {
            // Priority 1: Elements with logo in class/id/alt/src
            const logoSelectors = [
                'a.logo img', '.logo img', '.site-logo img', '#logo img',
                'header img[src*="logo"]', 'nav img[src*="logo"]',
                'img[alt*="logo" i]', 'img[alt*="Logo" i]',
                'img[class*="logo" i]', 'img[id*="logo" i]',
                'img[src*="logo"]', 'img[src*="brand"]',
                '.header img', '.site-header img',
                'a[href="/"] img',
            ];

            for (const sel of logoSelectors) {
                const els = document.querySelectorAll(sel);
                for (const el of els) {
                    const src = el.src || el.currentSrc || el.getAttribute('data-src');
                    if (src && src.length > 10 && !src.includes('placeholder') && !src.endsWith('spacer.gif')) {
                        // Skip tiny images (tracking pixels)
                        if (el.naturalWidth > 20 || el.width > 20 || el.getAttribute('width') > 20) {
                            return src;
                        }
                    }
                }
            }

            // Priority 2: SVG logos inline
            const svgs = document.querySelectorAll('header svg, .logo svg, .site-logo svg, nav svg');
            for (const svg of svgs) {
                const box = svg.getBoundingClientRect();
                if (box.width > 20 && box.height > 10) {
                    const svgStr = new XMLSerializer().serializeToString(svg);
                    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
                }
            }

            return null;
        });

        return logoUrl;
    } catch (e) {
        console.log(`  Page error: ${e.message.substring(0, 80)}`);
        return null;
    }
}

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security'],
        defaultViewport: { width: 1280, height: 900 }
    });

    const results = { success: [], failed: [] };
    const done = new Set();

    for (const { slugs, url } of BRANDS) {
        const key = slugs[0];
        if (done.has(key)) continue;
        console.log(`\n[${key}] -> ${url}`);

        const page = await browser.newPage();
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

            const logoUrl = await scrapeLogoUrl(page, url);

            if (!logoUrl) {
                console.log('  ✗ No logo URL found');
                results.failed.push(key);
                continue;
            }

            console.log(`  Logo: ${logoUrl.substring(0, 100)}`);

            let buf;
            if (logoUrl.startsWith('data:image/svg+xml;base64,')) {
                // Convert SVG to PNG via sharp
                const svgBase64 = logoUrl.replace('data:image/svg+xml;base64,', '');
                const svgBuf = Buffer.from(svgBase64, 'base64');
                buf = await sharp(svgBuf, { density: 300 }).resize(300, 300, { fit: 'inside' }).png().toBuffer();
            } else {
                // Download image via puppeteer page (inherits cookies)
                const imgResponse = await page.goto(logoUrl, { timeout: 10000 });
                if (imgResponse && imgResponse.ok()) {
                    buf = await imgResponse.buffer();
                } else {
                    // Fallback - direct fetch
                    buf = await fetchBuf(logoUrl, url).catch(() => null);
                }
            }

            if (!buf || buf.length < 200) {
                console.log(`  ✗ Buffer empty or too small (${buf?.length ?? 0})`);
                results.failed.push(key);
                continue;
            }

            await processLogo(buf, slugs);
            slugs.forEach(s => done.add(s));
            results.success.push(...slugs);

        } catch (e) {
            console.log(`  ✗ Error: ${e.message.substring(0, 100)}`);
            results.failed.push(key);
        } finally {
            await page.close();
        }

        await new Promise(r => setTimeout(r, 600));
    }

    await browser.close();

    console.log('\n===== SUMMARY =====');
    console.log(`✓ Success (${results.success.length}): ${results.success.join(', ')}`);
    console.log(`✗ Failed  (${results.failed.length}): ${results.failed.join(', ')}`);
}

main().catch(console.error);
