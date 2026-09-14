const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{ element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: `\/\$\{locale\}\/shop` \}/g,
    "{ element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/shop' : '/en/shop', mustClick: true }"
);

content = content.replace(
    /\{ element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: typeof window !== 'undefined'.*?\}/g,
    "{ element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/shop' : '/en/shop', mustClick: true }"
);

fs.writeFileSync(file, content);
console.log('Updated Home Tour mustClick');
