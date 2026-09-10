const fs = require('fs');
let file = 'context/AuthContext.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /setUser\(data\.user\);\s*localStorage\.setItem\('cigar_user_email',\s*data\.user\.email\);\s*\/\/\s*Restored/;

content = content.replace(regex, `setUser(data.user);\n                if (rememberMe) {\n                    localStorage.setItem('cigar_user_email', data.user.email);\n                } else {\n                    sessionStorage.setItem('cigar_user_email', data.user.email);\n                }`);

fs.writeFileSync(file, content);
console.log('Fixed AuthContext successfully!');
