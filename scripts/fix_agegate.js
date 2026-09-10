const fs = require('fs');
let file = 'components/ui/AgeGate.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "if (localStorage.getItem('cigar_user_email')) {",
    "if (localStorage.getItem('cigar_user_email') || sessionStorage.getItem('cigar_user_email')) {"
);

fs.writeFileSync(file, content);
console.log('Fixed AgeGate remember me logic');
