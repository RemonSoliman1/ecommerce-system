const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import TourTrigger')) {
    content = content.replace(
        'import { useTranslations } from "next-intl";',
        'import { useTranslations } from "next-intl";\nimport TourTrigger from "@/components/tour/TourTrigger";'
    );
    fs.writeFileSync(file, content);
    console.log('Fixed missing import');
} else {
    console.log('Import already exists');
}
