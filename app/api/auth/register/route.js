
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { name, email, password, dob, phone } = await request.json();

        // 1. Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            if (existingUser.verified) {
                return Response.json({ success: false, error: 'Email already exists. Please login.' }, { status: 400 });
            } else {
                // User exists but not verified -> Update their details (in case they fixed a typo/password)
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ name, password, dob, phone })
                    .eq('email', email);

                if (updateError) {
                    console.error('Update User Error:', updateError);
                    return Response.json({ success: false, error: 'Failed to update user details' }, { status: 500 });
                }
            }
        } else {
            // 2. Create User
            // Note: In a real app, hash the password! 
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    name,
                    email,
                    password, // TODO: Hash this in production!
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

        // 3. Generate Token (6-digit code for this demo)
        const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        // Store Token
        const { error: tokenError } = await supabase
            .from('verification_tokens')
            .insert([{ email, token }]);

        if (tokenError) {
            console.error('Save Token Error:', tokenError);
            return Response.json({ success: false, error: 'Failed to save verification token' }, { status: 500 });
        }

        // 4. Send Email
        // Mock sending if no API KEY
        if (!process.env.RESEND_API_KEY) {
            console.log(`[MOCK EMAIL] To: ${email}, Code: ${token}`);
            return Response.json({ success: true, mock: true, token }); // Return token for testing
        }

        const verifyLink = `${process.env.NEXT_PUBLIC_SITE_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;

        const { data: emailData, error: emailError } = await resend.emails.send({
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

            // GRACEFUL FALLBACK FOR RESEND FREE TIER
            // If the error is about "testing emails", we assume this is a dev/demo env.
            // We return the token so the UI can still proceed.
            if (emailError.statusCode === 403 || emailError.name === 'validation_error') {
                return Response.json({
                    success: true,
                    token, // Return token to client
                    warning: 'Resend Free Tier: Email not sent to unverified address. Code returned for testing.'
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
