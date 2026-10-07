const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// The current last 2 steps are:
// { element: '.tour-shop-card', titleKey: 'hover_item_title', descKey: 'hover_item_desc', side: 'top', mustHover: true },
// { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top', nextRoute: ..., mustClick: true }

content = content.replace(
    /\{\s*element:\s*'\.tour-shop-card'[\s\S]*?\}\s*\]\s*\}\s*\/>/g,
    `{ element: '.tour-shop-card', titleKey: 'hover_item_title', descKey: 'hover_item_desc', side: 'top', mustHover: true },
              { element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top', mustClick: true },
              { element: '.tour-quickadd-link', titleKey: 'quickadd_modal_title', descKey: 'quickadd_modal_desc', side: 'bottom', mustClick: true, nextRoute: typeof window !== 'undefined' && filteredProducts[0] ? '/' + window.location.pathname.split('/')[1] + '/product/' + filteredProducts[0].id : '/en/shop' }
            ]}
        />`
);

fs.writeFileSync(file, content);
console.log('Updated Shop steps with modal');
