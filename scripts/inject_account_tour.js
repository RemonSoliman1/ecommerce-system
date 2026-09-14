const fs = require('fs');
let file = 'app/[locale]/account/page.js';
let content = fs.readFileSync(file, 'utf8');

// Add ID to Overview Tab
if (!content.includes('id="tour-overview-tab"')) {
    content = content.replace(
        'className={`${styles.navBtn} ${activeTab === \'overview\' ? styles.activeBtn : \'\'}`}',
        'id="tour-overview-tab"\n                              className={`${styles.navBtn} ${activeTab === \'overview\' ? styles.activeBtn : \'\'}`}'
    );
}

// Update TourTrigger
const oldStepsRegex = /steps=\{\[\s*\{\s*element:\s*'\.tour-account-sidebar'[\s\S]*?\]\}/;
const newSteps = `steps={[
                { element: '.tour-account-sidebar', titleKey: 'account_sidebar_title', descKey: 'account_sidebar_desc', side: 'right' },
                { element: '#tour-overview-tab', titleKey: 'account_overview_title', descKey: 'account_overview_desc', side: 'right' },
                { element: '#tour-orders-tab', titleKey: 'account_orders_title', descKey: 'account_orders_desc', side: 'right' },
                { element: '#tour-settings-tab', titleKey: 'account_settings_title', descKey: 'account_settings_desc', side: 'right' }
            ]}`;

content = content.replace(oldStepsRegex, newSteps);

fs.writeFileSync(file, content);
console.log('Injected Account Tour');
