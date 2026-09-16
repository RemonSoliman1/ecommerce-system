const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"view_details_desc": ".*?"/g,
    `"view_details_desc": "Click directly on the product image to continue the tour to the product page!",
        "hover_item_title": "Interactive Product Cards",
        "hover_item_desc": "Hover over this product card to reveal more options!"`
);

content = content.replace(
    /"quick_add_desc": ".*?"/g,
    `"quick_add_desc": "Here is the Quick Add button! You can use it to instantly add items to your cart. For now, click directly on the product image to continue the tour to the product page!"`
);

fs.writeFileSync(file, content);
console.log('Updated English translations');
