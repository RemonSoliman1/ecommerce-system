const fs = require('fs');
let file = 'app/[locale]/register/page.js';
let content = fs.readFileSync(file, 'utf8');

// Add TourTrigger import
if (!content.includes('TourTrigger')) {
    content = content.replace(
        /import \{ useTranslations \} from 'next-intl';/,
        `import { useTranslations } from 'next-intl';\nimport TourTrigger from '@/components/tour/TourTrigger';`
    );
}

// Modify handleSubmit to go to /account if global tour is active
content = content.replace(
    /router\.push\('\/'\);/,
    `if (localStorage.getItem('cigar_global_tour_active') === 'true') {
                router.push('/account');
            } else {
                router.push('/');
            }`
);

// Add ID to form
content = content.replace(
    /<form onSubmit=\{handleSubmit\}/,
    `<form id="tour-register-form" onSubmit={handleSubmit}`
);

// Add TourTrigger component
content = content.replace(
    /return \(/,
    `return (\n        <>\n            <TourTrigger tourName="register" steps={[{ element: '#tour-register-form', titleKey: 'login_tour_title', descKey: 'login_tour_desc', side: 'top' }]} />`
);
content = content.replace(
    /<\/div>\n    \);\n\}/,
    `</div>\n        </>\n    );\n}`
);

fs.writeFileSync(file, content);
console.log('Updated Register page with tour');
