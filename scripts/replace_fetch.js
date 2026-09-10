const fs = require('fs');
let file = 'app/[locale]/page.js';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/fetch\('\/api\/admin\/attributes\?category=home_promotion'\)/g, "fetch('/api/attributes?category=home_promotion')");
fs.writeFileSync(file, c);
console.log('Replaced fetch');
