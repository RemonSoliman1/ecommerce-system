const fs = require('fs');
let file = 'components/ui/RelatedProducts.js';
let content = fs.readFileSync(file, 'utf8');

// Replace mock fallback with real items
content = content.replace(
    /const displayProducts = \(related\.length === 0 && showTourMocks\) \? \[\s*\{ id: 'mock1', name: 'Mock Related Cigar', image: '\/images\/placeholder\.png', price: 0, models: \[\{ price: 0, stock: 1 \}\] \},\s*\{ id: 'mock2', name: 'Another Similar Cigar', image: '\/images\/placeholder\.png', price: 0, models: \[\{ price: 0, stock: 1 \}\] \},\s*\{ id: 'mock3', name: 'Premium Recommendation', image: '\/images\/placeholder\.png', price: 0, models: \[\{ price: 0, stock: 1 \}\] \}\s*\] : related;/,
    `const displayProducts = (related.length === 0 && showTourMocks) ? [
        { id: 'cohiba-behike', name: 'Cohiba Behike', image: '/images/cigars/cohiba-behike.png', price: 850, models: [{ price: 850, stock: 10 }] },
        { id: 'opusx', name: 'Arturo Fuente OpusX', image: '/images/cigars/opusx.png', price: 450, models: [{ price: 450, stock: 5 }] },
        { id: 'davidoff-winston', name: 'Davidoff Winston Churchill', image: '/images/cigars/davido-winston.png', price: 320, models: [{ price: 320, stock: 20 }] }
    ] : related;`
);

fs.writeFileSync(file, content);
console.log('Fixed RelatedProducts mock fallback');
