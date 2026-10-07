const fs = require('fs');
const file = 'app/[locale]/admin/page.js';
let content = fs.readFileSync(file, 'utf8');

// import AdminAnalyticsTab
content = content.replace(
    "import AdminProductsTab from './components/AdminProductsTab';",
    "import AdminProductsTab from './components/AdminProductsTab';\nimport AdminAnalyticsTab from './components/AdminAnalyticsTab';"
);

// Add Tab Button
const tabsMapRegex = /<button[^>]*onClick=\{\(\) => setActiveTab\('settings'\)\}[^>]*>\s*Settings\s*<\/button>/;
const settingsBtnMatch = content.match(tabsMapRegex);
if (settingsBtnMatch) {
    const analyticsBtn = `
                <button
                    onClick={() => setActiveTab('analytics')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeTab === 'analytics' ? '#c5a35c' : '#222',
                        color: activeTab === 'analytics' ? '#111' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        borderRadius: '4px'
                    }}
                >
                    Analytics
                </button>
    `;
    content = content.replace(tabsMapRegex, settingsBtnMatch[0] + analyticsBtn);
}

// Render Content
const renderContentBody = `
            {activeTab === 'analytics' && <AdminAnalyticsTab />}`;

content = content.replace(
    "{activeTab === 'settings' && <AdminSettingsTab />}",
    "{activeTab === 'settings' && <AdminSettingsTab />}\n" + renderContentBody
);

fs.writeFileSync(file, content);
console.log('Success');
