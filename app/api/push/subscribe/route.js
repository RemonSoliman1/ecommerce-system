import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const body = await request.json();
        const { subscription, userId } = body;

        if (!subscription || !userId) {
            return NextResponse.json({ error: 'Missing subscription or userId' }, { status: 400 });
        }

        // Check if subscription already exists for this endpoint
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', subscription.endpoint)
            .maybeSingle();

        if (existing) {
            // Update existing if userId changed, or just return success
            await supabaseAdmin
                .from('push_subscriptions')
                .update({ user_id: userId, subscription_data: subscription })
                .eq('id', existing.id);
        } else {
            // Insert new
            const { error } = await supabaseAdmin.from('push_subscriptions').insert([{
                user_id: userId,
                endpoint: subscription.endpoint,
                subscription_data: subscription
            }]);
            
            if (error) {
                // Ignore unique violation if racing
                if (error.code !== '23505') throw error;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push subscription error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
