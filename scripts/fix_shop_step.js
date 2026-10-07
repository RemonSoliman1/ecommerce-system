const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{ element: '\.tour-quickadd-link', titleKey: 'quickadd_modal_title', descKey: 'quickadd_modal_desc', side: 'bottom', mustClick: true, nextRoute:/,
    `{ element: '.tour-quickadd-link', dynamic: true, titleKey: 'quickadd_modal_title', descKey: 'quickadd_modal_desc', side: 'bottom', mustClick: true, nextRoute:`
);

fs.writeFileSync(file, content);
console.log('Added dynamic to Shop step 8');
