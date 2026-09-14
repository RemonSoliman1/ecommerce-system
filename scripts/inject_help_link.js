const fs = require('fs');
let file = 'components/layout/Footer.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '<li><Link href="/about">{t(\'lounge_curator\')}</Link></li>',
    '<li><Link href="/about">{t(\'lounge_curator\')}</Link></li>\n                            <li><Link href="/help">Help &amp; FAQ</Link></li>'
);

fs.writeFileSync(file, content);
console.log('Injected Help Link');
