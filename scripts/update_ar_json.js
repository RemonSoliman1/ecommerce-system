const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_shop_desc": "Click here to enter the main shop and browse all products."/g,
    '"home_shop_desc": "انقر على \\"Shop\\" للدخول إلى المتجر ومتابعة الجولة!"'
);

content = content.replace(
    /"view_details_desc": ".*?"/g,
    '"view_details_desc": "التمرير فوق المنتج يكشف عن زر الإضافة السريعة. انقر مباشرة على صورة المنتج لمتابعة الجولة إلى صفحة المنتج!"'
);

fs.writeFileSync(file, content);
console.log('Updated Arabic text');
