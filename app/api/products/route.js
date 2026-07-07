
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push';
import { broadcastTelegramMessage, broadcastTelegramMediaGroup } from '@/lib/telegram';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey); // Keep for GET requests (public)

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Re-use logic for PUT (Update)
export async function PUT(request) {
    return POST(request);
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Proactive Payload Cleaning: PostgreSQL strictly rejects "" for numeric/uuid columns
        Object.keys(body).forEach(key => {
            // Skip booleans outright to avoid mutation
            if (typeof body[key] === 'boolean') {
                return;
            }

            // Convert empty strings to null safely
            if (body[key] === '') {
                body[key] = null;
            }
        });

        // 1. Enforce strict Database Schema Types for Top-Level numeric columns
        if (body.price !== undefined && body.price !== null) {
            body.price = parseFloat(body.price) || 0;
        }
        // Removed the artificial float parsing for 'rating' so it can store text like "93 Points - Cigar Snob"

        // Clean internal JSONB arrays natively if needed
        if (Array.isArray(body.models)) {
            body.models = body.models.map(m => {
                m.price = parseFloat(m.price) || 0;
                m.stock = parseInt(m.stock) || 0;

                // Inject available_gifts inside the JSONB model to bypass schema limits
                if (body.available_gifts !== undefined) {
                    m.product_available_gifts = body.available_gifts;
                }
                return m;
            });
        }

        // Strip out top-level transient properties that don't belong in the static DB Schema
        if (body.hasOwnProperty('available_gifts')) {
            delete body.available_gifts;
        }
        if (body.hasOwnProperty('sampler_series')) {
            delete body.sampler_series;
        }

        // 1. Authorization Check
        if (body.admin_secret !== 'admin@129') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Remove secret from payload
        delete body.admin_secret;

        // 2. Use Admin Client to Insert (Bypasses RLS)
        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }
        const isNew = request.method === 'POST';

        let oldProduct = null;
        if (!isNew && supabaseAdmin && body.id) {
            const { data: oldData } = await supabaseAdmin.from('products').select('*').eq('id', body.id).single();
            oldProduct = oldData;
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .upsert(body)
            .select()
            .single();

        if (error) throw error;

        // Dispatch new arrival push
        if (isNew && data) {
            try {
                await sendPushNotification({
                    title: 'New Arrival! 🌟',
                    body: `${data.name} has just been added to our humidor.`,
                    url: `/product/${data.id}`,
                    image: data.image,
                    targetType: 'all'
                });
            } catch (pushErr) {
                console.error("New Arrival push failed:", pushErr);
            }

            // Dispatch Telegram Single-Item Drop (Multi-Photo)
            try {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';
                const stripHtml = (html) => html ? html.replace(/<[^>]+>/g, '') : '';
                const briefDescription = stripHtml(data.description).substring(0, 150) + (stripHtml(data.description).length > 150 ? '...' : '');
                const vitola = data.models && data.models.length > 0 ? data.models[0].size : 'Standard';
                const notes = Array.isArray(data.flavor_profile) ? data.flavor_profile.join(', ') : (data.flavor_profile || '');

                const telegramText = `🔥 NEW ARRIVAL: ${data.name} 🔥\n\n` +
                `📏 Vitola: ${vitola}\n` +
                `${notes ? `🌿 Notes: ${notes}\n` : ''}\n` +
                `📝 ${briefDescription}\n\n` +
                `👉 View details & price: ${siteUrl}/product/${data.id}`;
                
                const targetGroup = process.env.TELEGRAM_GROUP_ID || '-1003609408005';
                
                let mediaArray = [];
                const imagesToSend = data.images && data.images.length > 0 ? data.images.slice(0, 10) : (data.image ? [data.image] : []);
                
                    if (imagesToSend.length > 0) {
                        mediaArray = imagesToSend.map((img, index) => ({
                            type: 'photo',
                            media: img,
                            caption: index === 0 ? telegramText : undefined,
                            parse_mode: 'HTML'
                        }));
                        await broadcastTelegramMediaGroup(mediaArray);
                    } else {
                        await broadcastTelegramMessage(telegramText, null);
                    }
                    
                    // Add Push Notification for New Arrival
                    await sendPushNotification({
                        title: `✨ New Arrival: ${data.name}`,
                        body: 'Check out the latest addition to our humidor!',
                        url: `/product/${data.id}`,
                        targetType: 'all'
                    });
            } catch (tgErr) {
                console.error("New Arrival Telegram dispatch failed:", tgErr);
            }
        } else if (!isNew && data && oldProduct) {
            // Check for restock, price drop, or new variants
            try {
                let restockedVariant = null;
                let newVariant = null;
                let priceDropVariant = null;
                let discountAddedVariant = null;
                let freeShippingAdded = false;
                
                const oldModels = oldProduct.models || [];
                const newModels = data.models || [];
                
                const oldBadges = (oldProduct.badges || []).map(b => b.toLowerCase().replace(/\s+/g, ''));
                const newBadges = (data.badges || []).map(b => b.toLowerCase().replace(/\s+/g, ''));
                
                if (!oldBadges.includes('freeshipping') && newBadges.includes('freeshipping')) {
                    freeShippingAdded = true;
                }
                
                for (const newMod of newModels) {
                    const oldMod = oldModels.find(m => m.size === newMod.size && m.name === newMod.name);
                    if (!oldMod) {
                        newVariant = newMod;
                        break;
                    } else {
                        if (Number(newMod.stock) > Number(oldMod.stock) && Number(oldMod.stock) === 0) {
                            restockedVariant = newMod;
                        }
                        if (Number(newMod.price) < Number(oldMod.price)) {
                            priceDropVariant = newMod;
                        }
                        // Detect newly added discount (original_price is newly set higher than price)
                        const oldHasDiscount = Number(oldMod.original_price) > Number(oldMod.price);
                        const newHasDiscount = Number(newMod.original_price) > Number(newMod.price);
                        if (!oldHasDiscount && newHasDiscount) {
                            discountAddedVariant = newMod;
                        }
                    }
                }
                
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cigar-lounge-one.vercel.app';
                let telegramText = '';
                let pushTitle = '';
                let pushBody = '';

                const hasFreeShipping = newBadges.includes('freeshipping') || newBadges.includes('free shipping');
                const getPromoStr = (variant) => {
                    let str = '';
                    if (variant.original_price > variant.price) {
                        const pct = Math.round(((variant.original_price - variant.price) / variant.original_price) * 100);
                        str += `🔥 ${pct}% OFF! Now EGP ${variant.price} (was ${variant.original_price})`;
                    } else {
                        str += `💵 Price: EGP ${variant.price}`;
                    }
                    if (hasFreeShipping) str += `\n🚚 + Free Shipping!`;
                    return str;
                };

                if (newVariant) {
                    telegramText = `✨ NEW SIZE ADDED: ${data.name} ✨\n\n📏 Vitola: ${newVariant.size}\n${getPromoStr(newVariant)}\n👉 ${siteUrl}/product/${data.id}`;
                    pushTitle = `✨ New Size: ${data.name}`;
                    pushBody = `${newVariant.size} is now available!`;
                } else if (freeShippingAdded) {
                    telegramText = `🚚 FREE SHIPPING UNLOCKED: ${data.name} 🚚\n\nOrder now and get it delivered for free!\n👉 ${siteUrl}/product/${data.id}`;
                    pushTitle = `🚚 Free Shipping: ${data.name}`;
                    pushBody = `Order now and get it delivered for free!`;
                } else if (restockedVariant) {
                    telegramText = `♻️ BACK IN STOCK: ${data.name} ♻️\n\n📏 Vitola: ${restockedVariant.size}\n${getPromoStr(restockedVariant)}\n👉 ${siteUrl}/product/${data.id}`;
                    pushTitle = `♻️ Back in Stock: ${data.name}`;
                    pushBody = `${restockedVariant.size} is back in the humidor!`;
                } else if (priceDropVariant) {
                    telegramText = `📉 PRICE DROP: ${data.name} 📉\n\n📏 Vitola: ${priceDropVariant.size}\n${getPromoStr(priceDropVariant)}\n👉 ${siteUrl}/product/${data.id}`;
                    pushTitle = `📉 Price Drop: ${data.name}`;
                    pushBody = `${priceDropVariant.size} is now EGP ${priceDropVariant.price}!`;
                } else if (discountAddedVariant) {
                    telegramText = `🔥 SPECIAL DISCOUNT: ${data.name} 🔥\n\n📏 Vitola: ${discountAddedVariant.size}\n${getPromoStr(discountAddedVariant)}\n👉 ${siteUrl}/product/${data.id}`;
                    const discountPercent = Math.round(((discountAddedVariant.original_price - discountAddedVariant.price) / discountAddedVariant.original_price) * 100);
                    pushTitle = `🔥 ${discountPercent}% OFF: ${data.name}`;
                    pushBody = `${discountAddedVariant.size} is now ${discountPercent}% OFF!`;
                }
                
                if (telegramText) {
                    const targetGroup = process.env.TELEGRAM_GROUP_ID || '-1003609408005';
                    let mediaArray = [];
                    const imagesToSend = data.images && data.images.length > 0 ? data.images.slice(0, 10) : (data.image ? [data.image] : []);
                    
                    if (imagesToSend.length > 0) {
                        mediaArray = imagesToSend.map((img, index) => ({
                            type: 'photo',
                            media: img,
                            caption: index === 0 ? telegramText : undefined,
                            parse_mode: 'HTML'
                        }));
                        await broadcastTelegramMediaGroup(mediaArray);
                    } else {
                        await broadcastTelegramMessage(telegramText, null);
                    }
                    
                    // Broadcast via Push Notification
                    try {
                        await sendPushNotification({
                            title: pushTitle,
                            body: pushBody,
                            url: `/product/${data.id}`,
                            targetType: 'all'
                        });
                    } catch (pErr) {
                        console.error("Push Notification dispatch failed:", pErr);
                    }
                }
            } catch (tgErr) {
                console.error("Restock Telegram dispatch failed:", tgErr);
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const adminSecret = searchParams.get('admin_secret');

        if (adminSecret !== 'admin@129') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Admin client not available');
        }

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
