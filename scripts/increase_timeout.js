const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /setTimeout\(\(\) => driverObj\.moveNext\(\), 300\);/g,
    `setTimeout(() => driverObj.moveNext(), 600);`
);

fs.writeFileSync(file, content);
console.log('Increased moveNext timeout to 600ms');
