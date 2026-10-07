const fs = require('fs');
const file = 'app/[locale]/layout.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('SessionTracker')) {
    content = content.replace(
        "import ClientProviders from '@/components/layout/ClientProviders';", 
        "import ClientProviders from '@/components/layout/ClientProviders';\nimport SessionTracker from '@/components/tracking/SessionTracker';"
    );
    content = content.replace(
        "<ClientProviders locale={locale}>", 
        "<ClientProviders locale={locale}>\n          <SessionTracker />"
    );
    fs.writeFileSync(file, content);
}
console.log('Success');
