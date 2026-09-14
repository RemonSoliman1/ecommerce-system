const fs = require('fs');
let file = 'app/[locale]/product/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { useTour } from '@/context/TourContext';")) {
    content = content.replace(
        "import { useTranslations } from 'next-intl';",
        "import { useTranslations } from 'next-intl';\nimport { useTour } from '@/context/TourContext';"
    );
}

if (!content.includes('const { isTourActive, pendingTour } = useTour();')) {
    content = content.replace(
        "const router = useRouter();",
        "const router = useRouter();\n    const { isTourActive, pendingTour } = useTour();\n    const showTourMocks = isTourActive || (pendingTour && pendingTour.name === 'product');"
    );
}

// 1. Force Gifts
const giftRegex = /\{product\.has_gifts && !selectedModel\?\.disable_gifts && \(/;
content = content.replace(
    giftRegex,
    '{(showTourMocks || (product.has_gifts && !selectedModel?.disable_gifts)) && ('
);

// 2. Force Promos
const promoRegex = /\{activePromos\.length > 0 && \(/;
content = content.replace(
    promoRegex,
    '{(showTourMocks || activePromos.length > 0) && ('
);

// 3. Force Tasting Notes
const tastingNotesRegex = /\{\(product\.flavor_profile \|\| product\.description\) && \(/;
content = content.replace(
    tastingNotesRegex,
    '{(showTourMocks || product.flavor_profile || product.description) && ('
);

const flavorProfileRegex = /\{product\.flavor_profile && product\.flavor_profile\.length > 0 && \(/;
content = content.replace(
    flavorProfileRegex,
    '{(showTourMocks || (product.flavor_profile && product.flavor_profile.length > 0)) && ('
);

fs.writeFileSync(file, content);
console.log('Injected mock conditions into ProductPage');
