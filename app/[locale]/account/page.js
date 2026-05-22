'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/lib/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/navigation';
import styles from './account.module.css';
import OrderCard from './OrderCard';
import { useTranslations } from 'next-intl';
import { useLoyalty } from '@/context/LoyaltyContext';
import { LayoutDashboard, ShoppingBag, MapPin, Settings, LogOut, Heart } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

export default function AccountPage() {
    const { user, logout, loading } = useAuth();
    const pwa = usePWA();
    const router = useRouter();
    const t = useTranslations('Account');
    const { points, tier } = useLoyalty();

    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);

    // Settings State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({ loading: false, error: '', success: '' });
    
    // Automation Settings
    const [bdaySettings, setBdaySettings] = useState({
        title: 'Happy Birthday from CigarLounge! 🎉',
        body: 'We are thrilled to celebrate you today. As a token of our appreciation, please enjoy a special birthday promotion added to your account. Treat yourself to a fine smoke!',
        url: '/shop'
    });
    const [upcomingSettings, setUpcomingSettings] = useState({
        title: 'Your Birthday is almost here! 🎂',
        body: 'Stock up now so you have the perfect smoke ready to celebrate your special day.',
        url: '/shop'
    });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, error: '', success: '' });

        if (newPassword !== confirmPassword) {
            setUpdateStatus({ loading: false, error: 'Passwords do not match', success: '' });
            return;
        }

        if (newPassword.length < 6) {
            setUpdateStatus({ loading: false, error: 'Password must be at least 6 characters', success: '' });
            return;
        }

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setUpdateStatus({ loading: false, error: '', success: 'Password updated successfully!' });
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setUpdateStatus({ loading: false, error: data.error || 'Failed to update password', success: '' });
            }
        } catch (err) {
            setUpdateStatus({ loading: false, error: 'An error occurred', success: '' });
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        // Load orders
        if (user) {
            fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.orders) {
                        // Map DB structure to Frontend structure
                        const mappedOrders = data.orders.map(o => ({
                            id: o.id,
                            date: o.created_at,
                            status: o.status || 'Pending',
                            total: o.total || o.total_price || 0,
                            items: Array.isArray(o.items) ? o.items.map(i => ({
                                id: i.product_id || i.id,
                                name: i.name || 'Unknown Item',
                                quantity: i.quantity || 1,
                                price: i.price || 0,
                                selectedSize: i.size || i.selectedSize || ''
                            })) : []
                        }));
                        setOrders(mappedOrders);
                    }
                })
                .catch(err => console.error("Failed to load orders", err));
                
            // Fetch Birthday Settings
            fetch('/api/admin/settings')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.settings) {
                        if (data.settings.birthday_automation) {
                            setBdaySettings(data.settings.birthday_automation);
                        }
                        if (data.settings.upcoming_birthday_automation) {
                            setUpcomingSettings(data.settings.upcoming_birthday_automation);
                        }
                    }
                })
                .catch(err => console.error("Failed to load settings", err));
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return (
                    <div className={styles.section}>
                        <h2>Order History</h2>
                        {orders.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>{t('orders.empty')}</p>
                                <Link href="/shop" className="btn" style={{ marginTop: '1rem' }}>Start Shopping</Link>
                            </div>
                        ) : (
                            <div className={styles.orderList}>
                                {orders.map((order, idx) => (
                                    <OrderCard key={idx} order={order} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <div className={styles.section}>
                        <h2>Account Settings</h2>
                        <form className={styles.formGrid} onSubmit={handleUpdatePassword}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input type="text" defaultValue={user.name} className={styles.input} disabled style={{ opacity: 0.7 }} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input type="email" defaultValue={user.email} className={styles.input} disabled style={{ opacity: 0.7 }} />
                            </div>

                            <div className={styles.formGroup} style={{ position: 'relative' }}>
                                <label>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 6 characters"
                                        className={styles.input}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    className={styles.input}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                {updateStatus.error && <p style={{ color: 'red', marginBottom: '1rem' }}>{updateStatus.error}</p>}
                                {updateStatus.success && <p style={{ color: 'green', marginBottom: '1rem' }}>{updateStatus.success}</p>}

                                <button className="btn" disabled={updateStatus.loading}>
                                    {updateStatus.loading ? 'Saving...' : 'Save Password'}
                                </button>
                                
                                {pwa && (
                                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
                                        <h3 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>App Installation</h3>
                                        <p style={{ color: '#ccc', marginBottom: '1rem', fontSize: '14px' }}>
                                            Install the CigarLounge app for a better, faster experience.
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <button 
                                                type="button" 
                                                className="btn" 
                                                onClick={() => pwa.setShowAndroidModal ? pwa.setShowAndroidModal(true) : pwa.promptInstall()}
                                                disabled={!pwa.isInstallable}
                                                style={{ backgroundColor: 'var(--color-accent)', color: '#120C0A' }}
                                            >
                                                {pwa.isInstallable ? 'Install App (Automatic)' : 'Already Installed / Not Supported'}
                                            </button>
                                            
                                            <button 
                                                type="button" 
                                                className="btn" 
                                                onClick={() => pwa.setShowManualModal(true)}
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
                                            >
                                                Show Manual Guide
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                );
            case 'overview':
            default: {
                const today = new Date();
                const todayStr = today.toISOString().substring(5, 10);
                
                const reminderDate = new Date();
                reminderDate.setDate(reminderDate.getDate() + 5);
                const reminderStr = reminderDate.toISOString().substring(5, 10);

                const userDobStr = user?.dob ? user.dob.substring(5, 10) : null;
                const isBirthday = userDobStr === todayStr;
                const isUpcomingBirthday = userDobStr === reminderStr;

                return (
                    <div className={styles.section}>
                        {isBirthday && bdaySettings.enabled !== false && (
                            <div style={{
                                background: `linear-gradient(rgba(18, 12, 10, 0.85), rgba(26, 22, 20, 0.95)), url('${bdaySettings.image}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '1px solid #D4AF37',
                                borderRadius: '12px',
                                padding: '3rem 2rem',
                                marginBottom: '2.5rem',
                                textAlign: 'center',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative elements */}
                                <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '4rem', opacity: 0.1 }}>🎉</div>
                                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>🎂</div>
                                
                                <h2 style={{ 
                                    color: '#D4AF37', 
                                    fontFamily: 'var(--font-serif)', 
                                    fontSize: '2.5rem', 
                                    margin: '0 0 1rem 0' 
                                }}>
                                    {bdaySettings.title.replace('{name}', user.name.split(' ')[0])}
                                </h2>
                                <p style={{ 
                                    color: '#fff', 
                                    fontSize: '1.2rem', 
                                    lineHeight: '1.6', 
                                    maxWidth: '600px', 
                                    margin: '0 auto 1.5rem auto' 
                                }}>
                                    {bdaySettings.body}
                                </p>
                                <button onClick={() => router.push(bdaySettings.url)} style={{
                                    background: '#D4AF37',
                                    color: '#120C0A',
                                    border: 'none',
                                    padding: '12px 30px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease'
                                }}>
                                    Claim Your Gift
                                </button>
                            </div>
                        )}

                        {isUpcomingBirthday && upcomingSettings.enabled !== false && (
                            <div style={{
                                background: `linear-gradient(rgba(26, 22, 20, 0.85), rgba(42, 34, 31, 0.95)), url('${upcomingSettings.image}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '1px solid #888',
                                borderRadius: '12px',
                                padding: '2rem 1.5rem',
                                marginBottom: '2.5rem',
                                textAlign: 'center',
                                position: 'relative',
                            }}>
                                <h2 style={{ 
                                    color: '#fff', 
                                    fontFamily: 'var(--font-sans)', 
                                    fontSize: '1.5rem', 
                                    margin: '0 0 0.5rem 0' 
                                }}>
                                    {upcomingSettings.title.replace('{name}', user.name.split(' ')[0])}
                                </h2>
                                <p style={{ color: '#ccc', fontSize: '1rem', margin: '0 0 1rem 0' }}>
                                    {upcomingSettings.body}
                                </p>
                                <button onClick={() => router.push(upcomingSettings.url)} style={{
                                    background: 'transparent',
                                    color: '#D4AF37',
                                    border: '1px solid #D4AF37',
                                    padding: '8px 20px',
                                    fontSize: '1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}>
                                    Shop Now
                                </button>
                            </div>
                        )}

                        <h2>Dashboard Overview</h2>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{points}</span>
                                <span className={styles.statLabel}>Loyalty Points</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{tier.name}</span>
                                <span className={styles.statLabel}>Current Status</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{orders.length}</span>
                                <span className={styles.statLabel}>Total Orders</span>
                            </div>
                        </div>

                        {/* Recent Order Snippet */}
                        {orders.length > 0 && (
                            <div style={{ marginTop: '3rem' }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Recent Order</h3>
                                <OrderCard order={orders[0]} />
                            </div>
                        )}
                    </div>
                );
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.dashboardGrid}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.userBrief}>
                        <h3>{user.name || 'Member'}</h3>
                        <p>{user.email}</p>
                    </div>
                    <nav className={styles.nav}>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'overview' ? styles.activeBtn : ''}`}
                            onClick={() => {
                                setActiveTab('overview');
                                if (window.innerWidth <= 768) document.getElementById('account-content')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <LayoutDashboard size={20} /> Overview
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'orders' ? styles.activeBtn : ''}`}
                            onClick={() => {
                                setActiveTab('orders');
                                if (window.innerWidth <= 768) document.getElementById('account-content')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <ShoppingBag size={20} /> Orders
                        </button>
                        <button
                            className={styles.navBtn}
                            onClick={() => router.push('/wishlist')}
                        >
                            <Heart size={20} /> Wishlist
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'settings' ? styles.activeBtn : ''}`}
                            onClick={() => {
                                setActiveTab('settings');
                                if (window.innerWidth <= 768) document.getElementById('account-content')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Settings size={20} /> Settings
                        </button>

                        {user.role === 'admin' && (
                            <button
                                className={styles.navBtn}
                                onClick={() => router.push('/admin')}
                                style={{ color: '#ffcc00' }}
                            >
                                <LayoutDashboard size={20} /> Admin Dashboard
                            </button>
                        )}

                        <button
                            className={styles.navBtn}
                            onClick={logout}
                            style={{ marginTop: '1rem', color: '#ff4444' }}
                        >
                            <LogOut size={20} /> Sign Out
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.content} id="account-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
