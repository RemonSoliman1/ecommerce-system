'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';

const TourContext = createContext();

export function TourProvider({ children }) {
    const [isTourActive, setIsTourActive] = useState(false);
    const [pendingTour, setPendingTour] = useState(null); // { name, steps }
    const pathname = usePathname();
    const t = useTranslations('Tour');
    const { user } = useAuth();

    const startTour = (tourName, steps) => {
        if (localStorage.getItem(`cigar_tour_${tourName}_done`)) return;
        
        // Show prompt instead of starting immediately
        setPendingTour({ name: tourName, steps });
    };

    const confirmTour = () => {
        if (!pendingTour) return;
        const { name, steps } = pendingTour;
        setPendingTour(null);
        setIsTourActive(true);
        
        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            overlayColor: 'rgba(18, 12, 10, 0.85)',
            onCloseClick: () => {
                driverObj.destroy();
            },
            onDestroyed: () => {
                setIsTourActive(false);
                localStorage.setItem(`cigar_tour_${name}_done`, 'true');
            },
            steps: steps
        });
        
        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            driverObj.drive();
        }, 500);
    };

    const skipTour = () => {
        if (!pendingTour) return;
        localStorage.setItem(`cigar_tour_${pendingTour.name}_done`, 'true');
        setPendingTour(null);
    };

    return (
        <TourContext.Provider value={{ startTour, isTourActive, pendingTour }}>
            {children}
            
            {/* Skippable Tour Prompt */}
            {pendingTour && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 99999
                }}>
                    <div style={{
                        background: 'rgba(25, 25, 25, 0.95)',
                        border: '1px solid var(--color-accent)',
                        padding: '2.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        maxWidth: '400px',
                        width: '90%',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center'
                    }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-accent)', fontSize: '1.1rem' }}>
                        {t('prompt_title') || 'Interactive Tour'}
                    </h3>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#ccc', lineHeight: '1.4' }}>
                        {t('prompt_desc') || 'Would you like a quick walkthrough of the features on this page?'}
                    </p>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center' }}>
                        <button 
                            onClick={confirmTour}
                            style={{ 
                                flex: 1, 
                                padding: '8px', 
                                background: 'var(--color-accent)', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '4px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer' 
                            }}
                        >
                            {t('prompt_yes') || 'Start Tour'}
                        </button>
                        <button 
                            onClick={skipTour}
                            style={{ 
                                flex: 1, 
                                padding: '8px', 
                                background: 'transparent', 
                                color: '#aaa', 
                                border: '1px solid #444', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                            }}
                        >
                            {t('prompt_no') || 'Skip'}
                                                </button>
                    </div>
                </div>
            </div>
            )}
        </TourContext.Provider>
    );
}

export const useTour = () => useContext(TourContext);
