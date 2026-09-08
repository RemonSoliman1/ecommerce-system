
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return Response.json({ success: false, error: 'Token is required' }, { status: 400 });
        }

        // 1. Find Token
        const { data: tokenData, error: tokenError } = await supabase
            .from('verification_tokens')
            .select('*')
            .eq('token', token)
            .single();

        if (tokenError || !tokenData) {
            return Response.json({ success: false, error: 'Invalid or expired code.' }, { status: 400 });
        }

        const email = tokenData.email;

        // 2. Update User to Verified
        const { error: updateUserError } = await supabase
            .from('users')
            .update({ verified: true })
            .eq('email', email);

        if (updateUserError) {
            return Response.json({ success: false, error: 'Failed to verify user.' }, { status: 500 });
        }

        // 3. Delete Token (Optional: keep for logs, or delete to prevent reuse)
        await supabase
            .from('verification_tokens')
            .delete()
            .eq('token', token);

        // 4. Return User Data for Auto-Login (exclude password)
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        const { password: _, ...userWithoutPassword } = userData || {};
        return Response.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
