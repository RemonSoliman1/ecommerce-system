const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
if (!content.includes('import TourTrigger')) {
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
      />`;

if (!content.includes('tourName="product"')) {
    content = content.replace(
        '  return (\n    <main className={styles.productPage}>',
        '  return (\n    <>\n' + tourSteps + '\n    <main className={styles.productPage}>'
    );
    
    // Close the fragment at the very end
    content = content.replace(
        '    </main>\n  );\n}',
        '    </main>\n    </>\n  );\n}'
    );
}

// Add tour IDs to the elements
content = content.replace(
    'className={styles.productAttributes}',
    'id="tour-flavor-profile" className={styles.productAttributes}'
);

content = content.replace(
    'className={styles.tastingNotes}',
    'id="tour-tasting-notes" className={styles.tastingNotes}'
);

content = content.replace(
    '<div className={styles.sizeSelection}>',
    '<div id="tour-size-selector" className={styles.sizeSelection}>'
);

content = content.replace(
    '<div className={styles.giftOption}>',
    '<div id="tour-gift-selector" className={styles.giftOption}>'
);

content = content.replace(
    '<div className={styles.promoBanner}>',
    '<div id="tour-promo-banner" className={styles.promoBanner}>'
);

fs.writeFileSync(file, content);
console.log('Added TourTrigger safely to Product Page');
