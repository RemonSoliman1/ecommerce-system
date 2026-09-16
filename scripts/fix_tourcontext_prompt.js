const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove auto-start for cigar_needs_tour
content = content.replace(
    "if (pendingTour && (localStorage.getItem('cigar_global_tour_active') === 'true' || localStorage.getItem('cigar_needs_tour') === 'true')) {",
    "if (pendingTour && localStorage.getItem('cigar_global_tour_active') === 'true') {"
);

// Remove the block inside it
content = content.replace(
    /if \(localStorage\.getItem\('cigar_needs_tour'\) === 'true'\) \{\s*localStorage\.removeItem\('cigar_needs_tour'\);\s*localStorage\.setItem\('cigar_global_tour_active', 'true'\);\s*\}/,
    ""
);

// 2. Set global tour active when clicking Start Tour
content = content.replace(
    /onClick=\{confirmTour\}/,
    "onClick={() => { localStorage.removeItem('cigar_needs_tour'); localStorage.setItem('cigar_global_tour_active', 'true'); confirmTour(); }}"
);

// 3. Clear needs_tour if they skip
content = content.replace(
    /onClick=\{skipTour\}/,
    "onClick={() => { localStorage.removeItem('cigar_needs_tour'); skipTour(); }}"
);

fs.writeFileSync(file, content);
console.log('Fixed TourContext prompt logic');
