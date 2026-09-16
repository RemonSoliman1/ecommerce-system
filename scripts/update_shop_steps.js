const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the last steps in the array
content = content.replace(
    /\{\s*element:\s*'\.quickAddBtnArea'[\s\S]*?\}\s*\]\s*\}\s*\/>/g,
    `{ element: '.tour-shop-card', titleKey: 'hover_item_title', descKey: 'hover_item_desc', side: 'top', mustHover: true },
              { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top', nextRoute: typeof window !== 'undefined' && filteredProducts[0] ? '/' + window.location.pathname.split('/')[1] + '/product/' + filteredProducts[0].id : '/en/shop', mustClick: true }
            ]}
        />`
);

fs.writeFileSync(file, content);
console.log('Updated Shop Tour steps for hover');
