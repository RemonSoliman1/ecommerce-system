import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import webpush from 'web-push';

// Keys will be set inside the handler
let isWebPushInitialized = false;

function initWebPush() {
    if (!isWebPushInitialized) {
        try {
            webpush.setVapidDetails(
                process.env.VAPID_SUBJECT || 'mailto:test@example.com',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMYvV3yI-H9hZ-r_d6O5g3YwH-_u9v-T7c_lX9T8c_u5l-X_y9d_rZ',
                process.env.VAPID_PRIVATE_KEY || 'y-9_u_5_d_Z_v_y_w_X_c_l_T_8_r_H_O_I_V_M_B_5_g_3_Y_w_H_9_h_Z_r'
            );
            isWebPushInitialized = true;
        } catch (e) {
            console.error("Failed to initialize webpush:", e.message);
        }
    }
}

export async function GET(request) {
    // Vercel Cron sends a secure header we can check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        // Return 401 if unauthorized in prod
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        // 2. Future Automations (e.g. Picks for you, New Arrivals)
        // Can be implemented similarly by picking random featured products 
        // and sending to all users once a week based on the current day of week.
        
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 5) { // Friday = "Weekend Picks for You"
             // get all subs
             const { data: allSubs } = await supabaseAdmin.from('push_subscriptions').select('subscription_data');
             if (allSubs) {
                 const weekendPayload = JSON.stringify({
                    title: 'Weekend Picks for You 🥃',
                    body: 'Stock up for the weekend. Check out our curated selection of fine cigars.',
                    url: '/shop',
                 });
                 for (const sub of allSubs) {
                    try {
                        await webpush.sendNotification(sub.subscription_data, weekendPayload);
                        messagesSent++;
                    } catch (e) { console.error('Push failed', e); }
                }
             }
        }

        return NextResponse.json({ success: true, messagesSent });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
