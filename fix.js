const fs = require('fs');

const file = 'app/[locale]/admin/page.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Find the start of the stranded modal part
let strandedStart = -1;
let strandedEnd = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("<div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>") && lines[i+1].includes("<img src={previewImage}")) {
        strandedStart = i;
        // find the closing `)}`
        for (let j = i; j < lines.length; j++) {
            if (lines[j].trim() === ')}') {
                strandedEnd = j;
                break;
            }
        }
        break;
    }
}

if (strandedStart !== -1 && strandedEnd !== -1) {
    const strandedBlock = lines.splice(strandedStart, strandedEnd - strandedStart + 1);
    
    // 2. Find where it belongs
    let insertPoint = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("{/* Image Preview Modal */}")) {
            // insert after the div that starts the modal background
            insertPoint = i + 2; // lines[i] is comment, lines[i+1] is {previewImage && (, lines[i+2] is <div style...
            break;
        }
    }
    
    if (insertPoint !== -1) {
        lines.splice(insertPoint + 1, 0, ...strandedBlock);
        fs.writeFileSync(file, lines.join('\n'));
        console.log("Fixed the modal swallowing bug!");
    } else {
        console.log("Could not find insert point.");
    }
} else {
    console.log("Could not find stranded block.");
}
