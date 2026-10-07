const fs = require('fs');
let file = 'app/[locale]/product/[id]/ProductClient.js';
let content = fs.readFileSync(file, 'utf8');

// Replace TOUR_MOCK_PROMO
content = content.replace(
    /TOUR_MOCK_PROMO/g,
    'FIRSTPUFF'
);

// Remove tour step for gift
content = content.replace(
    /\{ element: '#tour-gift-selector', titleKey: 'gift_selector_title', descKey: 'gift_selector_desc', side: 'top', isMock: true \},/,
    ''
);

// Remove the mock gift UI block
// First let's find the exact block and replace it using regex
content = content.replace(
    /<div id="tour-gift-selector"[\s\S]*?Tour Mock Gift[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
    `</div>
                                      )}`
);

fs.writeFileSync(file, content);
console.log('Fixed ProductClient mocks and removed gifts');
