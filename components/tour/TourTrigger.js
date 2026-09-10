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
            // Translate the steps dynamically
            const translatedSteps = steps.filter(step => document.querySelector(step.element)).map(step => ({
                element: step.element,
                popover: {
                    title: t(step.titleKey),
                    description: t(step.descKey),
                    side: step.side || 'bottom',
                    align: step.align || 'center'
                }
            }));
            
            if (translatedSteps.length === 0) return;
            
            hasTriggered.current = true;
            // We use a small delay to ensure the page has fully painted
            const timer = setTimeout(() => {
                startTour(tourName, translatedSteps);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [tourName, steps, isTourActive, startTour, t]);

    return null;
}
