const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"quick_add_desc": ".*?"/g,
    `"quick_add_desc": "Here is the Quick Add button! Click it now to open the fast checkout window.",
        "quickadd_modal_title": "Quick Add Window",
        "quickadd_modal_desc": "From here you can instantly add items to your cart. For now, click directly on the product image to continue the tour to the full product page!"`
);

fs.writeFileSync(file, content);
console.log('Updated English translations');
