const fs = require('fs');

let fileEn = 'messages/en.json';
let jsonEn = JSON.parse(fs.readFileSync(fileEn, 'utf8'));
jsonEn.Tour.home_shop_desc = "Hover over this button to reveal the interactive mega menu! Once you're done looking, CLICK the button directly to enter the shop and continue the tour!";
fs.writeFileSync(fileEn, JSON.stringify(jsonEn, null, 4));

let fileAr = 'messages/ar.json';
let jsonAr = JSON.parse(fs.readFileSync(fileAr, 'utf8'));
jsonAr.Tour.home_shop_desc = "مرر الماوس فوق هذا الزر للكشف عن القائمة التفاعلية! بمجرد الانتهاء، انقر فوق الزر مباشرة للدخول إلى المتجر ومتابعة الجولة!";
fs.writeFileSync(fileAr, JSON.stringify(jsonAr, null, 4));

console.log('Fixed JSON encoding');
