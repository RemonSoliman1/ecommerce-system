const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /steps=\{\[\s*\{\s*element: '#tour-search'[\s\S]*?\]\}/,
    `steps={[
              { element: '.tour-home-hero', titleKey: 'home_hero_title', descKey: 'home_hero_desc', side: 'bottom' },
              { element: '.tour-home-featured', titleKey: 'home_featured_title', descKey: 'home_featured_desc', side: 'top' },
              { element: '.tour-home-brands', titleKey: 'home_brands_title', descKey: 'home_brands_desc', side: 'top' },
              { element: '#tour-search', titleKey: 'home_search_title', descKey: 'home_search_desc', side: 'bottom' },
              { element: '#tour-shop', titleKey: 'home_shop_title', descKey: 'home_shop_desc', side: 'bottom', nextRoute: typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/shop' : '/en/shop', mustClick: true }
          ]}`
);

fs.writeFileSync(file, content);
console.log('Reordered Home Tour steps');
