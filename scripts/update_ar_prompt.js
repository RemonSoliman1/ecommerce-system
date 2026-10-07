const fs = require('fs');
let file = 'messages/ar.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"prompt_desc": ".*?"/g,
    `"prompt_desc": "مرحباً بك! هل ترغب في جولة تفاعلية سريعة في متجرنا؟ يمكنك إلغاء الجولة في أي وقت بالضغط على زر 'X'."`
);

fs.writeFileSync(file, content);
console.log('Updated Arabic prompt text');
