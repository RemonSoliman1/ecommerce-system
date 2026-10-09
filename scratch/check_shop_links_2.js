const fs = require('fs');
const content = fs.readFileSync('app/[locale]/shop/page.js', 'utf8');
const links = content.match(/<Link\s+.*?href=\{?['"`](.*?)['"`]/g);
console.log(links);
