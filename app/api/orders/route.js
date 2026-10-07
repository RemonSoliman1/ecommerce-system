import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        // 1. Get Customer ID first
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .single();

        if (customerError || !customer) {
            // No customer found means no orders yet
            return NextResponse.json({ orders: [] });
        }

        // 2. Get Orders for this Customer
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_email', email)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        const formattedOrders = orders.map(o => ({
            ...o,
            total: o.total_amount || o.total_price || 0,
            items: o.order_items || []
        }));

        return NextResponse.json({ orders: formattedOrders });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
