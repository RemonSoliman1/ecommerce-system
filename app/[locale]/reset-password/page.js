'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Use standard hook for params
import { useRouter as useNavRouter } from '@/lib/navigation'; // Use our wrapper for push
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
    const router = useNavRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('Auth');

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        const codeParam = searchParams.get('code');
        if (emailParam) setEmail(emailParam);
        if (codeParam) setCode(codeParam);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'Failed to reset password.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>{t('password_changed')}</h1>
                <p>{t('password_updated')}</p>
                <p>{t('redirecting_login')}</p>
                <p style={{ marginTop: '20px' }}>
                    <Link href="/login" style={{ color: 'var(--color-accent)' }}>{t('click_if_not_redirected')}</Link>
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>{t('reset_title')}</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>{t('reset_desc', { email })}</p>

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
                <input
                    type="text"
                    placeholder={t('code_placeholder_reset')}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--color-border)',
                        color: '#fff',
                        letterSpacing: '2px'
                    }}
                />
                <div style={{ position: 'relative' }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('new_password_placeholder')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--color-border)',
                            color: '#fff'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer'
                        }}
                    >
                        {showPassword ? t('hide') : t('show')}
                    </button>
                </div>

                {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '12px', cursor: 'pointer' }}
                >
                    {loading ? t('resetting') : t('set_password_btn')}
                </button>
            </form>
        </div>
    );
}
