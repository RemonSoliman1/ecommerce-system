const fs = require('fs');
let file = 'components/account/UserGuide.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "{t('start_tour') || 'Restart Interactive Tours'}",
    "'Restart Interactive Tours'"
);

fs.writeFileSync(file, content);
console.log('Fixed UserGuide button text');
