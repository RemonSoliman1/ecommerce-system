const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
content = content.replace(/import { useTranslations } from 'next-intl';\r?\n/, "import { useTranslations } from 'next-intl';\n" + importStatement);

// 2. Add TourTrigger
const tourSteps = `
            <TourTrigger 
                tourName="shop"
                steps={[
                    { element: '#tour-shop-filters', titleKey: 'shop_filters_title', descKey: 'shop_filters_desc', side: 'right' },
                    { element: '.tour-wishlist-btn', titleKey: 'wishlist_title', descKey: 'wishlist_desc', side: 'top' },
                    { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top' }
                ]}
            />
`;

content = content.replace(
    /return \(\r?\n\s*<div className="container">/,
    'return (\n        <>\n' + tourSteps + '        <div className="container">'
);

// 3. Wrap ShopSidebar
content = content.replace(
    /<ShopSidebar/,
    "<div id=\"tour-shop-filters\">\n                        <ShopSidebar"
);

content = content.replace(
    /onUpdateParams={updateParams}\r?\n\s*\/>/,
    "onUpdateParams={updateParams}\n                    />\n                    </div>"
);

// 4. Close Fragment
content = content.replace(
    /\s*<\/div>\r?\n\s*\);\r?\n}\r?\n\r?\nfunction ShopProductCard/,
    "\n        </div>\n        </>\n    );\n}\n\nfunction ShopProductCard"
);

fs.writeFileSync(file, content);
console.log('Script done');
