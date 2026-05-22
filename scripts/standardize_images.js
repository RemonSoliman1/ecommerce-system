const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function standardizeImages() {
    console.log("Starting Image Standardization Process...");

    const stampPath = path.join(__dirname, '..', 'scraper', 'stamp.png');
    let stampBuffer;
    try {
        stampBuffer = await fs.readFile(stampPath);
    } catch (e) {
        console.error("Could not find stamp.png at", stampPath);
        return;
    }

    const { data: products, error } = await supabase.from('products').select('id, name, image, images');
    if (error) {
        console.error("Failed to fetch products:", error);
        return;
    }

    const supabaseDomain = supabaseUrl.replace('https://', '').replace('http://', '');
    let updatedCount = 0;

    for (const product of products) {
        if (!product.image) continue;

        // Only process images hosted on our Supabase Storage to avoid double-watermarking local ones
        if (product.image.includes(supabaseDomain) && product.image.includes('/storage/v1/object/public/')) {
            console.log(`Processing: ${product.name}`);
            
            try {
                // 1. Download the current (un-watermarked) image from Supabase Storage
                const response = await fetch(product.image);
                if (!response.ok) throw new Error(`HTTP ${response.status} fetching image`);
                
                const arrayBuffer = await response.arrayBuffer();
                const originalBuffer = Buffer.from(arrayBuffer);

                // 2. Apply Watermark using Sharp
                const metadata = await sharp(originalBuffer).metadata();
                const w = metadata.width;
                const h = metadata.height;

                if (w > 250 && h > 250) {
                    const stampSize = Math.floor(w * 0.4);
                    const resizedStamp = await sharp(stampBuffer).resize({ width: stampSize }).toBuffer();
                    const stampMeta = await sharp(resizedStamp).metadata();
                    
                    const left = Math.floor((w - stampSize) / 2);
                    const top = Math.floor((h - stampMeta.height) / 2);
                    
                    const compositedBuffer = await sharp(originalBuffer)
                        .composite([{
                            input: resizedStamp,
                            top,
                            left,
                            blend: 'over'
                        }])
                        .toFormat(metadata.format === 'png' ? 'png' : 'jpeg')
                        .toBuffer();

                    // 3. Upload the watermarked image back to Supabase
                    // Extract the path from the URL
                    const urlParts = product.image.split('/storage/v1/object/public/');
                    if (urlParts.length === 2) {
                        const bucketAndPath = urlParts[1];
                        const slashIdx = bucketAndPath.indexOf('/');
                        const bucketName = bucketAndPath.substring(0, slashIdx);
                        const filePath = bucketAndPath.substring(slashIdx + 1);

                        const { error: uploadError } = await supabase.storage
                            .from(bucketName)
                            .upload(filePath, compositedBuffer, {
                                contentType: response.headers.get('content-type') || 'image/jpeg',
                                upsert: true, // Overwrite the existing unwatermarked one
                            });

                        if (uploadError) {
                            console.error(`  -> Failed to upload watermarked image: ${uploadError.message}`);
                        } else {
                            console.log(`  -> Successfully watermarked and re-uploaded: ${product.name}`);
                            updatedCount++;
                        }
                    }
                } else {
                    console.log(`  -> Skipped ${product.name}: Image too small for watermark (${w}x${h})`);
                }

            } catch (err) {
                console.error(`  -> Error processing ${product.name}:`, err.message);
            }
        } else {
            // Local or external image
            // console.log(`Skipping non-supabase image: ${product.image}`);
        }
    }

    console.log(`\nStandardization Complete! Watermarked ${updatedCount} Supabase images.`);
}

standardizeImages();
