const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');

// Replace the absolute position block with static expanding block
css = css.replace(
    /\.cardHoverInfo\s*\{[\s\S]*?z-index:\s*5;\s*\}/,
    `.cardHoverInfo {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.3s ease;
    margin-bottom: 0px;
}`
);

// Replace the hover trigger
css = css.replace(
    /\.card:hover:not\(:has\(\.quickAddBtnArea:hover\)\) \.cardHoverInfo\s*\{[\s\S]*?transform:\s*translateY\(0\);\s*\}/,
    `.card:hover:not(:has(.quickAddBtnArea:hover)) .cardHoverInfo {
    max-height: 50px;
    opacity: 1;
    margin-bottom: 10px;
}`
);

fs.writeFileSync(file, css);
console.log('Reverted to inline expansion');
