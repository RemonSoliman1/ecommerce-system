const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

// The replacement might have trailing spaces or windows newlines
content = content.replace(
    /brandId=\{product\.brandId \|\| product\.brand_id\}\s*\/>/g,
    'brandId={product.brandId || product.brand_id}\n            /></div>'
);

// also just to be safe, if we duplicated it, we don't want `/></div></div>`
content = content.replace(/\/><\/div><\/div>/g, '/></div>');

fs.writeFileSync(file, content);
console.log('Fixed product page syntax');
