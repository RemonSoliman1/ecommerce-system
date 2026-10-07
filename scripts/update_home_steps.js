const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{\s*element:\s*'\.tour-home-brands'[\s\S]*?\}\s*,/g,
    `{ element: '.tour-home-brands', titleKey: 'home_brands_title', descKey: 'home_brands_desc', side: 'top' },
              { element: '.tour-home-beloved', titleKey: 'home_beloved_title', descKey: 'home_beloved_desc', side: 'top' },
              { element: '.tour-home-offers', titleKey: 'home_offers_title', descKey: 'home_offers_desc', side: 'top' },`
);

content = content.replace(
    /className=\{styles\.sectionContainer\}\s*>\s*<div className=\{styles\.sectionSmallTitle\}>\{t\('try_now'\)\}<\/div>/,
    `className={\`\${styles.sectionContainer} tour-home-beloved\`}>\n            <div className={styles.sectionSmallTitle}>{t('try_now')}</div>`
);

content = content.replace(
    /className=\{styles\.sectionContainer\}\s*>\s*<div className=\{styles\.sectionSmallTitle\}>\{\(t\('special_offers'\)/,
    `className={\`\${styles.sectionContainer} tour-home-offers\`}>\n            <div className={styles.sectionSmallTitle}>{(t('special_offers')`
);


fs.writeFileSync(file, content);
console.log('Updated Home steps');
