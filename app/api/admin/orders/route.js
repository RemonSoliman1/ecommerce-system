import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force dynamic execution
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

        // Fetch all orders descending by date
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map data to ensure consistency on the frontend
        const mappedOrders = orders.map(o => ({
            id: o.id,
            userId: o.telegram_id ? `TG: ${o.telegram_id}` : (o.customer_id || o.user_id || 'N/A'),
            userEmail: o.email || o.user_email || '',
            date: o.created_at,
            status: o.status || 'Pending',
            total: o.total_price || o.total_amount || 0,
            items: Array.isArray(o.order_items) ? o.order_items : (Array.isArray(o.items) ? o.items : []),
            address: o.shipping_address || o.address || 'N/A',
            paymentMethod: o.payment_method || 'N/A',
            promoCode: o.promo_code || null,
            discount: o.discount_amount || 0
        }));

        return NextResponse.json({ success: true, orders: mappedOrders });
    } catch (error) {
        console.error("Admin Orders API Error:", error.message);
        return NextResponse.json({ success: false, error: 'Failed to fetch admin orders' }, { status: 500 });
    }
}
