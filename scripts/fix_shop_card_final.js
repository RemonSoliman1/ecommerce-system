const fs = require('fs');
let content = fs.readFileSync('app/[locale]/shop/page.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Add QuickAddModal import
if (!content.includes('import QuickAddModal from')) {
    content = content.replace("import WishlistButton from '@/components/ui/WishlistButton';", "import WishlistButton from '@/components/ui/WishlistButton';\nimport QuickAddModal from '@/components/ui/QuickAddModal';");
}

// 2. Add useState to ShopProductCard
let shopProductCardStart = "function ShopProductCard({ product, t, activePromos = [] }) {\n    const { brands } = useProducts();";
if (content.includes(shopProductCardStart) && !content.includes('const [showQuickAdd, setShowQuickAdd] = useState(false);')) {
    content = content.replace(shopProductCardStart, shopProductCardStart + "\n    const [showQuickAdd, setShowQuickAdd] = useState(false);");
}

// 3. Wrap root Link
let linkStart = "    return (\n        <Link href={`/product/${product.id}`} className={styles.card} style={{ position: 'relative' }}>";
if (content.includes(linkStart)) {
    content = content.replace(linkStart, "    return (\n        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>\n        <Link href={`/product/${product.id}`} className={styles.card} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>");
}

// 4. Replace bottom block
const bottomBlock = `                    {hasDiscount ? (
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
    );`;

const newBottomBlock = `                    {hasDiscount ? (
                        <>
                            <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.8rem' }}>EGP {originalPrice.toLocaleString()}</span>
                            <p className={styles.price} style={{ color: '#ff4d4d', marginTop: '2px' }}>{t('from')} EGP {startPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', background: '#ff4d4d', color: '#fff', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' }}>-{discountPercent}%</span></p>
                        </>
                    ) : (
                        <p className={styles.price}>{t('from')} EGP {startPrice.toLocaleString()}</p>
                    )}
                </div>
                {!isOut && (
                    <button
                        style={{ background: 'var(--color-accent)', color: '#120c0a', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowQuickAdd(true);
                        }}
                    >
                        {t('add_to_cart') || 'Add +'}
                    </button>
                )}
            </div>
        </Link>
        {showQuickAdd && <QuickAddModal product={product} onClose={() => setShowQuickAdd(false)} />}
        </div>
    );`;

if (content.includes(bottomBlock)) {
    content = content.replace(bottomBlock, newBottomBlock);
    
    content = content.replace(
        "<div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>", 
        "<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 'auto' }}>\n                    <div style={{ display: 'flex', flexDirection: 'column' }}>"
    );
    
    fs.writeFileSync('app/[locale]/shop/page.js', content);
    console.log("app/[locale]/shop/page.js fixed successfully!");
} else {
    console.log("Could not find bottomBlock in ShopProductCard");
}
