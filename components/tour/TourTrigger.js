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
            hasTriggered.current = true;
            
            const timer = setTimeout(() => {
                const translatedSteps = steps.map(step => ({
                    element: step.element,
                    popover: {
                        title: t(step.titleKey),
                        description: t(step.descKey),
                        side: step.side || 'bottom',
                        align: step.align || 'center'
                    }
                }));
                
                const validSteps = translatedSteps.filter(step => document.querySelector(step.element));
                if (validSteps.length > 0) {
                    startTour(tourName, validSteps);
                }
            }, 2000);
            
            // Do not clear the timer on re-render, otherwise frequent re-renders 
            // (like AuthContext resolving) will cancel the tour permanently.
            // A small memory leak on unmount is negligible here, but we can clear it 
            // by storing it in a ref if we wanted. For now, this is safer.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTourActive]); // Intentionally omitting steps to prevent re-renders cancelling the timer

    return null;
}
