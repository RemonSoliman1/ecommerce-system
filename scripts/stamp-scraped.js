require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching recently scraped images to watermark...");
    
    // Find products with 'scraped/' in their image URL
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .like('image', '%/scraped/%');

    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    console.log(`Found ${products.length} products to watermark.`);
    
    const stampPath = path.join(__dirname, '..', 'scraper', 'stamp.png');
    const stampBuffer = fs.readFileSync(stampPath);

    for (const p of products) {
        try {
            console.log(`\nProcessing: ${p.name}`);
            
            // 1. Download image buffer
            const res = await fetch(p.image);
            if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
            const arrayBuffer = await res.arrayBuffer();
            const originalBuffer = Buffer.from(arrayBuffer);

            // 2. Apply watermark
            const metadata = await sharp(originalBuffer).metadata();
            const w = metadata.width;
            const h = metadata.height;
            
            let finalBuffer = originalBuffer;
            
            if (w > 50 && h > 50) {
                const stampSize = Math.floor(Math.min(w, h) * 0.4);
                const resizedStamp = await sharp(stampBuffer).resize({ width: stampSize }).toBuffer();
                const stampMeta = await sharp(resizedStamp).metadata();
                
                const left = Math.floor((w - stampSize) / 2);
                const top = Math.floor((h - stampMeta.height) / 2);
                
                finalBuffer = await sharp(originalBuffer)
                    .composite([{
                        input: resizedStamp,
                        top,
                        left,
                        blend: 'over'
                    }])
                    .toFormat(metadata.format === 'png' ? 'png' : 'jpeg')
                    .toBuffer();
            } else {
                console.log(`  Image too small to stamp (${w}x${h})`);
                continue;
            }

            // 3. Re-upload to Supabase, replacing the existing file
            const urlParts = p.image.split('/');
            const filename = urlParts[urlParts.length - 1];
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('products')
                .upload(`scraped/${filename}`, finalBuffer, {
                    contentType: metadata.format === 'png' ? 'image/png' : 'image/jpeg',
                    upsert: true
                });
                
            if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);
            
            // 4. Update local file as well
            const localPath = path.join(__dirname, '..', 'public', 'images', 'cigars', filename);
            if (fs.existsSync(localPath)) {
                fs.writeFileSync(localPath, finalBuffer);
                console.log(`  Updated local file: ${localPath}`);
            }

            console.log(`  Successfully watermarked and updated.`);
            
        } catch (e) {
            console.error(`  Error processing ${p.name}:`, e.message);
        }
    }
    console.log("\nDone!");
}

main();
