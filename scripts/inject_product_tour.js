const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject ID to Size Options
content = content.replace(
    '<div className={styles.sizeOptions}>',
    '<div id="tour-size-selector" className={styles.sizeOptions}>'
);

// 2. Inject ID to Gifts
content = content.replace(
    '<div className={styles.controlGroup} style={{ borderTop: \'1px solid rgba(255,255,255,0.1)\', paddingTop: \'2rem\', marginTop: \'1rem\' }}>',
    '<div id="tour-gift-selector" className={styles.controlGroup} style={{ borderTop: \'1px solid rgba(255,255,255,0.1)\', paddingTop: \'2rem\', marginTop: \'1rem\' }}>'
);

// 3. Inject ID to Promos
const promoRegex = /\{activePromos\.length > 0 && \(\s*<div style=\{\{ display: 'flex'/;
content = content.replace(
    promoRegex,
    '{activePromos.length > 0 && (\n                                      <div id="tour-promo-banner" style={{ display: \'flex\''
);

// 4. Inject ID to Tasting Notes
const notesRegex = /\{product\.flavor_profile && product\.flavor_profile\.length > 0 && \(\s*<div style=\{\{ marginBottom: '2rem' \}\}>/;
content = content.replace(
    notesRegex,
    '{product.flavor_profile && product.flavor_profile.length > 0 && (\n                                  <div id="tour-tasting-notes" style={{ marginBottom: \'2rem\' }}>'
);

// 5. Inject ID to Similar Items
content = content.replace(
    '<RelatedProducts',
    '<div id="tour-similar-items"><RelatedProducts'
);
content = content.replace(
    'currentProductId={product.id} />',
    'currentProductId={product.id} /></div>'
);

// 6. Add TourTrigger to return
const returnRegex = /return \(\s*<div className="container">/;
const returnReplacement = `return (
        <div className="container">
            <TourTrigger
                tourName="product"
                steps={[
                    { element: '#tour-size-selector', titleKey: 'size_selector_title', descKey: 'size_selector_desc', side: 'bottom' },
                    { element: '#tour-gift-selector', titleKey: 'gift_selector_title', descKey: 'gift_selector_desc', side: 'top' },
                    { element: '#tour-promo-banner', titleKey: 'promo_banner_title', descKey: 'promo_banner_desc', side: 'bottom' },
                    { element: '#tour-tasting-notes', titleKey: 'tasting_notes_title', descKey: 'tasting_notes_desc', side: 'top' },
                    { element: '#tour-similar-items', titleKey: 'similar_items_title', descKey: 'similar_items_desc', side: 'top' }
                ]}
            />`;

if (!content.includes('tourName="product"')) {
    content = content.replace(returnRegex, returnReplacement);
}

fs.writeFileSync(file, content);
console.log('Injected Product Tour');
