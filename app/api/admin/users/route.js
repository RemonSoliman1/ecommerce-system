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

export async function GET(request) {
    try {
        const supabase = getSupabaseAdmin();
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, verified, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error("Admin Users GET Error:", error.message);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json({ success: false, error: 'Missing userId or role' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const { error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
        console.error("Admin Users PUT Error:", error.message);
        return NextResponse.json({ success: false, error: 'Failed to update user role' }, { status: 500 });
    }
}
