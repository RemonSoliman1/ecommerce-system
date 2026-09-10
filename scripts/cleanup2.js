const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Use regex to remove duplicate line
let lines = content.split('\n');
let filtered = [];
let found = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const [isHoverExpanded, setIsHoverExpanded] = useState(false);') && lines[i-1].includes('brandName = brands.find')) {
        continue;
    }
    filtered.push(lines[i]);
}

fs.writeFileSync(file, filtered.join('\n'));
console.log('Cleaned up duplicate');
