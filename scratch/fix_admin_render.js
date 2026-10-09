const fs = require('fs');
const file = 'app/[locale]/admin/page.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("activeTab === 'analytics'")) {
    // We will find "activeTab === 'marketing' && (" and replace the block before it
    content = content.replace(
        /\{\s*activeTab === 'marketing' && \(/,
        "{\n                activeTab === 'analytics' && <AdminAnalyticsTab />\n            }\n            {\n                activeTab === 'marketing' && ("
    );
    fs.writeFileSync(file, content);
    console.log('Patched correctly');
} else {
    console.log('Already patched');
}
