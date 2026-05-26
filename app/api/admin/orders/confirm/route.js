import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendPushNotification } from '@/lib/push';

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

// Initialize Resend with the provided ENV key or stub
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId, processedBy } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // 1. Fetch User Data
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError) throw orderError;
        if (!orderData) throw new Error("Order not found");

        const customerEmail = orderData.user_email;

        // 2. Update Database Record
        const { error: updateError } = await supabase
            .from('orders')
            .update({ 
                status: 'Confirmed',
                confirmed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                processed_by: processedBy || 'admin'
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // 3. Dispatch Notifications
        // 3a. Telegram (If they ordered via Bot)
        const paymentString = orderData.payment_method || '';
        if (paymentString.includes('|TG:')) {
            const tgId = paymentString.split('|TG:')[1];
            if (tgId) {
                const tgMessage = `✅ <b>Order Confirmed!</b>\n\nYour order <b>#${orderId}</b> at Cigar Lounge has been officially confirmed and is being prepared for shipment.\n\n📦 <b>Expected Delivery:</b> 1-2 Business Days`;
                await sendTelegramMessage(tgMessage, tgId);
                console.log(`Telegram confirmation deployed to Chat ID: ${tgId}`);
            }
        }

        // 3b. Push Notification
        if (customerEmail) {
            try {
                await sendPushNotification({
                    title: 'Order Confirmed! 🚚',
                    body: `Your order #${orderId} is confirmed and being prepared for shipment.`,
                    url: '/account',
                    targetType: 'specific',
                    targetEmails: [customerEmail]
                });
            } catch (pushErr) {
                console.error("Push Notification failed:", pushErr);
            }
        }

        // 3c. Email (If Resend is active)
        if (resend && customerEmail) {
            try {
                await resend.emails.send({
                    from: 'orders@cigarlounge.com', // Best practice is a verified domain
                    to: customerEmail,
                    subject: `Order #${orderId} Confirmed - Cigar Lounge`,
                    html: `
                        <div style="font-family: sans-serif; background: #fdfdfd; padding: 20px;">
                            <h2 style="color: #8a6d3b;">Order Confirmed!</h2>
                            <p>Great news! We have confirmed your order <strong>#${orderId}</strong> and it is currently being prepared for shipment.</p>
                            <p><strong>Expected Delivery:</strong> 1-2 Business Days</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <h3>Order Summary</h3>
                            <ul>
                                ${Array.isArray(orderData.items) ? orderData.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('') : '<li>Custom Order</li>'}
                            </ul>
                            <p><strong>Total Paid:</strong> ${orderData.total_amount || orderData.total_price || 0} EGP</p>
                            <p style="color: #666; font-size: 0.9em;">If you have any questions, please contact our support team.</p>
                        </div>
                    `
                });
                console.log(`Confirmation email dispatched successfully to ${customerEmail}`);
            } catch (emailErr) {
                console.error("Resend delivery failed:", emailErr);
                // Return success anyway, as the DB was updated, just notify them email failed.
                return NextResponse.json({ success: true, warning: 'DB updated, but email failed to send (check Resend configuration). Telegram (if applicable) was sent.', orderId });
            }
        } else if (!resend) {
            console.warn("RESEND_API_KEY missing - skipping email dispatch");
        }

        return NextResponse.json({ success: true, orderId });

    } catch (error) {
        console.error("Admin Order Confirm API Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
