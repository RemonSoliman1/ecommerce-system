const fs = require('fs');
let file = 'components/account/UserGuide.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "localStorage.removeItem('cigar_global_tour_active');",
    "localStorage.removeItem('cigar_global_tour_active');\n        localStorage.removeItem('cigar_age_verified');\n        localStorage.removeItem('cigar_has_seen_tour');\n        localStorage.removeItem('cigar_needs_tour');"
);

fs.writeFileSync(file, content);
console.log('Fixed resetTours again');
