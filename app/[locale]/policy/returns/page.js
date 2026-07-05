'use client';

import { useTranslations } from 'next-intl';

export default function ReturnsPolicy() {
    const t = useTranslations('Policy');
    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>{t('returns_title')}</h1>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{t('returns_guarantee')}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    {t('returns_guarantee_text')}
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{t('returns_eligibility')}</h3>
                <ul style={{ margin: '1rem 0 1rem 1.5rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    <li>{t('returns_eli_1')}</li>
                    <li>{t('returns_eli_2')}</li>
                    <li>{t('returns_eli_3')}</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{t('returns_how')}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    {t('returns_how_text')}
                </p>
            </section>
        </div>
    );
}
