const fs = require('fs');
let file = 'app/[locale]/checkout/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/localStorage\.getItem\('cigar_user_info'\)/g, "sessionStorage.getItem('cigar_user_info')");
content = content.replace(/localStorage\.setItem\('cigar_user_info'/g, "sessionStorage.setItem('cigar_user_info'");
content = content.replace(/localStorage\.removeItem\('cigar_user_info'\)/g, "sessionStorage.removeItem('cigar_user_info')");

fs.writeFileSync(file, content);
console.log('Fixed Checkout storage');
