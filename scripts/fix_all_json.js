const fs = require('fs');

function updateJson(file, updater) {
    let json = JSON.parse(fs.readFileSync(file, 'utf8'));
    updater(json);
    fs.writeFileSync(file, JSON.stringify(json, null, 4));
}

updateJson('messages/en.json', (json) => {
    json.Tour.quick_add_desc = "Here is the Quick Add button! Click it now to open the fast checkout window.";
    json.Tour.quickadd_modal_title = "Quick Add Window";
    json.Tour.quickadd_modal_desc = "From here you can instantly add items to your cart. For now, click directly on the product image to continue the tour to the full product page!";
    
    json.Tour.home_beloved_title = "Beloved Products";
    json.Tour.home_beloved_desc = "These are our top-rated and best-selling cigars that our customers simply can't get enough of.";
    json.Tour.home_offers_title = "Special Offers";
    json.Tour.home_offers_desc = "Don't miss out on these exclusive discounted items and special promotions!";
    
    json.Tour.home_shop_desc = "Hover over this button to reveal the interactive mega menu! Once you're done looking, CLICK the button directly to enter the shop and continue the tour!";
    
    json.Tour.account_settings_desc = "Finally, let's look at your personal settings. CLICK the Account icon to proceed to your profile page!";
    
    json.Tour.prompt_desc = "Welcome! Would you like a quick interactive walkthrough of the Cigar Lounge? You can cancel the tour at any time by clicking the 'X' button.";
});

updateJson('messages/ar.json', (json) => {
    json.Tour.quick_add_desc = "إليك زر الإضافة السريعة! انقر عليه الآن لفتح نافذة الشراء السريع.";
    json.Tour.quickadd_modal_title = "نافذة الإضافة السريعة";
    json.Tour.quickadd_modal_desc = "من هنا يمكنك إضافة العناصر فوراً إلى عربة التسوق الخاصة بك. الآن، انقر مباشرة على صورة المنتج لمتابعة الجولة إلى صفحة المنتج الكاملة!";
    
    json.Tour.home_beloved_title = "منتجاتنا المحبوبة";
    json.Tour.home_beloved_desc = "هذه هي السيجار الأعلى تقييمًا والأكثر مبيعًا والتي لا يكتفي عملاؤنا منها.";
    json.Tour.home_offers_title = "عروض خاصة";
    json.Tour.home_offers_desc = "لا تفوت هذه العناصر المخفضة الحصرية والعروض الترويجية الخاصة!";
    
    json.Tour.home_shop_desc = "مرر الماوس فوق هذا الزر للكشف عن القائمة التفاعلية! بمجرد الانتهاء، انقر فوق الزر مباشرة للدخول إلى المتجر ومتابعة الجولة!";
    
    json.Tour.account_settings_desc = "أخيراً، دعنا نلقي نظرة على إعداداتك الشخصية. انقر على أيقونة الحساب للمتابعة إلى صفحة ملفك الشخصي!";
    
    json.Tour.prompt_desc = "مرحباً بك! هل ترغب في جولة تفاعلية سريعة في متجرنا؟ يمكنك إلغاء الجولة في أي وقت بالضغط على زر 'X'.";
});

console.log('Successfully updated JSON files');
