const fs = require('fs');
let content = fs.readFileSync('app/[locale]/shop/page.js', 'utf8');

let startIndex = content.indexOf('return (\n        <div className="container">');
let endIndex = content.indexOf('function ShopProductCard');

let block = content.substring(startIndex, endIndex);

let openDivs = (block.match(/<div/g) || []).length;
let closeDivs = (block.match(/<\/div>/g) || []).length;

console.log('Open divs:', openDivs);
console.log('Close divs:', closeDivs);
