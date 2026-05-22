require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // handle redirect
                downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(destPath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function run() {
    console.log("Fetching products from Supabase...");
    const { data: products, error } = await supabase.from('products').select('id, name, image');
    if (error) {
        console.error("Failed to fetch products:", error);
        return;
    }

    const supabaseDomain = supabaseUrl.replace('https://', '').replace('http://', '');
    let count = 0;

    for (const product of products) {
        if (product.image && product.image.startsWith('http') && !product.image.includes(supabaseDomain)) {
            console.log(`Downloading image for: ${product.name}`);
            const folderPath = path.join(__dirname, 'downloads', product.id);
            
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Guess extension
            let ext = 'jpg';
            if (product.image.includes('.png')) ext = 'png';
            if (product.image.includes('.webp')) ext = 'webp';

            const filePath = path.join(folderPath, `photo.${ext}`);
            try {
                await downloadImage(product.image, filePath);
                console.log(`  -> Saved to scraper/downloads/${product.id}/photo.${ext}`);
                count++;
            } catch (err) {
                console.error(`  -> Failed to download ${product.name}: ${err.message}`);
            }
        }
    }
    console.log(`\nDone! Downloaded ${count} images to the scraper/downloads/ directory.`);
}

run();
