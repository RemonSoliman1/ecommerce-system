const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '<section className={styles.sliderWrapper}',
    '<section className={`${styles.sliderWrapper} tour-home-hero`}'
);
content = content.replace(
    '<section className={styles.mosaicContainer}>',
    '<section className={`${styles.mosaicContainer} tour-home-featured`}>'
);
content = content.replace(
    '<section className={styles.whoWeAreLayout}>',
    '<section className={`${styles.whoWeAreLayout} tour-home-brands`}>'
);

fs.writeFileSync(file, content);
console.log('Tagged home sections');
