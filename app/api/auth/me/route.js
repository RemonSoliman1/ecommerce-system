import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return Response.json({ user: null });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        return Response.json({ user: null });
    }

    // Fire and forget update to last_active_at and buffer
    supabaseAdmin.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id).then();
    supabaseAdmin.from('weekly_visit_buffer').insert([{ user_id: user.id, visited_at: new Date().toISOString() }]).then();

    const { password: _, ...userWithoutPassword } = user;
    return Response.json({ user: userWithoutPassword });
}
