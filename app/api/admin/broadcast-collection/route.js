import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { broadcastTelegramMessage } from '@/lib/telegram';

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
            .select('id, name')
            .gte('created_at', twoDaysAgo)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!newProducts || newProducts.length === 0) {
            return NextResponse.json({ success: false, message: 'No new products found in the last 48 hours to broadcast.' });
        }

        // 3. Format the message
        let telegramText = `🔥 Check out the new collection! 🔥\n\n`;
        newProducts.forEach((p, index) => {
            telegramText += `${index + 1}. ${p.name}\n`;
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';
        telegramText += `\n👉 View the full drop and pricing here: ${siteUrl}/shop`;

        // 4. Dispatch
        // Non-blocking background call
        broadcastTelegramMessage(telegramText, null).catch(err => console.error("Grouped broadcast failed:", err));

        return NextResponse.json({ 
            success: true, 
            message: `Successfully initiated broadcast for ${newProducts.length} new items.` 
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
