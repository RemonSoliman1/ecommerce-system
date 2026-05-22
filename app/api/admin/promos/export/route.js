import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        // Fetch all orders that used this promo code
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('id, customer_id, user_email, total_amount, discount_amount, created_at')
            .eq('promo_code', code);

        if (error) throw error;

        // Generate CSV
        let csvContent = 'Order Number,Customer ID,User Email,Date,Order Total (EGP),Discount Saved (EGP)\n';
        orders.forEach(order => {
            csvContent += `"${order.id}","${order.customer_id || 'Guest'}","${order.user_email || 'Guest'}","${new Date(order.created_at).toLocaleString()}","${order.total_amount}","${order.discount_amount || 0}"\n`;
        });

        const headers = new Headers();
        headers.append('Content-Type', 'text/csv');
        headers.append('Content-Disposition', `attachment; filename="promo_usage_${code}.csv"`);

        return new NextResponse(csvContent, {
            status: 200,
            headers: headers
        });

    } catch (e) {
        console.error("Export Promo Error:", e);
        return NextResponse.json({ error: 'Server error exporting promo' }, { status: 500 });
    }
}
