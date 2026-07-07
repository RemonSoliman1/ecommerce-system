import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendTelegramMediaGroup, broadcastTelegramMediaGroup } from '@/lib/telegram';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();

        // 1. Authorization Check
        if (body.admin_secret !== 'admin@129') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        // 2. Fetch new products
        // We use 2 hours instead of 48 hours temporarily to avoid the mass-migration items
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        
        const { data: newProducts, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .or(`created_at.gte.${twoHoursAgo},updated_at.gte.${twoHoursAgo}`)
            .order('updated_at', { ascending: false, nullsFirst: false });

        if (error) throw error;

        if (!newProducts || newProducts.length === 0) {
            return NextResponse.json({ success: false, message: 'No new/updated products found in the last 2 hours to broadcast.' });
        }

        // 3. Format the message
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';
        
        // We will construct a MediaGroup.
        // The first image will be a Collage of all the IDs.
        const productIds = newProducts.map(p => p.id).slice(0, 9); // Max 9 for the collage
        const collageUrl = `${siteUrl}/api/og/collage?ids=${productIds.join(',')}`;

        // Create the overarching caption containing links to ALL items
        let collageCaption = `🔥 Check out the new collection! 🔥\n\n`;
        newProducts.slice(0, 9).forEach((p, index) => {
            const vitola = p.models && p.models.length > 0 ? p.models[0].size : 'Standard';
            let promoStr = '';
            const badges = (p.badges || []).map(b => typeof b === 'string' ? b.toLowerCase().replace(/\s+/g, '') : '');
            const hasFreeShipping = badges.includes('freeshipping') || badges.includes('free shipping');
            if (p.models && p.models.length > 0) {
                const m = p.models[0];
                if (m.original_price > m.price) {
                    promoStr += ` (🔥 ${Math.round(((m.original_price - m.price) / m.original_price) * 100)}% OFF)`;
                }
            }
            if (hasFreeShipping) promoStr += ` 🚚 Free Shipping!`;
            
            collageCaption += `<b>${index + 1}. ${p.name}</b> (${vitola})${promoStr}\n👉 ${siteUrl}/product/${p.id}\n\n`;
        });

        // The first photo in the album is the collage
        const mediaArray = [
            {
                type: 'photo',
                media: collageUrl,
                caption: collageCaption,
                parse_mode: 'HTML'
            }
        ];

        // Verify images via HEAD request so Telegram doesn't crash on 404s
        const validImages = [];
        for (const p of newProducts.slice(0, 9)) {
            if (p.image) {
                const imgUrl = p.image.startsWith('http') ? p.image : `${siteUrl}${p.image.startsWith('/') ? '' : '/'}${p.image}`;
                try {
                    const res = await fetch(imgUrl, { method: 'HEAD' });
                    if (res.ok) {
                        validImages.push(imgUrl);
                    }
                } catch (e) {
                    console.error("Image HEAD failed for", imgUrl, e);
                }
            }
        }

        // The rest of the photos are the individual product images (up to 9, so total album is 10)
        validImages.forEach((imgUrl) => {
            mediaArray.push({
                type: 'photo',
                media: imgUrl,
                parse_mode: 'HTML'
            });
        });

        // 4. Dispatch
        // Await the broadcast so Vercel doesn't terminate the process before it finishes
        try {
            await broadcastTelegramMediaGroup(mediaArray);
        } catch (err) {
            console.error("Grouped broadcast failed:", err);
            // We won't strictly fail the route if telegram fails, we want push to still try
        }

        try {
            await sendPushNotification({
                title: 'New Collection Alert! 🔥',
                body: `${newProducts.length} items just updated/added in stock. Tap to view!`,
                url: `/shop?products=${productIds.join(',')}`,
                image: newProducts[0]?.image || null
            });
        } catch (err) {
            console.error("Push broadcast failed:", err);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully initiated broadcast for ${newProducts.length} new items.` 
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
