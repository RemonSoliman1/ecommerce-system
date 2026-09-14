const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /steps=\{\[[\s\S]*?\]\}/,
    `steps={[
            { element: '#tour-shop-filters', titleKey: 'shop_filters_title', descKey: 'shop_filters_desc', side: 'right' },
            { element: '#tour-shop-sort', titleKey: 'shop_sort_title', descKey: 'shop_sort_desc', side: 'bottom' },
            { element: '#tour-shop-stock', titleKey: 'shop_stock_title', descKey: 'shop_stock_desc', side: 'bottom' },
            { element: '#tour-shop-brands', titleKey: 'shop_brands_title', descKey: 'shop_brands_desc', side: 'bottom' },
            { element: '.tour-wishlist-btn', titleKey: 'wishlist_title', descKey: 'wishlist_desc', side: 'top' },
            { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top' },
            { element: '.tour-view-details-btn', titleKey: 'view_details_title', descKey: 'view_details_desc', side: 'top', nextRoute: \`/\${locale}/product/1\` }
          ]}`
);

fs.writeFileSync(file, content);
console.log('Updated shop/page.js');
