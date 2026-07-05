'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SurveyModal() {
    const { user, loading, checkSession } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    
    // Form state
    const [profiles, setProfiles] = useState([]);
    const [brands, setBrands] = useState([]);
    const [mostSmoked, setMostSmoked] = useState('');
    const [weekendDay, setWeekendDay] = useState(5);
    const [smokingTime, setSmokingTime] = useState(19);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user && user.survey_completed === false) {
            setIsOpen(true);
        }
    }, [user, loading]);

    if (!isOpen || !user) return null;

    const availableProfiles = ['Mild', 'Medium', 'Full-Bodied', 'Sweet', 'Spicy', 'Earthy'];
    const availableBrands = ['Arturo Fuente', 'Davidoff', 'Padron', 'Oliva', 'Romeo y Julieta', 'Cohiba', 'Montecristo'];

    const toggleProfile = (p) => {
        if (profiles.includes(p)) setProfiles(profiles.filter(x => x !== p));
        else setProfiles([...profiles, p]);
    };

    const toggleBrand = (b) => {
        if (brands.includes(b)) setBrands(brands.filter(x => x !== b));
        else setBrands([...brands, b]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/auth/submit-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    favorite_profiles: profiles,
                    favorite_brands: brands,
                    most_smoked_cigar: mostSmoked,
                    weekend_start_day: weekendDay,
                    preferred_engagement_time: smokingTime
                })
            });
            
            if (res.ok) {
                setIsOpen(false);
                await checkSession(); // Update local user state
            } else {
                console.error("Failed to submit survey");
            }
        } catch (error) {
            console.error("Error submitting survey", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#111', border: '1px solid var(--color-accent)',
                padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '0.5rem', textAlign: 'center' }}>
                    Welcome to CigarLounge
                </h2>
                <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '2rem', fontSize: '14px' }}>
                    Let's personalize your experience. Answer a few quick questions to help us tailor our recommendations.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Flavor Profiles */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Favorite Flavor Profiles</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {availableProfiles.map(p => (
                                <button type="button" key={p} onClick={() => toggleProfile(p)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--color-accent)',
                                        backgroundColor: profiles.includes(p) ? 'var(--color-accent)' : 'transparent',
                                        color: profiles.includes(p) ? '#000' : 'var(--color-accent)',
                                        cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s'
                                    }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brands */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Favorite Brands</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {availableBrands.map(b => (
                                <button type="button" key={b} onClick={() => toggleBrand(b)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--color-accent)',
                                        backgroundColor: brands.includes(b) ? 'var(--color-accent)' : 'transparent',
                                        color: brands.includes(b) ? '#000' : 'var(--color-accent)',
                                        cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s'
                                    }}>
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Most Smoked */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Your Most Smoked Cigar</label>
                        <input type="text" value={mostSmoked} onChange={e => setMostSmoked(e.target.value)}
                            placeholder="e.g. Oliva Serie V Melanio"
                            style={{
                                width: '100%', padding: '0.8rem', backgroundColor: '#222', border: '1px solid #444',
                                color: '#fff', borderRadius: '4px'
                            }} 
                        />
                    </div>

                    {/* Weekend & Time side by side */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Weekend Starts</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="button" onClick={() => setWeekendDay(5)}
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--color-accent)',
                                        backgroundColor: weekendDay === 5 ? 'var(--color-accent)' : 'transparent',
                                        color: weekendDay === 5 ? '#000' : 'var(--color-accent)', cursor: 'pointer' }}>
                                    Friday
                                </button>
                                <button type="button" onClick={() => setWeekendDay(6)}
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--color-accent)',
                                        backgroundColor: weekendDay === 6 ? 'var(--color-accent)' : 'transparent',
                                        color: weekendDay === 6 ? '#000' : 'var(--color-accent)', cursor: 'pointer' }}>
                                    Saturday
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Smoking Time</label>
                            <select value={smokingTime} onChange={e => setSmokingTime(parseInt(e.target.value))}
                                style={{
                                    width: '100%', padding: '0.65rem', backgroundColor: '#222', border: '1px solid #444',
                                    color: '#fff', borderRadius: '4px'
                                }}>
                                <option value={9}>Morning</option>
                                <option value={14}>Afternoon</option>
                                <option value={19}>Evening</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn" style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}>
                        {isSubmitting ? 'Saving...' : 'Enter Lounge'}
                    </button>
                </form>
            </div>
        </div>
    );
}
