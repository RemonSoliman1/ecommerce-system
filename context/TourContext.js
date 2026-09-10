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
    const pathname = usePathname();
    const t = useTranslations('Tour');
    const { user } = useAuth();

    const startTour = (tourName, steps) => {
        if (localStorage.getItem(`cigar_tour_${tourName}_done`)) return;
        
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
                localStorage.setItem(`cigar_tour_${tourName}_done`, 'true');
            },
            steps: steps
        });
        
        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            driverObj.drive();
        }, 1000);
    };

    return (
        <TourContext.Provider value={{ startTour, isTourActive }}>
            {children}
        </TourContext.Provider>
    );
}

export const useTour = () => useContext(TourContext);
