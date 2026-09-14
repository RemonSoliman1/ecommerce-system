const fs = require('fs');
let file = 'components/tour/TourTrigger.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const translatedSteps = steps\.filter.*?\}\)\);/s,
    `// Wait for translation but don't filter DOM elements yet
            const translatedSteps = steps.map(step => ({
                element: step.element,
                popover: {
                    title: t(step.titleKey),
                    description: t(step.descKey),
                    side: step.side || 'bottom',
                    align: step.align || 'center'
                }
            }));`
);

content = content.replace(
    /if \(translatedSteps\.length === 0\) return;\s*hasTriggered\.current = true;\s*\/\/ We use a small delay.*?return \(\) => clearTimeout\(timer\);/s,
    `hasTriggered.current = true;
            const timer = setTimeout(() => {
                // Filter right before starting to ensure DOM is ready
                const validSteps = translatedSteps.filter(step => document.querySelector(step.element));
                if (validSteps.length > 0) {
                    startTour(tourName, validSteps);
                }
            }, 2000);
            return () => clearTimeout(timer);`
);

fs.writeFileSync(file, content);
console.log('Fixed TourTrigger delay');
