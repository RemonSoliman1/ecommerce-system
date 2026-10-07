const fs = require('fs');
let file = 'components/layout/BottomNav.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /className=\{\`\$\{styles\.navItem\}\s*\$\{isActive \? styles\.active : ''\}\`\}/,
    `id={"tour-mobile-" + item.label.toLowerCase()}
                        className={\`\${styles.navItem} \${isActive ? styles.active : ''}\`}`
);

fs.writeFileSync(file, content);
console.log('Added IDs to BottomNav items');
