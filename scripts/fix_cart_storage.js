const fs = require('fs');
let file = 'context/CartContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/localStorage\.getItem\('cigar_cart'\)/g, "sessionStorage.getItem('cigar_cart')");
content = content.replace(/localStorage\.setItem\('cigar_cart'/g, "sessionStorage.setItem('cigar_cart'");
content = content.replace(/localStorage\.removeItem\('cigar_cart'\)/g, "sessionStorage.removeItem('cigar_cart')");

fs.writeFileSync(file, content);
console.log('Fixed CartContext storage');
