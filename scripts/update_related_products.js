const fs = require('fs');
let file = 'components/ui/RelatedProducts.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /export default function RelatedProducts\(\{ currentProductId, category, brandId \}\) \{/g,
    'export default function RelatedProducts({ currentProductId, category, brandId, showTourMocks }) {'
);

content = content.replace(
    /if \(loading \|\| related\.length === 0\) return null;/g,
    `if ((loading || related.length === 0) && !showTourMocks) return null;
    
    // Mock data for tour if needed
    const displayProducts = (related.length === 0 && showTourMocks) ? [
        { id: 'mock1', name: 'Mock Related Cigar', image: '/assets/images/placeholder.jpg', price: 0, models: [{ price: 0, stock: 1 }] },
        { id: 'mock2', name: 'Another Similar Cigar', image: '/assets/images/placeholder.jpg', price: 0, models: [{ price: 0, stock: 1 }] },
        { id: 'mock3', name: 'Premium Recommendation', image: '/assets/images/placeholder.jpg', price: 0, models: [{ price: 0, stock: 1 }] }
    ] : related;`
);

content = content.replace(
    /\{related\.map\(product => \(/g,
    '{displayProducts.map(product => ('
);

fs.writeFileSync(file, content);
console.log('Updated RelatedProducts with showTourMocks');
