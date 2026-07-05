import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { broadcastTelegramMessage } from '@/lib/telegram';

export async function GET(request) {
    try {
        if (request.headers.get('authorization') !== `Bearer admin@129`) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin.from('promotions').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        return NextResponse.json({ success: true, promotions: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (request.headers.get('authorization') !== `Bearer admin@129`) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // Basic validation
        if (!body.code || !body.discount_type || !body.discount_value) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Clean up empty strings
        if (body.target_id === '') body.target_id = null;
        if (body.customer_email === '') body.customer_email = null;

        const { data, error } = await supabaseAdmin.from('promotions').insert([body]).select();

        if (error) throw error;

        try {
            if (data && data[0] && data[0].is_active) {
                const promo = data[0];
                // Only broadcast generic promos that are active
                let promoText = `🎉 NEW EXCLUSIVE OFFER: ${promo.code}\n`;
                if (promo.discount_type === 'percentage') {
                    promoText += `Get ${promo.discount_value}% OFF`;
                } else if (promo.discount_type === 'fixed') {
                    promoText += `Get EGP ${promo.discount_value} OFF`;
                } else if (promo.discount_type === 'points_multiplier') {
                    promoText += `Earn ${promo.discount_value}x Points`;
                } else if (promo.discount_type === 'free_shipping') {
                    promoText += `Get FREE SHIPPING`;
                }
                
                if (promo.min_order_value) {
                    promoText += ` on orders over EGP ${promo.min_order_value}`;
                }
                
                promoText += `!\n\n`;
                if (promo.description) {
                    promoText += `${promo.description}\n\n`;
                }
                
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';
                promoText += `👉 Shop Now: ${siteUrl}/shop`;
                
                broadcastTelegramMessage(promoText, null).catch(err => console.error("Promo broadcast failed:", err));
            }
        } catch (tgErr) {
            console.error("Promo Telegram dispatch failed:", tgErr);
        }

        return NextResponse.json({ success: true, promotion: data[0] });
    } catch (error) {
        console.error("Promo Creation Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        if (request.headers.get('authorization') !== `Bearer admin@129`) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        if (!body.id) {
            return NextResponse.json({ success: false, error: 'Missing promo ID' }, { status: 400 });
        }

        // Clean up empty strings
        if (body.target_id === '') body.target_id = null;
        if (body.customer_email === '') body.customer_email = null;

        const { data, error } = await supabaseAdmin.from('promotions').update(body).eq('id', body.id).select();

        if (error) throw error;

        return NextResponse.json({ success: true, promotion: data[0] });
    } catch (error) {
        console.error("Promo Update Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const adminSecret = request.headers.get('authorization');

        if (adminSecret !== `Bearer admin@129`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from('promotions').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
