const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add ID to sort select
if (!content.includes('id="tour-shop-sort"')) {
    content = content.replace(
        'className={styles.sortSelect}',
        'id="tour-shop-sort"\n              className={styles.sortSelect}'
    );
}

// 2. Add ID to in stock toggle
if (!content.includes('id="tour-shop-stock"')) {
    content = content.replace(
        'className={`${styles.pillBtn} ${inStockOnly ? styles.pillBtnActive : styles.pillBtnInactive}`}',
        'id="tour-shop-stock"\n                    className={`${styles.pillBtn} ${inStockOnly ? styles.pillBtnActive : styles.pillBtnInactive}`}'
    );
}

// 3. Add ID to Top Brands
if (!content.includes('id="tour-shop-brands"')) {
    content = content.replace(
        '<div className={styles.brandCarouselSection}>',
        '<div id="tour-shop-brands" className={styles.brandCarouselSection}>'
    );
}

// 4. Update TourTrigger
const oldStepsRegex = /steps=\{\[\s*\{\s*element:\s*'#tour-shop-filters'[\s\S]*?\]\}/;
const newSteps = `steps={[
            { element: '#tour-shop-filters', titleKey: 'shop_filters_title', descKey: 'shop_filters_desc', side: 'right' },
            { element: '#tour-shop-sort', titleKey: 'shop_sort_title', descKey: 'shop_sort_desc', side: 'bottom' },
            { element: '#tour-shop-stock', titleKey: 'shop_stock_title', descKey: 'shop_stock_desc', side: 'bottom' },
            { element: '#tour-shop-brands', titleKey: 'shop_brands_title', descKey: 'shop_brands_desc', side: 'bottom' },
            { element: '.tour-wishlist-btn', titleKey: 'wishlist_title', descKey: 'wishlist_desc', side: 'top' },
            { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top' },
            { element: '#tour-scroll-top', titleKey: 'shop_scroll_title', descKey: 'shop_scroll_desc', side: 'left' }
          ]}`;

content = content.replace(oldStepsRegex, newSteps);

fs.writeFileSync(file, content);
console.log('Injected Shop Tour');
