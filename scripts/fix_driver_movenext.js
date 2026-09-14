const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/options\.state\.driver\.destroy\(\);/g, "driverObj.destroy();");
content = content.replace(/options\.state\.driver\.moveNext\(\);/g, "driverObj.moveNext();");

fs.writeFileSync(file, content);
console.log('Fixed TourContext driver moveNext issue');
