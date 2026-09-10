const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');
css = css.replace('.cardContent {', '.cardContent {\n    position: relative;');
fs.writeFileSync(file, css);
