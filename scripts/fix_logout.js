const fs = require('fs');
let file = 'context/AuthContext.js';
let content = fs.readFileSync(file, 'utf8');

const regexLogout = /localStorage\.removeItem\('cigar_user_email'\);\s*localStorage\.removeItem\('cigar_user'\);\s*\/\/\s*Cleanup old key/;

content = content.replace(regexLogout, `localStorage.removeItem('cigar_user_email');\n        sessionStorage.removeItem('cigar_user_email');\n        localStorage.removeItem('cigar_user');`);

// Also fix checkSession the same way!
const regexCheckSession = /localStorage\.removeItem\('cigar_user_email'\);\s*\/\/\s*Invalid session/;

content = content.replace(regexCheckSession, `localStorage.removeItem('cigar_user_email');\n                        sessionStorage.removeItem('cigar_user_email');`);

fs.writeFileSync(file, content);
console.log('Fixed logout successfully!');
