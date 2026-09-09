const fs = require('fs');

// 1. Fix totalStock logic in Shop
let shopPage = fs.readFileSync('app/[locale]/shop/page.js', 'utf8');
const oldTotalStock = `const totalStock = product.models ? product.models.reduce((acc, m) => {
        if (m.stock === undefined || m.stock === null || m.stock === '') return acc + Infinity;
        const s = parseInt(m.stock);
        return acc + (isNaN(s) ? 0 : s);
    }, 0) : Infinity;`;
const newTotalStock = `const totalStock = product.models ? product.models.reduce((acc, m) => {
        const stockStr = m.stock === undefined || m.stock === null || m.stock === '' ? '0' : m.stock;
        const s = parseInt(stockStr);
        return acc + (isNaN(s) ? 0 : s);
    }, 0) : 0;`;
shopPage = shopPage.replace(oldTotalStock, newTotalStock);
fs.writeFileSync('app/[locale]/shop/page.js', shopPage);

// 2. Fix CSS
let css = fs.readFileSync('app/[locale]/globals.css', 'utf8');
css = css.replace('width: calc(100% - 30px);', 'width: max-content;\n    padding: 10px 24px;\n    white-space: nowrap;');
// Less vibrant gradient
css = css.replace('background: linear-gradient(135deg, var(--color-accent) 0%, #f9e2aa 50%, var(--color-accent) 100%);', 'background: linear-gradient(135deg, #a68b53 0%, #d8b871 50%, #a68b53 100%);');
fs.writeFileSync('app/[locale]/globals.css', css);

console.log('Fixed stock logic and updated CSS.');
