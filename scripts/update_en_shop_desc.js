const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_shop_desc": ".*?"/g,
    `"home_shop_desc": "Hover over this button to reveal the interactive mega menu! Once you're done looking, CLICK the button directly to enter the shop and continue the tour!"`
);

fs.writeFileSync(file, content);
console.log('Updated English home shop text');
