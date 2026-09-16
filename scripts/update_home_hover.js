const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{\s*element:\s*'#tour-shop'[\s\S]*?\}\s*\]\s*\}\s*\/>/g,
    `{ element: '#tour-shop', titleKey: 'home_shop_hover_title', descKey: 'home_shop_hover_desc', side: 'bottom', mustHover: true },
              { element: '.desktopShopNav', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/shop' : '/en/shop', mustClick: true }
          ]}
        />`
);

fs.writeFileSync(file, content);
console.log('Updated Home Tour hover');
