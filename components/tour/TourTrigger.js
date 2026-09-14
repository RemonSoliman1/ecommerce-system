'use client';
import { useEffect, useRef } from 'react';
import { useTour } from '@/context/TourContext';
import { useTranslations } from 'next-intl';

export default function TourTrigger({ tourName, steps }) {
    const { startTour, isTourActive } = useTour();
    const t = useTranslations('Tour');
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (!isTourActive && !hasTriggered.current) {
            
            // Interval to check if AgeGate is gone
            const checkAndStart = setInterval(() => {
                if (document.querySelector('#age-gate-overlay')) {
                    return; // Wait for AgeGate to be closed
                }
                
                hasTriggered.current = true;
                clearInterval(checkAndStart);
                
                const translatedSteps = steps.map(step => ({
                    element: step.element,
                    isMock: step.isMock,
                    popover: {
                        title: t(step.titleKey),
                        description: t(step.descKey),
                        side: step.side || 'bottom',
                        align: step.align || 'center',
                        nextRoute: step.nextRoute
                    }
                }));
                
                const validSteps = translatedSteps.filter(step => step.isMock || document.querySelector(step.element));
                if (validSteps.length > 0) {
                    startTour(tourName, validSteps);
                }
            }, 1000);
            
            return () => clearInterval(checkAndStart);
        }
    }, [isTourActive]); 

    return null;
}
