const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
if (!content.includes('TourTrigger')) {
    content = content.replace("import { useTranslations } from 'next-intl';", "import { useTranslations } from 'next-intl';\n" + importStatement);
}

const tourSteps = `
            <TourTrigger 
                tourName="home"
                steps={[
                    { element: '#tour-nav-menu', titleKey: 'menu_title', descKey: 'menu_desc', side: 'bottom' },
                    { element: '#tour-search', titleKey: 'search_title', descKey: 'search_desc', side: 'bottom' },
                    { element: '#tour-cart-header', titleKey: 'cart_title', descKey: 'cart_desc', side: 'bottom' },
                    { element: '#tour-account-btn', titleKey: 'account_title', descKey: 'account_desc', side: 'bottom' },
                    { element: '#tour-floating-chat', titleKey: 'chat_title', descKey: 'chat_desc', side: 'top', align: 'end' }
                ]}
            />
`;

// Insert right after return ( if not already inserted
if (!content.includes('tourName="home"')) {
    content = content.replace("return (\n        <main", "return (\n        <>\n" + tourSteps + "        <main");
    content = content.replace(/<\/main>\n    \);\n}$/, "</main>\n        </>\n    );\n}");
}

fs.writeFileSync(file, content);
console.log('Added TourTrigger to Home Page');
