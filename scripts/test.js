const fs = require('fs');
let content = fs.readFileSync('app/[locale]/shop/page.js', 'utf8');
content = content.replace(
    "        </div>\n    );\n}\n\nfunction ShopProductCard",
    "        </div>\n        </>\n    );\n}\n\nfunction ShopProductCard"
);
fs.writeFileSync('app/[locale]/shop/page.js', content);
