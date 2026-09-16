const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"view_details_desc": ".*?"/g,
    `"view_details_desc": "انقر مباشرة على صورة المنتج لمتابعة الجولة إلى صفحة المنتج!",
        "hover_item_title": "بطاقات المنتجات التفاعلية",
        "hover_item_desc": "مرر الماوس فوق بطاقة المنتج هذه للكشف عن المزيد من الخيارات!"`
);

content = content.replace(
    /"quick_add_desc": ".*?"/g,
    `"quick_add_desc": "إليك زر الإضافة السريعة! يمكنك استخدامه لإضافة العناصر فوراً إلى عربة التسوق. الآن، انقر مباشرة على صورة المنتج لمتابعة الجولة!"`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic translations');
