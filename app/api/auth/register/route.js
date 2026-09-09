
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY);

// Basic email format validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
    const limiter = rateLimit(request, 3, 60000);
    if (!limiter.success) {
        return Response.json({ success: false, error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    try {
        const { name, email, password, dob, phone } = await request.json();

        // --- Server-side input validation ---
        if (!name || !email || !password) {
            return Response.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return Response.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
        }
        if (password.length < 8) {
            return Response.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // SEC-1: Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 12);

        // 1. Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, verified')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();

        if (existingUser) {
            if (existingUser.verified) {
                return Response.json({ success: false, error: 'Email already exists. Please login.' }, { status: 400 });
            } else {
                // User exists but not verified — update their details (in case they fixed a typo/password)
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ name, password: hashedPassword, dob, phone })
                    .eq('email', email.trim().toLowerCase());

                if (updateError) {
                    console.error('Update User Error:', updateError);
                    return Response.json({ success: false, error: 'Failed to update user details' }, { status: 500 });
                }
            }
        } else {
            // 2. Create User with hashed password
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    name,
                    email: email.trim().toLowerCase(),
                    password: hashedPassword,
                    dob,
                    phone,
                    verified: false
                }])
                .select()
                .single();

            if (createError) {
                console.error('Create User Error FULL OBJECT:', JSON.stringify(createError, null, 2));
                return Response.json({ success: false, error: 'Failed to create user: ' + (createError.message || createError.details || 'Unknown DB Error') }, { status: 500 });
            }
        }

        // 3. Generate Token (6-digit code)
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        // Store Token
        const { error: tokenError } = await supabase
            .from('verification_tokens')
            .insert([{ email: email.trim().toLowerCase(), token }]);

        if (tokenError) {
            console.error('Save Token Error:', tokenError);
            return Response.json({ success: false, error: 'Failed to save verification token' }, { status: 500 });
        }

        // 4. Send Email
        // SEC-7: Only expose token in non-production environments (no email key = dev mode)
        if (!process.env.RESEND_API_KEY) {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV MOCK EMAIL] To: ${email}, Code: ${token}`);
                return Response.json({ success: true, mock: true, token }); // Dev only
            }
            return Response.json({ success: false, error: 'Email service is not configured' }, { status: 500 });
        }

        const verifyLink = `${process.env.NEXT_PUBLIC_SITE_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;

        const { error: emailError } = await resend.emails.send({
            from: 'Cigar Lounge <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your Account - Cigar Lounge',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Cigar Lounge, ${name}!</h2>
                    <p>Please verify your email to complete your registration.</p>
                    
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${token}</span>
                    </div>

                    <p style="text-align: center;">
                        <a href="${verifyLink}" style="background: #c6a87c; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Account</a>
                    </p>

                    <p>Or copy the code above and enter it in the verification page.</p>
                </div>
            `
        });

        if (emailError) {
            console.error('Resend Error:', emailError);

            // SEC-7: GRACEFUL FALLBACK — only return token in non-production
            if (process.env.NODE_ENV !== 'production' &&
                (emailError.statusCode === 403 || emailError.name === 'validation_error')) {
                return Response.json({
                    success: true,
                    token, // Dev/staging only
                    warning: 'Resend Free Tier: Email not sent. Code returned for local testing only.'
                });
            }

            return Response.json({ success: false, error: 'Failed to send verification email' }, { status: 500 });
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error('Register API Error:', error);
        return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
