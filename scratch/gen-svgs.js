const fs = require('fs');
const path = require('path');

const outDir = 'public/images/brands';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const svgs = {
    '20-acre-farm': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#2c3e50"><path d="M10 80 L50 20 L90 80 Z" /><rect x="40" y="50" width="20" height="30" fill="#ecf0f1" /></svg>`,
    'acid': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#e74c3c"><circle cx="50" cy="50" r="40" /><path d="M30 50 Q50 20 70 50 T70 80 Q50 50 30 80 Z" fill="#f1c40f" /></svg>`,
    'alec-bradley': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#8e44ad"><rect x="20" y="20" width="60" height="60" rx="10" /><circle cx="50" cy="50" r="20" fill="#fff" /></svg>`,
    'arturo-fuente': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#d35400"><path d="M50 10 L80 40 L50 90 L20 40 Z" /><path d="M50 30 L65 45 L50 70 L35 45 Z" fill="#f39c12" /></svg>`,
    'ashton': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#34495e"><ellipse cx="50" cy="50" rx="45" ry="30" /><ellipse cx="50" cy="50" rx="35" ry="20" fill="#fff" /></svg>`,
    'audew': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#16a085"><rect x="30" y="10" width="40" height="80" rx="5" /><line x1="40" y1="30" x2="60" y2="30" stroke="#fff" stroke-width="5" /><line x1="40" y1="50" x2="60" y2="50" stroke="#fff" stroke-width="5" /><line x1="40" y1="70" x2="60" y2="70" stroke="#fff" stroke-width="5" /></svg>`,
    'avo': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#2980b9"><path d="M20 80 C20 20 80 20 80 80 Z" /><circle cx="50" cy="55" r="15" fill="#ecf0f1" /></svg>`,
    'blackened': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#2c3e50"><path d="M10 10 L90 90 M90 10 L10 90" stroke="#000" stroke-width="15" /><circle cx="50" cy="50" r="25" fill="#e74c3c" /></svg>`,
    'camacho': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#e74c3c" /><path d="M40 30 Q60 10 80 30 Q90 50 70 80 Q40 90 20 60 Q10 40 40 30 Z" fill="#000" /></svg>`,
    'cao': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#c0392b"><rect x="20" y="20" width="60" height="60" /><rect x="35" y="35" width="30" height="30" fill="#ecf0f1" /></svg>`,
    'chateau-diadem': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#7f8c8d"><path d="M10 50 L50 10 L90 50 L50 90 Z" /><circle cx="50" cy="50" r="20" fill="#bdc3c7" /></svg>`,
    'cohiba': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f1c40f"/><path d="M20,0 h10 v100 h-10 Z M40,0 h10 v100 h-10 Z M60,0 h10 v100 h-10 Z M80,0 h10 v100 h-10 Z" fill="#000" /><path d="M0,20 v10 h100 v-10 Z M0,40 v10 h100 v-10 Z M0,60 v10 h100 v-10 Z M0,80 v10 h100 v-10 Z" fill="#000" /><circle cx="50" cy="50" r="30" fill="#e67e22" /></svg>`,
    'davidoff': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#bdc3c7"><ellipse cx="50" cy="50" rx="40" ry="20" /><ellipse cx="50" cy="50" rx="35" ry="15" fill="#f39c12" /></svg>`,
    'deadwood': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#2c3e50"><path d="M30 40 C30 20 70 20 70 40 C70 60 60 70 50 90 C40 70 30 60 30 40 Z" /><circle cx="40" cy="45" r="5" fill="#ecf0f1" /><circle cx="60" cy="45" r="5" fill="#ecf0f1" /></svg>`,
    'drew-estate': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#2980b9"><path d="M10 80 Q30 50 50 80 Q70 50 90 80" stroke="#2c3e50" stroke-width="5" fill="none" /><path d="M20 90 L20 40 M40 90 L40 30 M60 90 L60 30 M80 90 L80 40" stroke="#2c3e50" stroke-width="5" /></svg>`,
    'ep-carrillo': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#c0392b"><rect x="15" y="15" width="70" height="70" rx="35" /><path d="M30 50 h40 M50 30 v40" stroke="#f1c40f" stroke-width="8" /></svg>`,
    'oliva': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#8e44ad"><ellipse cx="50" cy="50" rx="45" ry="30" /><path d="M30 50 Q50 30 70 50 Q50 70 30 50 Z" fill="#f1c40f" /></svg>`
};

for (const [slug, svg] of Object.entries(svgs)) {
    fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg);
    console.log(`Created ${slug}.svg`);
}

// Update data.js to point to these new generic SVG files
const dataPath = 'lib/data.js';
let content = fs.readFileSync(dataPath, 'utf8');

content = content.replace(/logo:\s*'\/images\/brands\/([^/.]+)\.(png|jpg|svg)'/g, (match, slug) => {
    return `logo: '/images/brands/${slug}.svg'`;
});
content = content.replace(/logo:\s*'\/images\/brands\/fallback\.png'/g, `logo: ''`);
content = content.replace(/logo:\s*''/g, `logo: '/images/brands/20-acre-farm.svg'`); // Safety fallback

fs.writeFileSync(dataPath, content);
console.log('Updated lib/data.js to point to generated .svg files.');
