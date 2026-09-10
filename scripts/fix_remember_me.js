const fs = require('fs');
let file = 'context/AuthContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "setUser(data.user);\n                localStorage.setItem('cigar_user_email', data.user.email); // Restored",
    "setUser(data.user);\n                if (rememberMe) {\n                    localStorage.setItem('cigar_user_email', data.user.email);\n                } else {\n                    sessionStorage.setItem('cigar_user_email', data.user.email);\n                }"
);

content = content.replace(
    "const storedEmail = localStorage.getItem('cigar_user_email');",
    "const storedEmail = localStorage.getItem('cigar_user_email') || sessionStorage.getItem('cigar_user_email');"
);

content = content.replace(
    "localStorage.removeItem('cigar_user_email'); // Invalid session",
    "localStorage.removeItem('cigar_user_email');\n                        sessionStorage.removeItem('cigar_user_email');"
);

content = content.replace(
    "localStorage.removeItem('cigar_user_email');\n        localStorage.removeItem('cigar_user'); // Cleanup old key",
    "localStorage.removeItem('cigar_user_email');\n        sessionStorage.removeItem('cigar_user_email');\n        localStorage.removeItem('cigar_user');"
);

fs.writeFileSync(file, content);
console.log('Fixed remember me logic in AuthContext');
