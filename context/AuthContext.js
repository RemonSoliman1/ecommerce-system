'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePWA } from '@/context/PWAContext';

const AuthContext = createContext();

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const pwa = usePWA();

    const subscribeToPushNotifications = async (userId) => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            try {
                // Register or get existing service worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                // Request permission if not already granted/denied
                if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') return;
                } else if (Notification.permission === 'denied') {
                    return;
                }

                // Check for existing subscription
                let subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BIM_6RpJruOaN5YKWMiE_KGvC1f95wcjlNJFS643-QSSM4HMVuehQthclAzYaBu-G9v_QRoFcXuvqEhcNTQiQ2w';
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                    });
                }

                // Send to backend
                const res = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscription, userId })
                });
                
                if (!res.ok) {
                    const data = await res.json();
                    console.error('Failed to save push subscription to DB:', data);
                }
            } catch (e) {
                console.error('Failed to subscribe to push notifications', e);
            }
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const storedEmail = localStorage.getItem('cigar_user_email');
            if (storedEmail) {
                try {
                    const res = await fetch(`/api/auth/me?email=${encodeURIComponent(storedEmail)}`);
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        // Auto-subscribe to push notifications quietly or ask permission
                        subscribeToPushNotifications(data.user.id);
                    } else {
                        localStorage.removeItem('cigar_user_email'); // Invalid session
                    }
                } catch (e) {
                    console.error("Session check failed", e);
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('cigar_user_email', data.user.email); // Restored
                
                // Auto-subscribe to push notifications quietly or ask permission
                subscribeToPushNotifications(data.user.id);

                if (pwa && pwa.isInstallable) {
                    if (pwa.setShowAndroidModal) {
                        pwa.setShowAndroidModal(true);
                    } else {
                        pwa.promptInstall();
                    }
                }
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    };

    const register = async (name, email, password, dob) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, dob })
            });
            const data = await res.json();

            if (data.success) {
                // Auto login or ask to verify? 
                // For now, let's just return success and ask them to verify
                if (pwa && pwa.isInstallable) {
                    if (pwa.setShowAndroidModal) {
                        pwa.setShowAndroidModal(true);
                    } else {
                        pwa.promptInstall();
                    }
                }
                return { success: true, message: 'Please verify your email.' };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cigar_user_email');
        localStorage.removeItem('cigar_user'); // Cleanup old key
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
