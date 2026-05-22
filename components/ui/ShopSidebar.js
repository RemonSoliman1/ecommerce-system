'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/lib/navigation';
import { ChevronDown, ChevronUp, Leaf, Coffee, Wine, Sun, Droplets, Flame, Wind, CircleDashed } from 'lucide-react';

export default function ShopSidebar({
    styles,
    activeType,
    activeBrand,
    activeSeries,
    vibeFilter,
    strengthFilter,
    wrapperFilter,
    flavorFilter,
    availableBrands,
    getSeriesForBrand,
    onUpdateParams,
    onUpdateSeries,
    promoFilter
}) {
    const searchParams = useSearchParams(); // Hook for reading URL
    const router = useRouter();

    // Group available brands by type for display
    const brandsByType = {
        cigar: availableBrands.filter(b => b.type === 'cigar' || !b.type),
        cigarillo: availableBrands.filter(b => b.type === 'cigarillo'),
        bundle: availableBrands.filter(b => b.type === 'bundle'),
        sampler: availableBrands.filter(b => b.type === 'sampler'),
        accessory: availableBrands.filter(b => b.type === 'accessory'),
    };
    // Local state for expanded sections (for "accordion" feel)
    const [expandedCategory, setExpandedCategory] = useState(activeType !== 'all' ? activeType : null);
    const [expandedBrand, setExpandedBrand] = useState(activeBrand !== 'all' ? activeBrand : null);

    const toggleCategory = (cat) => {
        setExpandedCategory(expandedCategory === cat ? null : cat);
    };

    const toggleBrand = (brandId) => {
        setExpandedBrand(expandedBrand === brandId ? null : brandId);
    };

    // Helper to render brand list with checking for series
    const renderBrandList = (brands, requiredType) => {
        return brands.map(brand => {
            const brandSeries = getSeriesForBrand(brand.id);
            return (
                <div key={brand.id} className={styles.brandGroup}>
                    <div className={styles.menuBtnWrapper}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete('q');
                                params.delete('series');
                                params.delete('category');
                                params.delete('vibe');
                                params.delete('strength');
                                params.delete('wrapper');
                                params.delete('flavor');
                                params.delete('size');
                                params.set('type', requiredType);
                                params.set('brand', brand.id);
                                onUpdateParams('BATCH_UPDATE', params.toString());
                            }}
                            className={`${styles.subBtn} ${activeBrand === brand.id ? styles.activeSub : ''}`}
                        >
                            {brand.name}
                        </button>
                        {/* Only show expand button if this brand has series */}
                        {brandSeries.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleBrand(brand.id); }}
                                className={styles.expandBtn}
                                style={{ fontSize: '0.9rem', padding: '0 0.5rem' }}
                            >
                                {expandedBrand === brand.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        )}
                    </div>

                    {/* Nested Series for Brand */}
                    {expandedBrand === brand.id && brandSeries.length > 0 && (
                        <div className={styles.seriesMenu}>
                            <button onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete('q');
                                params.delete('series');
                                params.delete('category');
                                params.delete('vibe');
                                params.delete('strength');
                                params.delete('wrapper');
                                params.delete('flavor');
                                params.delete('size');
                                params.set('type', requiredType);
                                params.set('brand', brand.id);
                                onUpdateParams('BATCH_UPDATE', params.toString());
                            }} className={styles.seriesBtn}>
                                Shop All {brand.name}
                            </button>
                            {brandSeries.map(series => (
                                <button
                                    key={series.id}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete('q');
                                        params.delete('category');
                                        params.delete('vibe');
                                        params.delete('strength');
                                        params.delete('wrapper');
                                        params.delete('flavor');
                                        params.delete('size');
                                        params.set('type', requiredType);
                                        params.set('brand', brand.id);
                                        params.set('series', series.id);
                                        onUpdateParams('BATCH_UPDATE', params.toString());
                                    }}
                                    className={`${styles.seriesBtn} ${activeSeries === series.id ? styles.activeSeries : ''}`}
                                >
                                    {series.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )
        });
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
                <h3 className={styles.sidebarTitle}>Categories</h3>
                <ul className={styles.menuList}>
                    {/* All Products */}
                    <li className={activeType === 'all' ? styles.activeItem : ''}>
                        <button onClick={() => onUpdateParams('type', 'all')} className={styles.menuBtn}>
                            All Collection
                        </button>
                    </li>

                    {/* Cigars */}
                    <li className={`${styles.menuItem} ${activeType === 'cigar' ? styles.activeItem : ''}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button
                                onClick={() => onUpdateParams('type', 'cigar')}
                                className={styles.menuBtn}
                            >
                                <span>Cigars</span>
                            </button>
                            <button
                                onClick={() => toggleCategory('cigar')}
                                className={styles.expandBtn}
                                aria-label="Toggle Cigars"
                            >
                                <span className={styles.arrow}>{expandedCategory === 'cigar' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                            </button>
                        </div>

                        {/* Nested Brands for Cigars */}
                        <div className={`${styles.subMenu} ${expandedCategory === 'cigar' ? styles.expanded : ''}`}>
                            {renderBrandList(brandsByType.cigar, 'cigar')}
                        </div>
                    </li>

                    {/* Cigarillos */}
                    <li className={`${styles.menuItem} ${activeType === 'cigarillo' ? styles.activeItem : ''}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => onUpdateParams('type', 'cigarillo')} className={styles.menuBtn}>
                                Cigarillos
                            </button>
                            <button
                                onClick={() => toggleCategory('cigarillo')}
                                className={styles.expandBtn}
                                aria-label="Toggle Cigarillos"
                            >
                                <span className={styles.arrow}>{expandedCategory === 'cigarillo' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                            </button>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'cigarillo' ? styles.expanded : ''}`}>
                            {renderBrandList(brandsByType.cigarillo, 'cigarillo')}
                        </div>
                    </li>

                    {/* Bundles */}
                    <li className={`${styles.menuItem} ${activeType === 'bundle' ? styles.activeItem : ''}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => onUpdateParams('type', 'bundle')} className={styles.menuBtn}>
                                Bundles
                            </button>
                            <button
                                onClick={() => toggleCategory('bundle')}
                                className={styles.expandBtn}
                                aria-label="Toggle Bundles"
                            >
                                <span className={styles.arrow}>{expandedCategory === 'bundle' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                            </button>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'bundle' ? styles.expanded : ''}`}>
                            {renderBrandList(brandsByType.bundle, 'bundle')}
                        </div>
                    </li>

                    {/* Samplers */}
                    <li className={`${styles.menuItem} ${activeType === 'sampler' ? styles.activeItem : ''}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => onUpdateParams('type', 'sampler')} className={styles.menuBtn}>
                                Samplers
                            </button>
                            <button
                                onClick={() => toggleCategory('sampler')}
                                className={styles.expandBtn}
                                aria-label="Toggle Samplers"
                            >
                                <span className={styles.arrow}>{expandedCategory === 'sampler' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                            </button>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'sampler' ? styles.expanded : ''}`}>
                            {renderBrandList(brandsByType.sampler, 'sampler')}
                        </div>
                    </li>


                    {/* Accessories */}
                    <li className={`${styles.menuItem} ${activeType === 'accessory' ? styles.activeItem : ''}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button
                                onClick={() => onUpdateParams('type', 'accessory')}
                                className={styles.menuBtn}
                            >
                                <span>Accessories</span>
                            </button>
                            <button
                                onClick={() => toggleCategory('accessory')}
                                className={styles.expandBtn}
                                aria-label="Toggle Accessories"
                            >
                                <span className={styles.arrow}>{expandedCategory === 'accessory' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                            </button>
                        </div>

                        <div className={`${styles.subMenu} ${expandedCategory === 'accessory' ? styles.expanded : ''}`}>
                            <button onClick={() => onUpdateParams('category', 'humidor')} className={styles.subBtn}>Humidors</button>
                            <button onClick={() => onUpdateParams('category', 'cutter')} className={styles.subBtn}>Cutters</button>
                            <button onClick={() => onUpdateParams('category', 'lighter')} className={styles.subBtn}>Lighters</button>
                        </div>
                    </li>

                    <li style={{ borderTop: '1px solid var(--color-border)', margin: '1rem 0', paddingTop: '1rem' }}></li>

                    {/* Promotions Filter */}
                    <li className={promoFilter ? styles.activeItem : ''}>
                        <button 
                            onClick={() => onUpdateParams('promo', promoFilter ? 'all' : 'true')} 
                            className={styles.menuBtn}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                        >
                            <span style={{ color: promoFilter ? '#ff4d4d' : 'inherit', fontWeight: promoFilter ? 'bold' : 'normal' }}>Special Offers & Promos</span>
                            {promoFilter && <span style={{ fontSize: '0.7rem', background: '#ff4d4d', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Active</span>}
                        </button>
                    </li>

                    {/* Vibe Filter */}
                    <li className={`${styles.menuItem}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => toggleCategory('vibe')} className={styles.menuBtn}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: vibeFilter ? 'var(--color-accent)' : 'inherit' }}>
                                    The Vibe {vibeFilter && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(197, 163, 92, 0.2)', borderRadius: '4px', border: '1px solid var(--color-accent)', textTransform: 'capitalize' }}>{vibeFilter.replace('-', ' ')}</span>}
                                </span>
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {vibeFilter && (
                                    <button onClick={(e) => { e.stopPropagation(); onUpdateParams('vibe', 'all'); }} className={styles.expandBtn} style={{ padding: '0 8px' }} aria-label="Clear Vibe">
                                        <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>×</span>
                                    </button>
                                )}
                                <button onClick={() => toggleCategory('vibe')} className={styles.expandBtn}>
                                    <span className={styles.arrow}>{expandedCategory === 'vibe' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                                </button>
                            </div>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'vibe' ? styles.expanded : ''}`}>
                            <button onClick={() => onUpdateParams('vibe', 'morning')} className={`${styles.subBtn} ${vibeFilter === 'morning' ? styles.activeSub : ''}`}><Sun size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> Morning Smoke</button>
                            <button onClick={() => onUpdateParams('vibe', 'after-dinner')} className={`${styles.subBtn} ${vibeFilter === 'after-dinner' ? styles.activeSub : ''}`}><Coffee size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> After Dinner</button>
                            <button onClick={() => onUpdateParams('vibe', 'celebration')} className={`${styles.subBtn} ${vibeFilter === 'celebration' ? styles.activeSub : ''}`}><Wine size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> Celebration</button>
                        </div>
                    </li>

                    {/* Strength Filter */}
                    <li className={`${styles.menuItem}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => toggleCategory('strength')} className={styles.menuBtn}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: strengthFilter ? 'var(--color-accent)' : 'inherit' }}>
                                    Strength {strengthFilter && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(197, 163, 92, 0.2)', borderRadius: '4px', border: '1px solid var(--color-accent)', textTransform: 'capitalize' }}>{strengthFilter}</span>}
                                </span>
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {strengthFilter && (
                                    <button onClick={(e) => { e.stopPropagation(); onUpdateParams('strength', 'all'); }} className={styles.expandBtn} style={{ padding: '0 8px' }} aria-label="Clear Strength">
                                        <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>×</span>
                                    </button>
                                )}
                                <button onClick={() => toggleCategory('strength')} className={styles.expandBtn}>
                                    <span className={styles.arrow}>{expandedCategory === 'strength' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                                </button>
                            </div>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'strength' ? styles.expanded : ''}`}>
                            {['Mild', 'Medium-Mild', 'Medium', 'Medium-Full', 'Full'].map((str, idx) => {
                                const isStrActive = strengthFilter === str.toLowerCase();
                                return (
                                    <button key={str} onClick={() => onUpdateParams('strength', str.toLowerCase())} className={`${styles.subBtn} ${isStrActive ? styles.activeSub : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', marginRight: '8px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Leaf key={i} size={14} fill={i <= idx ? 'var(--color-accent)' : 'transparent'} color={i <= idx ? 'var(--color-accent)' : '#888'} style={{ opacity: i <= idx ? 1 : 0.4 }} />
                                            ))}
                                        </div>
                                        {str}
                                    </button>
                                );
                            })}
                        </div>
                    </li>

                    {/* Wrapper Color */}
                    <li className={`${styles.menuItem}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => toggleCategory('wrapper')} className={styles.menuBtn}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: wrapperFilter ? 'var(--color-accent)' : 'inherit' }}>
                                    Wrapper {wrapperFilter && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(197, 163, 92, 0.2)', borderRadius: '4px', border: '1px solid var(--color-accent)', textTransform: 'capitalize' }}>{wrapperFilter}</span>}
                                </span>
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {wrapperFilter && (
                                    <button onClick={(e) => { e.stopPropagation(); onUpdateParams('wrapper', 'all'); }} className={styles.expandBtn} style={{ padding: '0 8px' }} aria-label="Clear Wrapper">
                                        <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>×</span>
                                    </button>
                                )}
                                <button onClick={() => toggleCategory('wrapper')} className={styles.expandBtn}>
                                    <span className={styles.arrow}>{expandedCategory === 'wrapper' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                                </button>
                            </div>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'wrapper' ? styles.expanded : ''}`}>
                            {[{ name: 'Candela', color: '#6B8E23' }, { name: 'Claro', color: '#D2B48C' }, { name: 'Colorado', color: '#8B4513' }, { name: 'Maduro', color: '#3E2723' }, { name: 'Oscuro', color: '#1A1110' }].map(wrap => (
                                <button key={wrap.name} onClick={() => onUpdateParams('wrapper', wrap.name.toLowerCase())} className={`${styles.subBtn} ${wrapperFilter === wrap.name.toLowerCase() ? styles.activeSub : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: wrap.color, marginRight: '10px', boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset, 0 2px 4px rgba(0,0,0,0.5)' }}></span>
                                    {wrap.name}
                                </button>
                            ))}
                        </div>
                    </li>

                    {/* Flavor Profile */}
                    <li className={`${styles.menuItem}`}>
                        <div className={styles.menuBtnWrapper}>
                            <button onClick={() => toggleCategory('flavor')} className={styles.menuBtn}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: flavorFilter ? 'var(--color-accent)' : 'inherit' }}>
                                    Flavor Notes {flavorFilter && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(197, 163, 92, 0.2)', borderRadius: '4px', border: '1px solid var(--color-accent)', textTransform: 'capitalize' }}>{flavorFilter}</span>}
                                </span>
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {flavorFilter && (
                                    <button onClick={(e) => { e.stopPropagation(); onUpdateParams('flavor', 'all'); }} className={styles.expandBtn} style={{ padding: '0 8px' }} aria-label="Clear Flavor">
                                        <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>×</span>
                                    </button>
                                )}
                                <button onClick={() => toggleCategory('flavor')} className={styles.expandBtn}>
                                    <span className={styles.arrow}>{expandedCategory === 'flavor' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                                </button>
                            </div>
                        </div>
                        <div className={`${styles.subMenu} ${expandedCategory === 'flavor' ? styles.expanded : ''}`}>
                            <button onClick={() => onUpdateParams('flavor', 'earthy')} className={`${styles.subBtn} ${flavorFilter === 'earthy' ? styles.activeSub : ''}`}><Leaf size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> Earthy</button>
                            <button onClick={() => onUpdateParams('flavor', 'spicy')} className={`${styles.subBtn} ${flavorFilter === 'spicy' ? styles.activeSub : ''}`}><Flame size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> Spicy / Peppery</button>
                            <button onClick={() => onUpdateParams('flavor', 'creamy')} className={`${styles.subBtn} ${flavorFilter === 'creamy' ? styles.activeSub : ''}`}><CircleDashed size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> Creamy / Nutty</button>
                            <button onClick={() => onUpdateParams('flavor', 'sweet')} className={`${styles.subBtn} ${flavorFilter === 'sweet' ? styles.activeSub : ''}`}><Droplets size={14} style={{ marginRight: '8px', color: 'var(--color-accent)' }} /> Sweet / Cocoa</button>
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
