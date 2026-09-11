const fs = require('fs');

function updateLang(file) {
    let content = fs.readFileSync(file, 'utf8');
    let json = JSON.parse(content);

    json.Tour = {
        ...json.Tour,
        
        "home_hero_title": "Welcome to Cigar Lounge",
        "home_hero_desc": "Discover our premium selection of handcrafted cigars, accessories, and exclusive collections.",
        "home_featured_title": "Featured & New Arrivals",
        "home_featured_desc": "Stay updated with our latest additions and curated recommendations hand-picked by our experts.",
        "home_brands_title": "Explore Top Brands",
        "home_brands_desc": "Shop directly from world-renowned makers and boutique rollers.",
        
        "account_sidebar_title": "Your Dashboard",
        "account_sidebar_desc": "Manage your orders, view your loyalty tier, and update your personal preferences all in one place.",
        "account_content_title": "Account Details",
        "account_content_desc": "Check your order history, save your favorite cigars to your wishlist, or adjust your settings here."
    };

    fs.writeFileSync(file, JSON.stringify(json, null, 4));
}

updateLang('messages/en.json');
try {
    updateLang('messages/ar.json');
} catch (e) {
    console.log("No ar.json found, skipping.");
}

console.log('Added Full Tour translations');
