const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_shop_desc": ".*?"/g,
    `"home_shop_desc": "مرر الماوس فوق هذا الزر للكشف عن القائمة التفاعلية! بمجرد الانتهاء، انقر فوق الزر مباشرة للدخول إلى المتجر ومتابعة الجولة!"`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic home shop text');
