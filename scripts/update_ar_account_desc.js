const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"account_settings_desc": ".*?"/g,
    `"account_settings_desc": "أخيراً، دعنا نلقي نظرة على إعداداتك الشخصية. انقر على أيقونة الحساب للمتابعة إلى صفحة ملفك الشخصي!"`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic account settings text');
