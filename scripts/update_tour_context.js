const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /onPopoverRender: \(popover, \{ state \}\) => \{[\s\S]*?\},/,
    `onPopoverRender: (popover, { state }) => {
                const stepIndex = state.activeIndex;
                const currentStep = steps[stepIndex];
                if (currentStep && currentStep.popover?.nextRoute) {
                    localStorage.setItem('cigar_global_tour_active', 'true');
                    const nextBtn = popover.wrapper.querySelector('.driver-popover-next-btn');
                    if (nextBtn) {
                        if (currentStep.mustClick) {
                            nextBtn.style.display = 'none';
                        } else {
                            nextBtn.innerHTML = 'Next Page &rarr;';
                        }
                    }
                }
            },`
);

fs.writeFileSync(file, content);
console.log('Updated TourContext onPopoverRender');
