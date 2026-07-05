
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
    try {
        let { email, password } = await request.json();
        
        email = email ? email.trim().toLowerCase() : '';

        // 1. Get User
        // Handle special characters and spaces correctly for PostgREST
        const safeId = email.replace(/"/g, '""');
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq."${safeId}",name.eq."${safeId}",phone.eq."${safeId}"`)
            .single();

        if (error && error.code !== 'PGRST116') {
            // This is a real database error (outage, network failure)
            console.error("Supabase Login Error:", error);
            return Response.json({ success: false, error: 'Database connection failed. Please try again later.' }, { status: 503 });
        }

        if (!user) {
            return Response.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }

        // 2. Check Password (Simple check for now)
        if (user.password !== password) {
            return Response.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }

        // 3. Return User Data (exclude password)
        const { password: _, ...userWithoutPassword } = user;

        // Fire and forget update to last_active_at and buffer
        supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id).then();
        supabase.from('weekly_visit_buffer').insert([{ user_id: user.id, visited_at: new Date().toISOString() }]).then();

        return Response.json({ 
            success: true, 
            user: userWithoutPassword,
            username: user.name || 'Aficionado'
        });

    } catch (error) {
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
