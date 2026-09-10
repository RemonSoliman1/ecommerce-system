const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// The replacement was:
// const brandName = ...;
// const [isHoverExpanded, setIsHoverExpanded] = useState(false);
// const totalStock = ...

content = content.replace(
    'const brandName = brands.find(b => b.id === (product.brandId || product.brand_id))?.name;\n      const [isHoverExpanded, setIsHoverExpanded] = useState(false);\n    const totalStock = product.models ? product.models.reduce',
    'const brandName = brands.find(b => b.id === (product.brandId || product.brand_id))?.name;\n      const totalStock = product.models ? product.models.reduce'
);

// We also need to add styles.expandedInfo and styles.expandedCard to shop.module.css
let cssFile = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(cssFile, 'utf8');

css = css.replace(
    '.card:hover:not(:has(.quickAddBtnArea:hover)) .cardHoverInfo {',
    '.expandedInfo {'
);

css = css.replace(
    '.card:hover {',
    '.expandedCard {\n      box-shadow: 0 8px 30px rgba(197, 163, 92, 0.15);\n      transform: translateY(-5px);\n  }\n\n  .card:hover {'
);

fs.writeFileSync(file, content);
fs.writeFileSync(cssFile, css);
console.log('Cleaned up');
