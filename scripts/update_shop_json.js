const fs = require('fs');

function updateJson(file, updater) {
    let json = JSON.parse(fs.readFileSync(file, 'utf8'));
    updater(json);
    fs.writeFileSync(file, JSON.stringify(json, null, 4));
}

updateJson('messages/en.json', (json) => {
    json.Tour.quick_add_desc = "Here is the Quick Add button! You can use it to instantly add items to your cart without leaving the page.";
    json.Tour.click_item_title = "Product Details";
    json.Tour.click_item_desc = "To see the full flavor profile, available sizes, and gifts, CLICK the product image to continue the tour!";
});

updateJson('messages/ar.json', (json) => {
    json.Tour.quick_add_desc = "هذا هو زر الإضافة السريعة! يمكنك استخدامه لإضافة العناصر فوراً إلى عربة التسوق دون مغادرة الصفحة.";
    json.Tour.click_item_title = "تفاصيل المنتج";
    json.Tour.click_item_desc = "لرؤية النكهات المتوفرة والأحجام والهدايا، انقر فوق صورة المنتج لمتابعة الجولة!";
});

console.log('Updated JSON for new shop steps');
