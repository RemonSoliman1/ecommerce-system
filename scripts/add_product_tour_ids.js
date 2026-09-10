const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

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
console.log('Added tour IDs to Product page');
