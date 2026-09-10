const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');
let json = JSON.parse(content);

json.Tour = {
    ...json.Tour,
    "shop_filters_title": "Filter by Profile",
    "shop_filters_desc": "Use these filters to instantly sort by singles, boxes, strength, or specific brands.",
    "quick_add_title": "Quick Add",
    "quick_add_desc": "Hover over any item and click 'Add to Cart' to toss it into your humidor without leaving the page.",
    "wishlist_title": "Save for Later",
    "wishlist_desc": "Click the heart icon to add cigars to your wishlist. Perfect for building your dream collection.",
    "tags_title": "Product Availability",
    "tags_desc": "Items are clearly marked if they are 'Sold Out' or 'Low Stock'. Keep an eye out for 'New Arrival' tags!",
    "product_profile_title": "Flavor Profile",
    "product_profile_desc": "Here you can see the wrapper, binder, filler, and strength. Essential details for the perfect smoke.",
    "product_tasting_title": "Tasting Notes",
    "product_tasting_desc": "Our sommelier's notes on the specific flavors you'll experience during the smoke.",
    "product_sizes_title": "Select Your Vitola",
    "product_sizes_desc": "Many of our cigars come in different sizes and formats (Singles, 5-Packs, Full Boxes). Choose your preference here.",
    "product_gift_title": "Gift Options",
    "product_gift_desc": "Buying for an aficionado? Add a premium gift box or personalized message to your order.",
    "product_promo_title": "Promotions",
    "product_promo_desc": "If there's an active promo (like Buy 5 Get 1 Free), it will automatically display and apply right here."
};

fs.writeFileSync(file, JSON.stringify(json, null, 4));
console.log('Added Tour translations');
