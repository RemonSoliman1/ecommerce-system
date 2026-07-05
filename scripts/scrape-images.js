const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqshsyndeupsgfbcpxzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2hzeW5kZXVwc2dmYmNweHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwMDc1MiwiZXhwIjoyMDg1OTc2NzUyfQ.I8vjr6eVF-Si5v9OLuqPcDRdAW7EqUcFEN7QXd7RG6U';
const supabase = createClient(supabaseUrl, supabaseKey);

const imageDir = path.join(__dirname, '../public/images/cigars');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}

// Known duplicated file sizes
const badSizes = new Set([
    2036064, // Behike placeholder
    11882,   // Groundhog placeholder
    681752,  // Humidor placeholder
    14868, 15884, 16241, 16263, 16332, 16797, 17755 // Other duplicates
]);

const puppeteer = require('puppeteer');

// Helper to wait
const delay = ms => new Promise(res => setTimeout(res, ms));

async function findImage(query, browser) {
    try {
        console.log(`  Searching Bing Images for: ${query}`);
        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' cigar white background')}&form=HDRSC2`;
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
        await delay(1500);

        // Find the first image source
        const imgUrl = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img.mimg'));
            for (let el of imgs) {
                const src = el.src || el.dataset.src;
                if (src && src.startsWith('http') && !src.includes('base64')) {
                    return src;
                }
            }
            return null;
        });

        await page.close();
        return imgUrl;
    } catch (e) {
        console.error('  Error finding image:', e.message);
        return null;
    }
}

async function downloadImage(url, filename) {
    const filePath = path.join(imageDir, filename);
    
    if (url.startsWith('data:image')) {
        // It's a base64 image
        const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const buffer = Buffer.from(matches[2], 'base64');
            fs.writeFileSync(filePath, buffer);
            return filePath;
        }
        throw new Error('Invalid base64 image string');
    }

    const writer = fs.createWriteStream(filePath);
    
    const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

async function uploadToSupabase(filePath, filename) {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
        .from('products')
        .upload(`scraped/${filename}`, fileBuffer, {
            contentType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
            upsert: true
        });
        
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(`scraped/${filename}`);
        
    return publicUrlData.publicUrl;
}

async function main() {
    const { data: products } = await supabase.from('products').select('*');
    
    const toUpdate = products.filter(p => {
        if (!p.image || p.image.includes('placeholder')) return true;
        
        if (p.image.startsWith('http')) return false; // Already remote
        
        const localPath = path.join(__dirname, '../public', p.image);
        if (!fs.existsSync(localPath)) return true; // File doesn't exist
        
        const size = fs.statSync(localPath).size;
        return badSizes.has(size); // It's a known generic file
    });
    
    console.log(`Found ${toUpdate.length} products needing new images.`);
    
    // Launch browser once
    const browser = await puppeteer.launch({ headless: 'new' });
    let successCount = 0;
    
    for (const p of toUpdate) {
        console.log(`\nProcessing: ${p.name} (${p.brand_id})`);
        const query = `${p.brand_id.replace(/-/g, ' ')} ${p.name}`;
        
        const url = await findImage(query, browser);
        
        if (url) {
            console.log(`  Found URL: ${url.substring(0, 30)}...`);
            const ext = url.split('.').pop().split('?')[0].substring(0, 4);
            const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase()) ? ext : 'jpg';
            const filename = `${p.brand_id}-${p.id.substring(0, 8)}.${safeExt}`;
            
            try {
                // Download locally
                const localPath = await downloadImage(url, filename);
                console.log(`  Saved locally to ${localPath}`);
                
                // Upload to Supabase
                const publicUrl = await uploadToSupabase(localPath, filename);
                console.log(`  Uploaded to Supabase: ${publicUrl}`);
                
                await supabase.from('products').update({ image: publicUrl }).eq('id', p.id);
                console.log(`  Updated DB for ${p.name}`);
                successCount++;
            } catch(e) {
                console.error('  Failed to download/save:', e.message);
            }
        } else {
            console.log('  No image found.');
        }
    }
    
    await browser.close();
    console.log(`\nDone! Successfully updated ${successCount} images.`);
}

main().catch(console.error);
