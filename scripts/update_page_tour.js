const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "{ element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom' }",
    "{ element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: `/${locale}/shop` }"
);
fs.writeFileSync(file, content);
console.log('Updated page.js');
