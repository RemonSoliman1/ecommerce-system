import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const supabase = supabaseAdmin;
        
        // PERF-1: Fetch all required data concurrently
        const [
            { data: users, error },
            { data: customers },
            { data: orders }
        ] = await Promise.all([
            supabase.from('users').select('id, name, email, role, verified, created_at, activity_status, last_active_at').order('created_at', { ascending: false }),
            supabase.from('customers').select('id, email, points, tier, phone, address_street, address_city, requires_receipt'),
            supabase.from('orders').select('id, user_email, total_amount, status, created_at, items, payment_method, processed_by')
        ]);

        if (error) throw error;

        // PERF-1: Build O(1) lookup maps instead of O(N*M) array finds
        const customerMap = new Map();
        (customers || []).forEach(c => {
            if (c.email) customerMap.set(c.email.toLowerCase(), c);
        });

        const orderMap = new Map();
        (orders || []).forEach(o => {
            if (o.user_email) {
                const key = o.user_email.toLowerCase();
                if (!orderMap.has(key)) orderMap.set(key, []);
                orderMap.get(key).push(o);
            }
        });

        const enrichedUsers = users.map(u => {
            const emailKey = u.email?.toLowerCase();
            const customerData = customerMap.get(emailKey) || {};
            const userOrders = (orderMap.get(emailKey) || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            
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
                recent_orders: userOrders, // Return all orders
                requires_receipt: customerData.requires_receipt || false
            };
        });

        return NextResponse.json({ success: true, users: enrichedUsers });
    } catch (error) {
        console.error("Admin Users GET Error:", error.message);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PUT(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json({ success: false, error: 'Missing userId or role' }, { status: 400 });
        }

        const supabase = supabaseAdmin;
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
