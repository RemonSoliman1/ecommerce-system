const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "<ShopSidebar",
    "<div id=\"tour-shop-filters\">\n                        <ShopSidebar"
);

content = content.replace(
    "clearAllFilters={clearAllFilters}\n                    />",
    "clearAllFilters={clearAllFilters}\n                    />\n                    </div>"
);

fs.writeFileSync(file, content);
console.log('Wrapped ShopSidebar in tour id');
