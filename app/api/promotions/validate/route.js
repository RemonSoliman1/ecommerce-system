import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const { code, cart, cartTotal, email, paymentMethod } = await request.json();

        if (!code || !cart) {
            return NextResponse.json({ success: false, error: 'Missing code or cart data' }, { status: 400 });
        }

        // Fetch promo
        const { data: promo, error } = await supabaseAdmin
            .from('promotions')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('active', true)
            .single();

        if (error || !promo) {
            return NextResponse.json({ success: false, error: 'Invalid or expired promo code' }, { status: 404 });
        }

        // Validate Minimum Order Amount
        if (promo.rule_min_order_amount !== null && cartTotal < parseFloat(promo.rule_min_order_amount)) {
            const difference = (parseFloat(promo.rule_min_order_amount) - cartTotal).toFixed(2);
            return NextResponse.json({ success: false, error: `Add EGP ${difference} more to your cart to claim this offer!` }, { status: 403 });
        }

        // Validate Payment Method
        // Note: The frontend must pass paymentMethod to this route

        // Validate specific customer restrict
        if (promo.customer_email) {
            if (!email) {
                return NextResponse.json({ success: false, error: 'You must be logged in to use this promo code' }, { status: 403 });
            }

            if (promo.customer_email.startsWith('[VIP')) {
                const { data: customerData } = await supabaseAdmin
                    .from('customers')
                    .select('points, tier')
                    .eq('email', email)
                    .maybeSingle();

                if (!customerData) {
                    return NextResponse.json({ success: false, error: 'This promo code is strictly for our Loyal/VIP members' }, { status: 403 });
                }

                if (promo.customer_email === '[VIP]') {
                    if ((customerData.points || 0) < 1000) {
                        return NextResponse.json({ success: false, error: 'This promo code is strictly for our Loyal/VIP members' }, { status: 403 });
                    }
                } else {
                    const match = promo.customer_email.match(/\[VIP:(.+)\]/);
                    if (match) {
                        const requiredTiers = match[1].split(',');
                        if (!requiredTiers.includes(customerData.tier || 'Silver')) {
                            return NextResponse.json({ success: false, error: `This promo code is restricted to ${requiredTiers.join(', ')} members` }, { status: 403 });
                        }
                    }
                }
            } else {
                const allowedEmails = promo.customer_email.split(',').map(e => e.trim().toLowerCase());
                if (!allowedEmails.includes(email.toLowerCase())) {
                    return NextResponse.json({ success: false, error: 'This promo code is not valid for your email' }, { status: 403 });
                }
            }
        }

        // Payment Method restriction will be passed to frontend to restrict UI, not rejected here.
        // We will just pass it down in the response payload.

        // Validate Usage Limit
        if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
            return NextResponse.json({ success: false, error: 'Promo code usage limit has been reached' }, { status: 403 });
        }

        // Validate Rules requiring history
        if (promo.rule_first_order || promo.rule_one_time_use) {
            if (!email) {
                return NextResponse.json({ success: false, error: 'You must log in to use this promo code' }, { status: 403 });
            }
            const { data: pastOrders } = await supabaseAdmin
                .from('orders')
                .select('id, promo_code')
                .eq('user_email', email);
                
            if (promo.rule_first_order && pastOrders && pastOrders.length > 0) {
                return NextResponse.json({ success: false, error: 'This promo code is only valid for your first order' }, { status: 403 });
            }
            
            if (promo.rule_one_time_use && pastOrders && pastOrders.some(o => o.promo_code === promo.code)) {
                return NextResponse.json({ success: false, error: 'You have already used this promo code' }, { status: 403 });
            }
        }

        // Calculate discount
        let discountAmount = 0;
        let applicableItems = [...cart];

        // Filter applicable items if target_type is product or brand
        if (promo.target_type === 'product' && promo.target_id) {
            const targetProducts = promo.target_id.split(',');
            applicableItems = cart.filter(item => targetProducts.includes(String(item.id)));
        } else if (promo.target_type === 'brand' && promo.target_id) {
            const targetBrands = promo.target_id.split(',');
            const { data: products } = await supabaseAdmin.from('products').select('id, brand_id');
            const targetProducts = products.filter(p => targetBrands.includes(p.brand_id)).map(p => p.id);
            applicableItems = cart.filter(item => targetProducts.includes(item.id));
        }

        if (applicableItems.length === 0) {
            return NextResponse.json({ success: false, error: 'Promo code does not apply to any items in your cart' }, { status: 400 });
        }

        // Validate Minimum Item Quantity (Sticks/Boxes)
        if (promo.rule_min_quantity !== null) {
            const totalApplicableQty = applicableItems.reduce((acc, item) => acc + item.quantity, 0);
            if (totalApplicableQty < parseInt(promo.rule_min_quantity)) {
                return NextResponse.json({ success: false, error: `This promo requires you to have at least ${promo.rule_min_quantity} applicable items in your cart. You have ${totalApplicableQty}.` }, { status: 403 });
            }
        }

        const applicableTotal = applicableItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        if (promo.discount_type === 'percentage') {
            discountAmount = applicableTotal * (parseFloat(promo.discount_value) / 100);
            if (promo.max_discount_value && discountAmount > parseFloat(promo.max_discount_value)) {
                discountAmount = parseFloat(promo.max_discount_value);
            }
        } else if (promo.discount_type === 'fixed') {
            discountAmount = parseFloat(promo.discount_value);
            // Cap discount to applicable total
            if (discountAmount > applicableTotal) discountAmount = applicableTotal;
        }

        return NextResponse.json({ success: true, promo, discountAmount });
    } catch (error) {
        console.error("Promo Validate Error:", error);
        return NextResponse.json({ success: false, error: 'Server error validating promo' }, { status: 500 });
    }
}
