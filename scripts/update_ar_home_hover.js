const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_shop_title": "كتالوج المتجر",/g,
    `"home_shop_hover_title": "قوائم تفاعلية",\n        "home_shop_hover_desc": "مرر الماوس فوق زر المتجر للكشف عن القائمة الضخمة!",\n        "home_shop_title": "كتالوج المتجر",`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic hover text');
