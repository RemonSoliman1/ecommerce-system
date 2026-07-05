const fs = require('fs');
const path = 'app/[locale]/admin/page.js';

let c = fs.readFileSync(path, 'utf8');

const regex = /if \(name === 'size' && !prev\.dimensions\) {[\s\S]*?return updated;/m;

const replacement = `if (name === 'size') {
                const val = value.trim().toLowerCase();
                const key = Object.keys(DIM_MAP).find(k => {
                    const kl = k.toLowerCase();
                    return kl === val || (val.length >= 4 && kl.startsWith(val));
                });
                if (key) {
                    updated.dimensions = DIM_MAP[key];
                }
            }
            return updated;`;

if (c.match(regex)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync(path, c);
    console.log("Success!");
} else {
    console.log("Failed to match regex");
}
