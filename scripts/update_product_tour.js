const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Update step
content = content.replace(
    /\{ element: '#tour-account-btn', titleKey: 'account_settings_title'/,
    `{ element: '#tour-account-btn', mobileElement: '#tour-mobile-account', mobileSide: 'top', titleKey: 'account_settings_title'`
);

fs.writeFileSync(file, content);
console.log('Updated Product page tour steps');
