const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"account_settings_desc": ".*?"/g,
    `"account_settings_desc": "Finally, let's look at your personal settings. CLICK the Account icon to proceed to your profile page!"`
);

fs.writeFileSync(file, content);
console.log('Updated English account settings text');
