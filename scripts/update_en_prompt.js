const fs = require('fs');
let file = 'messages/en.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /"prompt_desc": ".*?"/g,
    `"prompt_desc": "Welcome! Would you like a quick interactive walkthrough of the Cigar Lounge? You can cancel the tour at any time by clicking the 'X' button."`
);

fs.writeFileSync(file, content);
console.log('Updated English prompt text');
