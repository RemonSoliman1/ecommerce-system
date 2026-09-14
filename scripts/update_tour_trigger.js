const fs = require('fs');
let file = 'components/tour/TourTrigger.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /isMock: step.isMock,/g,
    "isMock: step.isMock,\n                    mustClick: step.mustClick,"
);

fs.writeFileSync(file, content);
console.log('Updated TourTrigger mustClick');
