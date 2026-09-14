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
                    isMock: step.isMock,
                    popover: {
                        title: t(step.titleKey),
                        description: t(step.descKey),
                        side: step.side || 'bottom',
                        align: step.align || 'center',
                        nextRoute: step.nextRoute
                    }
                }));
                
                // Allow elements to pass if they are marked as isMock (they will be rendered when tour starts)
                const validSteps = translatedSteps.filter(step => step.isMock || document.querySelector(step.element));
                if (validSteps.length > 0) {
                    startTour(tourName, validSteps);
                }
            }, 2000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTourActive]); 

    return null;
}
