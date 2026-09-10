const fs = require('fs');

let file = 'components/ui/AgeGate.js';
let content = fs.readFileSync(file, 'utf8');

// Skip Age Gate if user is already persistently logged in
content = content.replace(
    "if (!hasVerified) {",
    "if (!hasVerified && !localStorage.getItem('cigar_user_email')) {"
);

fs.writeFileSync(file, content);
console.log('Fixed Age Gate.');
