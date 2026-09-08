
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return Response.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
        }

        // 1. Check if user exists
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();

        if (!user) {
            // Security: Don't reveal if email exists — return success either way
            // This prevents email enumeration attacks
            return Response.json({ success: true });
        }

        // 2. Generate Reset Token (6-digit code)
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Store Token with type 'password_reset'
        const { error: tokenError } = await supabase
            .from('verification_tokens')
            .insert([{
                email: email.trim().toLowerCase(),
                token,
                type: 'password_reset',
                expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
            }]);

        if (tokenError) {
            console.error('Save Token Error:', tokenError);
            return Response.json({ success: false, error: 'Failed to create reset token' }, { status: 500 });
        }

        // 4. Send Email
        if (!process.env.RESEND_API_KEY) {
            if (process.env.NODE_ENV !== 'production') {
                // SEC-7: Dev mode only — log token to console, never to response
                console.log(`[DEV] Password reset token for ${email}: ${token}`);
            }
            return Response.json({ success: true });
        }

        const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?email=${encodeURIComponent(email)}&code=${token}`;

        const { error: emailError } = await resend.emails.send({
            from: 'Cigar Lounge <onboarding@resend.dev>',
            to: email,
            subject: 'Reset Your Password - Cigar Lounge',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. If this wasn't you, please ignore this email.</p>
                    
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${token}</span>
                    </div>

                    <p style="text-align: center;">
                        <a href="${resetLink}" style="background: #c6a87c; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </p>
                </div>
            `
        });

        if (emailError) {
            console.error('Resend Error:', emailError);
            // SEC-7: Never return the token in production
            if (process.env.NODE_ENV !== 'production' &&
                (emailError.statusCode === 403 || emailError.name === 'validation_error')) {
                console.log(`[DEV] Reset token for ${email}: ${token}`);
                return Response.json({ success: true, warning: 'Email not sent (Resend Free Tier). Check server console for token.' });
            }
            return Response.json({ success: false, error: 'Failed to send reset email' }, { status: 500 });
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error('Forgot Password API Error:', error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
