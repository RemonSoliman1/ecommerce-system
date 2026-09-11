const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

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

content = content.replace(
    'return (\n        <div className="container">\n            <div className={styles.wrapper}>',
    'return (\n        <>\n' + tourSteps + '        <div className="container">\n            <div className={styles.wrapper}>'
);

content = content.replace(
    "        </div >\n    );\n}",
    "        </div >\n        </>\n    );\n}"
);

fs.writeFileSync(file, content);
console.log('Fixed syntax error in Product page');
