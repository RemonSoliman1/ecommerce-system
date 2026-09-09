const fs = require('fs');
const file = 'app/api/orders/create/route.js';
let content = fs.readFileSync(file, 'utf8');

const helper = `// Helper to fuzzy match variants
function findVariantIndex(models, cItem) {
    let matchIdx = models.findIndex(m => {
        const mName = (m.name || '').trim().toLowerCase();
        const mSize = (m.size || '').trim().toLowerCase();
        const cartSize = (cItem.selectedSize || cItem.size || '').trim().toLowerCase();
        const cartVariant = (cItem.variant || cItem.modelName || '').trim().toLowerCase();
        const cartName = (cItem.name || '').trim().toLowerCase();

        if (cartVariant && cartVariant === mName && cartSize === mSize) return true;
        if (cartVariant && cartVariant === mName && !mSize) return true;
        
        const cStr = (cartVariant + ' ' + cartSize + ' ' + cartName).trim();
        if (cStr === mName || cStr === mSize) return true;
        if (mName && cStr.includes(mName)) return true;
        
        const cTokens = cStr.split(/[\\s()]+/).filter(t => t.length > 2);
        const mTokens = (mName + ' ' + mSize).split(/[\\s()]+/).filter(t => t.length > 2);
        return cTokens.some(t => mTokens.includes(t)) && mTokens.some(t => cTokens.includes(t));
    });

    if (matchIdx === -1 && models.length === 1) matchIdx = 0;
    return matchIdx;
}
`;

content = content.replace('const rateLimitMap = new Map();', 'const rateLimitMap = new Map();\n\n' + helper);

// Replace First instance
const block1Regex = /let matchIdx = dbProd\.models\.findIndex\(m => \{[\s\S]*?if \(matchIdx === -1 && dbProd\.models\.length === 1\) matchIdx = 0;/m;
content = content.replace(block1Regex, 'let matchIdx = findVariantIndex(dbProd.models, cItem);');

// Replace Second instance
const block2Regex = /let matchIdx = newModels\.findIndex\(m => \{[\s\S]*?if \(matchIdx === -1 && newModels\.length === 1\) matchIdx = 0;/m;
content = content.replace(block2Regex, 'let matchIdx = findVariantIndex(newModels, cItem);');

fs.writeFileSync(file, content);
console.log('Done replacing variant logic');
