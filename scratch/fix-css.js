const fs = require('fs');
let css = fs.readFileSync('app/[locale]/shop/shop.module.css', 'utf8');

// Replace brandLogo block
css = css.replace(
/\.brandLogo \{[^}]+\}/,
`.brandLogo {
    width: 90px;
    height: 90px;
    background: #f5f0e8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.5s ease;
    border-radius: 50%;
    border: 2px solid rgba(197, 163, 92, 0.35);
    padding: 8px;
    box-sizing: border-box;
    flex-shrink: 0;
}`
);

// Replace hover block
css = css.replace(
/\.brandItem:hover \.brandLogo \{[^}]+\}/,
`.brandItem:hover .brandLogo {
    transform: scale(1.1);
    border-color: rgba(197, 163, 92, 0.8);
    box-shadow: 0 0 14px rgba(197, 163, 92, 0.5);
}`
);

// Replace brandLogo img block
css = css.replace(
/\.brandLogo img \{[^}]+\}/,
`.brandLogo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 0;
    display: block;
}`
);

fs.writeFileSync('app/[locale]/shop/shop.module.css', css);
console.log('CSS updated');
