import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ customers: [] });
    }

    try {
        // Search Web Customers (customers table)
        const { data: webCust, error: webErr } = await supabase
            .from('customers')
            .select('id, name, email, phone')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
            .limit(10);

        // Search Telegram Users (telegram_users table)
        const { data: tgUsers, error: tgErr } = await supabase
            .from('telegram_users')
            .select('telegram_id, first_name, last_name, username')
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%,telegram_id::text.ilike.%${query}%`)
            .limit(10);

        const results = [];

        if (webCust && !webErr) {
            webCust.forEach(c => {
                results.push({
                    id: c.id,
                    type: 'web',
                    displayName: c.name || c.email || 'Unknown',
                    subLabel: `ID: ${c.id} | Email: ${c.email || 'N/A'} | Phone: ${c.phone || 'N/A'}`
                });
            });
        }

        if (tgUsers && !tgErr) {
            tgUsers.forEach(u => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Unknown';
                results.push({
                    id: u.telegram_id,
                    type: 'telegram',
                    displayName: `[TG] ${name}`,
                    subLabel: `Telegram ID: ${u.telegram_id} | Username: @${u.username || 'N/A'}`
                });
            });
        }

        return NextResponse.json({ customers: results });

    } catch (error) {
        console.error("POS Customer Search Error:", error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
