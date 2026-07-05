'use client';

import { useTranslations } from 'next-intl';

export default function ShippingPolicy() {
    const t = useTranslations('Policy');
    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>{t('shipping_title')}</h1>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{t('shipping_processing')}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    {t('shipping_processing_text')}
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{t('shipping_rates')}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    {t('shipping_rates_text')}
                </p>
                <ul style={{ margin: '1rem 0 1rem 1.5rem', color: 'var(--color-text-secondary)' }}>
                    <li><strong>{t('shipping_standard')}</strong> {t('shipping_standard_desc')}</li>
                    <li><strong>{t('shipping_express')}</strong> {t('shipping_express_desc')}</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{t('shipping_intl')}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    {t('shipping_intl_text')}
                </p>
            </section>
        </div>
    );
}
