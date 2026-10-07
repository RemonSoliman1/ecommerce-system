const fs = require('fs');
const dataPath = 'lib/data.js';
let content = fs.readFileSync(dataPath, 'utf8');

// Revert the external URLs back to local
content = content.replace(/logo:\s*'https:\/\/[^']+\/([^/.]+)\.(png|jpg|svg)'/g, (match, slug, ext) => {
    // If it's something like '20-acre-farm', use it. 
    return `logo: '/images/brands/${slug}.png'`;
});

// Any remaining https
content = content.replace(/logo:\s*'https:[^']+'/g, `logo: '/images/brands/fallback.png'`);

fs.writeFileSync(dataPath, content);
console.log('Reverted external URLs to local paths.');
