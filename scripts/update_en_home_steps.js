const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_brands_desc": "(.*?)",/g,
    `"home_brands_desc": "$1",\n        "home_beloved_title": "Beloved Products",\n        "home_beloved_desc": "These are our top-rated and best-selling cigars that our customers simply can't get enough of.",\n        "home_offers_title": "Special Offers",\n        "home_offers_desc": "Don't miss out on these exclusive discounted items and special promotions!",`
);

fs.writeFileSync(file, content);
console.log('Updated English home steps');
