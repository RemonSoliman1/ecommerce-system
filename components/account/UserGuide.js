import styles from '../../app/[locale]/account/account.module.css';
import { useTour } from '@/context/TourContext';
import { useTranslations } from 'next-intl';
import { usePWA } from '@/context/PWAContext';

export default function UserGuide() {
    const { startTour } = useTour();
    const t = useTranslations('Guide');
    const pwa = usePWA();
    return (
        <div className={styles.section} style={{ padding: '0 1rem' }}>
            <h2 style={{ color: 'var(--color-accent)', marginBottom: '1rem', borderBottom: '1px solid rgba(198, 168, 124, 0.2)', paddingBottom: '1rem' }}>{t('title')}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <p style={{ color: '#ccc', margin: 0, flex: 1, minWidth: '300px' }}>{t('subtitle')}</p>
                <button 
                    onClick={startTour}
                    className="btn" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    {t('start_tour')}
                </button>
            </div>

            {/* WEBSITE GUIDE */}
            <div style={{ marginBottom: '4rem', background: 'rgba(25, 25, 25, 0.5)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    {t('web_title')}
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('web_first_time')}</h4>
                    <p style={{ color: '#aaa', marginBottom: '1rem' }}>{t('web_first_desc')}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_create')}</strong> {t('web_create_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_profile')}</strong> {t('web_profile_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_humidor')}</strong> {t('web_humidor_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_checkout')}</strong> {t('web_checkout_desc')}
                        </li>
                    </ul>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('web_return')}</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_sync')}</strong> {t('web_sync_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_cache')}</strong> {t('web_cache_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('web_support')}</strong> {t('web_support_desc')}
                        </li>
                    </ul>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>{t('desktop_title')}</h4>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>{t('desktop_desc')}</p>
                    <button onClick={() => pwa.promptInstall()} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#333', color: '#fff', border: '1px solid #555' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        {t('desktop_btn')}
                    </button>
                </div>
            </div>

            {/* TELEGRAM BOT GUIDE */}
            <div style={{ background: 'rgba(25, 25, 25, 0.5)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    {t('bot_title')}
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('bot_first')}</h4>
                    <p style={{ color: '#aaa', marginBottom: '1rem' }}>{t('bot_first_desc')}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_start')}</strong> {t('bot_start_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_link')}</strong> {t('bot_link_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_explore')}</strong> {t('bot_explore_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_search')}</strong> {t('bot_search_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_human')}</strong> {t('bot_human_desc')}
                        </li>
                    </ul>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{t('bot_return')}</h4>
                    <p style={{ color: '#aaa', marginBottom: '1rem' }}>{t('bot_return_desc')}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_reset')}</strong> {t('bot_reset_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_unstuck')}</strong> {t('bot_unstuck_desc')}
                        </li>
                        <li style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>•</span>
                            <strong style={{ color: '#fff' }}>{t('bot_commands')}</strong> {t('bot_commands_desc')}
                        </li>
                    </ul>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>{t('bot_connect')}</h4>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>{t('bot_connect_desc')}</p>
                    <a href="https://t.me/GoCigarBot" target="_blank" rel="noopener noreferrer" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#229ED9', color: '#fff', border: 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2 2 11l6 2v6l3-4 5 5 4.5-18z"/></svg>
                        {t('bot_btn')}
                    </a>
                </div>
            </div>

        </div>
    );
}
