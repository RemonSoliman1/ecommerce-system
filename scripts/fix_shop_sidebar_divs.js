const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove ALL `<div id="tour-shop-filters">`
content = content.replace(/<div id="tour-shop-filters">\s*/g, '');

// 2. Add it back correctly
content = content.replace(
    "<ShopSidebar",
    "<div id=\"tour-shop-filters\">\n                        <ShopSidebar"
);

content = content.replace(
    "onUpdateParams={updateParams}\n                    />",
    "onUpdateParams={updateParams}\n                    />\n                    </div>"
);

fs.writeFileSync(file, content);
console.log("Fixed ShopSidebar divs");
