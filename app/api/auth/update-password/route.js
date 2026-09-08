
import { supabase } from '@/lib/supabaseClient';
import { verifySession } from '@/lib/session';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        // SEC-6: Require a valid session cookie before allowing password change
        const userId = verifySession(request);
        if (!userId) {
            return Response.json({ success: false, error: 'Unauthorized: You must be logged in to change your password' }, { status: 401 });
        }

        const { email, newPassword } = await request.json();

        if (!email || !newPassword) {
            return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // SEC-1: Enforce minimum password length server-side
        if (newPassword.length < 8) {
            return Response.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Verify the session user matches the email being changed (prevent one user changing another's password)
        const { data: sessionUser } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', userId)
            .single();

        if (!sessionUser || sessionUser.email.toLowerCase() !== email.toLowerCase()) {
            return Response.json({ success: false, error: 'Forbidden: Session does not match the requested account' }, { status: 403 });
        }

        // 1. SEC-1: Hash the new password before storing
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (updateError) {
            console.error('Update Password Error:', updateError);
            return Response.json({ success: false, error: 'Failed to update password' }, { status: 500 });
        }

        // 2. Send Confirmation Email
        if (process.env.RESEND_API_KEY) {
            resend.emails.send({
                from: 'Cigar Lounge <onboarding@resend.dev>',
                to: email,
                subject: 'Security Alert: Password Changed',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Password Updated</h2>
                        <p>The password for your Cigar Lounge account was just changed.</p>
                        <p>If you made this change, you can safely ignore this email.</p>
                        <p style="color: red; margin-top: 20px;">If you did not authorize this change, please contact support immediately.</p>
                    </div>
                `
            }).catch(err => console.error('Security alert email failed:', err));
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error('Update Password API Error:', error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
