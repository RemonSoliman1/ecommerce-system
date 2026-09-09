const fs = require('fs');

let page = fs.readFileSync('app/[locale]/admin/page.js', 'utf8');
page = page.replace('<AdminProductsTab \n                    t={t} user={user}', '<AdminProductsTab CreatableSelect={CreatableSelect}\n                    t={t} user={user}');
fs.writeFileSync('app/[locale]/admin/page.js', page);

let tab = fs.readFileSync('app/[locale]/admin/components/AdminProductsTab.js', 'utf8');
if (!tab.includes('CreatableSelect')) {
    tab = tab.replace('handleSaveGiftOption, handleGiftImageUpload', 'handleSaveGiftOption, handleGiftImageUpload, CreatableSelect');
    fs.writeFileSync('app/[locale]/admin/components/AdminProductsTab.js', tab);
}
console.log('Fixed CreatableSelect');
