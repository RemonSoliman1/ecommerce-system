'use client';

import { useState, useEffect } from 'react';
import styles from './AgeGate.module.css';
import { useRouter, usePathname } from 'next/navigation';

export default function AgeGate() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const hasVerified = sessionStorage.getItem('age_verified');
        if (!hasVerified) {
            setIsVisible(true);
        }
    }, []);

    const handleVerify = (locale) => {
        sessionStorage.setItem('age_verified', 'true');
        // Set cookie so server knows too
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        
        // Hide modal but stay on intended page
        setIsVisible(false);
    };

    const handleReject = () => {
        window.location.href = 'https://google.com'; // Redirect away
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay} style={{ zIndex: 9999 }}>
            <div className={styles.modal}>
                <div className={styles.content}>
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
                            <button onClick={() => handleVerify('en')} className={styles.btnConfirm}>Enter Site (English)</button>
                            <button onClick={() => handleVerify('ar')} className={styles.btnConfirm}>دخول الموقع (العربية)</button>
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
                </div>
            </div>
        </div>
    );
}
