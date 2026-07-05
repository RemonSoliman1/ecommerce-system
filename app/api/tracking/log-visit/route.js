import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const { email, user_id, source } = await request.json();

        let uid = user_id;

        // If email is provided but no user_id, fetch user_id
        if (!uid && email) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', email)
                .single();
            if (user) uid = user.id;
        }

        if (!uid) {
            return Response.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        // 1. Update last_active_at on users table (Churn Tracking)
        await supabaseAdmin
            .from('users')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', uid);

        // 2. Insert into TTL Buffer for Weekly Analysis (Behavior Tracking)
        await supabaseAdmin
            .from('weekly_visit_buffer')
            .insert([{ user_id: uid, visited_at: new Date().toISOString() }]);

        return Response.json({ success: true });
    } catch (error) {
        console.error("Log Visit Error:", error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
