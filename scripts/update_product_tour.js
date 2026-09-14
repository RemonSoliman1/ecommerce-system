const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /steps=\{\[[\s\S]*?\]\}/,
    `steps={[
                      { element: '#tour-size-selector', titleKey: 'size_selector_title', descKey: 'size_selector_desc', side: 'bottom' },
                      { element: '#tour-gift-selector', titleKey: 'gift_selector_title', descKey: 'gift_selector_desc', side: 'top', isMock: true },
                      { element: '#tour-promo-banner', titleKey: 'promo_banner_title', descKey: 'promo_banner_desc', side: 'bottom', isMock: true },
                      { element: '#tour-tasting-notes', titleKey: 'tasting_notes_title', descKey: 'tasting_notes_desc', side: 'top', isMock: true },
                      { element: '#tour-similar-items', titleKey: 'similar_items_title', descKey: 'similar_items_desc', side: 'top' }
                  ]}`
);

fs.writeFileSync(file, content);
console.log('Updated product/[id]/page.js');
