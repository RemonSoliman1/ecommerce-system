const fs = require('fs');
let file = 'components/ui/AgeGate.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "<div className={styles.overlay} style={{ zIndex: 9999 }}>",
    "<div id=\"age-gate-overlay\" className={styles.overlay} style={{ zIndex: 9999 }}>"
);

fs.writeFileSync(file, content);
console.log('Fixed AgeGate overlay ID');
