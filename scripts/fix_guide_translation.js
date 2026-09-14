const fs = require('fs');

function addMissingGuideKeys(file) {
    let content = fs.readFileSync(file, 'utf8');
    let json = JSON.parse(content);

    if (json.Guide) {
        json.Guide["web_shop_now"] = "Shop Now Button:";
        json.Guide["web_shop_now_desc"] = "Click the gold SHOP NOW button in the main menu to open a detailed catalog of our categories, brands, and collections.";
    }

    fs.writeFileSync(file, JSON.stringify(json, null, 4));
}

addMissingGuideKeys('messages/en.json');
try {
    addMissingGuideKeys('messages/ar.json');
} catch (e) {}

console.log('Fixed Guide translations');
