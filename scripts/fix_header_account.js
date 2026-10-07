const fs = require('fs');
let file = 'components/layout/Header.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /onClick=\{\(e\) => \{ if \(isTourActive\) e\.preventDefault\(\); \}\}/g,
    ''
);

fs.writeFileSync(file, content);
console.log('Fixed Header account btn click');
