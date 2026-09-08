
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { email, code, newPassword } = await request.json();

        if (!email || !code || !newPassword) {
            return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // SEC-1: Enforce minimum password length server-side
        if (newPassword.length < 8) {
            return Response.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // 1. Verify Token
        const { data: tokenData } = await supabase
            .from('verification_tokens')
            .select('*')
            .eq('email', email)
            .eq('token', code)
            .eq('type', 'password_reset')
            .gt('expires_at', new Date().toISOString()) // Check expiration
            .single();

        if (!tokenData) {
            return Response.json({ success: false, error: 'Invalid or expired code.' }, { status: 400 });
        }

        // 2. SEC-1: Hash the new password before storing
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (updateError) {
            console.error('Update Password Error:', updateError);
            return Response.json({ success: false, error: 'Failed to update password' }, { status: 500 });
        }

        // 3. Delete used token (prevents replay)
        await supabase
            .from('verification_tokens')
            .delete()
            .eq('id', tokenData.id);

        // 4. Send Confirmation Email
        await resend.emails.send({
            from: 'Cigar Lounge <onboarding@resend.dev>',
            to: email,
            subject: 'Password Changed - Cigar Lounge',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Changed Successfully</h2>
                    <p>Your password has been updated. If you did not make this change, please contact support immediately.</p>
                    
                     <p style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" style="background: #c6a87c; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
                    </p>
                </div>
            `
        }).catch(err => console.error('Confirmation email failed:', err));

        return Response.json({ success: true });

    } catch (error) {
        console.error('Reset Password API Error:', error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
