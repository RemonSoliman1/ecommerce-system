import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import webpush from 'web-push';

// Keys will be set inside the handler
let isWebPushInitialized = false;

function initWebPush() {
    if (!isWebPushInitialized) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        const subject = process.env.VAPID_SUBJECT || 'mailto:admin@cigarlounge.com';

        if (!publicKey || !privateKey) {
            throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are required for push notifications.');
        }

        try {
            webpush.setVapidDetails(subject, publicKey, privateKey);
            isWebPushInitialized = true;
        } catch (e) {
            console.error("Failed to initialize webpush:", e.message);
            throw e;
        }
    }
}

export async function GET(request) {
    // SEC-8: Verify Vercel Cron secret header
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        initWebPush();
        let messagesSent = 0;

        // Fetch dynamic settings from system_settings
        let birthdayConfig = {
            title: 'Happy Birthday from CigarLounge! 🎉',
            body: 'Wishing you a fantastic day! Enjoy an exclusive Birthday Gift added to your account.',
            url: '/shop',
            image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=800',
            enabled: true
        };
        let upcomingConfig = {
            title: 'Your Birthday is almost here! 🎂',
            body: 'Stock up now so you have the perfect smoke ready to celebrate your special day.',
            url: '/shop',
            image: 'https://images.unsplash.com/photo-1527005980469-e1724f6e1f0e?auto=format&fit=crop&q=80&w=800',
            enabled: true
        };

        try {
            const { data: settingsData } = await supabaseAdmin.from('system_settings').select('*');
            if (settingsData) {
                const bday = settingsData.find(s => s.key === 'birthday_automation');
                if (bday && bday.value) birthdayConfig = { ...birthdayConfig, ...bday.value };
                
                const upbday = settingsData.find(s => s.key === 'upcoming_birthday_automation');
                if (upbday && upbday.value) upcomingConfig = { ...upcomingConfig, ...upbday.value };
            }
        } catch (e) {
            console.log("system_settings table might not exist yet, using default birthday text.");
        }

        // 1. Birthday Notifications
        const now = new Date();
        
        // A. Day-Of Birthday (Midnight / Today)
        if (birthdayConfig.enabled) {
            const todayStr = now.toISOString().substring(5, 10); // MM-DD
            const { data: birthdayUsers } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .like('dob', `%${todayStr}%`);

            if (birthdayUsers && birthdayUsers.length > 0) {
                const userIds = birthdayUsers.map(u => u.id);
                const { data: subs } = await supabaseAdmin
                    .from('push_subscriptions')
                    .select('subscription_data, user_id')
                    .in('user_id', userIds);

                if (subs && subs.length > 0) {
                    const bdayPayload = JSON.stringify({
                        title: birthdayConfig.title,
                        body: birthdayConfig.body,
                        url: birthdayConfig.url,
                        image: birthdayConfig.image
                    });

                    for (const sub of subs) {
                        try {
                            await webpush.sendNotification(sub.subscription_data, bdayPayload);
                            messagesSent++;
                        } catch (e) { console.error('Push failed', e); }
                    }
                }
            }
        }

        // B. Pre-Birthday Reminder (e.g., 5 days before)
        if (upcomingConfig.enabled) {
            const reminderDate = new Date();
            reminderDate.setDate(reminderDate.getDate() + 5);
            const reminderStr = reminderDate.toISOString().substring(5, 10); // MM-DD

            const { data: upcomingBirthdayUsers } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .like('dob', `%${reminderStr}%`);

            if (upcomingBirthdayUsers && upcomingBirthdayUsers.length > 0) {
                const upcomingUserIds = upcomingBirthdayUsers.map(u => u.id);
                const { data: upcomingSubs } = await supabaseAdmin
                    .from('push_subscriptions')
                    .select('subscription_data, user_id')
                    .in('user_id', upcomingUserIds);

                if (upcomingSubs && upcomingSubs.length > 0) {
                    const reminderPayload = JSON.stringify({
                        title: upcomingConfig.title,
                        body: upcomingConfig.body,
                        url: upcomingConfig.url,
                        image: upcomingConfig.image
                    });

                    for (const sub of upcomingSubs) {
                        try {
                            await webpush.sendNotification(sub.subscription_data, reminderPayload);
                            messagesSent++;
                        } catch (e) { console.error('Push failed', e); }
                    }
                }
            }
        }

        // --- 2. Dynamic Smart Dispatching ---
        const nowUtc = new Date();
        const cairoDateStr = nowUtc.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
        const cairoDate = new Date(cairoDateStr);
        const currentLocalHour = cairoDate.getHours();
        const currentLocalDay = cairoDate.getDay();

        // Query users whose preferred_engagement_time matches currentLocalHour
        // AND who are NOT Dormant
        const { data: targetUsers } = await supabaseAdmin
            .from('users')
            .select('id, activity_status, preferred_stockup_day, weekend_start_day, last_notified_inactive_at')
            .eq('preferred_engagement_time', currentLocalHour)
            .neq('activity_status', 'Dormant');

        if (targetUsers && targetUsers.length > 0) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            for (const user of targetUsers) {
                let payload = null;
                let shouldUpdateInactiveTimestamp = false;

                if (user.activity_status === 'Slipping') {
                    // Check if we haven't notified them in 7 days
                    const lastNotified = user.last_notified_inactive_at ? new Date(user.last_notified_inactive_at) : null;
                    if (!lastNotified || lastNotified < sevenDaysAgo) {
                        payload = {
                            title: 'We’ve Missed You 🎩',
                            body: 'It’s been a while. Treat yourself to our latest collection of premium cigars with a special welcome-back discount.',
                            url: '/shop'
                        };
                        shouldUpdateInactiveTimestamp = true;
                    }
                } else {
                    // Active Users
                    if (currentLocalDay === user.preferred_stockup_day) {
                        payload = {
                            title: 'Weekend Picks for You 🥃',
                            body: 'Stock up for the weekend. Check out our curated selection of fine cigars.',
                            url: '/shop'
                        };
                    } else if (currentLocalDay === user.weekend_start_day) {
                        payload = {
                            title: 'Enjoy Your Weekend! 🚬',
                            body: 'What are you in the mood for today? Browse our collection and find your perfect smoke.',
                            url: '/shop'
                        };
                    }
                }

                if (payload) {
                    const { data: subs } = await supabaseAdmin.from('push_subscriptions').select('subscription_data').eq('user_id', user.id);
                    if (subs && subs.length > 0) {
                        for (const sub of subs) {
                            try {
                                await webpush.sendNotification(sub.subscription_data, JSON.stringify(payload));
                                messagesSent++;
                            } catch (e) {}
                        }
                    }
                    
                    if (shouldUpdateInactiveTimestamp) {
                        await supabaseAdmin.from('users').update({ last_notified_inactive_at: new Date().toISOString() }).eq('id', user.id);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, messagesSent });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
