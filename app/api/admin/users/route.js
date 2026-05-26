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

        // Fetch related customer and order data
        const { data: customers } = await supabase
            .from('customers')
            .select('id, email, points, tier, phone, address_street, address_city');
        
        const { data: orders } = await supabase
            .from('orders')
            .select('id, user_email, total_amount, status, created_at');

        const enrichedUsers = users.map(u => {
            const customerData = (customers || []).find(c => c.email?.toLowerCase() === u.email?.toLowerCase()) || {};
            const userOrders = (orders || []).filter(o => o.user_email?.toLowerCase() === u.email?.toLowerCase()).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            return {
                ...u,
                customer_id: customerData.id,
                points: customerData.points || 0,
                tier: customerData.tier || 'Silver',
                phone: customerData.phone || '',
                address: [customerData.address_street, customerData.address_city].filter(Boolean).join(', ') || '',
                dob: 'N/A',
                total_spent: userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
                orders_count: userOrders.length,
                recent_orders: userOrders.slice(0, 3)
            };
        });

        return NextResponse.json({ success: true, users: enrichedUsers });
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
