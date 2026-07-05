import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getSupabaseAdmin = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!serviceKey) throw new Error('SUPABASE_KEY is missing');
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

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, email, updates } = body;

        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        
        let query = supabase.from('customers').update(updates);
        
        if (id) {
            query = query.eq('id', id);
        } else if (email) {
            query = query.ilike('email', email);
        } else {
            return NextResponse.json({ success: false, error: 'Customer ID or Email is required' }, { status: 400 });
        }

        const { error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        console.error("Admin Customers PUT Error:", error.message);
        return NextResponse.json({ success: false, error: 'Failed to update customer' }, { status: 500 });
    }
}
