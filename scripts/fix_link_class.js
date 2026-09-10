const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /className=\{styles\.card\}\s*style=\{\{\s*position:\s*'relative',\s*flex:\s*1,\s*display:\s*'flex',\s*flexDirection:\s*'column'\s*\}\}/,
    'className={`${styles.card} ${isHoverExpanded ? styles.expandedCard : ""}`} style={{ position: \'relative\', flex: 1, display: \'flex\', flexDirection: \'column\' }}'
);

fs.writeFileSync(file, content);
console.log('Fixed Link class');
