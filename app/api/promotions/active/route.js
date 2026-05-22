import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { data: promos, error } = await supabaseAdmin
            .from('promotions')
            .select('*')
            .eq('active', true)
            // Exclude promos that are only for specific customers from public view
            .is('customer_email', null);

        if (error) {
            console.error('[API] Error fetching public promos:', error.message);
            throw error;
        }

        // Only return non-expired/non-limited promos
        const validPromos = promos.filter(p => {
            if (p.usage_limit !== null && p.usage_count >= p.usage_limit) return false;
            return true;
        });

        // Strip sensitive info if needed, but we need target_id and code
        const safePromos = validPromos.map(p => ({
            id: p.id,
            code: p.code,
            discount_type: p.discount_type,
            discount_value: p.discount_value,
            target_type: p.target_type,
            target_id: p.target_id,
            rule_min_order_amount: p.rule_min_order_amount,
            rule_payment_methods: p.rule_payment_methods,
            rule_first_order: p.rule_first_order
        }));

        return NextResponse.json({ success: true, promos: safePromos });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch active promos' }, { status: 500 });
    }
}
