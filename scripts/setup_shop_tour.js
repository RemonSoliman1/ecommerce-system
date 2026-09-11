const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
content = content.replace("import { useTranslations } from 'next-intl';", "import { useTranslations } from 'next-intl';\n" + importStatement);

// 2. Add TourTrigger at the top of ShopContent return
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
    'return (\n        <div className="container">',
    'return (\n        <>\n' + tourSteps + '        <div className="container">'
);

// 3. Wrap ShopSidebar in the ID
content = content.replace(
    "<ShopSidebar",
    "<div id=\"tour-shop-filters\">\n                        <ShopSidebar"
);
content = content.replace(
    "onUpdateParams={updateParams}\n                    />",
    "onUpdateParams={updateParams}\n                    />\n                    </div>"
);

// 4. Close the Fragment at the end of ShopContent
content = content.replace(
    "        </div>\n    );\n}\n\nfunction ShopProductCard",
    "        </div>\n        </>\n    );\n}\n\nfunction ShopProductCard"
);

fs.writeFileSync(file, content);
console.log("Successfully setup Shop Page Tour");
