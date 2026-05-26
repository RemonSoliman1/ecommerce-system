'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname, Link } from '@/lib/navigation';
import { useProducts } from '@/context/ProductContext'; // Context
import styles from './shop.module.css';
import { useTranslations } from 'next-intl';
import ShopSidebar from '@/components/ui/ShopSidebar';
import WishlistButton from '@/components/ui/WishlistButton';
import { SlidersHorizontal, Star } from 'lucide-react';

import { searchProducts } from '@/lib/search';

const STRENGTH_ARRAY = ['Mild', 'Mild-to-Medium', 'Medium', 'Medium-to-Full', 'Full Body'];
const WRAPPER_ARRAY = ['Candela (Green)', 'Claro (Tan)', 'Colorado Claro', 'Colorado', 'Colorado Maduro', 'Maduro (Dark)', 'Oscuro (Black)'];
const FLAVOR_CLUSTERS = {
    'Earth': ['Earthy', 'Leather', 'Woody', 'Cedar', 'Oak'],
    'Spice': ['Black Pepper', 'White Pepper', 'Spicy', 'Cinnamon', 'Nutmeg'],
    'Sweet': ['Creamy', 'Vanilla', 'Cocoa', 'Chocolate', 'Caramel', 'Sweet'],
    'Botanical': ['Nutty', 'Almond', 'Floral', 'Hay', 'Grassy', 'Coffee', 'Espresso']
};

function ShopContent() {
    const { visibleProducts, products, brands: BRANDS, loading, autoHideStock, activePromos = [] } = useProducts(); // context usage
    const t = useTranslations('Shop');
    const tProduct = useTranslations('Product');

    // URL State
    const searchParams = useSearchParams();
    const typeFilter = searchParams.get('type') || 'all';
    const brandFilter = searchParams.get('brand') || 'all';
    const seriesFilter = searchParams.get('series') || 'all';
    const sortParam = searchParams.get('sort') || 'name-asc';

    // New SideBar Filters
    const vibeFilter = searchParams.get('vibe');
    const strengthFilter = searchParams.get('strength');
    const wrapperFilter = searchParams.get('wrapper');
    const flavorFilter = searchParams.get('flavor');
    
    // Promotional Multi-Select Filters
    const productsFilter = searchParams.get('products');
    const brandsFilter = searchParams.get('brands');
    const promoFilter = searchParams.get('promo') === 'true';

    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };
    const searchParam = searchParams.get('q') || '';

    // Local State
    const [activeBrand, setActiveBrand] = useState(brandFilter);
    const [activeType, setActiveType] = useState(typeFilter);
    const [activeSeries, setActiveSeries] = useState(seriesFilter);
    const [sortOption, setSortOption] = useState(sortParam);
    const [searchQuery, setSearchQuery] = useState(searchParam); // New State
    const [inStockOnly, setInStockOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showingSimilar, setShowingSimilar] = useState(false);
    const ITEMS_PER_PAGE = 12;

    // Settings now handled by ProductContext

    const router = useRouter();
    const pathname = usePathname();

    // Update URL function
    const updateParams = (key, value) => {
        // ... (existing logic)
        setCurrentPage(1); // Reset page on filter change
        setShowingSimilar(false); // Reset similar on filter change
        const params = new URLSearchParams(searchParams);

        // Handle Search
        if (key === 'q') {
            if (value) params.set('q', value);
            else params.delete('q');

            // Override categories when actively free-text searching
            params.delete('brand');
            params.delete('type');
            params.delete('series');
            params.delete('category');
        } else {
            // Wipe search input if user clicks a hard category
            if (key === 'brand' || key === 'type' || key === 'series' || key === 'category') {
                params.delete('q');
            }

            // ... existing logic for other keys
            if (key === 'BATCH_UPDATE') {
                setShowFilters(false);
                router.replace(`${pathname}?${value}`);
                return;
            }

            // Clear dependent filters when changing main category
            if (key === 'type') {
                params.delete('brand');
                params.delete('series');
                params.delete('vibe');
                params.delete('strength');
                params.delete('wrapper');
                params.delete('flavor');
                params.delete('size');
            }

            if (value === 'all' || value === 'featured') {
                params.delete(key);
                if (key === 'brand') params.delete('series');
            } else {
                params.set(key, value);
                if (key === 'brand') params.delete('series');
            }

            if (key === 'type') {
                params.delete('brand');
                params.delete('series');
                params.delete('vibe');
                params.delete('strength');
                params.delete('wrapper');
                params.delete('flavor');
                params.delete('size');
            }
            if (key === 'brand') { params.delete('series'); }
        }

        setShowFilters(false);
        router.replace(`${pathname}?${params.toString()}`);
    };

    // ... (updateSeries function)

    // Sync state with URL
    useEffect(() => {
        setActiveBrand(brandFilter);
        setActiveType(typeFilter);
        setActiveSeries(seriesFilter);
        setSortOption(sortParam);
        setSearchQuery(searchParam);
    }, [brandFilter, typeFilter, seriesFilter, sortParam, searchParam]);




    // ... imports

    const clearFilters = () => {
        router.replace(pathname);
    };

    // 1. Filter Products & 2. Sort Products
    const filteredProducts = useMemo(() => {
        if (loading) return []; // Handle loading
        let filtered = visibleProducts; // Use dynamic visible products
        const categoryFilter = searchParams.get('category');

        // Search Filter - Enhanced with Fuzzy & Arabic Support
        if (searchQuery) {
            let processedQuery = searchQuery.toLowerCase().trim();
            const arabicBrandMap = {
                "اوليفا": "oliva",
                "دافيدوف": "davidoff",
                "كوهيبا": "cohiba",
                "ارتورو فوينتي": "arturo fuente",
                "مونتكريستو": "montecristo",
                "روميو وجولييت": "romeo y julieta",
                "روميو و جولييت": "romeo y julieta",
                "بارتاغاس": "partagas",
                "روكي باتيل": "rocky patel",
                "باديس": "padron",
                "كاماتشو": "camacho",
                "اليك برادلي": "alec bradley",
                "ماكانودو": "macanudo"
            };
            for (const [ar, en] of Object.entries(arabicBrandMap)) {
                if (processedQuery.includes(ar)) {
                    processedQuery = processedQuery.replace(ar, en);
                }
            }
            filtered = searchProducts(processedQuery, products);
        }

        if (activeBrand !== 'all') filtered = filtered.filter(p => (p.brandId || p.brand_id) === activeBrand);
        
        // Promotional Multi-Select Filters (From Banners)
        if (productsFilter) {
            const productIds = productsFilter.split(',');
            filtered = filtered.filter(p => productIds.includes(String(p.id)));
        }
        if (brandsFilter) {
            const brandIds = brandsFilter.split(',');
            filtered = filtered.filter(p => brandIds.includes(String(p.brandId || p.brand_id)));
        }
        if (activeType !== 'all') {
            filtered = filtered.filter(p => {
                if (activeType === 'cigar') {
                    // Strictly isolate cigars without fetching bundles/samplers
                    return p.type === 'cigar';
                }
                return p.type === activeType;
            });
        }

        // ... (existing filters)
        if (activeSeries !== 'all') {
            filtered = filtered.filter(p => p.series === activeSeries || p.category === activeSeries);
        }

        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter || p.series === categoryFilter);
        }

        // Apply new SideBar physical attribute filters
        if (strengthFilter) {
            filtered = filtered.filter(p => p.strength && p.strength.toLowerCase().includes(strengthFilter.toLowerCase()));
        }

        if (wrapperFilter) {
            // Check descriptions or tags if wrapper field is missing
            filtered = filtered.filter(p => {
                const searchString = `${p.wrapper || ''} ${p.description || ''}`.toLowerCase();
                return searchString.includes(wrapperFilter.toLowerCase());
            });
        }

        if (flavorFilter) {
            filtered = filtered.filter(p => {
                const searchString = `${Array.isArray(p.flavor_profile) ? p.flavor_profile.join(' ') : ''} ${p.description || ''}`.toLowerCase();
                return searchString.includes(flavorFilter.toLowerCase());
            });
        }

        if (vibeFilter) {
            filtered = filtered.filter(p => {
                // Map vibes to fuzzy text searches in descriptions/profiles
                const desc = p.description?.toLowerCase() || '';
                if (vibeFilter === 'morning') return desc.includes('mild') || desc.includes('coffee') || desc.includes('morning');
                if (vibeFilter === 'after-dinner') return desc.includes('full') || desc.includes('strong') || desc.includes('dinner');
                if (vibeFilter === 'celebration') return p.price > 500 || desc.includes('premium') || desc.includes('rare') || desc.includes('celebration');
                return true;
            });
        }

        if (inStockOnly) {
            filtered = filtered.filter(p => p.models?.some(m => parseInt(m.stock || 0) > 0));
        }
        
        if (promoFilter) {
            filtered = filtered.filter(p => {
                const isDiscounted = p.models && p.models.some(m => m.original_price && parseFloat(m.original_price) > parseFloat(m.price));
                const isPromoted = activePromos.some(promo => {
                    if (promo.target_type === 'all') return true;
                    if (promo.target_type === 'product' && promo.target_id?.split(',').includes(p.id)) return true;
                    if (promo.target_type === 'brand' && promo.target_id?.split(',').includes(p.brand_id || p.brandId)) return true;
                    return false;
                });
                return isDiscounted || isPromoted;
            });
        }

        return filtered.sort((a, b) => { // ... existing sort logic
            // Ensure models exist
            const priceA = a.models?.[0]?.price || 0;
            const priceB = b.models?.[0]?.price || 0;

            switch (sortOption) {
                case 'price-low': return priceA - priceB;
                case 'price-high': return priceB - priceA;
                case 'rating': return (b.rating || 0) - (a.rating || 0);
                case 'name-asc': return a.name.localeCompare(b.name);
                default: return (b.new ? 1 : 0) - (a.new ? 1 : 0);
            }
        });
    }, [visibleProducts, searchParams, loading, typeFilter, brandFilter, seriesFilter, vibeFilter, strengthFilter, wrapperFilter, flavorFilter, inStockOnly, activeType, activeBrand, activeSeries, searchQuery, productsFilter, brandsFilter, promoFilter, sortOption, activePromos]);

    // Proximity Engine for Similar Items
    const similarProducts = useMemo(() => {
        if (!showingSimilar || filteredProducts.length > 0) return [];
        let baseList = visibleProducts.filter(p => !inStockOnly || p.models?.some(m => parseInt(m.stock || 0) > 0));

        let scored = baseList.map(p => {
            let score = 0;
            // 1. Same Brand gets points
            if (activeBrand !== 'all' && (p.brandId || p.brand_id) === activeBrand) score += 5;

            // 2. Strength Proximity
            if (strengthFilter && p.strength) {
                const targetIdx = STRENGTH_ARRAY.findIndex(s => s.toLowerCase() === strengthFilter.toLowerCase());
                const pIdx = STRENGTH_ARRAY.findIndex(s => p.strength.toLowerCase().includes(s.toLowerCase()));
                if (targetIdx !== -1 && pIdx !== -1) {
                    const diff = Math.abs(targetIdx - pIdx);
                    if (diff === 0) score += 10;
                    else if (diff === 1) score += 5; // Adjacent strength
                }
            }

            // 3. Wrapper Proximity
            if (wrapperFilter && p.wrapper) {
                const targetIdx = WRAPPER_ARRAY.findIndex(w => w.toLowerCase().includes(wrapperFilter.toLowerCase()));
                const pIdx = WRAPPER_ARRAY.findIndex(w => p.wrapper.toLowerCase().includes(w.toLowerCase()));
                if (targetIdx !== -1 && pIdx !== -1) {
                    const diff = Math.abs(targetIdx - pIdx);
                    if (diff === 0) score += 8;
                    else if (diff === 1) score += 4;
                }
            }

            // 4. Flavor Proximity
            if (flavorFilter) {
                let targetCluster = null;
                for (const [cluster, flavors] of Object.entries(FLAVOR_CLUSTERS)) {
                    if (flavors.some(f => flavorFilter.toLowerCase().includes(f.toLowerCase()))) {
                        targetCluster = cluster;
                        break;
                    }
                }
                if (targetCluster) {
                    const pFlavors = Array.isArray(p.flavor_profile) ? p.flavor_profile.join(' ') : p.description || '';
                    if (FLAVOR_CLUSTERS[targetCluster].some(f => pFlavors.toLowerCase().includes(f.toLowerCase()))) {
                        score += 8;
                    }
                }
            }

            // Fallback: If no heavy filters, match type/category
            if (score === 0) {
                if (activeType !== 'all' && p.type === activeType) score += 2;
                if (searchQuery && p.name.toLowerCase().includes(searchQuery.split(' ')[0].toLowerCase())) score += 3;
            }

            return { ...p, proximityScore: score };
        });

        // Return top 8 similar items
        return scored.filter(p => p.proximityScore > 0).sort((a, b) => b.proximityScore - a.proximityScore).slice(0, 8);

    }, [showingSimilar, visibleProducts, strengthFilter, wrapperFilter, flavorFilter, activeBrand, activeType, searchQuery, inStockOnly, filteredProducts.length]);

    // 3. Independent Brand Lists (Dynamic + Static)

    // dynamic brands removed in favor of ProductContext brands

    // dynamicBrands removed - now inherited from context

    const allBrands = useMemo(() => {
        if (!BRANDS) return [];
        return BRANDS;
    }, [BRANDS]);

    const availableBrands = useMemo(() => {
        if (loading) return [];
        // Determine which products fit the current type filter
        const typeProducts = visibleProducts.filter(p => {
            if (activeType === 'all') return true;
            return p.type === activeType;
        });
        const activeBrandIds = new Set(typeProducts.map(p => p.brandId || p.brand_id));

        // Return brands that have products in the filtered list
        return allBrands.filter(b => {
            const hasProducts = activeBrandIds.has(b.id);
            return hasProducts;
        }).map(b => {
            // Find a fallback image from a product
            if (!b.logo) {
                const firstProd = typeProducts.find(p => (p.brandId || p.brand_id) === b.id && p.image);
                if (firstProd) b.logo = firstProd.image;
            }
            return b;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [products, loading, allBrands, activeType]);

    const allSeriesMap = useMemo(() => {
        if (loading) return {};
        const map = {};
        products.forEach(p => {
            const bId = p.brandId || p.brand_id;
            if (p.series && bId) {
                if (!map[bId]) map[bId] = new Set();
                map[bId].add(p.series);
            }
        });
        return map;
    }, [products, loading]);

    // Helper to get series list
    const getSeriesForBrand = (brandId) => {
        if (!allSeriesMap[brandId]) return [];
        return Array.from(allSeriesMap[brandId]).map(sId => {
            const sample = products.find(p => p.series === sId);
            const name = sample ? sample.name.replace('Oliva ', '').replace('Melanio', 'Melanio') : sId;
            return { id: sId, name: name };
        }).sort((a, b) => a.name.localeCompare(b.name));
    };


    return (
        <div className="container">
            <div className={styles.header}>
                <h1>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>
            </div>

            <div className={styles.controlsBar}>
                {/* Search Bar Removed */}

                {/* Mobile Filter Toggle */}
                <button
                    className={styles.mobileFilterToggle}
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ marginTop: '1.4rem', padding: '0.4rem 0.6rem', fontSize: '0.8rem', height: '34px' }}
                >
                    <SlidersHorizontal size={14} style={{ marginRight: '6px' }} />
                    {showFilters ? t('close_filters') : 'Filter Categories'}
                </button>



                <div className={styles.sortWrapper}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.4rem' }}>
                        <label style={{ margin: 0 }}>{t('sort.label')}</label>
                        {!autoHideStock && (
                            <div className={styles.segmentedPill} style={{ width: 'auto', padding: '2px', marginLeft: 'auto' }}>
                                <button 
                                    className={`${styles.pillBtn} ${inStockOnly ? styles.pillBtnActive : styles.pillBtnInactive}`}
                                    style={{ padding: '2px 6px', fontSize: '0.65rem', flex: 'none', letterSpacing: '0' }}
                                    onClick={() => setInStockOnly(!inStockOnly)}
                                >
                                    {t('in_stock_only')}
                                </button>
                            </div>
                        )}
                    </div>
                    <select
                        value={sortOption}
                        onChange={(e) => updateParams('sort', e.target.value)}
                        className={styles.sortSelect}
                        suppressHydrationWarning
                    >
                        <option value="featured">{t('sort.new')}</option>
                        <option value="price-low">{t('sort.price_low')}</option>
                        <option value="price-high">{t('sort.price_high')}</option>
                        <option value="rating">{t('sort.rating')}</option>
                        <option value="name-asc">{t('sort.name')}</option>
                    </select>
                </div>
            </div>

            {/* Brand Carousel - Show brands, filter to active brand if one is selected */}
            {(
                <div className={styles.brandCarouselSection}>
                    <div className={styles.brandCarouselHeader}>
                        <h2>{t('top_brands')}</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => scrollCarousel('left')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#fff' }}>&#8249;</button>
                            <button onClick={() => scrollCarousel('right')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#fff' }}>&#8250;</button>
                        </div>
                    </div>
                    <div className={styles.brandCarouselWrapper} style={{ position: 'relative' }}>
                        <div className={styles.brandCarousel} ref={carouselRef}>
                            {availableBrands.filter(b => activeBrand === 'all' || b.id === activeBrand).map(brand => (
                                <div
                                    key={brand.id}
                                    className={styles.brandItem}
                                    onClick={() => updateParams('brand', brand.id)}
                                >
                                    <div className={styles.brandLogo}>
                                        {brand.logo ? (
                                            <img src={brand.logo} alt={brand.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                        ) : null}
                                        <span style={{ display: brand.logo ? 'none' : 'block', color: '#000', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            {brand.name.charAt(0)}
                                        </span>
                                    </div>
                                    <span className={styles.brandName}>{brand.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.layout}>
                {showFilters && <div className={styles.backdrop} onClick={() => setShowFilters(false)} />}

                {/* Sidebar Filters - Wrapped for Mobile Toggle control */}
                <div className={`${styles.sidebarWrapper} ${showFilters ? styles.showFilters : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <h3>{t('filters_sidebar')}</h3>
                        <button className={styles.filterCloseBtn} onClick={() => setShowFilters(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <ShopSidebar
                        styles={styles}
                        activeType={activeType}
                        activeBrand={activeBrand}
                        activeSeries={activeSeries}
                        vibeFilter={vibeFilter}
                        strengthFilter={strengthFilter}
                        wrapperFilter={wrapperFilter}
                        flavorFilter={flavorFilter}
                        promoFilter={promoFilter}
                        availableBrands={availableBrands}
                        getSeriesForBrand={getSeriesForBrand}
                        onUpdateParams={updateParams}
                    />
                </div>

                {/* Right Column (Products & Pagination) */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {/* Product Grid */}
                    <div className={styles.grid}>
                        {filteredProducts.length === 0 && !showingSimilar ? (
                            <div className={styles.emptyState}>
                                <p>{t('no_products')}</p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <button onClick={clearFilters} className="btn-outline">{t('clear_all_filters')}</button>
                                    <button onClick={() => setShowingSimilar(true)} className="btn" style={{ borderColor: 'var(--color-accent)', background: 'rgba(197, 163, 92, 0.1)' }}>
                                        {t('show_similar_items')}
                                    </button>
                                </div>
                            </div>
                        ) : showingSimilar ? (
                            <>
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontStyle: 'italic' }}>{t('curators_suggestions')}</h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t('curators_suggestions_desc')}</p>
                                </div>
                                {similarProducts.length > 0 ? (
                                    similarProducts.map(product => (
                                        <ShopProductCard key={product.id} product={product} t={tProduct} activePromos={activePromos} />
                                    ))
                                ) : (
                                    <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                                        <p>{t('no_close_matches')}</p>
                                        <button onClick={clearFilters} className="btn-outline" style={{ marginTop: '1rem' }}>{t('clear_all_filters')}</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(product => (
                                <ShopProductCard key={product.id} product={product} t={tProduct} activePromos={activePromos} />
                            ))
                        )}
                    </div>

                    {/* Serif Pagination */}
                    {Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) > 1 && (
                        <div className={styles.paginationWrapper} style={{ marginTop: '3rem', textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                                {t('showing')} {((currentPage - 1) * ITEMS_PER_PAGE) + 1} &mdash; {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} {t('of')} {filteredProducts.length} {t('vitolas')}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', fontSize: '1.2rem', flexWrap: 'nowrap', flexDirection: 'row' }}>
                                {currentPage > 1 && (
                                    <button onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Prev</button>
                                )}

                                {[...Array(Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))].map((_, i) => {
                                    const pageNum = i + 1;
                                    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontFamily: 'var(--font-serif)',
                                                    fontSize: currentPage === pageNum ? '1.4rem' : '1.1rem',
                                                    color: currentPage === pageNum ? 'var(--color-accent)' : '#fff',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} style={{ color: '#666' }}>&hellip;</span>;
                                    }
                                    return null;
                                })}

                                {currentPage < Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) && (
                                    <button onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Next</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ShopProductCard({ product, t, activePromos = [] }) {
    const { brands } = useProducts();
    const startPrice = product.models?.[0]?.price || 0;
    const originalPrice = product.models?.[0]?.original_price;
    const hasDiscount = originalPrice && originalPrice > startPrice;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - startPrice) / originalPrice) * 100) : 0;
    const brandName = brands.find(b => b.id === (product.brandId || product.brand_id))?.name;
    const totalStock = product.models ? product.models.reduce((acc, m) => {
        if (m.stock === undefined || m.stock === null || m.stock === '') return acc + Infinity;
        const s = parseInt(m.stock);
        return acc + (isNaN(s) ? 0 : s);
    }, 0) : Infinity;
    const isOut = totalStock <= 0;
    const isLowStock = !isOut && totalStock <= 3;
    
    const hasPromo = activePromos.some(promo => {
        if (promo.target_type === 'all') return true;
        if (promo.target_type === 'product' && promo.target_id?.split(',').includes(product.id)) return true;
        if (promo.target_type === 'brand' && promo.target_id?.split(',').includes(product.brand_id || product.brandId)) return true;
        return false;
    });

    return (
        <Link href={`/product/${product.id}`} className={styles.card} style={{ position: 'relative' }}>
            <div className={styles.imageContainer}>
                {isOut && (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, rgba(208, 200, 185, 0.9), rgba(197, 163, 92, 0.9))', color: '#120C0A', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '2px', zIndex: 10, textTransform: 'uppercase', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                        {t('sold_out') || 'Sold Out'}
                    </div>
                )}
                {isLowStock && (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: '#e09814', color: '#fff', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '2px', zIndex: 10, textTransform: 'uppercase', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '1px' }}>
                        Only {totalStock} Left
                    </div>
                )}
                {product.new && !isOut && !isLowStock && <span className={styles.newBadge}>New Arrival</span>}
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: (isOut || isLowStock) ? 'none' : 'block' }}>
                    <WishlistButton product={product} />
                </div>
                {product.rating && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(20, 15, 12, 0.8)', border: '2px solid var(--color-accent)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 'bold', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {String(product.rating).match(/^\d+/) ? String(product.rating).match(/^\d+/)[0] : '90'}
                    </div>
                )}
                
                {(hasDiscount || hasPromo) && (
                    <div style={{ position: 'absolute', top: '60px', right: '10px', background: '#ff4d4d', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10 }}>
                        {hasDiscount && hasPromo ? 'SALE + PROMO' : (hasDiscount ? 'SALE' : 'PROMO')}
                    </div>
                )}
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <span className={styles.quickViewBtn}>{isOut ? (t('notify_me') || 'Waitlist') : t('view_details')}</span>
                    </div>
                </div>
                <div style={{ width: '100%', height: '100%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', filter: isOut ? 'grayscale(0.5)' : 'contrast(105%) saturate(110%)' }}>
                    <img src={product.image || '/images/placeholder.png'} alt={product.name} className="productImg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', transition: 'transform 0.8s ease' }}
                        onError={(e) => { e.target.src = '/images/placeholder.png'; }} />
                </div>
            </div>
            <div className={styles.cardContent}>
                <span className={styles.brand}>{brandName}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <div className={styles.cardHoverInfo}>
                    <p className={styles.cardMeta}>{product.strength ? `${product.strength} • ` : ''}{product.origin || 'Imported'}</p>
                </div>


                {product.type === 'sampler' && product.sampler_series && (
                    <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '4px 0', fontStyle: 'italic' }}>
                        Includes: {product.sampler_series}
                    </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                    {hasDiscount ? (
                        <>
                            <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.8rem' }}>EGP {originalPrice.toLocaleString()}</span>
                            <p className={styles.price} style={{ color: '#ff4d4d', marginTop: '2px' }}>{t('from')} EGP {startPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', background: '#ff4d4d', color: '#fff', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' }}>-{discountPercent}%</span></p>
                        </>
                    ) : (
                        <p className={styles.price}>{t('from')} EGP {startPrice.toLocaleString()}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function ShopPage() {
    return (
        <main className={styles.page}>
            <Suspense fallback={<div>Loading...</div>}>
                <ShopContent />
            </Suspense>
        </main>
    );
}
