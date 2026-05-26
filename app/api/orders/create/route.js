import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendTelegramMessage } from '@/lib/telegram';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendPushNotification } from '@/lib/push';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase Client for API Route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple In-Memory Rate Limiting
const rateLimitMap = new Map();

export async function POST(request) {
    try {
        const body = await request.json();
        console.log("[API] Create Order Payload:", JSON.stringify(body, null, 2));

        const { orderId, items, total, customer, paymentMethod, instapay_reference, instapay_image_url, telegramChatId } = body;

        // Strict Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error("[API] Error: Order received with zero items.");
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        // --- 0. RATE LIMITING ---
        const ip = request.headers.get('x-forwarded-for') || 'unknown_ip';
        const now = Date.now();
        if (rateLimitMap.has(ip) && now - rateLimitMap.get(ip) < 10000) { // 10 second cooldown
            return NextResponse.json({ error: "Too many requests. Please wait before trying again." }, { status: 429 });
        }
        rateLimitMap.set(ip, now);

        // --- 0.5. PRE-FLIGHT INVENTORY & PRICE VALIDATION ---
        let recalculatedTotal = 0;
        const productIds = [...new Set(items.map(i => i.id))];
        const { data: dbProducts } = await supabaseAdmin
            .from('products')
            .select('id, name, models')
            .in('id', productIds);

        if (!dbProducts || dbProducts.length === 0) {
            return NextResponse.json({ error: "Products not found in database." }, { status: 400 });
        }

        // Clone models to deduct stock in-memory during validation (catches duplicate items in cart)
        const memoryProducts = dbProducts.map(p => ({
            ...p,
            models: p.models ? JSON.parse(JSON.stringify(p.models)) : []
        }));

        for (let i = 0; i < items.length; i++) {
            let cItem = items[i];
            let dbProd = memoryProducts.find(p => p.id === cItem.id);
            if (!dbProd) {
                return NextResponse.json({ error: `Product ${cItem.name} no longer exists.` }, { status: 400 });
            }

            let matchIdx = dbProd.models.findIndex(m => {
                const mName = (m.name || '').trim().toLowerCase();
                const mSize = (m.size || '').trim().toLowerCase();
                const cartSize = (cItem.selectedSize || cItem.size || '').trim().toLowerCase();
                const cartVariant = (cItem.variant || cItem.modelName || '').trim().toLowerCase();
                const cartName = (cItem.name || '').trim().toLowerCase();

                if (cartVariant && cartVariant === mName && cartSize === mSize) return true;
                if (cartVariant && cartVariant === mName && !mSize) return true;
                const cStr = (cartVariant + ' ' + cartSize + ' ' + cartName).trim();
                if (cStr === mName || cStr === mSize) return true;
                if (mName && cStr.includes(mName)) return true;
                const cTokens = cStr.split(/[\s()]+/).filter(t => t.length > 2);
                const mTokens = (mName + ' ' + mSize).split(/[\s()]+/).filter(t => t.length > 2);
                return cTokens.some(t => mTokens.includes(t)) && mTokens.some(t => cTokens.includes(t));
            });

            if (matchIdx === -1 && dbProd.models.length === 1) matchIdx = 0;

            if (matchIdx === -1) {
                return NextResponse.json({ error: `Variant for ${cItem.name} not found.` }, { status: 400 });
            }

            let currentStock = parseInt(dbProd.models[matchIdx].stock);
            let qty = parseInt(cItem.quantity) || 1;

            if (isNaN(currentStock) || currentStock < qty) {
                return NextResponse.json({ error: `Insufficient stock for ${cItem.name}. Only ${isNaN(currentStock) ? 0 : currentStock} available.` }, { status: 400 });
            }

            // Deduct in memory for subsequent loop iterations
            dbProd.models[matchIdx].stock = currentStock - qty;

            // Secure Price Recalculation (Overrides client payload)
            const securePrice = parseFloat(dbProd.models[matchIdx].price) || 0;
            const hasGift = !!cItem.giftOption;
            const giftPrice = hasGift ? Number(cItem.giftOption.price) || 0 : 0;
            
            recalculatedTotal += (securePrice + giftPrice) * qty;

            // Overwrite trusted price back into the item array for the DB Insert
            items[i].price = securePrice;
        }

        let finalTotal = recalculatedTotal > 0 ? recalculatedTotal : Number(total);
        if (recalculatedTotal > 0) {
            if (body.discount) {
                finalTotal = Math.max(0, finalTotal - Number(body.discount));
            }
            // Add Shipping
            let shippingCost = 0;
            if (customer && customer.city) {
                shippingCost = customer.city.toLowerCase().includes('cairo') ? 50 : 100;
            }
            finalTotal += shippingCost;
        }

        const pointsEarned = Math.floor(finalTotal);

        let dbOrderId = orderId;

        // --- 1. DATABASE OPERATIONS ---
        try {
            // A. Handle Customer (Upsert & Points)
            let customerId;
            let newPointsBalance = pointsEarned;

            try {
                const { data: existingCustomer } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('email', customer.email)
                    .single();

                if (existingCustomer) {
                    customerId = existingCustomer.id;
                    newPointsBalance = (existingCustomer.points || 0) + pointsEarned;

                    await supabase
                        .from('customers')
                        .update({
                            name: customer.name,
                            phone: customer.phone,
                            points: newPointsBalance
                        })
                        .eq('id', customerId);
                } else {
                    const { data: newCustomer, error: createError } = await supabase
                        .from('customers')
                        .insert([{
                            email: customer.email,
                            name: customer.name,
                            phone: customer.phone,
                            points: pointsEarned
                        }])
                        .select()
                        .single();

                    if (!createError && newCustomer) {
                        customerId = newCustomer.id;
                    } else if (createError) {
                        console.error('[API] Customer Creation Suppressed Error:', createError.message);
                    }
                }
            } catch (customerError) {
                console.error('[API] Customer DB synchronization failed gracefully:', customerError.message);
            }

            // Silent Lookup Hook for Telegram
            if (telegramChatId && customerId) {
                try {
                    await supabaseAdmin
                        .from('telegram_users')
                        .update({ store_customer_id: customerId })
                        .eq('telegram_id', telegramChatId);
                } catch (tgHookError) {
                    console.error('[API] Telegram Link Hook Error:', tgHookError.message);
                }
            }
            if (body.promoCode) {
                // Ignore errors here to not block order placement
                supabaseAdmin.rpc('increment_promo_usage', { p_code: body.promoCode }).catch(console.error);
            }

            // B. Create Order strictly targeting valid schema columns
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    customer_id: customerId,
                    user_email: customer.email,
                    total_amount: finalTotal,
                    total_price: finalTotal,
                    status: body.status || 'Pending',
                    promo_code: body.promoCode || null,
                    discount_amount: body.discount || null,
                    payment_method: [
                        paymentMethod || 'COD',
                        instapay_reference ? `REF:${instapay_reference}` : '',
                        instapay_image_url ? `IMG:${instapay_image_url}` : '',
                        telegramChatId ? `TG:${telegramChatId}` : ''
                    ].filter(Boolean).join(' | ')
                }])
                .select()
                .single();

            if (orderError) return NextResponse.json({ success: false, error: `Order Creation DB Error: ${orderError.message}`, details: orderError }, { status: 500 });

            dbOrderId = newOrder.id;

            // C. Create Order Items relationally
            const orderItems = items.map(item => {
                const hasGift = !!item.giftOption;
                const giftPrice = hasGift ? Number(item.giftOption.price) : 0;
                return {
                    order_id: dbOrderId,
                    name: item.name + (hasGift ? ` (Gift: ${item.giftOption.name})` : ''),
                    quantity: item.quantity,
                    price: Number(item.price) + giftPrice,
                    size: item.selectedSize
                };
            });

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) {
                console.error('[API] Order Items Insert Error:', itemsError.message);
                return NextResponse.json({ success: false, error: `Order Items DB Error: ${itemsError.message}`, details: itemsError }, { status: 500 });
            }

            // D. Deduct Inventory (Stock)
            if (supabaseAdmin) {
                try {
                    const productIds = [...new Set(items.map(i => i.id))];
                    const { data: dbProducts } = await supabaseAdmin
                        .from('products')
                        .select('id, models')
                        .in('id', productIds);

                    if (dbProducts) {
                        for (let dbProd of dbProducts) {
                            let updated = false;
                            let newModels = [...(dbProd.models || [])];

                            const pdItems = items.filter(i => i.id === dbProd.id);
                            for (let cItem of pdItems) {
                                let matchIdx = newModels.findIndex(m => {
                                    const mName = (m.name || '').trim().toLowerCase();
                                    const mSize = (m.size || '').trim().toLowerCase();
                                    const cartSize = (cItem.selectedSize || cItem.size || '').trim().toLowerCase();
                                    const cartVariant = (cItem.variant || cItem.modelName || '').trim().toLowerCase();
                                    const cartName = (cItem.name || '').trim().toLowerCase();

                                    // 1. Strict Structural Match (New Standard)
                                    if (cartVariant && cartVariant === mName && cartSize === mSize) return true;

                                    // 2. Strict Structural Name Fallback
                                    if (cartVariant && cartVariant === mName && !mSize) return true;

                                    // 3. Fallback Legacy Fuzzy Intersection
                                    const cStr = (cartVariant + ' ' + cartSize + ' ' + cartName).trim();
                                    if (cStr === mName || cStr === mSize) return true;
                                    if (mName && cStr.includes(mName)) return true;

                                    // 4. Tokenized Deep Search
                                    const cTokens = cStr.split(/[\s()]+/).filter(t => t.length > 2);
                                    const mTokens = (mName + ' ' + mSize).split(/[\s()]+/).filter(t => t.length > 2);
                                    return cTokens.some(t => mTokens.includes(t)) && mTokens.some(t => cTokens.includes(t));
                                });

                                if (matchIdx === -1 && newModels.length === 1) matchIdx = 0;

                                if (matchIdx !== -1) {
                                    console.log("MATCH FOUND inside Model array at index", matchIdx, "for", cItem.name);
                                    let currentStock = parseInt(newModels[matchIdx].stock);
                                    if (!isNaN(currentStock)) {
                                        newModels[matchIdx].stock = Math.max(0, currentStock - (cItem.quantity || 1));
                                        updated = true;
                                    }
                                }
                            }

                            if (updated) {
                                await supabaseAdmin
                                    .from('products')
                                    .update({ models: newModels })
                                    .eq('id', dbProd.id);
                            }
                        }
                    }
                } catch (invError) {
                    console.error('[API] Inventory Deduction Error:', invError.message);
                }
            }

        } catch (dbError) {
            console.error('[API] Database Error:', dbError.message);
            return NextResponse.json({ success: false, error: `Database exception: ${dbError.message}` }, { status: 500 });
        }

        // --- 2. NOTIFICATIONS (Telegram & Email) ---
        // Prepare HTML for Email
        // Fix: Use numeric prices in map
        const itemsHtml = items.map(item => {
            const hasGift = !!item.giftOption;
            const itemBasePrice = Number(item.price);
            const giftPrice = hasGift ? Number(item.giftOption.price) : 0;
            const lineTotal = (itemBasePrice + giftPrice) * item.quantity;

            return `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="font-weight: bold; color: #333;">${item.name}</span><br>
                    <span style="font-size: 12px; color: #666;">${item.selectedSize}</span>
                    ${hasGift ? `<br><span style="font-size: 11px; color: #d4af37;">🎁 Gift: ${item.giftOption.name} (+EGP ${giftPrice})</span>` : ''}
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">EGP ${lineTotal.toFixed(2)}</td>
            </tr>
            `;
        }).join('');

        // ... (Send Telegram - Existing logic reused)
        let telegramText = `<b>🏛️ CIGAR LOUNGE - NEW ORDER</b>\n`;
        telegramText += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;
        telegramText += `<b>🧾 Order ID:</b> #${dbOrderId}\n`;
        telegramText += `<b>👤 Customer:</b> ${customer.name}\n`;
        telegramText += `<b>📞 Phone:</b> ${customer.phone}\n`;
        telegramText += `<b>💰 Total:</b> EGP ${finalTotal.toLocaleString()}\n`;
        if (body.promoCode) {
            telegramText += `<b>🏷️ Promo Used:</b> ${body.promoCode} (- EGP ${body.discount})\n`;
        }
        telegramText += `<b>💳 Payment:</b> ${paymentMethod}\n`;
        if (instapay_image_url) telegramText += `<b>🧾 Receipt URL:</b> ${instapay_image_url}\n`;
        if (instapay_reference) telegramText += `<b>🧾 Reference ID:</b> ${instapay_reference}\n`;
        telegramText += `<b>🎁 Points Earned:</b> ${pointsEarned}\n\n`;
        telegramText += `<b>📦 Order Details:</b>\n`;
        items.forEach(item => {
            telegramText += `• ${item.name} (${item.quantity}x)\n`;
            if (item.giftOption) {
                telegramText += `  └ 🎁 Gift: ${item.giftOption.name} (+EGP ${item.giftOption.price})\n`;
            }
        });
        telegramText += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`;

        await sendTelegramMessage(telegramText);

        // Send confirmation to the Customer if they checked out via Telegram
        if (telegramChatId) {
            let customerTgText = `<b>🎉 Thank You for Your Order, ${customer.name}!</b>\n`;
            customerTgText += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;
            customerTgText += `<b>🧾 Order ID:</b> #${dbOrderId}\n`;
            customerTgText += `<b>💰 Total:</b> EGP ${finalTotal.toLocaleString()}\n`;
            customerTgText += `<b>🎁 Points Earned:</b> ${pointsEarned}\n\n`;
            customerTgText += `We have received your order and will contact you shortly to confirm delivery.`;

            await sendTelegramMessage(customerTgText, telegramChatId);
        }

        // ... (Send Email)
        // Reconstruct Email HTML with itemsHtml
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #1a1a1a; color: #d4af37; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
                    .content { padding: 30px; color: #333333; line-height: 1.6; }
                    .section { margin-bottom: 25px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px; }
                    .details-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    .details-table th { text-align: left; color: #666; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #eee; }
                    .total-row td { border-top: 2px solid #333; font-weight: bold; font-size: 18px; color: #1a1a1a; padding-top: 15px; }
                    .footer { background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #888; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header"><h1>Cigar Lounge</h1></div>
                    <div class="content">
                        <div class="section">
                            <h2 style="margin-top: 0; color: #1a1a1a;">Order Confirmation #${dbOrderId}</h2>
                            <p>Thank you for your order, ${customer.name}.</p>
                            <p>You have earned <strong>${pointsEarned} Loyalty Points</strong>!</p>
                            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        </div>
                        <div class="section">
                            <table class="details-table">
                                <thead>
                                    <tr><th>Item</th><th style="text-align: right;">Qty</th><th style="text-align: right;">Price</th></tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                    <tr class="total-row">
                                        <td>Total</td>
                                        <td colspan="2" style="text-align: right;">EGP ${finalTotal.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="section">
                            <strong>Shipping To:</strong><br>
                            ${customer.street}, ${customer.city}<br>
                            ${customer.phone}
                        </div>
                    </div>
                    <div class="footer">&copy; ${new Date().getFullYear()} Cigar Lounge.</div>
                </div>
            </body>
            </html>
        `;

        try {
            // NOTE: On Resend Free Tier, you can ONLY send to the email you registered with (remonsabry44@gmail.com)
            // unless you verify a domain.
            // For now, we will send to the admin (remonsabry44) as a notification, 
            // and try to send to customer if possible (or log warning).

            const adminEmail = 'remonsabry44@gmail.com'; // Verified sender/receiver on free tier usually

            // 1. Send Admin Notification
            await resend.emails.send({
                from: 'Cigar Lounge Orders <onboarding@resend.dev>',
                to: adminEmail,
                subject: `New Order Received #${dbOrderId}`,
                html: `<p>New Order from ${customer.name} (${customer.email})</p>` + emailHtml,
            });

            // 2. Try to send to Customer (Might fail on free tier if not verified)
            if (customer.email !== adminEmail) {
                await resend.emails.send({
                    from: 'Cigar Lounge <onboarding@resend.dev>',
                    to: customer.email,
                    subject: `Order Confirmation #${dbOrderId}`,
                    html: emailHtml,
                });
            }
        } catch (emailError) {
            console.error("[API] Resend Error:", JSON.stringify(emailError));
        }

        // --- 4. SEND PUSH NOTIFICATION (If user has opted in) ---
        if (customer.email) {
            try {
                await sendPushNotification({
                    title: 'Order Confirmed! 🎉',
                    body: `Your order #${dbOrderId} for EGP ${finalTotal.toLocaleString()} is being prepared.`,
                    url: '/account',
                    targetType: 'specific',
                    targetEmails: [customer.email]
                });
                
                // Admin Notification
                await sendPushNotification({
                    title: 'New Order Received',
                    body: `Order #${dbOrderId} - EGP ${finalTotal.toLocaleString()}`,
                    url: '/admin',
                    targetType: 'specific',
                    targetEmails: ['admin@cigarlounge.com', 'remonsabry44@gmail.com'] // Adjust to actual admin emails
                });
            } catch (pushErr) {
                console.error("[API] Push Notification Error:", pushErr);
            }
        }

        return NextResponse.json({ success: true, dbOrderId });

    } catch (error) {
        console.error("Order API Error:", error.message);
        return NextResponse.json({ success: false, error: 'Failed to process order', details: error.message }, { status: 500 });
    }
}
