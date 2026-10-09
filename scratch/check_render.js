const fs = require('fs');
const content = fs.readFileSync('app/[locale]/admin/page.js', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes("activeTab === 'analytics'"));
if (start !== -1) {
    console.log(lines.slice(start - 5, start + 5).join('\n'));
} else {
    console.log("Not found!");
}
