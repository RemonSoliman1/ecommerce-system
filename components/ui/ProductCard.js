'use client';

import { Link } from '@/lib/navigation';
import styles from '@/app/[locale]/page.module.css';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';

// ... (comments)

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }) {
    const startPrice = product.models?.[0]?.price || 0;
    const originalPrice = product.models?.[0]?.original_price;
    const hasDiscount = originalPrice && originalPrice > startPrice;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - startPrice) / originalPrice) * 100) : 0;
    const [imgError, setImgError] = useState(false);
    const t = useTranslations('Product');
    const isOut = product.models?.every(m => parseInt(m.stock || 0) <= 0) ?? false;

    const { user } = useAuth() || {};
    const { showToast } = useToast() || {};
    const { toggleWishlist, isInWishlist } = useWishlist() || {};

    const isNewArrival = product.created_at ? (new Date() - new Date(product.created_at)) / (1000 * 60 * 60 * 24) <= 14 : false;

    const handleNotifyMe = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            if (showToast) showToast("Please login to join the waitlist", "error");
            return;
        }
        if (toggleWishlist && isInWishlist && !isInWishlist(product.id)) {
            toggleWishlist(product);
        }
        if (showToast) showToast(t('notify_success') || "✅ Added to Waitlist! You will be notified as soon as this item is back in stock.", "success");
    };

    return (
        <Link href={`/product/${product.id}`} className={styles.card} style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            {isOut ? (
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, rgba(208, 200, 185, 0.9), rgba(197, 163, 92, 0.9))', color: '#120C0A', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '2px', zIndex: 10, textTransform: 'uppercase', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                    {t('sold_out') || 'Sold Out'}
                </div>
            ) : isNewArrival ? (
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.9), rgba(200, 30, 30, 0.9))', color: '#fff', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '2px', zIndex: 10, textTransform: 'uppercase', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                    🔥 Just Arrived
                </div>
            ) : null}
            {product.rating && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '50%', width: '46px', height: '46px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1a1a1a', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '0.45rem', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '-2px' }}>RATED</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '900', lineHeight: '1' }}>
                        {String(product.rating).match(/^\d+/) ? String(product.rating).match(/^\d+/)[0] : '90'}
                    </span>
                </div>
            )}
            
            {/* Dynamic Animated Badges */}
            {(() => {
                const finalBadges = [...(product.badges || [])];
                if (hasDiscount && discountPercent > 0) finalBadges.push(`${discountPercent}% OFF`);
                
                if (finalBadges.length > 0) {
                    return (
                        <div style={{ position: 'absolute', top: '10px', right: product.rating ? '65px' : '10px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 15, alignItems: 'flex-end' }}>
                            {finalBadges.map((badge, idx) => {
                                const isDiscount = typeof badge === 'string' && badge.includes('% OFF');
                                return (
                                    <span key={idx} className={isDiscount ? "badge-red" : "badge-wind"} style={{ animationDelay: `${idx * 0.3}s` }}>
                                        {badge}
                                    </span>
                                );
                            })}
                        </div>
                    );
                }
                return null;
            })()}
            <div className={styles.cardImage}>
                <div className={styles.cardOverlay}>
                    {/* Restored Hover effect for Strength and Origin inside Overlay */}
                    <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', textAlign: 'center' }}>
                        {product.strength ? `${product.strength} • ` : ''}{product.origin}
                    </div>
                    <span 
                        className={`${styles.quickViewBtn} tour-view-details-btn`} 
                        onClick={isOut ? handleNotifyMe : undefined}
                    >
                        {isOut ? (t('notify_me') || 'Waitlist') : t('quick_view')}
                    </span>
                </div>

                <div style={{ width: '100%', height: '250px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', filter: isOut ? 'grayscale(0.5)' : 'contrast(105%) saturate(110%)' }}>
                    {!imgError ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="productImg"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span>[ {product.name} ]</span>
                    )}
                </div>
            </div>
            <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{product.name}</h3>

                {product.type === 'sampler' && product.sampler_series && (
                    <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '4px 0', fontStyle: 'italic' }}>
                        Includes: {product.sampler_series}
                    </p>
                )}
                <div className={styles.cardFooter} style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {hasDiscount ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.8rem' }}>EGP {originalPrice.toLocaleString()}</span>
                                <span className={styles.price} style={{ color: '#ff4d4d', marginTop: '2px' }}>{t('from')} EGP {startPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', background: '#ff4d4d', color: '#fff', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' }}>-{discountPercent}%</span></span>
                            </>
                        ) : (
                            <span className={styles.price}>{t('from')} EGP {startPrice.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
