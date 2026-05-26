'use client';

import { Link, useRouter } from '@/lib/navigation';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import styles from './account.module.css';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function OrderCard({ order }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { addToCart, showCart } = useCart(); // Assuming showCart opens mini cart or similar, or just addToCart
    const { products } = useProducts();
    const router = useRouter();
    const items = Array.isArray(order.items) ? order.items : [];
    const itemCount = items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
    const t = useTranslations('Account.orders');

    const handleReorder = () => {
        let outOfStockItems = [];

        items.forEach(item => {
            const baseName = (item.name || '').replace(/ \(Gift:.*?\)/i, '').trim().toLowerCase();
            const liveProduct = products.find(p =>
                (item.product_id && p.id === item.product_id) ||
                p.name.toLowerCase() === baseName
            );

            const liveImage = liveProduct?.image || '';
            const liveStock = liveProduct?.models?.find(m => {
                const mName = (m.name || '').toLowerCase();
                const mSize = (m.size || '').toLowerCase();
                const cSize = (item.size || item.selectedSize || '').toLowerCase();
                return (mName && cSize.includes(mName)) || (mSize && cSize.includes(mSize));
            })?.stock;

            const maxAllowed = liveStock !== undefined ? parseInt(liveStock, 10) : 9999;
            const requestedQty = parseInt(item.quantity) || 1;

            if (maxAllowed <= 0) {
                outOfStockItems.push(item.name);
                return; // Skip adding to cart
            }

            // `addToCart` requires `giftOption` to avoid undefined matching bug. Re-orders don't easily map gifts back yet, so pass null.
            addToCart(
                { ...item, id: liveProduct?.id || item.product_id || item.id, image: liveImage, stock: maxAllowed },
                item.selectedSize || item.size,
                item.price,
                Math.min(requestedQty, maxAllowed),
                null
            );
        });

        if (outOfStockItems.length > 0) {
            alert(`The following item(s) are currently Out of Stock and could not be re-ordered:\n\n- ${outOfStockItems.join('\n- ')}`);
        }

        router.push('/cart');
    };

    return (
        <div className={styles.orderCard} style={{ background: 'rgba(20, 15, 12, 0.7)', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                    <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('order_id')}</span>
                    <h3 style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text)' }}>#{String(order.id).slice(0, 8).toUpperCase()}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Placed</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text)' }}>{new Date(order.date).toLocaleString()}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: isExpanded ? '1.5rem' : '0' }}>
                <div>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Total Amount</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: 'var(--color-accent)' }}>EGP {(order.total || 0).toFixed(2)}</p>
                </div>
                <div>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Status</span>
                    <div style={{ marginTop: '0.35rem' }}>
                        <span style={{
                            padding: '4px 10px',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            display: 'inline-block',
                            background: order.status === 'Confirmed' || order.status === 'Completed' ? 'rgba(76, 175, 80, 0.15)' : order.status === 'Pending' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                            color: order.status === 'Confirmed' || order.status === 'Completed' ? '#4CAF50' : order.status === 'Pending' ? '#d4af37' : '#f44336'
                        }}>
                            {order.status}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{ background: 'none', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--color-accent)'; e.target.style.color = '#000'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = 'var(--color-accent)'; }}
                    >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div style={{ borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Items ({itemCount})</h4>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: i < items.length - 1 ? '1px solid #222' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#1a1a1a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <Link href={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            <span style={{ display: 'block', fontWeight: '500', transition: 'color 0.2s' }} className={styles.itemNameHover}>{item.name}</span>
                                        </Link>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>{item.selectedSize}</span>
                                    </div>
                                </div>
                                <span style={{ fontWeight: '500' }}>EGP {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Financial Summary */}
                    <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '6px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Summary</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>Subtotal</span>
                            <span>EGP {items.reduce((acc, curr) => acc + (Number(curr.price || 0) * curr.quantity), 0).toFixed(2)}</span>
                        </div>
                        {order.promo_code && order.discount_amount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#4CAF50' }}>
                                <span>Discount ({order.promo_code})</span>
                                <span>- EGP {Number(order.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>Shipping</span>
                            <span>EGP {(Number(order.total) - items.reduce((acc, curr) => acc + (Number(curr.price || 0) * curr.quantity), 0) + Number(order.discount_amount || 0)).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #333', fontWeight: 'bold' }}>
                            <span>Total Paid</span>
                            <span>EGP {Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Audit Trail */}
                    {(order.updated_at || order.confirmed_at || order.cancelled_at) && (
                        <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', border: '1px solid #333' }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Audit Trail</h4>
                            {order.updated_at && (
                                <p style={{ margin: '5px 0', fontSize: '0.85rem' }}><strong style={{ color: '#888' }}>Last Updated:</strong> {new Date(order.updated_at).toLocaleString()}</p>
                            )}
                            {order.confirmed_at && (
                                <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#4CAF50' }}><strong style={{ color: '#888' }}>Confirmed On:</strong> {new Date(order.confirmed_at).toLocaleString()}</p>
                            )}
                            {order.cancelled_at && (
                                <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#f44336' }}><strong style={{ color: '#888' }}>Cancelled On:</strong> {new Date(order.cancelled_at).toLocaleString()}</p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleReorder}
                        className="btn"
                        style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
                    >
                        {t('order_again')}
                    </button>
                </div>
            )}
        </div>
    );
}
