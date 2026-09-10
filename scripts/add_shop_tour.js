const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
if (!content.includes('TourTrigger')) {
    content = content.replace("import { useTranslations } from 'next-intl';", "import { useTranslations } from 'next-intl';\n" + importStatement);
}

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

// Insert right after return ( if not already inserted
if (!content.includes('tourName="shop"')) {
    content = content.replace("return (\n        <div", "return (\n        <>\n" + tourSteps + "        <div");
    content = content.replace(/<\/div>\n    \);\n}$/, "</div>\n        </>\n    );\n}");
}

fs.writeFileSync(file, content);
console.log('Added TourTrigger to Shop Page');
