'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from '@/lib/navigation';
import styles from './page.module.css';
import { MOCK_USER_HISTORY, BRANDS } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { useProducts } from '@/context/ProductContext';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Move ProductSimpleCard OUTSIDE the Home component to avoid Vercel/Next.js inner-component minification errors (ReferenceError limits)
const ProductSimpleCard = ({ product, activePromos = [] }) => {
  const image = typeof product.image === 'string' ? product.image : (product.images?.[0] || product.image || '/images/hero.png');
  const firstModel = product.models && product.models.length > 0 ? product.models[0] : {};
  const displayPrice = firstModel.price || 0;
  const originalPrice = firstModel.original_price || 0;
  const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(displayPrice);
  
  const hasPromo = activePromos.some(promo => {
      if (promo.target_type === 'all') return true;
      if (promo.target_type === 'product' && promo.target_id?.split(',').includes(product.id)) return true;
      if (promo.target_type === 'brand' && promo.target_id?.split(',').includes(product.brand_id || product.brandId)) return true;
      return false;
  });
  
  const totalStock = product.models ? product.models.reduce((acc, m) => {
    if (m.stock === undefined || m.stock === null || m.stock === '') return acc + Infinity;
    const s = parseInt(m.stock);
    return acc + (isNaN(s) ? 0 : s);
  }, 0) : Infinity;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 3;
  
  return (
    <Link href={`/product/${product.id}`} className={styles.simpleCard} style={{ position: 'relative' }}>
      {(hasDiscount || hasPromo) && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4d4d', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 2 }}>
          {hasDiscount ? 'SALE' : 'PROMO'}
        </div>
      )}
      {isOutOfStock ? (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(208, 200, 185, 0.9)', color: '#120C0A', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '2px', zIndex: 2 }}>
          SOLD OUT
        </div>
      ) : isLowStock ? (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e09814', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '2px', zIndex: 2 }}>
          ONLY {totalStock} LEFT
        </div>
      ) : null}
      
      <img src={image} alt={product.name} style={{ filter: isOutOfStock ? 'grayscale(1)' : 'none' }} />
      <div className={styles.simpleCardTitle}>{product.name}</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
        {hasDiscount ? (
            <>
              <div style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.85rem' }}>EGP {parseFloat(originalPrice).toLocaleString()}</div>
              <div className={styles.simpleCardPrice} style={{ color: '#ff4d4d' }}>EGP {parseFloat(displayPrice).toLocaleString()}</div>
            </>
        ) : (
            <div className={styles.simpleCardPrice}>EGP {parseFloat(displayPrice).toLocaleString()}</div>
        )}
      </div>
    </Link>
  );
};

export default function Home() {
  const { user } = useAuth();
  const { points, tier } = useLoyalty();
  const { products, activePromos } = useProducts();
  const t = useTranslations('Hero');

  const [promotions, setPromotions] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userOrders, setUserOrders] = useState([]);

  // --- Move useMemo Filters UP to avoid Temporal Dead Zone ReferenceErrors ---
  const arrivals = useMemo(() => {
    if (!products.length) return [];
    return [...products].sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 8);
  }, [products]);

  const allProducts = useMemo(() => {
    if (!products.length) return [];
    const arrivalIds = new Set(arrivals.map(a => a.id));
    const remainingProducts = products.filter(p => !arrivalIds.has(p.id));
    // Shuffle randomly on each client load
    const shuffled = [...remainingProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8); 
  }, [products, arrivals]);

  const topDeals = useMemo(() => {
    if (!products.length) return [];
    if (user && userOrders.length > 0) {
        const boughtIds = userOrders.flatMap(o => (o.items || []).map(i => i.id)).filter(Boolean);
        const boughtProducts = products.filter(p => boughtIds.includes(p.id));
        const preferredBrands = [...new Set(boughtProducts.map(p => p.brandId || p.brand_id).filter(Boolean))];

        if (preferredBrands.length > 0) {
            const recommended = products.filter(p => preferredBrands.includes(p.brandId || p.brand_id) && !boughtIds.includes(p.id));
            if (recommended.length >= 4) return recommended.slice(0, 4);
            
            const others = [...products]
                .filter(p => !boughtIds.includes(p.id) && !preferredBrands.includes(p.brandId || p.brand_id))
                .sort((a,b) => (b.rating || 0) - (a.rating || 0));
                
            return [...recommended, ...others].slice(0, 4);
        }
    }
    return [...products].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  }, [products, user, userOrders]);

  const specialOffers = useMemo(() => {
      return products.filter(p => {
          const isDiscounted = p.models && p.models.some(m => m.original_price && parseFloat(m.original_price) > parseFloat(m.price));
          const isPromoted = activePromos.some(promo => {
              if (promo.target_type === 'all') return true;
              if (promo.target_type === 'product' && promo.target_id?.split(',').includes(p.id)) return true;
              if (promo.target_type === 'brand' && promo.target_id?.split(',').includes(p.brand_id || p.brandId)) return true;
              return false;
          });
          return isDiscounted || isPromoted;
      });
  }, [products, activePromos]);

  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
      if (specialOffers.length <= 4) return;
      const interval = setInterval(() => {
          setPromoIndex(prev => {
              const maxIndex = Math.ceil(specialOffers.length / 4) - 1;
              return prev >= maxIndex ? 0 : prev + 1;
          });
      }, 4000);
      return () => clearInterval(interval);
  }, [specialOffers.length]);

  const visibleOffers = specialOffers.slice(promoIndex * 4, promoIndex * 4 + 4);

  useEffect(() => {
    if (user) {
        fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
            .then(res => res.json())
            .then(data => {
                if (data.orders) setUserOrders(data.orders);
            }).catch(e => console.error("Failed to load orders for recommendations", e));
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/admin/attributes?category=home_promotion')
        .then(res => res.json())
        .then(json => {
            if (json.success && json.data) {
                setPromotions(json.data.filter(p => p.metadata?.active !== false));
            }
        }).catch(e => console.error('Failed to load promotions:', e));
  }, []);

  const getPromoLink = (meta) => {
      if (!meta) return '/shop';
      let link = '/shop';
      if (meta.link_type === 'product' && meta.link_target_products?.length > 0) {
          if (meta.link_target_products.length === 1) link = `/shop/product/${meta.link_target_products[0]}`;
          else link = `/shop?products=${meta.link_target_products.join(',')}`;
      } else if (meta.link_type === 'brand' && meta.link_target_brands?.length > 0) {
          link = `/shop?brands=${meta.link_target_brands.join(',')}`;
      } else if (meta.link_type === 'custom' && meta.custom_url) {
          link = meta.custom_url;
      }
      return link;
  };

  const heroPromos = promotions.filter(p => p.metadata?.position === 'hero_slider');
  const promoBannerData = promotions.find(p => p.metadata?.position === 'promo_banner');
  const mosaic1 = promotions.find(p => p.metadata?.position === 'mosaic_1');
  const mosaic2 = promotions.find(p => p.metadata?.position === 'mosaic_2');
  const mosaic3 = promotions.find(p => p.metadata?.position === 'mosaic_3');
  const sponsors = promotions.filter(p => p.metadata?.position === 'sponsored_by');

  const defaultMosaics = [
    { title: 'CHATEAU COLLECTION', img: '/images/mockups/category_boxes_1775244000386.png', link: '/shop?type=cigar' },
    { title: 'VINTAGE DOMINIC', img: '/images/mockups/category_samplers_1775244026153.png', link: '/shop?type=sampler' },
    { title: 'PREMIUM', img: '/images/mockups/category_accessories_1775244042649.png', link: '/shop?type=accessory' }
  ];

  const renderMosaic = (promo, defaultData, isWide) => {
      if (promo) {
          return (
              <Link key={promo.id} href={getPromoLink(promo.metadata)} className={`${styles.mosaicItem} ${isWide ? styles.wide : ''}`} style={{ backgroundImage: `url(${promo.metadata.image})` }}>
                <div className={styles.mosaicOverlay}><span className={styles.mosaicTitle}>{promo.metadata.title || ''}</span></div>
              </Link>
          );
      }
      return (
          <Link key={defaultData.title} href={defaultData.link} className={`${styles.mosaicItem} ${isWide ? styles.wide : ''}`} style={{ backgroundImage: `url(${defaultData.img})` }}>
              <div className={styles.mosaicOverlay}><span className={styles.mosaicTitle}>{defaultData.title}</span></div>
          </Link>
      );
  };

  let slides = [];
  if (heroPromos.length > 0) {
      slides = heroPromos.map((promo, idx) => {
          const meta = promo.metadata || {};
          const link = getPromoLink(meta);

          return {
              id: promo.id || `promo_${idx}`,
              image: null, // Removed center image
              bgImage: meta.image,
              title: meta.title || '',
              sub: meta.subtitle || '',
              link: link,
              btnText: 'Discover'
          };
      });
  } else {
      // Fallback
      const heroBackgrounds = [
        '/images/mockups/hero_banner_2_1775244061348.png', 
        '/images/mockups/hero_banner_1_1775243968234.png',
        '/images/mockups/category_boxes_1775244000386.png'
      ];
      slides = arrivals.slice(0, 3).map((product, index) => {
        return {
          id: product.id,
          image: null, // Removed center image here too globally
          bgImage: heroBackgrounds[index],
          title: product.name,
          sub: 'NEW ARRIVAL',
          link: `/shop/product/${product.id}`,
          btnText: 'Shop This Cigar'
        };
      });
  }

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));  return (
    <div className={styles.home}>
      {/* 1. Hero Slideshow */}
      <section className={styles.sliderWrapper} style={{ position: 'relative' }}>
        {slides.map((slide, index) => (
          <div key={slide.id} className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`} style={{ backgroundImage: `url(${slide.bgImage})` }}>
            <Link href={slide.link} className={styles.slideOverlayLink}>
              <div className={styles.slideOverlay}>
                {slide.image && <img src={slide.image} alt={slide.title} className={styles.slideHeroImage} />}
                <h1 className={styles.slideTitle}>{slide.title}</h1>
                <p className={styles.slideSubtitle}>{slide.sub}</p>
                {slide.btnText && <div className="btn" style={{marginTop: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--color-accent)', color: '#fff'}}>{slide.btnText}</div>}
              </div>
            </Link>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button 
                onClick={prevSlide} 
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', padding: '16px 12px', cursor: 'pointer', transition: 'background 0.3s' }} 
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'} 
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                aria-label="Previous Slide"
            >
                <ChevronLeft size={32} />
            </button>
            <button 
                onClick={nextSlide} 
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', padding: '16px 12px', cursor: 'pointer', transition: 'background 0.3s' }} 
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'} 
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                aria-label="Next Slide"
            >
                <ChevronRight size={32} />
            </button>
          </>
        )}

        <div className={styles.sliderControls}>
          {slides.map((_, index) => (
            <div key={index} className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`} onClick={() => setCurrentSlide(index)} />
          ))}
        </div>
      </section>

      {/* 2. Promo Banner */}
      {promoBannerData ? (
        <Link href={getPromoLink(promoBannerData.metadata)} style={{textDecoration: 'none'}}>
            <section className={styles.promoBanner} style={{ backgroundImage: promoBannerData.metadata.image ? `url(${promoBannerData.metadata.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '150px' }}>
                <h2 dangerouslySetInnerHTML={{__html: promoBannerData.metadata.title}} />
                <div className={styles.promoSub} dangerouslySetInnerHTML={{__html: promoBannerData.metadata.subtitle}} />
            </section>
        </Link>
      ) : (
        <section className={styles.promoBanner}>
          <h2>GET <span>10% OFF</span> ON YOUR FIRST ORDER</h2>
          <div className={styles.promoSub}>
            CODE: <span className={styles.promoCode}>FIRSTPUFF10</span>
          </div>
        </section>
      )}

      {/* 3. Mosaic Tiles */}
      <section className={styles.mosaicContainer}>
        <div className={styles.mosaicGrid}>
          {renderMosaic(mosaic1, defaultMosaics[0], true)}
          {renderMosaic(mosaic2, defaultMosaics[1], false)}
          {renderMosaic(mosaic3, defaultMosaics[2], false)}
        </div>
      </section>

      {/* MAIN SECTIONS */}
      <div className={styles.mainSections}>
        
        {/* 4. Our Beloved Products */}
        <div className={styles.sectionContainer}>
          <div className={styles.sectionSmallTitle}>{t('try_now')}</div>
          <h2 className={styles.sectionTitle}>{t('beloved_products')}</h2>
          <div className={styles.belovedGrid}>
            {topDeals.map(p => <ProductSimpleCard key={p.id} product={p} activePromos={activePromos} />)}
          </div>
        </div>

        {/* 4.5. Special Offers (Discounted/Promos) */}
        {specialOffers.length > 0 && (
          <div className={styles.sectionContainer}>
            <div className={styles.sectionSmallTitle}>{(t('special_offers') && !t('special_offers').includes('special_offers')) ? t('special_offers') : 'Don\'t Miss Out'}</div>
            <h2 className={styles.sectionTitle}>{(t('promotions') && !t('promotions').includes('promotions')) ? t('promotions') : 'Discounted & Promoted'}</h2>
            <div className={styles.arrivalsGrid}>
              {visibleOffers.map(p => <ProductSimpleCard key={`promo-${p.id}`} product={p} activePromos={activePromos} />)}
            </div>
          </div>
        )}

        {/* 5. Who We Are */}
        <section className={styles.whoWeAreLayout}>
          <div className={styles.whoWeAreText}>
            <div className={styles.sectionSmallTitle} style={{fontSize: '1.2rem'}}>{t('who_we_are')}</div>
            <h2 dangerouslySetInnerHTML={{ __html: t.raw('discover_art') }}></h2>
            <p>{t('who_we_are_text')}</p>
            <Link href="/about" className="btn" style={{background: '#111', color: '#fff', borderRadius: '2px'}}>{t('discover_more_btn')}</Link>
          </div>
          <div className={styles.whoWeAreImage} style={{ backgroundImage: "url('/images/mockups/who_we_are_1775243983842.png')" }}></div>
        </section>

        {/* 6. New Arrivals */}
        <div className={styles.sectionContainer}>
          <div className={styles.sectionSmallTitle}>{t('shop_now')}</div>
          <h2 className={styles.sectionTitle}>{t('new_arrivals')}</h2>
          <div className={styles.arrivalsGrid}>
            {arrivals.map(p => <ProductSimpleCard key={p.id} product={p} activePromos={activePromos} />)}
          </div>
        </div>

        {/* 7. All Products */}
        <div className={styles.sectionContainer} style={{ marginTop: '8rem' }}>
          <div className={styles.sectionSmallTitle}>{t('explore')}</div>
          <h2 className={styles.sectionTitle}>{t('all_products')}</h2>
          <div className={styles.arrivalsGrid}>
            {allProducts.map(p => <ProductSimpleCard key={`all-${p.id}`} product={p} activePromos={activePromos} />)}
          </div>
        </div>

        {/* 8. Bottom Dashboard (Loyalty + Sponsored) */}
        <div className={styles.bottomDashboard}>
          
          {/* LOYALTY BANNER (Preserved styles) */}
          <section className={styles.loyaltyBanner}>
              {user ? (
                <div className={styles.loyaltyStatus}>
                  <div className={styles.loyaltyHeader}>
                    <h2>Welcome back, {user.name || 'Aficionado'}</h2>
                    <div className={styles.tierBadge}>{tier.name} Status</div>
                  </div>

                  <div className={styles.pointsDisplay}>
                    <div className={styles.pointCircle}>
                      <span className={styles.pointValue}>{points}</span>
                      <span className={styles.pointLabel}>Points</span>
                    </div>

                    <div className={styles.tierProgress}>
                      {tier.name !== 'Platinum' ? (
                        <>
                          <div className={styles.progressText}>
                            <span>{tier.name}</span>
                            <span>{5000 - points} to Platinum ({tier.name === 'Silver' ? 'Next: Gold' : 'Next: Platinum'})</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${Math.min((points / 5000) * 100, 100)}%` }}></div>
                          </div>
                        </>
                      ) : (
                        <p className={styles.maxTier}>You have reached the highest tier. Enjoy exclusive Platinum benefits!</p>
                      )}

                      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link href="/account" className="btn-outline-dark">View My Offers</Link>
                        <Link href="/shop" className="btn-dark">Earn More Points</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 dangerouslySetInnerHTML={{ __html: t.raw('join_title') }} />
                  <p style={{marginBottom: '2rem'}}>{t('join_text')}</p>
                  <Link href="/register" className="btn" style={{ background: '#fff', color: '#120C0A', display: 'inline-block' }}>{t('join_btn')}</Link>
                </>
              )}
          </section>

          {/* SPONSORED BY BOX */}
          <section className={styles.sponsoredBox}>
            <h3>{t('sponsored_by')}</h3>
            <div className={styles.sponsoredLogo} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {sponsors.length > 0 ? (
                sponsors.map(sponsor => (
                  <Link key={sponsor.id} href={`/sponsor/${sponsor.id}`} style={{ textDecoration: 'none' }}>
                    <img 
                        src={sponsor.metadata.image} 
                        alt={sponsor.metadata.title || "Sponsor"} 
                        style={{ maxHeight: '80px', objectFit: 'contain', cursor: 'pointer', transition: 'transform 0.3s' }} 
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </Link>
                ))
              ) : (
                <img src="/favicon.png" alt="Sponsor Logo" style={{ maxHeight: '80px', objectFit: 'contain' }} />
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
