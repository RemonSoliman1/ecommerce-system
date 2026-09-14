const fs = require('fs');
let file = 'components/account/UserGuide.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "localStorage.removeItem('cigar_tour_account_done');",
    "localStorage.removeItem('cigar_tour_account_done');\n        localStorage.removeItem('cigar_global_tour_active');"
);

fs.writeFileSync(file, content);
console.log('Fixed resetTours');
