const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Add id to mobile shop button
content = content.replace(
    /<Link href="\/shop" className=\{styles\.mobileShopBtn\}>/,
    `<Link id="tour-mobile-shop" href="/shop" className={styles.mobileShopBtn}>`
);

// Update step
content = content.replace(
    /\{ element: '#tour-shop', titleKey: 'home_shop_title'/,
    `{ element: '#tour-shop', mobileElement: '#tour-mobile-shop', mobileSide: 'top', titleKey: 'home_shop_title'`
);

fs.writeFileSync(file, content);
console.log('Updated Home page tour steps');
