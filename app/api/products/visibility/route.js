import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, is_visible, admin_secret } = body;

        const auth = await requireAdmin(request);
        if (auth.error) return auth.error;

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
