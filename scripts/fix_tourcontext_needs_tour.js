const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "if (pendingTour && localStorage.getItem('cigar_global_tour_active') === 'true') {",
    "if (pendingTour && (localStorage.getItem('cigar_global_tour_active') === 'true' || localStorage.getItem('cigar_needs_tour') === 'true')) {\n            if (localStorage.getItem('cigar_needs_tour') === 'true') {\n                localStorage.removeItem('cigar_needs_tour');\n                localStorage.setItem('cigar_global_tour_active', 'true');\n            }"
);

fs.writeFileSync(file, content);
console.log('Fixed TourContext needs tour');
