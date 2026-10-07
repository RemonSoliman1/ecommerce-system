const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"home_brands_desc": "(.*?)",/g,
    `"home_brands_desc": "$1",\n        "home_beloved_title": "منتجاتنا المحبوبة",\n        "home_beloved_desc": "هذه هي السيجار الأعلى تقييمًا والأكثر مبيعًا والتي لا يكتفي عملاؤنا منها.",\n        "home_offers_title": "عروض خاصة",\n        "home_offers_desc": "لا تفوت هذه العناصر المخفضة الحصرية والعروض الترويجية الخاصة!",`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic home steps');
