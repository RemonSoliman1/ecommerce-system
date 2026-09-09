const fs = require('fs');

function fixCard(file, isShopPage) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We need to extract the button block and move it outside the </Link>
    const buttonBlock = `                    {!isOut && (
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
                    )}`;
    
    // In ProductCard.js, it might be slightly different indentation
    const buttonBlockRegex = /\{\!isOut && \(\s*<button[\s\S]*?<\/button>\s*\)\}/;
    
    if (content.match(buttonBlockRegex)) {
        // Remove the button from inside the Link
        content = content.replace(buttonBlockRegex, "");
        
        // Add it outside the Link, with absolute positioning
        const linkClose = "</Link>";
        const absoluteButton = `</Link>\n        {!isOut && (
            <button
                style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 20, background: 'var(--color-accent)', color: '#120c0a', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickAdd(true);
                }}
            >
                {t('add_to_cart') || 'Add +'}
            </button>
        )}`;
        
        content = content.replace(linkClose, absoluteButton);
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    } else {
        console.log(`Could not find button block in ${file}`);
    }
}

fixCard('components/ui/ProductCard.js', false);
fixCard('app/[locale]/shop/page.js', true);
