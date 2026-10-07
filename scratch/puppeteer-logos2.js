const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');

// Each entry: [outputFilename(s), url, cssSelector for logo image]
const BRANDS = [
    [['camacho'], 'https://www.camachocigars.com/', 'img.logo, .logo img, header img, img[src*="logo"]'],
    [['cohiba'], 'https://www.cohiba.com/', 'img.logo, .logo img, header img, img[src*="logo"]'],
    [['davidoff'], 'https://www.davidoff.com/en-gb/', '.logo img, header img, img[alt*="Davidoff"], img[src*="logo"]'],
    [['montecristo'], 'https://www.montecristocigar.com/', '.logo img, header img, img[src*="logo"]'],
    [['ryj'], 'https://www.romeoyjulieta.com/', '.logo img, header img, img[src*="logo"]'],
    [['padron'], 'https://www.padron.com/', '.logo img, header img, img[src*="logo"]'],
    [['oliva'], 'https://www.olivacigar.com/', '.logo img, header img, img[src*="logo"]'],
    [['rocky-patel'], 'https://www.rockypatel.com/', '.logo img, header img, img[src*="logo"]'],
    [['ashton'], 'https://www.ashtoncigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['cao'], 'https://www.caocigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['alec-bradley'], 'https://www.alecbradley.com/', '.logo img, header img, img[src*="logo"]'],
    [['fuente'], 'https://www.arturofuente.com/', '.logo img, header img, img[src*="logo"]'],
    [['acid'], 'https://acidsmoking.com/', '.logo img, header img, img[src*="logo"]'],
    [['avo'], 'https://www.avocigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['blackened'], 'https://www.blackenedcigar.com/', '.logo img, header img, img[src*="logo"]'],
    [['my-father'], 'https://myfathercigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['h-upmann'], 'https://www.h-upmann.com/', '.logo img, header img, img[src*="logo"]'],
    [['gurkha-cigars'], 'https://www.gurkhacigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['liga', 'liga-privada'], 'https://www.ligaprivada.com/', '.logo img, header img, img[src*="logo"]'],
    [['my-father'], 'https://myfathercigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['el-septimo'], 'https://www.elseptimo.com/', '.logo img, header img, img[src*="logo"]'],
    [['xikar'], 'https://www.xikar.com/', '.logo img, header img, img[src*="logo"]'],
    [['punch'], 'https://www.punchcigars.com/', '.logo img, header img, img[src*="logo"]'],
    [['blackened'], 'https://www.blackenedcigar.com/', '.logo img, header img, img[src*="logo"]'],
    [['20acre'], 'https://www.20acrefarmscigar.com/', '.logo img, header img, img[src*="logo"]'],
    [['kfc'], 'https://www.drewestate.com/brands/kentucky-fire-cured/', '.logo img, header img, img[src*="logo"]'],
    [['java'], 'https://www.drewestate.com/brands/java-cigars/', '.logo img, header img, img[src*="logo"]'],
    [['herrera'], 'https://www.drewstate.com/brands/herrera-esteli/', '.logo img, header img, img[src*="logo"]'],
    [['deadwood'], 'https://www.drewstate.com/brands/deadwood/', '.logo img, header img, img[src*="logo"]'],
    [['acid'], 'https://acidsmoking.com/', '.logo img, header img, img[src*="logo"]'],
    [['liga'], 'https://www.drewstate.com/brands/liga-privada/', '.logo img, header img, img[src*="logo"]'],
];

async function processAndSave(srcBuf, outputPaths) {
    const SIZE = 300;
    const PADDING = 30;
    const INNER = SIZE - PADDING * 2;

    const resized = await sharp(srcBuf)
        .resize(INNER, INNER, { fit: 'inside', withoutEnlargement: false, background: { r: 245, g: 240, b: 232, alpha: 0 } })
        .toBuffer();

    const base = await sharp({
        create: { width: SIZE, height: SIZE, channels: 4, background: { r: 245, g: 240, b: 232, alpha: 1 } }
    })
    .composite([{ input: resized, gravity: 'centre' }])
    .png({ compressionLevel: 8 })
    .toBuffer();

    for (const p of outputPaths) {
        fs.writeFileSync(path.join(OUT_DIR, `${p}.png`), base);
        console.log(`  ✓ Saved ${p}.png`);
    }
    return true;
}

async function tryGetLogoFromPage(page, url, selector) {
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        await page.waitForTimeout(1500);

        // Try to get logo image source
        const logoSrc = await page.evaluate((sel) => {
            const selectors = sel.split(', ');
            for (const s of selectors) {
                const els = document.querySelectorAll(s);
                for (const el of els) {
                    const src = el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src');
                    if (src && !src.includes('placeholder') && !src.includes('pixel') && !src.includes('blank')) {
                        return src;
                    }
                }
            }
            return null;
        }, selector);

        if (logoSrc) return { type: 'url', value: logoSrc };

        // Fallback: screenshot the header area
        const headerEl = await page.$('header, .header, nav, .site-header');
        if (headerEl) {
            const box = await headerEl.boundingBox();
            if (box && box.height > 10 && box.height < 200) {
                const screenshot = await page.screenshot({
                    clip: { x: box.x, y: box.y, width: Math.min(box.width, 500), height: box.height },
                    omitBackground: false
                });
                return { type: 'screenshot', value: screenshot };
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function downloadFromUrl(page, imgUrl, baseUrl) {
    try {
        // Resolve relative URLs
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        if (imgUrl.startsWith('/')) imgUrl = new URL(baseUrl).origin + imgUrl;
        if (imgUrl.startsWith('data:')) {
            // Base64 image
            const match = imgUrl.match(/^data:image\/(\w+);base64,(.+)$/);
            if (match) return Buffer.from(match[2], 'base64');
            return null;
        }
        
        // Download via page to inherit cookies/auth
        const response = await page.goto(imgUrl, { timeout: 10000 });
        if (response && response.ok()) {
            return await response.buffer();
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 1280, height: 800 }
    });

    const results = { success: [], failed: [] };
    const processed = new Set();

    for (const [slugs, url, selector] of BRANDS) {
        const primarySlug = slugs[0];
        if (processed.has(primarySlug)) continue;
        
        console.log(`\nProcessing: ${primarySlug} -> ${url}`);

        const page = await browser.newPage();
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

            const result = await tryGetLogoFromPage(page, url, selector);

            if (!result) {
                console.log('  ✗ No logo found on page');
                results.failed.push(primarySlug);
                continue;
            }

            let buf;
            if (result.type === 'url') {
                console.log(`  Logo URL: ${result.value.substring(0, 80)}`);
                buf = await downloadFromUrl(page, result.value, url);
            } else {
                buf = result.value;
            }

            if (!buf || buf.length < 200) {
                console.log('  ✗ Buffer too small or empty');
                results.failed.push(primarySlug);
                continue;
            }

            await processAndSave(buf, slugs);
            slugs.forEach(s => { processed.add(s); results.success.push(s); });

        } catch (e) {
            console.log(`  ✗ Error: ${e.message}`);
            results.failed.push(primarySlug);
        } finally {
            await page.close();
        }

        await new Promise(r => setTimeout(r, 800));
    }

    await browser.close();

    console.log('\n=== Summary ===');
    console.log(`✓ Success (${results.success.length}):`, results.success.join(', '));
    console.log(`✗ Failed (${results.failed.length}):`, results.failed.join(', '));
}

main().catch(console.error);
