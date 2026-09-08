import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const body = await request.json();
        const { title, body: messageBody, icon, url, targetType, targetEmails, targetTiers } = body;

        const result = await sendPushNotification({
            title,
            body: messageBody,
            url,
            image: icon,
            targetType,
            targetEmails,
            targetTiers
        });

        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, successCount: result.successCount, failCount: result.failCount });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
