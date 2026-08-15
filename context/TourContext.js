'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const TourContext = createContext();

export function TourProvider({ children }) {
    const [isTourActive, setIsTourActive] = useState(false);
    const driverRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('Tour');

    const startTour = () => {
        localStorage.setItem('cigar_tour_step', '0');
        setIsTourActive(true);
        runTourStep(0);
    };

    const stopTour = () => {
        localStorage.removeItem('cigar_tour_step');
        setIsTourActive(false);
        if (driverRef.current) {
            driverRef.current.destroy();
        }
    };

    const runTourStep = (stepIndex) => {
        const steps = getTourSteps();
        if (stepIndex >= steps.length) {
            stopTour();
            return;
        }

        const step = steps[stepIndex];
        let isProgrammaticDestroy = false;

        let attempts = 0;
        const checkElement = setInterval(() => {
            attempts++;
            const el = document.querySelector(step.element);
            
            // If we find the element OR we timeout after 20 attempts (10 seconds)
            if (el || attempts > 20) {
                clearInterval(checkElement);
                
                if (!el) {
                    console.warn(`Tour failed to find element: ${step.element}`);
                    // If it fails, silently stop or skip to next? 
                    // We'll just stop the tour so it doesn't get stuck forever.
                    stopTour();
                    return;
                }
                
                driverRef.current = driver({
                    showProgress: false,
                    allowClose: false,
                    overlayColor: 'rgba(18, 12, 10, 0.85)',
                    steps: [
                        {
                            element: step.element,
                            popover: {
                                title: step.popover.title,
                                description: step.popover.description,
                                side: step.popover.side,
                                showButtons: ['close']
                            }
                        }
                    ],
                    onDestroyStarted: () => {
                        if (isProgrammaticDestroy || driverRef.current?.hasNextStep?.() || !driverRef.current?.isActivated) {
                           driverRef.current.destroy();
                        } else {
                           stopTour(); // User clicked close
                        }
                    }
                });
                
                driverRef.current.drive();
                
                // Add event listener to advance
                const handleInteract = (e) => {
                    // Prevent immediate destruction race conditions
                    setTimeout(() => {
                        el.removeEventListener(step.actionEvent || 'click', handleInteract);
                        if (step.actionEvent === 'mouseenter') el.removeEventListener('click', handleInteract);
                        if (step.actionEvent === 'input') el.removeEventListener('click', handleInteract);

                        isProgrammaticDestroy = true;
                        if (driverRef.current) driverRef.current.destroy();
                        
                        const nextStep = stepIndex + 1;
                        if (nextStep >= steps.length) {
                            stopTour();
                        } else {
                            localStorage.setItem('cigar_tour_step', nextStep.toString());
                            // If the step action doesn't cause a route change naturally, trigger the next step manually.
                            if (!step.causesNavigation) {
                                setTimeout(() => runTourStep(nextStep), 600);
                            }
                        }
                    }, 50);
                };
                
                el.addEventListener(step.actionEvent || 'click', handleInteract);
                if (step.actionEvent === 'mouseenter') el.addEventListener('click', handleInteract); // fallback for mobile
                if (step.actionEvent === 'input') el.addEventListener('click', handleInteract); // if they click the search bar
            }
        }, 500);
    };

    // Auto-resume on route change or mount
    useEffect(() => {
        const needsTour = localStorage.getItem('cigar_needs_tour');
        if (needsTour === 'true') {
            localStorage.removeItem('cigar_needs_tour');
            setTimeout(() => {
                startTour();
            }, 1000);
            return;
        }

        const savedStep = localStorage.getItem('cigar_tour_step');
        if (savedStep !== null) {
            const stepIdx = parseInt(savedStep, 10);
            setIsTourActive(true);
            // Delay to let the new page DOM render
            setTimeout(() => runTourStep(stepIdx), 500);
        }
    }, [pathname]);

    const getTourSteps = () => [
        {
            element: '#tour-nav-menu',
            popover: { title: t('menu_title'), description: t('menu_desc'), side: 'bottom' },
            actionEvent: 'mouseenter',
            causesNavigation: false
        },
        {
            element: '#tour-search',
            popover: { title: t('search_title'), description: t('search_desc'), side: 'bottom' },
            actionEvent: 'click',
            causesNavigation: false
        },
        {
            element: '.tour-wishlist-btn', 
            popover: { title: t('wishlist_title'), description: t('wishlist_desc'), side: 'top' },
            actionEvent: 'click',
            causesNavigation: false
        },
        {
            element: '.tour-view-details-btn', 
            popover: { title: t('details_title'), description: t('details_desc'), side: 'top' },
            actionEvent: 'click',
            causesNavigation: true // Navigates to Product details
        },
        {
            element: '#tour-cart-header', 
            popover: { title: t('cart_title'), description: t('cart_desc'), side: 'bottom' },
            actionEvent: 'click',
            causesNavigation: true // Navigates to /cart
        },
        {
            element: '#tour-account-btn', 
            popover: { title: t('account_title'), description: t('account_desc'), side: 'bottom' },
            actionEvent: 'click',
            causesNavigation: true // Navigates to /account
        },
        {
            element: '#tour-orders-tab', 
            popover: { title: t('orders_title'), description: t('orders_desc'), side: 'right' },
            actionEvent: 'click',
            causesNavigation: false
        },
        {
            element: '#tour-settings-tab', 
            popover: { title: t('settings_title'), description: t('settings_desc'), side: 'right' },
            actionEvent: 'click',
            causesNavigation: false
        },
        {
            element: '#tour-floating-chat', 
            popover: { title: t('chat_title'), description: t('chat_desc'), side: 'left' },
            actionEvent: 'click',
            causesNavigation: false
        },
        {
            element: '#tour-scroll-top', 
            popover: { title: t('top_title'), description: t('top_desc'), side: 'top' },
            actionEvent: 'click',
            causesNavigation: false
        }
    ];

    return (
        <TourContext.Provider value={{ startTour, stopTour, isTourActive }}>
            {children}
        </TourContext.Provider>
    );
}

export const useTour = () => useContext(TourContext);
