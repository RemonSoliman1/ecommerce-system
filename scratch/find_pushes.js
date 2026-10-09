const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.git') && !file.includes('scratch')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(file, 'utf8');
            const matches = content.match(/push\([^)]*\)/g);
            if (matches) {
                matches.forEach(m => {
                    results.push(`${file}: ${m}`);
                });
            }
        }
    });
    return results;
}
console.log(walk('.').join('\n'));
