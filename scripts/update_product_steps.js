const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{\s*element:\s*'#tour-similar-items'[\s\S]*?\}\s*\]\s*\}\s*\/>/g,
    `{ element: '#tour-similar-items', titleKey: 'similar_items_title', descKey: 'similar_items_desc', side: 'top', isMock: true },
                        { element: '#tour-account-btn', titleKey: 'account_settings_title', descKey: 'account_settings_desc', side: 'bottom', mustClick: true, nextRoute: typeof window !== 'undefined' ? '/' + window.location.pathname.split('/')[1] + '/account' : '/en/account' }
                    ]}
              />`
);

fs.writeFileSync(file, content);
console.log('Added Account step to Product tour');
