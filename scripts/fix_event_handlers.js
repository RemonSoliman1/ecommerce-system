const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the outer div to add the handlers
const targetDiv = "<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>";
const replacementDiv = `<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}\n        onMouseLeave={() => setIsHoverExpanded(false)}\n        onMouseMove={(e) => {\n            if (!isHoverExpanded && !e.target.closest('.quickAddBtnArea')) {\n                setIsHoverExpanded(true);\n            }\n        }}\n        >`;

content = content.replace(targetDiv, replacementDiv);

// Also need to check if ProductSimpleCard is correct
// <Link href={`/product/${product.id}`} className={`${styles.simpleCard} ${isHoverExpanded ? styles.expandedCard : ""}`} style={{ position: 'relative' }}

fs.writeFileSync(file, content);
console.log('Added event handlers to ShopProductCard');
