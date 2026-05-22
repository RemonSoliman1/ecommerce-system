import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, is_visible, admin_secret } = body;

        if (admin_secret !== 'admin@129') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .update({ is_visible })
            .eq('id', id)
            .select()
            .single();

        // If error code is 42703 (undefined column), it means is_visible doesn't exist yet in the DB.
        // We will just log it. The user needs to add it to Supabase if it fails.
        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
