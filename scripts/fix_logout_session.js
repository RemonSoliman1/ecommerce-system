const fs = require('fs');
let file = 'context/AuthContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "sessionStorage.removeItem('cigar_user_email');",
    "sessionStorage.removeItem('cigar_user_email');\n        sessionStorage.removeItem('cigar_user_info');"
);

fs.writeFileSync(file, content);
console.log('Fixed AuthContext logout');
