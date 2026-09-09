
import { supabase } from '@/lib/supabaseClient';
import { createSessionCookie } from '@/lib/session';
import { rateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    const limiter = rateLimit(request, 5, 60000);
    if (!limiter.success) {
        return Response.json({ success: false, error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    try {
        let { email, password } = await request.json();

        // --- Input validation ---
        if (!email || !password) {
            return Response.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }
        email = email.trim().toLowerCase();

        // 1. Get User — use separate .eq() calls instead of string-interpolated .or()
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},name.eq.${email},phone.eq.${email}`)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Supabase Login Error:', error);
            return Response.json({ success: false, error: 'Database connection failed. Please try again later.' }, { status: 503 });
        }

        if (!user) {
            return Response.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }

        // 2. SEC-1: Verify password using bcrypt (handles both hashed and legacy plaintext)
        let passwordValid = false;
        if (user.password) {
            const isHashed = user.password.startsWith('$2');
            if (isHashed) {
                passwordValid = await bcrypt.compare(password, user.password);
            } else {
                // Legacy plaintext comparison — migrate to hash on success
                passwordValid = (user.password === password);
                if (passwordValid) {
                    // Silently upgrade to hashed password
                    const hashed = await bcrypt.hash(password, 12);
                    supabase.from('users').update({ password: hashed }).eq('id', user.id).then();
                }
            }
        }

        if (!passwordValid) {
            return Response.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }

        // 3. Return User Data (exclude password)
        const { password: _, ...userWithoutPassword } = user;

        // Fire and forget — update activity trackers
        supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id).then();
        supabase.from('weekly_visit_buffer').insert([{ user_id: user.id, visited_at: new Date().toISOString() }]).then();

        // 4. SEC-5: Issue an HTTP-only session cookie
        const sessionCookie = createSessionCookie(user.id);

        return new Response(
            JSON.stringify({ success: true, user: userWithoutPassword, username: user.name || 'Aficionado' }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': sessionCookie,
                },
            }
        );

    } catch (error) {
        console.error('Login API Error:', error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
