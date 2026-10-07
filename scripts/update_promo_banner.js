const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Add background image to fallback promo banner
content = content.replace(
    /<section className=\{styles\.promoBanner\}>/,
    `<section className={styles.promoBanner} style={{ backgroundImage: "url('/images/cigars/padron-padron-1.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '200px' }}>
          <div className={styles.promoOverlay} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }}></div>
          <div style={{ position: 'relative', zIndex: 2 }}>`
);

content = content.replace(
    /<h2 dangerouslySetInnerHTML=\{\{ __html: t\.raw\('first_order_promo'\) \}\} \/>\s*<div className=\{styles\.promoSub\} dangerouslySetInnerHTML=\{\{ __html: t\.raw\('code_firstpuff', \{ className: styles\.promoCode \}\) \}\} \/>\s*<\/section>/,
    `<h2 dangerouslySetInnerHTML={{ __html: t.raw('first_order_promo') }} style={{ color: '#fff' }} />
            <div className={styles.promoSub} dangerouslySetInnerHTML={{ __html: t.raw('code_firstpuff', { className: styles.promoCode }) }} style={{ color: '#fff', fontWeight: 'bold' }} />
          </div>
        </section>`
);

fs.writeFileSync(file, content);
console.log('Updated promo banner to be realistic');
