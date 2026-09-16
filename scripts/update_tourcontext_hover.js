const fs = require('fs');
let file = 'context/TourContext.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /if \(currentStep\.mustClick\) \{/g,
    `if (currentStep.mustHover) {
                            nextBtn.style.display = 'none';
                            const el = document.querySelector(currentStep.element);
                            if (el && !el.dataset.hoverBound) {
                                el.dataset.hoverBound = 'true';
                                el.addEventListener('mouseenter', () => {
                                    setTimeout(() => driverObj.moveNext(), 300);
                                }, { once: true });
                            }
                        } else if (currentStep.mustClick) {`
);

fs.writeFileSync(file, content);
console.log('Added mustHover to TourContext');
