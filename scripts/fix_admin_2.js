const fs = require('fs');

let tab = fs.readFileSync('app/[locale]/admin/components/AdminProductsTab.js', 'utf8');
tab = tab.replace('handleSaveGiftOption, handleGiftImageUpload\n\n}) {', 'handleSaveGiftOption, handleGiftImageUpload,\n    CreatableSelect\n}) {');
fs.writeFileSync('app/[locale]/admin/components/AdminProductsTab.js', tab);
console.log('Fixed CreatableSelect in props!');
