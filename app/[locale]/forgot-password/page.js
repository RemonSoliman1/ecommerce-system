'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const t = useTranslations('Auth'); // Assuming Auth translations exist, standardizing fallback

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                // If we got a warning (dev mode), show it but proceed
                if (data.warning) alert(data.warning + '\nCode: ' + data.token);

                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                setError(data.error || 'Failed to request reset.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>{t('forgot_title')}</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>{t('forgot_desc')}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--color-border)',
                        color: '#fff'
                    }}
                />

                {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '12px', cursor: 'pointer' }}
                >
                    {loading ? t('sending') : t('send_code_btn')}
                </button>
            </form>

            <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                <Link href="/login" style={{ color: 'var(--color-accent)' }}>{t('back_to_login')}</Link>
            </p>
        </div>
    );
}
