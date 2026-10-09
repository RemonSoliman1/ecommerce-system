const fs = require('fs');
const file = 'app/[locale]/admin/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('AdminAnalyticsTab')) {
    content = content.replace(
        "import AdminUsersTab from './components/AdminUsersTab';",
        "import AdminUsersTab from './components/AdminUsersTab';\nimport AdminAnalyticsTab from './components/AdminAnalyticsTab';"
    );
}

// 2. Add to defaultTabs
if (!content.includes("{ id: 'analytics'")) {
    content = content.replace(
        "{ id: 'marketing', labelKey: 'tabs_marketing' }",
        "{ id: 'marketing', labelKey: 'tabs_marketing' },\n        { id: 'analytics', labelKey: 'tabs_analytics' }"
    );
}

// 3. Render content
if (!content.includes("activeTab === 'analytics'")) {
    content = content.replace(
        "            {\n                activeTab === 'marketing' && (",
        "            {\n                activeTab === 'analytics' && <AdminAnalyticsTab />\n            }\n            {\n                activeTab === 'marketing' && ("
    );
}

fs.writeFileSync(file, content);
console.log('Success');
