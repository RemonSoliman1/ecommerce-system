const fs = require('fs');
let file = 'components/tour/TourTrigger.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const translatedSteps = steps\.map\(step => \(\{[\s\S]*?\}\)\);/,
    `const isMobile = window.innerWidth <= 768;
                
                const translatedSteps = steps.map(step => {
                    const targetElement = (isMobile && step.mobileElement) ? step.mobileElement : step.element;
                    return {
                        element: targetElement,
                        isMock: step.isMock,
                        mustClick: step.mustClick,
                        mustHover: step.mustHover,
                        dynamic: step.dynamic,
                        popover: {
                            title: t(step.titleKey),
                            description: t(step.descKey),
                            side: (isMobile && step.mobileSide) ? step.mobileSide : (step.side || 'bottom'),
                            align: step.align || 'center',
                            nextRoute: step.nextRoute
                        }
                    };
                });`
);

fs.writeFileSync(file, content);
console.log('Added mobile element support to TourTrigger');
