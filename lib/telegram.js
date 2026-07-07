import { supabaseAdmin as supabase } from './supabaseAdmin';

export async function sendTelegramMessage(text, targetChatId = null) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = targetChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
        console.error("Telegram credentials missing");
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Telegram API Error:", errorData);
        }
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
    }
}

export async function sendTelegramPhoto(imageUrl, caption, targetChatId = null) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = targetChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
        console.error("Telegram credentials missing for photo");
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendPhoto`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                photo: imageUrl,
                caption: caption,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Telegram API Error (Photo):", errorData);
        }
    } catch (error) {
        console.error("Failed to send Telegram photo:", error);
    }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
// Using admin key for reliable user fetching in background
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function broadcastTelegramMessage(text, photoUrl = null) {
    const groupId = process.env.TELEGRAM_GROUP_ID || '-1003609408005';
    
    // 1. Send to Group (if configured)
    if (groupId) {
        if (photoUrl) {
            await sendTelegramPhoto(photoUrl, text, groupId);
        } else {
            await sendTelegramMessage(text, groupId);
        }
    }

    if (!supabase) {
        console.error("Supabase Admin client missing for broadcast");
        return;
    }

    // 2. Fetch all telegram users
    try {
        const { data: users, error } = await supabase
            .from('telegram_users')
            .select('telegram_id')
            .not('telegram_id', 'is', null);

        if (error) throw error;
        
        if (!users || users.length === 0) return;

        // 3. Loop and send with 50ms delay
        for (const user of users) {
            if (!user.telegram_id) continue;
            
            try {
                if (photoUrl) {
                    await sendTelegramPhoto(photoUrl, text, user.telegram_id);
                } else {
                    await sendTelegramMessage(text, user.telegram_id);
                }
            } catch (err) {
                console.error(`Failed to broadcast to ${user.telegram_id}:`, err);
            }
            
            // Respect Telegram rate limits (approx 30 msgs/second = 33ms, using 50ms to be safe)
            await new Promise(r => setTimeout(r, 50));
        }
    } catch (err) {
        console.error("Failed to broadcast message to users:", err);
    }
}

export async function sendTelegramMediaGroup(mediaArray, targetChatId = null) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = targetChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
        console.error("Telegram credentials missing for media group");
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMediaGroup`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                media: mediaArray,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Telegram API Error:", errorData);
        }
    } catch (error) {
        console.error("Failed to send Telegram media group:", error);
    }
}

export async function broadcastTelegramMediaGroup(mediaArray) {
    const groupId = process.env.TELEGRAM_GROUP_ID || '-1003609408005';
    
    // 1. Send to Group (if configured)
    if (groupId) {
        await sendTelegramMediaGroup(mediaArray, groupId);
    }

    if (!supabase) {
        console.error("Supabase Admin client missing for broadcast");
        return;
    }

    // 2. Fetch all telegram users
    try {
        const { data: users, error } = await supabase
            .from('telegram_users')
            .select('telegram_id')
            .not('telegram_id', 'is', null);

        if (error) throw error;
        
        if (!users || users.length === 0) return;

        // 3. Loop and send with 50ms delay
        for (const user of users) {
            if (!user.telegram_id) continue;
            
            try {
                await sendTelegramMediaGroup(mediaArray, user.telegram_id);
            } catch (err) {
                console.error(`Failed to broadcast media group to ${user.telegram_id}:`, err);
            }
            
            // Respect Telegram rate limits (approx 30 msgs/second = 33ms, using 50ms to be safe)
            await new Promise(r => setTimeout(r, 50));
        }
    } catch (err) {
        console.error("Failed to broadcast media group to users:", err);
    }
}
