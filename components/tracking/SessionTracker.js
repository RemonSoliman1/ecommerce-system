'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SessionTracker() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const trackedRef = useRef(false);

    useEffect(() => {
        if (trackedRef.current) return;
        trackedRef.current = true;

        const source = searchParams.get('source') || searchParams.get('utm_source') || 'direct';
        const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign') || null;

        fetch('/api/tracking/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user?.id || null,
                event_type: 'session_start',
                target_id: source,
                metadata: {
                    source,
                    campaign,
                    time_of_day: new Date().getHours() // Capture the local hour of the user
                }
            })
        }).catch(() => {});
    }, [searchParams, user]);

    return null;
}
