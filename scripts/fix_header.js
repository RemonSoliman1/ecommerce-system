const fs = require('fs');
const file = 'components/layout/Header.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const topPart = lines.slice(0, 123).join('\n');
const replacement = `    return (
        <header className={\`\${styles.header} \${isScrolled ? styles.scrolled : ''}\`}>
            {/* ROW 1: ACTION / LOGO / SEARCH / ICONS ROW */}
            <div className={styles.actionBar}>
                {/* HAMBURGER MENU */}
                <button
                    className={styles.hamburger}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    <span className={\`\${styles.bar} \${mobileMenuOpen ? styles.open : ''}\`}></span>
                    <span className={\`\${styles.bar} \${mobileMenuOpen ? styles.open : ''}\`}></span>
                    <span className={\`\${styles.bar} \${mobileMenuOpen ? styles.open : ''}\`}></span>
                </button>

                {/* LOGO (LEFT) */}
                <Link href="/" className={styles.logo}>
                    CIGAR <span className={styles.logoAccent}>LOUNGE</span>
                </Link>

                {/* SEARCH BAR (CENTER) */}
                <div className={\`\${styles.searchContainer} \${styles.desktopOnly}\`}>
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
                                router.push(\`/shop?q=\${encodeURIComponent(searchQuery)}\`);
                            }
                        }}
                    />
                    <button
                        className={styles.searchSubmitBtn}
                        onClick={() => {
                            setSearchResults([]);
                            if (searchQuery) router.push(\`/shop?q=\${encodeURIComponent(searchQuery)}\`);
                        }}
                        aria-label="Search"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </button>
                    {searchResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {searchResults.map(p => (
                                <Link key={p.id} href={\`/product/\${p.id}\`} className={styles.searchItem} onClick={() => { setSearchResults([]); setSearchQuery(''); }}>
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

                {/* ICONS & LANG (RIGHT) */}
                <div className={styles.actions}>
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
                            <div className={\`\${styles.miniCart} \${isHovered ? styles.show : ''}\`}>
                                {cart.length === 0 ? (
                                    <div className={styles.empty}>{t('cart_empty')}</div>
                                ) : (
                                    <>
                                        <ul className={styles.cartList}>
                                            {cart.map((item, idx) => (
                                                <li key={\`\${item.id}-\${idx}\`} className={styles.cartItem}>
                                                    <img src={item.image} alt={item.name} className={styles.thumb} />
                                                    <div className={styles.info}>
                                                        <p className={styles.name}>{item.name}</p>
                                                        <p className={styles.size}>{item.selectedSize}</p>
                                                        <p className={styles.price}>EGP {item.price} x {item.quantity}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className={styles.total}>
                                            <span>{t('total')}</span>
                                            <span>EGP {cart.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2)}</span>
                                        </div>
                                        <Link href="/checkout" className={\`btn \${styles.checkoutBtn}\`}>
                                            {t('checkout')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className={styles.langLinks}>
                        <button className={\`\${styles.langLink} \${currentLocale === 'en' ? styles.activeLang : ''}\`} onClick={() => changeLocale('en')}>EN</button>
                        <span className={styles.langSep}>|</span>
                        <button className={\`\${styles.langLink} \${currentLocale === 'ar' ? styles.activeLang : ''}\`} onClick={() => changeLocale('ar')}>AR</button>
                    </div>
                </div>
            </div>

            {/* ROW 2: NAVIGATION ROW */}
            <nav className={styles.navBar}>
                <div className={styles.nav}>
                    <Link href="/" className={styles.link}>HOME</Link>
                    <Link href="/shop" className={styles.link}>SHOP</Link>
                    <Link href="/about" className={styles.link}>HERITAGE</Link>
                </div>
            </nav>

            {/* BACKDROP */}
            {mobileMenuOpen && (
                <div className={styles.backdrop} onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* MOBILE DRAWER */}
            <div className={\`\${styles.navMobile} \${mobileMenuOpen ? styles.mobileNavOpen : ''}\`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <button className={styles.closeBtn} onClick={() => setMobileMenuOpen(false)} aria-label="Close Menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
                <div className={styles.mobileMenuSearch}>
                    <div className={styles.searchContainer}>
                        <input type="text" placeholder={t('search_label') || 'Found...'} className={styles.searchInput} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e); }} onKeyDown={(e) => { if (e.key === 'Enter') { setSearchResults([]); setMobileMenuOpen(false); router.push(\`/shop?q=\${encodeURIComponent(searchQuery)}\`); } }} suppressHydrationWarning />
                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map(p => (
                                    <Link key={p.id} href={\`/product/\${p.id}\`} className={styles.searchItem} onClick={() => { setSearchResults([]); setSearchQuery(''); setMobileMenuOpen(false); }}>
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
                </div>
                <div className={styles.mobileActions}>
                    <Link href="/" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>HOME</Link>
                    <Link href="/shop" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>SHOP</Link>
                    <Link href="/about" className={styles.mobilemylink} onClick={() => setMobileMenuOpen(false)}>HERITAGE</Link>
                </div>
            </div>
        </header>
    );
}
export default Header;
`;
fs.writeFileSync(file, topPart + '\n' + replacement, 'utf8');
console.log('Successfully wrote lines to EOF using Array slice!');
