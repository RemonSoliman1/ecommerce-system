import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        const { email, weekend_start_day } = await request.json();

        if (!email || !weekend_start_day) {
            return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Determine stock up day (2 days before)
        const preferred_stockup_day = weekend_start_day === 6 ? 4 : 3;

        const { error } = await supabaseAdmin
            .from('users')
            .update({ weekend_start_day, preferred_stockup_day })
            .eq('id', user.id);

        if (error) {
            return Response.json({ success: false, error: error.message }, { status: 500 });
        }

        return Response.json({ success: true });

    } catch (error) {
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
