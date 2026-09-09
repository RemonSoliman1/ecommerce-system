import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit } from '@/lib/rateLimit';

// Basic email format validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
    const limiter = rateLimit(request, 3, 60000);
    if (!limiter.success) {
        return NextResponse.json({ error: 'Too many subscription attempts. Please try again later.' }, { status: 429 });
    }

    try {
        const { email } = await request.json();

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // We use supabaseAdmin to bypass potentially strict RLS on the subscribers table
        const { data, error } = await supabaseAdmin
            .from('subscribers')
            .upsert({ email, status: 'subscribed' }, { onConflict: 'email' });

        if (error) {
            console.error('Newsletter subscription error:', error);
            return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Subscribed successfully' });

    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
