'use client';

import { useState, use, useEffect, useMemo } from 'react';
import { useRouter } from '@/lib/navigation';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { BRANDS } from '@/lib/data';
import styles from './product.module.css';
import { useTranslations } from 'next-intl';
import WishlistButton from '@/components/ui/WishlistButton';
import { Star, ShieldCheck, Leaf } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProductPage({ params }) {
    const { id } = use(params);
    const t = useTranslations('Product');
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const { user } = useAuth(); // AuthContext to guard Wishlist
    const { showToast } = useToast();
    const router = useRouter();

    const [showAuthModal, setShowAuthModal] = useState(false);

    // 1. Resolve Data (may be undefined)
    const decodedId = id ? decodeURIComponent(id) : '';
    const product = products.find(p => String(p.id) === String(id) || String(p.id) === decodedId);
    const brand = BRANDS.find(b => b.id === product?.brandId);

    // 2. State Hooks (ALWAYS called)
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(null);
    const [giftOptions, setGiftOptions] = useState([]);
    const [selectedGiftOption, setSelectedGiftOption] = useState(null);
    const [showBespokeDrawer, setShowBespokeDrawer] = useState(false);
    
    // Promos State
    const [activePromos, setActivePromos] = useState([]);
    const [showPromoTerms, setShowPromoTerms] = useState(null);

    const allImages = useMemo(() => {
        if (!product) return [];
        let imgs = [...(product.images || [])];
        if (product.image) imgs.unshift(product.image);
        imgs = Array.from(new Set(imgs.filter(Boolean)));
        return imgs.length > 0 ? imgs : ['/images/placeholder.png'];
    }, [product]);

    // 3. Derived Data Hooks (ALWAYS called)
    const validModels = useMemo(() => {
        if (!product || !Array.isArray(product.models)) return [];
        return product.models.filter(m => m && typeof m === 'object' && m.price !== undefined && m.price !== null);
    }, [product]);

    const modelsBySize = useMemo(() => {
        return validModels.reduce((acc, model) => {
            const sizeKey = model.size || 'Standard';
            if (!acc[sizeKey]) acc[sizeKey] = [];
            acc[sizeKey].push(model);
            return acc;
        }, {});
    }, [validModels]);

    const sizes = useMemo(() => Object.keys(modelsBySize), [modelsBySize]);

    const availableModels = useMemo(() => {
        return selectedSize ? modelsBySize[selectedSize] : [];
    }, [selectedSize, modelsBySize]);

    const sortedModels = useMemo(() => {
        // Delegate sorting exclusively to the admin's database insertion order
        return availableModels || [];
    }, [availableModels]);

    // 4. Effect Hooks (ALWAYS called)
    useEffect(() => {
        if (validModels.length > 0 && !selectedSize) {
            const firstSize = sizes[0];
            setSelectedSize(firstSize);
            const models = modelsBySize[firstSize];
            if (models && models.length > 0) {
                const defaultModel = models[0]; // Let the admin dictate the default item
                setSelectedModel(defaultModel);
            }
        }
    }, [validModels, selectedSize, sizes, modelsBySize]);

    useEffect(() => {
        if (product && !activeImage && allImages.length > 0) {
            setActiveImage(allImages[0]);
        }
    }, [product, activeImage, allImages]);

    useEffect(() => {
        if (selectedModel) {
            setQuantity(prev => {
                const maxStock = selectedModel.stock !== undefined ? parseInt(selectedModel.stock, 10) : 9999;
                return Math.min(prev, Math.max(1, maxStock));
            });
        }
    }, [selectedModel]);

    useEffect(() => {
        const fetchGiftOptions = async () => {
            if (product && product.has_gifts) {
                try {
                    const res = await fetch('/api/admin/attributes?category=gift_option');
                    if (res.ok) {
                        const data = await res.json();
                        // Filter out hidden options, non-gift attributes, and sort them
                        const activeGifts = (data.data || []).filter(g => !g.hidden && g.category === 'gift_option' && !['Camacho', 'Domenica', 'Espresso'].includes(g.value));
                        setGiftOptions(activeGifts);
                    }
                } catch (e) {
                    console.error('Failed to load gift options', e);
                }
            }
        };
        fetchGiftOptions();
    }, [product]);

    // Fetch Public Promos
    useEffect(() => {
        const fetchPromos = async () => {
            if (!product) return;
            try {
                const res = await fetch('/api/promotions/active');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.promos) {
                        // Filter promos that apply to this product
                        const applicablePromos = data.promos.filter(p => {
                            if (p.target_type === 'all') return true;
                            if (p.target_type === 'product' && p.target_id) {
                                return p.target_id.split(',').map(s => s.trim()).includes(String(product.id));
                            }
                            if (p.target_type === 'brand' && p.target_id) {
                                const bId = String(product.brandId || product.brand_id || '');
                                return p.target_id.split(',').map(s => s.trim()).includes(bId);
                            }
                            return false;
                        });
                        setActivePromos(applicablePromos);
                    }
                }
            } catch (e) {
                console.error('Failed to load promos', e);
            }
        };
        fetchPromos();
    }, [product]);

    // 5. Conditional Rendering (NOW safe to return early)
    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    if (!product) {
        return <div className="container" style={{ padding: '4rem' }}>{t('not_found')}</div>;
    }

    if (!selectedModel && validModels.length > 0) return null; // Wait for effect to set initial state

    // If no valid models at all
    if (validModels.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem' }}>
                <div className={styles.wrapper}>
                    <div className={styles.imageSection}>
                        <img src={product.image} alt={product.name} style={{ maxWidth: '100%' }} />
                    </div>
                    <div className={styles.detailsSection}>
                        <h1>{product.name}</h1>
                        <p>{t('not_found') || 'Product unavailable'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedModel) return;
        const itemName = selectedModel.name || selectedSize || product.name;

        let giftPayload = null;
        if (selectedGiftOption) {
            const overridePrice = selectedModel?.gift_overrides?.[selectedGiftOption.value];
            const hasOverride = overridePrice !== undefined && overridePrice !== null;
            const finalPrice = hasOverride ? overridePrice : parseFloat(selectedGiftOption.metadata?.price || 0);

            giftPayload = {
                name: selectedGiftOption.value,
                price: finalPrice,
                image: selectedGiftOption.metadata?.image || ''
            };
        }

        const checkoutProduct = { ...product, stock: selectedModel.stock };
        addToCart(checkoutProduct, `${itemName} (${selectedSize})`, selectedModel.price, quantity, giftPayload);
    };

    const handleCheckout = () => {
        if (!selectedModel) return;
        const itemName = selectedModel.name || selectedSize || product.name;

        let giftPayload = null;
        if (selectedGiftOption) {
            const overridePrice = selectedModel?.gift_overrides?.[selectedGiftOption.value];
            const hasOverride = overridePrice !== undefined && overridePrice !== null;
            const finalPrice = hasOverride ? overridePrice : parseFloat(selectedGiftOption.metadata?.price || 0);

            giftPayload = {
                name: selectedGiftOption.value,
                price: finalPrice,
                image: selectedGiftOption.metadata?.image || ''
            };
        }

        const checkoutProduct = {
            ...product,
            image: activeImage || product.image,
            stock: selectedModel.stock
        };

        addToCart(checkoutProduct, `${itemName} (${selectedSize})`, selectedModel.price, quantity, giftPayload);
        router.push('/checkout');
    };

    const handlePrevImage = () => {
        const idx = allImages.indexOf(activeImage);
        setActiveImage(allImages[(idx - 1 + allImages.length) % allImages.length]);
    };

    const handleNextImage = () => {
        const idx = allImages.indexOf(activeImage);
        setActiveImage(allImages[(idx + 1) % allImages.length]);
    };

    return (
        <div className="container">
            <div className={styles.wrapper}>
                {/* Left: Image Gallery */}
                <div className={styles.imageSection}>
                    <div className={styles.mainImage} style={{ position: 'relative' }}>
                        {allImages.length > 1 && (
                            <button
                                onClick={handlePrevImage}
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    zIndex: 10
                                }}
                            >
                                &#8249;
                            </button>
                        )}
                        <img src={activeImage || product.image || '/images/placeholder.png'} alt={product.name}
                            onError={(e) => { e.target.src = '/images/placeholder.png'; }} style={{ background: 'transparent' }} />
                        {allImages.length > 1 && (
                            <button
                                onClick={handleNextImage}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    zIndex: 10
                                }}
                            >
                                &#8250;
                            </button>
                        )}
                    </div>
                    {allImages.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', padding: '5px 0', justifyContent: 'center' }}>
                            {allImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${product.name} ${idx}`}
                                    onClick={() => setActiveImage(img)}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: activeImage === img ? '2px solid var(--color-accent)' : '2px solid transparent',
                                        opacity: activeImage === img ? 1 : 0.8,
                                        transition: 'all 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Tasting Notes & Profile Detail */}
                    {(product.flavor_profile || product.description) && (
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            {/* Tasting Notes */}
                            {product.flavor_profile && product.flavor_profile.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-accent)', marginBottom: '1rem' }}>
                                        {t('tasting_notes')}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                        {(Array.isArray(product.flavor_profile) ? product.flavor_profile : (typeof product.flavor_profile === 'string' ? product.flavor_profile.split(',') : [])).map((note, idx) => (
                                            <span key={idx} style={{ padding: '0.4rem 1rem', border: '1px solid rgba(197, 163, 92, 0.4)', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                                {note.trim ? note.trim() : note}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Profile & Details */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
                                    {t('profile_details')}
                                </h2>
                                <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                                    <span dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.header} style={{ display: 'none' }}>
                        {/* Intentionally hidden so it doesn't break CSS flow structure above it */}
                    </div>

                    {/* Layout Wrapper */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
                        {/* Left Column */}
                        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                {brand?.name && <span className={styles.brandName} style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>{brand.name}</span>}
                                <h1 className={styles.title} style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>{product.name}</h1>

                                {/* Expert Rating */}
                                {product.rating && (() => {
                                    const str = String(product.rating);
                                    const match = str.match(/^\d+/);
                                    const score = match ? parseInt(match[0], 10) : 90;
                                    const displayScore = score <= 10 ? score * 20 : score;

                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cigar Aficionado: </span>
                                            <span style={{ marginLeft: '10px', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>{displayScore} / 100</span>
                                        </div>
                                    );
                                })()}
                                
                                {/* Promo Badge */}
                                {activePromos.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                        {activePromos.map(promo => (
                                            <div key={promo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(197, 163, 92, 0.1)', border: '1px solid var(--color-accent)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setShowPromoTerms(promo)}>
                                                <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>{promo.code}</span>
                                                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                                                    ({promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `EGP ${promo.discount_value} OFF`})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Metadata Block (Strength / Origin) -> Specifically Centered over Controls */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', width: '100%' }}>
                                {product.strength && (() => {
                                    const st = (product.strength || '').toLowerCase();
                                    let score = 3;
                                    if (st.includes('mild to medium')) score = 2;
                                    else if (st.includes('medium to full')) score = 4;
                                    else if (st.includes('mild')) score = 1;
                                    else if (st.includes('full')) score = 5;

                                    const leaves = [];
                                    for (let i = 1; i <= 5; i++) {
                                        leaves.push(<Leaf key={i} size={18} fill={i <= score ? 'var(--color-accent)' : 'transparent'} color="var(--color-accent)" style={{ marginRight: 2 }} strokeWidth={1.5} />);
                                    }
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '1px' }}>{t('strength')}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                                {leaves}
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-primary)', marginLeft: '8px' }}>{product.strength}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '1px' }}>{t('origin')}</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>{product.origin || brand?.origin || 'Imported'}</span>
                                </div>
                            </div>

                            <div className={styles.controls}>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', width: '100%' }}>
                                    {/* 1. Select Format (Size) */}
                                    <div className={styles.controlGroup} style={{ flex: 1, minWidth: '200px' }}>
                                        <label className={styles.label}>Size</label>
                                        <div className={styles.sizeOptions}>
                                            {sizes.map(size => (
                                                <button
                                                    key={size}
                                                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSize : ''}`}
                                                    onClick={() => {
                                                        setSelectedSize(size);
                                                        // Reset to logical default for new size
                                                        const mods = modelsBySize[size];
                                                        const def = mods[0];
                                                        setSelectedModel(def);
                                                        if (def.image) setActiveImage(def.image);

                                                        if (selectedGiftOption) {
                                                            const isAllowed = !def.disable_gifts && (!def.allowed_gifts || def.allowed_gifts.length === 0 || def.allowed_gifts.includes(selectedGiftOption.value));
                                                            if (!isAllowed) setSelectedGiftOption(null);
                                                        }
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <span className={styles.modelName}>{size}</span>
                                                        {modelsBySize[size]?.[0]?.dimensions && (
                                                            <span style={{ fontSize: '0.7em', color: selectedSize === size ? '#eee' : '#888' }}>
                                                                {modelsBySize[size][0].dimensions}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Select Quantity (Variant Name) */}
                                    <div className={styles.controlGroup} style={{ flex: 1, minWidth: '200px' }}>
                                        <label className={styles.label}>Quantity</label>
                                        <div className={styles.typeOptions}>
                                            {sortedModels.map(model => (
                                                <button
                                                    key={model.name}
                                                    className={`${styles.typeBtn} ${selectedModel?.name === model.name ? styles.activeType : ''}`}
                                                    onClick={() => {
                                                        setSelectedModel(model);
                                                        if (model.image) setActiveImage(model.image);

                                                        if (selectedGiftOption) {
                                                            const isAllowed = !model.disable_gifts && (!model.allowed_gifts || model.allowed_gifts.length === 0 || model.allowed_gifts.includes(selectedGiftOption.value));
                                                            if (!isAllowed) setSelectedGiftOption(null);
                                                        }
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <span>{model.name}</span>
                                                        {/* Calculate savings if Box vs Single exist */}
                                                        {model.name.toLowerCase().includes('box') && modelsBySize[selectedSize].some(m => m.name.toLowerCase().includes('single')) && (
                                                            <span className={styles.savings} style={{ fontSize: '0.7em', color: 'green' }}>
                                                                Bulk Savings
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={styles.typePrice}>EGP {(model.price || 0).toLocaleString()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Step 3: Presentation Style */}
                            {product.has_gifts && !selectedModel?.disable_gifts && (
                                <div className={styles.controlGroup} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '1rem' }}>
                                    <label className={styles.label} style={{ color: 'var(--color-accent)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem', display: 'block' }}>Discover Your Exclusive Gifts</label>
                                    {giftOptions.length === 0 ? (
                                        <p style={{ fontSize: '0.9rem', color: '#888' }}>Loading options...</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                            {giftOptions.map(option => {
                                                const isSelected = selectedGiftOption?.id === option.id;
                                                const meta = option.metadata || {};
                                                const isAllowed = !selectedModel?.allowed_gifts || selectedModel.allowed_gifts.length === 0 || selectedModel.allowed_gifts.includes(option.value);

                                                const overridePrice = selectedModel?.gift_overrides?.[option.value];
                                                const hasOverride = overridePrice !== undefined && overridePrice !== null;
                                                const finalPrice = hasOverride ? overridePrice : parseFloat(meta.price || 0);

                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => { if (isAllowed) setSelectedGiftOption(isSelected ? null : option); }}
                                                        style={{
                                                            background: isSelected ? 'rgba(197, 163, 92, 0.1)' : 'transparent',
                                                            border: isSelected ? '2px solid var(--color-accent)' : '1px solid #333',
                                                            borderRadius: '8px',
                                                            padding: '1rem',
                                                            cursor: isAllowed ? 'pointer' : 'not-allowed',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            textAlign: 'center',
                                                            transition: 'all 0.3s ease',
                                                            minHeight: '140px',
                                                            opacity: isAllowed ? 1 : 0.4
                                                        }}
                                                    >
                                                        {meta.image ? (
                                                            <div style={{ width: '100%', height: '60px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <img src={meta.image} alt={option.value} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                                            </div>
                                                        ) : (
                                                            <div style={{ width: '100%', height: '60px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '2rem' }}>🎁</span>
                                                            </div>
                                                        )}
                                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isSelected ? 'var(--color-accent)' : '#fff', marginBottom: '0.25rem' }}>{option.value}</span>
                                                        <span style={{ fontSize: '0.9rem', color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{meta.description}</span>
                                                        <span style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.9rem', fontWeight: 'bold', color: finalPrice === 0 ? 'green' : 'var(--color-accent)' }}>
                                                            {finalPrice === 0 ? '✨ Exclusive Gift' : (
                                                                <>
                                                                    {hasOverride && parseFloat(meta.price) > finalPrice && (
                                                                        <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '6px', fontSize: '0.8rem' }}>
                                                                            +EGP {meta.price}
                                                                        </span>
                                                                    )}
                                                                    + EGP {finalPrice}
                                                                </>
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Price Display */}
                            <div className={styles.priceDisplay}>
                                EGP {(selectedModel?.price || 0).toLocaleString()}
                                <span className={styles.perUnit}>
                                    / {selectedModel?.name}
                                </span>
                            </div>
                            {selectedModel?.stock !== undefined && parseInt(selectedModel.stock) > 0 && parseInt(selectedModel.stock) <= 5 && (
                                <div style={{ color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '1rem', padding: '12px 16px', background: 'rgba(197, 163, 92, 0.1)', border: '1px solid var(--color-accent)', borderRadius: '2px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                    <ShieldCheck size={18} /> Limited Reserve: Only {parseInt(selectedModel.stock)} Vitolas remaining in our humidor.
                                </div>
                            )}

                            {/* Actions */}
                            <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                                {(() => {
                                    const maxStock = selectedModel?.stock !== undefined ? parseInt(selectedModel.stock, 10) : 9999;
                                    const isOut = maxStock <= 0;
                                    return (
                                        <>
                                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                                <div className={styles.quantity} style={{ opacity: isOut ? 0.5 : 1, pointerEvents: isOut ? 'none' : 'auto', flex: '0 0 120px', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '2px' }}>
                                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 15px', color: 'var(--color-text-primary)' }}>-</button>
                                                    <span style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>{quantity}</span>
                                                    <button onClick={() => {
                                                        setQuantity(Math.min(maxStock, quantity + 1));
                                                    }} disabled={quantity >= maxStock} style={{ padding: '0 15px', color: 'var(--color-text-primary)' }}>+</button>
                                                </div>
                                                <button
                                                    className={`btn ${styles.addToCart}`}
                                                    onClick={handleAddToCart}
                                                    disabled={isOut}
                                                    style={isOut ? { background: '#222', color: '#666', border: '1px solid #333', cursor: 'not-allowed', flex: 1, borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' } : { background: 'var(--color-accent)', color: '#120C0A', border: 'none', fontWeight: 'bold', flex: 1, borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                                                >
                                                    {isOut ? t('out_of_stock') || 'Waitlist' : `${t('add_to_cart')} — EGP ${(((selectedModel?.price || 0) + (selectedGiftOption ? (selectedModel?.gift_overrides?.[selectedGiftOption.value] ?? parseFloat(selectedGiftOption.metadata?.price || 0)) : 0)) * quantity).toLocaleString()}`}
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}
                                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                    <button className={`btn`} onClick={handleCheckout} style={{ flex: 1, background: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--color-text-secondary)', borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>
                                        Checkout Now
                                    </button>
                                    <div onClick={() => { if (!user) setShowAuthModal(true); }} style={{ display: 'flex', flex: '0 0 50px', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.3s ease' }} className="wishlist-detail-wrapper">
                                        <WishlistButton product={product} className={styles.wishlistDetailBtn} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal for Wishlist Shielding */}
            {
                showAuthModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'var(--color-bg)', padding: '3rem', borderRadius: '4px', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <ShieldCheck size={48} color="var(--color-accent)" style={{ margin: '0 auto 1.5rem auto' }} />
                            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.8rem' }}>Exclusive Access</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>Please sign in to access your private lounge collection and save preferred vitolas.</p>
                            <button onClick={() => router.push('/login')} className="btn" style={{ background: 'var(--color-accent)', color: '#120C0A', width: '100%', marginBottom: '1rem', border: 'none', fontWeight: 'bold' }}>Sign In</button>
                            <button onClick={() => setShowAuthModal(false)} className="btn-outline" style={{ width: '100%', borderColor: 'transparent', color: 'var(--color-text-secondary)' }}>Return to Shop</button>
                        </div>
                    </div>
                )
            }

            {/* Promo Terms Modal */}
            {
                showPromoTerms && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'var(--color-bg)', padding: '2.5rem', borderRadius: '4px', maxWidth: '450px', width: '90%', textAlign: 'center', border: '1px solid var(--color-accent)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1rem', fontSize: '2rem' }}>Promo Code: {showPromoTerms.code}</h2>
                            
                            <div style={{ color: 'var(--color-text-primary)', marginBottom: '2rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '4px', lineHeight: '1.8' }}>
                                <p><strong>Discount:</strong> {showPromoTerms.discount_type === 'percentage' ? `${showPromoTerms.discount_value}%` : `EGP ${showPromoTerms.discount_value}`}</p>
                                {showPromoTerms.rule_first_order && <p><strong>Requirement:</strong> First-time customers only.</p>}
                                {showPromoTerms.rule_min_order_amount && <p><strong>Minimum Order:</strong> EGP {showPromoTerms.rule_min_order_amount}</p>}
                                {showPromoTerms.rule_payment_methods && <p><strong>Valid Payments:</strong> {showPromoTerms.rule_payment_methods.toUpperCase()}</p>}
                                <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>*Apply this code at checkout.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => {
                                    // Copy to clipboard
                                    navigator.clipboard.writeText(showPromoTerms.code);
                                    localStorage.setItem('pending_promo_code', showPromoTerms.code);
                                    showToast(`Promo ${showPromoTerms.code} applied! Redirecting...`, 'success');
                                    setShowPromoTerms(null);
                                    handleCheckout(); // Automatically add to cart and go to checkout!
                                }} className="btn" style={{ background: 'var(--color-accent)', color: '#120C0A', flex: 1, border: 'none', fontWeight: 'bold' }}>Apply Now</button>
                                
                                <button onClick={() => setShowPromoTerms(null)} className="btn-outline" style={{ flex: 1, borderColor: 'transparent', color: 'var(--color-text-secondary)' }}>Close</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
