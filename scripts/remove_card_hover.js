const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
    /  \.card:hover \{\s*box-shadow: 0 8px 30px rgba\(197, 163, 92, 0\.15\);\s*border-color: var\(--color-accent\);\s*\}/,
    ''
);

// Wait, the .expandedCard CSS only has box-shadow and transform. We should add the border-color to it too.
css = css.replace(
    '.expandedCard {\n        box-shadow: 0 8px 30px rgba(197, 163, 92, 0.15);\n        transform: translateY(-5px);\n    }',
    '.expandedCard {\n        box-shadow: 0 8px 30px rgba(197, 163, 92, 0.15);\n        transform: translateY(-5px);\n        border-color: var(--color-accent);\n    }'
);


fs.writeFileSync(file, css);
console.log('Removed .card:hover');
