
import React from 'react';
import styles from '../admin.module.css';
import AdminManualOrder from '../AdminManualOrder';

export default function AdminOrdersTab({
    adminOrders, setAdminOrders,
    orderSearch, setOrderSearch,
    orderStatusFilter, setOrderStatusFilter,
    orderDateFilter, setOrderDateFilter,
    expandedOrderId, setExpandedOrderId,
    handleConfirmOrder, handleCancelOrder,
    confirmingOrder,
    user
}) {
                    const filteredAdminOrders = adminOrders.filter(o => {
                        const searchLower = orderSearch.toLowerCase();
                        const matchesSearch = !orderSearch ||
                            String(o.id).toLowerCase().includes(searchLower) ||
                            (o.userEmail || '').toLowerCase().includes(searchLower) ||
                            (o.address || '').toLowerCase().includes(searchLower) ||
                            (o.items || []).some(i => (i.name || '').toLowerCase().includes(searchLower) || (i.size || '').toLowerCase().includes(searchLower));

                        const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;

                        const matchesDate = !orderDateFilter || new Date(o.date).toLocaleDateString('en-CA') === orderDateFilter; // matches YYYY-MM-DD

                        return matchesSearch && matchesStatus && matchesDate;
                    });

                    return (
                        <div className={styles.content}>
                            <div style={{ width: '100%', margin: '0 auto', overflowX: 'auto', background: '#121110', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                <h2>Manual POS / Telegram Orders</h2>
                                <AdminManualOrder onOrderCreated={(newOrder) => {
                                    setAdminOrders([newOrder, ...adminOrders]);
                                    alert('Manual Order created successfully!');
                                }} />
                                
                                <hr style={{ margin: '3rem 0', borderColor: '#333' }} />

                                <h2>Platform Orders ({filteredAdminOrders.length})</h2>

                                {/* Filters UI */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        placeholder="Search by ID, Customer, Address, or Item..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className={styles.input}
                                        style={{ padding: '0.5rem', minWidth: '250px', flex: 1 }}
                                    />
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        className={styles.select}
                                        style={{ padding: '0.5rem', width: '150px' }}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={orderDateFilter}
                                        onChange={(e) => setOrderDateFilter(e.target.value)}
                                        className={styles.input}
                                        style={{ padding: '0.5rem', width: '150px' }}
                                    />
                                    <button
                                        onClick={() => { setOrderSearch(''); setOrderStatusFilter('All'); setOrderDateFilter(''); }}
                                        style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Clear
                                    </button>
                                </div>

                                {filteredAdminOrders.length === 0 ? (
                                    <p>No orders match the selected filters.</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem', background: '#121110' }}>
                                        <thead>
                                            <tr style={{ background: '#121110', color: 'var(--color-accent)' }}>
                                                <th style={{ padding: '10px', borderBottom: '1px solid #444' }}>Order ID</th>
                                                <th style={{ padding: '10px', borderBottom: '1px solid #444' }}>Date</th>
                                                <th style={{ padding: '10px', borderBottom: '1px solid #444' }}>Customer</th>
                                                <th style={{ padding: '10px', borderBottom: '1px solid #444' }}>Status</th>
                                                <th style={{ padding: '10px', borderBottom: '1px solid #444' }}>Total (EGP)</th>
                                                <th style={{ padding: '10px', borderBottom: '1px solid #444' }}>Items</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAdminOrders.map(order => (
                                                <React.Fragment key={order.id}>
                                                    <tr
                                                        style={{ borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#2a2a2a'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={{ padding: '10px' }}>#{order.id}</td>
                                                        <td style={{ padding: '10px', color: '#bbb' }}>
                                                            <div>{new Date(order.date).toLocaleDateString()}</div>
                                                            {order.updated_at && order.updated_at !== order.date && (
                                                                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}><span style={{color: '#888'}}>Upd:</span> {new Date(order.updated_at).toLocaleDateString()}</div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '10px' }}>{order.userEmail}</td>
                                                        <td style={{ padding: '10px' }}>
                                                            <span style={{
                                                                background: order.status.toLowerCase() === 'pending' ? 'rgba(212, 175, 55, 0.2)' : (order.status.toLowerCase() === 'cancelled' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(76, 175, 80, 0.2)'),
                                                                color: order.status.toLowerCase() === 'pending' ? '#d4af37' : (order.status.toLowerCase() === 'cancelled' ? '#ff4d4d' : '#4CAF50'),
                                                                fontWeight: order.status === 'Pending' ? 'normal' : 'bold',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.8rem',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td style={{ padding: '10px', fontSize: '0.85rem', color: '#ccc' }}>
                                                            {order.items.map((i, idx) => (
                                                                <div key={idx}>
                                                                    - {i.quantity}x {i.name} {i.size && <span style={{ color: '#888', fontStyle: 'italic' }}>({i.size})</span>}
                                                                    {i.giftOption && <span style={{ color: '#d4af37', display: 'block', paddingLeft: '10px' }}>&nbsp;└ 🎁 {i.giftOption.name}</span>}
                                                                </div>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                    {expandedOrderId === order.id && (
                                                        <tr style={{ background: '#111' }}>
                                                            <td colSpan="6" style={{ padding: '20px', borderBottom: '1px solid #333' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                                                    <div>
                                                                        <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Payment & Shipping</h4>
                                                                        <div style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Payment Details:</strong>
                                                                            {order.paymentMethod ? (
                                                                                <div style={{ marginTop: '5px', paddingLeft: '10px', borderLeft: '2px solid #444' }}>
                                                                                    {order.paymentMethod.split(' | ').map((part, i) => {
                                                                                        if (part.startsWith('IMG:')) return <div key={i}><a href={part.replace('IMG:', '')} target="_blank" rel="noreferrer" style={{ color: '#c6a87c', textDecoration: 'underline' }}>View Receipt Image ↗</a></div>;
                                                                                        if (part.startsWith('REF:')) return <div key={i}><strong>Ref:</strong> {part.replace('REF:', '')}</div>;
                                                                                        if (part.startsWith('TG:')) return <div key={i} style={{ color: '#888', fontSize: '0.85rem' }}><strong>Telegram User ID:</strong> {part.replace('TG:', '')}</div>;
                                                                                        return <div key={i} style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{part}</div>;
                                                                                    })}
                                                                                </div>
                                                                            ) : <span style={{ marginLeft: '5px' }}>N/A</span>}
                                                                        </div>
                                                                        <p style={{ margin: '15px 0 5px 0' }}><strong style={{ color: '#888' }}>Address:</strong> {order.address || 'N/A'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Customer Details</h4>
                                                                        <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>ID:</strong> {order.userId || 'N/A'}</p>
                                                                        <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>Email:</strong> {order.userEmail}</p>

                                                                        <h4 style={{ color: 'var(--color-accent)', margin: '20px 0 10px 0' }}>Audit Trail</h4>
                                                                        <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '0.9rem', color: '#ccc' }}>
                                                                            <li style={{ marginBottom: '5px' }}>
                                                                                <strong style={{ color: '#888' }}>Placed:</strong> {new Date(order.date).toLocaleString()} by <span style={{color: '#fff'}}>Customer</span>
                                                                            </li>
                                                                            
                                                                            {order.confirmed_at && (
                                                                                <li style={{ marginBottom: '5px', color: '#4CAF50' }}>
                                                                                    <strong style={{ color: '#888' }}>Confirmed:</strong> {new Date(order.confirmed_at).toLocaleString()} by <span style={{textTransform:'capitalize', color: '#fff'}}>{order.processed_by || 'Admin'}</span>
                                                                                </li>
                                                                            )}
                                                                            {order.status.toLowerCase() === 'confirmed' && !order.confirmed_at && (
                                                                                <li style={{ marginBottom: '5px', color: '#4CAF50' }}>
                                                                                    <strong style={{ color: '#888' }}>Confirmed:</strong> <span>(Legacy record - timestamp missing)</span> by <span style={{color: '#fff'}}>Admin</span>
                                                                                </li>
                                                                            )}

                                                                            {order.cancelled_at && (
                                                                                <li style={{ marginBottom: '5px', color: '#ff4d4d' }}>
                                                                                    <strong style={{ color: '#888' }}>Cancelled:</strong> {new Date(order.cancelled_at).toLocaleString()} by <span style={{textTransform:'capitalize', color: '#fff'}}>{order.processed_by || 'Admin'}</span>
                                                                                </li>
                                                                            )}
                                                                            {order.status.toLowerCase() === 'cancelled' && !order.cancelled_at && (
                                                                                <li style={{ marginBottom: '5px', color: '#ff4d4d' }}>
                                                                                    <strong style={{ color: '#888' }}>Cancelled:</strong> <span>(Legacy record - timestamp missing)</span> by <span style={{color: '#fff'}}>Admin</span>
                                                                                </li>
                                                                            )}

                                                                            {order.updated_at && !order.confirmed_at && !order.cancelled_at && (
                                                                                <li style={{ marginBottom: '5px' }}>
                                                                                    <strong style={{ color: '#888' }}>Last Edited:</strong> {new Date(order.updated_at).toLocaleString()} by <span style={{textTransform:'capitalize', color: '#fff'}}>{order.processed_by || 'Admin'}</span>
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                    {(() => {
                                                                        const sub = order.items.reduce((acc, curr) => acc + (Number(curr.price || 0) * curr.quantity), 0);
                                                                        const ship = Number(order.total) - sub;
                                                                        return (
                                                                            <div>
                                                                                <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Price Breakdown</h4>
                                                                                <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #333' }}>
                                                                                    {order.items.map((i, idx) => (
                                                                                        <div key={`breakdown-${idx}`} style={{ margin: '5px 0', fontSize: '0.85rem' }}>
                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                                <span style={{ color: '#ccc' }}>{i.quantity}x {i.name} {i.size ? `(${i.size})` : ''}</span>
                                                                                                <span style={{ color: '#999' }}>EGP {(Number(i.price || 0) * i.quantity).toLocaleString()}</span>
                                                                                            </div>
                                                                                            {i.giftOption && (
                                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '15px', color: '#d4af37' }}>
                                                                                                    <span>└ 🎁 {i.giftOption.name}</span>
                                                                                                    <span>EGP {(Number(i.giftOption.price || 0) * i.quantity).toLocaleString()}</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}><strong style={{ color: '#888' }}>Items Subtotal:</strong> <span>EGP {sub.toLocaleString()}</span></p>
                                                                                
                                                                                {order.promoCode && (
                                                                                    <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}>
                                                                                        <strong style={{ color: '#888' }}>Promo Used ({order.promoCode}):</strong> 
                                                                                        <span style={{ color: '#4CAF50' }}>- EGP {Number(order.discount || 0).toLocaleString()}</span>
                                                                                    </p>
                                                                                )}

                                                                                {ship > 0 && <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}><strong style={{ color: '#888' }}>Shipping/Fees:</strong> <span>EGP {ship.toLocaleString()}</span></p>}
                                                                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                                                    <span style={{ color: 'var(--color-accent)' }}>Total Paid:</span>
                                                                                    <span>EGP {Number(order.total).toLocaleString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
                                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                                    {order.status === 'Pending' && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleConfirmOrder(order.id); }}
                                                                            disabled={confirmingOrder === order.id}
                                                                            style={{ background: 'var(--color-accent)', color: '#000', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                        >
                                                                            {confirmingOrder === order.id ? 'Loading...' : 'Confirm Order'}
                                                                        </button>
                                                                    )}
                                                                    {order.status !== 'cancelled' && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                                                            disabled={confirmingOrder === order.id}
                                                                            style={{ background: '#333', color: '#ff4d4d', padding: '8px 16px', border: '1px solid #ff4d4d', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                        >
                                                                            {confirmingOrder === order.id ? 'Loading...' : 'Cancel & Revert Stock'}
                                                                        </button>
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
                                )}
                            </div>
                        </div>
                    );
                
}
