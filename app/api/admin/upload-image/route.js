import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        const intent = new URL(request.url).searchParams.get('intent') || 'product';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Validate File
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: 'Invalid file type. Ensure you are uploading a supported image or SVG.' }, { status: 400 });
        }

        // 2. Generate Path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // 3. Intercept with Sharp to Watermark Automatically
        let uploadBuffer;
        let finalContentType = file.type;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const originalBuffer = Buffer.from(arrayBuffer);

            if (file.type.startsWith('image/') && !file.type.includes('svg')) {
                const sharp = (await import('sharp')).default;
                const path = await import('path');
                
                const stampPath = path.join(process.cwd(), 'scraper', 'stamp.png');
                const imageData = await sharp(originalBuffer).metadata();
                const w = imageData.width;
                const h = imageData.height;

                if (w > 200 && h > 200) {
                    let stampSize;
                    let top, left;

                    if (intent === 'promo') {
                        // Smaller watermark in the top right for promotions
                        stampSize = Math.floor(w * 0.15);
                        const stampBufferForMeta = await sharp(stampPath).resize({ width: stampSize }).toBuffer();
                        const stampMeta = await sharp(stampBufferForMeta).metadata();
                        
                        top = Math.floor(h * 0.05); // 5% from top
                        left = Math.floor(w - stampSize - (w * 0.05)); // 5% from right
                    } else {
                        // Standard watermark for products (center, 40%)
                        stampSize = Math.floor(w * 0.4);
                        const stampBufferForMeta = await sharp(stampPath).resize({ width: stampSize }).toBuffer();
                        const stampMeta = await sharp(stampBufferForMeta).metadata();
                        
                        left = Math.floor((w - stampSize) / 2);
                        top = Math.floor((h - stampMeta.height) / 2);
                    }

                    const stampBuffer = await sharp(stampPath)
                        .resize({ width: stampSize })
                        .toBuffer();

                    uploadBuffer = await sharp(originalBuffer)
                        .composite([{
                            input: stampBuffer,
                            top: top,
                            left: left,
                            blend: 'over'
                        }])
                        .png() // Convert everything to standard png for safety
                        .toBuffer();
                        
                    finalContentType = 'image/png';
                } else {
                    uploadBuffer = originalBuffer;
                }
            } else {
               uploadBuffer = originalBuffer;
            }
        } catch (overlayErr) {
            console.error("Watermark overlay failed, uploading original:", overlayErr);
            uploadBuffer = Buffer.from(await file.arrayBuffer());
        }

        // 4. Upload via Admin Client (Bypasses RLS)
        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        const { data, error } = await supabaseAdmin.storage
            .from('product-images')
            .upload(filePath, uploadBuffer, {
                contentType: finalContentType,
                upsert: false
            });

        if (error) throw error;

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
