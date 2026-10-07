const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"quick_add_desc": ".*?"/g,
    `"quick_add_desc": "إليك زر الإضافة السريعة! انقر عليه الآن لفتح نافذة الشراء السريع.",
        "quickadd_modal_title": "نافذة الإضافة السريعة",
        "quickadd_modal_desc": "من هنا يمكنك إضافة العناصر فوراً إلى عربة التسوق الخاصة بك. الآن، انقر مباشرة على صورة المنتج لمتابعة الجولة إلى صفحة المنتج الكاملة!"`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic translations');
