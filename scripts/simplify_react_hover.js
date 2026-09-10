const fs = require('fs');
let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the wrapper div handlers
const targetDiv = "<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}\n        onMouseLeave={() => setIsHoverExpanded(false)}\n        onMouseMove={(e) => {\n            if (!isHoverExpanded && !e.target.closest('.quickAddBtnArea')) {\n                setIsHoverExpanded(true);\n            }\n        }}\n        >";

const replacementDiv = "<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}\n        onMouseLeave={() => setIsHoverExpanded(false)}\n        >";

content = content.replace(targetDiv, replacementDiv);

// Add onMouseEnter to the Link
content = content.replace(
    'className={`${styles.card} ${isHoverExpanded ? styles.expandedCard : ""}`} style={{ position: \'relative\', flex: 1, display: \'flex\', flexDirection: \'column\' }}>',
    'className={`${styles.card} ${isHoverExpanded ? styles.expandedCard : ""}`} style={{ position: \'relative\', flex: 1, display: \'flex\', flexDirection: \'column\' }}\n          onMouseEnter={() => setIsHoverExpanded(true)}>'
);

fs.writeFileSync(file, content);
console.log('Simplified React hover');
