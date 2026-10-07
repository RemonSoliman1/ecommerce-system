const fs = require('fs');
const file = 'components/layout/Header.js';
let content = fs.readFileSync(file, 'utf8');

const trackingFn = `
    const trackSearch = (q) => {
        if (!q || q.trim() === '') return;
        fetch('/api/tracking/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user?.id || null,
                event_type: 'search',
                target_id: q.trim(),
            })
        }).catch(() => {});
    };

    // Close search on click outside
`;

content = content.replace('    // Close search on click outside', trackingFn);

// Now patch the places where search is submitted.
// 1. Enter key
// if (e.key === 'Enter') { setSearchResults([]); router.push(...); }
content = content.replace(
    /if \(e\.key === 'Enter'\) \{\s*setSearchResults\(\[\]\);\s*router\.push\(\`\/shop\?q=\$\{encodeURIComponent\(searchQuery\)\}\`\);\s*\}/g,
    `if (e.key === 'Enter') { setSearchResults([]); trackSearch(searchQuery); router.push(\`/shop?q=\${encodeURIComponent(searchQuery)}\`); }`
);

// 2. Button click
// if (searchQuery) router.push(...);
content = content.replace(
    /if \(searchQuery\) router\.push\(\`\/shop\?q=\$\{encodeURIComponent\(searchQuery\)\}\`\);/g,
    `if (searchQuery) { trackSearch(searchQuery); router.push(\`/shop?q=\${encodeURIComponent(searchQuery)}\`); }`
);

fs.writeFileSync(file, content);
console.log('Success');
