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
        
        // We will construct a MediaGroup. Telegram allows up to 10 items in a media group.
        // If we have more than 10, we'll slice it to 10 to avoid errors, or send multiple groups.
        // For simplicity, we'll take the first 10.
        const productsToBroadcast = newProducts.slice(0, 10);
        
        const mediaArray = productsToBroadcast.map((p, index) => {
            const stripHtml = (html) => html ? html.replace(/<[^>]+>/g, '') : '';
            const briefDescription = stripHtml(p.description).substring(0, 80) + (stripHtml(p.description).length > 80 ? '...' : '');
            const vitola = p.models && p.models.length > 0 ? p.models[0].size : 'Standard';
            const notes = Array.isArray(p.flavor_profile) ? p.flavor_profile.join(', ') : (p.flavor_profile || '');

            let caption = `🔥 ${index + 1}. ${p.name}\n` +
                          `📏 Vitola: ${vitola}\n` +
                          `${notes ? `🌿 Notes: ${notes}\n` : ''}` +
                          `👉 Link: ${siteUrl}/product/${p.id}`;
            
            // Add introductory text to the first image caption
            if (index === 0) {
                caption = `🔥 Check out the new collection! 🔥\n\n` + caption;
            }

            return {
                type: 'photo',
                media: p.image || 'https://cigar-lounge-one.vercel.app/images/placeholder.png',
                caption: caption,
                parse_mode: 'HTML'
            };
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
            message: `Successfully initiated broadcast for ${productsToBroadcast.length} new items.` 
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
