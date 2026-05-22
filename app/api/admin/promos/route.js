import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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

        return NextResponse.json({ success: true, promotion: data[0] });
    } catch (error) {
        console.error("Promo Creation Error:", error);
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
