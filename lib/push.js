import webpush from 'web-push';
import { supabaseAdmin } from './supabaseAdmin';

let isWebPushInitialized = false;

export function initWebPush() {
    if (!isWebPushInitialized) {
        try {
            webpush.setVapidDetails(
                process.env.VAPID_SUBJECT || 'mailto:admin@cigarlounge.com',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BIM_6RpJruOaN5YKWMiE_KGvC1f95wcjlNJFS643-QSSM4HMVuehQthclAzYaBu-G9v_QRoFcXuvqEhcNTQiQ2w',
                process.env.VAPID_PRIVATE_KEY || 'WVaaFfkBuwW30Xpv8P32_trc2F2ccajGI3ita2cnbZg'
            );
            isWebPushInitialized = true;
        } catch (e) {
            console.error("Failed to initialize webpush:", e.message);
        }
    }
}

/**
 * Send a web push notification
 * @param {Object} options - Push options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {string} options.url - Target URL when clicked
 * @param {string} options.image - Image URL
 * @param {string} options.targetType - 'all', 'specific', 'vip'
 * @param {Array<string>} options.targetEmails - Array of emails for 'specific' target
 * @param {Array<string>} options.targetTiers - Array of tier IDs for 'vip' target
 * @returns {Promise<{successCount: number, failCount: number}>}
 */
export async function sendPushNotification({ title, body, url, image, targetType = 'all', targetEmails = [], targetTiers = [] }) {
    initWebPush();
    
    let query = supabaseAdmin.from('push_subscriptions').select('subscription_data, user_id');
    
    if (targetType === 'specific' && targetEmails && targetEmails.length > 0) {
        const { data: userData } = await supabaseAdmin.from('users').select('id').in('email', targetEmails);
        if (userData && userData.length > 0) {
            const ids = userData.map(u => u.id);
            query = query.in('user_id', ids);
        } else {
            return { successCount: 0, failCount: 0, error: 'Users not found' };
        }
    } else if (targetType === 'vip' && targetTiers && targetTiers.length > 0) {
        const { data: vipProfiles } = await supabaseAdmin.from('loyalty_profiles').select('user_id').in('tier_id', targetTiers);
        if (vipProfiles && vipProfiles.length > 0) {
            const vipIds = vipProfiles.map(p => p.user_id);
            query = query.in('user_id', vipIds);
        } else {
            return { successCount: 0, failCount: 0, error: 'No VIP users found' };
        }
    }

    const { data: subscriptions, error } = await query;
    if (error || !subscriptions) return { successCount: 0, failCount: 0, error: error?.message || 'No subscriptions' };

    const payload = JSON.stringify({
        title: title || 'CigarLounge',
        body: body,
        url: url || '/',
        image: image || null
    });

    let successCount = 0;
    let failCount = 0;

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(sub.subscription_data, payload);
            successCount++;
        } catch (err) {
            // Remove broken subscription if expired/unsubscribed
            if (err.statusCode === 410 || err.statusCode === 404) {
                await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', sub.user_id).eq('subscription_data->endpoint', sub.subscription_data.endpoint);
            }
            failCount++;
        }
    }

    return { successCount, failCount };
}
