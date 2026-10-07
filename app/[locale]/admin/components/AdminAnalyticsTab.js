'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Search, Eye, Clock, Bell, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminAnalyticsTab() {
    const t = useTranslations('Admin');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics');
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (e) {
            console.error('Failed to fetch analytics', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;
    }

    if (!data) {
        return <div style={{ color: '#ff4d4d', padding: '2rem' }}>Failed to load analytics data.</div>;
    }

    return (
        <div style={{ color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Store Analytics</h2>
                <button 
                    onClick={fetchAnalytics}
                    style={{ background: '#c5a35c', color: '#111', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> Peak Traffic Hour
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.peakTrafficHour}</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={16} /> Notification Traffic
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.notificationTrafficPct}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>of {data.totalSessions} sessions</div>
                </div>
            </div>

            {/* Top Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Top Searches */}
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={18} /> Most Searched
                    </h3>
                    {data.topSearches.length === 0 ? <p style={{ color: '#666' }}>No search data yet.</p> : null}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {data.topSearches.map((s, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #222' }}>
                                <span>{s.keyword}</span>
                                <span style={{ color: '#c5a35c' }}>{s.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Top Products */}
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Eye size={18} /> Most Viewed Products
                    </h3>
                    {data.topProducts.length === 0 ? <p style={{ color: '#666' }}>No product views yet.</p> : null}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {data.topProducts.map((p, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #222' }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{p.productId}</span>
                                <span style={{ color: '#c5a35c' }}>{p.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
