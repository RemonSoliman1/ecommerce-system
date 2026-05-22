import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force dynamic to avoid build-time execution issues with missing env vars
export const dynamic = 'force-dynamic';

// Initialize Supabase Admin Client Lazily
const getSupabaseAdmin = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) is missing');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const supabaseAdmin = getSupabaseAdmin();
        let query = supabaseAdmin.from('product_attributes').select('*');
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query.order('value', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { category, value, metadata } = body;

        if (!category || !value) {
            return NextResponse.json({ success: false, error: 'Category and value are required' }, { status: 400 });
        }

        // Check if exists
        const supabaseAdmin = getSupabaseAdmin();
        const { data: existing } = await supabaseAdmin
            .from('product_attributes')
            .select('id')
            .eq('category', category)
            .eq('value', value)
            .single();

        if (existing) {
            const { data, error } = await supabaseAdmin
                .from('product_attributes')
                .update({ metadata: metadata || {} })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Attribute updated', data });
        }

        const { data, error } = await supabaseAdmin
            .from('product_attributes')
            .insert([{ category, value, metadata: metadata || {} }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error saving attribute:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const value = searchParams.get('value');

        if (!category || !value) {
            return NextResponse.json({ success: false, error: 'Category and value are required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('product_attributes')
            .delete()
            .eq('category', category)
            .eq('value', value);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, category, value, metadata } = body;

        if (!id || !category || !value) {
            return NextResponse.json({ success: false, error: 'id, category, and value are required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('product_attributes')
            .update({ category, value, metadata: metadata || {} })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error updating attribute:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
