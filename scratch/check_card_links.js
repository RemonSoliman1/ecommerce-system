const fs = require('fs');
const content = fs.readFileSync('components/ui/ProductCard.js', 'utf8');
const links = content.match(/href=\{?[`"'](.*?)[`"']\}?/g);
console.log(links);
