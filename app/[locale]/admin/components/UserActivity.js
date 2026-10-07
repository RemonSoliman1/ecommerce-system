'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, Search, Eye } from 'lucide-react';

export default function UserActivity({ userId }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!userId) return;
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/users/${userId}/activity`);
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchActivity();
    }, [userId]);

    if (loading) return <div style={{ color: '#888', fontSize: '0.9rem' }}>Loading activity...</div>;
    if (!data) return <div style={{ color: '#888', fontSize: '0.9rem' }}>No activity data.</div>;

    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <h4 style={{ color: 'var(--color-accent)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} /> User Activity & Targeting
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                    <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Browsing Habits
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{data.activeTime}</div>
                </div>

                <div>
                    <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={14} /> Most Viewed
                    </div>
                    {data.mostViewed.length > 0 ? (
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.85rem' }}>
                            {data.mostViewed.map((item, i) => (
                                <li key={i} style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>No products viewed</div>
                    )}
                </div>

                <div>
                    <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Search size={14} /> Search History
                    </div>
                    {data.recentSearches.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {data.recentSearches.map((term, i) => (
                                <span key={i} style={{ background: '#333', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                                    {term}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>No searches recorded</div>
                    )}
                </div>
            </div>
        </div>
    );
}
