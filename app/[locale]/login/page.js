'use client';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter, Link } from '@/lib/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const t = useTranslations('Auth');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(identifier, password, rememberMe);
        if (res.success) {
            const firstName = res.username && res.username !== 'Aficionado' ? res.username.split(' ')[0] : '';
            showToast(`Welcome back, Aficionado ${firstName}`.trim() + '!');
            router.push('/');
        } else {
            setError(res.error || 'Login failed');
            showToast(res.error || 'Login failed', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', margin: '6rem auto', padding: '2rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('login_title')}</h1>
            {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder={t('email_placeholder')}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    style={{ padding: '1rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: '#fff' }}
                    required
                />
                <div style={{ position: 'relative' }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('password_placeholder')}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '1rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: '#fff' }}
                        required
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

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1rem', cursor: 'pointer', color: '#ccc', userSelect: 'none' }}>
                    <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ opacity: 0, position: 'absolute', cursor: 'pointer', width: '100%', height: '100%', zIndex: 2 }}
                        />
                        <div style={{ width: '100%', height: '100%', border: `2px solid ${rememberMe ? 'var(--color-accent)' : '#555'}`, background: rememberMe ? 'var(--color-accent)' : 'transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                            {rememberMe && <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                    </div>
                    {t('remember_me')}
                </label>

                <button className="btn" type="submit" disabled={loading} style={{ padding: '1rem', marginTop: '0.5rem' }}>
                    {loading ? t('logging_in') : t('login_btn')}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="/forgot-password" style={{ color: '#888', fontSize: '0.9rem', textDecoration: 'none' }}>{t('forgot_password')}</Link>
                </div>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                {t('no_account')} <Link href="/register" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>{t('register')}</Link>
            </p>
        </div>
    );
}
