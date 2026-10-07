const fs = require('fs');
let file = 'app/[locale]/globals.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.driver-active-element \{/g, '.tour-glow {');

fs.writeFileSync(file, content);
console.log('Renamed class to .tour-glow');
