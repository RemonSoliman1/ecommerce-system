const fs = require('fs');
let file1 = 'app/[locale]/page.js';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/`\/\$\{locale\}\/shop`/g, "typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/shop' : '/en/shop'");
fs.writeFileSync(file1, content1);

let file2 = 'app/[locale]/shop/page.js';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/`\/\$\{locale\}\/product\/1`/g, "typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/product/1' : '/en/product/1'");
fs.writeFileSync(file2, content2);

console.log('Fixed locale error');
