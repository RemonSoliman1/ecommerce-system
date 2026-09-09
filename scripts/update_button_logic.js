const fs = require('fs');

function fix(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the button block.
    // The previous block was `{!isOut && ( <button ... > {t('add_to_cart') || 'Add to Cart'} </button> )}`
    // or `{!isOut && ( <button ... > {t('add_to_cart') || 'Add +'} </button> )}`

    let buttonRegex = /\{\!isOut && \([\s\S]*?<button[\s\S]*?<\/button>\s*\)\}/;
    
    // Sometimes there are other buttons, but since we are looking precisely at the end, let's be careful.
    // Let's replace the EXACT button we inserted last time.

    const newButtonLogic = `{isOut ? (
            <button
                className="tour-add-to-cart-btn quickAddBtn outOfStock"
                disabled
            >
                {t('sold_out') || 'OUT OF STOCK'}
            </button>
        ) : (
            <button
                className="tour-add-to-cart-btn quickAddBtn"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickAdd(true);
                }}
            >
                {t('add_to_cart') || 'ADD TO CART'}
            </button>
        )}`;
        
    if (content.match(buttonRegex)) {
        content = content.replace(buttonRegex, newButtonLogic);
        fs.writeFileSync(file, content);
        console.log('Fixed button in ' + file);
    } else {
        console.log('Could not match button regex in ' + file);
    }
}

fix('components/ui/ProductCard.js');
fix('app/[locale]/shop/page.js');
