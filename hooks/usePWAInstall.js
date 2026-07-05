'use client';
import { useState, useEffect } from 'react';

export default function usePWAInstall() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    const [showInstalledModal, setShowInstalledModal] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check if already installed
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        setIsStandalone(standalone);

        // Listen for beforeinstallprompt (Android and Desktop)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            
            // Automatically show the install modal for first-time users
            if (!localStorage.getItem('lounge_install_prompt_shown')) {
                setShowAndroidModal(true);
                localStorage.setItem('lounge_install_prompt_shown', 'true');
            }
        };

        const handleAppInstalled = () => {
            setShowInstalledModal(true);
            setInstallPrompt(null);
            setShowAndroidModal(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Register service worker if needed
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error("Service worker registration failed:", err);
            });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    const [showAndroidModal, setShowAndroidModal] = useState(false);

    const promptInstall = async () => {
        if (installPrompt) {
            // Android flow
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') {
                setInstallPrompt(null);
            }
            setShowAndroidModal(false); // Close our custom modal
        } else if (isIOS && !isStandalone) {
            // iOS flow
            setShowIOSGuide(true);
        } else {
            console.log("Installation not supported or already installed.");
        }
    };

    return {
        isInstallable: !!installPrompt || (isIOS && !isStandalone),
        promptInstall,
        showIOSGuide,
        setShowIOSGuide,
        showAndroidModal,
        setShowAndroidModal,
        showInstalledModal,
        setShowInstalledModal
    };
}
