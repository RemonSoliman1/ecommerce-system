'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/context/TelegramContext';
import { usePathname, useRouter } from 'next/navigation';

export default function TelegramBackButton() {
    const { webApp, isTelegram } = useTelegram();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isTelegram || !webApp) return;

        const handleBack = () => {
            router.back();
        };

        if (pathname === '/' || pathname === '/en' || pathname === '/ar') {
            webApp.BackButton.hide();
        } else {
            webApp.BackButton.show();
            // Attach the click handler
            webApp.BackButton.onClick(handleBack);
        }

        return () => {
            if (webApp.BackButton) {
                webApp.BackButton.offClick(handleBack);
            }
        };
    }, [isTelegram, webApp, pathname, router]);

    return null; // This component doesn't render anything visually
}
