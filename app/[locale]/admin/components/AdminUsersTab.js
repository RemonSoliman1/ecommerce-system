
import UserActivity from './UserActivity';
import React from 'react';
import styles from '../admin.module.css';

export default function AdminUsersTab({
    adminUsers, setAdminUsers,
    expandedUserId, setExpandedUserId
}) {
    const exportCustomerOrders = (user) => {
        if (!user.recent_orders || user.recent_orders.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Order ID,Date,Status,Total Amount,Payment Method,Processed By,Item Name,Size/Vitola,Quantity,Price\n";
        
        user.recent_orders.forEach(ro => {
            let itemsArr = [];
            try {
                itemsArr = Array.isArray(ro.items) ? ro.items : (typeof ro.items === 'string' ? JSON.parse(ro.items) : []);
            } catch(e) {}
            
            const dateStr = new Date(ro.created_at).toLocaleDateString();
            const orderIdStr = String(ro.id);
            const status = ro.status || '';
            const payment = ro.payment_method || '';
            const processed = ro.processed_by || '';
            
            if (itemsArr.length === 0) {
                csvContent += `"${orderIdStr}","${dateStr}","${status}",${ro.total_amount},"${payment}","${processed}","","","",\n`;
            } else {
                itemsArr.forEach(item => {
                    const itemName = (item.name || item.product_name || '').replace(/"/g, '""');
                    const size = (item.selectedSize || item.size || '').replace(/"/g, '""');
                    const qty = item.quantity || 1;
                    const price = item.price || 0;
                    csvContent += `"${orderIdStr}","${dateStr}","${status}",${ro.total_amount},"${payment}","${processed}","${itemName}","${size}",${qty},${price}\n`;
                });
            }
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${user.email || 'customer'}_purchase_history.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                                        <h4 style={{ color: 'var(--color-accent)' }}>Purchase History</h4>
                                                                        {u.recent_orders && u.recent_orders.length > 0 && (
                                                                            <button 
                                                                                onClick={() => exportCustomerOrders(u)}
                                                                                style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                                                title="Export Purchase Analytics"
                                                                            >
                                                                                Export CSV
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {u.recent_orders && u.recent_orders.length > 0 ? (
<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                                                            {u.recent_orders.map(ro => {
                                                                                let itemsArr = [];
                                                                                try {
                                                                                    itemsArr = Array.isArray(ro.items) ? ro.items : (typeof ro.items === 'string' ? JSON.parse(ro.items) : []);
                                                                                } catch(e) {}
                                                                                return (
                                                                                <details key={ro.id} style={{ fontSize: '0.85rem', padding: '8px', background: '#222', borderRadius: '4px' }}>
                                                                                    <summary style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', cursor: 'pointer', outline: 'none' }}>
                                                                                        <span>#{String(ro.id).substring(0, 8)}...</span>
                                                                                        <span>EGP {Number(ro.total_amount || 0).toLocaleString()}</span>
                                                                                        <span style={{ color: ro.status?.toLowerCase() === 'cancelled' ? '#ff4d4d' : ro.status?.toLowerCase() === 'pending' ? '#d4af37' : '#4CAF50' }}>{ro.status}</span>
                                                                                    </summary>
                                                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444', color: '#ccc' }}>
                                                                                        <div style={{ marginBottom: '4px' }}><strong>Date:</strong> {new Date(ro.created_at).toLocaleDateString()}</div>
                                                                                        {ro.payment_method && <div style={{ marginBottom: '4px' }}><strong>Payment:</strong> {ro.payment_method}</div>}
                                                                                        {ro.processed_by && <div style={{ marginBottom: '4px' }}><strong>Processed By:</strong> {ro.processed_by}</div>}
                                                                                        <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Items:</div>
                                                                                        {itemsArr.length > 0 ? itemsArr.map((item, idx) => (
                                                                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dotted #333' }}>
                                                                                                <span style={{flex: 1, paddingRight: '8px'}}>{item.quantity || 1}x {item.name || item.product_name} {item.selectedSize || item.size ? `(${item.selectedSize || item.size})` : ''}</span>
                                                                                                <span>EGP {Number(item.price || 0) * Number(item.quantity || 1)}</span>
                                                                                            </div>
                                                                                        )) : <div style={{color:'#888'}}>No items details</div>}
                                                                                    </div>
                                                                                </details>
                                                                            )})}
                                                                        </div>
                                                                    ) : (
                                                                        <p style={{ color: '#888' }}>No recent orders.</p>
                                                                    )}
                                                                </div>
                                                            </div>
<UserActivity userId={u.id} />
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
