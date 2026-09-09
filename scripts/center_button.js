const fs = require('fs');

function fix(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add padding-bottom to the cardFooter to make room
    content = content.replace("className={styles.cardFooter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '10px' }}>", "className={styles.cardFooter} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '10px', paddingBottom: '50px' }}>");
    
    // In ShopProductCard it might be:
    content = content.replace("<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 'auto' }}>", "<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 'auto', paddingBottom: '50px' }}>");
    
    // Price container was flexDirection column, let's keep it centered
    content = content.replace("<div style={{ display: 'flex', flexDirection: 'column' }}>", "<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>");

    // 2. Center the absolute button, add class 'tour-add-to-cart-btn'
    let buttonRegex = /\{\!isOut && \([\s\S]*?<button[\s\S]*?<\/button>\s*\)\}/;
    
    const centeredButton = `{!isOut && (
            <button
                className="tour-add-to-cart-btn"
                style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 30px)', zIndex: 20, background: 'var(--color-accent)', color: '#120c0a', border: 'none', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickAdd(true);
                }}
            >
                {t('add_to_cart') || 'Add to Cart'}
            </button>
        )}`;
        
    content = content.replace(buttonRegex, centeredButton);
    fs.writeFileSync(file, content);
}

fix('components/ui/ProductCard.js');
fix('app/[locale]/shop/page.js');
console.log('Centered buttons!');
