const fs = require('fs');
let file = 'app/[locale]/product/[id]/ProductClient.js';
let content = fs.readFileSync(file, 'utf8');

// Restore the gift tour step (I removed it previously, so I need to add it back)
// Find the exact place where the steps array is defined
content = content.replace(
    /\{ element: '#tour-size-selector', titleKey: 'size_selector_title', descKey: 'size_selector_desc', side: 'bottom' \},/,
    `{ element: '#tour-size-selector', titleKey: 'size_selector_title', descKey: 'size_selector_desc', side: 'bottom' },
                        { element: '#tour-gift-selector', titleKey: 'gift_selector_title', descKey: 'gift_selector_desc', side: 'top', dynamic: true },`
);

// Remove the Tour Mock Gift fallback exactly
// Find this block:
/*
) : (
    <button type="button" style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '140px' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Tour Mock Gift</span>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>FREE</div>
    </button>
)}
*/
// Replace it with just: ) : null}
content = content.replace(
    /\) : \(\s*<button type="button"[\s\S]*?Tour Mock Gift[\s\S]*?<\/button>\s*\)\}/,
    `) : null}`
);

fs.writeFileSync(file, content);
console.log('Restored gift tour step and removed mock gift UI');
