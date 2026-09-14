const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /className=\{\`\$\{styles.card\} \$\{isHoverExpanded \? styles.expandedCard : ""\}\`\}/g,
    'className={`${styles.card} ${isHoverExpanded ? styles.expandedCard : ""} tour-shop-card`}'
);

content = content.replace(
    /element: '\.tour-view-details-btn'/g,
    "element: '.tour-shop-card'"
);

fs.writeFileSync(file, content);
console.log('Updated Shop Card Tour class');
