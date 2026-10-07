const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /<RelatedProducts\s*currentProductId=\{product\.id\}\s*category=\{product\.category\}\s*brandId=\{product\.brandId \|\| product\.brand_id\}\s*\/>/g,
    '<RelatedProducts currentProductId={product.id} category={product.category} brandId={product.brandId || product.brand_id} showTourMocks={showTourMocks} />'
);

fs.writeFileSync(file, content);
console.log('Passed showTourMocks to RelatedProducts');
