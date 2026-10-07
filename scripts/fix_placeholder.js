const fs = require('fs');
let file = 'components/ui/RelatedProducts.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\/assets\/images\/placeholder\.jpg/g, '/images/placeholder.png');

fs.writeFileSync(file, content);
console.log('Fixed placeholder path');
