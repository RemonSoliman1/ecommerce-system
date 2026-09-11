const fs = require('fs');
let file = 'app/[locale]/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import TourTrigger from '@/components/tour/TourTrigger';\n";
if (!content.includes('import TourTrigger')) {
    content = content.replace(/import \{ useTranslations \} from 'next-intl';\r?\n/, "import { useTranslations } from 'next-intl';\n" + importStatement);
}

const tourSteps = `
            <TourTrigger 
                tourName="home"
                steps={[
                    { element: '.tour-home-hero', titleKey: 'home_hero_title', descKey: 'home_hero_desc', side: 'bottom' },
                    { element: '.tour-home-featured', titleKey: 'home_featured_title', descKey: 'home_featured_desc', side: 'top' },
                    { element: '.tour-home-brands', titleKey: 'home_brands_title', descKey: 'home_brands_desc', side: 'top' }
                ]}
            />
`;

// Insert right after return ( if not already inserted
if (!content.includes('tourName="home"')) {
    content = content.replace(/return \(\r?\n\s*<div/, "return (\n        <>\n" + tourSteps + "        <div");
    content = content.replace(/\s*\);\r?\n}/, "\n        </>\n    );\n}");
}

// Ensure the elements actually have the classes/ids needed.
content = content.replace(
    /className={styles\.hero}/,
    'className={`${styles.hero} tour-home-hero`}'
);
content = content.replace(
    /<section className="featured-products/,
    '<section className="featured-products tour-home-featured'
);
content = content.replace(
    /<section className="brands-section/,
    '<section className="brands-section tour-home-brands'
);

fs.writeFileSync(file, content);
console.log('Added TourTrigger to Home Page');
