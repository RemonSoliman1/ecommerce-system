const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Add id to mobile filter toggle
content = content.replace(
    /className=\{styles\.mobileFilterToggle\}/,
    `id="tour-mobile-filter"\n            className={styles.mobileFilterToggle}`
);

// Update step
content = content.replace(
    /\{ element: '#tour-shop-filters', titleKey: 'shop_filters_title'/,
    `{ element: '#tour-shop-filters', mobileElement: '#tour-mobile-filter', mobileSide: 'bottom', titleKey: 'shop_filters_title'`
);

fs.writeFileSync(file, content);
console.log('Updated Shop page tour steps');
