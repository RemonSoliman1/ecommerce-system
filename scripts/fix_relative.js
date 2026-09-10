const fs = require('fs');
let file = 'app/[locale]/shop/shop.module.css';
let css = fs.readFileSync(file, 'utf8');

if (!css.includes('position: relative') && css.includes('.cardContent {')) {
    css = css.replace('.cardContent {', '.cardContent {\n    position: relative;');
    fs.writeFileSync(file, css);
    console.log('Added position: relative to .cardContent');
}
