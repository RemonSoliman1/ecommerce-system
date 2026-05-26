'use client';

import { useCart } from '@/context/CartContext';
import styles from './cart.module.css';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Trash2 } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartSubtotal, cartTotal, discountAmount, promoCode } = useCart();
    const t = useTranslations('Cart');

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '8rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(197, 163, 92, 0.2)' }}>
                    <ShieldCheck size={40} color="var(--color-accent)" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>Your Humidor is Empty</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '500px', lineHeight: '1.6' }}>Our humidor doesn't seem to have any vitolas currently selected. Would you like a personal recommendation from our curator?</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/shop" className="btn" style={{ background: 'var(--color-accent)', color: '#120C0A', border: 'none', fontWeight: 'bold' }}>{t('continue_shopping')}</Link>
                    <a href="mailto:curator@cigarlounge.com" className="btn-outline" style={{ borderColor: 'transparent', color: 'var(--color-text-primary)' }}>Contact Curator</a>
                </div>
            </div>
        );
    }

    return (
        <div className={`container ${styles.page}`}>
            <h1>{t('title')}</h1>

            <div className={styles.cartGrid}>
                {/* Items List */}
                <div className={styles.cartItems}>
                    {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className={styles.cartItem}>
                            <div className={styles.imagePlaceholder}>
                                <Link href={`/product/${item.id}`}>
                                    <img src={item.image} alt={item.name} className={styles.img} style={{ cursor: 'pointer' }} />
                                </Link>
                            </div>
                            <div className={styles.itemDetails}>
                                <div className={styles.itemHeader}>
                                    <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <h3 className={styles.itemName} style={{ cursor: 'pointer' }}>{item.name}</h3>
                                    </Link>
                                    <span className={styles.itemPrice}>
                                        EGP {((item.price + (item.giftOption ? parseFloat(item.giftOption.price || 0) : 0)) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <p className={styles.itemVariant}>Size: {item.selectedSize}</p>

                                {item.giftOption && (
                                    <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#E8D3A2', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>🎁</span> Gift Option: {item.giftOption.name} (+ EGP {item.giftOption.price})
                                    </div>
                                )}

                                <div className={styles.controls} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg)', padding: '0.2rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.selectedSize, -1, item.giftOption?.name)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >-</button>
                                        <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.selectedSize, 1, item.giftOption?.name)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id, item.selectedSize, item.giftOption?.name)} className={styles.removeBtn} aria-label="Remove Item" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>{t('subtotal')}</span>
                        <span>EGP {cartSubtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className={styles.summaryRow} style={{ color: '#4CAF50' }}>
                            <span>Discount {promoCode ? `(${promoCode})` : ''}</span>
                            <span>- EGP {discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className={styles.summaryRow}>
                        <span>{t('shipping')}</span>
                        <span>{t('calculated_checkout')}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>{t('total')}</span>
                        <span>EGP {cartTotal.toFixed(2)}</span>
                    </div>

                    <Link href="/checkout">
                        <button className={styles.checkoutBtn}>{t('checkout')}</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
