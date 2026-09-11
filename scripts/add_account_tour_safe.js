const fs = require('fs');
let file = 'app/[locale]/account/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
if (!content.includes('import TourTrigger')) {
    content = content.replace("import { useTranslations } from 'next-intl';", "import { useTranslations } from 'next-intl';\n" + importStatement);
}

const tourSteps = `
      <TourTrigger 
          tourName="account"
          steps={[
              { element: '.tour-account-sidebar', titleKey: 'account_sidebar_title', descKey: 'account_sidebar_desc', side: 'right' },
              { element: '#account-content', titleKey: 'account_content_title', descKey: 'account_content_desc', side: 'top' }
          ]}
      />`;

if (!content.includes('tourName="account"')) {
    // We use regex to handle any newline/spacing
    content = content.replace(
        /return \(\r?\n\s*<div className=\{styles\.container\}>/,
        'return (\n        <>\n' + tourSteps + '\n        <div className={styles.container}>'
    );
    
    // Close the fragment at the very end
    content = content.replace(
        /\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\);\r?\n}/,
        '\n            </div>\n        </div>\n        </>\n    );\n}'
    );
}

// Add tour IDs to the elements
content = content.replace(
    '<aside className={styles.sidebar}>',
    '<aside className={`${styles.sidebar} tour-account-sidebar`}>'
);

fs.writeFileSync(file, content);
console.log('Added TourTrigger safely to Account Page');
