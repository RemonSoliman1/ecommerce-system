const fs = require('fs');

const updateFile = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    let json = JSON.parse(content);

    const newTranslations = {
        "prompt_title": "Interactive Tour",
        "prompt_desc": "Would you like a quick walkthrough of the features on this page?",
        "prompt_yes": "Start Tour",
        "prompt_no": "Skip",
        "home_search_title": "Global Search",
        "home_search_desc": "Instantly search our entire humidor catalog from here.",
        "home_shop_title": "Shop Catalog",
        "home_shop_desc": "Click here to enter the main shop and browse all products.",
        "home_brands_title": "Top Brands",
        "home_brands_desc": "Explore our curated selection. You can click on any of these brand logos to instantly filter the shop catalog!",
        "shop_sort_title": "Sort Options",
        "shop_sort_desc": "Sort the catalog alphabetically or by price.",
        "shop_stock_title": "In-Stock Only",
        "shop_stock_desc": "Toggle this to hide items that are currently out of stock.",
        "shop_brands_title": "Brand Filter",
        "shop_brands_desc": "Click on any brand logo here to instantly filter the products below.",
        "shop_scroll_title": "Scroll to Top",
        "shop_scroll_desc": "Use this arrow to instantly jump back to the top of the page.",
        "size_selector_title": "Select Vitola / Size",
        "size_selector_desc": "Many cigars come in different sizes and box formats. Choose your preference here.",
        "gift_selector_title": "Exclusive Gifts",
        "gift_selector_desc": "If available, you can add premium gift options or personalized messages to your order.",
        "promo_banner_title": "Active Promotions",
        "promo_banner_desc": "If there are any active deals (like Buy 5 Get 1 Free) for this item, they will automatically appear here.",
        "tasting_notes_title": "Flavor Profile & Notes",
        "tasting_notes_desc": "Discover the exact flavor notes, strength, and wrapper details for the perfect smoke.",
        "similar_items_title": "Similar Items",
        "similar_items_desc": "If you like this cigar, you'll love these recommendations from our experts.",
        "account_sidebar_title": "Account Navigation",
        "account_sidebar_desc": "Use this sidebar to navigate between your account details.",
        "account_overview_title": "Loyalty & Overview",
        "account_overview_desc": "View your Loyalty Points balance, current tier, and exclusive birthday rewards.",
        "account_orders_title": "Order History",
        "account_orders_desc": "Track your shipments and view past purchases.",
        "account_settings_title": "Profile Settings",
        "account_settings_desc": "Update your personal details or change your username/password here."
    };

    json.Tour = { ...json.Tour, ...newTranslations };
    fs.writeFileSync(file, JSON.stringify(json, null, 4));
    console.log('Updated', file);
};

updateFile('messages/en.json');
updateFile('messages/ar.json');
