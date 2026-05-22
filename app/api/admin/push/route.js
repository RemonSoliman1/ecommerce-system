import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push';

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, body: messageBody, icon, url, targetType, targetEmails, targetTiers } = body;

        // Verify Admin Authorization (simplified for now)
        if (request.headers.get('authorization') !== `Bearer admin@129` && body.admin_secret !== 'admin@129') {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
