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
            // Wait for translation but don't filter DOM elements yet
            const translatedSteps = steps.map(step => ({
                element: step.element,
                popover: {
                    title: t(step.titleKey),
                    description: t(step.descKey),
                    side: step.side || 'bottom',
                    align: step.align || 'center'
                }
            }));
            
            hasTriggered.current = true;
            const timer = setTimeout(() => {
                // Filter right before starting to ensure DOM is ready
                const validSteps = translatedSteps.filter(step => document.querySelector(step.element));
                if (validSteps.length > 0) {
                    startTour(tourName, validSteps);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [tourName, steps, isTourActive, startTour, t]);

    return null;
}
