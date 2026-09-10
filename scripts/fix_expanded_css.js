const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
    /\.expandedCard\s*\{\s*box-shadow: 0 8px 30px rgba\(197, 163, 92, 0\.15\);\s*transform: translateY\(-5px\);\s*\}/,
    '.expandedCard {\n    box-shadow: 0 8px 30px rgba(197, 163, 92, 0.15);\n    transform: translateY(-5px);\n    border-color: var(--color-accent);\n}'
);

css = css.replace(
    'transition: transform 0.3s ease;',
    'transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;'
);

fs.writeFileSync(file, css);
