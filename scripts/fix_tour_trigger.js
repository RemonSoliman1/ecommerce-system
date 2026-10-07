const fs = require('fs');
let file = 'components/tour/TourTrigger.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /mustClick: step.mustClick,/,
    `mustClick: step.mustClick,\n                    dynamic: step.dynamic,`
);

content = content.replace(
    /const validSteps = translatedSteps.filter\(step => step.isMock \|\| document.querySelector\(step.element\)\);/,
    `const validSteps = translatedSteps.filter(step => step.isMock || step.dynamic || document.querySelector(step.element));`
);

fs.writeFileSync(file, content);
console.log('Fixed TourTrigger to allow dynamic elements');
