'use client';

import { Link, usePathname, useRouter } from '@/lib/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import styles from './Header.module.css';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { User, Heart, ShoppingBag, Trash2 } from 'lucide-react';

import { useTelegram } from '@/context/TelegramContext';

export default function Header() {
    const { isTelegram } = useTelegram();
    const pathname = usePathname();
    const router = useRouter();
    const { cart, updateQuantity, removeFromCart, cartSubtotal, cartTotal, discountAmount, promoCode } = useCart();
    const { user } = useAuth();
    const { products, visibleProducts, brands: BRANDS } = useProducts(); // usage
    const [isHovered, setIsHovered] = useState(false); // Restored
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Restored
    const [activeMobileTab, setActiveMobileTab] = useState('menu'); // 'menu' or 'categories'
    const t = useTranslations('Header');
    const currentLocale = useLocale();

    // Cascading MegaMenu State (Adaptive from Products)
    const [hoveredType, setHoveredType] = useState(null);
    const [hoveredBrand, setHoveredBrand] = useState(null);

    // Derived Menu Data from live products
    const staticTypes = [
        { id: 'cigar', label: 'CIGARS' },
        { id: 'cigarillo', label: 'CIGARILLOS' },
        { id: 'bundle', label: 'BUNDLES' },
        { id: 'sampler', label: 'SAMPLERS' },
        { id: 'accessory', label: 'ACCESSORIES' }
    ];

    // Get unique brands for the hovered type
    const menuBrands = hoveredType ? [...new Set(visibleProducts.filter(p => p.type === hoveredType || (hoveredType === 'cigar' && !p.type)).map(p => (p.brandId || p.brand_id)?.toLowerCase()))].filter(Boolean).sort() : [];

    // Get unique series for the hovered brand (Isolated to only show series matching the active type!)
    const menuSeries = hoveredBrand ? [...new Set(visibleProducts.filter(p => 
        (p.brandId || p.brand_id)?.toLowerCase() === hoveredBrand?.toLowerCase() &&
        (p.type === hoveredType || (hoveredType === 'cigar' && !p.type))
    ).map(p => p.series))].filter(Boolean).sort() : [];

    // New State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // Search Logic
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            import('@/lib/search').then(({ searchProducts }) => {
                const results = searchProducts(query, visibleProducts).slice(0, 5);
                setSearchResults(results);
            });
        } else {
            setSearchResults([]);
        }
    };

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.${styles.searchContainer}`)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll Logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 100) {
                setIsScrolled(true);
            } else if (scrollY < 50) {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Swipe to Close Logic
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        if (isLeftSwipe) {
            setMobileMenuOpen(false);
        }
    };

    // Edge Swipe to Open Logic
    useEffect(() => {
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
        };

        const handleTouchEnd = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX < 50 && touchEndX > touchStartX + 50) {
                setMobileMenuOpen(true);
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const changeLocale = (locale) => {
        router.push(pathname, { locale });
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            {/* ROW 1: ACTION / LOGO / SEARCH / ICONS ROW */}
            <div className={styles.actionBar}>
                <div className={styles.container}>
                    {/* TOP MOBILE ROW: Burger, Search, Icons */}
                    <div className={styles.mobileTopRow}>
                        {/* HAMBURGER MENU */}
                        <button
                            className={styles.hamburger}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
                            <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
                            <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
                        </button>

                        {/* SEARCH BAR (MOBILE & DESKTOP) */}
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder={t('search_label') || 'Search the humidor...'}
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearch(e);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchResults([]);
                                        router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
                                    }
                                }}
                            />
                            <button
                                className={styles.searchSubmitBtn}
                                onClick={() => {
                                    setSearchResults([]);
                                    if (searchQuery) router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
                                }}
                                aria-label="Search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </button>
                            {searchResults.length > 0 && (
                                <div className={styles.searchResults}>
                                    {searchResults.map(p => (
                                        <Link key={p.id} href={`/product/${p.id}`} className={styles.searchItem} onClick={() => { setSearchResults([]); setSearchQuery(''); }}>
                                            <img src={p.image} alt={p.name} className={styles.searchThumb} />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>EGP {p.models[0].price}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CART & LANG (MOBILE) */}
                        <div className={styles.mobileActionsTop}>
                            <Link href="/cart" className={styles.cartIcon}>
                                <ShoppingBag size={24} />
                                {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                            </Link>
                            <div className={styles.langLinksMobileRow}>
                                <button className={`${styles.langLink} ${currentLocale === 'en' ? styles.activeLang : ''}`} onClick={() => changeLocale('en')}>EN</button>
                                <span className={styles.langSep}>|</span>
                                <button className={`${styles.langLink} ${currentLocale === 'ar' ? styles.activeLang : ''}`} onClick={() => changeLocale('ar')}>العربيه</button>
                            </div>
                        </div>
                    </div>

                    {/* LOGO - Centered on Mobile via Flex Row 2 */}
                    <Link href="/" className={styles.logo}>
                        CIGAR <span className={styles.logoAccent}>LOUNGE</span>
                    </Link>

                    {/* DESKTOP ACTIONS (HIDDEN ON MOBILE) */}
                    <div className={`${styles.actions} ${styles.desktopOnly}`}>
                        {user ? (
                            <Link href="/account" className={styles.iconBtn} aria-label="Account">
                                <User size={24} />
                            </Link>
                        ) : (
                            <Link href="/login" className={styles.iconBtn} aria-label="Login">
                                <User size={24} />
                            </Link>
                        )}

                        {/* Admin Link */}
                        {user?.role === 'admin' && (
                            <Link href="/admin" className={styles.iconBtn} aria-label="Admin Dashboard" style={{ color: '#ffcc00' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </Link>
                        )}

                        <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                            <Heart size={24} />
                        </Link>

                        {pathname !== '/login' && pathname !== '/ar/login' && pathname !== '/en/login' && (
                            <div
                                className={styles.cartContainer}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <Link href="/cart" className={styles.cartIcon}>
                                    <ShoppingBag size={24} />
                                    {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                                </Link>
                                <div className={`${styles.miniCart} ${isHovered ? styles.show : ''}`}>
                                    {cart.length === 0 ? (
                                        <div className={styles.empty}>{t('cart_empty')}</div>
                                    ) : (
                                        <>
                                            <ul className={styles.cartList}>
                                                {cart.map((item, idx) => (
                                                    <li key={`${item.id}-${idx}`} className={styles.cartItem} style={{ flexWrap: 'wrap', paddingBottom: '10px' }}>
                                                        <Link href={`/product/${item.id}`} style={{ display: 'flex', gap: '15px', textDecoration: 'none', color: 'inherit', width: '100%', alignItems: 'flex-start' }}>
                                                            <img src={item.image} alt={item.name} className={styles.thumb} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                                            <div className={styles.info} style={{ flex: 1 }}>
                                                                <p className={styles.name} style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
                                                                <p className={styles.size} style={{ margin: '3px 0', fontSize: '0.85rem', color: '#888' }}>{item.selectedSize}</p>
                                                                <p className={styles.price} style={{ margin: 0, color: '#C6A87C' }}>
                                                                    EGP {item.price} {item.giftOption ? `(+${item.giftOption.price} Gift)` : ''}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '10px', justifyContent: 'space-between', paddingLeft: '75px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg)', padding: '0.2rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(item.id, item.selectedSize, -1, item.giftOption?.name); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                                                                <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{item.quantity}</span>
                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(item.id, item.selectedSize, 1, item.giftOption?.name); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                            </div>
                                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.id, item.selectedSize, item.giftOption?.name); }} style={{ background: 'transparent', border: 'none', color: '#f44336', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Remove Item"><Trash2 size={16} /></button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            {discountAmount > 0 && (
                                                <div className={styles.total} style={{ paddingBottom: '5px' }}>
                                                    <span>{t('subtotal') || 'Subtotal'}</span>
                                                    <span>EGP {cartSubtotal?.toFixed(2) || '0.00'}</span>
                                                </div>
                                            )}
                                            {discountAmount > 0 && (
                                                <div className={styles.total} style={{ color: '#4CAF50', borderTop: 'none', paddingTop: 0, paddingBottom: '5px' }}>
                                                    <span>Discount {promoCode ? `(${promoCode})` : ''}</span>
                                                    <span>- EGP {discountAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className={styles.total} style={{ borderTop: discountAmount > 0 ? 'none' : '1px solid var(--color-border)', paddingTop: discountAmount > 0 ? 0 : '15px' }}>
                                                <span>{discountAmount > 0 ? t('total') : (t('subtotal') || 'Subtotal')}</span>
                                                <span>EGP {cartTotal?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <Link href="/checkout" className={`btn ${styles.checkoutBtn}`}>
                                                {t('checkout')}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.langLinks}>
                            <button className={`${styles.langLink} ${currentLocale === 'en' ? styles.activeLang : ''}`} onClick={() => changeLocale('en')}>EN</button>
                            <span className={styles.langSep}>|</span>
                            <button className={`${styles.langLink} ${currentLocale === 'ar' ? styles.activeLang : ''}`} onClick={() => changeLocale('ar')}>العربيه</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: NAVIGATION ROW */}
            <nav className={styles.navBar}>
                <div className="container" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={styles.nav}>
                        <Link href="/" className={styles.link}>HOME</Link>
                        <div className={styles.navItemContainer} onMouseLeave={() => { setHoveredType(null); setHoveredBrand(null); }}>
                            <Link href="/shop" className={styles.link}>SHOP</Link>
                            <div className={styles.megaMenu}>
                                <div className={styles.megaMenuInner}>
                                    {/* Column 1: Categories (Types) */}
                                    <div className={styles.megaColumn} style={{ minWidth: '150px' }}>
                                        <h4>CATEGORIES</h4>
                                        {staticTypes.map(tOption => (
                                            <Link
                                                key={tOption.id}
                                                href={`/shop?type=${tOption.id}`}
                                                onMouseEnter={() => { setHoveredType(tOption.id); setHoveredBrand(null); }}
                                                style={{ color: hoveredType === tOption.id ? 'var(--color-accent)' : '#ccc' }}
                                            >
                                                {tOption.label}
                                            </Link>
                                        ))}
                                        <Link href="/shop" onMouseEnter={() => { setHoveredType(null); setHoveredBrand(null); }} style={{ marginTop: '1rem', color: '#888' }}>All Products</Link>
                                    </div>

                                    {/* Column 2: Brands in this Category */}
                                    {hoveredType && (
                                        <div className={styles.megaColumn} style={{ animation: 'fadeIn 0.3s ease', minWidth: '250px' }}>
                                            <h4>BRANDS IN HUMIDOR</h4>
                                            <div className={styles.megaScrollList}>
                                                {menuBrands.map(brandId => {
                                                    const brandObj = BRANDS.find(b => b.id === brandId);
                                                    const brandName = brandObj ? brandObj.name : (brandId.charAt(0).toUpperCase() + brandId.slice(1).replace(/-/g, ' '));
                                                    return (
                                                        <Link
                                                            key={brandId}
                                                            href={`/shop?type=${hoveredType}&brand=${brandId}`}
                                                            onMouseEnter={() => setHoveredBrand(brandId)}
                                                            style={{ color: hoveredBrand === brandId ? 'var(--color-accent)' : '#ccc', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}
                                                        >
                                                            {brandName}
                                                        </Link>
                                                    );
                                                })}
                                                {menuBrands.length === 0 && <span style={{ color: '#666', fontSize: '0.85rem' }}>No brands available.</span>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Column 3: Series/Vitolas in this Brand */}
                                    {hoveredBrand && (
                                        <div className={styles.megaColumn} style={{ animation: 'fadeIn 0.3s ease', minWidth: '250px' }}>
                                            <h4>AVAILABLE COLLECTIONS</h4>
                                            <div className={styles.megaScrollList}>
                                                <Link
                                                    href={`/shop?type=${hoveredType}&brand=${hoveredBrand}`}
                                                    style={{ color: 'var(--color-accent)', fontStyle: 'italic', marginBottom: '1rem', textTransform: 'uppercase', display: 'block', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}
                                                >
                                                    Shop All {BRANDS.find(b => b.id === hoveredBrand)?.name || hoveredBrand}
                                                </Link>
                                                <div>
                                                    {menuSeries.map(series => (
                                                        <Link
                                                            key={series}
                                                            href={`/shop?type=${hoveredType}&brand=${hoveredBrand}&series=${encodeURIComponent(series)}`}
                                                            style={{ color: '#ccc', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}
                                                        >
                                                            {series}
                                                        </Link>
                                                    ))}
                                                    {menuSeries.length === 0 && <span style={{ color: '#666', fontSize: '0.85rem' }}>No collections found.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Link href="/about" className={styles.link}>HERITAGE</Link>
                        <Link href="/guide" className={styles.link}>GUIDE</Link>
                    </div>
                </div>
            </nav>

            {/* BACKDROP */}
            {mobileMenuOpen && (
                <div className={styles.backdrop} onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* MOBILE DRAWER */}
            <div className={`${styles.navMobile} ${mobileMenuOpen ? styles.mobileNavOpen : ''}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <div className={styles.mobileTabs}>
                    <button 
                        className={`${styles.mobileTab} ${activeMobileTab === 'menu' ? styles.activeMobileTab : ''}`}
                        onClick={() => setActiveMobileTab('menu')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        MAIN MENU
                    </button>
                    <button 
                        className={`${styles.mobileTab} ${activeMobileTab === 'categories' ? styles.activeMobileTab : ''}`}
                        onClick={() => setActiveMobileTab('categories')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        MAIN CATEGORIES
                    </button>
                </div>

                <div className={styles.mobileDrawerContent}>
                    {activeMobileTab === 'menu' ? (
                        <div className={styles.mobileActions}>
                            <Link href="/" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>HOME</Link>
                            <Link href="/shop" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>PRODUCTS</Link>
                            <Link href="/shop?type=sampler" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>SAMPLERS</Link>
                            <Link href="/shop?type=accessory" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>ACCESSORIES</Link>
                            <Link href="/about" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>HERITAGE</Link>
                            <Link href="/guide" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>USER GUIDE</Link>
                            <button className={styles.mobilemylink} onClick={() => { setMobileMenuOpen(false); setContactModalOpen(true); }} style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer'}}>CUSTOMER SERVICE</button>
                        </div>
                    ) : (
                        <div className={styles.mobileActions}>
                            {staticTypes.map(type => (
                                <Link 
                                    key={type.id} 
                                    href={`/shop?type=${type.id}`} 
                                    className={styles.mobilemylink} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {type.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.mobileDrawerBottom}>
                    <div className={styles.langLinksMobile}>
                        <button className={`${styles.langLink} ${currentLocale === 'en' ? styles.activeLang : ''}`} onClick={() => changeLocale('en')}>EN</button>
                        <span className={styles.langSep}>|</span>
                        <button className={`${styles.langLink} ${currentLocale === 'ar' ? styles.activeLang : ''}`} onClick={() => changeLocale('ar')}>العربيه</button>
                    </div>
                </div>
            </div>
        </header>
    );
}
