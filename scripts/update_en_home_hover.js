const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_shop_title": "Shop Catalog",/g,
    `"home_shop_hover_title": "Interactive Menus",\n        "home_shop_hover_desc": "Hover over the Shop button to reveal the mega menu!",\n        "home_shop_title": "Shop Catalog",`
);

fs.writeFileSync(file, content);
console.log('Updated English hover text');
