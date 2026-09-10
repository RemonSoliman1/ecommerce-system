const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
    '.card:hover:not(:has(.quickAddBtn:hover)) .cardHoverInfo {',
    '.card:hover:not(:has(.quickAddBtnArea:hover)) .cardHoverInfo {'
);

fs.writeFileSync(file, css);
