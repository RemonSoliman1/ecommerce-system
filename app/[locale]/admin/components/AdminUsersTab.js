
import React from 'react';
import styles from '../admin.module.css';

export default function AdminUsersTab({
    adminUsers, setAdminUsers,
    expandedUserId, setExpandedUserId
}) {
    return (
                    <div className={styles.content}>
                        <div style={{ width: '100%', margin: '0 auto', background: '#121110', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                            <h2>Manage Users & Admins</h2>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>Promote users to Admins to give them access to this dashboard.</p>

                            {adminUsers.length === 0 ? (
                                <p style={{ color: '#888' }}>No users found.</p>
                            ) : (
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Activity Status</th>
                                                <th>Current Role</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminUsers.map(u => (
                                                <React.Fragment key={u.id}>
                                                <tr style={{ cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid #333' }}
                                                    onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#2a2a2a'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '10px' }}>{u.name || 'N/A'}</td>
                                                    <td style={{ padding: '10px' }}>{u.email}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold',
                                                            backgroundColor: u.activity_status === 'Active' ? 'rgba(76, 175, 80, 0.2)' : u.activity_status === 'Slipping' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                                            color: u.activity_status === 'Active' ? '#4caf50' : u.activity_status === 'Slipping' ? '#ffc107' : '#f44336'
                                                        }}>
                                                            {u.activity_status === 'Active' ? '🟢 Active' : u.activity_status === 'Slipping' ? '🟡 Slipping' : '🔴 Dormant'}
                                                        </span>
                                                        {u.last_active_at && (
                                                            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                                                                Last: {new Date(u.last_active_at).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px', color: u.role === 'admin' ? 'var(--color-accent)' : '#fff', fontWeight: u.role === 'admin' ? 'bold' : 'normal' }}>
                                                        {u.role === 'admin' ? 'Admin' : 'User'}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const newRole = u.role === 'admin' ? 'user' : 'admin';
                                                                if (!confirm(`Are you sure you want to change ${u.email} to ${newRole}?`)) return;
                                                                try {
                                                                    const res = await fetch('/api/admin/users', {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ userId: u.id, role: newRole })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        setAdminUsers(prev => prev.map(user => user.id === u.id ? { ...user, role: newRole } : user));
                                                                    } else {
                                                                        alert('Failed to update role');
                                                                    }
                                                                } catch (err) {
                                                                    alert('Error updating role: ' + err.message);
                                                                }
                                                            }}
                                                            style={{
                                                                background: u.role === 'admin' ? '#333' : 'var(--color-accent)',
                                                                color: u.role === 'admin' ? '#fff' : '#000',
                                                                border: 'none',
                                                                padding: '6px 12px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedUserId === u.id && (
                                                    <tr style={{ background: '#111' }}>
                                                        <td colSpan="4" style={{ padding: '20px', borderBottom: '1px solid #333' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                                                <div>
                                                                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Customer Info</h4>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>ID:</strong> {u.customer_id || 'N/A'}</p>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Phone:</strong> {u.phone || 'N/A'}</p>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>DOB:</strong> {u.dob || 'N/A'}</p>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Address:</strong> {u.address || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Loyalty & Spending</h4>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Tier:</strong> <span style={{ color: u.tier === 'Platinum' ? '#e5e4e2' : u.tier === 'Gold' ? '#ffd700' : '#c0c0c0', fontWeight: 'bold' }}>{u.tier}</span></p>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Points:</strong> {u.points?.toLocaleString() || 0}</p>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Total Spent:</strong> EGP {u.total_spent?.toLocaleString() || 0}</p>
                                                                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Total Orders:</strong> {u.orders_count || 0}</p>
                                                                    

                                                                </div>
                                                                <div>
                                                                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Recent Orders</h4>
                                                                    {u.recent_orders && u.recent_orders.length > 0 ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                            {u.recent_orders.map(ro => (
                                                                                <div key={ro.id} style={{ fontSize: '0.85rem', padding: '8px', background: '#222', borderRadius: '4px' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                                        <span>#{String(ro.id).substring(0, 8)}...</span>
                                                                                        <span style={{ color: ro.status?.toLowerCase() === 'cancelled' ? '#ff4d4d' : ro.status?.toLowerCase() === 'pending' ? '#d4af37' : '#4CAF50' }}>{ro.status}</span>
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                                                                        <span>EGP {Number(ro.total_amount || 0).toLocaleString()}</span>
                                                                                        <span>{new Date(ro.created_at).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p style={{ color: '#888' }}>No recent orders.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                
    );
}
