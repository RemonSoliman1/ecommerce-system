const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_shop_desc": "Click here to enter the main shop and browse all products."/g,
    '"home_shop_desc": "Click \\"Shop\\" to enter the main catalog and continue the tour!"'
);

content = content.replace(
    /"view_details_desc": "Hovering or tapping on a product reveals quick actions. Click here to see the full product details page!"/g,
    '"view_details_desc": "Hovering over a product reveals the quick add button. Click directly on the product image to continue the tour to the product page!"'
);

fs.writeFileSync(file, content);
console.log('Updated English text');
