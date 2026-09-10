const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');

// We need to replace the existing .cardHoverInfo logic
css = css.replace(
    /\.cardHoverInfo\s*\{[\s\S]*?margin-bottom:\s*0px;\s*\}/,
    `.cardHoverInfo {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(transparent, rgba(18,12,10,0.95) 40%, #120c0a);
    padding: 10px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    pointer-events: none;
    z-index: 5;
}`
);

css = css.replace(
    /\.card:hover \.cardHoverInfo\s*\{[\s\S]*?margin-bottom:\s*10px;\s*\}/,
    `.card:hover .cardHoverInfo {
    opacity: 1;
    transform: translateY(0);
}`
);

fs.writeFileSync(file, css);
