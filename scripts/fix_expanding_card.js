const fs = require('fs');

let file = 'app/[locale]/shop/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace cardHoverInfo div with a normal div
content = content.replace(/<div className=\{styles\.cardHoverInfo\}>/g, '<div style={{ marginTop: "5px", color: "#aaa", fontSize: "0.85rem" }}>');

fs.writeFileSync(file, content);
console.log('Fixed expanding card.');
