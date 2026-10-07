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
});

updateJson('messages/ar.json', (json) => {
    json.Tour.quick_add_desc = "إليك زر الإضافة السريعة! انقر عليه الآن لفتح نافذة الشراء السريع.";
    json.Tour.quickadd_modal_title = "نافذة الإضافة السريعة";
    json.Tour.quickadd_modal_desc = "من هنا يمكنك إضافة العناصر فوراً إلى عربة التسوق الخاصة بك. الآن، انقر مباشرة على صورة المنتج لمتابعة الجولة إلى صفحة المنتج الكاملة!";
});

console.log('Restored json for quick add');
