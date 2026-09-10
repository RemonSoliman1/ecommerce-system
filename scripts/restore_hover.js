const fs = require('fs');

let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Restore cardHoverInfo
content = content.replace(
    '<div style={{ marginTop: "5px", color: "#aaa", fontSize: "0.85rem" }}>',
    '<div className={styles.cardHoverInfo}>'
);

fs.writeFileSync(file, content);
console.log('Restored cardHoverInfo in page.js');
