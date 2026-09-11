const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "        </div>\n    );\n}\n\nfunction ShopProductCard",
    "        </div>\n        </>\n    );\n}\n\nfunction ShopProductCard"
);

fs.writeFileSync(file, content);
console.log('Fixed syntax error in Shop page');
