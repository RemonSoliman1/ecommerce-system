const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{\s*element:\s*'\.quickAddBtnArea'[\s\S]*?\}\s*\]/g,
    `{ element: '.quickAddBtnArea', titleKey: 'quick_add_title', descKey: 'quick_add_desc', side: 'top' },
              { element: '.productImg', titleKey: 'click_item_title', descKey: 'click_item_desc', side: 'bottom', mustClick: true, nextRoute: typeof window !== 'undefined' && filteredProducts[0] ? '/' + window.location.pathname.split('/')[1] + '/product/' + filteredProducts[0].id : '/en/shop' }
            ]`
);

fs.writeFileSync(file, content);
console.log('Updated Shop steps');
