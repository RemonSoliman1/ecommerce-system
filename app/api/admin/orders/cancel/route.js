import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getSupabaseAdmin = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    }
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // 1. Get the order details
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (order.status === 'cancelled') {
            return NextResponse.json({ success: false, error: 'Order is already cancelled' }, { status: 400 });
        }

        // 2. Revert Stock
        if (order.items && Array.isArray(order.items)) {
            for (const item of order.items) {
                if (!item.id || !item.quantity) continue;
                
                // Get current stock
                const { data: product, error: productError } = await supabaseAdmin
                    .from('products')
                    .select('stock, variants')
                    .eq('id', item.id)
                    .single();

                if (productError || !product) continue; // Skip if product doesn't exist anymore

                // Update stock logic
                let newStock = product.stock;
                let newVariants = product.variants;

                if (item.selectedSize && newVariants && newVariants.length > 0) {
                    newVariants = newVariants.map(v => {
                        if (v.name === item.selectedSize) {
                            return { ...v, stock: (v.stock || 0) + item.quantity };
                        }
                        return v;
                    });
                    newStock = newVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
                } else {
                    newStock = (newStock || 0) + item.quantity;
                }

                await supabaseAdmin
                    .from('products')
                    .update({ stock: newStock, variants: newVariants })
                    .eq('id', item.id);
            }
        }

        // 3. Update order status to cancelled
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, message: 'Order cancelled and stock reverted successfully' });

    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
