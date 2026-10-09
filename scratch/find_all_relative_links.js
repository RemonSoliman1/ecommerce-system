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
            // We want to find Link href= that does NOT start with / or http or #
            // But let's just dump ALL hrefs in Link tags to find the culprit
            const matches = content.match(/<Link\s+[^>]*href=\{?['"`](.*?)['"`]\}?[^>]*>/g);
            if (matches) {
                matches.forEach(m => {
                    const hrefMatch = m.match(/href=\{?['"`](.*?)['"`]\}?/);
                    if (hrefMatch) {
                        const href = hrefMatch[1];
                        if (!href.startsWith('/') && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto')) {
                            results.push(`${file}: ${href}`);
                        }
                    }
                });
            }
        }
    });
    return results;
}
console.log(walk('.').join('\n'));
