const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
if (!content.includes('TourTrigger')) {
    content = content.replace("import { useTranslations } from 'next-intl';", "import { useTranslations } from 'next-intl';\n" + importStatement);
}

const tourSteps = `
            <TourTrigger 
                tourName="product"
                steps={[
                    { element: '#tour-flavor-profile', titleKey: 'product_profile_title', descKey: 'product_profile_desc', side: 'right' },
                    { element: '#tour-tasting-notes', titleKey: 'product_tasting_title', descKey: 'product_tasting_desc', side: 'bottom' },
                    { element: '#tour-size-selector', titleKey: 'product_sizes_title', descKey: 'product_sizes_desc', side: 'top' },
                    { element: '#tour-gift-selector', titleKey: 'product_gift_title', descKey: 'product_gift_desc', side: 'top' },
                    { element: '#tour-promo-banner', titleKey: 'product_promo_title', descKey: 'product_promo_desc', side: 'bottom' }
                ]}
            />
`;

// Insert right after return ( if not already inserted
if (!content.includes('tourName="product"')) {
    content = content.replace("return (\n        <main", "return (\n        <>\n" + tourSteps + "        <main");
    content = content.replace(/<\/main>\n    \);\n}$/, "</main>\n        </>\n    );\n}");
}

fs.writeFileSync(file, content);
console.log('Added TourTrigger to Product Page');
