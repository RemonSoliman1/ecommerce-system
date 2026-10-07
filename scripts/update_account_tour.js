const fs = require('fs');
let file = 'app/[locale]/account/page.js';
let content = fs.readFileSync(file, 'utf8');

// Update steps
content = content.replace(
    /\{ element: '\.tour-account-sidebar', titleKey: 'account_sidebar_title', descKey: 'account_sidebar_desc', side: 'right' \}/,
    `{ element: '.tour-account-sidebar', titleKey: 'account_sidebar_title', descKey: 'account_sidebar_desc', side: 'right', mobileSide: 'bottom' }`
);
content = content.replace(
    /\{ element: '#tour-overview-tab', titleKey: 'account_overview_title', descKey: 'account_overview_desc', side: 'right' \}/,
    `{ element: '#tour-overview-tab', titleKey: 'account_overview_title', descKey: 'account_overview_desc', side: 'right', mobileSide: 'bottom' }`
);
content = content.replace(
    /\{ element: '#tour-orders-tab', titleKey: 'account_orders_title', descKey: 'account_orders_desc', side: 'right' \}/,
    `{ element: '#tour-orders-tab', titleKey: 'account_orders_title', descKey: 'account_orders_desc', side: 'right', mobileSide: 'bottom' }`
);
content = content.replace(
    /\{ element: '#tour-settings-tab', titleKey: 'account_settings_title', descKey: 'account_settings_desc', side: 'right' \}/,
    `{ element: '#tour-settings-tab', titleKey: 'account_settings_title', descKey: 'account_settings_desc', side: 'right', mobileSide: 'bottom' }`
);

fs.writeFileSync(file, content);
console.log('Updated Account page tour steps');
