const fs = require('fs');
let file = 'context/AuthContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/localStorage\.removeItem\('cigar_cart'\)/g, "sessionStorage.removeItem('cigar_cart')");
content = content.replace(/localStorage\.removeItem\('cigar_user_info'\)/g, "sessionStorage.removeItem('cigar_user_info')");

fs.writeFileSync(file, content);
console.log('Fixed AuthContext logout storage clearing');
