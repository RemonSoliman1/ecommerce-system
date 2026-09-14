const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Promo mock
const promoMapRegex = /\{activePromos\.map\(promo => \([\s\S]*?\)\)\}/;
const promoMapMock = `{activePromos.length > 0 ? activePromos.map(promo => (
                                            <div key={promo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(197, 163, 92, 0.1)', border: '1px solid var(--color-accent)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setShowPromoTerms(promo)}>
                                                <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>{promo.code}</span>
                                                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                                                    ({promo.discount_type === 'percentage' ? \`\${promo.discount_value}% OFF\` : \`EGP \${promo.discount_value} OFF\`})
                                                </span>
                                            </div>
                                        )) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(197, 163, 92, 0.1)', border: '1px solid var(--color-accent)', padding: '8px 16px', borderRadius: '4px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>TOUR_MOCK_PROMO</span>
                                            </div>
                                        )}`;

content = content.replace(promoMapRegex, promoMapMock);

// Gifts mock
const giftsRegex = /\{giftOptions\.length === 0 \? \(\s*<p style=\{\{ fontSize: '0\.9rem', color: '#888' \}\}>Loading options\.\.\.<\/p>\s*\) : \(\s*<div style=\{\{ display: 'grid'/;
const giftsMock = `{giftOptions.length === 0 && !showTourMocks ? (
                                        <p style={{ fontSize: '0.9rem', color: '#888' }}>Loading options...</p>
                                    ) : (
                                        <div style={{ display: 'grid'`;
content = content.replace(giftsRegex, giftsMock);

const giftsMapRegex = /\{giftOptions\.map\(option => \{[\s\S]*?\}\)\}/;
const giftsMapMock = `{giftOptions.length > 0 ? giftOptions.map(option => {
                                                const isSelected = selectedGiftOption?.id === option.id;
                                                const meta = option.metadata || {};
                                                const isAllowed = !selectedModel?.allowed_gifts || selectedModel.allowed_gifts.length === 0 || selectedModel.allowed_gifts.includes(option.value);

                                                const discountAmount = parseFloat(selectedModel?.gift_overrides?.[option.value]);
                                                const hasDiscount = !isNaN(discountAmount) && discountAmount > 0;
                                                const originalPrice = parseFloat(meta.price || 0);
                                                const finalPrice = hasDiscount ? Math.max(0, originalPrice - discountAmount) : originalPrice;

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
                                                        {meta.image && <img src={meta.image} alt={option.label} style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: '0.5rem' }} />}
                                                        <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{option.label}</span>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>
                                                            {finalPrice === 0 ? 'FREE' : \`+EGP \${finalPrice.toLocaleString()}\`}
                                                        </div>
                                                        {hasDiscount && (
                                                            <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#666', marginTop: '2px' }}>
                                                                EGP {originalPrice.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            }) : (
                                                <button type="button" style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '140px' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Tour Mock Gift</span>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>FREE</div>
                                                </button>
                                            )}`;
content = content.replace(giftsMapRegex, giftsMapMock);

// Tasting Notes mock
const notesMapRegex = /\{product\.flavor_profile\.map\(\(note, i\) => \([\s\S]*?\)\)\}/;
const notesMapMock = `{(product.flavor_profile && product.flavor_profile.length > 0 ? product.flavor_profile : ['Wood', 'Earth']).map((note, i) => (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                                                    {note.substring(0,2).toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{note}</span>
                                            </div>
                                        ))}`;
content = content.replace(notesMapRegex, notesMapMock);

fs.writeFileSync(file, content);
console.log('Injected tour fallbacks into ProductPage');
