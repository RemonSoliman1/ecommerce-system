const fs = require('fs');
const content = fs.readFileSync('components/layout/Header.js', 'utf8');
const links = content.match(/href=\{?[`"'](.*?)[`"']\}?/g);
console.log(links);
