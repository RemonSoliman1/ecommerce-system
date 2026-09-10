'use client';

import { useState, useEffect } from 'react';
import styles from './AgeGate.module.css';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePWA } from '@/context/PWAContext';

export default function AgeGate() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState('age'); // 'age' | 'auth'
    const [selectedLocale, setSelectedLocale] = useState('en');
    const [isApp, setIsApp] = useState(false);
    const router = useRouter();
    const t = useTranslations('AgeGate');
    const pwa = usePWA();

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        setIsApp(standalone);

        const hasVerified = sessionStorage.getItem('age_verified');
        if (!hasVerified && !localStorage.getItem('cigar_user_email')) {
            setIsVisible(true);
        }
    }, []);

    const handleVerifyAge = (locale) => {
        setSelectedLocale(locale);
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        setStep('auth');
    };

    const handleReject = () => {
        window.location.href = 'https://google.com'; // Redirect away
    };

    const finishFlow = (action) => {
        sessionStorage.setItem('age_verified', 'true');
        setIsVisible(false);
        


        if (action === 'signin') {
            router.push(`/${selectedLocale}/login`);
        } else if (action === 'register') {
            router.push(`/${selectedLocale}/register`);
        } else if (action === 'guest') {
            const startGuestFlow = async () => {
                let outcome = 'unsupported';
                if (pwa && typeof pwa.promptInstall === 'function') {
                    outcome = await pwa.promptInstall(); // Wait for PWA prompt to resolve
                }

                if (outcome === 'accepted') {
                    // Wait for the appinstalled event AND the modal dismissal before starting tour.
                    localStorage.setItem('cigar_needs_tour_after_install_modal', 'true');
                    router.push(`/${selectedLocale}`);
                } else {
                    // Set flag for tour auto-start for first-time guests
                    if (!localStorage.getItem('cigar_has_seen_tour')) {
                        localStorage.setItem('cigar_needs_tour', 'true');
                        localStorage.setItem('cigar_has_seen_tour', 'true');
                    }
                    router.push(`/${selectedLocale}`);
                }
            };
            
            startGuestFlow();
        }
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay} style={{ zIndex: 9999 }}>
            <div className={styles.modal}>
                <div className={styles.content}>
                    
                    {step === 'age' && (
                        <>
                            <h1 className={styles.title} style={{ marginBottom: '0.5rem' }}>Age Verification</h1>
                            <h2 className={styles.title} style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>التحقق من العمر</h2>

                            <p className={styles.text}>
                                You must be of legal smoking age (18+) to enter this site.
                            </p>
                            <p className={styles.text} style={{ direction: 'rtl' }}>
                                يجب أن تكون في السن القانوني للتدخين (18+) لدخول هذا الموقع.
                            </p>

                            <div className={styles.actions} style={{ flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <button onClick={() => handleVerifyAge('en')} className={styles.btnConfirm}>Enter Site (English)</button>
                                    <button onClick={() => handleVerifyAge('ar')} className={styles.btnConfirm}>دخول الموقع (العربية)</button>
                                </div>
                                <button onClick={handleReject} className={styles.btnDeny} style={{ width: '100%' }}>I am under 18 / أنا تحت 18</button>
                            </div>

                            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#888' }}>
                                <p className={styles.subtext}>
                                    Surgeon General Warning: Cigar Smoking Can Cause Cancers Of The Mouth And Throat, Even If You Do Not Inhale.
                                </p>
                                <p className={styles.subtext} style={{ direction: 'rtl', marginTop: '0.5rem' }}>
                                    تحذير: تدخين السيجار قد يسبب سرطانات الفم والحلق، حتى لو لم يتم استنشاقه.
                                </p>
                            </div>
                        </>
                    )}

                    {step === 'auth' && (
                        <>
                            <h1 className={styles.title} style={{ marginBottom: '0.5rem' }}>{t('auth_title')}</h1>
                            <p className={styles.text} style={{ marginBottom: '2rem' }}>
                                {t('auth_subtitle')}
                            </p>

                            <div className={styles.actions} style={{ flexDirection: 'column', gap: '1rem' }}>
                                <button onClick={() => finishFlow('signin')} className={styles.btnConfirm} style={{ width: '100%' }}>
                                    {t('sign_in')}
                                </button>
                                <button onClick={() => finishFlow('register')} className={styles.btnConfirm} style={{ width: '100%', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}>
                                    {t('register')}
                                </button>
                                <button onClick={() => finishFlow('guest')} className={styles.btnDeny} style={{ width: '100%', marginTop: '1rem' }}>
                                    {t('guest')}
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
