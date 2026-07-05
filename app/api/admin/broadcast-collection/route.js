import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendTelegramMediaGroup } from '@/lib/telegram';

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

        // 2. Query products from the last 48 hours
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        
        const { data: newProducts, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .gte('created_at', twoDaysAgo)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!newProducts || newProducts.length === 0) {
            return NextResponse.json({ success: false, message: 'No new products found in the last 48 hours to broadcast.' });
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
            collageCaption += `<b>${index + 1}. ${p.name}</b> (${vitola})\n👉 ${siteUrl}/product/${p.id}\n\n`;
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

        // The rest of the photos are the individual product images (up to 9, so total album is 10)
        newProducts.slice(0, 9).forEach((p) => {
            if (p.image) {
                mediaArray.push({
                    type: 'photo',
                    media: p.image,
                    parse_mode: 'HTML'
                });
            }
        });

        // 4. Dispatch
        // Await the broadcast so Vercel doesn't terminate the process before it finishes
        try {
            const targetGroup = process.env.TELEGRAM_GROUP_ID || '-1003609408005';
            await sendTelegramMediaGroup(mediaArray, targetGroup);
        } catch (err) {
            console.error("Grouped broadcast failed:", err);
            return NextResponse.json({ success: false, error: 'Telegram timeout/failure', details: err.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully initiated broadcast for ${newProducts.length} new items.` 
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
