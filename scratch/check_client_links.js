const fs = require('fs');
const content = fs.readFileSync('app/[locale]/product/[id]/ProductClient.js', 'utf8');
const links = content.match(/<Link.*?href=\{?['"`](.*?)['"`]/g);
console.log(links);
