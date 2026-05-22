'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const LOYALTY_TIERS = [
    {
        name: 'Silver',
        minPoints: 0,
        benefits: ['1 pt per EGP 1 spent', 'Birthday Gift', 'Member-only Newsletter']
    },
    {
        name: 'Gold',
        minPoints: 1000,
        benefits: ['1.25 pts per EGP 1 spent', 'Early Access to Limited Editions', 'Free Standard Shipping']
    },
    {
        name: 'Platinum',
        minPoints: 5000,
        benefits: ['1.5 pts per EGP 1 spent', 'Priority Support', 'Free Express Shipping', 'Private Tasting Invitations']
    }
];

const LoyaltyContext = createContext();

export function LoyaltyProvider({ children }) {
    const { user } = useAuth();
    const [points, setPoints] = useState(0);
    const [tier, setTier] = useState(LOYALTY_TIERS[0]);
    const [history, setHistory] = useState([]);
    const [offers, setOffers] = useState([]);

    // Load Data from Supabase
    useEffect(() => {
        let mounted = true;

        async function fetchLoyaltyData() {
            if (!user) {
                setPoints(0);
                setTier(LOYALTY_TIERS[0]);
                setHistory([]);
                return;
            }

            try {
                // Fetch points from DB
                const { data: customer, error } = await supabase
                    .from('customers')
                    .select('points')
                    .eq('email', user.email)
                    .maybeSingle();

                if (customer && !error) {
                    if (mounted) {
                        setPoints(customer.points || 0);
                        calculateTier(customer.points || 0);
                    }
                } else if (mounted) {
                    // Fallback if no customer record yet (shouldn't happen if logged in properly)
                    const storedPoints = localStorage.getItem(`loyalty_points_${user.email}`);
                    const currentPoints = storedPoints ? parseInt(storedPoints) : 0;
                    setPoints(currentPoints);
                    calculateTier(currentPoints);
                }

                // Fetch history (mocking or implementing real history table later)
                // For now, keep mock history or clear it
                if (mounted) {
                    setHistory([
                        { id: 1, action: 'Initial Sync', points: customer?.points || 0, date: new Date().toISOString() }
                    ]);
                }

            } catch (err) {
                console.error("Loyalty Fetch Error:", err);
            }
        }

        fetchLoyaltyData();

        return () => { mounted = false; };
    }, [user]);

    const calculateTier = (p) => {
        let current = LOYALTY_TIERS[0];
        for (let i = 0; i < LOYALTY_TIERS.length; i++) {
            if (p >= LOYALTY_TIERS[i].minPoints) {
                current = LOYALTY_TIERS[i];
            }
        }
        setTier(current);
    };

    const addPoints = (amount, reason) => {
        const newPoints = points + amount;
        setPoints(newPoints);
        calculateTier(newPoints);

        const newEntry = { id: Date.now(), action: reason, points: amount, date: new Date().toISOString() };
        setHistory(prev => [newEntry, ...prev]);

        if (user) {
            localStorage.setItem(`loyalty_points_${user.email}`, newPoints);
        }
    };

    return (
        <LoyaltyContext.Provider value={{ points, tier, history, offers, addPoints }}>
            {children}
        </LoyaltyContext.Provider>
    );
}

export function useLoyalty() {
    return useContext(LoyaltyContext);
}
