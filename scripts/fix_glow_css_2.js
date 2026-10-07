const fs = require('fs');
let file = 'app/[locale]/globals.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /position: relative;\s*z-index: 10000;/,
    ``
);

fs.writeFileSync(file, content);
console.log('Removed position relative from tour-glow');
