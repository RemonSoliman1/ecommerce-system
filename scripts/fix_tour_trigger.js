const fs = require('fs');
let file = 'components/tour/TourTrigger.js';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = "            const translatedSteps = steps.map(step => ({\n                element: step.element,\n                popover: {\n                    title: t(step.titleKey),\n                    description: t(step.descKey),\n                    side: step.side || 'bottom',\n                    align: step.align || 'center'\n                }\n            }));";

const newLogic = "            const translatedSteps = steps.filter(step => document.querySelector(step.element)).map(step => ({\n                element: step.element,\n                popover: {\n                    title: t(step.titleKey),\n                    description: t(step.descKey),\n                    side: step.side || 'bottom',\n                    align: step.align || 'center'\n                }\n            }));\n            \n            if (translatedSteps.length === 0) return;";

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content);
console.log('Fixed TourTrigger missing elements');
