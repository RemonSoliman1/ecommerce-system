import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const body = await request.json();
        const { user_id, event_type, target_id, metadata = {} } = body;

        if (!event_type) {
            return Response.json({ success: false, error: 'event_type is required' }, { status: 400 });
        }

        const logEntry = {
            event_type,
            target_id: target_id || null,
            metadata
        };

        if (user_id) {
            logEntry.user_id = user_id;
        }

        const { error } = await supabaseAdmin
            .from('activity_logs')
            .insert([logEntry]);

        if (error) {
            console.error('Tracking insert error:', error);
            // Non-blocking for the client, so return 200 even on insert fail
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Tracking API Error:', error);
        // Fail silently for tracking
        return Response.json({ success: false });
    }
}
